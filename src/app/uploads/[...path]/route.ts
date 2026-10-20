import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

/**
 * GET /uploads/[...path]
 * Dynamically streams uploaded assets stored on disk in public/uploads.
 * Essential for Next.js standalone mode where runtime-written files are
 * not part of the build-time static asset manifest.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    if (!segments || segments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Guard against path traversal
    for (const segment of segments) {
      if (segment.includes("..") || segment.includes("/") || segment.includes("\\")) {
        return new NextResponse("Forbidden: Invalid path segment", { status: 403 });
      }
    }

    const relativePath = segments.join(path.sep);
    const uploadsBase = path.resolve(process.cwd(), "public", "uploads");
    const fullPath = path.resolve(uploadsBase, relativePath);

    // Verify target path is strictly within public/uploads
    if (!fullPath.startsWith(uploadsBase)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!existsSync(fullPath)) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const fileBuffer = await fs.readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[Upload Streamer Error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
