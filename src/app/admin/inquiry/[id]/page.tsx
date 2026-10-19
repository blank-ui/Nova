import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guards";
import { canOpenAdmin } from "@/lib/auth-policy";
import { prisma } from "@/lib/prisma";
import { StatusUpdateForm } from "@/components/status-update-form";
import { ClientProfileCRM } from "@/components/client-profile-crm";

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

  // Fetch client user if an account exists for this email
  const existingUser = await prisma.user.findUnique({
    where: { email: inquiry.email },
    include: {
      projects: {
        include: {
          milestones: true,
          tasks: true,
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  // Fetch all inquiries from this client
  const allInquiries = await prisma.inquiry.findMany({
    where: {
      email: inquiry.email,
    },
    orderBy: { createdAt: "desc" },
  });

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

  const serializedUser = existingUser
    ? {
        ...existingUser,
        createdAt: existingUser.createdAt.toISOString(),
        projects: existingUser.projects.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
          milestones: p.milestones.map((m) => ({
            ...m,
            dueAt: m.dueAt ? m.dueAt.toISOString() : null,
            completedAt: m.completedAt ? m.completedAt.toISOString() : null,
          })),
          tasks: p.tasks.map((t) => ({
            ...t,
            dueAt: t.dueAt ? t.dueAt.toISOString() : null,
            completedAt: t.completedAt ? t.completedAt.toISOString() : null,
          })),
        })),
      }
    : {
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        role: "CLIENT",
        emailVerified: false,
        twoFactorEnabled: false,
        banned: false,
        banReason: null,
        discordHandle: null,
        image: null,
        createdAt: inquiry.createdAt.toISOString(),
        projects: [],
      };

  const serializedInquiries = allInquiries.map((inq) => ({
    ...inq,
    createdAt: inq.createdAt.toISOString(),
  }));

  const inquiryStatusSection = (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Current Inquiry Status & Management Card */}
      <div
        id="lead-inquiry-details"
        style={{
          background: "var(--paper-alt, rgba(0,0,0,0.02))",
          border: "1px solid var(--line)",
          borderRadius: 16,
          padding: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h4 style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 700 }}>
              Lead Inquiry: {inquiry.service}
            </h4>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              Reference ID: {inquiry.id} &middot; Submitted {new Date(inquiry.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>Status:</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "3px 10px",
                borderRadius: 99,
                background: "rgba(108,76,255,0.12)",
                color: "#6C4CFF",
              }}
            >
              {inquiry.status}
            </span>
          </div>
        </div>

        {/* Message */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted-crm, var(--muted))", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Client Message / Project Scope:
          </span>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              background: "var(--surface-raised, var(--paper))",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid var(--border-hairline-light, var(--line))",
              color: "var(--text-primary)",
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {inquiry.message}
          </p>
        </div>

        {/* Reference Material & Inspiration Assets */}
        {(inquiry.referenceUrl || inquiry.referenceImage) && (
          <div
            style={{
              marginBottom: 18,
              padding: "16px",
              borderRadius: 12,
              background: "var(--card-bg-crm, var(--surface-raised))",
              border: "1px solid var(--border-hairline, var(--line))",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--accent-blue, #6C4CFF)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 10,
              }}
            >
              Client Reference &amp; Visual Inspiration
            </span>

            <div style={{ display: "grid", gap: 12 }}>
              {inquiry.referenceUrl && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "var(--surface-raised, rgba(0,0,0,0.03))",
                    border: "1px solid var(--border-hairline-light, var(--line))",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      Benchmark Link:
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--accent-blue, #6C4CFF)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {inquiry.referenceUrl}
                    </span>
                  </div>
                  <a
                    href={inquiry.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-outline"
                    style={{
                      padding: "6px 12px",
                      fontSize: 11,
                      fontWeight: 600,
                      height: "auto",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    Open Link &rarr;
                  </a>
                </div>
              )}

              {inquiry.referenceImage && (
                <div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    Uploaded Reference Mockup / Asset:
                  </span>
                  <div
                    style={{
                      position: "relative",
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "1px solid var(--border-hairline, var(--line))",
                      maxWidth: 420,
                      background: "var(--surface-raised)",
                    }}
                  >
                    <img
                      src={inquiry.referenceImage}
                      alt="Client Reference Mockup"
                      style={{
                        width: "100%",
                        maxHeight: 280,
                        objectFit: "contain",
                        display: "block",
                        background: "rgba(0,0,0,0.02)",
                      }}
                    />
                    <div
                      style={{
                        padding: "8px 12px",
                        background: "var(--card-bg-crm, var(--paper))",
                        borderTop: "1px solid var(--border-hairline, var(--line))",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>Client Provided Asset</span>
                      <a
                        href={inquiry.referenceImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 11,
                          color: "var(--accent-blue, #6C4CFF)",
                          fontWeight: 600,
                          textDecoration: "underline",
                        }}
                      >
                        Open Full Image &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Update Form */}
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted-crm, var(--muted))", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            Update Pipeline Status:
          </span>
          <StatusUpdateForm inquiryId={inquiry.id} currentStatus={inquiry.status} />
        </div>
      </div>

      {/* Audit History */}
      <div
        id="inquiry-audit-history"
        style={{
          background: "var(--surface-raised, var(--paper-alt))",
          border: "1px solid var(--border-hairline-light, var(--line))",
          borderRadius: 16,
          padding: 18,
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
            Inquiry Audit &amp; Activity History
          </h4>
          <span style={{ fontSize: 11, color: "var(--text-muted-crm, var(--muted))" }}>
            {auditLogs.length} logged {auditLogs.length === 1 ? "event" : "events"}
          </span>
        </div>

        {auditLogs.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {auditLogs.map((log) => {
              const meta = log.metadata as Record<string, unknown> | null;
              return (
                <li
                  key={log.id}
                  style={{
                    fontSize: 12,
                    padding: "8px 12px",
                    borderRadius: 8,
                    backgroundColor: "var(--card-bg-crm, var(--paper))",
                    border: "1px solid var(--border-hairline, var(--line))",
                    color: "var(--text-primary)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>{log.actor ? log.actor.name : "System"}</span> &middot; Action: {log.action}
                    {meta?.field === "status" && (
                      <span> &rarr; Status: <strong>{String(meta?.new)}</strong></span>
                    )}
                  </div>
                  <time style={{ color: "var(--text-muted-crm, var(--muted))", fontSize: 11 }}>
                    {new Date(log.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </time>
                </li>
              );
            })}
          </ul>
        ) : (
          <div style={{ padding: "12px 14px", borderRadius: 8, background: "var(--card-bg-crm, var(--paper))", border: "1px dashed var(--border-hairline)", fontSize: 12, color: "var(--text-muted-crm)" }}>
            Audit trail initialized &middot; Inquiry created on {new Date(inquiry.createdAt).toLocaleString()}. Any subsequent status changes or modifications will be recorded here.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--page-bg)", padding: "20px 0 60px" }}>
      <ClientProfileCRM
        user={serializedUser}
        inquiries={serializedInquiries}
        currentAdminId={session.user.id}
        inquiryStatusSection={inquiryStatusSection}
        backUrl="/admin/inquiry"
        pageTitle="Customer Information"
      />
    </main>
  );
}
