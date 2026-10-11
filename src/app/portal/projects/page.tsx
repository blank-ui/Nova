import Link from "next/link";
import { ArrowUpRight, FolderKanban, Calendar, CheckCircle2 } from "lucide-react";
import { requireClient } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export default async function PortalProjectsPage() {
  const session = await requireClient();
  const isUserAdmin = session.user.role === "ADMIN";

  const projects = await prisma.project.findMany({
    where: isUserAdmin ? {} : { clientId: session.user.id },
    include: {
      milestones: {
        orderBy: { dueAt: "asc" },
      },
      tasks: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="shell" style={{ padding: "50px 0 80px" }}>
      <div className="eyebrow">
        {isUserAdmin ? "Client space (Admin Preview) · Projects" : "Client space · Projects"}
      </div>
      <h1 style={{ fontSize: "clamp(36px, 5vw, 54px)", letterSpacing: "-.07em", margin: "12px 0 8px" }}>
        Your Projects.
      </h1>
      <p style={{ maxWidth: 640, color: "var(--muted)", fontSize: 16, lineHeight: 1.8, marginBottom: 40 }}>
        All engagements and product work associated with your client account at Nova.
      </p>

      {projects.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "inline-grid", placeItems: "center", width: 48, height: 48, borderRadius: 16, background: "var(--lav)", color: "var(--blue)", marginBottom: 16 }}>
            <FolderKanban size={24} />
          </div>
          <h2 style={{ fontSize: 22, letterSpacing: "-.04em", margin: "0 0 8px" }}>No projects provisioned yet</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8, margin: "0 0 20px" }}>
            We haven&apos;t linked an active project to this account yet. If you have an inquiry in progress, our team will configure your workspace upon kick-off.
          </p>
          <Link href="/contact" className="button" style={{ display: "inline-flex" }}>
            Submit an Inquiry <ArrowUpRight size={14} />
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {projects.map((project) => {
            const completedMilestones = project.milestones.filter((m) => m.completedAt !== null).length;
            const completedTasks = project.tasks.filter((t) => t.completedAt !== null).length;

            return (
              <article key={project.id} className="card card-hover-glow" style={{ padding: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          backgroundColor: "#e8eaed",
                          color: "var(--ink)",
                        }}
                      >
                        {project.status.replace("_", " ")}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>
                        Reference: {project.id.slice(0, 10)}
                      </span>
                    </div>

                    <h2 style={{ fontSize: 24, letterSpacing: "-.04em", margin: "4px 0" }}>
                      <Link href={`/portal/projects/${project.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {project.name}
                      </Link>
                    </h2>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <Link
                      href={`/portal/projects/${project.id}`}
                      className="button"
                      style={{ padding: "10px 18px", fontSize: 13 }}
                    >
                      Project Details <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>

                {project.description && (
                  <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 20px", maxWidth: 760 }}>
                    {project.description}
                  </p>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 16,
                    paddingTop: 18,
                    borderTop: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)" }}>
                    <Calendar size={15} /> Created: {new Date(project.createdAt).toLocaleDateString()}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={15} color="var(--blue)" />
                    <span>
                      <strong>{completedMilestones}</strong> of <strong>{project.milestones.length}</strong> milestones completed
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={15} color="#2b6a49" />
                    <span>
                      <strong>{completedTasks}</strong> of <strong>{project.tasks.length}</strong> deliverables completed
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
