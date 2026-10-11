import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { getAuthorizedProject } from "@/lib/project-access";

interface TasksPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectTasksPage({ params }: TasksPageProps) {
  const { id } = await params;

  if (!/^c[0-9a-z]{24}$/.test(id)) {
    notFound();
  }

  const project = await getAuthorizedProject(id);
  if (!project) {
    notFound();
  }

  const openTasks = project.tasks.filter((t) => t.completedAt === null);
  const completedTasks = project.tasks.filter((t) => t.completedAt !== null);

  return (
    <main className="shell" style={{ padding: "50px 0 80px" }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href={`/portal/projects/${project.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          <ArrowLeft size={16} /> Back to {project.name}
        </Link>
      </div>

      <div style={{ marginBottom: 36 }}>
        <div className="eyebrow">Deliverables & Progress · {project.name}</div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 44px)", letterSpacing: "-0.05em", margin: "8px 0 0" }}>
          Project Tasks.
        </h1>
        <p style={{ maxWidth: 640, color: "var(--muted)", fontSize: 16, lineHeight: 1.8, marginTop: 8 }}>
          Work items, deliverables, and production tasks tracked for your review.
        </p>
      </div>

      {project.tasks.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: 20, letterSpacing: "-.04em", margin: "0 0 8px" }}>No tasks added yet</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
            Deliverables and review items will appear here as the development sprint kicks off.
          </p>
        </div>
      ) : (
        <div style={{ maxWidth: 840, display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Active / In Progress Tasks */}
          <section>
            <h2 style={{ fontSize: 20, letterSpacing: "-0.03em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={18} color="var(--blue)" /> In Progress ({openTasks.length})
            </h2>

            {openTasks.length === 0 ? (
              <div className="card" style={{ padding: 20, color: "var(--muted)", fontSize: 14 }}>
                All scheduled tasks are currently completed!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {openTasks.map((t) => (
                  <div
                    key={t.id}
                    className="card"
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{t.title}</div>
                      {t.dueAt && (
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                          Target Date: {new Date(t.dueAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: "var(--lav)",
                        color: "var(--blue)",
                      }}
                    >
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <section>
              <h2 style={{ fontSize: 20, letterSpacing: "-0.03em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={18} color="#2b6a49" /> Completed ({completedTasks.length})
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {completedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="card"
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      opacity: 0.85,
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, textDecoration: "line-through", color: "var(--muted)" }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                        Completed: {new Date(t.completedAt!).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: "#e6f9ed",
                        color: "#1e4620",
                      }}
                    >
                      Done
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
