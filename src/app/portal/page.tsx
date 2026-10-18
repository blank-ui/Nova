import Link from "next/link";
import { ArrowUpRight, FolderKanban, Clock, CheckCircle2, MessageSquare, Mail, Phone, Calendar, Sparkles } from "lucide-react";
import { requireClient } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { NovaMascotFull } from "@/components/brand";

export default async function PortalOverviewPage() {
  const session = await requireClient();
  const isUserAdmin = session.user.role === "ADMIN";

  const [projects, clientInquiries, clientUser] = await Promise.all([
    prisma.project.findMany({
      where: isUserAdmin ? {} : { clientId: session.user.id },
      include: {
        milestones: true,
        tasks: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.inquiry.findMany({
      where: isUserAdmin
        ? {}
        : {
            OR: [
              { email: session.user.email },
              ...(session.user.name ? [{ name: { contains: session.user.name } }] : []),
            ],
          },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        discordHandle: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  const activeProjects = projects.filter((p) => p.status === "IN_PROGRESS" || p.status === "PLANNING" || p.status === "REVIEW");
  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = projects.reduce((acc, p) => acc + p.tasks.filter((t) => t.completedAt !== null).length, 0);
  const clientPhone = clientInquiries[0]?.phone || null;
  const clientCompany = clientInquiries[0]?.company || "Client Workspace";

  return (
    <div className="animate-fade-in-up" style={{ width: "100%" }}>
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

        <div className="card card-hover-glow" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>
            <Calendar size={16} color="var(--blue)" /> Appointments
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.04em", margin: "4px 0" }}>
            Consultations
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            <Link href="/portal/appointments" style={{ color: "var(--blue)", fontWeight: 700, textDecoration: "none" }}>
              Request Session &rarr;
            </Link>
          </div>
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

      {/* Project Inquiries & Submissions */}
      <section style={{ marginTop: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 24, letterSpacing: "-.04em", margin: "0 0 4px" }}>Project Inquiries &amp; Pipeline</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
              Submitted requests, scopes, and proposal pipeline stages with the Nova team.
            </p>
          </div>
          <Link href="/contact" className="button button-outline" style={{ fontSize: 12, padding: "6px 14px", height: "auto" }}>
            New Inquiry &rarr;
          </Link>
        </div>

        {clientInquiries.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            No prior inquiries logged for this workspace. Use the button above to submit your next initiative.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {clientInquiries.map((inq) => (
              <div
                key={inq.id}
                className="card card-hover-glow"
                style={{
                  padding: 22,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: 6,
                        background:
                          inq.status === "NEW"
                            ? "rgba(255,181,71,0.15)"
                            : inq.status === "QUALIFIED" || inq.status === "CONVERTED"
                            ? "rgba(16,185,129,0.15)"
                            : "rgba(37,99,235,0.15)",
                        color:
                          inq.status === "NEW"
                            ? "#d97706"
                            : inq.status === "QUALIFIED" || inq.status === "CONVERTED"
                            ? "#059669"
                            : "#2563eb",
                      }}
                    >
                      {inq.status}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      {new Date(inq.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  <h4 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
                    {inq.service}
                  </h4>
                  <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {inq.message}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 12, marginTop: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                    Budget: {inq.budget || "Custom Scope"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>
                    {inq.company || "Direct Engagement"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Workspace Contacts & Direct Channels */}
      <section style={{ marginTop: 50 }}>
        <h2 style={{ fontSize: 24, letterSpacing: "-.04em", margin: "0 0 4px" }}>
          Client Contacts &amp; Studio Channels
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 20px" }}>
          Direct communication lines with your designated Nova studio engineers and account lead.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          {/* Client Details Card */}
          <div className="card" style={{ padding: 22 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.06em", display: "block", marginBottom: 12 }}>
              Your Account on Record
            </span>
            <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
              <div>
                <span style={{ color: "var(--muted)", fontSize: 11, display: "block" }}>Full Name</span>
                <span style={{ fontWeight: 700, color: "var(--ink)" }}>{session.user.name}</span>
              </div>
              <div>
                <span style={{ color: "var(--muted)", fontSize: 11, display: "block" }}>Email</span>
                <span style={{ fontWeight: 700, color: "var(--ink)" }}>{session.user.email}</span>
              </div>
              {clientUser?.discordHandle && (
                <div>
                  <span style={{ color: "var(--muted)", fontSize: 11, display: "block" }}>Discord Handle</span>
                  <span style={{ fontWeight: 700, color: "#5865F2" }}>@{clientUser.discordHandle}</span>
                </div>
              )}
              {clientPhone && (
                <div>
                  <span style={{ color: "var(--muted)", fontSize: 11, display: "block" }}>Direct Phone</span>
                  <span style={{ fontWeight: 700, color: "var(--ink)" }}>{clientPhone}</span>
                </div>
              )}
              <div>
                <span style={{ color: "var(--muted)", fontSize: 11, display: "block" }}>Organization</span>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>{clientCompany}</span>
              </div>
            </div>
          </div>

          {/* Dedicated Studio Lead */}
          <div className="card" style={{ padding: 22 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.06em", display: "block", marginBottom: 12 }}>
              Dedicated Studio Lead
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--ink-crm, #101322)",
                  color: "var(--ink-crm-text, #FFFFFF)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                NS
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 15 }}>Nova Studio Engineering</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Senior Technical Lead</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 8, fontSize: 12 }}>
              <a
                href="mailto:nova@allskyfares.com"
                style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink)", textDecoration: "none" }}
              >
                <Mail size={14} color="#6C4CFF" />
                <span>nova@allskyfares.com</span>
              </a>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)" }}>
                <Clock size={14} color="#059669" />
                <span>Mon – Fri, 9:00 AM – 6:00 PM EST</span>
              </div>
            </div>
          </div>

          {/* Quick Communication Hub */}
          <div className="card" style={{ padding: 22 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.06em", display: "block", marginBottom: 12 }}>
              Instant Channels
            </span>
            <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 14px" }}>
              Join our private client Discord lounge or request an immediate call with your engineering team.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link
                href="/portal/security"
                className="button button-outline"
                style={{ justifyContent: "center", fontSize: 12, padding: "8px 12px" }}
              >
                Link Discord &amp; Security Settings
              </Link>
              <a
                href="mailto:nova@allskyfares.com?subject=Project%20Question"
                className="button"
                style={{ justifyContent: "center", fontSize: 12, padding: "8px 12px" }}
              >
                Send Studio Message
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
