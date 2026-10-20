import { describe, it, expect } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

describe("Email Tracking Pixel Route", () => {
  it("returns 200 with 1x1 transparent GIF headers and non-cacheable directives", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/email-track?token=dummy-token-123");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/gif");
    expect(res.headers.get("cache-control")).toContain("no-store");
  });
});
