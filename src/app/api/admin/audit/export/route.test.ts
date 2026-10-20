import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/auth-guards", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/auth-policy", () => ({
  canOpenAdmin: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
    userLoginHistory: {
      findMany: vi.fn(),
    },
  },
}));

import { getCurrentSession } from "@/lib/auth-guards";
import { canOpenAdmin } from "@/lib/auth-policy";
import { prisma } from "@/lib/prisma";

describe("GET /api/admin/audit/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when session is missing or unauthorized", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(null as any);
    vi.mocked(canOpenAdmin).mockReturnValue(false);

    const req = new Request("http://localhost:3000/api/admin/audit/export");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("returns CSV formatted user audit report for authorized admin", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN", twoFactorEnabled: true },
    } as any);
    vi.mocked(canOpenAdmin).mockReturnValue(true);

    vi.mocked(prisma.user.findMany).mockResolvedValue([
      {
        id: "usr-1",
        name: "Test Client",
        email: "client@test.com",
        role: "CLIENT",
        banned: false,
        banReason: null,
        emailVerified: true,
        phone: "+1234567890",
        discordHandle: "client",
        invitationSentAt: new Date("2026-10-19T10:00:00Z"),
        invitationSeenAt: new Date("2026-10-19T10:05:00Z"),
        passwordCreatedAt: new Date("2026-10-19T10:10:00Z"),
        lastLoginAt: new Date("2026-10-19T10:15:00Z"),
        lastLoginIp: "1.1.1.1",
        lastLoginCity: "San Francisco",
        lastLoginCountry: "United States",
        createdAt: new Date("2026-10-19T09:00:00Z"),
        loginHistories: [
          {
            city: "San Francisco",
            country: "United States",
            ipAddress: "1.1.1.1",
            createdAt: new Date("2026-10-19T10:15:00Z"),
          },
        ],
        _count: {
          projects: 2,
          authSessions: 1,
          loginHistories: 1,
        },
      },
    ] as any);

    const req = new Request("http://localhost:3000/api/admin/audit/export?format=csv");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    const text = await res.text();
    expect(text).toContain("Full Name");
    expect(text).toContain("Test Client");
    expect(text).toContain("San Francisco");
  });

  it("returns JSON when requested with format=json", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN", twoFactorEnabled: true },
    } as any);
    vi.mocked(canOpenAdmin).mockReturnValue(true);

    vi.mocked(prisma.user.findMany).mockResolvedValue([
      {
        id: "usr-1",
        name: "Test Client",
        email: "client@test.com",
        role: "CLIENT",
        loginHistories: [],
        _count: { projects: 1, authSessions: 1, loginHistories: 0 },
      },
    ] as any);

    const req = new Request("http://localhost:3000/api/admin/audit/export?format=json");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.users[0].name).toBe("Test Client");
  });
});
