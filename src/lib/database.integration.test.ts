import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";

try {
  process.loadEnvFile?.(".env");
} catch {}

/**
 * Real Database Integration Tests (MySQL + Prisma).
 *
 * Safety requirements:
 * 1. Must only run when RUN_DB_INTEGRATION_TESTS === "true".
 * 2. Must only target local database (localhost/127.0.0.1) containing 'nova'.
 * 3. Never writes to unknown or production databases.
 * 4. Only creates disposable test records and cleans them up in afterAll.
 */

function assertSafeDevDatabase() {
  if (process.env.RUN_DB_INTEGRATION_TESTS !== "true") {
    throw new Error("Database integration tests refused: RUN_DB_INTEGRATION_TESTS=true environment variable required.");
  }
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not set.");
  }
  const url = new URL(dbUrl);
  const allowedHosts = ["localhost", "127.0.0.1", "::1"];
  if (!allowedHosts.includes(url.hostname)) {
    throw new Error(`Refusing to run integration test on non-local database host: ${url.hostname}`);
  }
  const dbName = url.pathname.replace(/^\//, "");
  if (!dbName.toLowerCase().includes("nova")) {
    throw new Error(`Refusing to run integration test on non-nova database: ${dbName}`);
  }
}

describe("MySQL + Prisma Real Database Integration Tests", () => {
  const runId = randomUUID().replace(/-/g, "").slice(0, 12);
  const trackedUserIds: string[] = [];
  const trackedProjectIds: string[] = [];
  const trackedInquiryIds: string[] = [];
  const trackedAuditLogIds: string[] = [];

  beforeAll(() => {
    assertSafeDevDatabase();
  });

  afterAll(async () => {
    // Clean up strictly the records created by this test run in reverse dependency order
    try {
      if (trackedAuditLogIds.length > 0) {
        await prisma.auditLog.deleteMany({ where: { id: { in: trackedAuditLogIds } } });
      }
      if (trackedInquiryIds.length > 0) {
        await prisma.inquiry.deleteMany({ where: { id: { in: trackedInquiryIds } } });
      }
      if (trackedProjectIds.length > 0) {
        await prisma.task.deleteMany({ where: { projectId: { in: trackedProjectIds } } });
        await prisma.milestone.deleteMany({ where: { projectId: { in: trackedProjectIds } } });
        await prisma.project.deleteMany({ where: { id: { in: trackedProjectIds } } });
      }
      if (trackedUserIds.length > 0) {
        await prisma.user.deleteMany({ where: { id: { in: trackedUserIds } } });
      }
    } catch (cleanupErr) {
      console.error("Cleanup error in integration test:", cleanupErr instanceof Error ? cleanupErr.message : cleanupErr);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("verifies safety guard refuses execution when environment variable is unset", () => {
    const original = process.env.RUN_DB_INTEGRATION_TESTS;
    try {
      delete process.env.RUN_DB_INTEGRATION_TESTS;
      expect(() => assertSafeDevDatabase()).toThrow("RUN_DB_INTEGRATION_TESTS=true");
    } finally {
      process.env.RUN_DB_INTEGRATION_TESTS = original;
    }
  });

  it("creates and retrieves a real user record in MySQL", async () => {
    const testEmail = `test-user-${runId}@nova-dev.test`;
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: `Integration Test User ${runId}`,
        role: "CLIENT",
        emailVerified: true,
      },
    });
    trackedUserIds.push(user.id);

    expect(user.id).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.role).toBe("CLIENT");

    const fetched = await prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(fetched).not.toBeNull();
    expect(fetched?.email).toBe(testEmail);
  });

  it("persists a project with relational milestones and tasks and enforces ownership scoping", async () => {
    // Create Client A and Client B
    const clientA = await prisma.user.create({
      data: {
        email: `client-a-${runId}@nova-dev.test`,
        name: `Client Alpha ${runId}`,
        role: "CLIENT",
      },
    });
    trackedUserIds.push(clientA.id);

    const clientB = await prisma.user.create({
      data: {
        email: `client-b-${runId}@nova-dev.test`,
        name: `Client Beta ${runId}`,
        role: "CLIENT",
      },
    });
    trackedUserIds.push(clientB.id);

    // Create Project owned by Client A
    const projectA = await prisma.project.create({
      data: {
        name: `Alpha Initiative ${runId}`,
        description: "Integration test project for client scoping",
        status: "IN_PROGRESS",
        clientId: clientA.id,
        milestones: {
          create: [
            { title: "Sprint 1 Architecture", dueAt: new Date() },
            { title: "Sprint 2 Implementation", dueAt: new Date() },
          ],
        },
        tasks: {
          create: [
            { title: "Design DB Schema" },
            { title: "Verify Migration Deployment" },
          ],
        },
      },
      include: {
        milestones: true,
        tasks: true,
      },
    });
    trackedProjectIds.push(projectA.id);

    expect(projectA.milestones.length).toBe(2);
    expect(projectA.tasks.length).toBe(2);

    // Client A queries their own project: MUST succeed
    const readByClientA = await prisma.project.findFirst({
      where: { id: projectA.id, clientId: clientA.id },
      include: { milestones: true, tasks: true },
    });
    expect(readByClientA).not.toBeNull();
    expect(readByClientA?.name).toBe(`Alpha Initiative ${runId}`);
    expect(readByClientA?.milestones.length).toBe(2);

    // Client B attempts to query Client A's project: MUST return null
    const readByClientB = await prisma.project.findFirst({
      where: { id: projectA.id, clientId: clientB.id },
      include: { milestones: true, tasks: true },
    });
    expect(readByClientB).toBeNull();
  });

  it("handles inquiry status updates and audit logging inside an atomic transaction", async () => {
    // Create an admin actor
    const admin = await prisma.user.create({
      data: {
        email: `admin-actor-${runId}@nova-dev.test`,
        name: `Admin Actor ${runId}`,
        role: "ADMIN",
        twoFactorEnabled: true,
      },
    });
    trackedUserIds.push(admin.id);

    // Create a disposable inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        name: `Lead Prospect ${runId}`,
        email: `prospect-${runId}@example.test`,
        service: "Web Platform",
        message: "We need an enterprise platform.",
        status: "NEW",
      },
    });
    trackedInquiryIds.push(inquiry.id);

    // Execute atomic update + audit log transaction
    const [updatedInquiry, auditLog] = await prisma.$transaction([
      prisma.inquiry.update({
        where: { id: inquiry.id },
        data: { status: "QUALIFIED" },
      }),
      prisma.auditLog.create({
        data: {
          actorId: admin.id,
          action: "UPDATE",
          entityType: "Inquiry",
          entityId: inquiry.id,
          metadata: { field: "status", previous: "NEW", new: "QUALIFIED" },
        },
      }),
    ]);
    trackedAuditLogIds.push(auditLog.id);

    expect(updatedInquiry.status).toBe("QUALIFIED");
    expect(auditLog.entityId).toBe(inquiry.id);
    expect(auditLog.actorId).toBe(admin.id);

    // Verify transaction rollback if an operation fails
    await expect(
      prisma.$transaction([
        prisma.inquiry.update({
          where: { id: inquiry.id },
          data: { status: "CLOSED" },
        }),
        // Deliberately trigger a foreign key violation or bad ID
        prisma.auditLog.create({
          data: {
            actorId: "nonexistent-user-id-999999",
            action: "UPDATE",
            entityType: "Inquiry",
            entityId: inquiry.id,
          },
        }),
      ])
    ).rejects.toThrow();

    // Verify status was NOT updated to CLOSED due to atomic rollback
    const inquiryAfterRollback = await prisma.inquiry.findUnique({
      where: { id: inquiry.id },
    });
    expect(inquiryAfterRollback?.status).toBe("QUALIFIED");
  });

  it("safely handles query for nonexistent IDs without throwing or leaking errors", async () => {
    const result = await prisma.project.findUnique({
      where: { id: "cnonexistentid123456789012" },
    });
    expect(result).toBeNull();
  });
});
