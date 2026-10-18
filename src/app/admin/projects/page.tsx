import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { ClientProfileCRM } from "@/components/client-profile-crm";
import { PageHeader, SectionCard, Badge } from "@/components/admin-ui";
import { FolderKanban, User, MessageSquare } from "lucide-react";

interface AdminProjectsPageProps {
  searchParams?: Promise<{ clientId?: string }>;
}

export default async function AdminProjectsPage({ searchParams }: AdminProjectsPageProps) {
  const session = await requireAdmin();
  const resolvedParams = searchParams ? await searchParams : {};

  // Fetch all client users
  const clients = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
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

  const selectedClientId = resolvedParams.clientId || clients[0]?.id || session.user.id;
  let targetUser: (typeof clients)[number] | null = clients.find((c) => c.id === selectedClientId) ?? null;

  if (!targetUser) {
    targetUser = await prisma.user.findUnique({
      where: { id: session.user.id },
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
  }

  if (!targetUser) {
    return (
      <main className="shell" style={{ padding: "50px 0" }}>
        <p>No user accounts found.</p>
      </main>
    );
  }

  // Fetch inquiries for this target client
  const inquiries = await prisma.inquiry.findMany({
    where: {
      OR: [
        { email: targetUser.email },
        ...(targetUser.name ? [{ name: { contains: targetUser.name } }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedUser = {
    ...targetUser,
    createdAt: targetUser.createdAt.toISOString(),
    projects: targetUser.projects.map((p) => ({
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
  };

  const serializedInquiries = inquiries.map((inq) => ({
    ...inq,
    createdAt: inq.createdAt.toISOString(),
  }));

  return (
    <div className="animate-fade-in-up" style={{ width: "100%" }}>
      {/* Page Header */}
      <PageHeader
        titleLine1="Client Projects &"
        titleLine2="Workspaces"
        backHref="/admin"
        stats={[
          {
            icon: <FolderKanban size={18} strokeWidth={1.8} />,
            value: targetUser.projects.length,
            badgeLabel: "Projects",
            badgeVariant: "info",
            caption: "Active client deliverables",
          },
          {
            icon: <User size={18} strokeWidth={1.8} />,
            value: targetUser.name,
            badgeLabel: "Client",
            badgeVariant: "brand",
            caption: targetUser.email,
          },
          {
            icon: <MessageSquare size={18} strokeWidth={1.8} />,
            value: inquiries.length,
            badgeLabel: "Inquiries",
            badgeVariant: "warning",
            caption: "Customer submissions",
          },
        ]}
      />

      {/* Client Quick Switcher Bar for Admins */}
      {clients.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              padding: "10px 16px",
              background: "var(--surface-raised)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius-pill)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              overflowX: "auto",
              fontSize: 12,
            }}
          >
            <span style={{ fontWeight: 700, color: "var(--text-muted-crm)", textTransform: "uppercase", fontSize: 10, whiteSpace: "nowrap" }}>
              Switch Client:
            </span>
            {clients.map((c) => {
              const isActive = c.id === targetUser?.id;
              return (
                <Link
                  key={c.id}
                  href={`/admin/projects?clientId=${c.id}`}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "var(--radius-pill)",
                    background: isActive ? "var(--ink-crm)" : "transparent",
                    color: isActive ? "var(--ink-crm-text, #FFFFFF)" : "var(--text-secondary)",
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    border: isActive ? "none" : "1px solid var(--border-hairline)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {c.name} ({c.projects.length} proj)
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <ClientProfileCRM
        user={serializedUser}
        inquiries={serializedInquiries}
        currentAdminId={session.user.id}
        backUrl="/admin"
        pageTitle="Customer Information"
      />
    </div>
  );
}
