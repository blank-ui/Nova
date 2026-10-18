import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-guards";
import { canOpenAdmin } from "@/lib/auth-policy";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import type { ProjectStatus } from "@prisma/client";

/**
 * POST /api/admin/projects
 * Create a new project linked to a client
 */
export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || !canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimit(`admin-projects:${session.user.id}:${clientIp}`, {
    windowSeconds: 60,
    max: 30,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many project creation requests. Please wait a moment." },
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
  const description = body.description ? String(body.description).trim() : null;
  const clientId = String(body.clientId ?? "").trim();
  const rawStatus = String(body.status ?? "PLANNING").toUpperCase();

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Project name must be at least 2 characters." }, { status: 400 });
  }

  if (!clientId) {
    return NextResponse.json({ error: "Client ID is required." }, { status: 400 });
  }

  // Ensure client user exists; if not, check if an inquiry exists with this id and create or link a user
  let clientUser = await prisma.user.findUnique({
    where: { id: clientId },
  });

  if (!clientUser) {
    // Check if clientId is an inquiry ID
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: clientId },
    });

    if (inquiry) {
      // Find or create user for this inquiry's email
      clientUser = await prisma.user.findUnique({
        where: { email: inquiry.email },
      });

      if (!clientUser) {
        clientUser = await prisma.user.create({
          data: {
            name: inquiry.name,
            email: inquiry.email,
            role: "CLIENT",
            emailVerified: true,
          },
        });
      }
    }
  }

  if (!clientUser) {
    return NextResponse.json({ error: "Client user could not be resolved." }, { status: 404 });
  }

  const validStatuses: ProjectStatus[] = ["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED", "ON_HOLD"];
  const status = validStatuses.includes(rawStatus as ProjectStatus) ? (rawStatus as ProjectStatus) : "PLANNING";

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        clientId: clientUser.id,
      },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CREATE",
        entityType: "Project",
        entityId: project.id,
        metadata: { name, clientId: clientUser.id, status },
      },
    });

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("[Projects API] Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project." }, { status: 500 });
  }
}
