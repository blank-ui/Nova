import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { GET, POST } from "@/app/api/portal/projects/[id]/messages/route";
import * as authGuards from "@/lib/auth-guards";
import { vi } from "vitest";

try {
  process.loadEnvFile?.(".env");
} catch {}

/**
 * Real Database Integration Tests for Project Messaging (MySQL + Prisma).
 *
 * Safety requirements:
 * 1. Must only run when RUN_DB_INTEGRATION_TESTS === "true".
 * 2. Targets strictly local database (localhost/127.0.0.1) named 'nova'.
 * 3. Never writes to unknown or production databases.
 * 4. Only creates disposable test records and cleans them up in afterAll.
 */

function assertSafeDevDatabase() {
  if (process.env.RUN_DB_INTEGRATION_TESTS !== "true") {
    throw new Error("Database integration tests refused: RUN_DB_INTEGRATION_TESTS=true required.");
  }
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL is not set.");
  const url = new URL(dbUrl);
  const allowedHosts = ["localhost", "127.0.0.1", "::1"];
  if (!allowedHosts.includes(url.hostname)) {
    throw new Error(`Refusing to run integration test on non-local host: ${url.hostname}`);
  }
  const dbName = url.pathname.replace(/^\//, "");
  if (!dbName.toLowerCase().includes("nova")) {
    throw new Error(`Refusing to run integration test on non-nova database: ${dbName}`);
  }
}

describe("Project Messaging Real MySQL Integration Tests", () => {
  type SessionResult = Awaited<ReturnType<typeof authGuards.getCurrentSession>>;
  const runId = randomUUID().replace(/-/g, "").slice(0, 10);
  const trackedUserIds: string[] = [];
  const trackedProjectIds: string[] = [];
  const trackedMessageIds: string[] = [];
  const trackedAuditLogIds: string[] = [];

  let clientAUser: { id: string; email: string; name: string; role: string; twoFactorEnabled: boolean };
  let clientBUser: { id: string; email: string; name: string; role: string; twoFactorEnabled: boolean };
  let adminWithMfaUser: { id: string; email: string; name: string; role: string; twoFactorEnabled: boolean };
  let adminNoMfaUser: { id: string; email: string; name: string; role: string; twoFactorEnabled: boolean };

  let projectA: { id: string; name: string; clientId: string };
  let projectB: { id: string; name: string; clientId: string };

  beforeAll(async () => {
    assertSafeDevDatabase();

    // Create disposable users in MySQL
    clientAUser = await prisma.user.create({
      data: {
        email: `msg-client-a-${runId}@nova-integration.test`,
        name: "Client Alpha",
        role: "CLIENT",
        twoFactorEnabled: false,
      },
      select: { id: true, email: true, name: true, role: true, twoFactorEnabled: true },
    });
    trackedUserIds.push(clientAUser.id);

    clientBUser = await prisma.user.create({
      data: {
        email: `msg-client-b-${runId}@nova-integration.test`,
        name: "Client Beta",
        role: "CLIENT",
        twoFactorEnabled: false,
      },
      select: { id: true, email: true, name: true, role: true, twoFactorEnabled: true },
    });
    trackedUserIds.push(clientBUser.id);

    adminWithMfaUser = await prisma.user.create({
      data: {
        email: `msg-admin-mfa-${runId}@nova-integration.test`,
        name: "Admin MFA",
        role: "ADMIN",
        twoFactorEnabled: true,
      },
      select: { id: true, email: true, name: true, role: true, twoFactorEnabled: true },
    });
    trackedUserIds.push(adminWithMfaUser.id);

    adminNoMfaUser = await prisma.user.create({
      data: {
        email: `msg-admin-nomfa-${runId}@nova-integration.test`,
        name: "Admin No MFA",
        role: "ADMIN",
        twoFactorEnabled: false,
      },
      select: { id: true, email: true, name: true, role: true, twoFactorEnabled: true },
    });
    trackedUserIds.push(adminNoMfaUser.id);

    // Create disposable projects in MySQL
    projectA = await prisma.project.create({
      data: {
        name: `Project Alpha ${runId}`,
        clientId: clientAUser.id,
      },
      select: { id: true, name: true, clientId: true },
    });
    trackedProjectIds.push(projectA.id);

    projectB = await prisma.project.create({
      data: {
        name: `Project Beta ${runId}`,
        clientId: clientBUser.id,
      },
      select: { id: true, name: true, clientId: true },
    });
    trackedProjectIds.push(projectB.id);
  });

  afterAll(async () => {
    try {
      if (trackedAuditLogIds.length > 0) {
        await prisma.auditLog.deleteMany({ where: { id: { in: trackedAuditLogIds } } });
      }
      if (trackedMessageIds.length > 0) {
        await prisma.message.deleteMany({ where: { id: { in: trackedMessageIds } } });
      }
      if (trackedProjectIds.length > 0) {
        // Delete messages associated with projects in case any were missed
        await prisma.message.deleteMany({ where: { projectId: { in: trackedProjectIds } } });
        await prisma.project.deleteMany({ where: { id: { in: trackedProjectIds } } });
      }
      if (trackedUserIds.length > 0) {
        await prisma.user.deleteMany({ where: { id: { in: trackedUserIds } } });
      }
    } catch (cleanupErr) {
      console.error("Cleanup error in messages integration test:", cleanupErr);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects unauthenticated requests with 401", async () => {
    vi.spyOn(authGuards, "getCurrentSession").mockResolvedValueOnce(null as SessionResult);

    const req = new Request(`http://localhost:3000/api/portal/projects/${projectA.id}/messages`);
    const res = await GET(req, { params: Promise.resolve({ id: projectA.id }) });

    expect(res.status).toBe(401);
  });

  it("allows client owner to post and read messages in their own project", async () => {
    vi.spyOn(authGuards, "getCurrentSession").mockResolvedValue({
      user: clientAUser,
      session: { id: `sess-${runId}` },
    } as unknown as SessionResult);

    const postReq = new Request(`http://localhost:3000/api/portal/projects/${projectA.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "Hello Nova team, kickoff review looks great!" }),
    });

    const postRes = await POST(postReq, { params: Promise.resolve({ id: projectA.id }) });
    expect(postRes.status).toBe(201);
    const postJson = await postRes.json();
    expect(postJson.success).toBe(true);
    expect(postJson.message.body).toBe("Hello Nova team, kickoff review looks great!");
    expect(postJson.message.authorId).toBe(clientAUser.id);
    expect(postJson.message.author.name).toBe(clientAUser.name);
    trackedMessageIds.push(postJson.message.id);

    // Now test GET messages
    const getReq = new Request(`http://localhost:3000/api/portal/projects/${projectA.id}/messages`);
    const getRes = await GET(getReq, { params: Promise.resolve({ id: projectA.id }) });
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.data).toHaveLength(1);
    expect(getJson.data[0].id).toBe(postJson.message.id);
    expect(getJson.data[0].author.name).toBe("Client Alpha");
    expect(getJson.data[0].author.role).toBe("CLIENT");
  });

  it("strictly prevents Client B from reading Client A's messages (returns 404)", async () => {
    vi.spyOn(authGuards, "getCurrentSession").mockResolvedValue({
      user: clientBUser,
      session: { id: `sess-${runId}` },
    } as unknown as SessionResult);

    const getReq = new Request(`http://localhost:3000/api/portal/projects/${projectA.id}/messages`);
    const getRes = await GET(getReq, { params: Promise.resolve({ id: projectA.id }) });

    expect(getRes.status).toBe(404);
  });

  it("strictly prevents Client B from posting messages to Client A's project (returns 404)", async () => {
    vi.spyOn(authGuards, "getCurrentSession").mockResolvedValue({
      user: clientBUser,
      session: { id: `sess-${runId}` },
    } as unknown as SessionResult);

    const postReq = new Request(`http://localhost:3000/api/portal/projects/${projectA.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "Unauthorized intrusion attempt" }),
    });

    const postRes = await POST(postReq, { params: Promise.resolve({ id: projectA.id }) });

    expect(postRes.status).toBe(404);
  });

  it("denies admin without verified MFA from accessing or posting messages (returns 404)", async () => {
    vi.spyOn(authGuards, "getCurrentSession").mockResolvedValue({
      user: adminNoMfaUser,
      session: { id: `sess-${runId}` },
    } as unknown as SessionResult);

    const getReq = new Request(`http://localhost:3000/api/portal/projects/${projectA.id}/messages`);
    const getRes = await GET(getReq, { params: Promise.resolve({ id: projectA.id }) });
    expect(getRes.status).toBe(404);

    const postReq = new Request(`http://localhost:3000/api/portal/projects/${projectA.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "Unverified admin post attempt" }),
    });
    const postRes = await POST(postReq, { params: Promise.resolve({ id: projectA.id }) });
    expect(postRes.status).toBe(404);
  });

  it("allows admin with verified MFA to read and post messages, and writes an audit log", async () => {
    vi.spyOn(authGuards, "getCurrentSession").mockResolvedValue({
      user: adminWithMfaUser,
      session: { id: `sess-${runId}` },
    } as unknown as SessionResult);

    const postReq = new Request(`http://localhost:3000/api/portal/projects/${projectA.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "Milestone 1 is complete and ready for your sign-off." }),
    });

    const postRes = await POST(postReq, { params: Promise.resolve({ id: projectA.id }) });
    expect(postRes.status).toBe(201);
    const postJson = await postRes.json();
    trackedMessageIds.push(postJson.message.id);

    // Verify audit log creation for the admin message
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        actorId: adminWithMfaUser.id,
        action: "ADMIN_MESSAGE_POSTED",
        entityId: postJson.message.id,
      },
    });
    expect(auditLogs.length).toBeGreaterThanOrEqual(1);
    trackedAuditLogIds.push(...auditLogs.map((a) => a.id));

    // Verify reading chronological messages with both client and admin messages
    const getReq = new Request(`http://localhost:3000/api/portal/projects/${projectA.id}/messages`);
    const getRes = await GET(getReq, { params: Promise.resolve({ id: projectA.id }) });
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.data.length).toBeGreaterThanOrEqual(2);

    const adminMsg = getJson.data.find((m: { id: string }) => m.id === postJson.message.id);
    expect(adminMsg).toBeDefined();
    expect(adminMsg.author.role).toBe("ADMIN");
  });

  it("enforces server-side authorId and prevents sender impersonation", async () => {
    vi.spyOn(authGuards, "getCurrentSession").mockResolvedValue({
      user: clientAUser,
      session: { id: `sess-${runId}` },
    } as unknown as SessionResult);

    // Attempting to spoof authorId by passing it in payload
    const spoofReq = new Request(`http://localhost:3000/api/portal/projects/${projectA.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: "Attempting to forge author identity",
        authorId: adminWithMfaUser.id,
      }),
    });

    const spoofRes = await POST(spoofReq, { params: Promise.resolve({ id: projectA.id }) });
    expect(spoofRes.status).toBe(201);
    const spoofJson = await spoofRes.json();
    trackedMessageIds.push(spoofJson.message.id);

    // Verify in real database that authorId was set to clientAUser.id and not spoofed
    const dbMsg = await prisma.message.findUnique({
      where: { id: spoofJson.message.id },
    });
    expect(dbMsg).not.toBeNull();
    expect(dbMsg?.authorId).toBe(clientAUser.id);
  });

  it("enforces message rate limiting after 30 messages within 60s window", async () => {
    vi.spyOn(authGuards, "getCurrentSession").mockResolvedValue({
      user: clientBUser,
      session: { id: `sess-${runId}` },
    } as unknown as SessionResult);

    // Pre-populate user rate limit row in AuthRateLimit table to hit threshold
    const userRateKey = `msg:${clientBUser.id}`;
    await prisma.authRateLimit.upsert({
      where: { key: userRateKey },
      create: {
        key: userRateKey,
        count: 30,
        lastRequest: BigInt(Date.now()),
      },
      update: {
        count: 30,
        lastRequest: BigInt(Date.now()),
      },
    });

    const rateReq = new Request(`http://localhost:3000/api/portal/projects/${projectB.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "This message should be throttled by rate limit." }),
    });

    const rateRes = await POST(rateReq, { params: Promise.resolve({ id: projectB.id }) });
    expect(rateRes.status).toBe(429);
    const json = await rateRes.json();
    expect(json.error).toMatch(/too many messages/i);
    expect(rateRes.headers.get("Retry-After")).toBeDefined();
  });
});
