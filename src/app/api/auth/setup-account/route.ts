import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";
import { evaluatePasswordStrength } from "@/lib/password-policy";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

function detectImageType(buffer: Buffer): { ext: string; mime: string } | null {
  if (buffer.length < 12) return null;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: ".jpg", mime: "image/jpeg" };
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
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
 * GET /api/auth/setup-account?token=...
 * Inspects whether a setup/reset token is valid and returns initial user profile info
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.json({ valid: false, error: "Token is required." }, { status: 400 });
  }

  try {
    const verification = await prisma.authVerification.findFirst({
      where: { identifier: `reset-password:${token}` },
    });

    if (!verification || verification.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: "This link is invalid or has expired." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: verification.value },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        dateOfBirth: true,
        image: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ valid: false, error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      user: {
        email: user.email,
        name: user.name,
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        image: user.image || "",
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Setup Account GET] Error inspecting token:", error);
    return NextResponse.json({ valid: false, error: "Failed to verify token." }, { status: 500 });
  }
}

/**
 * POST /api/auth/setup-account
 * Completes user onboarding: sets password and saves profile details (name, phone, DOB, avatar)
 */
export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimit(`setup-account:${clientIp}`, {
    windowSeconds: 300,
    max: 15,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 60) } }
    );
  }

  let token = "";
  let password = "";
  let name = "";
  let phone = "";
  let dateOfBirth = "";
  let avatarBuffer: Buffer | null = null;

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      token = String(formData.get("token") || "").trim();
      password = String(formData.get("password") || "");
      name = String(formData.get("name") || "").trim();
      phone = String(formData.get("phone") || "").trim();
      dateOfBirth = String(formData.get("dateOfBirth") || "").trim();

      const avatarFile = formData.get("avatar");
      if (avatarFile && typeof avatarFile === "object" && "arrayBuffer" in avatarFile) {
        const file = avatarFile as File;
        if (file.size > 0) {
          if (file.size > MAX_AVATAR_SIZE) {
            return NextResponse.json({ error: "Profile photo must be 2MB or smaller." }, { status: 400 });
          }
          avatarBuffer = Buffer.from(await file.arrayBuffer());
        }
      }
    } catch {
      return NextResponse.json({ error: "Invalid form data submission." }, { status: 400 });
    }
  } else {
    try {
      const body = await request.json();
      token = String(body.token || "").trim();
      password = String(body.password || "");
      name = String(body.name || "").trim();
      phone = String(body.phone || "").trim();
      dateOfBirth = String(body.dateOfBirth || "").trim();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }
  }

  if (!token) {
    return NextResponse.json({ error: "Security token is required." }, { status: 400 });
  }

  const strength = evaluatePasswordStrength(password);
  if (!strength.isValid) {
    return NextResponse.json(
      { error: "Password must be 6 to 12 characters and include uppercase, lowercase, and a special symbol." },
      { status: 400 }
    );
  }

  try {
    const verification = await prisma.authVerification.findFirst({
      where: { identifier: `reset-password:${token}` },
    });

    if (!verification || verification.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This activation link is invalid or has expired. Please contact your administrator." },
        { status: 400 }
      );
    }

    const userId = verification.value;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Associated account could not be found." }, { status: 404 });
    }

    // Process Avatar if uploaded
    let uploadedAvatarUrl: string | null = null;
    if (avatarBuffer) {
      const detected = detectImageType(avatarBuffer);
      if (!detected) {
        return NextResponse.json(
          { error: "Only valid JPEG, PNG, or WebP images are permitted for profile avatars." },
          { status: 400 }
        );
      }

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });

      const fileName = `avatar-${crypto.randomUUID()}${detected.ext}`;
      const fullPath = path.join(uploadsDir, fileName);
      await fs.writeFile(fullPath, avatarBuffer);
      uploadedAvatarUrl = `/uploads/${fileName}`;
    }

    const hashedPassword = await hashPassword(password);

    await prisma.$transaction([
      // 1. Update user profile details
      prisma.user.update({
        where: { id: user.id },
        data: {
          name: name || user.name,
          phone: phone || user.phone,
          dateOfBirth: dateOfBirth || user.dateOfBirth,
          image: uploadedAvatarUrl || user.image,
          emailVerified: true,
          emailVerifiedAt: user.emailVerifiedAt || new Date(),
          banned: false,
        },
      }),

      // 2. Upsert credential account for login
      prisma.authAccount.upsert({
        where: {
          providerId_accountId: {
            providerId: "credential",
            accountId: user.id,
          },
        },
        update: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
        create: {
          accountId: user.id,
          providerId: "credential",
          userId: user.id,
          password: hashedPassword,
        },
      }),

      // 3. Invalidate single-use token
      prisma.authVerification.delete({
        where: { id: verification.id },
      }),

      // 4. Revoke active sessions for security
      prisma.authSession.deleteMany({
        where: { userId: user.id },
      }),

      // 5. Audit log
      prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "UPDATE",
          entityType: "User",
          entityId: user.id,
          metadata: {
            action: "ACCOUNT_SETUP_COMPLETED",
            phoneUpdated: Boolean(phone),
            dobUpdated: Boolean(dateOfBirth),
            avatarUploaded: Boolean(uploadedAvatarUrl),
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Your profile has been created and your account is ready!",
    });
  } catch (error) {
    console.error("[Setup Account POST] Error processing account setup:", error);
    return NextResponse.json(
      { error: "Failed to configure account. Please try again shortly." },
      { status: 500 }
    );
  }
}
