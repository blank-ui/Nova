import Link from "next/link";
import { ArrowUpRight, FolderKanban, Clock, CheckCircle2 } from "lucide-react";
import { requireClient } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { NovaMascotFull } from "@/components/brand";


export default async function PortalOverviewPage() {
  const session = await requireClient();
  const isUserAdmin = session.user.role === "ADMIN";

  const projects = await prisma.project.findMany({
    where: isUserAdmin ? {} : { clientId: session.user.id },
    include: {
      milestones: true,
      tasks: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const activeProjects = projects.filter((p) => p.status === "IN_PROGRESS" || p.status === "PLANNING" || p.status === "REVIEW");
  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = projects.reduce((acc, p) => acc + p.tasks.filter((t) => t.completedAt !== null).length, 0);

  return (
    <main className="shell" style={{ padding: "50px 0 80px" }}>
      {isUserAdmin && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: 12,
            background: "var(--paper)",
            border: "1px solid var(--line)",
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 13,
          }}
        >
          <span>
            You are viewing the <strong>Client Portal</strong> as an Administrator. This shows client-facing project tracking and deliverables.
          </span>
          <Link href="/admin" className="button button-outline" style={{ fontSize: 12, padding: "6px 14px", height: "auto" }}>
            &larr; Return to Admin Workspace
          </Link>
        </div>
      )}

      <div className="eyebrow">
        {isUserAdmin ? `Client space (Admin Preview) · ${session.user.name}` : `Client space · ${session.user.name}`}
      </div>
      <h1 style={{ fontSize: "clamp(36px, 5vw, 54px)", letterSpacing: "-.07em", margin: "12px 0 8px" }}>
        Your project space.
      </h1>
      <p style={{ maxWidth: 640, color: "var(--muted)", fontSize: 16, lineHeight: 1.8, marginBottom: 40 }}>
        Welcome back. Track active initiatives, milestone timelines, and deliverable progress directly with our studio team.
      </p>

      {/* Stats Summary Bar */}
      <div className="animate-fade-in-up" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 40 }}>
        <div className="card card-hover-glow" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>
            <FolderKanban size={16} color="var(--blue)" /> Total Projects
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.05em" }}>{projects.length}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{activeProjects.length} currently active</div>
        </div>

        <div className="card card-hover-glow" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>
            <CheckCircle2 size={16} color="#2b6a49" /> Deliverables Completed
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.05em" }}>{completedTasks}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>of {totalTasks} tracked tasks</div>
        </div>

        <div className="card card-hover-glow" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>
            <Clock size={16} color="var(--blue)" /> Next Milestones
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.05em" }}>
            {projects.reduce((acc, p) => acc + p.milestones.filter((m) => m.completedAt === null).length, 0)}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>pending review or completion</div>
        </div>
      </div>

      {/* Projects List Section */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, letterSpacing: "-.04em", margin: 0 }}>Recent Projects</h2>
          {projects.length > 0 && (
            <Link href="/portal/projects" className="nav-link" style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              View all ({projects.length}) <ArrowUpRight size={14} />
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="card card-hover-glow" style={{ padding: "44px 32px", textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <NovaMascotFull width={160} height={160} />
            </div>
            <h3 style={{ fontSize: 22, letterSpacing: "-.04em", margin: "0 0 8px" }}>No active projects yet</h3>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8, margin: "0 0 22px" }}>
              Nova ships websites at light speed! When our studio sets up a dedicated development or design project for your organization, its milestones and progress will appear right here.
            </p>
            <Link href="/contact" className="button" style={{ display: "inline-flex" }}>
              Inquire About a Project <ArrowUpRight size={14} />
            </Link>
          </div>
        ) : (

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {projects.slice(0, 4).map((p) => {
              const completedCount = p.tasks.filter((t) => t.completedAt !== null).length;
              const pendingMilestones = p.milestones.filter((m) => m.completedAt === null).length;

              return (
                <article key={p.id} className="card card-hover-glow" style={{ padding: 26, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                      <span className="eyebrow" style={{ color: "var(--blue)" }}>
                        {p.status.replace("_", " ")}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        Updated {new Date(p.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 20, letterSpacing: "-0.04em", margin: "0 0 8px" }}>
                      <Link href={`/portal/projects/${p.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {p.name}
                      </Link>
                    </h3>

                    {p.description && (
                      <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 16px" }}>
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                    <div style={{ display: "flex", gap: 16, color: "var(--muted)" }}>
                      <span>{p.milestones.length} milestones ({pendingMilestones} open)</span>
                      <span>{completedCount}/{p.tasks.length} tasks</span>
                    </div>
                    <Link href={`/portal/projects/${p.id}`} style={{ color: "var(--blue)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      Open <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
