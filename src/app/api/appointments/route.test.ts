import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, PATCH, DELETE } from "./route";

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
    appointment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { getCurrentSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

describe("Appointments API (/api/appointments)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/appointments", () => {
    it("rejects unauthenticated requests with 401", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue(null as any);
      const req = new Request("http://localhost:3000/api/appointments");
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it("filters to user's appointments when caller is a CLIENT", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "client-1", role: "CLIENT", name: "Client One" },
      } as any);
      vi.mocked(prisma.appointment.findMany).mockResolvedValue([] as any);

      const req = new Request("http://localhost:3000/api/appointments?status=SCHEDULED");
      const res = await GET(req);
      expect(res.status).toBe(200);

      expect(prisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { requestedById: "client-1" },
              { assignedStaffId: "client-1" },
            ],
            status: "SCHEDULED",
          },
        })
      );
    });

    it("returns workspace-wide appointments when caller is ADMIN", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN", name: "Admin" },
      } as any);
      vi.mocked(prisma.appointment.findMany).mockResolvedValue([] as any);

      const req = new Request("http://localhost:3000/api/appointments");
      const res = await GET(req);
      expect(res.status).toBe(200);

      expect(prisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      );
    });
  });

  describe("POST /api/appointments", () => {
    it("allows clients to request an appointment", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "client-1", role: "CLIENT", name: "Client One" },
      } as any);
      vi.mocked(prisma.appointment.create).mockResolvedValue({
        id: "apt-1",
        title: "Initial Consultation",
        status: "REQUESTED",
        date: new Date("2026-11-01T10:00:00Z"),
      } as any);

      const req = new Request("http://localhost:3000/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          title: "Initial Consultation",
          description: "Discuss website revamp",
          date: "2026-11-01T10:00:00Z",
          duration: 45,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(prisma.appointment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: "Initial Consultation",
            requestedById: "client-1",
            status: "REQUESTED",
            duration: 45,
          }),
        })
      );
    });

    it("allows staff/admin to schedule confirmed appointments directly with a client", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN", name: "Nova Lead" },
      } as any);
      vi.mocked(prisma.appointment.create).mockResolvedValue({
        id: "apt-2",
        title: "Sprint Review",
        status: "SCHEDULED",
      } as any);

      const req = new Request("http://localhost:3000/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          title: "Sprint Review",
          date: "2026-11-02T15:00:00Z",
          clientId: "client-42",
          meetingLink: "https://meet.google.com/abc-defg-hij",
          status: "SCHEDULED",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(prisma.appointment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: "Sprint Review",
            requestedById: "client-42",
            assignedStaffId: "admin-1",
            status: "SCHEDULED",
            meetingLink: "https://meet.google.com/abc-defg-hij",
          }),
        })
      );
    });

    it("rejects appointments scheduled in the past", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "client-1", role: "CLIENT", name: "Client One" },
      } as any);

      const pastDate = new Date(Date.now() - 3600000 * 24).toISOString();
      const req = new Request("http://localhost:3000/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          title: "Past Meeting",
          date: pastDate,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/past/i);
    });
  });

  describe("PATCH /api/appointments", () => {
    it("allows clients to cancel their own appointment", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "client-1", role: "CLIENT" },
      } as any);
      vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
        id: "apt-1",
        requestedById: "client-1",
        status: "SCHEDULED",
      } as any);
      vi.mocked(prisma.appointment.update).mockResolvedValue({
        id: "apt-1",
        status: "CANCELLED",
      } as any);

      const req = new Request("http://localhost:3000/api/appointments", {
        method: "PATCH",
        body: JSON.stringify({ id: "apt-1", status: "CANCELLED" }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);
      expect(prisma.appointment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "apt-1" },
          data: expect.objectContaining({ status: "CANCELLED" }),
        })
      );
    });

    it("prevents clients from setting status to SCHEDULED or COMPLETED", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "client-1", role: "CLIENT" },
      } as any);
      vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
        id: "apt-1",
        requestedById: "client-1",
        status: "REQUESTED",
      } as any);

      const req = new Request("http://localhost:3000/api/appointments", {
        method: "PATCH",
        body: JSON.stringify({ id: "apt-1", status: "SCHEDULED" }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/appointments", () => {
    it("restricts deletion to ADMIN role", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "client-1", role: "CLIENT" },
      } as any);

      const req = new Request("http://localhost:3000/api/appointments?id=apt-1", {
        method: "DELETE",
      });

      const res = await DELETE(req);
      expect(res.status).toBe(403);
    });

    it("allows ADMIN to delete an appointment", async () => {
      vi.mocked(getCurrentSession).mockResolvedValue({
        user: { id: "admin-1", role: "ADMIN" },
      } as any);
      vi.mocked(prisma.appointment.delete).mockResolvedValue({ id: "apt-1" } as any);

      const req = new Request("http://localhost:3000/api/appointments?id=apt-1", {
        method: "DELETE",
      });

      const res = await DELETE(req);
      expect(res.status).toBe(200);
      expect(prisma.appointment.delete).toHaveBeenCalledWith({ where: { id: "apt-1" } });
    });
  });
});
