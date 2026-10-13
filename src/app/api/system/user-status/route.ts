import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const expectedSecret =
    process.env.ADMIN_BOOTSTRAP_SECRET || "12d4b78048eee8007f127d694ad2dffc7bc0377392e37d41";

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = searchParams.get("email")?.toLowerCase().trim();
  const action = searchParams.get("action");

  try {
    if (!email) {
      // List all users summary
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          discordHandle: true,
          discordId: true,
          createdAt: true,
        },
      });
      return NextResponse.json({ total: users.length, users });
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found", email }, { status: 404 });
    }

    if (action === "verify") {
      user = await prisma.user.update({
        where: { email },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
        include: {
          accounts: true,
        },
      });
      return NextResponse.json({
        success: true,
        message: `User ${email} has been verified!`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          accounts: user.accounts.map((a) => a.providerId),
        },
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        hasPassword: Boolean(user.passwordHash),
        accounts: user.accounts.map((a) => a.providerId),
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to query user status",
      },
      { status: 500 }
    );
  }
}
