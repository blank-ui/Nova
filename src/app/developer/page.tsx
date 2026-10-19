import { requireDeveloper } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  CheckCircle2,
  FolderKanban,
  ExternalLink,
  GitBranch,
  Terminal,
} from "lucide-react";

export default async function DeveloperWorkspace() {
  const session = await requireDeveloper();
  const firstName = session.user.name ? session.user.name.trim().split(/\s+/)[0] : "Developer";

  // Fetch all projects with tasks and milestones
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      client: { select: { name: true, email: true } },
      tasks: { orderBy: { dueAt: "asc" } },
      milestones: { orderBy: { dueAt: "asc" } },
    },
  });

  const allTasks = projects.flatMap((p) =>
    p.tasks.map((t) => ({ ...t, projectName: p.name, projectId: p.id, clientName: p.client.name }))
  );

  const pendingTasks = allTasks.filter((t) => !t.completedAt);
  const completedTasks = allTasks.filter((t) => Boolean(t.completedAt));

  return (
    <main className="shell" style={{ padding: "40px 0 80px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <div className="eyebrow" style={{ color: "#10b981", display: "flex", alignItems: "center", gap: 6 }}>
            <Terminal size={14} /> Engineering & Sprint Console
          </div>
          <h1 style={{ fontSize: 32, letterSpacing: "-.05em", margin: "8px 0 6px", color: "var(--ink)" }}>
            Welcome back, {firstName}.
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, maxWidth: 540 }}>
            Here is your live development board: open technical tasks, deliverables, client repository links, and active studio sprints.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/portal/projects"
            className="button button-outline"
            style={{ padding: "10px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
          >
            <FolderKanban size={14} /> All Projects ({projects.length})
          </Link>
          <a
            href="https://github.com/blank-ui/Nova"
            target="_blank"
            rel="noopener noreferrer"
            className="button"
            style={{ padding: "10px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6, background: "#101322" }}
          >
            <GitBranch size={14} /> Nova GitHub <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: 16,
          marginBottom: 36,
        }}
      >
        <div className="card" style={{ padding: "20px 22px", borderTop: "3px solid #10b981" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>
            Open Sprint Tasks
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "var(--ink)", margin: "8px 0 4px", letterSpacing: "-.05em" }}>
            {pendingTasks.length}
          </div>
          <div style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>Active engineering pipeline</div>
        </div>

        <div className="card" style={{ padding: "20px 22px", borderTop: "3px solid #6C4CFF" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>
            Shipped Deliverables
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "var(--ink)", margin: "8px 0 4px", letterSpacing: "-.05em" }}>
            {completedTasks.length}
          </div>
          <div style={{ fontSize: 12, color: "#6C4CFF", fontWeight: 600 }}>Completed tasks & QA passed</div>
        </div>

        <div className="card" style={{ padding: "20px 22px", borderTop: "3px solid #FFB547" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>
            Client Repositories
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "var(--ink)", margin: "8px 0 4px", letterSpacing: "-.05em" }}>
            {projects.length}
          </div>
          <div style={{ fontSize: 12, color: "#d97706", fontWeight: 600 }}>Monitored environments</div>
        </div>
      </div>

      {/* Main Sprint Tasks Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        <div className="card" style={{ padding: "clamp(18px, 4vw, 28px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 20, letterSpacing: "-.03em", margin: "0 0 4px", color: "var(--ink)" }}>
                Active Sprint Deliverables & Tasks
              </h2>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
                Engineering items currently assigned across client development branches.
              </p>
            </div>
            <span style={{ fontSize: 12, background: "rgba(16,185,129,0.1)", color: "#059669", padding: "3px 10px", borderRadius: 99, fontWeight: 700 }}>
              {pendingTasks.length} Remaining
            </span>
          </div>

          {pendingTasks.length === 0 ? (
            <div style={{ padding: "36px 0", textAlign: "center", color: "var(--muted)" }}>
              <CheckCircle2 size={32} style={{ color: "#10b981", margin: "0 auto 10px" }} />
              <p style={{ margin: 0, fontWeight: 600, color: "var(--ink)" }}>All sprint tasks are up to date!</p>
              <p style={{ fontSize: 12, margin: "4px 0 0" }}>Create new tasks from project pages or check repository branches.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    padding: "14px 18px",
                    borderRadius: 12,
                    background: "var(--paper)",
                    border: "1px solid var(--line)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: "2px solid #10b981",
                        display: "grid",
                        placeItems: "center",
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 12, marginTop: 2 }}>
                        <span>Project: <strong>{task.projectName}</strong></span>
                        <span>Client: {task.clientName}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/portal/projects/${task.projectId}/tasks`}
                    className="button button-outline"
                    style={{ padding: "6px 12px", fontSize: 12 }}
                  >
                    View Task Details &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Technical Directory */}
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 20, letterSpacing: "-.03em", margin: "0 0 16px", color: "var(--ink)" }}>
            Engineered Projects & Microservices
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {projects.map((proj) => (
              <div
                key={proj.id}
                style={{
                  padding: "18px 20px",
                  borderRadius: 14,
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>
                      {proj.name}
                    </h3>
                    <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(108,76,255,0.1)", color: "#6C4CFF", padding: "2px 6px", borderRadius: 4 }}>
                      {proj.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 14px", lineHeight: 1.5 }}>
                    {proj.description || "Digital infrastructure and web application build."}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>
                    {proj.tasks.length} tasks · {proj.milestones.length} milestones
                  </span>
                  <Link
                    href={`/portal/projects/${proj.id}`}
                    style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)", textDecoration: "none" }}
                  >
                    Open &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
