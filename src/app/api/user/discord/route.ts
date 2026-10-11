import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-guards";

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { discordHandle: true, discordId: true },
  });

  return NextResponse.json({
    connected: Boolean(user?.discordHandle || user?.discordId),
    discordHandle: user?.discordHandle ?? null,
    discordId: user?.discordId ?? null,
  });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const handle = typeof body.handle === "string" ? body.handle.trim() : "";
    const discordId = typeof body.discordId === "string" ? body.discordId.trim() : null;

    if (!handle) {
      return NextResponse.json({ error: "Discord handle or username is required." }, { status: 400 });
    }

    // Clean leading @ if provided
    const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;

    if (cleanHandle.length < 2 || cleanHandle.length > 32) {
      return NextResponse.json({ error: "Discord username must be between 2 and 32 characters." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        discordHandle: cleanHandle,
        ...(discordId ? { discordId } : {}),
      },
      select: { discordHandle: true, discordId: true },
    });

    return NextResponse.json({
      success: true,
      connected: true,
      discordHandle: updatedUser.discordHandle,
      discordId: updatedUser.discordId,
      message: `Connected Discord account: @${updatedUser.discordHandle}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update Discord account." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        discordHandle: null,
        discordId: null,
      },
    });

    return NextResponse.json({
      success: true,
      connected: false,
      discordHandle: null,
      message: "Discord account disconnected successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to disconnect Discord account." },
      { status: 500 }
    );
  }
}
