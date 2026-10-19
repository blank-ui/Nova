import { requireDeveloper } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  CheckCircle2,
  FolderKanban,
  ExternalLink,
  GitBranch,
  Terminal,
  Shield,
  Layers,
  ArrowUpRight,
  Clock,
  Server,
  Code2,
  Calendar,
} from "lucide-react";
import {
  PageHeader,
  SectionCard,
  StatTile,
  ProfileCard,
  DetailRow,
  Badge,
  EmptyState,
  PillButton,
} from "@/components/admin-ui";

export default async function DeveloperWorkspace() {
  const session = await requireDeveloper();

  // Fetch db user and all projects with tasks and milestones
  const [dbUser, projects] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        twoFactorEnabled: true,
      },
    }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        client: { select: { name: true, email: true } },
        tasks: { orderBy: { dueAt: "asc" } },
        milestones: { orderBy: { dueAt: "asc" } },
      },
    }),
  ]);

  const allTasks = projects.flatMap((p) =>
    p.tasks.map((t) => ({
      ...t,
      projectName: p.name,
      projectId: p.id,
      clientName: p.client.name,
    }))
  );

  const pendingTasks = allTasks.filter((t) => !t.completedAt);
  const completedTasks = allTasks.filter((t) => Boolean(t.completedAt));

  const userName = dbUser?.name ?? session.user.name ?? "Developer";
  const userEmail = dbUser?.email ?? session.user.email ?? "";
  const userImage = dbUser?.image ?? session.user.image ?? null;

  return (
    <div className="animate-fade-in-up" style={{ width: "100%" }}>
      {/* Page Header */}
      <PageHeader
        titleLine1="Engineering"
        titleLine2="Console"
        stats={[
          {
            icon: <Terminal size={18} strokeWidth={1.8} />,
            value: pendingTasks.length,
            badgeLabel: "Active",
            badgeVariant: "warning",
            caption: "Open sprint tasks",
          },
          {
            icon: <CheckCircle2 size={18} strokeWidth={1.8} />,
            value: completedTasks.length,
            badgeLabel: "Shipped",
            badgeVariant: "success",
            caption: "Completed deliverables",
          },
          {
            icon: <FolderKanban size={18} strokeWidth={1.8} />,
            value: projects.length,
            badgeLabel: "Repositories",
            badgeVariant: "info",
            caption: "Monitored workspaces",
          },
        ]}
      />

      {/* Action Strip */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <PillButton variant="primary" href="/developer/repos" icon={<GitBranch size={14} />}>
            Studio Repositories
          </PillButton>
          <PillButton variant="outline" href="/portal/projects" icon={<FolderKanban size={14} />}>
            Client Projects ({projects.length})
          </PillButton>
          <PillButton
            variant="subtle"
            href="https://github.com/blank-ui/Nova"
            target="_blank"
            rel="noopener noreferrer"
            icon={<ExternalLink size={14} />}
          >
            Nova GitHub
          </PillButton>
        </div>
      </div>

      {/* Main Two-Column Grid matching Admin & Portal Shells */}
      <div
        className="overview-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.8fr) minmax(320px, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Left Column (65%) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          {/* 3 Metric Stat Tiles */}
          <div
            className="stat-tiles-row"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14,
            }}
          >
            <StatTile
              category="Sprint Pipeline"
              title="Open Tasks"
              value={pendingTasks.length}
              caption="Assigned technical items"
              variant="black"
              href="/developer"
              actionIcon="arrow"
            />
            <StatTile
              category="Deliverables"
              title="Shipped Items"
              value={completedTasks.length}
              caption="Passed QA verification"
              variant="teal"
              href="/developer"
              actionIcon="arrow"
            />
            <StatTile
              category="Workspaces"
              title="Active Repos"
              value={projects.length}
              caption="Monitored client builds"
              variant="blue"
              href="/developer/repos"
              actionIcon="arrow"
            />
          </div>

          {/* Active Sprint Deliverables & Tasks */}
          <SectionCard
            title="Active Sprint Deliverables & Tasks"
            headerRight={
              <Badge variant={pendingTasks.length > 0 ? "warning" : "success"}>
                {pendingTasks.length} Remaining
              </Badge>
            }
          >
            {pendingTasks.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 size={36} color="var(--accent-teal, #10b981)" />}
                title="All sprint tasks are up to date"
                description="No open engineering tasks or deliverables are waiting in the queue. New items will automatically surface here."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: "14px 18px",
                      borderRadius: "var(--radius-row)",
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border-hairline-light)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 14,
                      flexWrap: "wrap",
                      transition: "transform 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: "rgba(16, 185, 129, 0.1)",
                          color: "#10b981",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Code2 size={16} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: "var(--text-primary)",
                            marginBottom: 2,
                          }}
                        >
                          {task.title}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-muted-crm)",
                            display: "flex",
                            gap: 12,
                            flexWrap: "wrap",
                          }}
                        >
                          <span>
                            Project: <strong>{task.projectName}</strong>
                          </span>
                          <span>&middot;</span>
                          <span>Client: {task.clientName}</span>
                          {task.dueAt && (
                            <>
                              <span>&middot;</span>
                              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <Clock size={11} /> Due{" "}
                                {new Date(task.dueAt).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/portal/projects/${task.projectId}/tasks`}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "var(--radius-pill)",
                        fontSize: 12,
                        fontWeight: 600,
                        background: "var(--subtle-fill)",
                        color: "var(--text-primary)",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        border: "1px solid var(--border-hairline)",
                      }}
                    >
                      <span>Task Details</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Engineered Projects & Environments */}
          <SectionCard
            title="Engineered Projects & Microservices"
            headerRight={
              <Link
                href="/portal/projects"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--brand-primary, #6366F1)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>View All ({projects.length})</span>
                <ArrowUpRight size={13} />
              </Link>
            }
          >
            {projects.length === 0 ? (
              <EmptyState
                icon={<FolderKanban size={36} />}
                title="No project workspaces"
                description="No active client projects provisioned yet."
              />
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 14,
                }}
              >
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    style={{
                      padding: "16px 18px",
                      borderRadius: "var(--radius-card)",
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border-hairline-light)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 8,
                          gap: 8,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            margin: 0,
                            color: "var(--text-primary)",
                          }}
                        >
                          {proj.name}
                        </h3>
                        <Badge
                          variant={
                            proj.status === "COMPLETED"
                              ? "success"
                              : proj.status === "IN_PROGRESS"
                              ? "info"
                              : "warning"
                          }
                        >
                          {proj.status}
                        </Badge>
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted-crm)",
                          margin: "0 0 14px",
                          lineHeight: 1.5,
                        }}
                      >
                        {proj.description || "Digital infrastructure and application repository."}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: 12,
                        borderTop: "1px solid var(--border-hairline-light)",
                      }}
                    >
                      <span style={{ fontSize: 11, color: "var(--text-muted-crm)" }}>
                        {proj.tasks.length} tasks &middot; {proj.milestones.length} milestones
                      </span>
                      <Link
                        href={`/portal/projects/${proj.id}`}
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--brand-primary, #6366F1)",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span>Open</span>
                        <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column (35%) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Developer Profile Card */}
          <ProfileCard
            name={userName}
            role="DEVELOPER"
            subtitle="Studio Engineer &middot; Nova"
            image={userImage}
            openHref="/portal/security"
            badgeLabel="DEVELOPER"
            badgeVariant="info"
            actions={[
              {
                icon: <Shield size={16} strokeWidth={1.8} />,
                "aria-label": "Security & MFA settings",
                href: "/portal/security",
                title: "Security & MFA",
              },
            ]}
          />

          {/* Quick Engineering Fast Actions */}
          <SectionCard title="Engineering Fast Actions">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <DetailRow
                icon={<GitBranch size={16} />}
                label="Studio Repositories"
                value="Browse GitHub Targets"
                action={
                  <Link
                    href="/developer/repos"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--brand-primary, #6366F1)",
                      textDecoration: "none",
                    }}
                  >
                    View &rarr;
                  </Link>
                }
              />
              <DetailRow
                icon={<FolderKanban size={16} />}
                label="Client Projects"
                value="Deliverables & Sprints"
                action={
                  <Link
                    href="/portal/projects"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--brand-primary, #6366F1)",
                      textDecoration: "none",
                    }}
                  >
                    Manage &rarr;
                  </Link>
                }
              />
              <DetailRow
                icon={<Calendar size={16} />}
                label="Technical Appointments"
                value="Studio Consultations"
                action={
                  <Link
                    href="/portal/appointments"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--brand-primary, #6366F1)",
                      textDecoration: "none",
                    }}
                  >
                    Schedule &rarr;
                  </Link>
                }
              />
              <DetailRow
                icon={<Shield size={16} />}
                label="MFA & Governance"
                value={dbUser?.twoFactorEnabled ? "2FA Protected" : "Setup 2FA"}
                action={
                  <Link
                    href="/portal/security"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--brand-primary, #6366F1)",
                      textDecoration: "none",
                    }}
                  >
                    Configure &rarr;
                  </Link>
                }
              />
            </div>
          </SectionCard>

          {/* Infrastructure & Stack Specifications */}
          <SectionCard title="Stack & Environment">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <DetailRow
                icon={<Layers size={16} />}
                label="Application Framework"
                value={<Badge variant="neutral">Next.js 16.4</Badge>}
              />
              <DetailRow
                icon={<Server size={16} />}
                label="Runtime Engine"
                value={<Badge variant="neutral">Node.js 22 LTS</Badge>}
              />
              <DetailRow
                icon={<Terminal size={16} />}
                label="Database & ORM"
                value={<Badge variant="success">Prisma v6 &middot; MySQL</Badge>}
              />
              <DetailRow
                icon={<Shield size={16} />}
                label="Authentication Protocol"
                value={<Badge variant="admin">Better Auth &middot; TOTP</Badge>}
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
