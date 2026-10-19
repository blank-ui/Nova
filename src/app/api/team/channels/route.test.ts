import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, PUT, DELETE } from "./route";

vi.mock("@/lib/auth-guards", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/studio-channels", () => ({
  getStudioChannels: vi.fn(),
  createStudioChannel: vi.fn(),
  updateStudioChannel: vi.fn(),
  deleteStudioChannel: vi.fn(),
}));

import { getCurrentSession } from "@/lib/auth-guards";
import {
  getStudioChannels,
  createStudioChannel,
  updateStudioChannel,
  deleteStudioChannel,
} from "@/lib/studio-channels";

describe("Studio Channels API (/api/team/channels)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("returns 401 when unauthenticated", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null as any);
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it("returns 403 when user is not internal", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "u-1", role: "CLIENT" },
      } as any);
      const res = await GET();
      expect(res.status).toBe(403);
    });

    it("returns channels list for internal staff", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "dev-1", role: "DEVELOPER" },
      } as any);
      vi.mocked(getStudioChannels).mockResolvedValue([
        {
          id: "sc-gen",
          slug: "general",
          name: "general-studio",
          description: "Studio wide",
          icon: "Hash",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.channels).toHaveLength(1);
      expect(data.channels[0].name).toBe("general-studio");
    });
  });

  describe("POST", () => {
    it("returns 403 when non-admin tries to create a channel", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "dev-1", role: "DEVELOPER" },
      } as any);

      const req = new Request("http://localhost/api/team/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "marketing" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it("creates channel when called by Admin", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN" },
      } as any);

      vi.mocked(createStudioChannel).mockResolvedValue({
        id: "sc-new",
        slug: "marketing",
        name: "marketing",
        description: "Growth initiatives",
        icon: "Megaphone",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const req = new Request("http://localhost/api/team/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "marketing", description: "Growth initiatives", icon: "Megaphone" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.channel.slug).toBe("marketing");
    });
  });

  describe("PUT", () => {
    it("returns 403 when non-admin attempts update", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "fin-1", role: "FINANCE" },
      } as any);

      const req = new Request("http://localhost/api/team/channels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "sc-1", name: "new-name" }),
      });

      const res = await PUT(req);
      expect(res.status).toBe(403);
    });

    it("updates channel when called by Admin", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN" },
      } as any);

      vi.mocked(updateStudioChannel).mockResolvedValue({
        id: "sc-1",
        slug: "sprint-reviews",
        name: "sprint-reviews",
        description: "Sprint reviews",
        icon: "Terminal",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const req = new Request("http://localhost/api/team/channels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "sc-1", name: "sprint-reviews", description: "Sprint reviews" }),
      });

      const res = await PUT(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.channel.name).toBe("sprint-reviews");
    });
  });

  describe("DELETE", () => {
    it("returns 403 when non-admin attempts delete", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "dev-1", role: "DEVELOPER" },
      } as any);

      const req = new Request("http://localhost/api/team/channels?id=sc-1", {
        method: "DELETE",
      });

      const res = await DELETE(req);
      expect(res.status).toBe(403);
    });

    it("deletes channel when called by Admin", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN" },
      } as any);

      vi.mocked(deleteStudioChannel).mockResolvedValue(true);

      const req = new Request("http://localhost/api/team/channels?id=sc-2", {
        method: "DELETE",
      });

      const res = await DELETE(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.deletedId).toBe("sc-2");
    });
  });
});
