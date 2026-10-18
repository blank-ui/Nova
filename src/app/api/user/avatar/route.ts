import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

/**
 * Validates header magic bytes for JPEG, PNG, WEBP
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

  return null;
}

/**
 * POST /api/user/avatar
 * Upload or replace user profile photo.
 * Supported by: User (for own profile) or ADMIN (for any user)
 */
export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimit(`avatar:${session.user.id}:${clientIp}`, {
    max: 20,
    windowSeconds: 60,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many upload attempts. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    let targetUserId = session.user.id;
    let fileBuffer: Buffer | null = null;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const requestedUserId = formData.get("userId") as string | null;

      if (requestedUserId && requestedUserId !== session.user.id) {
        if (session.user.role !== "ADMIN") {
          return NextResponse.json(
            { error: "Forbidden: Only administrators can update other users' avatars." },
            { status: 403 }
          );
        }
        targetUserId = requestedUserId;
      }

      if (!file) {
        return NextResponse.json({ error: "No image file provided." }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      // JSON with Base64 data URL
      const body = await request.json();
      const requestedUserId = body.userId;
      if (requestedUserId && requestedUserId !== session.user.id) {
        if (session.user.role !== "ADMIN") {
          return NextResponse.json(
            { error: "Forbidden: Only administrators can update other users' avatars." },
            { status: 403 }
          );
        }
        targetUserId = requestedUserId;
      }

      if (!body.image || typeof body.image !== "string") {
        return NextResponse.json({ error: "No image payload provided." }, { status: 400 });
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
      return NextResponse.json({ error: "Empty image content." }, { status: 400 });
    }

    if (fileBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image file exceeds maximum 2 MB limit." },
        { status: 400 }
      );
    }

    const typeInfo = detectImageType(fileBuffer);
    if (!typeInfo) {
      return NextResponse.json(
        { error: "Invalid image format. Allowed formats: JPEG, PNG, WEBP." },
        { status: 400 }
      );
    }

    // Verify target user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, image: true },
    });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Unlink old avatar if locally stored
    if (existingUser.image && existingUser.image.startsWith("/uploads/avatars/")) {
      const oldFilename = path.basename(existingUser.image);
      const oldPath = path.join(process.cwd(), "public", "uploads", "avatars", oldFilename);
      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (err) {
        console.warn("[Avatar Upload] Error removing previous avatar:", err);
      }
    }

    // Store new avatar with cryptographically random unguessable name
    const randomName = `${crypto.randomUUID()}${typeInfo.ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const targetFilePath = path.join(uploadDir, randomName);
    await fs.promises.writeFile(targetFilePath, fileBuffer);

    const avatarUrl = `/uploads/avatars/${randomName}`;

    // Update database record
    await prisma.user.update({
      where: { id: targetUserId },
      data: { image: avatarUrl },
    });

    return NextResponse.json({
      success: true,
      avatarUrl,
      userId: targetUserId,
      message: "Profile photo updated successfully.",
    });
  } catch (err) {
    console.error("[Avatar Upload Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error uploading avatar." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/avatar
 * Removes user profile photo and deletes stored asset from disk.
 */
export async function DELETE(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  let targetUserId = url.searchParams.get("userId") || session.user.id;

  if (targetUserId !== session.user.id) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only administrators can delete other users' avatars." },
        { status: 403 }
      );
    }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, image: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (existingUser.image && existingUser.image.startsWith("/uploads/avatars/")) {
      const oldFilename = path.basename(existingUser.image);
      const oldPath = path.join(process.cwd(), "public", "uploads", "avatars", oldFilename);
      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (err) {
        console.warn("[Avatar Delete] Error removing avatar file:", err);
      }
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { image: null },
    });

    return NextResponse.json({
      success: true,
      avatarUrl: null,
      userId: targetUserId,
      message: "Profile photo removed successfully.",
    });
  } catch (err) {
    console.error("[Avatar Delete Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error deleting avatar." },
      { status: 500 }
    );
  }
}
