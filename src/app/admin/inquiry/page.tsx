import { requireAdmin } from "@/lib/auth-guards";
import { canOpenAdmin } from "@/lib/auth-policy";
import { prisma } from "@/lib/prisma";
import type { Prisma, InquiryStatus } from "@prisma/client";
import { AdminInquiriesCRM } from "@/components/admin-inquiries-crm";

/**
 * Admin Inquiry List Page
 * Provides pagination, search, filter, and sorting for inquiries.
 * Rendered within the unified Admin CRM Shell.
 */
export default async function InquiryList({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  const session = await requireAdmin();
  if (!canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return <p>Unauthorized</p>;
  }

  const resolvedSearchParams = await searchParams;
  const rawLimit = Number(resolvedSearchParams.limit);
  const limit = Number.isNaN(rawLimit) ? 50 : Math.min(Math.max(rawLimit, 1), 100);
  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search.trim() : undefined;
  const status = typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : undefined;
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "createdAt_desc";

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
  if (status) where.status = status as InquiryStatus;

  const sortMap: Record<string, Prisma.InquiryOrderByWithRelationInput> = {
    createdAt_desc: { createdAt: "desc" },
    createdAt_asc: { createdAt: "asc" },
    status_desc: { status: "desc" },
    status_asc: { status: "asc" },
  };
  const orderBy = sortMap[sort] ?? { createdAt: "desc" };

  const [inquiries, totalCount, newCount, qualifiedCount] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy,
      take: limit,
    }),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.inquiry.count({ where: { status: "QUALIFIED" } }),
  ]);

  const serializedInquiries = inquiries.map((inq) => ({
    id: inq.id,
    name: inq.name,
    email: inq.email,
    phone: inq.phone,
    dateOfBirth: inq.dateOfBirth,
    company: inq.company,
    service: inq.service,
    budget: inq.budget,
    message: inq.message,
    status: inq.status,
    createdAt: inq.createdAt.toISOString(),
  }));

  return (
    <AdminInquiriesCRM
      inquiries={serializedInquiries}
      totalCount={totalCount}
      newCount={newCount}
      qualifiedCount={qualifiedCount}
      currentStatus={status}
      currentSearch={search}
    />
  );
}
