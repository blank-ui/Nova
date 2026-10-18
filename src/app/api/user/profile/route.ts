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

    if (phone !== undefined) {
      if (phone === null || phone === "") {
        dataToUpdate.phone = null;
      } else if (typeof phone === "string") {
        const trimmedPhone = phone.trim();
        if (trimmedPhone.length > 30) {
          return NextResponse.json(
            { error: "Phone number is too long." },
            { status: 400 }
          );
        }
        dataToUpdate.phone = trimmedPhone;
      }
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
