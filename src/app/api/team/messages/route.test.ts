import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";

vi.mock("@/lib/auth-guards", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    teamMessage: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { getCurrentSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

describe("Team Messages API (/api/team/messages)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("returns 401 when not authenticated", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null as any);
      const req = new Request("http://localhost/api/team/messages");
      const res = await GET(req);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe("Unauthorized");
    });

    it("returns 403 when user is not internal staff (e.g. CLIENT)", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "client-1", email: "client@test.com", role: "CLIENT" },
      } as any);

      const req = new Request("http://localhost/api/team/messages");
      const res = await GET(req);
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toContain("Internal team access only");
    });

    it("returns channel messages for internal users", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "dev-1", email: "dev@nova.com", role: "DEVELOPER" },
      } as any);

      vi.mocked(prisma.teamMessage.findMany).mockResolvedValue([
        {
          id: "tm-1",
          senderId: "admin-1",
          recipientId: null,
          channel: "general",
          body: "Hello internal team!",
          createdAt: new Date("2026-10-19T10:00:00Z"),
          sender: {
            id: "admin-1",
            name: "Admin",
            role: "ADMIN",
            image: null,
            email: "admin@nova.com",
          },
        },
      ] as any);

      const req = new Request("http://localhost/api/team/messages?channel=general");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.messages).toHaveLength(1);
      expect(body.messages[0].body).toBe("Hello internal team!");
      expect(body.messages[0].channel).toBe("general");
    });

    it("returns 1-on-1 direct messages when recipientId is provided", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "dev-1", email: "dev@nova.com", role: "DEVELOPER" },
      } as any);

      vi.mocked(prisma.teamMessage.findMany).mockResolvedValue([
        {
          id: "dm-1",
          senderId: "finance-1",
          recipientId: "dev-1",
          channel: null,
          body: "Hey, can you review the invoice milestone?",
          createdAt: new Date("2026-10-19T11:00:00Z"),
          sender: {
            id: "finance-1",
            name: "Finance Lead",
            role: "FINANCE",
            image: null,
            email: "finance@nova.com",
          },
        },
      ] as any);

      const req = new Request("http://localhost/api/team/messages?recipientId=finance-1");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.messages).toHaveLength(1);
      expect(body.messages[0].body).toContain("invoice milestone");
    });
  });

  describe("POST", () => {
    it("returns 400 when body text is blank", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "admin-1", email: "admin@nova.com", role: "ADMIN" },
      } as any);

      const req = new Request("http://localhost/api/team/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "   " }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Message content cannot be blank");
    });

    it("creates a direct 1-on-1 team message to another internal user", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "admin-1", email: "admin@nova.com", role: "ADMIN" },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "dev-1",
        name: "Developer",
        role: "DEVELOPER",
      } as any);

      vi.mocked(prisma.teamMessage.create).mockResolvedValue({
        id: "msg-123",
        senderId: "admin-1",
        recipientId: "dev-1",
        channel: null,
        body: "Please sync on sprint task #4.",
        createdAt: new Date("2026-10-19T12:00:00Z"),
        sender: {
          id: "admin-1",
          name: "Admin",
          role: "ADMIN",
          image: null,
          email: "admin@nova.com",
        },
      } as any);

      const req = new Request("http://localhost/api/team/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: "dev-1",
          body: "Please sync on sprint task #4.",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message.id).toBe("msg-123");
      expect(data.message.recipientId).toBe("dev-1");
      expect(data.message.body).toBe("Please sync on sprint task #4.");
    });
  });
});
