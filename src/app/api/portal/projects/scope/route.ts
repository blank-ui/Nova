import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-guards";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendSmtpEmail, buildNovaEmailHtml } from "@/lib/auth-email";
import type { ProjectStatus } from "@prisma/client";

/**
 * POST /api/portal/projects/scope
 * Handles:
 * 1. take-scope: Developer/Admin provisions/claims a new scope or converts an inquiry.
 * 2. update-project: Developer/Admin posts progress updates, milestone/task additions, or status updates to existing projects.
 * 3. send-invite: Sends an invitation email containing a link to create/submit new project scope.
 * 4. client-scope: Client submits a new project scope request.
 */
export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimit(`scope-actions:${session.user.id}:${clientIp}`, {
    windowSeconds: 60,
    max: 30,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 60) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = String(body.action ?? "").trim();
  const isStaff = session.user.role === "ADMIN" || session.user.role === "DEVELOPER" || session.user.role === "FINANCE";

  const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || (hostHeader.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${hostHeader}`;

  // ==========================================
  // ACTION 1: TAKE / PROVISION NEW SCOPE
  // ==========================================
  if (action === "take-scope") {
    if (!isStaff) {
      return NextResponse.json({ error: "Only developers or administrators can provision new scopes." }, { status: 403 });
    }

    const name = String(body.name ?? "").trim();
    const description = body.description ? String(body.description).trim() : null;
    const clientId = body.clientId ? String(body.clientId).trim() : null;
    const clientEmail = body.clientEmail ? String(body.clientEmail).trim().toLowerCase() : null;
    const clientName = body.clientName ? String(body.clientName).trim() : null;
    const inquiryId = body.inquiryId ? String(body.inquiryId).trim() : null;
    const initialMilestone = body.initialMilestone ? String(body.initialMilestone).trim() : null;
    const rawStatus = String(body.status ?? "PLANNING").toUpperCase();

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Project scope title must be at least 2 characters." }, { status: 400 });
    }

    let targetUser = null;

    if (clientId) {
      targetUser = await prisma.user.findUnique({ where: { id: clientId } });
    }

    if (!targetUser && clientEmail) {
      targetUser = await prisma.user.findUnique({ where: { email: clientEmail } });
      if (!targetUser) {
        targetUser = await prisma.user.create({
          data: {
            name: clientName || clientEmail.split("@")[0] || "Client",
            email: clientEmail,
            role: "CLIENT",
            emailVerified: true,
          },
        });
      }
    }

    if (!targetUser && inquiryId) {
      const inq = await prisma.inquiry.findUnique({ where: { id: inquiryId } });
      if (inq) {
        targetUser = await prisma.user.findUnique({ where: { email: inq.email } });
        if (!targetUser) {
          targetUser = await prisma.user.create({
            data: {
              name: inq.name || "Client",
              email: inq.email,
              role: "CLIENT",
              emailVerified: true,
            },
          });
        }
      }
    }

    if (!targetUser) {
      return NextResponse.json({ error: "Please specify a client account or email to link this scope." }, { status: 400 });
    }

    const validStatuses: ProjectStatus[] = ["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED", "ON_HOLD"];
    const status: ProjectStatus = validStatuses.includes(rawStatus as ProjectStatus) ? (rawStatus as ProjectStatus) : "PLANNING";

    try {
      const project = await prisma.project.create({
        data: {
          name,
          description,
          status,
          clientId: targetUser.id,
          milestones: initialMilestone
            ? {
                create: {
                  title: initialMilestone,
                  description: "Initial engineering milestone and scope deliverable.",
                },
              }
            : undefined,
        },
        include: {
          milestones: true,
          tasks: true,
        },
      });

      // If inquiryId was provided, mark it CONVERTED
      if (inquiryId) {
        await prisma.inquiry.update({
          where: { id: inquiryId },
          data: { status: "CONVERTED" },
        }).catch(() => null);
      }

      // Log audit
      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PROJECT_SCOPE_TAKEN",
          entityType: "Project",
          entityId: project.id,
          metadata: {
            name: project.name,
            clientId: targetUser.id,
            inquiryId,
          },
        },
      }).catch(() => null);

      return NextResponse.json({
        ok: true,
        project,
        message: `Project scope "${project.name}" provisioned successfully.`,
      });
    } catch (err) {
      console.error("[Scope API] Failed to create project:", err);
      return NextResponse.json({ error: "Failed to create project scope in database." }, { status: 500 });
    }
  }

  // ==========================================
  // ACTION 2: UPDATE PRE-EXISTING PROJECT
  // ==========================================
  if (action === "update-project") {
    if (!isStaff) {
      return NextResponse.json({ error: "Only engineering staff can update project statuses." }, { status: 403 });
    }

    const projectId = String(body.projectId ?? "").trim();
    const message = body.message ? String(body.message).trim() : "";
    const newStatus = body.newStatus ? String(body.newStatus).trim().toUpperCase() : null;
    const taskTitle = body.taskTitle ? String(body.taskTitle).trim() : null;
    const milestoneTitle = body.milestoneTitle ? String(body.milestoneTitle).trim() : null;
    const dueAtStr = body.dueAt ? String(body.dueAt).trim() : null;
    const notifyClient = Boolean(body.notifyClient);

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: { select: { name: true, email: true } } },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    try {
      // 1. Post message/update note if provided
      if (message) {
        await prisma.message.create({
          data: {
            projectId: project.id,
            authorId: session.user.id,
            body: message,
          },
        });
      }

      // 2. Update status if specified
      const validStatuses: ProjectStatus[] = ["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED", "ON_HOLD"];
      if (newStatus && validStatuses.includes(newStatus as ProjectStatus)) {
        await prisma.project.update({
          where: { id: project.id },
          data: { status: newStatus as ProjectStatus, updatedAt: new Date() },
        });
      } else {
        await prisma.project.update({
          where: { id: project.id },
          data: { updatedAt: new Date() },
        });
      }

      // 3. Add milestone if provided
      if (milestoneTitle) {
        await prisma.milestone.create({
          data: {
            projectId: project.id,
            title: milestoneTitle,
            dueAt: dueAtStr ? new Date(dueAtStr) : null,
          },
        });
      }

      // 4. Add task if provided
      if (taskTitle) {
        await prisma.task.create({
          data: {
            projectId: project.id,
            title: taskTitle,
            dueAt: dueAtStr ? new Date(dueAtStr) : null,
          },
        });
      }

      // 5. Notify client via transactional email if requested
      if (notifyClient && project.client?.email) {
        const updateSummary = message || (taskTitle ? `New deliverable added: ${taskTitle}` : `Project status updated to ${newStatus || project.status}`);
        const emailHtml = buildNovaEmailHtml({
          subject: `Engineering Update: ${project.name} — Nova Studio`,
          heading: `New Update on "${project.name}"`,
          bodyText: `Studio Engineer ${session.user.name || "Developer"} has posted an update to your active workspace:\n\n"${updateSummary}"`,
          actionText: "View Project & Sprints",
          actionUrl: `${origin}/portal/projects/${project.id}`,
          subtext: "You can reply to this message directly in your client portal.",
        });

        await sendSmtpEmail({
          to: project.client.email,
          subject: `Engineering Update: ${project.name} — Nova Studio`,
          text: `New update on "${project.name}" from ${session.user.name || "Developer"}:\n\n${updateSummary}\n\nView here: ${origin}/portal/projects/${project.id}`,
          html: emailHtml,
        }).catch((err) => console.warn("[Scope API] Failed to send update notification email:", err));
      }

      // Log audit
      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PROJECT_UPDATED_BY_ENGINEER",
          entityType: "Project",
          entityId: project.id,
          metadata: {
            newStatus,
            hasMessage: Boolean(message),
            hasMilestone: Boolean(milestoneTitle),
            hasTask: Boolean(taskTitle),
            notifyClient,
          },
        },
      }).catch(() => null);

      return NextResponse.json({
        ok: true,
        message: `Project "${project.name}" updated successfully.`,
      });
    } catch (err) {
      console.error("[Scope API] Failed to update project:", err);
      return NextResponse.json({ error: "Failed to update project." }, { status: 500 });
    }
  }

  // ==========================================
  // ACTION 3: SEND SCOPE INVITATION EMAIL
  // ==========================================
  if (action === "send-invite") {
    if (!isStaff) {
      return NextResponse.json({ error: "Only engineering staff can send project creation invitations." }, { status: 403 });
    }

    const email = String(body.email ?? "").trim().toLowerCase();
    const recipientName = body.recipientName ? String(body.recipientName).trim() : "";
    const projectScopeTitle = body.projectScopeTitle ? String(body.projectScopeTitle).trim() : "";
    const customMessage = body.customMessage ? String(body.customMessage).trim() : "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid recipient email address." }, { status: 400 });
    }

    const inviteLink = `${origin}/contact?ref=developer-invite&email=${encodeURIComponent(email)}${projectScopeTitle ? `&scope=${encodeURIComponent(projectScopeTitle)}` : ""}`;

    const greeting = recipientName ? `Hello ${recipientName},` : "Hello,";
    const scopeSubject = projectScopeTitle
      ? `Invitation to Define Project Scope: "${projectScopeTitle}" — Nova Studio`
      : "Invitation to Create Project Scope — Nova Studio";

    const bodyParagraph = [
      greeting,
      "",
      `Our engineering team has invited you to define and submit your new project scope${projectScopeTitle ? ` for "${projectScopeTitle}"` : ""}.`,
      customMessage ? `\nNote from ${session.user.name || "Engineering Team"}:\n"${customMessage}"\n` : "",
      "Please click below to access our scope intake portal where you can specify your requirements, deliverables, technical stack, and target timelines.",
    ].filter(Boolean).join("\n");

    const emailHtml = buildNovaEmailHtml({
      subject: scopeSubject,
      heading: "Define Your Project Scope with Nova",
      bodyText: bodyParagraph,
      actionText: "Create & Submit Project Scope",
      actionUrl: inviteLink,
      subtext: `Invitation dispatched by ${session.user.name || "Studio Engineer"} (${session.user.email}).`,
    });

    try {
      await sendSmtpEmail({
        to: email,
        subject: scopeSubject,
        text: `${bodyParagraph}\n\nSubmit your scope here: ${inviteLink}`,
        html: emailHtml,
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PROJECT_INVITATION_SENT",
          entityType: "InquiryInvitation",
          metadata: {
            recipientEmail: email,
            projectScopeTitle,
            inviteLink,
          },
        },
      }).catch(() => null);

      return NextResponse.json({
        ok: true,
        message: `Scope creation invitation sent successfully to ${email}.`,
      });
    } catch (err) {
      console.error("[Scope API] Failed to send invitation email:", err);
      return NextResponse.json({ error: "Failed to send invitation email. Please check SMTP settings." }, { status: 500 });
    }
  }

  // ==========================================
  // ACTION 4: CLIENT SELF-SERVICE SCOPE REQUEST
  // ==========================================
  if (action === "client-scope") {
    const service = String(body.service ?? "Full-Stack Web Application").trim();
    const budget = body.budget ? String(body.budget).trim() : "$5,000 – $15,000";
    const message = String(body.message ?? "").trim();
    const company = body.company ? String(body.company).trim() : null;

    if (!message || message.length < 10) {
      return NextResponse.json({ error: "Please provide a detailed scope description (at least 10 characters)." }, { status: 400 });
    }

    try {
      const inquiry = await prisma.inquiry.create({
        data: {
          name: session.user.name || "Client",
          email: session.user.email,
          service,
          budget,
          message,
          company,
          status: "NEW",
        },
      });

      return NextResponse.json({
        ok: true,
        inquiryId: inquiry.id,
        message: "Your new project scope has been submitted to Nova engineers.",
      });
    } catch (err) {
      console.error("[Scope API] Failed to submit client scope:", err);
      return NextResponse.json({ error: "Failed to submit scope request." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action specified." }, { status: 400 });
}
