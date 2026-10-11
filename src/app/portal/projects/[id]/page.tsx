import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Calendar, CheckCircle2, Clock } from "lucide-react";
import { getAuthorizedProject } from "@/lib/project-access";

interface ProjectDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const { id } = await params;

  // Validate cuid format to prevent malformed queries
  if (!/^c[0-9a-z]{24}$/.test(id)) {
    notFound();
  }

  const project = await getAuthorizedProject(id);
  if (!project) {
    notFound();
  }

  const completedMilestones = project.milestones.filter((m) => m.completedAt !== null);
  const pendingMilestones = project.milestones.filter((m) => m.completedAt === null);
  const completedTasks = project.tasks.filter((t) => t.completedAt !== null);
  const pendingTasks = project.tasks.filter((t) => t.completedAt === null);

  return (
    <main className="shell" style={{ padding: "50px 0 80px" }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/portal/projects"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          <ArrowLeft size={16} /> Back to projects
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 30 }}>
        <div>
          <div className="eyebrow">Project Reference · {project.id.slice(0, 10)}</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 46px)", letterSpacing: "-0.05em", margin: "8px 0 0" }}>
            {project.name}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              backgroundColor: "#e8eaed",
              color: "var(--ink)",
            }}
          >
            {project.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {project.description && (
        <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.8, maxWidth: 760, marginBottom: 36 }}>
          {project.description}
        </p>
      )}

      {/* Progress Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 36 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 6 }}>Milestones Completed</div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em" }}>
            {completedMilestones.length} <span style={{ fontSize: 18, color: "var(--muted)", fontWeight: 500 }}>/ {project.milestones.length}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{pendingMilestones.length} active or upcoming</div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 6 }}>Deliverables Finished</div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em" }}>
            {completedTasks.length} <span style={{ fontSize: 18, color: "var(--muted)", fontWeight: 500 }}>/ {project.tasks.length}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{pendingTasks.length} in progress</div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 6 }}>Last Updated</div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 8 }}>
            {new Date(project.updatedAt).toLocaleDateString()}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            Created {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 6 }}>Team Discussion</div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 8 }}>
              Project Messages
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              Direct thread with the Nova team
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <Link
              href={`/portal/projects/${project.id}/messages`}
              className="button button-secondary"
              style={{ fontSize: 12, padding: "6px 14px", height: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              Open Thread <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        {/* Milestones Preview Card */}
        <section className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div className="eyebrow">Roadmap</div>
              <h2 style={{ fontSize: 20, letterSpacing: "-0.03em", margin: "4px 0 0" }}>
                Key Milestones
              </h2>
            </div>
            <Link
              href={`/portal/projects/${project.id}/milestones`}
              className="nav-link"
              style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
            >
              Full timeline <ArrowUpRight size={14} />
            </Link>
          </div>

          {project.milestones.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>No milestones scheduled yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {project.milestones.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    border: "1px solid var(--line)",
                    background: "var(--paper)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
                    {m.dueAt && (
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                        Due: {new Date(m.dueAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {m.completedAt ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#2b6a49", fontSize: 12, fontWeight: 700 }}>
                      <CheckCircle2 size={14} /> Done
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: 12 }}>
                      <Clock size={14} /> Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Deliverables / Tasks Preview Card */}
        <section className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div className="eyebrow">Deliverables</div>
              <h2 style={{ fontSize: 20, letterSpacing: "-0.03em", margin: "4px 0 0" }}>
                Client Tasks & Scope
              </h2>
            </div>
            <Link
              href={`/portal/projects/${project.id}/tasks`}
              className="nav-link"
              style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
            >
              View all tasks <ArrowUpRight size={14} />
            </Link>
          </div>

          {project.tasks.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>No deliverables entered yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {project.tasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    border: "1px solid var(--line)",
                    background: "var(--paper)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</div>
                    {t.dueAt && (
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                        Target: {new Date(t.dueAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {t.completedAt ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#2b6a49", fontSize: 12, fontWeight: 700 }}>
                      <CheckCircle2 size={14} /> Completed
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: 12 }}>
                      <Calendar size={14} /> Open
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
