import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-guards";
import { canOpenAdmin } from "@/lib/auth-policy";
import type { Prisma, InquiryStatus } from "@prisma/client";

/**
 * Admin inquiries list endpoint.
 * Supports pagination, filtering, and sorting.
 * Only accessible to ADMIN users with MFA enabled.
 */
export async function GET(request: Request) {
  // Authorize admin
  const session = await getCurrentSession();
  if (!session || !canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(request.url);
  // ---- pagination ----
  const rawLimit = Number(url.searchParams.get("limit"));
  const limit = Number.isNaN(rawLimit) ? 20 : Math.min(Math.max(rawLimit, 1), 100);

  const cursor = url.searchParams.get("cursor") ?? undefined;
  // validate cursor format (cuid) – cuid starts with "c" and is 25 chars long
  if (cursor && !/^c[0-9a-z]{24}$/.test(cursor)) {
    return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
  }

  const search = url.searchParams.get("search")?.trim();
  const status = url.searchParams.get("status") ?? undefined;
  // ---- status validation ----
  const validStatuses = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "CONVERTED", "CLOSED"]; // matches InquiryStatus enum
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  }

  const sort = url.searchParams.get("sort") ?? "createdAt_desc";
  // ---- sort allowlist ----
  const sortMap: Record<string, Prisma.InquiryOrderByWithRelationInput> = {
    createdAt_desc: { createdAt: "desc" },
    createdAt_asc: { createdAt: "asc" },
    status_desc: { status: "desc" },
    status_asc: { status: "asc" },
  };
  const orderBy = sortMap[sort];
  if (!orderBy) {
    return NextResponse.json({ error: "Invalid sort parameter" }, { status: 400 });
  }

  // Build where clause
  const where: Prisma.InquiryWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { company: { contains: search } },
      { service: { contains: search } },
    ];
  }
  if (status) {
    where.status = status as InquiryStatus;
  }

  try {
    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    const hasNextPage = inquiries.length > limit;
    const result = hasNextPage ? inquiries.slice(0, -1) : inquiries;
    const nextCursor = hasNextPage ? result[result.length - 1].id : null;

    return NextResponse.json({ data: result, nextCursor });
  } catch {
    // Generic error handling to avoid leaking details
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Admin inquiry mutation endpoint.
 * Allows status updates.
 */
export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session || !canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // ---- payload size guard (1 KB) ----
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > 1024) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let payload: Record<string, unknown> | null = null;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, status } = payload ?? {};
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 });
  }
  if (!status || typeof status !== "string") {
    return NextResponse.json({ error: "Missing or invalid status" }, { status: 400 });
  }

  const validStatuses = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "CONVERTED", "CLOSED"]; // matches enum
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Validate cuid format for inquiry id
  if (!/^c[0-9a-z]{24}$/.test(id)) {
    return NextResponse.json({ error: "Invalid inquiry id" }, { status: 400 });
  }

  try {
    const [updatedInquiry] = await prisma.$transaction([
      prisma.inquiry.update({
        where: { id },
        data: { status: status as InquiryStatus },
        select: { id: true, status: true, createdAt: true, name: true, email: true, company: true, service: true, budget: true, message: true },
      }),
      prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "UPDATE",
          entityType: "Inquiry",
          entityId: id,
          metadata: { field: "status", new: status },
        },
      }),
    ]);

    return NextResponse.json({ success: true, inquiry: updatedInquiry });
  } catch (e) {
    // Distinguish not‑found error
    if (e instanceof Error && e.message.includes("Record does not exist")) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Admin inquiry delete endpoint.
 * Permanently removes an inquiry from the database with audit tracking.
 */
export async function DELETE(request: Request) {
  const session = await getCurrentSession();
  if (!session || !canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id || !/^c[0-9a-z]{24}$/.test(id)) {
    return NextResponse.json({ error: "Invalid inquiry id" }, { status: 400 });
  }

  try {
    const existing = await prisma.inquiry.findUnique({
      where: { id },
      select: { id: true, email: true, name: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.inquiry.delete({
        where: { id },
      }),
      prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "DELETE",
          entityType: "Inquiry",
          entityId: id,
          metadata: { name: existing.name, email: existing.email },
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Inquiry deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
