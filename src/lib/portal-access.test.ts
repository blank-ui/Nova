import { describe, expect, it, vi, beforeEach } from "vitest";
import { getAuthorizedProject } from "./project-access";
import { prisma } from "./prisma";
import * as authGuards from "./auth-guards";

// Note: These tests use mocked session and mocked Prisma operations to verify
// authorization rules and client scoping in isolation. They are NOT run against
// a live database or real external services.

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth-guards", () => ({
  getCurrentSession: vi.fn(),
}));

describe("Client Portal Project Authorization (Mocked Unit Tests)", () => {
  type SessionResult = Awaited<ReturnType<typeof authGuards.getCurrentSession>>;

  const clientAUser = {
    id: "cclient11111111111111111",
    role: "CLIENT",
    twoFactorEnabled: false,
    name: "Client Alpha",
    email: "alpha@client.test",
  };

  const clientBUser = {
    id: "cclient22222222222222222",
    role: "CLIENT",
    twoFactorEnabled: false,
    name: "Client Beta",
    email: "beta@client.test",
  };

  const adminWithMfaUser = {
    id: "cadmin999999999999999999",
    role: "ADMIN",
    twoFactorEnabled: true,
    name: "Admin User",
    email: "admin@nova.test",
  };

  const adminWithoutMfaUser = {
    id: "cadmin888888888888888888",
    role: "ADMIN",
    twoFactorEnabled: false,
    name: "Admin No MFA",
    email: "admin-nomfa@nova.test",
  };

  const sampleProjectA = {
    id: "cproject11111111111111111",
    name: "Alpha Web Application",
    description: "Next.js platform for Client Alpha",
    status: "IN_PROGRESS",
    clientId: clientAUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    milestones: [
      { id: "cmilestone111111111111111", projectId: "cproject11111111111111111", title: "Design Sprint", dueAt: new Date(), completedAt: new Date() },
    ],
    tasks: [
      { id: "ctask1111111111111111111", projectId: "cproject11111111111111111", title: "Setup Repo", dueAt: new Date(), completedAt: new Date() },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when unauthenticated", async () => {
    vi.mocked(authGuards.getCurrentSession).mockResolvedValue(null as SessionResult);

    const project = await getAuthorizedProject(sampleProjectA.id);

    expect(project).toBeNull();
    expect(prisma.project.findFirst).not.toHaveBeenCalled();
    expect(prisma.project.findUnique).not.toHaveBeenCalled();
  });

  it("allows client owner to access their own project", async () => {
    vi.mocked(authGuards.getCurrentSession).mockResolvedValue({
      user: clientAUser,
      session: { id: "sess-a" },
    } as unknown as SessionResult);

    vi.mocked(prisma.project.findFirst).mockResolvedValue(sampleProjectA as unknown as Awaited<ReturnType<typeof prisma.project.findFirst>>);

    const project = await getAuthorizedProject(sampleProjectA.id);

    expect(project).not.toBeNull();
    expect(project?.id).toBe(sampleProjectA.id);
    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: { id: sampleProjectA.id, clientId: clientAUser.id },
      include: { milestones: true, tasks: true },
    });
  });

  it("denies access when Client B requests Client A's project (scoping enforcement)", async () => {
    vi.mocked(authGuards.getCurrentSession).mockResolvedValue({
      user: clientBUser,
      session: { id: "sess-b" },
    } as unknown as SessionResult);

    // prisma query returns null because clientId does not match clientB
    vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

    const project = await getAuthorizedProject(sampleProjectA.id);

    expect(project).toBeNull();
    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: { id: sampleProjectA.id, clientId: clientBUser.id },
      include: { milestones: true, tasks: true },
    });
  });

  it("returns null when project does not exist", async () => {
    vi.mocked(authGuards.getCurrentSession).mockResolvedValue({
      user: clientAUser,
      session: { id: "sess-a" },
    } as unknown as SessionResult);

    vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

    const project = await getAuthorizedProject("cnonexistentproject11111");

    expect(project).toBeNull();
  });

  it("allows admin with verified MFA to view any project", async () => {
    vi.mocked(authGuards.getCurrentSession).mockResolvedValue({
      user: adminWithMfaUser,
      session: { id: "sess-admin" },
    } as unknown as SessionResult);

    vi.mocked(prisma.project.findUnique).mockResolvedValue(sampleProjectA as unknown as Awaited<ReturnType<typeof prisma.project.findUnique>>);

    const project = await getAuthorizedProject(sampleProjectA.id);

    expect(project).not.toBeNull();
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: { id: sampleProjectA.id },
      include: { milestones: true, tasks: true },
    });
  });

  it("allows admin without MFA to view any project", async () => {
    vi.mocked(authGuards.getCurrentSession).mockResolvedValue({
      user: adminWithoutMfaUser,
      session: { id: "sess-admin-nomfa" },
    } as unknown as SessionResult);

    vi.mocked(prisma.project.findUnique).mockResolvedValue(sampleProjectA as unknown as Awaited<ReturnType<typeof prisma.project.findUnique>>);

    const project = await getAuthorizedProject(sampleProjectA.id);

    expect(project).toEqual(sampleProjectA);
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: { id: sampleProjectA.id },
      include: { milestones: true, tasks: true },
    });
  });

  it("rejects malformed project IDs without querying the database", async () => {
    vi.mocked(authGuards.getCurrentSession).mockResolvedValue({
      user: clientAUser,
      session: { id: "sess-a" },
    } as unknown as SessionResult);

    const malformedIds = [
      "invalid-id",
      "../traversal",
      "123",
      "<script>alert(1)</script>",
      "c123", // too short to be 25-char cuid
    ];

    for (const badId of malformedIds) {
      const project = await getAuthorizedProject(badId);
      expect(project).toBeNull();
    }

    expect(prisma.project.findFirst).not.toHaveBeenCalled();
    expect(prisma.project.findUnique).not.toHaveBeenCalled();
  });

  it("rejects empty or whitespace-only project IDs", async () => {
    vi.mocked(authGuards.getCurrentSession).mockResolvedValue({
      user: clientAUser,
      session: { id: "sess-a" },
    } as unknown as SessionResult);

    expect(await getAuthorizedProject("")).toBeNull();
    expect(prisma.project.findFirst).not.toHaveBeenCalled();
  });

  it("ensures Client B cannot access Client A milestones or tasks through project scoping", async () => {
    // When Client B asks for Project A, getAuthorizedProject scopes query with clientId: clientB.id
    vi.mocked(authGuards.getCurrentSession).mockResolvedValue({
      user: clientBUser,
      session: { id: "sess-b" },
    } as unknown as SessionResult);

    vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

    const result = await getAuthorizedProject(sampleProjectA.id);
    expect(result).toBeNull();
    // Verify Client A's milestones and tasks were NOT returned
    expect(result?.milestones).toBeUndefined();
    expect(result?.tasks).toBeUndefined();
  });

  it("handles database errors gracefully and bubbles as standard promise rejection", async () => {
    vi.mocked(authGuards.getCurrentSession).mockResolvedValue({
      user: clientAUser,
      session: { id: "sess-a" },
    } as unknown as SessionResult);

    vi.mocked(prisma.project.findFirst).mockRejectedValue(new Error("Database connection timeout"));

    await expect(getAuthorizedProject(sampleProjectA.id)).rejects.toThrow("Database connection timeout");
  });
});
