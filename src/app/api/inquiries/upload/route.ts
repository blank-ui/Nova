import { NextResponse } from "next/server";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit for reference images

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

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimit(`inquiry-upload:${clientIp}`, {
    max: 15,
    windowSeconds: 600,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many upload attempts. Please wait a few moments." },
      { status: 429 }
    );
  }

  try {
    let fileBuffer: Buffer | null = null;
    let originalName = "reference-image";
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No image file provided." }, { status: 400 });
      }

      originalName = file.name || "reference-image";
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      const body = await request.json();
      if (!body.image || typeof body.image !== "string") {
        return NextResponse.json({ error: "No image payload provided." }, { status: 400 });
      }
      if (body.filename && typeof body.filename === "string") {
        originalName = body.filename;
      }
      const matches = body.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        fileBuffer = Buffer.from(matches[2], "base64");
      } else {
        return NextResponse.json({ error: "Invalid image encoding format." }, { status: 400 });
      }
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json({ error: "Empty image received." }, { status: 400 });
    }

    if (fileBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Reference image cannot exceed 10 MB in size." },
        { status: 413 }
      );
    }

    const detected = detectImageType(fileBuffer);
    if (!detected) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, or GIF image files are supported." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "inquiries");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const baseNameSanitized = path
      .basename(originalName, path.extname(originalName))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 32);

    const randomSuffix = crypto.randomBytes(8).toString("hex");
    const fileName = `${baseNameSanitized}-${randomSuffix}${detected.ext}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, fileBuffer);

    const publicUrl = `/uploads/inquiries/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      size: fileBuffer.length,
      mime: detected.mime,
    });
  } catch (err) {
    console.error("[Inquiry Reference Upload Error]", err);
    return NextResponse.json(
      { error: "Could not upload reference image. Please try again." },
      { status: 500 }
    );
  }
}
