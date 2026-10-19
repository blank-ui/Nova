import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-guards";
import { canOpenAdmin } from "@/lib/auth-policy";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit for showcase screenshots

/**
 * Validates header magic bytes for JPEG, PNG, WEBP, GIF
 */
function detectImageType(buffer: Buffer): { ext: string; mime: string } | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: ".jpg", mime: "image/jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { ext: ".png", mime: "image/png" };
  }

  // WEBP: 'RIFF'....'WEBP'
  const riff = buffer.toString("ascii", 0, 4);
  const webp = buffer.toString("ascii", 8, 12);
  if (riff === "RIFF" && webp === "WEBP") {
    return { ext: ".webp", mime: "image/webp" };
  }

  // GIF: GIF87a or GIF89a
  const gifHeader = buffer.toString("ascii", 0, 6);
  if (gifHeader === "GIF87a" || gifHeader === "GIF89a") {
    return { ext: ".gif", mime: "image/gif" };
  }

  return null;
}

/**
 * POST /api/admin/gallery/upload
 * Upload screenshot or image directly for project showcase gallery.
 */
export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || !canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Unauthorized: Administrator access required." }, { status: 403 });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimit(`gallery-upload:${session.user.id}:${clientIp}`, {
    max: 30,
    windowSeconds: 60,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many upload requests. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    let fileBuffer: Buffer | null = null;
    let originalName: string = "uploaded-image";
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No image file provided in form data." }, { status: 400 });
      }

      originalName = file.name || "uploaded-image";
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      // JSON with Base64 data URL
      const body = await request.json();
      if (!body.image || typeof body.image !== "string") {
        return NextResponse.json({ error: "No image payload provided." }, { status: 400 });
      }

      if (body.filename && typeof body.filename === "string") {
        originalName = body.filename;
      }

      // Extract base64
      const matches = body.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        fileBuffer = Buffer.from(matches[2], "base64");
      } else {
        fileBuffer = Buffer.from(body.image, "base64");
      }
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
    }

    if (fileBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image file exceeds maximum 10 MB limit." },
        { status: 400 }
      );
    }

    const typeInfo = detectImageType(fileBuffer);
    if (!typeInfo) {
      return NextResponse.json(
        { error: "Invalid image format. Allowed formats: PNG, JPEG, WEBP, GIF." },
        { status: 400 }
      );
    }

    // Save to public/uploads/gallery
    const randomName = `${crypto.randomUUID()}${typeInfo.ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "gallery");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const targetFilePath = path.join(uploadDir, randomName);
    await fs.promises.writeFile(targetFilePath, fileBuffer);

    const imageUrl = `/uploads/gallery/${randomName}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      filename: originalName,
      size: fileBuffer.length,
      mime: typeInfo.mime,
    });
  } catch (err) {
    console.error("[Gallery Upload Error]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to upload image." },
      { status: 500 }
    );
  }
}
