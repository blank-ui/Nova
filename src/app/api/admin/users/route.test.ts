import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      user: {
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
      project: {
        findMany: vi.fn(),
        deleteMany: vi.fn(),
      },
      milestone: {
        deleteMany: vi.fn(),
      },
      task: {
        deleteMany: vi.fn(),
      },
      message: {
        deleteMany: vi.fn(),
      },
      projectFile: {
        deleteMany: vi.fn(),
      },
      invoice: {
        deleteMany: vi.fn(),
      },
      bootstrapClaim: {
        deleteMany: vi.fn(),
      },
      userLoginHistory: {
        deleteMany: vi.fn(),
      },
      clientNote: {
        deleteMany: vi.fn(),
      },
      teamMessage: {
        deleteMany: vi.fn(),
      },
      appointment: {
        deleteMany: vi.fn(),
        updateMany: vi.fn(),
      },
      authTwoFactor: {
        deleteMany: vi.fn(),
      },
      authAccount: {
        deleteMany: vi.fn(),
      },
      authSession: {
        deleteMany: vi.fn(),
      },
      session: {
        deleteMany: vi.fn(),
      },
      auditLog: {
        updateMany: vi.fn(),
        create: vi.fn(),
      },
      $transaction: vi.fn(),
    },
  };
});

vi.mock("@/lib/auth-guards", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 10, resetAt: new Date() }),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { getCurrentSession } from "@/lib/auth-guards";
import { DELETE } from "./route";

describe("Admin Users API - DELETE /api/admin/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthorized users with 403", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(null as any);
    const req = new Request("http://localhost:3000/api/admin/users?id=target-1", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(403);
  });

  it("prevents self-deletion with 400", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN", name: "Super Admin" },
    } as any);

    const req = new Request("http://localhost:3000/api/admin/users?id=admin-1", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("You cannot delete your own administrative account");
  });

  it("performs atomic cascade cleanup and deletes user with associated projects", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN", name: "Super Admin" },
    } as any);

    mockPrisma.user.findUnique.mockResolvedValue({
      id: "client-target",
      email: "acme@example.com",
      role: "CLIENT",
      name: "Acme Global Technologies",
    });

    mockPrisma.project.findMany.mockResolvedValue([{ id: "project-1" }]);

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      return callback({
        project: {
          deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        milestone: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
        task: { deleteMany: vi.fn().mockResolvedValue({ count: 5 }) },
        message: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        projectFile: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        invoice: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
        bootstrapClaim: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        userLoginHistory: { deleteMany: vi.fn().mockResolvedValue({ count: 3 }) },
        clientNote: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        teamMessage: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        appointment: {
          deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
        authTwoFactor: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        authAccount: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
        authSession: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
        session: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        auditLog: {
          updateMany: vi.fn().mockResolvedValue({ count: 4 }),
          create: vi.fn().mockResolvedValue({ id: "audit-1" }),
        },
        user: {
          delete: vi.fn().mockResolvedValue({ id: "client-target" }),
        },
      });
    });

    const req = new Request("http://localhost:3000/api/admin/users?id=client-target", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });
});
