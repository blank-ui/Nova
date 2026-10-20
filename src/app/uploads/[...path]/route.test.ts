import { describe, it, expect } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

describe("Upload Assets Dynamic Streamer", () => {
  it("rejects path traversal attempts with 403 Forbidden", async () => {
    const req = new NextRequest("http://localhost:3000/uploads/../secret.env");
    const res = await GET(req, {
      params: Promise.resolve({ path: ["..", "secret.env"] }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 404 for nonexistent files", async () => {
    const req = new NextRequest("http://localhost:3000/uploads/avatars/nonexistent-file-xyz.webp");
    const res = await GET(req, {
      params: Promise.resolve({ path: ["avatars", "nonexistent-file-xyz.webp"] }),
    });
    expect(res.status).toBe(404);
  });
});
