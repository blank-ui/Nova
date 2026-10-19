import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/inquiries/route";
import { prisma } from "@/lib/prisma";
import * as rateLimit from "@/lib/rate-limit";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    inquiry: {
      create: vi.fn(),
    },
    authRateLimit: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("Public Inquiry Endpoint Protections (Unit Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects requests exceeding Content-Length 64KB with HTTP 413", async () => {
    const request = new Request("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": "70000",
      },
      body: JSON.stringify({ name: "Too Big" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(413);
    const json = await response.json();
    expect(json.error).toMatch(/payload too large/i);
    expect(prisma.inquiry.create).not.toHaveBeenCalled();
  });

  it("rejects actual request bodies exceeding 64KB with HTTP 413", async () => {
    const oversizedMessage = "X".repeat(66000);
    const request = new Request("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test@nova.test",
        service: "Web Development",
        message: oversizedMessage,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(413);
    const json = await response.json();
    expect(json.error).toMatch(/payload too large/i);
    expect(prisma.inquiry.create).not.toHaveBeenCalled();
  });

  it("returns HTTP 429 when rate limit is exceeded", async () => {
    vi.spyOn(rateLimit, "consumeRateLimit").mockResolvedValueOnce({
      allowed: false,
      retryAfterSeconds: 120,
      remaining: 0,
    });

    const request = new Request("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Jane Doe",
        email: "jane@nova.test",
        service: "Design & UX",
        message: "This is a legitimate inquiry that got throttled by rate limit.",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("120");
    const json = await response.json();
    expect(json.error).toMatch(/too many requests/i);
    expect(prisma.inquiry.create).not.toHaveBeenCalled();
  });

  it("accepts valid inquiries when rate limit and payload size are within limits", async () => {
    vi.spyOn(rateLimit, "consumeRateLimit").mockResolvedValueOnce({
      allowed: true,
      retryAfterSeconds: null,
      remaining: 4,
    });

    vi.mocked(prisma.inquiry.create).mockResolvedValueOnce({
      id: "cinquiry1234567890123456",
      name: "Valid Lead",
      email: "valid@nova.test",
      phone: "+91 98765 43210",
      company: "Acme Corp",
      service: "Full Stack Build",
      budget: "$50k - $100k",
      message: "We need a Next.js application built with strict security controls.",
      status: "NEW",
      dateOfBirth: null,
      referenceUrl: null,
      referenceImage: null,
      createdAt: new Date(),
    });

    const request = new Request("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Valid Lead",
        email: "valid@nova.test",
        phone: "+91 98765 43210",
        company: "Acme Corp",
        service: "Full Stack Build",
        budget: "$50k - $100k",
        message: "We need a Next.js application built with strict security controls.",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.received).toBe(true);
    expect(prisma.inquiry.create).toHaveBeenCalledTimes(1);
  });

  it("accepts inquiries with referenceUrl and referenceImage", async () => {
    vi.spyOn(rateLimit, "consumeRateLimit").mockResolvedValueOnce({
      allowed: true,
      retryAfterSeconds: null,
      remaining: 3,
    });

    vi.mocked(prisma.inquiry.create).mockResolvedValueOnce({
      id: "cinquiryReferenceTest123456",
      name: "Reference Lead",
      email: "ref@nova.test",
      phone: "+91 98765 43210",
      company: "Design Studio",
      service: "Website Redesign",
      budget: "₹3–8 lakh",
      message: "Here is our benchmark site and mockup screenshot.",
      referenceUrl: "https://dribbble.com/shots/123456",
      referenceImage: "/uploads/inquiries/mockup-123.png",
      status: "NEW",
      dateOfBirth: null,
      createdAt: new Date(),
    });

    const request = new Request("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Reference Lead",
        email: "ref@nova.test",
        phone: "+91 98765 43210",
        service: "Website Redesign",
        message: "Here is our benchmark site and mockup screenshot.",
        referenceUrl: "https://dribbble.com/shots/123456",
        referenceImage: "/uploads/inquiries/mockup-123.png",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.received).toBe(true);
    expect(prisma.inquiry.create).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          referenceUrl: "https://dribbble.com/shots/123456",
          referenceImage: "/uploads/inquiries/mockup-123.png",
        }),
      })
    );
  });
});
