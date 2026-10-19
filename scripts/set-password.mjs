import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

const email = process.argv[2]?.trim().toLowerCase();
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error("Usage: node scripts/set-password.mjs <email> <newPassword>");
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error("Password must be at least 6 characters.");
  process.exit(1);
}

async function main() {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  if (!user) {
    console.error(`User with email "${email}" not found.`);
    process.exit(1);
  }

  const hashedPassword = await hashPassword(newPassword);

  const credentialAccount = user.accounts.find((a) => a.providerId === "credential");

  if (credentialAccount) {
    await prisma.authAccount.update({
      where: { id: credentialAccount.id },
      data: { password: hashedPassword, updatedAt: new Date() },
    });
  } else {
    await prisma.authAccount.create({
      data: {
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: hashedPassword,
      },
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      banned: false,
    },
  });

  console.log(`Successfully updated password for ${email} (Role: ${user.role}).`);
}

main()
  .catch((e) => {
    console.error("Error setting password:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
