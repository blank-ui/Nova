import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const configuredSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();

try {
  if (!configuredSecret || Buffer.byteLength(configuredSecret) < 32) throw new Error("Set ADMIN_BOOTSTRAP_SECRET to a random value of at least 32 bytes.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Set BOOTSTRAP_ADMIN_EMAIL to the verified account email.");
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { email }, select: { id: true, emailVerified: true, role: true } });
    if (!user || !user.emailVerified) throw new Error("A verified account with that email is required.");
    const existingAdmin = await tx.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
    if (existingAdmin) throw new Error("An administrator is already provisioned.");
    await tx.bootstrapClaim.create({ data: { id: "initial-owner", userId: user.id } });
    await tx.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
  });
  console.info("Initial administrator role assigned. Configure TOTP MFA before opening the admin workspace, then remove bootstrap secrets from the deployment environment.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Initial administrator setup failed.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
