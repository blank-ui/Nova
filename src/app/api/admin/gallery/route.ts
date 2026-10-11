import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-guards";
import { canOpenAdmin } from "@/lib/auth-policy";

/**
 * GET /api/admin/gallery
 * Returns all gallery items
 */
export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[Gallery API] Error:", err);
    return NextResponse.json({ error: "Failed to fetch gallery items" }, { status: 500 });
  }
}

/**
 * POST /api/admin/gallery
 * Admin creates a new gallery item / screenshot showcase
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

  const title = String(body.title ?? "").trim();
  const imageUrl = String(body.imageUrl ?? "").trim();
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const category = String(body.category ?? "UI/UX").trim();
  const repoName = typeof body.repoName === "string" ? body.repoName.trim() : null;
  const projectUrl = typeof body.projectUrl === "string" ? body.projectUrl.trim() : null;

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (!imageUrl) {
    return NextResponse.json({ error: "Image / Screenshot URL is required." }, { status: 400 });
  }

  try {
    const item = await prisma.galleryItem.create({
      data: {
        title,
        imageUrl,
        description,
        category,
        repoName,
        projectUrl,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CREATE",
        entityType: "GalleryItem",
        entityId: item.id,
        metadata: { title, category },
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (err) {
    console.error("[Gallery API] Error creating item:", err);
    return NextResponse.json({ error: "Failed to create gallery item." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/gallery?id=...
 * Admin deletes a gallery item
 */
export async function DELETE(request: Request) {
  const session = await getCurrentSession();
  if (!session || !canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Item ID is required." }, { status: 400 });
  }

  try {
    await prisma.galleryItem.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "DELETE",
        entityType: "GalleryItem",
        entityId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Gallery API] Error deleting item:", err);
    return NextResponse.json({ error: "Failed to delete gallery item." }, { status: 500 });
  }
}
