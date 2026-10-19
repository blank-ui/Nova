import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock auth guards
vi.mock("@/lib/auth-guards", () => ({
  getCurrentSession: vi.fn(),
}));

// Mock rate limit
vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 29, retryAfterSeconds: null }),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

// Mock fs
vi.mock("node:fs", () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    promises: {
      writeFile: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

import { getCurrentSession } from "@/lib/auth-guards";
import { consumeRateLimit } from "@/lib/rate-limit";

describe("POST /api/admin/gallery/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated requests with 403", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(null as any);
    const req = new Request("http://localhost:3000/api/admin/gallery/upload", {
      method: "POST",
      body: JSON.stringify({ image: "test" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("rejects non-admin users with 403", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "user-client", role: "CLIENT", twoFactorEnabled: false },
    } as any);

    const req = new Request("http://localhost:3000/api/admin/gallery/upload", {
      method: "POST",
      body: JSON.stringify({ image: "test" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN", twoFactorEnabled: true },
    } as any);
    vi.mocked(consumeRateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, retryAfterSeconds: 60 });

    const req = new Request("http://localhost:3000/api/admin/gallery/upload", {
      method: "POST",
      body: JSON.stringify({ image: "test" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("rejects invalid image payload format with 400", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN", twoFactorEnabled: true },
    } as any);

    const req = new Request("http://localhost:3000/api/admin/gallery/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: "invalid-not-an-image-data-string-with-bad-bytes" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid image format");
  });

  it("successfully uploads a valid PNG via JSON base64", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN", twoFactorEnabled: true },
    } as any);

    // PNG header: 89 50 4E 47 0D 0A 1A 0A + 4 bytes
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    ]);
    const base64Png = `data:image/png;base64,${pngBuffer.toString("base64")}`;

    const req = new Request("http://localhost:3000/api/admin/gallery/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Png, filename: "screenshot.png" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.url).toMatch(/^\/uploads\/gallery\/[a-f0-9-]+\.png$/);
    expect(data.filename).toBe("screenshot.png");
  });
});
