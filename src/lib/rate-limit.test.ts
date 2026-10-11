import { describe, expect, it, vi, beforeEach } from "vitest";
import { consumeRateLimit, getClientIp } from "./rate-limit";
import { prisma } from "./prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    authRateLimit: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("consumeRateLimit Unit Tests", () => {
  const rule = { windowSeconds: 60, max: 5 };
  const key = "test-rate-key";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows first request when no existing record exists and creates row", async () => {
    vi.mocked(prisma.authRateLimit.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.authRateLimit.create).mockResolvedValueOnce({
      id: "c1",
      key,
      count: 1,
      lastRequest: BigInt(Date.now()),
    });

    const res = await consumeRateLimit(key, rule);

    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(4);
    expect(res.retryAfterSeconds).toBeNull();
    expect(prisma.authRateLimit.create).toHaveBeenCalledTimes(1);
  });

  it("handles concurrent creation collision gracefully and retries", async () => {
    // 1st findUnique returns null
    vi.mocked(prisma.authRateLimit.findUnique).mockResolvedValueOnce(null);
    // create fails due to unique constraint collision
    vi.mocked(prisma.authRateLimit.create).mockRejectedValueOnce(new Error("Unique constraint failed"));
    // 2nd findUnique returns the row created by the concurrent request
    vi.mocked(prisma.authRateLimit.findUnique).mockResolvedValueOnce({
      id: "c1",
      key,
      count: 1,
      lastRequest: BigInt(Date.now()),
    });
    vi.mocked(prisma.authRateLimit.update).mockResolvedValueOnce({
      id: "c1",
      key,
      count: 2,
      lastRequest: BigInt(Date.now()),
    });

    const res = await consumeRateLimit(key, rule);

    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(3);
    expect(prisma.authRateLimit.findUnique).toHaveBeenCalledTimes(2);
  });

  it("resets count when window has expired", async () => {
    const expiredTimestamp = Date.now() - 70000; // 70 seconds ago (> 60s window)
    vi.mocked(prisma.authRateLimit.findUnique).mockResolvedValueOnce({
      id: "c1",
      key,
      count: 5,
      lastRequest: BigInt(expiredTimestamp),
    });
    vi.mocked(prisma.authRateLimit.update).mockResolvedValueOnce({
      id: "c1",
      key,
      count: 1,
      lastRequest: BigInt(Date.now()),
    });

    const res = await consumeRateLimit(key, rule);

    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(4);
    expect(res.retryAfterSeconds).toBeNull();
    expect(prisma.authRateLimit.update).toHaveBeenCalledWith({
      where: { key },
      data: {
        count: 1,
        lastRequest: expect.any(BigInt),
      },
    });
  });

  it("blocks request and returns retryAfterSeconds when threshold is reached", async () => {
    const recentTimestamp = Date.now() - 20000; // 20 seconds ago (40 seconds remaining)
    vi.mocked(prisma.authRateLimit.findUnique).mockResolvedValueOnce({
      id: "c1",
      key,
      count: 5, // max is 5
      lastRequest: BigInt(recentTimestamp),
    });

    const res = await consumeRateLimit(key, rule);

    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);
    expect(res.retryAfterSeconds).toBeGreaterThanOrEqual(38);
    expect(res.retryAfterSeconds).toBeLessThanOrEqual(41);
    expect(prisma.authRateLimit.update).not.toHaveBeenCalled();
  });

  it("increments atomically within active window", async () => {
    const recentTimestamp = Date.now() - 10000;
    vi.mocked(prisma.authRateLimit.findUnique).mockResolvedValueOnce({
      id: "c1",
      key,
      count: 2,
      lastRequest: BigInt(recentTimestamp),
    });
    vi.mocked(prisma.authRateLimit.update).mockResolvedValueOnce({
      id: "c1",
      key,
      count: 3,
      lastRequest: BigInt(Date.now()),
    });

    const res = await consumeRateLimit(key, rule);

    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(2);
    expect(prisma.authRateLimit.update).toHaveBeenCalledWith({
      where: { key },
      data: {
        count: { increment: 1 },
        lastRequest: expect.any(BigInt),
      },
    });
  });

  it("fails open gracefully on unexpected database error", async () => {
    vi.mocked(prisma.authRateLimit.findUnique).mockRejectedValueOnce(new Error("Database timeout"));

    const res = await consumeRateLimit(key, rule);

    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(1);
    expect(res.retryAfterSeconds).toBeNull();
  });
});

describe("getClientIp Unit Tests", () => {
  it("extracts cf-connecting-ip with highest priority", () => {
    const req = new Request("http://localhost", {
      headers: {
        "cf-connecting-ip": "203.0.113.195",
        "x-real-ip": "198.51.100.1",
        "x-forwarded-for": "192.0.2.1, 198.51.100.1",
      },
    });
    expect(getClientIp(req)).toBe("203.0.113.195");
  });

  it("extracts x-real-ip when cf-connecting-ip is absent", () => {
    const req = new Request("http://localhost", {
      headers: {
        "x-real-ip": "198.51.100.1",
        "x-forwarded-for": "192.0.2.1, 198.51.100.1",
      },
    });
    expect(getClientIp(req)).toBe("198.51.100.1");
  });

  it("extracts leftmost ip from x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: {
        "x-forwarded-for": "192.0.2.1, 10.0.0.1, 172.16.0.1",
      },
    });
    expect(getClientIp(req)).toBe("192.0.2.1");
  });

  it("defaults to 127.0.0.1 when no forwarding headers are present", () => {
    const req = new Request("http://localhost");
    expect(getClientIp(req)).toBe("127.0.0.1");
  });
});
