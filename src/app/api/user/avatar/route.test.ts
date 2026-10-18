import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, DELETE } from "./route";

// Mock auth guards
vi.mock("@/lib/auth-guards", () => ({
  getCurrentSession: vi.fn(),
}));

// Mock rate limit
vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 10, resetAt: new Date() }),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock fs
vi.mock("node:fs", () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(true),
    unlinkSync: vi.fn(),
    mkdirSync: vi.fn(),
    promises: {
      writeFile: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

import { getCurrentSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

describe("Avatar API Routes (/api/user/avatar)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/user/avatar", () => {
    it("rejects unauthorized requests with 401", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null as any);
      const req = new Request("http://localhost:3000/api/user/avatar", {
        method: "POST",
        body: JSON.stringify({ image: "test" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it("rejects non-admin changing another user avatar with 403", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "user-1", role: "CLIENT", name: "Client" },
      } as any);

      const req = new Request("http://localhost:3000/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: "test", userId: "other-user" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it("rejects invalid image payload with 400", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "user-1", role: "CLIENT", name: "Client" },
      } as any);

      const req = new Request("http://localhost:3000/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: "invalid-corrupt-data" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Invalid image format");
    });

    it("accepts valid PNG image data for own profile", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "user-1", role: "CLIENT", name: "Client" },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        image: null,
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: "user-1",
        image: "/uploads/avatars/new.png",
      } as any);

      // 89 50 4E 47 0D 0A 1A 0A followed by dummy bytes
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00, 0x00]);
      const base64 = pngBuffer.toString("base64");

      const req = new Request("http://localhost:3000/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: `data:image/png;base64,${base64}` }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.avatarUrl).toContain("/uploads/avatars/");
    });
  });

  describe("DELETE /api/user/avatar", () => {
    it("rejects unauthorized delete with 401", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null as any);
      const req = new Request("http://localhost:3000/api/user/avatar", { method: "DELETE" });
      const res = await DELETE(req);
      expect(res.status).toBe(401);
    });

    it("rejects non-admin deleting another user photo with 403", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "user-1", role: "CLIENT", name: "Client" },
      } as any);

      const req = new Request("http://localhost:3000/api/user/avatar?userId=user-2", { method: "DELETE" });
      const res = await DELETE(req);
      expect(res.status).toBe(403);
    });

    it("allows user to delete their own avatar and clears database field", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "user-1", role: "CLIENT", name: "Client" },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-1",
        image: "/uploads/avatars/old.png",
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: "user-1",
        image: null,
      } as any);

      const req = new Request("http://localhost:3000/api/user/avatar", { method: "DELETE" });
      const res = await DELETE(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.avatarUrl).toBeNull();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { image: null },
      });
    });
  });
});
