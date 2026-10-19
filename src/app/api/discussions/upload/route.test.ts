import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth-guards", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

import { getCurrentSession } from "@/lib/auth-guards";

describe("Discussions File Upload API (/api/discussions/upload)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(null as any);
    const req = new Request("http://localhost/api/discussions/upload", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when file is missing", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "u-1", role: "DEVELOPER" },
    } as any);

    const formData = new FormData();
    const req = new Request("http://localhost/api/discussions/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for unsupported file types (e.g. executable/zip)", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "u-1", role: "DEVELOPER" },
    } as any);

    const formData = new FormData();
    const fakeFile = new File(["test"], "malware.exe", { type: "application/x-msdownload" });
    formData.append("file", fakeFile);

    const req = new Request("http://localhost/api/discussions/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid file type");
  });

  it("successfully uploads a PDF document", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "u-1", role: "DEVELOPER" },
    } as any);

    const formData = new FormData();
    const pdfFile = new File(["%PDF-1.4 mock content"], "contract.pdf", { type: "application/pdf" });
    formData.append("file", pdfFile);

    const req = new Request("http://localhost/api/discussions/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.file.url).toContain("/uploads/discussions/");
    expect(data.file.name).toBe("contract.pdf");
    expect(data.file.type).toBe("application/pdf");
  });

  it("successfully uploads a PNG image", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "u-1", role: "DEVELOPER" },
    } as any);

    const formData = new FormData();
    const imgFile = new File(["mock png"], "screenshot.png", { type: "image/png" });
    formData.append("file", imgFile);

    const req = new Request("http://localhost/api/discussions/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.file.url).toContain(".png");
    expect(data.file.type).toBe("image/png");
  });

  it("rejects path traversal attempts in filename", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "u-1", role: "DEVELOPER" },
    } as any);

    const formData = new FormData();
    const traversalFile = new File(["test content"], "../../../etc/passwd.png", { type: "image/png" });
    formData.append("file", traversalFile);

    const req = new Request("http://localhost/api/discussions/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid file name");
  });

  it("rejects files disguised as images that contain executable binary payloads (MZ header)", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "u-1", role: "DEVELOPER" },
    } as any);

    const formData = new FormData();
    // 'MZ' magic bytes for DOS/Windows executable disguised as PNG
    const executablePayload = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]);
    const disguisedFile = new File([executablePayload], "virus.png", { type: "image/png" });
    formData.append("file", disguisedFile);

    const req = new Request("http://localhost/api/discussions/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Executable payload detected");
  });
});
