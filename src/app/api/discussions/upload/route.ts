import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-guards";
import { consumeRateLimit } from "@/lib/rate-limit";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
];

const DANGEROUS_EXTENSIONS = new Set([
  ".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs", ".js", ".mjs", ".ts",
  ".py", ".php", ".phtml", ".pl", ".cgi", ".bin", ".dll", ".so", ".jar",
  ".scr", ".msi", ".com", ".hta", ".cpl", ".reg", ".elf"
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

function isBinaryExecutable(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  // 'MZ' DOS/Windows executable header
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) return true;
  // '\x7fELF' Linux executable header
  if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) return true;
  return false;
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 20 uploads per minute per user
  const rateLimit = await consumeRateLimit(`disc-upload:${session.user.id}`, {
    windowSeconds: 60,
    max: 20,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many upload attempts. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check for null bytes or path traversal
    if (file.name.includes("\0") || file.name.includes("..")) {
      return NextResponse.json({ error: "Invalid file name." }, { status: 400 });
    }

    const rawExt = path.extname(file.name || "").toLowerCase();
    if (DANGEROUS_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { error: "Invalid file type. Executables and script files are strictly blocked." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only Images (PNG, JPG, WebP, GIF, SVG) and PDF documents are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 15MB limit." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json({ error: "Empty file cannot be uploaded." }, { status: 400 });
    }

    if (isBinaryExecutable(buffer)) {
      return NextResponse.json(
        { error: "Security violation: Executable payload detected." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "discussions");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const sanitizedBase = path
      .basename(file.name, path.extname(file.name))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const ext = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : ".png");
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${sanitizedBase}${ext}`;
    const targetFilePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(targetFilePath, buffer);

    const publicUrl = `/uploads/discussions/${uniqueName}`;

    return NextResponse.json({
      success: true,
      file: {
        url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (err: any) {
    console.error("Discussions upload failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload file." },
      { status: 500 }
    );
  }
}
