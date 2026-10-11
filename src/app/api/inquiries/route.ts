import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { inquirySchema } from "@/lib/inquiry";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendDiscordInquiryNotification } from "@/lib/discord-webhook";

// Maximum allowable request body size: 64 KB (65,536 bytes)
const MAX_INQUIRY_PAYLOAD_BYTES = 64 * 1024;

export async function POST(request: Request) {
  // 1. Content-Length header guard if present
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader && Number(contentLengthHeader) > MAX_INQUIRY_PAYLOAD_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  // 2. IP-based atomic rate limiting: max 5 submissions per 10 minutes (600 seconds)
  const clientIp = getClientIp(request);
  const rateLimitKey = `inquiry:${clientIp}`;
  const rateLimit = await consumeRateLimit(rateLimitKey, {
    windowSeconds: 600,
    max: 5,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes before trying again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds ?? 60),
        },
      }
    );
  }

  // 3. Safe bounded payload parsing
  let bodyText: string;
  try {
    bodyText = await request.text();
  } catch {
    return NextResponse.json({ error: "Please send a valid request." }, { status: 400 });
  }

  if (Buffer.byteLength(bodyText, "utf8") > MAX_INQUIRY_PAYLOAD_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: "Please send a valid request." }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the required fields and try again." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ received: true }, { status: 202 });

  try {
    const created = await prisma.inquiry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        company: parsed.data.company || null,
        service: parsed.data.service,
        budget: parsed.data.budget || null,
        message: parsed.data.message,
      },
    });

    // Fire Discord notification non-blockingly
    sendDiscordInquiryNotification({
      id: created.id,
      name: created.name,
      email: created.email,
      phone: created.phone,
      company: created.company,
      service: created.service,
      budget: created.budget,
      message: created.message,
    }).catch((err) => console.error("Discord webhook dispatch error:", err));

    return NextResponse.json({ received: true }, { status: 201 });
  } catch (error) {
    console.error("Inquiry persistence failed", error instanceof ZodError ? "validation" : "database unavailable");
    return NextResponse.json({ error: "We couldn't send your request right now. Please try again shortly." }, { status: 503 });
  }
}
