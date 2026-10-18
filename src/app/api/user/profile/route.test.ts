import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "./route";

vi.mock("@/lib/auth-guards", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 10, resetAt: new Date() }),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { getCurrentSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

describe("User Profile API (/api/user/profile)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/user/profile", () => {
    it("rejects unauthenticated requests", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null as any);
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it("returns profile for authenticated user", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "user-1", email: "user@nova.test" },
      } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        name: "Nova User",
        email: "user@nova.test",
        role: "CLIENT",
        phone: "+91 98765 43210",
        dateOfBirth: "1995-05-12",
        image: null,
        twoFactorEnabled: false,
      } as any);

      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.name).toBe("Nova User");
      expect(data.user.phone).toBe("+91 98765 43210");
      expect(data.user.dateOfBirth).toBe("1995-05-12");
    });
  });

  describe("PATCH /api/user/profile", () => {
    it("updates name, phone, and dateOfBirth", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "user-1", email: "user@nova.test" },
      } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({
        id: "user-1",
        name: "Updated Name",
        phone: "+1 555 123 4567",
        dateOfBirth: "1992-08-20",
        email: "user@nova.test",
        role: "CLIENT",
        image: null,
      } as any);

      const req = new Request("http://localhost:3000/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: "Updated Name",
          phone: "+1 555 123 4567",
          dateOfBirth: "1992-08-20",
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.user.name).toBe("Updated Name");
      expect(data.user.phone).toBe("+1 555 123 4567");
    });

    it("rejects future date of birth", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "user-1", email: "user@nova.test" },
      } as any);

      const req = new Request("http://localhost:3000/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({
          dateOfBirth: "2099-01-01",
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/future/i);
    });
  });
});
