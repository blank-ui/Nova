import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  MoveUpRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  Code2,
  ExternalLink,
  FolderGit2,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { NovaMark, AnimatedNovaMascot, NovaMascotAvatar } from "@/components/brand";
import { prisma } from "@/lib/prisma";

const services = [
  {
    n: "01",
    title: "Websites & Digital Experiences",
    text: "Brand-led websites that turn a first impression into a lasting one, engineered for 100% Core Web Vitals.",
    href: "/services",
  },
  {
    n: "02",
    title: "Custom Products & Platforms",
    text: "Purpose-built web applications and portals shaped around how your people and clients really work.",
    href: "/services",
  },
  {
    n: "03",
    title: "Connected Systems & Dashboards",
    text: "Operational CRM tools, role-isolated workspaces, and reliable automation that scale with your team.",
    href: "/services",
  },
];

const techBadges = [
  { name: "Next.js 15 (App Router)", tag: "Framework" },
  { name: "React 19", tag: "UI Runtime" },
  { name: "TypeScript 5", tag: "Strict Types" },
  { name: "Tailwind CSS & CSS Grid", tag: "Design System" },
  { name: "Prisma ORM & MySQL", tag: "Data Engine" },
  { name: "Better Auth & TOTP MFA", tag: "Security" },
  { name: "Edge Caching & Core Web Vitals", tag: "Performance" },
  { name: "Hostinger SMTP Mail", tag: "Delivery" },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  // Load featured screenshots / showcase from DB
  let featuredGallery: Awaited<ReturnType<typeof prisma.galleryItem.findMany>> = [];
  try {
    featuredGallery = await prisma.galleryItem.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("[Home Page] Could not load featured gallery:", err);
  }

  return (
    <>
      <Navigation />
      <main>
        {/* ============================================================= */}
        {/* HERO SECTION                                                  */}
        {/* ============================================================= */}
        <section
          className="grid-paper"
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "96px 0 84px",
            minHeight: 640,
            borderBottom: "1px solid var(--line)",
          }}
        >
          {/* Floating Ambient Orb */}
          <div
            className="orb orb-float"
            style={{
              width: 580,
              height: 580,
              background: "var(--orb-gradient)",
              top: 20,
              right: "-4%",
            }}
          />

          <div className="shell animate-fade-in-up" style={{ position: "relative", zIndex: 1 }}>
            {/* Top Status Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              <div
                className="eyebrow"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 12px",
                  borderRadius: 99,
                  background: "rgba(108, 76, 255, 0.08)",
                  border: "1px solid rgba(108, 76, 255, 0.2)",
                  color: "var(--blue)",
                }}
              >
                <Sparkles size={13} />
                <span>Independent Digital Studio · India & Global</span>
              </div>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "rgba(16, 185, 129, 0.08)",
                  color: "#10b981",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                }}
              >
                <span className="radar-dot" style={{ width: 6, height: 6 }} />
                Operating on behalf of All Sky Fares LLC
              </span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: "clamp(56px, 8.4vw, 110px)",
                lineHeight: 0.98,
                letterSpacing: "-.085em",
                fontWeight: 700,
                maxWidth: 960,
                margin: "16px 0 24px",
                color: "var(--ink)",
              }}
            >
              Digital, <span style={{ color: "var(--muted)", fontWeight: 400 }}>considered.</span>
              <br />
              Built for{" "}
              <span style={{ position: "relative", display: "inline-block", color: "var(--blue)" }}>
                what&apos;s next.
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: -8,
                    height: 3,
                    background: "linear-gradient(90deg, var(--blue), var(--cyan))",
                    borderRadius: 3,
                  }}
                />
              </span>
            </h1>

            {/* Subtitle & Hero Action Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 28,
                flexWrap: "wrap",
                marginTop: 36,
              }}
            >
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.8,
                  color: "var(--muted)",
                  maxWidth: 480,
                  margin: 0,
                }}
              >
                We partner with ambitious founders and established teams to build bespoke websites, custom platforms, and operational systems that move businesses forward.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link className="button" href="/contact" style={{ padding: "14px 24px", fontSize: 14 }}>
                  Start a project <ArrowUpRight size={16} />
                </Link>
                <Link className="button button-outline" href="/portfolio" style={{ padding: "14px 22px", fontSize: 14 }}>
                  Explore our work <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Metric / Value Highlights Bar */}
            <div
              style={{
                display: "flex",
                gap: 28,
                flexWrap: "wrap",
                marginTop: 48,
                paddingTop: 28,
                borderTop: "1px solid var(--line)",
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: "#10b981" }} />
                <span>100% Core Web Vitals Ready</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: "var(--blue)" }} />
                <span>Custom Architecture & Clean Code</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: "#FFB547" }} />
                <span>Dedicated Client Workspace & Direct Tracking</span>
              </div>
            </div>
          </div>

          {/* Interactive Feature Glass Card Bento */}
          <div className="shell" style={{ position: "relative", marginTop: 40 }}>
            <div
              className="glass"
              style={{
                borderRadius: 24,
                padding: 18,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {/* Mascot Spotlight */}
              <div
                style={{
                  minHeight: 290,
                  borderRadius: 18,
                  background: "linear-gradient(135deg,#0d1020 0%,#191e36 100%)",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: "1px solid rgba(108, 76, 255, 0.25)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="eyebrow" style={{ color: "#FFB547", display: "flex", alignItems: "center", gap: 6 }}>
                    <Sparkles size={13} /> Meet Nova · Studio Mascot
                  </div>
                  <div
                    style={{
                      background: "rgba(108,76,255,.25)",
                      border: "1px solid rgba(103,232,249,.4)",
                      padding: "4px 10px",
                      borderRadius: 99,
                      fontSize: 11,
                      color: "#67E8F9",
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    ships @ light speed
                  </div>
                </div>

                <div style={{ position: "absolute", right: 12, bottom: 4, opacity: 0.95 }}>
                  <AnimatedNovaMascot size={220} />
                </div>

                <div style={{ maxWidth: 300, position: "relative", zIndex: 2 }}>
                  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.05em", lineHeight: 1.15 }}>
                    Soft to look at.<br />
                    <span style={{ color: "#FFB547" }}>Serious about code.</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#a6adbd", lineHeight: 1.6, margin: "10px 0 0" }}>
                    Bespoke web development, modern full-stack architecture, and zero-compromise craft. Click Nova anytime to say hi!
                  </p>
                </div>
              </div>

              {/* Bento Right Column: Studio Principles */}
              <div style={{ display: "grid", gap: 14 }}>
                <div
                  className="card card-hover-glow"
                  style={{
                    borderRadius: 18,
                    background: "var(--lav)",
                    padding: 24,
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid var(--line)",
                  }}
                >
                  <div className="eyebrow" style={{ color: "var(--blue)" }}>
                    Web Development Studio
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.05em", marginTop: 12, color: "var(--ink)" }}>
                    Less noise.<br />
                    More meaning.
                  </div>
                  <p style={{ fontSize: 13, color: "var(--muted)", margin: "8px 0 0", maxWidth: 280, lineHeight: 1.6 }}>
                    Every line of code and interface element earns its place. No unnecessary dependencies or bloated themes.
                  </p>
                  <div style={{ position: "absolute", right: 20, top: 24 }}>
                    <NovaMark size={46} starColor="#6C4CFF" dotColor="#FFB547" />
                  </div>
                </div>

                <div
                  className="card card-hover-glow"
                  style={{
                    borderRadius: 18,
                    background: "var(--paper)",
                    padding: 24,
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid var(--line)",
                  }}
                >
                  <div className="eyebrow" style={{ color: "#059669" }}>
                    From First Scoping to Launch
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.04em", marginTop: 10, color: "var(--ink)" }}>
                    Made to move your business forward.
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                    <Link href="/process" className="button button-outline" style={{ padding: "8px 14px", fontSize: 12 }}>
                      Our 4-step process <ArrowRight size={13} />
                    </Link>
                    <Link href="/services" className="button button-outline" style={{ padding: "8px 14px", fontSize: 12 }}>
                      All services <MoveUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 2: FEATURED SCREENSHOT & WORK SHOWCASE                */}
        {/* ============================================================= */}
        {featuredGallery.length > 0 && (
          <section className="shell" style={{ padding: "88px 0 40px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 20,
                flexWrap: "wrap",
                marginBottom: 32,
              }}
            >
              <div>
                <div className="eyebrow">Studio Showcase & Builds</div>
                <h2
                  style={{
                    fontSize: "clamp(34px, 4.8vw, 54px)",
                    letterSpacing: "-.06em",
                    lineHeight: 1.1,
                    fontWeight: 700,
                    margin: "12px 0 0",
                    color: "var(--ink)",
                  }}
                >
                  Selected Work & Design Mockups
                </h2>
                <p style={{ color: "var(--muted)", fontSize: 14, margin: "6px 0 0" }}>
                  A glimpse into our responsive web applications, high-converting interfaces, and verified prototypes.
                </p>
              </div>

              <Link href="/portfolio" className="button button-outline" style={{ padding: "10px 18px", fontSize: 13 }}>
                View Full Showcase ({featuredGallery.length}+) <ArrowUpRight size={14} />
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
              {featuredGallery.map((item) => (
                <div
                  key={item.id}
                  className="card card-hover-glow"
                  style={{
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {/* Mockup Frame */}
                    <div
                      style={{
                        height: 220,
                        width: "100%",
                        background: "var(--line)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "rgba(16,19,34,0.8)",
                          color: "#fff",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {item.category}
                      </span>
                    </div>

                    <div style={{ padding: 22 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "var(--ink)", letterSpacing: "-.03em" }}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 14px", lineHeight: 1.6 }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "14px 22px",
                      borderTop: "1px solid var(--line)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "var(--paper)",
                    }}
                  >
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      {item.repoName ? `Repo: ${item.repoName}` : "Verified Studio Build"}
                    </span>
                    {item.projectUrl ? (
                      <a
                        href={item.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: 12,
                          color: "var(--blue)",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontWeight: 600,
                        }}
                      >
                        <span>Live Preview</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <Link
                        href="/portfolio"
                        style={{ fontSize: 12, color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}
                      >
                        Details &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================= */}
        {/* SECTION 3: SERVICES & CAPABILITIES                            */}
        {/* ============================================================= */}
        <section className="shell" style={{ padding: "88px 0 40px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 20,
              flexWrap: "wrap",
              marginBottom: 36,
            }}
          >
            <div>
              <div className="eyebrow">What we bring to the table</div>
              <h2
                style={{
                  fontSize: "clamp(36px,5vw,58px)",
                  letterSpacing: "-.07em",
                  lineHeight: 1.08,
                  fontWeight: 700,
                  margin: "14px 0 0",
                  color: "var(--ink)",
                }}
              >
                Good work, with<br />
                a reason behind it.
              </h2>
            </div>
            <Link href="/services" className="button button-outline" style={{ padding: "10px 18px", fontSize: 13 }}>
              All 6 capabilities <ArrowUpRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {services.map((s) => (
              <Link
                key={s.n}
                href={s.href}
                className="card card-hover-glow"
                style={{
                  padding: 30,
                  minHeight: 230,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderTop: "3px solid var(--blue)",
                }}
              >
                <div>
                  <div className="eyebrow" style={{ color: "var(--blue)", fontWeight: 700 }}>
                    {s.n} / Capability
                  </div>
                  <h3 style={{ fontSize: 22, letterSpacing: "-.05em", margin: "24px 0 10px", color: "var(--ink)", fontWeight: 700 }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--muted)", margin: 0 }}>
                    {s.text}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--blue)", fontSize: 13, fontWeight: 600, marginTop: 24 }}>
                  <span>Learn more</span>
                  <MoveUpRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 4: ENGINEERING BENTO & CRAFT STANDARDS                */}
        {/* ============================================================= */}
        <section className="shell" style={{ padding: "60px 0 40px" }}>
          <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 44px" }}>
            <div className="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Code2 size={14} style={{ color: "var(--blue)" }} />
              Architecture & Standards
            </div>
            <h2
              style={{
                fontSize: "clamp(32px, 4.5vw, 50px)",
                letterSpacing: "-.06em",
                margin: "12px 0 10px",
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              Built to withstand real traffic and hard days.
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 15, margin: 0 }}>
              We do not use bloated page builders or black-box templates. Every project is authored with clean, testable, and maintainable code.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18,
            }}
          >
            {/* Bento 1: Performance */}
            <div className="card card-hover-glow" style={{ padding: 28, borderTop: "3px solid #10b981" }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "rgba(16, 185, 129, 0.12)",
                  display: "grid",
                  placeItems: "center",
                  color: "#10b981",
                  marginBottom: 16,
                }}
              >
                <Zap size={20} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "var(--ink)" }}>
                Core Web Vitals & Speed
              </h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
                Optimized font loading, priority LCP images, sub-50ms TTFB edge caching, and zero layout shift across devices.
              </p>
            </div>

            {/* Bento 2: Security */}
            <div className="card card-hover-glow" style={{ padding: 28, borderTop: "3px solid var(--blue)" }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "rgba(108, 76, 255, 0.12)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--blue)",
                  marginBottom: 16,
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "var(--ink)" }}>
                Multi-Role Security & 2FA
              </h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
                Time-based One-Time Passwords (TOTP), signed cookie sessions, rate-limited inquiry routes, and isolated role boundaries.
              </p>
            </div>

            {/* Bento 3: Architecture */}
            <div className="card card-hover-glow" style={{ padding: 28, borderTop: "3px solid #FFB547" }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "rgba(255, 181, 71, 0.12)",
                  display: "grid",
                  placeItems: "center",
                  color: "#FFB547",
                  marginBottom: 16,
                }}
              >
                <Layers size={20} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "var(--ink)" }}>
                Modern Type-Safe Stack
              </h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
                Next.js 15 App Router, React 19 Server Components, Prisma ORM, and comprehensive Vitest unit test coverage.
              </p>
            </div>

            {/* Bento 4: Client Portal */}
            <div className="card card-hover-glow" style={{ padding: 28, borderTop: "3px solid #06b6d4" }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "rgba(6, 182, 212, 0.12)",
                  display: "grid",
                  placeItems: "center",
                  color: "#06b6d4",
                  marginBottom: 16,
                }}
              >
                <FolderGit2 size={20} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "var(--ink)" }}>
                Dedicated Client Workspace
              </h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
                Clients receive their own private portal with real-time sprint milestones, direct communications, and invoice tracking.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 5: TECH BADGES STRIP                                  */}
        {/* ============================================================= */}
        <section
          style={{
            marginTop: 40,
            padding: "44px 0",
            background: "var(--paper)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="shell">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
              <span className="eyebrow">Technology & Production Tooling</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>No proprietary lock-in · Full codebase ownership</span>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {techBadges.map((badge) => (
                <div
                  key={badge.name}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    background: "var(--card-bg)",
                    border: "1px solid var(--line)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--blue)" }} />
                  <span>{badge.name}</span>
                  <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>
                    ({badge.tag})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* CALL TO ACTION BANNER                                         */}
        {/* ============================================================= */}
        <section
          style={{
            padding: "88px 0",
            background: "var(--banner-bg)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div
            className="shell"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 36,
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 620 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <NovaMascotAvatar size={24} />
                <span className="eyebrow" style={{ color: "var(--blue)" }}>
                  A thoughtful place to begin
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(38px, 6vw, 68px)",
                  letterSpacing: "-.075em",
                  lineHeight: 1.02,
                  margin: "12px 0 16px",
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                Have a big idea?<br />
                <span style={{ color: "var(--muted)" }}>Let&apos;s make it real.</span>
              </h2>
              <div style={{ display: "flex", gap: 20, color: "var(--muted)", fontSize: 13, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={14} style={{ color: "#10b981" }} /> Responses within 24 business hours
                </span>
                <span>·</span>
                <span>Contract entity: All Sky Fares LLC</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Link className="button" href="/contact" style={{ padding: "16px 28px", fontSize: 15 }}>
                Tell us about your project <ArrowUpRight size={17} />
              </Link>
              <Link className="button button-outline" href="/portfolio" style={{ padding: "12px 20px", fontSize: 13, justifyContent: "center" }}>
                Browse work & GitHub activity
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
