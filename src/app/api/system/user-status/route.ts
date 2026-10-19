import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "System user status management is disabled in production environments." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET;

  if (!expectedSecret || !secret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized: Invalid or unconfigured secret" }, { status: 401 });
  }

  const email = searchParams.get("email")?.toLowerCase().trim();
  const action = searchParams.get("action");
  const password = searchParams.get("password") || "Bipul@1234";

  try {
    if (action === "create_admin" || action === "upsert_admin") {
      const targetEmail = email || "kbipul792@gmail.com";
      const hashedPassword = await hashPassword(password);

      let user = await prisma.user.findUnique({
        where: { email: targetEmail },
      });

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            role: "ADMIN",
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
        });

        await prisma.authAccount.upsert({
          where: {
            providerId_accountId: {
              providerId: "credential",
              accountId: user.id,
            },
          },
          update: {
            password: hashedPassword,
          },
          create: {
            accountId: user.id,
            providerId: "credential",
            userId: user.id,
            password: hashedPassword,
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email: targetEmail,
            name: "Bipul (Admin)",
            role: "ADMIN",
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
        });

        await prisma.authAccount.create({
          data: {
            accountId: user.id,
            providerId: "credential",
            userId: user.id,
            password: hashedPassword,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Admin user ${targetEmail} successfully created/updated!`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        },
      });
    }

    if (!email) {
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
        error: error instanceof Error ? error.message : "Failed to execute user operation",
      },
      { status: 500 }
    );
  }
}
