import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowUpRight,
  Users,
  ShieldCheck,
  Mail,
  Clock,
  FolderKanban,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Shield,
  Activity,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { NovaMascotAvatar } from "@/components/brand";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "IN";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
  NEW: {
    label: "New Lead",
    bg: "rgba(255, 181, 71, 0.12)",
    color: "#d97706",
    border: "rgba(255, 181, 71, 0.3)",
    dot: "#f59e0b",
  },
  QUALIFIED: {
    label: "Qualified",
    bg: "rgba(16, 185, 129, 0.12)",
    color: "#059669",
    border: "rgba(16, 185, 129, 0.3)",
    dot: "#10b981",
  },
  CONTACTED: {
    label: "Contacted",
    bg: "rgba(59, 130, 246, 0.12)",
    color: "#2563eb",
    border: "rgba(59, 130, 246, 0.3)",
    dot: "#3b82f6",
  },
  PROPOSAL_SENT: {
    label: "Proposal Sent",
    bg: "rgba(108, 76, 255, 0.12)",
    color: "#6C4CFF",
    border: "rgba(108, 76, 255, 0.3)",
    dot: "#6C4CFF",
  },
  CONVERTED: {
    label: "Converted",
    bg: "rgba(16, 185, 129, 0.15)",
    color: "#047857",
    border: "rgba(16, 185, 129, 0.35)",
    dot: "#10b981",
  },
  CLOSED: {
    label: "Closed",
    bg: "rgba(156, 163, 175, 0.12)",
    color: "#6b7280",
    border: "rgba(156, 163, 175, 0.3)",
    dot: "#9ca3af",
  },
};

export default async function Admin() {
  const session = await requireAdmin();
  const adminFirstName = session.user.name ? session.user.name.trim().split(/\s+/)[0] : "Admin";

  // Load inquiry counts, users, showcase and recent inquiries
  const [totalInquiries, newInquiries, qualifiedInquiries, recentInquiries, totalProjects, totalUsers, totalGallery] = await Promise.all([
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.inquiry.count({ where: { status: "QUALIFIED" } }),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.project.count(),
    prisma.user.count(),
    prisma.galleryItem.count(),
  ]);

  return (
    <main className="shell" style={{ padding: "48px 0 80px" }}>
      {/* Header section */}
      <div
        className="animate-fade-in-up"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 24,
          flexWrap: "wrap",
          marginBottom: 36,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <NovaMascotAvatar size={20} />
              <span>Nova · Administration Control Center</span>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 10px",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 600,
                background: "rgba(16, 185, 129, 0.1)",
                color: "#10b981",
                border: "1px solid rgba(16, 185, 129, 0.25)",
              }}
            >
              <span className="radar-dot" style={{ width: 6, height: 6 }} />
              Live Operations Online
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(32px, 5vw, 44px)", letterSpacing: "-.06em", margin: "14px 0 8px" }}>
            Admin Workspace
          </h1>
          <p style={{ maxWidth: 640, color: "var(--muted)", lineHeight: 1.7, margin: 0, fontSize: 14 }}>
            Welcome back,{" "}
            <strong
              style={{
                color: "var(--ink)",
                background: "var(--lav)",
                padding: "2px 8px",
                borderRadius: 6,
                fontSize: 13,
              }}
            >
              {adminFirstName} ({session.user.email})
            </strong>
            . {session.user.twoFactorEnabled ? "MFA is active and all" : "All"} CRM and operational modules are live.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Link
            href="/admin/inquiry"
            className="button"
            style={{ padding: "11px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}
          >
            <MessageSquare size={15} /> Inquiries (CRM)
          </Link>
          <Link
            href="/admin/users"
            className="button button-outline"
            style={{ padding: "11px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}
          >
            <Users size={15} /> Users & Accounts
          </Link>
          <Link
            href="/admin/showcase"
            className="button button-outline"
            style={{ padding: "11px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}
          >
            <ImageIcon size={15} /> GitHub & Gallery
          </Link>
          <Link
            href="/admin/security"
            className="button button-outline"
            style={{ padding: "11px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}
          >
            <Shield size={15} /> Security & MFA
          </Link>
          <Link
            href="/portal"
            className="button button-outline"
            style={{ padding: "11px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}
          >
            <FolderKanban size={15} /> Client Portal
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div
        className="animate-fade-in-up"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 18,
          marginBottom: 36,
        }}
      >
        {/* 1. New Inquiries */}
        <Link
          href="/admin/inquiry?status=NEW"
          className="card card-hover-glow"
          style={{
            padding: "22px 24px",
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderTop: "3px solid #FFB547",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="eyebrow" style={{ color: "var(--muted)", fontWeight: 700 }}>New Inquiries</span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255, 181, 71, 0.12)",
                  border: "1px solid rgba(255, 181, 71, 0.25)",
                }}
              >
                <AlertCircle size={18} style={{ color: "#FFB547" }} />
              </div>
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: "-.06em",
                margin: "14px 0 4px",
                color: "var(--ink)",
                lineHeight: 1,
              }}
            >
              {newInquiries}
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 14,
            }}
          >
            Awaiting initial review <ChevronRight size={13} />
          </div>
        </Link>

        {/* 2. Qualified Leads */}
        <Link
          href="/admin/inquiry?status=QUALIFIED"
          className="card card-hover-glow"
          style={{
            padding: "22px 24px",
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderTop: "3px solid #10b981",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="eyebrow" style={{ color: "var(--muted)", fontWeight: 700 }}>Qualified Leads</span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                }}
              >
                <CheckCircle2 size={18} style={{ color: "#10b981" }} />
              </div>
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: "-.06em",
                margin: "14px 0 4px",
                color: "var(--ink)",
                lineHeight: 1,
              }}
            >
              {qualifiedInquiries}
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#059669",
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 14,
            }}
          >
            Ready for project scoping <ChevronRight size={13} />
          </div>
        </Link>

        {/* 3. Total Inquiries */}
        <Link
          href="/admin/inquiry"
          className="card card-hover-glow"
          style={{
            padding: "22px 24px",
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderTop: "3px solid #6C4CFF",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="eyebrow" style={{ color: "var(--muted)", fontWeight: 700 }}>Total Inquiries</span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(108, 76, 255, 0.12)",
                  border: "1px solid rgba(108, 76, 255, 0.25)",
                }}
              >
                <Users size={18} style={{ color: "#6C4CFF" }} />
              </div>
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: "-.06em",
                margin: "14px 0 4px",
                color: "var(--ink)",
                lineHeight: 1,
              }}
            >
              {totalInquiries}
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--blue)",
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 14,
            }}
          >
            All inquiries logged <ChevronRight size={13} />
          </div>
        </Link>

        {/* 4. Users & Accounts */}
        <Link
          href="/admin/users"
          className="card card-hover-glow"
          style={{
            padding: "22px 24px",
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderTop: "3px solid #ec4899",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="eyebrow" style={{ color: "var(--muted)", fontWeight: 700 }}>Users & Accounts</span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(236, 72, 153, 0.12)",
                  border: "1px solid rgba(236, 72, 153, 0.25)",
                }}
              >
                <Users size={18} style={{ color: "#ec4899" }} />
              </div>
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: "-.06em",
                margin: "14px 0 4px",
                color: "var(--ink)",
                lineHeight: 1,
              }}
            >
              {totalUsers}
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#db2777",
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 14,
            }}
          >
            Provisioning & Roles <ChevronRight size={13} />
          </div>
        </Link>

        {/* 5. Studio Showcase */}
        <Link
          href="/admin/showcase"
          className="card card-hover-glow"
          style={{
            padding: "22px 24px",
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderTop: "3px solid #8b5cf6",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="eyebrow" style={{ color: "var(--muted)", fontWeight: 700 }}>Showcase & Gallery</span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(139, 92, 246, 0.12)",
                  border: "1px solid rgba(139, 92, 246, 0.25)",
                }}
              >
                <ImageIcon size={18} style={{ color: "#8b5cf6" }} />
              </div>
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: "-.06em",
                margin: "14px 0 4px",
                color: "var(--ink)",
                lineHeight: 1,
              }}
            >
              {totalGallery}
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#7c3aed",
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 14,
            }}
          >
            GitHub & Mockup gallery <ChevronRight size={13} />
          </div>
        </Link>

        {/* 6. Active Projects */}
        <Link
          href="/portal/projects"
          className="card card-hover-glow"
          style={{
            padding: "22px 24px",
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderTop: "3px solid #06b6d4",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="eyebrow" style={{ color: "var(--muted)", fontWeight: 700 }}>Active Projects</span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(6, 182, 212, 0.12)",
                  border: "1px solid rgba(6, 182, 212, 0.25)",
                }}
              >
                <FolderKanban size={18} style={{ color: "#06b6d4" }} />
              </div>
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: "-.06em",
                margin: "14px 0 4px",
                color: "var(--ink)",
                lineHeight: 1,
              }}
            >
              {totalProjects}
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#0891b2",
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 14,
            }}
          >
            Managed client workspaces <ChevronRight size={13} />
          </div>
        </Link>
      </div>

      {/* Main Grid: CRM Stream & Security Posture */}
      <div
        className="animate-fade-in-up"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left: Recent Inquiries / CRM Stream */}
        <div className="card" style={{ padding: 28 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 22,
              paddingBottom: 16,
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div>
              <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Activity size={13} style={{ color: "var(--blue)" }} /> CRM Stream
              </div>
              <h2 style={{ fontSize: 20, letterSpacing: "-.04em", margin: "4px 0 0", color: "var(--ink)" }}>
                Recent Inquiries
              </h2>
            </div>
            <Link
              href="/admin/inquiry"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--blue)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 12px",
                borderRadius: 8,
                background: "var(--lav)",
                transition: "opacity 0.15s ease",
              }}
            >
              View all ({totalInquiries}) <ArrowUpRight size={13} />
            </Link>
          </div>

          {recentInquiries.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--muted)" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--lav)",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 12px",
                  color: "var(--blue)",
                }}
              >
                <Users size={22} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", margin: "0 0 4px" }}>
                No inquiries received yet
              </p>
              <p style={{ fontSize: 13, margin: 0 }}>
                When customers submit the inquiry form, they will appear here in real-time.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentInquiries.map((inq) => {
                const conf = statusConfig[inq.status] ?? statusConfig.NEW;
                const initials = getInitials(inq.name);

                return (
                  <Link
                    key={inq.id}
                    href={`/admin/inquiry/${inq.id}`}
                    className="card-hover-glow"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: "var(--paper, #f9fafb)",
                      border: "1px solid var(--line, #e5e7eb)",
                      textDecoration: "none",
                      transition: "transform 0.18s ease, border-color 0.18s ease",
                    }}
                  >
                    {/* Left: Avatar + Contact Info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: "linear-gradient(135deg, #6C4CFF 0%, #8b72ff 100%)",
                          color: "#ffffff",
                          fontWeight: 800,
                          fontSize: 14,
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                          letterSpacing: "-.02em",
                          boxShadow: "0 2px 8px rgba(108, 76, 255, 0.25)",
                        }}
                      >
                        {initials}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: "var(--ink)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {inq.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          <span>{inq.service}</span>
                          {inq.company && (
                            <>
                              <span style={{ opacity: 0.5 }}>•</span>
                              <span>{inq.company}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Pill & Date */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 9px",
                            borderRadius: 99,
                            background: conf.bg,
                            color: conf.color,
                            border: `1px solid ${conf.border}`,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            letterSpacing: "-.01em",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: conf.dot,
                            }}
                          />
                          {inq.status}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>
                          {new Date(inq.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <ChevronRight size={16} style={{ color: "var(--muted)", opacity: 0.7 }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Security & Operational Governance */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Security Posture Card */}
          <div className="card" style={{ padding: 28 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div>
                <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ShieldCheck size={13} style={{ color: "#10b981" }} /> Security Posture
                </div>
                <h2 style={{ fontSize: 20, letterSpacing: "-.04em", margin: "4px 0 0", color: "var(--ink)" }}>
                  System & Session Governance
                </h2>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Row 1: Role */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(108, 76, 255, 0.12)",
                      display: "grid",
                      placeItems: "center",
                      color: "#6C4CFF",
                      flexShrink: 0,
                    }}
                  >
                    <ShieldCheck size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Role Authorization</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>Admin workspace access</div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 99,
                    background: "rgba(108, 76, 255, 0.12)",
                    color: "var(--blue)",
                    border: "1px solid rgba(108, 76, 255, 0.25)",
                  }}
                >
                  ADMIN
                </span>
              </div>

              {/* Row 2: MFA */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: session.user.twoFactorEnabled ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                      display: "grid",
                      placeItems: "center",
                      color: session.user.twoFactorEnabled ? "#10b981" : "#f59e0b",
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Two-Factor Auth (TOTP)</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      {session.user.twoFactorEnabled ? "Authenticator code verification" : "Optional · Setup in settings"}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 99,
                    background: session.user.twoFactorEnabled ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                    color: session.user.twoFactorEnabled ? "#059669" : "#d97706",
                    border: session.user.twoFactorEnabled
                      ? "1px solid rgba(16, 185, 129, 0.3)"
                      : "1px solid rgba(245, 158, 11, 0.3)",
                  }}
                >
                  {session.user.twoFactorEnabled ? "Active (TOTP)" : "Disabled (Optional)"}
                </span>
              </div>

              {/* Row 3: Dispatch Channel */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(108, 76, 255, 0.12)",
                      display: "grid",
                      placeItems: "center",
                      color: "#6C4CFF",
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Operations Dispatch</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>Corporate communications</div>
                  </div>
                </div>
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "var(--lav)",
                    color: "var(--ink)",
                  }}
                >
                  nova@allskyfares.com
                </span>
              </div>

              {/* Row: Discord Channel */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(88, 101, 242, 0.12)",
                      display: "grid",
                      placeItems: "center",
                      color: "#5865F2",
                      flexShrink: 0,
                    }}
                  >
                    <DiscordIcon size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Discord Channel</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>Direct studio coordination</div>
                  </div>
                </div>
                <a
                  href="https://discord.com/users/superr_nova_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "rgba(88, 101, 242, 0.12)",
                    color: "#5865F2",
                    border: "1px solid rgba(88, 101, 242, 0.25)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  @superr_nova_ <ArrowUpRight size={11} />
                </a>
              </div>

              {/* Row 4: Sessions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(6, 182, 212, 0.12)",
                      display: "grid",
                      placeItems: "center",
                      color: "#0891b2",
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Session Token Protection</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>Multi-device revocation enabled</div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 99,
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#059669",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                  }}
                >
                  Protected
                </span>
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
              <Link
                href="/admin/security"
                className="button button-outline"
                style={{ width: "100%", padding: "10px 16px", fontSize: 13, justifyContent: "center" }}
              >
                Manage Security Credentials & MFA <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>

          {/* Operational Entity Card */}
          <div
            className="card"
            style={{
              padding: 22,
              background: "var(--lav, #eeebff)",
              borderColor: "rgba(108, 76, 255, 0.2)",
            }}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <NovaMascotAvatar size={42} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
                  Nova Studio Operations
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                  Operated on behalf of <strong>All Sky Fares LLC</strong>. Client data is protected under zero-trust authorization barriers and secure token sessions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DiscordIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 127.14 96.36" fill="currentColor" aria-hidden="true">
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.91,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
  );
}

