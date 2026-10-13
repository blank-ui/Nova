import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DDL_STATEMENTS = [
  // 1. User
  `CREATE TABLE IF NOT EXISTS \`User\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`email\` VARCHAR(191) NOT NULL,
    \`name\` VARCHAR(191) NOT NULL,
    \`passwordHash\` VARCHAR(191) NULL,
    \`role\` VARCHAR(191) NOT NULL DEFAULT 'CLIENT',
    \`emailVerified\` BOOLEAN NOT NULL DEFAULT false,
    \`emailVerifiedAt\` DATETIME(3) NULL,
    \`image\` VARCHAR(191) NULL,
    \`discordHandle\` VARCHAR(191) NULL,
    \`discordId\` VARCHAR(191) NULL,
    \`twoFactorEnabled\` BOOLEAN NOT NULL DEFAULT false,
    \`banned\` BOOLEAN NOT NULL DEFAULT false,
    \`banReason\` VARCHAR(191) NULL,
    \`banExpires\` DATETIME(3) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    UNIQUE INDEX \`User_email_key\`(\`email\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 2. Session
  `CREATE TABLE IF NOT EXISTS \`Session\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`tokenHash\` VARCHAR(191) NOT NULL,
    \`userId\` VARCHAR(191) NOT NULL,
    \`expiresAt\` DATETIME(3) NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX \`Session_tokenHash_key\`(\`tokenHash\`),
    INDEX \`Session_userId_expiresAt_idx\`(\`userId\`, \`expiresAt\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 3. AuthSession
  `CREATE TABLE IF NOT EXISTS \`AuthSession\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`token\` VARCHAR(191) NOT NULL,
    \`userId\` VARCHAR(191) NOT NULL,
    \`expiresAt\` DATETIME(3) NOT NULL,
    \`ipAddress\` VARCHAR(191) NULL,
    \`userAgent\` TEXT NULL,
    \`impersonatedBy\` VARCHAR(191) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    UNIQUE INDEX \`AuthSession_token_key\`(\`token\`),
    INDEX \`AuthSession_userId_idx\`(\`userId\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 4. AuthAccount
  `CREATE TABLE IF NOT EXISTS \`AuthAccount\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`accountId\` VARCHAR(191) NOT NULL,
    \`providerId\` VARCHAR(191) NOT NULL,
    \`userId\` VARCHAR(191) NOT NULL,
    \`accessToken\` TEXT NULL,
    \`refreshToken\` TEXT NULL,
    \`idToken\` TEXT NULL,
    \`accessTokenExpiresAt\` DATETIME(3) NULL,
    \`refreshTokenExpiresAt\` DATETIME(3) NULL,
    \`scope\` VARCHAR(191) NULL,
    \`password\` TEXT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    INDEX \`AuthAccount_userId_idx\`(\`userId\`),
    UNIQUE INDEX \`AuthAccount_providerId_accountId_key\`(\`providerId\`, \`accountId\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 5. AuthVerification
  `CREATE TABLE IF NOT EXISTS \`AuthVerification\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`identifier\` VARCHAR(191) NOT NULL,
    \`value\` TEXT NOT NULL,
    \`expiresAt\` DATETIME(3) NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    INDEX \`AuthVerification_identifier_idx\`(\`identifier\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 6. AuthTwoFactor
  `CREATE TABLE IF NOT EXISTS \`AuthTwoFactor\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`userId\` VARCHAR(191) NOT NULL,
    \`secret\` TEXT NOT NULL,
    \`backupCodes\` TEXT NOT NULL,
    \`verified\` BOOLEAN NOT NULL DEFAULT true,
    \`failedVerificationCount\` INTEGER NOT NULL DEFAULT 0,
    \`lockedUntil\` DATETIME(3) NULL,
    INDEX \`AuthTwoFactor_secret_idx\`(\`secret\`(191)),
    INDEX \`AuthTwoFactor_userId_idx\`(\`userId\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 7. AuthRateLimit
  `CREATE TABLE IF NOT EXISTS \`AuthRateLimit\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`key\` VARCHAR(191) NOT NULL,
    \`count\` INTEGER NOT NULL,
    \`lastRequest\` BIGINT NOT NULL,
    UNIQUE INDEX \`AuthRateLimit_key_key\`(\`key\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 8. BootstrapClaim
  `CREATE TABLE IF NOT EXISTS \`BootstrapClaim\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`userId\` VARCHAR(191) NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX \`BootstrapClaim_userId_key\`(\`userId\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 9. Inquiry
  `CREATE TABLE IF NOT EXISTS \`Inquiry\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`name\` VARCHAR(191) NOT NULL,
    \`email\` VARCHAR(191) NOT NULL,
    \`phone\` VARCHAR(191) NULL,
    \`company\` VARCHAR(191) NULL,
    \`service\` VARCHAR(191) NOT NULL,
    \`budget\` VARCHAR(191) NULL,
    \`message\` TEXT NOT NULL,
    \`status\` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CONVERTED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX \`Inquiry_status_createdAt_idx\`(\`status\`, \`createdAt\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 10. Project
  `CREATE TABLE IF NOT EXISTS \`Project\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`name\` VARCHAR(191) NOT NULL,
    \`description\` TEXT NULL,
    \`status\` ENUM('PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'ON_HOLD') NOT NULL DEFAULT 'PLANNING',
    \`clientId\` VARCHAR(191) NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    INDEX \`Project_clientId_status_idx\`(\`clientId\`, \`status\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 11. Milestone
  `CREATE TABLE IF NOT EXISTS \`Milestone\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`projectId\` VARCHAR(191) NOT NULL,
    \`title\` VARCHAR(191) NOT NULL,
    \`description\` TEXT NULL,
    \`dueAt\` DATETIME(3) NULL,
    \`completedAt\` DATETIME(3) NULL,
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 12. Task
  `CREATE TABLE IF NOT EXISTS \`Task\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`projectId\` VARCHAR(191) NOT NULL,
    \`title\` VARCHAR(191) NOT NULL,
    \`completedAt\` DATETIME(3) NULL,
    \`dueAt\` DATETIME(3) NULL,
    INDEX \`Task_projectId_dueAt_idx\`(\`projectId\`, \`dueAt\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 13. Message
  `CREATE TABLE IF NOT EXISTS \`Message\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`projectId\` VARCHAR(191) NOT NULL,
    \`authorId\` VARCHAR(191) NOT NULL,
    \`body\` TEXT NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX \`Message_projectId_createdAt_idx\`(\`projectId\`, \`createdAt\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 14. ProjectFile
  `CREATE TABLE IF NOT EXISTS \`ProjectFile\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`projectId\` VARCHAR(191) NOT NULL,
    \`storageKey\` VARCHAR(191) NOT NULL,
    \`originalName\` VARCHAR(191) NOT NULL,
    \`mimeType\` VARCHAR(191) NOT NULL,
    \`sizeBytes\` INTEGER NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX \`ProjectFile_storageKey_key\`(\`storageKey\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 15. AuditLog
  `CREATE TABLE IF NOT EXISTS \`AuditLog\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`actorId\` VARCHAR(191) NULL,
    \`action\` VARCHAR(191) NOT NULL,
    \`entityType\` VARCHAR(191) NOT NULL,
    \`entityId\` VARCHAR(191) NULL,
    \`metadata\` JSON NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX \`AuditLog_actorId_createdAt_idx\`(\`actorId\`, \`createdAt\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 16. StudioSettings
  `CREATE TABLE IF NOT EXISTS \`StudioSettings\` (
    \`id\` VARCHAR(191) NOT NULL DEFAULT 'default',
    \`githubUser\` VARCHAR(191) NOT NULL DEFAULT 'blank-ui',
    \`visibleRepos\` TEXT NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 17. GalleryItem
  `CREATE TABLE IF NOT EXISTS \`GalleryItem\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`title\` VARCHAR(191) NOT NULL,
    \`description\` TEXT NULL,
    \`imageUrl\` TEXT NOT NULL,
    \`category\` VARCHAR(191) NOT NULL DEFAULT 'UI/UX',
    \`repoName\` VARCHAR(191) NULL,
    \`projectUrl\` VARCHAR(191) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    INDEX \`GalleryItem_category_createdAt_idx\`(\`category\`, \`createdAt\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
];

const FOREIGN_KEYS = [
  "ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;",
  "ALTER TABLE `AuthSession` ADD CONSTRAINT `AuthSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;",
  "ALTER TABLE `AuthAccount` ADD CONSTRAINT `AuthAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;",
  "ALTER TABLE `AuthTwoFactor` ADD CONSTRAINT `AuthTwoFactor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;",
  "ALTER TABLE `BootstrapClaim` ADD CONSTRAINT `BootstrapClaim_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;",
  "ALTER TABLE `Project` ADD CONSTRAINT `Project_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;",
  "ALTER TABLE `Milestone` ADD CONSTRAINT `Milestone_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;",
  "ALTER TABLE `Task` ADD CONSTRAINT `Task_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;",
  "ALTER TABLE `Message` ADD CONSTRAINT `Message_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;",
  "ALTER TABLE `ProjectFile` ADD CONSTRAINT `ProjectFile_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;",
  "ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;",
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const expectedSecret =
    process.env.ADMIN_BOOTSTRAP_SECRET || "12d4b78048eee8007f127d694ad2dffc7bc0377392e37d41";

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized: Invalid secret" }, { status: 401 });
  }

  const results: Array<{ step: number; status: string; detail?: string }> = [];

  try {
    // 1. Create tables
    for (let i = 0; i < DDL_STATEMENTS.length; i++) {
      const stmt = DDL_STATEMENTS[i];
      try {
        await prisma.$executeRawUnsafe(stmt);
        results.push({ step: i + 1, status: "created_or_exists" });
      } catch (err) {
        results.push({
          step: i + 1,
          status: "failed",
          detail: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // 2. Add foreign keys (ignore if already exists)
    for (let i = 0; i < FOREIGN_KEYS.length; i++) {
      const fk = FOREIGN_KEYS[i];
      try {
        await prisma.$executeRawUnsafe(fk);
        results.push({ step: DDL_STATEMENTS.length + i + 1, status: "fk_added" });
      } catch (err) {
        // Ignored if constraint already exists
        results.push({
          step: DDL_STATEMENTS.length + i + 1,
          status: "fk_skipped_or_exists",
          detail: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // 3. Auto-verify any unverified users
    try {
      await prisma.user.updateMany({
        where: { emailVerified: false },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      });
    } catch {}

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, emailVerified: true },
    });

    return NextResponse.json({
      success: true,
      message: "Database schema migration executed successfully!",
      totalStatements: DDL_STATEMENTS.length + FOREIGN_KEYS.length,
      users,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Database migration failed",
      },
      { status: 500 }
    );
  }
}
