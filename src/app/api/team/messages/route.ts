import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-guards";
import { consumeRateLimit } from "@/lib/rate-limit";

const INTERNAL_ROLES = ["ADMIN", "DEVELOPER", "FINANCE"];

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!INTERNAL_ROLES.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden: Internal team access only" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const recipientId = searchParams.get("recipientId");
  const channel = searchParams.get("channel") || (!recipientId ? "general" : null);

  try {
    let messages;

    if (recipientId) {
      // 1-on-1 Direct Messages between current user and selected team member
      messages = await prisma.teamMessage.findMany({
        where: {
          OR: [
            { senderId: session.user.id, recipientId },
            { senderId: recipientId, recipientId: session.user.id },
          ],
        },
        orderBy: { createdAt: "asc" },
        take: 100,
        include: {
          sender: {
            select: { id: true, name: true, role: true, image: true, email: true },
          },
        },
      });
    } else {
      // Internal Team Channel messages (e.g., "general", "engineering", "finance")
      messages = await prisma.teamMessage.findMany({
        where: {
          channel: channel || "general",
          recipientId: null,
        },
        orderBy: { createdAt: "asc" },
        take: 100,
        include: {
          sender: {
            select: { id: true, name: true, role: true, image: true, email: true },
          },
        },
      });
    }

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        recipientId: m.recipientId,
        channel: m.channel,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
        sender: m.sender,
      })),
    });
  } catch (err: any) {
    console.error("Failed to load team messages:", err);
    return NextResponse.json({ error: "Failed to fetch team messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!INTERNAL_ROLES.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden: Internal team access only" }, { status: 403 });
  }

  // Rate limiting: 60 messages / minute per internal user
  const rateLimit = await consumeRateLimit(`team_msg:${session.user.id}`, { windowSeconds: 60, max: 60 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many messages sent. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const bodyJson = await request.json();
    const text = String(bodyJson.body || "").trim();

    if (!text) {
      return NextResponse.json({ error: "Message content cannot be blank" }, { status: 400 });
    }

    if (text.length > 4000) {
      return NextResponse.json({ error: "Message exceeds 4,000 characters limit" }, { status: 400 });
    }

    const recipientId = bodyJson.recipientId ? String(bodyJson.recipientId) : null;
    const channel = recipientId ? null : String(bodyJson.channel || "general");

    // If direct message, verify recipient is an internal team member or exists
    if (recipientId) {
      const recipient = await prisma.user.findUnique({
        where: { id: recipientId },
        select: { id: true, name: true, role: true },
      });

      if (!recipient) {
        return NextResponse.json({ error: "Recipient user not found" }, { status: 404 });
      }
    }

    const created = await prisma.teamMessage.create({
      data: {
        senderId: session.user.id,
        recipientId,
        channel,
        body: text,
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true, image: true, email: true },
        },
      },
    });

    return NextResponse.json({
      message: {
        id: created.id,
        senderId: created.senderId,
        recipientId: created.recipientId,
        channel: created.channel,
        body: created.body,
        createdAt: created.createdAt.toISOString(),
        sender: created.sender,
      },
    });
  } catch (err: any) {
    console.error("Failed to post team message:", err);
    return NextResponse.json({
      error: "Failed to dispatch message",
      detail: err?.message || String(err),
    }, { status: 500 });
  }
}
