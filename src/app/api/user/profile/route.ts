import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      dateOfBirth: true,
      image: true,
      twoFactorEnabled: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimit(`user-profile:${session.user.id}:${clientIp}`, {
    max: 30,
    windowSeconds: 60,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many updates. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { name, phone, dateOfBirth } = body;

    const dataToUpdate: {
      name?: string;
      phone?: string | null;
      dateOfBirth?: string | null;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return NextResponse.json(
          { error: "Display name must be at least 2 characters." },
          { status: 400 }
        );
      }
      dataToUpdate.name = name.trim();
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, phone: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (phone !== undefined) {
      const trimmedPhone = phone === null || phone === "" ? null : typeof phone === "string" ? phone.trim() : null;
      if (trimmedPhone && trimmedPhone.length > 30) {
        return NextResponse.json(
          { error: "Phone number is too long." },
          { status: 400 }
        );
      }

      // If user ALREADY had a phone number saved, and is trying to change/update it:
      if (currentUser.phone && currentUser.phone !== trimmedPhone) {
        const { otp } = body;
        if (!otp || typeof otp !== "string" || !otp.trim()) {
          return NextResponse.json(
            {
              error: "A verification code sent to your registered email is required to update your mobile number.",
              otpRequired: true,
            },
            { status: 400 }
          );
        }

        const identifier = `phone-otp:${currentUser.id}`;
        const otpAttemptLimit = await consumeRateLimit(`phone-otp-attempt:${currentUser.id}:${clientIp}`, {
          max: 5,
          windowSeconds: 600,
        });
        if (!otpAttemptLimit.allowed) {
          await prisma.authVerification.deleteMany({
            where: { identifier },
          });
          return NextResponse.json(
            { error: "Too many failed attempts. Your verification code has been invalidated for security. Please request a new code." },
            { status: 429 }
          );
        }

        const verification = await prisma.authVerification.findFirst({
          where: {
            identifier,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
        });

        if (!verification) {
          return NextResponse.json(
            { error: "Verification code has expired or was not requested. Please request a new code." },
            { status: 400 }
          );
        }

        const expectedValue = `${otp.trim()}:${trimmedPhone ?? ""}`;
        if (verification.value !== expectedValue) {
          return NextResponse.json(
            { error: "Invalid verification code. Please check your email and try again." },
            { status: 400 }
          );
        }

        // Successfully verified! Consume the OTP
        await prisma.authVerification.deleteMany({
          where: { identifier },
        });
      }

      dataToUpdate.phone = trimmedPhone;
    }

    if (dateOfBirth !== undefined) {
      if (dateOfBirth === null || dateOfBirth === "") {
        dataToUpdate.dateOfBirth = null;
      } else if (typeof dateOfBirth === "string") {
        const trimmedDob = dateOfBirth.trim();
        const parsed = new Date(trimmedDob);
        if (isNaN(parsed.getTime())) {
          return NextResponse.json(
            { error: "Invalid date of birth format." },
            { status: 400 }
          );
        }
        // Date of birth cannot be in the future
        if (parsed > new Date()) {
          return NextResponse.json(
            { error: "Date of birth cannot be in the future." },
            { status: 400 }
          );
        }
        if (currentUser.role === "CLIENT") {
          const today = new Date();
          const minAgeDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
          if (parsed > minAgeDate) {
            return NextResponse.json(
              { error: "You must be at least 13 years of age." },
              { status: 400 }
            );
          }
        }
        dataToUpdate.dateOfBirth = trimmedDob;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        dateOfBirth: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully.",
    });
  } catch (err) {
    console.error("[Profile Update Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update profile" },
      { status: 500 }
    );
  }
}
