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

  // Fetch all registered users with their projects
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

  // Separate client users from staff users
  const clientUsers = clients.filter((c) => c.role === "CLIENT");
  const staffUsers = clients.filter((c) => c.role !== "CLIENT");

  // If a specific clientId was requested, use it; otherwise prefer first real client, falling back to session admin
  const selectedClientId =
    resolvedParams.clientId || (clientUsers.length > 0 ? clientUsers[0].id : session.user.id);

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

  const isAdminWorkspace = targetUser.role === "ADMIN";

  // Fetch inquiries for this target account
  const inquiries = await prisma.inquiry.findMany({
    where: {
      email: targetUser.email,
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
      {/* Page Header - distinctly tailored for Admin Workspace vs Client Workspaces */}
      <PageHeader
        titleLine1={isAdminWorkspace ? "Workspace &" : "Client Projects &"}
        titleLine2={isAdminWorkspace ? "Projects" : "Workspaces"}
        backHref="/admin"
        stats={[
          {
            icon: <FolderKanban size={18} strokeWidth={1.8} />,
            value: targetUser.projects.length,
            badgeLabel: "Projects",
            badgeVariant: "info",
            caption: isAdminWorkspace ? "Internal studio deliverables" : "Active client deliverables",
          },
          {
            icon: <User size={18} strokeWidth={1.8} />,
            value: targetUser.name,
            badgeLabel: targetUser.role === "ADMIN" ? "Admin" : targetUser.role === "DEVELOPER" ? "Developer" : targetUser.role === "FINANCE" ? "Finance" : "Client",
            badgeVariant: targetUser.role === "ADMIN" ? "info" : "brand",
            caption: targetUser.email,
          },
          {
            icon: <MessageSquare size={18} strokeWidth={1.8} />,
            value: inquiries.length,
            badgeLabel: "Inquiries",
            badgeVariant: "warning",
            caption: isAdminWorkspace ? "Studio submissions logged" : "Customer submissions",
          },
        ]}
      />

      {/* Clear Workspace Switcher: Admin Workspace vs Clients */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            padding: "10px 16px",
            background: "var(--surface-raised)",
            border: "1px solid var(--border-hairline)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            fontSize: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontWeight: 700, color: "var(--text-muted-crm)", textTransform: "uppercase", fontSize: 10, whiteSpace: "nowrap" }}>
            Workspace:
          </span>

          {/* Admin Workspace Tab */}
          <Link
            href={`/admin/projects?clientId=${session.user.id}`}
            style={{
              padding: "5px 14px",
              borderRadius: "var(--radius-pill)",
              background: targetUser.id === session.user.id ? "var(--ink-crm)" : "transparent",
              color: targetUser.id === session.user.id ? "var(--ink-crm-text, #FFFFFF)" : "var(--text-secondary)",
              fontWeight: targetUser.id === session.user.id ? 700 : 500,
              textDecoration: "none",
              whiteSpace: "nowrap",
              border: targetUser.id === session.user.id ? "none" : "1px solid var(--border-hairline)",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              transition: "all 0.15s ease",
            }}
          >
            <span>👑</span>
            <span>Admin Workspace ({session.user.name})</span>
          </Link>

          <span style={{ color: "var(--border-hairline)", margin: "0 2px" }}>|</span>

          {/* Client Workspaces List */}
          {clientUsers.length > 0 ? (
            clientUsers.map((c) => {
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
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>👤</span>
                  <span>{c.name} ({c.projects.length} proj)</span>
                </Link>
              );
            })
          ) : (
            <span style={{ color: "var(--text-muted-crm)", fontSize: 11, fontStyle: "italic" }}>
              No registered client accounts yet &middot; Leads managed in{" "}
              <Link href="/admin/inquiry" style={{ color: "var(--accent-blue, #6C4CFF)", textDecoration: "underline" }}>
                Inquiries
              </Link>
            </span>
          )}
        </div>
      </div>

      <ClientProfileCRM
        user={serializedUser}
        inquiries={serializedInquiries}
        currentAdminId={session.user.id}
        backUrl="/admin"
        pageTitle={isAdminWorkspace ? "Admin Workspace Account" : "Customer Information"}
        showHeader={false}
      />
    </div>
  );
}
