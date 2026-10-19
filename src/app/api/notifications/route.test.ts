import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/auth-guards", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    inquiry: {
      findMany: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
    },
    auditLog: {
      findMany: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
    },
  },
}));

import { getCurrentSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

describe("Notifications API (/api/notifications)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(null as any);
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns admin notifications with inquiries, appointments, and audit events", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "admin-1", email: "admin@nova.com", role: "ADMIN" },
    } as any);

    vi.mocked(prisma.inquiry.findMany).mockResolvedValue([
      {
        id: "inq-1",
        name: "Alice",
        email: "alice@example.com",
        service: "Web Design",
        budget: "$10k",
        status: "NEW",
        createdAt: new Date("2026-10-19T10:00:00Z"),
      },
    ] as any);

    vi.mocked(prisma.appointment.findMany).mockResolvedValue([
      {
        id: "apt-1",
        title: "Initial Strategy",
        date: new Date("2026-10-20T14:00:00Z"),
        status: "SCHEDULED",
        createdAt: new Date("2026-10-19T09:00:00Z"),
      },
    ] as any);

    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([
      {
        id: "log-1",
        action: "UPDATE_STATUS",
        entityType: "Inquiry",
        actor: { name: "System Admin" },
        createdAt: new Date("2026-10-19T08:00:00Z"),
      },
    ] as any);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.notifications).toHaveLength(3);
    expect(data.unreadCount).toBe(2); // NEW inquiry and SCHEDULED appointment
    expect(data.notifications[0].id).toBe("inq-inq-1");
    expect(data.notifications[0].unread).toBe(true);
    expect(data.notifications[0].href).toBe("/admin/inquiry/inq-1");
  });

  it("returns client notifications for portal users", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "client-1", email: "client@example.com", role: "CLIENT" },
    } as any);

    vi.mocked(prisma.inquiry.findMany).mockResolvedValue([
      {
        id: "inq-c1",
        service: "Mobile App",
        status: "ACCEPTED",
        createdAt: new Date("2026-10-19T11:00:00Z"),
      },
    ] as any);

    vi.mocked(prisma.project.findMany).mockResolvedValue([
      {
        id: "p-1",
        name: "Acme Redesign",
        status: "IN_PROGRESS",
        updatedAt: new Date("2026-10-19T10:30:00Z"),
      },
    ] as any);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.notifications).toHaveLength(2);
    expect(data.notifications[0].id).toBe("inq-inq-c1");
    expect(data.notifications[1].id).toBe("proj-p-1");
  });
});
