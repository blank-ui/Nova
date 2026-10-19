import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendSmtpEmail, buildNovaEmailHtml } from "@/lib/auth-email";
import crypto from "node:crypto";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimit(`phone-otp:${session.user.id}:${clientIp}`, {
    max: 5,
    windowSeconds: 300,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many OTP requests. Please wait a few minutes before trying again." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { newPhone } = body;

    if (!newPhone || typeof newPhone !== "string" || !newPhone.trim()) {
      return NextResponse.json(
        { error: "New mobile number is required." },
        { status: 400 }
      );
    }

    const trimmedPhone = newPhone.trim();

    // Check current user in DB
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, phone: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user has no existing phone number, OTP is not required
    if (!user.phone) {
      return NextResponse.json({
        otpRequired: false,
        message: "No existing phone number saved. You can save directly.",
      });
    }

    // If the phone number is identical to current phone
    if (user.phone === trimmedPhone) {
      return NextResponse.json(
        { error: "The new phone number is identical to your current phone number." },
        { status: 400 }
      );
    }

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in AuthVerification
    const identifier = `phone-otp:${user.id}`;
    await prisma.authVerification.deleteMany({
      where: { identifier },
    });

    await prisma.authVerification.create({
      data: {
        identifier,
        value: `${otp}:${trimmedPhone}`,
        expiresAt,
      },
    });

    // Send email to user.email
    const subject = "Nova Security: One-Time Code to Update Mobile Number";
    const bodyText = `Hello ${user.name},\n\nYou requested to update your registered mobile number to ${trimmedPhone}.\n\nYour 6-digit verification code is:\n\n${otp}\n\nThis code is valid for 10 minutes. If you did not request this update, please change your password and secure your account immediately.\n\nBest regards,\nNova Security Team`;

    const html = buildNovaEmailHtml({
      subject,
      heading: "Verify Mobile Number Update",
      bodyText: `You requested to update your registered mobile number on Nova to <strong style="color:#101322;">${trimmedPhone}</strong>.<br /><br />Enter the verification code below to authorize this change:`,
      actionText: `Security Code: ${otp}`,
      subtext: "This one-time passcode expires in 10 minutes. If you did not make this request, someone may be trying to access your profile. Please contact support immediately.",
    });

    await sendSmtpEmail({
      to: user.email,
      subject,
      text: bodyText,
      html,
    });

    return NextResponse.json({
      success: true,
      otpRequired: true,
      message: `A 6-digit verification code has been dispatched to your registered email (${user.email}).`,
    });
  } catch (err) {
    console.error("[Send Phone OTP Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send verification code." },
      { status: 500 }
    );
  }
}
