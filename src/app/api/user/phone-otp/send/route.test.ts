import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth-guards", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 5, resetAt: new Date() }),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

vi.mock("@/lib/auth-email", () => ({
  sendSmtpEmail: vi.fn().mockResolvedValue(undefined),
  buildNovaEmailHtml: vi.fn().mockReturnValue("<html/>"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    authVerification: {
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      create: vi.fn().mockResolvedValue({ id: "v-1" }),
    },
  },
}));

import { getCurrentSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { sendSmtpEmail } from "@/lib/auth-email";

describe("Phone OTP Send API (/api/user/phone-otp/send)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated requests", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(null as any);
    const req = new Request("http://localhost:3000/api/user/phone-otp/send", {
      method: "POST",
      body: JSON.stringify({ newPhone: "+1 555 999 8888" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("indicates otpRequired: false when user has no existing phone number saved", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "user-1", email: "user@nova.test" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "user@nova.test",
      name: "User",
      phone: null,
    } as any);

    const req = new Request("http://localhost:3000/api/user/phone-otp/send", {
      method: "POST",
      body: JSON.stringify({ newPhone: "+1 555 999 8888" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.otpRequired).toBe(false);
    expect(sendSmtpEmail).not.toHaveBeenCalled();
  });

  it("sends 6-digit OTP to user registered email when existing phone is present", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "user-1", email: "user@nova.test" },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "user@nova.test",
      name: "Alex",
      phone: "+1 555 000 1111",
    } as any);

    const req = new Request("http://localhost:3000/api/user/phone-otp/send", {
      method: "POST",
      body: JSON.stringify({ newPhone: "+1 555 999 8888" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.otpRequired).toBe(true);
    expect(prisma.authVerification.create).toHaveBeenCalled();
    expect(sendSmtpEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@nova.test",
        subject: expect.stringMatching(/One-Time Code/i),
      })
    );
  });
});
