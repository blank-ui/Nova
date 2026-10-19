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
    authVerification: {
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
      create: vi.fn(),
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
    it("updates name, phone, and dateOfBirth without OTP when user has no existing phone", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "user-1", email: "user@nova.test" },
      } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        email: "user@nova.test",
        phone: null, // First time setting phone
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

    it("requires OTP when updating an already saved phone number", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "user-1", email: "user@nova.test" },
      } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        email: "user@nova.test",
        phone: "+1 555 000 1111", // Already saved
      } as any);

      const req = new Request("http://localhost:3000/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({
          phone: "+1 555 999 8888",
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.otpRequired).toBe(true);
      expect(data.error).toMatch(/verification code/i);
    });

    it("rejects phone update with incorrect or expired OTP", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "user-1", email: "user@nova.test" },
      } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        email: "user@nova.test",
        phone: "+1 555 000 1111",
      } as any);
      vi.mocked(prisma.authVerification.findFirst).mockResolvedValue(null);

      const req = new Request("http://localhost:3000/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({
          phone: "+1 555 999 8888",
          otp: "123456",
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/expired|invalid/i);
    });

    it("accepts phone update with valid OTP and consumes the code", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "user-1", email: "user@nova.test" },
      } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        email: "user@nova.test",
        phone: "+1 555 000 1111",
      } as any);
      vi.mocked(prisma.authVerification.findFirst).mockResolvedValue({
        id: "v-1",
        identifier: "phone-otp:user-1",
        value: "654321:+1 555 999 8888",
        expiresAt: new Date(Date.now() + 60000),
      } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({
        id: "user-1",
        phone: "+1 555 999 8888",
        email: "user@nova.test",
      } as any);

      const req = new Request("http://localhost:3000/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({
          phone: "+1 555 999 8888",
          otp: "654321",
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);
      expect(prisma.authVerification.deleteMany).toHaveBeenCalledWith({
        where: { identifier: "phone-otp:user-1" },
      });
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.user.phone).toBe("+1 555 999 8888");
    });

    it("rejects future date of birth", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "user-1", email: "user@nova.test" },
      } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        email: "user@nova.test",
        phone: null,
        role: "CLIENT",
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

    it("rejects date of birth for clients under 13 years old", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "user-1", email: "user@nova.test" },
      } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        email: "user@nova.test",
        phone: null,
        role: "CLIENT",
      } as any);

      // 5 years ago
      const recentDob = new Date(Date.now() - 5 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const req = new Request("http://localhost:3000/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({
          dateOfBirth: recentDob,
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/13 years/i);
    });
  });
});

