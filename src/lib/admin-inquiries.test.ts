import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET, PATCH } from "../app/api/admin/inquiries/route";
import { prisma } from "./prisma";
import * as authGuards from "./auth-guards";

// Note: These tests use mocked session and mocked Prisma operations to verify
// route handler behavior and authorization in isolation. They are NOT run against
// a live database or real external services.

vi.mock("@/lib/prisma", () => ({
  prisma: {
    inquiry: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth-guards", () => ({
  getCurrentSession: vi.fn(),
}));

describe("Admin Inquiries API (Mocked Unit Tests)", () => {
  const validAdminSession = {
    user: {
      id: "cadmin123456789012345678",
      role: "ADMIN",
      twoFactorEnabled: true,
      name: "Admin User",
      email: "admin@nova.test",
    },
    session: { id: "sess123" },
  };

  const adminWithoutMfaSession = {
    user: {
      id: "cadmin123456789012345678",
      role: "ADMIN",
      twoFactorEnabled: false,
      name: "Admin User",
      email: "admin@nova.test",
    },
    session: { id: "sess123" },
  };

  const clientSession = {
    user: {
      id: "cclient12345678901234567",
      role: "CLIENT",
      twoFactorEnabled: true,
      name: "Client User",
      email: "client@nova.test",
    },
    session: { id: "sess456" },
  };

  type SessionResult = Awaited<ReturnType<typeof authGuards.getCurrentSession>>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/admin/inquiries", () => {
    it("returns 403 when unauthenticated", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(null as SessionResult);

      const request = new Request("http://localhost:3000/api/admin/inquiries");
      const response = await GET(request);

      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json.error).toBe("Unauthorized");
      expect(prisma.inquiry.findMany).not.toHaveBeenCalled();
    });

    it("returns 403 when authenticated as a non-admin client", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(clientSession as unknown as SessionResult);

      const request = new Request("http://localhost:3000/api/admin/inquiries");
      const response = await GET(request);

      expect(response.status).toBe(403);
      expect(prisma.inquiry.findMany).not.toHaveBeenCalled();
    });

    it("allows admin without MFA enabled to access inquiries", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(adminWithoutMfaSession as unknown as SessionResult);
      vi.mocked(prisma.inquiry.findMany).mockResolvedValueOnce([]);

      const request = new Request("http://localhost:3000/api/admin/inquiries");
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.inquiry.findMany).toHaveBeenCalled();
    });

    it("returns 400 for invalid status filter", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(validAdminSession as unknown as SessionResult);

      const request = new Request("http://localhost:3000/api/admin/inquiries?status=INVALID_STATUS");
      const response = await GET(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Invalid status filter");
      expect(prisma.inquiry.findMany).not.toHaveBeenCalled();
    });

    it("returns 400 for invalid sort parameter", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(validAdminSession as unknown as SessionResult);

      const request = new Request("http://localhost:3000/api/admin/inquiries?sort=drop_database");
      const response = await GET(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Invalid sort parameter");
      expect(prisma.inquiry.findMany).not.toHaveBeenCalled();
    });

    it("returns 400 for invalid cursor format", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(validAdminSession as unknown as SessionResult);

      const request = new Request("http://localhost:3000/api/admin/inquiries?cursor=not-a-cuid");
      const response = await GET(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Invalid cursor");
      expect(prisma.inquiry.findMany).not.toHaveBeenCalled();
    });

    it("returns 500 when database operation throws an error", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(validAdminSession as unknown as SessionResult);
      vi.mocked(prisma.inquiry.findMany).mockRejectedValue(new Error("DB connection lost"));

      const request = new Request("http://localhost:3000/api/admin/inquiries");
      const response = await GET(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Internal server error");
    });

    it("clamps limit properly when negative, zero, or excessively large", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(validAdminSession as unknown as SessionResult);
      vi.mocked(prisma.inquiry.findMany).mockResolvedValue([]);

      // Test negative limit -> clamps to 1
      const reqNeg = new Request("http://localhost:3000/api/admin/inquiries?limit=-10");
      await GET(reqNeg);
      expect(prisma.inquiry.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({ take: 2 }) // limit(1) + 1
      );

      // Test zero limit -> clamps to 1
      const reqZero = new Request("http://localhost:3000/api/admin/inquiries?limit=0");
      await GET(reqZero);
      expect(prisma.inquiry.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({ take: 2 }) // limit(1) + 1
      );

      // Test excessively large limit -> clamps to 100
      const reqLarge = new Request("http://localhost:3000/api/admin/inquiries?limit=500");
      await GET(reqLarge);
      expect(prisma.inquiry.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({ take: 101 }) // limit(100) + 1
      );
    });

    it("returns inquiry list and nextCursor for authorized admin with MFA", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(validAdminSession as unknown as SessionResult);
      const mockInquiries = [
        { id: "c123456789012345678901234", name: "Client A", email: "a@test.com", status: "NEW", createdAt: new Date() },
        { id: "c123456789012345678901235", name: "Client B", email: "b@test.com", status: "CONTACTED", createdAt: new Date() },
      ];
      vi.mocked(prisma.inquiry.findMany).mockResolvedValue(mockInquiries as unknown as Awaited<ReturnType<typeof prisma.inquiry.findMany>>);

      const request = new Request("http://localhost:3000/api/admin/inquiries?limit=2");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toHaveLength(2);
      expect(json.nextCursor).toBeNull();
    });
  });

  describe("PATCH /api/admin/inquiries", () => {
    const validCuid = "c123456789012345678901234";

    it("returns 403 when unauthenticated", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(null as SessionResult);

      const request = new Request("http://localhost:3000/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: validCuid, status: "QUALIFIED" }),
      });
      const response = await PATCH(request);

      expect(response.status).toBe(403);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("returns 403 when non-admin calls PATCH", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(clientSession as unknown as SessionResult);

      const request = new Request("http://localhost:3000/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: validCuid, status: "QUALIFIED" }),
      });
      const response = await PATCH(request);

      expect(response.status).toBe(403);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("returns 400 for malformed JSON body", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(validAdminSession as unknown as SessionResult);

      const request = new Request("http://localhost:3000/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json-content{",
      });
      const response = await PATCH(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Invalid JSON");
    });

    it("returns 400 when id is missing or not a string", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(validAdminSession as unknown as SessionResult);

      const request = new Request("http://localhost:3000/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "QUALIFIED" }),
      });
      const response = await PATCH(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Missing or invalid id");
    });

    it("returns 400 for invalid status value", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(validAdminSession as unknown as SessionResult);

      const request = new Request("http://localhost:3000/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: validCuid, status: "HACKED_STATUS" }),
      });
      const response = await PATCH(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Invalid status");
    });

    it("returns 400 for invalid cuid id format", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(validAdminSession as unknown as SessionResult);

      const request = new Request("http://localhost:3000/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "invalid-id", status: "QUALIFIED" }),
      });
      const response = await PATCH(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Invalid inquiry id");
    });

    it("returns 413 for oversized payload", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(validAdminSession as unknown as SessionResult);

      const request = new Request("http://localhost:3000/api/admin/inquiries", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": "2048",
        },
        body: JSON.stringify({ id: validCuid, status: "QUALIFIED" }),
      });
      const response = await PATCH(request);

      expect(response.status).toBe(413);
      const json = await response.json();
      expect(json.error).toBe("Payload too large");
    });

    it("successfully updates inquiry status and generates audit log in transaction", async () => {
      vi.mocked(authGuards.getCurrentSession).mockResolvedValue(validAdminSession as unknown as SessionResult);

      const updatedRecord = {
        id: validCuid,
        status: "QUALIFIED",
        name: "Test Client",
        email: "client@test.com",
      };

      vi.mocked(prisma.$transaction).mockResolvedValue([updatedRecord, {}] as unknown as Awaited<ReturnType<typeof prisma.$transaction>>);

      const request = new Request("http://localhost:3000/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: validCuid, status: "QUALIFIED" }),
      });
      const response = await PATCH(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.inquiry.status).toBe("QUALIFIED");
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
