import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-guards";
import { getAuthorizedProject } from "@/lib/project-access";
import { consumeRateLimit } from "@/lib/rate-limit";
import {
  CUID_REGEX,
  messageInputSchema,
  messagePaginationSchema,
  type EnrichedMessage,
  type MessageAuthor,
} from "@/lib/messages";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/portal/projects/[id]/messages
 * Fetches messages chronologically with cursor-based pagination.
 * Scoped strictly to the authenticated user's authorized project.
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { id: projectId } = await params;

  if (!projectId || !CUID_REGEX.test(projectId)) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check project authorization (enforces client ownership or admin with verified MFA)
  const project = await getAuthorizedProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const paginationResult = messagePaginationSchema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
    cursor: url.searchParams.get("cursor") ?? undefined,
  });

  if (!paginationResult.success) {
    return NextResponse.json(
      { error: paginationResult.error.issues[0]?.message ?? "Invalid pagination parameters" },
      { status: 400 }
    );
  }

  const { limit, cursor } = paginationResult.data;

  // Query limit + 1 to check if there is a next page
  const messages = await prisma.message.findMany({
    where: { projectId },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  let nextCursor: string | null = null;
  if (messages.length > limit) {
    const nextItem = messages.pop();
    if (nextItem) {
      nextCursor = nextItem.id;
    }
  }

  // Resolve author names and roles safely from the User table without exposing sensitive fields
  const distinctAuthorIds = Array.from(new Set(messages.map((m) => m.authorId)));
  const users = await prisma.user.findMany({
    where: { id: { in: distinctAuthorIds } },
    select: { id: true, name: true, role: true },
  });

  const authorMap = new Map<string, MessageAuthor>();
  for (const u of users) {
    authorMap.set(u.id, { id: u.id, name: u.name, role: u.role });
  }

  const enrichedMessages: EnrichedMessage[] = messages.map((m) => {
    const author = authorMap.get(m.authorId) ?? {
      id: m.authorId,
      name: "Unknown Member",
      role: "UNKNOWN",
    };
    return {
      id: m.id,
      projectId: m.projectId,
      authorId: m.authorId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      author,
    };
  });

  return NextResponse.json({
    data: enrichedMessages,
    nextCursor,
  });
}

/**
 * POST /api/portal/projects/[id]/messages
 * Appends a new message to the project thread.
 * Sender identity (authorId) is strictly enforced from the server-side session.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id: projectId } = await params;

  if (!projectId || !CUID_REGEX.test(projectId)) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check project authorization
  const project = await getAuthorizedProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Rate limiting per user: max 30 messages per 60 seconds
  const userRateKey = `msg:${session.user.id}`;
  const rateLimit = await consumeRateLimit(userRateKey, {
    windowSeconds: 60,
    max: 30,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many messages sent. Please pause for a moment before posting again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds ?? 10),
        },
      }
    );
  }

  let bodyJson: unknown;
  try {
    bodyJson = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const parsed = messageInputSchema.safeParse(bodyJson);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid message body" },
      { status: 400 }
    );
  }

  // authorId is strictly set to session.user.id
  const authorId = session.user.id;

  try {
    // If posted by an ADMIN, atomically create Message and AuditLog record
    if (session.user.role === "ADMIN") {
      const [message] = await prisma.$transaction(async (tx) => {
        const createdMsg = await tx.message.create({
          data: {
            projectId,
            authorId,
            body: parsed.data.body,
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: authorId,
            action: "ADMIN_MESSAGE_POSTED",
            entityType: "Message",
            entityId: createdMsg.id,
            metadata: { projectId },
          },
        });

        return [createdMsg];
      });

      return NextResponse.json(
        {
          success: true,
          message: {
            id: message.id,
            projectId: message.projectId,
            authorId: message.authorId,
            body: message.body,
            createdAt: message.createdAt.toISOString(),
            author: {
              id: session.user.id,
              name: session.user.name ?? "Member",
              role: session.user.role,
            },
          },
        },
        { status: 201 }
      );
    }

    // Client messages (no admin audit log required)
    const message = await prisma.message.create({
      data: {
        projectId,
        authorId,
        body: parsed.data.body,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: {
          id: message.id,
          projectId: message.projectId,
          authorId: message.authorId,
          body: message.body,
          createdAt: message.createdAt.toISOString(),
          author: {
            id: session.user.id,
            name: session.user.name ?? "Member",
            role: session.user.role,
          },
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to persist project message:", err);
    return NextResponse.json({ error: "Failed to save message. Please try again." }, { status: 500 });
  }
}
