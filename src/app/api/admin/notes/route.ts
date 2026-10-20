import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/notes?clientId=...
 * Retrieves notes left for a client
 */
export async function GET(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "DEVELOPER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId")?.trim();

  if (!clientId) {
    return NextResponse.json({ error: "Client ID is required." }, { status: 400 });
  }

  try {
    const notes = await prisma.clientNote.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    });

    return NextResponse.json({ success: true, notes });
  } catch (error) {
    console.error("[Admin Notes GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch notes." }, { status: 500 });
  }
}

/**
 * POST /api/admin/notes
 * Persists a new note for a client on a specific calendar day
 */
export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "DEVELOPER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { clientId, targetDate, note } = body;

    if (!clientId || !targetDate || !note?.trim()) {
      return NextResponse.json(
        { error: "clientId, targetDate, and note text are required." },
        { status: 400 }
      );
    }

    const createdNote = await prisma.clientNote.create({
      data: {
        clientId,
        authorId: session.user.id,
        targetDate: String(targetDate).trim(),
        note: String(note).trim(),
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      note: createdNote,
      message: "Note saved successfully.",
    });
  } catch (error) {
    console.error("[Admin Notes POST Error]", error);
    return NextResponse.json({ error: "Failed to create note." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/notes?id=...
 * Removes a note
 */
export async function DELETE(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ error: "Note ID is required." }, { status: 400 });
  }

  try {
    await prisma.clientNote.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Note deleted." });
  } catch (error) {
    console.error("[Admin Notes DELETE Error]", error);
    return NextResponse.json({ error: "Failed to delete note." }, { status: 500 });
  }
}
