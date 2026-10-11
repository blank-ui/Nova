import { requireAdmin } from "@/lib/auth-guards";
import { canOpenAdmin } from "@/lib/auth-policy";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { InquiryDeleteButton } from "@/components/inquiry-delete-button";
import type { Prisma, InquiryStatus } from "@prisma/client";

/**
 * Admin Inquiry List Page
 * Provides pagination, search, filter, and sorting for inquiries.
 * Accessible only to ADMIN users with MFA enabled.
 */
export default async function InquiryList({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined } }) {
  // Ensure admin access
  const session = await requireAdmin();
  if (!canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    // This should never happen because requireAdmin already checks, but guard anyway
    return <p>Unauthorized</p>;
  }

  // Query parameters handling
  const resolvedSearchParams = await searchParams;
  const rawLimit = Number(resolvedSearchParams.limit);
  const limit = Number.isNaN(rawLimit) ? 20 : Math.min(Math.max(rawLimit, 1), 100);
  const cursor = typeof resolvedSearchParams.cursor === "string" ? resolvedSearchParams.cursor : undefined;
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

  const inquiries = await prisma.inquiry.findMany({
    where,
    orderBy,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
  });

  const hasNext = inquiries.length > limit;
  const data = hasNext ? inquiries.slice(0, -1) : inquiries;
  const nextCursor = hasNext ? data[data.length - 1].id : null;

  return (
    <main className="shell" style={{ padding: "50px 0 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        <div>
          <div className="eyebrow">Admin • CRM Management</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 42px)", letterSpacing: "-.06em", margin: "10px 0 6px" }}>
            Customer Inquiries
          </h1>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: 14 }}>
            Review incoming leads, filter by pipeline status, and inspect submission details.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/admin" className="button button-outline" style={{ padding: "10px 16px", fontSize: 13 }}>
            &larr; Admin Overview
          </Link>
        </div>
      </div>

      {/* Pipeline Status Filter Chips & Search Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "All Inquiries", value: "" },
            { label: "New", value: "NEW" },
            { label: "Contacted", value: "CONTACTED" },
            { label: "Qualified", value: "QUALIFIED" },
            { label: "Proposal Sent", value: "PROPOSAL_SENT" },
            { label: "Converted", value: "CONVERTED" },
            { label: "Closed", value: "CLOSED" },
          ].map((tab) => {
            const isSelected = (!status && tab.value === "") || status === tab.value;
            const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
            const baseHref = search ? `/admin/inquiry?search=${encodeURIComponent(search)}` : "/admin/inquiry";
            return (
              <Link
                key={tab.label}
                href={tab.value ? `/admin/inquiry?status=${tab.value}${searchParam}` : baseHref}
                style={{
                  padding: "7px 15px",
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: "none",
                  background: isSelected ? "var(--blue)" : "var(--card-bg)",
                  color: isSelected ? "#ffffff" : "var(--ink)",
                  border: isSelected ? "1px solid var(--blue)" : "1px solid var(--line)",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 2px 8px rgba(108,76,255,0.25)" : "none",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Quick Search Form */}
        <form method="GET" action="/admin/inquiry" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="search"
            defaultValue={search || ""}
            placeholder="Search name, email, service..."
            className="field"
            style={{ fontSize: 12, padding: "7px 12px", width: 220 }}
          />
          <button type="submit" className="button button-outline" style={{ padding: "7px 14px", fontSize: 12 }}>
            Search
          </button>
          {search && (
            <Link
              href={status ? `/admin/inquiry?status=${status}` : "/admin/inquiry"}
              style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none", fontWeight: 600 }}
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      <div className="card" style={{ padding: 24, overflowX: "auto" }}>
        <table className="table-auto w-full" role="table" style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", textAlign: "left", color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>
              <th style={{ padding: "12px 14px" }}>Reference</th>
              <th style={{ padding: "12px 14px" }}>Name</th>
              <th style={{ padding: "12px 14px" }}>Email</th>
              <th style={{ padding: "12px 14px" }}>Company</th>
              <th style={{ padding: "12px 14px" }}>Service</th>
              <th style={{ padding: "12px 14px" }}>Status</th>
              <th style={{ padding: "12px 14px" }}>Created</th>
              <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "36px 14px", textAlign: "center", color: "var(--muted)" }}>
                  No customer inquiries match the current filter.
                </td>
              </tr>
            ) : (
              data.map((inq) => (
                <tr key={inq.id} style={{ borderBottom: "1px solid var(--line)", transition: "background .15s" }}>
                  <td style={{ padding: "14px" }}>
                    <Link href={`/admin/inquiry/${inq.id}`} style={{ color: "var(--blue)", fontWeight: 600, textDecoration: "none" }}>
                      {inq.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td style={{ padding: "14px", fontWeight: 600 }}>{inq.name}</td>
                  <td style={{ padding: "14px" }}>
                    <a href={`mailto:${inq.email}`} style={{ color: "var(--ink)", textDecoration: "none" }}>
                      {inq.email}
                    </a>
                  </td>
                  <td style={{ padding: "14px", color: "var(--muted)" }}>{inq.company ?? "—"}</td>
                  <td style={{ padding: "14px" }}>
                    <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "var(--paper)", border: "1px solid var(--line)" }}>
                      {inq.service}
                    </span>
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 6,
                        background:
                          inq.status === "NEW"
                            ? "#fff4d9"
                            : inq.status === "QUALIFIED" || inq.status === "CONVERTED"
                            ? "#ecfdf5"
                            : inq.status === "CLOSED"
                            ? "#f3f4f6"
                            : "#e0f2fe",
                        color:
                          inq.status === "NEW"
                            ? "#b45309"
                            : inq.status === "QUALIFIED" || inq.status === "CONVERTED"
                            ? "#047857"
                            : inq.status === "CLOSED"
                            ? "#4b5563"
                            : "#0284c7",
                      }}
                    >
                      {inq.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px", color: "var(--muted)", fontSize: 13 }}>
                    {new Date(inq.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={{ padding: "14px", textAlign: "right" }}>
                    <InquiryDeleteButton inquiryId={inq.id} inquiryName={inq.name} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid var(--line)" }} role="navigation" aria-label="Pagination">
          {cursor ? (
            <Link className="button button-outline" style={{ padding: "8px 14px", fontSize: 12 }} href={`/admin/inquiry?${new URLSearchParams({ limit: limit.toString(), cursor: typeof resolvedSearchParams.prevCursor === "string" ? resolvedSearchParams.prevCursor : "" })}`}>
              &larr; Previous
            </Link>
          ) : <div />}
          {hasNext ? (
            <Link className="button button-outline" style={{ padding: "8px 14px", fontSize: 12 }} href={`/admin/inquiry?${new URLSearchParams({ limit: limit.toString(), cursor: nextCursor ?? "" })}`}>
              Next &rarr;
            </Link>
          ) : <div />}
        </div>
      </div>
    </main>
  );
}
