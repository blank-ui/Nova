import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { getAuthorizedProject } from "@/lib/project-access";

interface MilestonesPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectMilestonesPage({ params }: MilestonesPageProps) {
  const { id } = await params;

  if (!/^c[0-9a-z]{24}$/.test(id)) {
    notFound();
  }

  const project = await getAuthorizedProject(id);
  if (!project) {
    notFound();
  }

  const sortedMilestones = [...project.milestones].sort((a, b) => {
    if (!a.dueAt && !b.dueAt) return 0;
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });

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
        <div className="eyebrow">Milestone Timeline · {project.name}</div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 44px)", letterSpacing: "-0.05em", margin: "8px 0 0" }}>
          Project Milestones.
        </h1>
        <p style={{ maxWidth: 640, color: "var(--muted)", fontSize: 16, lineHeight: 1.8, marginTop: 8 }}>
          Key delivery gates, review stages, and approval deadlines for this initiative.
        </p>
      </div>

      {sortedMilestones.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: 20, letterSpacing: "-.04em", margin: "0 0 8px" }}>No milestones defined</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
            Our lead engineers and project manager are currently preparing the milestone schedule for this engagement.
          </p>
        </div>
      ) : (
        <div style={{ maxWidth: 840, display: "flex", flexDirection: "column", gap: 16 }}>
          {sortedMilestones.map((milestone, idx) => {
            const isCompleted = milestone.completedAt !== null;

            return (
              <article
                key={milestone.id}
                className="card"
                style={{
                  padding: 24,
                  borderLeft: isCompleted ? "4px solid #2b6a49" : "4px solid var(--blue)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
                  <div>
                    <span className="eyebrow" style={{ color: "var(--muted)", fontSize: 10 }}>
                      Phase {idx + 1}
                    </span>
                    <h2 style={{ fontSize: 20, letterSpacing: "-0.03em", margin: "4px 0" }}>
                      {milestone.title}
                    </h2>
                  </div>

                  <div>
                    {isCompleted ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          backgroundColor: "#e6f9ed",
                          color: "#1e4620",
                        }}
                      >
                        <CheckCircle2 size={14} /> Completed {new Date(milestone.completedAt!).toLocaleDateString()}
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor: "var(--lav)",
                          color: "var(--blue)",
                        }}
                      >
                        <Clock size={14} /> In Progress
                      </span>
                    )}
                  </div>
                </div>

                {milestone.description && (
                  <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, margin: "8px 0 16px" }}>
                    {milestone.description}
                  </p>
                )}

                <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 20, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                  <span>Target Date: {milestone.dueAt ? new Date(milestone.dueAt).toLocaleDateString() : "To be scheduled"}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
