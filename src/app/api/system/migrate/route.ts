import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";

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
    \`paymentStatus\` VARCHAR(191) NOT NULL DEFAULT 'PAID',
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

  // 18. Appointment
  `CREATE TABLE IF NOT EXISTS \`Appointment\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`title\` VARCHAR(191) NOT NULL,
    \`description\` TEXT NULL,
    \`date\` DATETIME(3) NOT NULL,
    \`duration\` INTEGER NOT NULL DEFAULT 30,
    \`status\` VARCHAR(191) NOT NULL DEFAULT 'REQUESTED',
    \`meetingLink\` VARCHAR(191) NULL,
    \`notes\` TEXT NULL,
    \`requestedById\` VARCHAR(191) NOT NULL,
    \`assignedStaffId\` VARCHAR(191) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    INDEX \`Appointment_status_date_idx\`(\`status\`, \`date\`),
    INDEX \`Appointment_requestedById_idx\`(\`requestedById\`),
    INDEX \`Appointment_assignedStaffId_idx\`(\`assignedStaffId\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 19. Invoice
  `CREATE TABLE IF NOT EXISTS \`Invoice\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`invoiceNumber\` VARCHAR(191) NOT NULL,
    \`projectId\` VARCHAR(191) NOT NULL,
    \`clientId\` VARCHAR(191) NOT NULL,
    \`amount\` DOUBLE NOT NULL DEFAULT 12500.00,
    \`currency\` VARCHAR(191) NOT NULL DEFAULT 'USD',
    \`status\` VARCHAR(191) NOT NULL DEFAULT 'PAID',
    \`dueDate\` DATETIME(3) NULL,
    \`issuedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`paidAt\` DATETIME(3) NULL,
    \`sentAt\` DATETIME(3) NULL,
    \`sentToEmail\` VARCHAR(191) NULL,
    \`items\` JSON NULL,
    \`notes\` TEXT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    UNIQUE INDEX \`Invoice_invoiceNumber_key\`(\`invoiceNumber\`),
    INDEX \`Invoice_projectId_idx\`(\`projectId\`),
    INDEX \`Invoice_clientId_idx\`(\`clientId\`),
    INDEX \`Invoice_status_idx\`(\`status\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 20. TeamMessage
  `CREATE TABLE IF NOT EXISTS \`TeamMessage\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`senderId\` VARCHAR(191) NOT NULL,
    \`recipientId\` VARCHAR(191) NULL,
    \`channel\` VARCHAR(191) NULL DEFAULT 'general',
    \`body\` TEXT NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX \`TeamMessage_senderId_recipientId_createdAt_idx\`(\`senderId\`, \`recipientId\`, \`createdAt\`),
    INDEX \`TeamMessage_channel_createdAt_idx\`(\`channel\`, \`createdAt\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 21. StudioChannel
  `CREATE TABLE IF NOT EXISTS \`StudioChannel\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`slug\` VARCHAR(191) NOT NULL,
    \`name\` VARCHAR(191) NOT NULL,
    \`description\` TEXT NULL,
    \`icon\` VARCHAR(50) NULL DEFAULT 'Hash',
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX \`StudioChannel_slug_key\`(\`slug\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 22. ChannelMember
  `CREATE TABLE IF NOT EXISTS \`ChannelMember\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`channelId\` VARCHAR(191) NOT NULL,
    \`userId\` VARCHAR(191) NOT NULL,
    \`role\` VARCHAR(50) NULL DEFAULT 'MEMBER',
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX \`ChannelMember_channelId_userId_key\`(\`channelId\`, \`userId\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // 23. ProjectMember
  `CREATE TABLE IF NOT EXISTS \`ProjectMember\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`projectId\` VARCHAR(191) NOT NULL,
    \`userId\` VARCHAR(191) NOT NULL,
    \`role\` VARCHAR(50) NULL DEFAULT 'COLLABORATOR',
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX \`ProjectMember_projectId_userId_key\`(\`projectId\`, \`userId\`),
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

const COLUMN_MIGRATIONS = [
  // User columns
  "ALTER TABLE `User` ADD COLUMN `phone` VARCHAR(191) NULL",
  "ALTER TABLE `User` ADD COLUMN `dateOfBirth` VARCHAR(191) NULL",
  "ALTER TABLE `User` ADD COLUMN `discordHandle` VARCHAR(191) NULL",
  "ALTER TABLE `User` ADD COLUMN `discordId` VARCHAR(191) NULL",
  "ALTER TABLE `User` ADD COLUMN `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false",
  "ALTER TABLE `User` ADD COLUMN `banned` BOOLEAN NOT NULL DEFAULT false",
  "ALTER TABLE `User` ADD COLUMN `banReason` VARCHAR(191) NULL",
  "ALTER TABLE `User` ADD COLUMN `banExpires` DATETIME(3) NULL",
  "ALTER TABLE `User` ADD COLUMN `emailVerifiedAt` DATETIME(3) NULL",
  "ALTER TABLE `User` ADD COLUMN `passwordHash` VARCHAR(191) NULL",
  "ALTER TABLE `User` ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'CLIENT'",

  // Inquiry columns
  "ALTER TABLE `Inquiry` ADD COLUMN `phone` VARCHAR(191) NULL",
  "ALTER TABLE `Inquiry` ADD COLUMN `dateOfBirth` VARCHAR(191) NULL",
  "ALTER TABLE `Inquiry` ADD COLUMN `company` VARCHAR(191) NULL",
  "ALTER TABLE `Inquiry` ADD COLUMN `budget` VARCHAR(191) NULL",
  "ALTER TABLE `Inquiry` ADD COLUMN `referenceUrl` TEXT NULL",
  "ALTER TABLE `Inquiry` ADD COLUMN `referenceImage` TEXT NULL",
  "ALTER TABLE `Inquiry` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'NEW'",

  // AuthAccount columns
  "ALTER TABLE `AuthAccount` ADD COLUMN `password` TEXT NULL",
  "ALTER TABLE `AuthAccount` ADD COLUMN `scope` VARCHAR(191) NULL",
  "ALTER TABLE `AuthAccount` ADD COLUMN `idToken` TEXT NULL",
  "ALTER TABLE `AuthAccount` ADD COLUMN `accessToken` TEXT NULL",
  "ALTER TABLE `AuthAccount` ADD COLUMN `refreshToken` TEXT NULL",
  "ALTER TABLE `AuthAccount` ADD COLUMN `accessTokenExpiresAt` DATETIME(3) NULL",
  "ALTER TABLE `AuthAccount` ADD COLUMN `refreshTokenExpiresAt` DATETIME(3) NULL",

  // AuthSession columns
  "ALTER TABLE `AuthSession` ADD COLUMN `ipAddress` VARCHAR(191) NULL",
  "ALTER TABLE `AuthSession` ADD COLUMN `userAgent` TEXT NULL",
  "ALTER TABLE `AuthSession` ADD COLUMN `impersonatedBy` VARCHAR(191) NULL",

  // Appointment columns
  "ALTER TABLE `Appointment` ADD COLUMN `duration` INT NOT NULL DEFAULT 30",
  "ALTER TABLE `Appointment` ADD COLUMN `meetingLink` VARCHAR(191) NULL",
  "ALTER TABLE `Appointment` ADD COLUMN `notes` TEXT NULL",
  "ALTER TABLE `Appointment` ADD COLUMN `assignedStaffId` VARCHAR(191) NULL",

  // Project columns
  "ALTER TABLE `Project` ADD COLUMN `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'PAID'",
  "ALTER TABLE `Project` ADD COLUMN `description` TEXT NULL",

  // Invoice columns
  "ALTER TABLE `Invoice` ADD COLUMN `notes` TEXT NULL",
  "ALTER TABLE `Invoice` ADD COLUMN `items` JSON NULL",
  "ALTER TABLE `Invoice` ADD COLUMN `sentToEmail` VARCHAR(191) NULL",
  "ALTER TABLE `Invoice` ADD COLUMN `sentAt` DATETIME(3) NULL",
  "ALTER TABLE `Invoice` ADD COLUMN `paidAt` DATETIME(3) NULL",
  "ALTER TABLE `Invoice` ADD COLUMN `dueDate` DATETIME(3) NULL",

  // TeamMessage columns
  "ALTER TABLE `TeamMessage` ADD COLUMN `channel` VARCHAR(191) NULL DEFAULT 'general'",
  "ALTER TABLE `TeamMessage` ADD COLUMN `recipientId` VARCHAR(191) NULL",
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET;

  if (!expectedSecret || !secret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized: Invalid or unconfigured secret" }, { status: 401 });
  }

  const rawDbUrl = process.env.DATABASE_URL || "";
  const maskedDbUrl = rawDbUrl.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");

  const results: Array<{ step: number | string; status: string; detail?: string }> = [];

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

    // 2. Add missing columns to existing tables (ignoring if column already exists)
    for (let i = 0; i < COLUMN_MIGRATIONS.length; i++) {
      const colStmt = COLUMN_MIGRATIONS[i];
      try {
        await prisma.$executeRawUnsafe(colStmt);
        results.push({ step: `col_${i + 1}`, status: "column_added" });
      } catch (err) {
        // Ignored if column already exists (Duplicate column name)
        results.push({
          step: `col_${i + 1}`,
          status: "column_skipped_or_exists",
          detail: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // 3. Add foreign keys (ignore if already exists)
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

    // 4. Auto-verify any unverified users
    try {
      await prisma.user.updateMany({
        where: { emailVerified: false },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      });
    } catch {}

    // 4. Ensure admin user kbipul792@gmail.com exists with password Bipul@1008
    const adminEmail = "kbipul792@gmail.com";
    const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || "Bipul@1008";
    const hashedPassword = await hashPassword(adminPassword);

    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (adminUser) {
      adminUser = await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          role: "ADMIN",
          emailVerified: true,
          emailVerifiedAt: new Date(),
          banned: false,
        },
      });

      await prisma.authAccount.upsert({
        where: {
          providerId_accountId: {
            providerId: "credential",
            accountId: adminUser.id,
          },
        },
        update: {
          password: hashedPassword,
        },
        create: {
          accountId: adminUser.id,
          providerId: "credential",
          userId: adminUser.id,
          password: hashedPassword,
        },
      });
    } else {
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: "Bipul (Admin)",
          role: "ADMIN",
          emailVerified: true,
          emailVerifiedAt: new Date(),
          banned: false,
        },
      });

      await prisma.authAccount.create({
        data: {
          accountId: adminUser.id,
          providerId: "credential",
          userId: adminUser.id,
          password: hashedPassword,
        },
      });
    }

    // 5. Ensure default Studio Channels exist
    try {
      await prisma.$executeRawUnsafe(`
        INSERT IGNORE INTO StudioChannel (id, slug, name, description, icon) VALUES
        ('sc-gen', 'general', 'general-studio', 'Studio-wide announcements, syncs, and team collaboration', 'Hash'),
        ('sc-eng', 'engineering', 'engineering-sprint', 'Technical architecture, sprint tasks, code reviews, and deployments', 'Terminal'),
        ('sc-fin', 'finance', 'finance-billing', 'Commercial scopes, invoicing, milestone valuations, and client budgets', 'DollarSign')
      `);
    } catch {}

    // 6. Ensure initial welcome message in general channel
    try {
      const msgCount = await prisma.teamMessage.count({
        where: { channel: "general" },
      });
      if (msgCount === 0 && adminUser) {
        await prisma.teamMessage.create({
          data: {
            senderId: adminUser.id,
            channel: "general",
            body: "Welcome to Nova Studio Discussions! Collaborate on engineering sprints, commercial scopes, and announcements here.",
          },
        });
      }
    } catch {}

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, emailVerified: true },
    });

    let projectColumns: any[] = [];
    try {
      projectColumns = await prisma.$queryRawUnsafe(`DESCRIBE \`Project\``);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Database schema migration executed and admin provisioned successfully!",
      databaseUrl: maskedDbUrl,
      totalStatements: DDL_STATEMENTS.length + FOREIGN_KEYS.length,
      users,
      projectColumns,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        databaseUrl: maskedDbUrl,
        error: error instanceof Error ? error.message : "Database migration failed",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
