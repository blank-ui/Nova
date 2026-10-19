import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, DELETE } from "./route";

vi.mock("@/lib/auth-guards", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/studio-channels", () => ({
  getChannelMembers: vi.fn(),
  addChannelMember: vi.fn(),
  removeChannelMember: vi.fn(),
}));

import { getCurrentSession } from "@/lib/auth-guards";
import {
  getChannelMembers,
  addChannelMember,
  removeChannelMember,
} from "@/lib/studio-channels";

describe("Channel Members API (/api/team/channels/members)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("returns 401 when not logged in", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null as any);
      const req = new Request("http://localhost/api/team/channels/members?channelId=sc-1");
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it("returns 400 when channelId is missing", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "dev-1", role: "DEVELOPER" },
      } as any);
      const req = new Request("http://localhost/api/team/channels/members");
      const res = await GET(req);
      expect(res.status).toBe(400);
    });

    it("returns members for channel", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "dev-1", role: "DEVELOPER" },
      } as any);
      vi.mocked(getChannelMembers).mockResolvedValue([
        {
          id: "cm-1",
          userId: "u-1",
          role: "MEMBER",
          user: { id: "u-1", name: "Alice", email: "alice@test.com", role: "DEVELOPER" },
        },
      ]);

      const req = new Request("http://localhost/api/team/channels/members?channelId=sc-1");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.members).toHaveLength(1);
      expect(data.members[0].user.name).toBe("Alice");
    });
  });

  describe("POST", () => {
    it("adds a member to the channel", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "fin-1", role: "FINANCE" },
      } as any);
      vi.mocked(addChannelMember).mockResolvedValue(true);
      vi.mocked(getChannelMembers).mockResolvedValue([
        {
          id: "cm-1",
          userId: "u-2",
          role: "MEMBER",
          user: { id: "u-2", name: "Bob", email: "bob@test.com", role: "FINANCE" },
        },
      ]);

      const req = new Request("http://localhost/api/team/channels/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: "sc-1", userId: "u-2" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.members).toHaveLength(1);
    });
  });

  describe("DELETE", () => {
    it("removes a member from the channel", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "dev-1", role: "DEVELOPER" },
      } as any);
      vi.mocked(removeChannelMember).mockResolvedValue(true);
      vi.mocked(getChannelMembers).mockResolvedValue([]);

      const req = new Request("http://localhost/api/team/channels/members?channelId=sc-1&userId=u-2", {
        method: "DELETE",
      });

      const res = await DELETE(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.members).toHaveLength(0);
    });
  });
});
