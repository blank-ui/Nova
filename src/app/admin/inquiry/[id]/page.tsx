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
      OR: [
        { email: inquiry.email },
        ...(inquiry.name ? [{ name: { contains: inquiry.name } }] : []),
      ],
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
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Client Message / Project Scope:
          </span>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              background: "var(--paper)",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid var(--line)",
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {inquiry.message}
          </p>
        </div>

        {/* Status Update Form */}
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            Update Pipeline Status:
          </span>
          <StatusUpdateForm inquiryId={inquiry.id} currentStatus={inquiry.status} />
        </div>
      </div>

      {/* Audit History */}
      {auditLogs.length > 0 && (
        <div style={{ background: "var(--paper-alt, rgba(0,0,0,0.02))", border: "1px solid var(--line)", borderRadius: 16, padding: 18 }}>
          <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700 }}>Audit History</h4>
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
                    backgroundColor: "var(--paper)",
                    border: "1px solid var(--line)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>{log.actor ? log.actor.name : "System"}</span> &middot; Action: {log.action}
                    {meta?.field === "status" && (
                      <span> &rarr; Status: <strong>{String(meta?.new)}</strong></span>
                    )}
                  </div>
                  <time style={{ color: "var(--muted)", fontSize: 11 }}>
                    {new Date(log.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </time>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--page-bg, #F6F4EE)", padding: "20px 0 60px" }}>
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
