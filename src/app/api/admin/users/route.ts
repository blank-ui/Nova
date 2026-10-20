import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-guards";
import { canOpenAdmin } from "@/lib/auth-policy";
import {
  sendAccountInitiationEmail,
  sendAdminPasswordResetNotificationEmail,
} from "@/lib/auth-email";
import { getAppBaseUrl } from "@/lib/safe-redirect";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * GET /api/admin/users
 * Returns list of users with project counts, status, roles, onboarding state, and login locations
 */
export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session || !canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim();
  const role = url.searchParams.get("role")?.trim();

  try {
    const users = await prisma.user.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
                { discordHandle: { contains: search } },
              ],
            }
          : {}),
        ...(role ? { role } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        dateOfBirth: true,
        image: true,
        emailVerified: true,
        twoFactorEnabled: true,
        banned: true,
        banReason: true,
        discordHandle: true,
        invitationSentAt: true,
        invitationSeenAt: true,
        passwordCreatedAt: true,
        lastLoginAt: true,
        lastLoginIp: true,
        lastLoginCity: true,
        lastLoginCountry: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            projects: true,
            authSessions: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[Admin Users API] Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

/**
 * POST /api/admin/users
 * Admin creates a new user and sends an account initiation setup email
 */
export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || !canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimit(`admin-users-create:${session.user.id}:${clientIp}`, {
    windowSeconds: 60,
    max: 20,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many user creation requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 60) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const role = String(body.role ?? "CLIENT").toUpperCase();

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }
  const validRoles = ["CLIENT", "ADMIN", "DEVELOPER", "FINANCE"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Role must be CLIENT, ADMIN, DEVELOPER, or FINANCE." }, { status: 400 });
  }

  const phone = typeof body.phone === "string" && body.phone.trim().length > 0 ? body.phone.trim() : null;
  const dateOfBirth = typeof body.dateOfBirth === "string" && body.dateOfBirth.trim().length > 0 ? body.dateOfBirth.trim() : null;

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json({ error: "A user with this email address already exists." }, { status: 409 });
    }

    const now = new Date();

    // Create user in verified state so they can set password and sign in directly
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        phone,
        dateOfBirth,
        invitationSentAt: now,
        emailVerified: true,
        emailVerifiedAt: now,
      },
    });

    // Create a secure single-use password reset / setup token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48); // 48 hours

    // Better Auth's resetPassword handler expects verification.value to be the raw user.id string
    await prisma.authVerification.create({
      data: {
        identifier: `reset-password:${token}`,
        value: user.id,
        expiresAt,
      },
    });

    const appUrl = getAppBaseUrl(request);
    const setupUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}&mode=setup`;

    // Dispatch initiation email
    let emailSent = false;
    try {
      await sendAccountInitiationEmail({
        to: user.email,
        name: user.name,
        setupUrl,
        userId: user.id,
      });
      emailSent = true;
    } catch (mailErr) {
      console.warn("[Admin Users] Could not send initiation email via SMTP:", mailErr);
    }

    // Log audit event
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CREATE",
        entityType: "User",
        entityId: user.id,
        metadata: { role, email, emailSent },
      },
    });

    return NextResponse.json({
      success: true,
      user,
      setupUrl,
      emailSent,
    });
  } catch (error) {
    console.error("[Admin Users API] Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users
 * Actions:
 * - suspend: toggle ban status
 * - reset-password: send password setup/reset email link
 * - update-contact: save name, phone, discordHandle, dateOfBirth
 */
export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session || !canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimit(`admin-users-patch:${session.user.id}:${clientIp}`, {
    windowSeconds: 60,
    max: 30,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many user modification requests. Please wait." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 60) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, action, banReason } = body;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Prevent admin self-suspension
  if (action === "suspend" && user.id === session.user.id) {
    return NextResponse.json({ error: "You cannot suspend your own administrative account." }, { status: 400 });
  }

  try {
    if (action === "suspend") {
      const willBeBanned = !user.banned;
      const updated = await prisma.user.update({
        where: { id },
        data: {
          banned: willBeBanned,
          banReason: willBeBanned ? (typeof banReason === "string" ? banReason : "Suspended by Administrator") : null,
          banExpires: null,
        },
      });

      // If suspending, revoke active sessions
      if (willBeBanned) {
        await prisma.authSession.deleteMany({
          where: { userId: id },
        });
      }

      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "UPDATE",
          entityType: "User",
          entityId: id,
          metadata: {
            action: willBeBanned ? "SUSPEND" : "UNSUSPEND",
            reason: typeof banReason === "string" ? banReason : null,
          },
        },
      });

      return NextResponse.json({
        success: true,
        banned: updated.banned,
        message: willBeBanned ? "Account has been suspended." : "Account has been reactivated.",
      });
    }

    if (action === "reset-password") {
      const mode = typeof body.mode === "string" ? body.mode : undefined;
      const isSetup = mode === "setup";
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48); // 48 hours

      // Better Auth's resetPassword handler expects verification.value to be the raw user.id string
      await prisma.authVerification.create({
        data: {
          identifier: `reset-password:${token}`,
          value: user.id,
          expiresAt,
        },
      });

      const appUrl = getAppBaseUrl(request);
      const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}${isSetup ? "&mode=setup" : ""}`;

      let emailSent = false;
      try {
        if (isSetup) {
          await sendAccountInitiationEmail({
            to: user.email,
            name: user.name,
            setupUrl: resetUrl,
            userId: user.id,
          });
          // Update invitationSentAt timestamp
          await prisma.user.update({
            where: { id: user.id },
            data: { invitationSentAt: new Date() },
          });
        } else {
          await sendAdminPasswordResetNotificationEmail({
            to: user.email,
            name: user.name,
            resetUrl,
          });
        }
        emailSent = true;
      } catch (mailErr) {
        console.warn("[Admin Users] Could not send password reset/setup email via SMTP:", mailErr);
      }

      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "UPDATE",
          entityType: "User",
          entityId: id,
          metadata: { action: isSetup ? "ADMIN_TRIGGERED_ACCOUNT_SETUP" : "ADMIN_TRIGGERED_PASSWORD_RESET", emailSent },
        },
      });

      return NextResponse.json({
        success: true,
        resetUrl,
        emailSent,
        message: isSetup
          ? "Account setup and profile activation link generated and dispatched to user email."
          : "Password reset link generated and dispatched to user email.",
      });
    }

    // Action: update-contact or generic user details edit
    if (action === "update-contact" || (!action && (body.name || body.phone !== undefined || body.discordHandle !== undefined))) {
      const updateData: Record<string, any> = {};
      if (typeof body.name === "string" && body.name.trim()) updateData.name = body.name.trim();
      if (typeof body.phone === "string") updateData.phone = body.phone.trim() || null;
      if (typeof body.discordHandle === "string") updateData.discordHandle = body.discordHandle.trim() || null;
      if (typeof body.dateOfBirth === "string") updateData.dateOfBirth = body.dateOfBirth.trim() || null;

      const updated = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "UPDATE",
          entityType: "User",
          entityId: id,
          metadata: { action: "CONTACT_DETAILS_UPDATED", fields: Object.keys(updateData) },
        },
      });

      return NextResponse.json({
        success: true,
        user: updated,
        message: "Contact parameters updated successfully.",
      });
    }

    return NextResponse.json({ error: "Unknown action specified." }, { status: 400 });
  } catch (error) {
    console.error("[Admin Users API] Error processing action:", error);
    return NextResponse.json({ error: "Failed to process user update." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users?id=...
 * Permanently deletes a user account (cascades sessions, projects, etc.)
 */
export async function DELETE(request: Request) {
  const session = await getCurrentSession();
  if (!session || !canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own administrative account." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Find all projects belonging to the client
    const userProjects = await prisma.project.findMany({
      where: { clientId: id },
      select: { id: true },
    });
    const projectIds = userProjects.map((p) => p.id);

    // Permanently remove user and cascade dependent relations safely
    await prisma.$transaction(async (tx) => {
      // 1. Remove project dependent records
      if (projectIds.length > 0) {
        await tx.milestone.deleteMany({ where: { projectId: { in: projectIds } } });
        await tx.task.deleteMany({ where: { projectId: { in: projectIds } } });
        await tx.message.deleteMany({ where: { projectId: { in: projectIds } } });
        await tx.projectFile.deleteMany({ where: { projectId: { in: projectIds } } });
        await tx.invoice.deleteMany({ where: { projectId: { in: projectIds } } });
        await tx.project.deleteMany({ where: { id: { in: projectIds } } });
      }

      // 2. Remove standalone user relations
      await tx.invoice.deleteMany({ where: { clientId: id } });
      await tx.bootstrapClaim.deleteMany({ where: { userId: id } });
      await tx.userLoginHistory.deleteMany({ where: { userId: id } });
      await tx.clientNote.deleteMany({
        where: { OR: [{ clientId: id }, { authorId: id }] },
      });
      await tx.teamMessage.deleteMany({
        where: { OR: [{ senderId: id }, { recipientId: id }] },
      });
      await tx.appointment.deleteMany({
        where: { requestedById: id },
      });
      await tx.appointment.updateMany({
        where: { assignedStaffId: id },
        data: { assignedStaffId: null },
      });
      await tx.authTwoFactor.deleteMany({ where: { userId: id } });
      await tx.authAccount.deleteMany({ where: { userId: id } });
      await tx.authSession.deleteMany({ where: { userId: id } });
      await tx.session.deleteMany({ where: { userId: id } });
      await tx.auditLog.updateMany({
        where: { actorId: id },
        data: { actorId: null },
      });

      // 3. Delete the user
      await tx.user.delete({ where: { id } });

      // 4. Record audit log
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "DELETE",
          entityType: "User",
          entityId: id,
          metadata: {
            email: user.email,
            name: user.name,
            role: user.role,
            projectsRemoved: projectIds.length,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `User ${user.email} was permanently deleted.`,
    });
  } catch (error) {
    console.error("[Admin Users API] Error deleting user:", error);
    const detail = error instanceof Error ? error.message : "Failed to delete user.";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
