import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-guards";
import {
  getStudioChannels,
  createStudioChannel,
  updateStudioChannel,
  deleteStudioChannel,
} from "@/lib/studio-channels";

const INTERNAL_ROLES = ["ADMIN", "DEVELOPER", "FINANCE"];

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!INTERNAL_ROLES.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden: Internal access only" }, { status: 403 });
  }

  try {
    const channels = await getStudioChannels();
    return NextResponse.json({ channels });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load channels" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only Admin can create studio channels
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Only Admin can create studio channels" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "Channel name is required" }, { status: 400 });
    }

    const channel = await createStudioChannel({
      name: body.name,
      description: body.description,
      icon: body.icon,
    });

    return NextResponse.json({ channel }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create channel" },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only Admin can update studio channels
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Only Admin can update studio channels" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    if (!body.id || !body.name) {
      return NextResponse.json(
        { error: "Channel ID and name are required" },
        { status: 400 }
      );
    }

    const channel = await updateStudioChannel({
      id: body.id,
      name: body.name,
      description: body.description,
      icon: body.icon,
    });

    return NextResponse.json({ channel });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update channel" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only Admin can delete studio channels
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Only Admin can delete studio channels" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await request.json().catch(() => null);
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Channel ID is required" }, { status: 400 });
    }

    await deleteStudioChannel(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete channel" },
      { status: 400 }
    );
  }
}
