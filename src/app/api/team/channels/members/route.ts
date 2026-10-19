import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-guards";
import {
  getChannelMembers,
  addChannelMember,
  removeChannelMember,
} from "@/lib/studio-channels";

const INTERNAL_ROLES = ["ADMIN", "DEVELOPER", "FINANCE"];

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!INTERNAL_ROLES.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden: Internal access only" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId");
  if (!channelId) {
    return NextResponse.json({ error: "channelId is required" }, { status: 400 });
  }

  try {
    const members = await getChannelMembers(channelId);
    return NextResponse.json({ members });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load channel members" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!INTERNAL_ROLES.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden: Internal access only" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { channelId, userId, role } = body;
    if (!channelId || !userId) {
      return NextResponse.json({ error: "channelId and userId are required" }, { status: 400 });
    }

    await addChannelMember(channelId, userId, role || "MEMBER");
    const updatedMembers = await getChannelMembers(channelId);
    return NextResponse.json({ success: true, members: updatedMembers });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to add channel member" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!INTERNAL_ROLES.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden: Internal access only" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let channelId = searchParams.get("channelId");
    let userId = searchParams.get("userId");

    if (!channelId || !userId) {
      const body = await request.json().catch(() => null);
      channelId = channelId || body?.channelId;
      userId = userId || body?.userId;
    }

    if (!channelId || !userId) {
      return NextResponse.json({ error: "channelId and userId are required" }, { status: 400 });
    }

    await removeChannelMember(channelId, userId);
    const updatedMembers = await getChannelMembers(channelId);
    return NextResponse.json({ success: true, members: updatedMembers });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to remove channel member" },
      { status: 400 }
    );
  }
}
