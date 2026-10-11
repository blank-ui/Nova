import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-guards";
import { canOpenAdmin } from "@/lib/auth-policy";
import {
  sendAccountInitiationEmail,
  sendAdminPasswordResetNotificationEmail,
} from "@/lib/auth-email";

/**
 * GET /api/admin/users
 * Returns list of users with project counts, status, roles, and ban state
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
        emailVerified: true,
        twoFactorEnabled: true,
        banned: true,
        banReason: true,
        discordHandle: true,
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

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json({ error: "A user with this email address already exists." }, { status: 409 });
    }

    // Create user in verified state so they can set password and sign in directly
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Create a secure single-use password reset / setup token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48); // 48 hours

    await prisma.authVerification.create({
      data: {
        identifier: `reset-password:${token}`,
        value: JSON.stringify({ userId: user.id, email: user.email }),
        expiresAt,
      },
    });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const setupUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

    // Dispatch initiation email
    let emailSent = false;
    try {
      await sendAccountInitiationEmail({
        to: user.email,
        name: user.name,
        setupUrl,
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
 */
export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session || !canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

      await prisma.authVerification.create({
        data: {
          identifier: `reset-password:${token}`,
          value: JSON.stringify({ userId: user.id, email: user.email }),
          expiresAt,
        },
      });

      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

      let emailSent = false;
      try {
        await sendAdminPasswordResetNotificationEmail({
          to: user.email,
          name: user.name,
          resetUrl,
        });
        emailSent = true;
      } catch (mailErr) {
        console.warn("[Admin Users] Could not send password reset email via SMTP:", mailErr);
      }

      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "UPDATE",
          entityType: "User",
          entityId: id,
          metadata: { action: "ADMIN_TRIGGERED_PASSWORD_RESET", emailSent },
        },
      });

      return NextResponse.json({
        success: true,
        resetUrl,
        emailSent,
        message: "Password reset link generated and dispatched to user email.",
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

    // Permanently remove user and cascade relations
    await prisma.$transaction([
      prisma.user.delete({
        where: { id },
      }),
      prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "DELETE",
          entityType: "User",
          entityId: id,
          metadata: { email: user.email, name: user.name, role: user.role },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `User ${user.email} was permanently deleted.`,
    });
  } catch (error) {
    console.error("[Admin Users API] Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
  }
}
