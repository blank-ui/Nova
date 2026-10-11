import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import { canOpenAdmin } from "@/lib/auth-policy";
import { prisma } from "@/lib/prisma";
import { StatusUpdateForm } from "@/components/status-update-form";

interface InquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InquiryDetailPage({ params }: InquiryDetailPageProps) {
  const session = await requireAdmin();
  if (!canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return <p>Unauthorized</p>;
  }

  const { id } = await params;

  // Validate cuid format according to schema (@default(cuid()))
  if (!/^c[0-9a-z]{24}$/.test(id)) {
    notFound();
  }

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
  });

  if (!inquiry) {
    notFound();
  }

  // Fetch audit history for this specific inquiry
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      entityType: "Inquiry",
      entityId: id,
    },
    orderBy: { createdAt: "desc" },
    include: {
      actor: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const statusColors: Record<string, { bg: string; color: string; border: string }> = {
    NEW: { bg: "rgba(255, 181, 71, 0.12)", color: "#d97706", border: "rgba(255, 181, 71, 0.3)" },
    QUALIFIED: { bg: "rgba(16, 185, 129, 0.12)", color: "#059669", border: "rgba(16, 185, 129, 0.3)" },
    CONTACTED: { bg: "rgba(59, 130, 246, 0.12)", color: "#2563eb", border: "rgba(59, 130, 246, 0.3)" },
    PROPOSAL_SENT: { bg: "rgba(108, 76, 255, 0.12)", color: "#6C4CFF", border: "rgba(108, 76, 255, 0.3)" },
    CONVERTED: { bg: "rgba(16, 185, 129, 0.15)", color: "#047857", border: "rgba(16, 185, 129, 0.35)" },
    CLOSED: { bg: "rgba(156, 163, 175, 0.12)", color: "#6b7280", border: "rgba(156, 163, 175, 0.3)" },
  };
  const activeStyle = statusColors[inquiry.status] || {
    bg: "rgba(108, 76, 255, 0.1)",
    color: "#6C4CFF",
    border: "rgba(108, 76, 255, 0.25)",
  };

  return (
    <main className="shell" style={{ padding: "50px 0 80px" }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/inquiry"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--muted)",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} /> Back to inquiries
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 30 }}>
        <div>
          <div className="eyebrow">Inquiry Reference · {inquiry.id.slice(0, 10)}</div>
          <h1 style={{ fontSize: 36, letterSpacing: "-0.05em", margin: "8px 0 0" }}>
            {inquiry.name}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              backgroundColor: activeStyle.bg,
              color: activeStyle.color,
              border: `1px solid ${activeStyle.border}`,
            }}
          >
            {inquiry.status}
          </span>
          <a
            href={`mailto:${inquiry.email}?subject=Nova%20Studio%20-%20Follow-up%20on%20your%20inquiry`}
            className="button"
            style={{ padding: "8px 16px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Reply via Email
          </a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        {/* Main Details Card */}
        <section className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 20, letterSpacing: "-0.03em", marginBottom: 20 }}>
            Inquiry Details
          </h2>

          <dl className="inquiry-dl" style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "14px 10px", fontSize: 14 }}>
            <dt style={{ color: "var(--muted)" }}>Email:</dt>
            <dd style={{ margin: 0 }}>
              <a href={`mailto:${inquiry.email}`} style={{ color: "var(--blue)", textDecoration: "underline" }}>
                {inquiry.email}
              </a>
            </dd>

            <dt style={{ color: "var(--muted)" }}>Phone:</dt>
            <dd style={{ margin: 0 }}>
              {inquiry.phone ? (
                <a href={`tel:${inquiry.phone}`} style={{ color: "var(--blue)", textDecoration: "underline" }}>
                  {inquiry.phone}
                </a>
              ) : (
                "—"
              )}
            </dd>

            <dt style={{ color: "var(--muted)" }}>Company:</dt>
            <dd style={{ margin: 0 }}>{inquiry.company || "—"}</dd>

            <dt style={{ color: "var(--muted)" }}>Requested Service:</dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>{inquiry.service}</dd>

            <dt style={{ color: "var(--muted)" }}>Budget Range:</dt>
            <dd style={{ margin: 0 }}>{inquiry.budget || "—"}</dd>

            <dt style={{ color: "var(--muted)" }}>Submitted At:</dt>
            <dd style={{ margin: 0 }}>{new Date(inquiry.createdAt).toLocaleString()}</dd>
          </dl>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
            <h3 style={{ fontSize: 14, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Message
            </h3>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background: "var(--paper)",
                padding: 16,
                borderRadius: 12,
                border: "1px solid var(--line)",
                margin: 0,
              }}
            >
              {inquiry.message}
            </p>
          </div>
        </section>

        {/* Management & Status Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section className="card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 20, letterSpacing: "-0.03em", marginBottom: 16 }}>
              Status Management
            </h2>
            <StatusUpdateForm inquiryId={inquiry.id} currentStatus={inquiry.status} />
          </section>

          {/* Audit History Card */}
          <section className="card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 20, letterSpacing: "-0.03em", marginBottom: 16 }}>
              Audit History
            </h2>
            {auditLogs.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
                No recorded updates for this inquiry yet.
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {auditLogs.map((log) => {
                  const meta = log.metadata as Record<string, unknown> | null;
                  return (
                    <li
                      key={log.id}
                      style={{
                        fontSize: 13,
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: "var(--paper)",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>
                          {log.actor ? `${log.actor.name} (${log.actor.email})` : "System"}
                        </span>
                        <time style={{ color: "var(--muted)", fontSize: 11 }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </time>
                      </div>
                      <div style={{ color: "var(--muted)" }}>
                        Action: <strong>{log.action}</strong>
                        {meta?.field === "status" && (
                          <span> · Status changed to <strong>{String(meta?.new)}</strong></span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      <style>{`
        @media (max-width: 540px) {
          .inquiry-dl {
            grid-template-columns: 1fr !important;
            gap: 6px !important;
          }
          .inquiry-dl dt {
            margin-top: 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </main>
  );
}
