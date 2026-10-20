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
  Terminal,
  Cpu,
  Workflow,
  Lock,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { NovaMark, NovaMascotAvatar } from "@/components/brand";
import { AnimatedNovaMascot } from "@/components/mascot-animated";
import { HeroProductPreview } from "@/components/hero-product-preview";
import { FAQAccordion } from "@/components/faq-accordion";
import { prisma } from "@/lib/prisma";
import { T } from "@/components/language-provider";
import "@/app/public-redesign.css";

const services = [
  {
    n: "01",
    title: "Websites & Digital Experiences",
    text: "Brand-led websites that turn first impressions into lasting authority, engineered for 100/100 Core Web Vitals and zero layout shift.",
    href: "/services",
  },
  {
    n: "02",
    title: "Custom Products & Platforms",
    text: "Purpose-built web applications and customer portals shaped strictly around how your people, operations, and clients really work.",
    href: "/services",
  },
  {
    n: "03",
    title: "Connected Systems & CRM Dashboards",
    text: "High-performance operational CRM tools, role-isolated workspaces, and telemetry dashboards that scale smoothly with your team.",
    href: "/services",
  },
  {
    n: "04",
    title: "UI/UX & Design Systems",
    text: "Meticulous Figma component libraries, responsive design tokens, and accessible WCAG 2.1 AA compliant design systems.",
    href: "/services",
  },
  {
    n: "05",
    title: "API Integrations & Automation",
    text: "Secure payment gateways, custom webhooks, SMTP transactional email, and Discord/Slack workflow automations.",
    href: "/services",
  },
  {
    n: "06",
    title: "Ongoing Support & Sprints",
    text: "Defined SLA response times, routine dependency patching, security audits, and dedicated monthly feature sprints.",
    href: "/services",
  },
];

const processSteps = [
  {
    step: "01",
    name: "Discovery & Architecture",
    desc: "We define precise technical requirements, data models, user roles, and security boundaries before writing a single line of code.",
    tag: "Days 1–3",
  },
  {
    step: "02",
    name: "Bespoke Design & Prototyping",
    desc: "High-fidelity Figma wireframes, interactive component states, typography hierarchy, and accessible color palettes for your approval.",
    tag: "Days 4–7",
  },
  {
    step: "03",
    name: "Type-Safe Engineering",
    desc: "Strict TypeScript implementation with Next.js 15 Server Components, Prisma ORM schemas, and comprehensive Vitest test suites.",
    tag: "Days 8–12",
  },
  {
    step: "04",
    name: "Launch, Portal Handover & SLA",
    desc: "Production deployment with domain SSL, automated database backups, client portal onboarding, and 24/7 SLA monitoring.",
    tag: "Days 13–14",
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

const homeFaqs = [
  {
    q: "How fast can Nova design and ship our project?",
    a: "Standard bespoke studio websites and focused web apps ship within our signature 14-day sprint cycle. Larger enterprise platforms or multi-role CRM systems typically range from 3 to 6 weeks, structured into transparent, bi-weekly milestones tracked in your private client portal.",
  },
  {
    q: "Do we get full ownership of the codebase and intellectual property?",
    a: "Yes, 100%. Upon completion and final settlement, all intellectual property, source code, database schemas, and design assets are fully transferred to your company under our standard Statement of Work (SOW). There are zero proprietary lock-ins.",
  },
  {
    q: "How does the dedicated Client Workspace work?",
    a: "Every Nova client receives their own secure portal account with real-time sprint status, milestone approvals, invoice receipts, and direct team discussions synced with our internal Discord and email channels.",
  },
  {
    q: "What legal entity operates Nova?",
    a: "Nova is a specialized web development studio operated on behalf of All Sky Fares LLC. All contracts, Statements of Work (SOW), and invoices are legally executed by All Sky Fares LLC.",
  },
  {
    q: "Can you modernize or optimize an existing codebase?",
    a: "Absolutely. We specialize in refactoring legacy codebases, upgrading Next.js/React versions, improving Core Web Vitals to 100%, and auditing security boundaries with zero downtime.",
  },
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
    <div className="nova-public-root">
      <Navigation />
      <main>
        {/* ============================================================= */}
        {/* HERO SECTION                                                  */}
        {/* ============================================================= */}
        <section
          className="nova-grid-bg"
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "clamp(64px, 8vw, 110px) 0 clamp(48px, 6vw, 84px)",
            borderBottom: "1px solid var(--pub-line)",
          }}
        >
          {/* Subtle Ambient Glow Orbs */}
          <div
            className="nova-glow-orb nova-glow-violet"
            style={{
              width: 650,
              height: 650,
              top: -100,
              right: "-5%",
            }}
          />
          <div
            className="nova-glow-orb nova-glow-lime"
            style={{
              width: 400,
              height: 400,
              bottom: 40,
              left: "-4%",
            }}
          />

          <div className="shell" style={{ position: "relative", zIndex: 1 }}>
            {/* Top Status & Attribution Row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
              <div
                className="nova-pill-tag"
                style={{
                  color: "var(--pub-violet)",
                  background: "var(--pub-violet-soft)",
                  borderColor: "rgba(108, 76, 255, 0.28)",
                }}
              >
                <Sparkles size={13} />
                <span>
                  <T k="hero.eyebrow" fallback="Independent Digital Studio · India & Global" />
                </span>
              </div>

              <div
                className="nova-pill-tag nova-pill-lime"
              >
                <span className="nova-status-dot" />
                <span>Operated on behalf of All Sky Fares LLC</span>
              </div>
            </div>

            {/* Main Editorial Headline */}
            <h1
              className="nova-editorial-headline"
              style={{
                fontSize: "clamp(40px, 7.8vw, 98px)",
                maxWidth: 980,
                margin: "0 0 28px",
              }}
            >
              <T k="hero.title_start" fallback="Digital, " />
              <span style={{ color: "var(--pub-muted)", fontWeight: 400 }}>considered.</span>
              <br />
              Built for{" "}
              <span style={{ position: "relative", display: "inline-block", color: "var(--pub-violet)" }}>
                <T k="hero.title_highlight" fallback="what's next." />
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: -6,
                    height: 4,
                    background: "linear-gradient(90deg, var(--pub-violet), var(--pub-cyan))",
                    borderRadius: 4,
                  }}
                />
              </span>
            </h1>

            {/* Subtitle & Primary CTAs */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 32,
                flexWrap: "wrap",
                marginBottom: 44,
              }}
            >
              <p
                className="nova-editorial-subhead"
                style={{
                  maxWidth: 520,
                  margin: 0,
                }}
              >
                <T
                  k="hero.description"
                  fallback="We partner with ambitious founders and established teams to build bespoke websites, custom platforms, and operational systems that move businesses forward."
                />
              </p>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Link className="nova-btn-primary" href="/contact" style={{ padding: "15px 28px", fontSize: 14 }}>
                  <span><T k="hero.start_project" fallback="Start a project" /></span>
                  <ArrowUpRight size={16} className="nova-arrow-icon" />
                </Link>
                <Link className="nova-btn-secondary" href="/portfolio" style={{ padding: "15px 24px", fontSize: 14 }}>
                  <span><T k="hero.explore_work" fallback="Explore our work" /></span>
                  <ArrowRight size={15} className="nova-arrow-icon" />
                </Link>
              </div>
            </div>

            {/* Metric / Value Highlights Bar */}
            <div
              style={{
                display: "flex",
                gap: "clamp(18px, 4vw, 36px)",
                flexWrap: "wrap",
                paddingTop: 28,
                borderTop: "1px solid var(--pub-line)",
                color: "var(--pub-muted)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: "#10B981" }} />
                <span><T k="hero.stat_speed" fallback="14-Day Sprint Velocity" /></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: "var(--pub-violet)" }} />
                <span><T k="hero.stat_quality" fallback="100% Type-Safe Architecture" /></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: "#FFB547" }} />
                <span><T k="hero.stat_uptime" fallback="99.9% Production SLA Target" /></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: "var(--pub-cyan)" }} />
                <span>Full Codebase &amp; IP Ownership</span>
              </div>
            </div>

            {/* Layered Browser Product Previews & Mascot Composition */}
            <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
              <HeroProductPreview />

              {/* Mascot Spotlight Card */}
              <div
                className="nova-card"
                style={{
                  padding: "clamp(24px, 4vw, 32px)",
                  background: "linear-gradient(135deg, #0A0D18 0%, #151A2E 100%)",
                  color: "#F7F6F2",
                  borderColor: "rgba(108, 76, 255, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 28,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ maxWidth: 540 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Sparkles size={14} style={{ color: "#FFB547" }} />
                    <span className="eyebrow" style={{ color: "#FFB547" }}>
                      Meet Nova · Studio Mascot
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: "rgba(103, 232, 249, 0.15)",
                        border: "1px solid rgba(103, 232, 249, 0.3)",
                        color: "#67E8F9",
                        fontSize: 10,
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      ships @ light speed
                    </span>
                  </div>
                  <h3 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.04em" }}>
                    Soft to look at. Serious about code.
                  </h3>
                  <p style={{ color: "#9CA5B8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                    Bespoke web development, clean server component architecture, and zero-compromise craft. Click or hover Nova anytime to say hi!
                  </p>
                </div>

                <div style={{ flexShrink: 0, margin: "0 auto" }}>
                  <AnimatedNovaMascot size={200} interactive={true} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 2: STUDIO INTRO & CORE PRINCIPLES                     */}
        {/* ============================================================= */}
        <section className="shell" style={{ padding: "clamp(64px, 8vw, 96px) 0 48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 28 }}>
            <div
              className="nova-card"
              style={{
                padding: "clamp(28px, 4vw, 40px)",
                background: "var(--pub-surface-card)",
              }}
            >
              <div className="eyebrow" style={{ color: "var(--pub-violet)", marginBottom: 16 }}>
                Studio Philosophy
              </div>
              <h2 style={{ fontSize: "clamp(28px, 3.6vw, 42px)", fontWeight: 800, letterSpacing: "-0.05em", margin: "0 0 16px", color: "var(--pub-ink)" }}>
                Less noise. More meaning.
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--pub-muted)", margin: 0 }}>
                Every line of code and interface element earns its place. We reject bloated page builders, unnecessary dependencies, and generic themes in favor of clean, performant, and handcrafted software.
              </p>
              <div style={{ marginTop: 28 }}>
                <NovaMark size={40} starColor="#6C4CFF" dotColor="#FFB547" />
              </div>
            </div>

            <div
              className="nova-card"
              style={{
                padding: "clamp(28px, 4vw, 40px)",
                background: "var(--pub-surface-card)",
              }}
            >
              <div className="eyebrow" style={{ color: "#10B981", marginBottom: 16 }}>
                Predictable Sprint Velocity
              </div>
              <h2 style={{ fontSize: "clamp(28px, 3.6vw, 42px)", fontWeight: 800, letterSpacing: "-0.05em", margin: "0 0 16px", color: "var(--pub-ink)" }}>
                From first scoping to launch.
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--pub-muted)", margin: 0 }}>
                We work in high-cadence two-week sprints with daily asynchronous updates, transparent milestone tracking, and staging URLs where you can test real progress before release.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
                <Link href="/process" className="nova-btn-secondary" style={{ padding: "10px 18px", fontSize: 13 }}>
                  <span>Our 4-step process</span>
                  <ArrowRight size={14} className="nova-arrow-icon" />
                </Link>
                <Link href="/services" className="nova-btn-secondary" style={{ padding: "10px 18px", fontSize: 13 }}>
                  <span>All 6 capabilities</span>
                  <MoveUpRight size={14} className="nova-arrow-icon" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 3: SERVICES & CAPABILITIES GRID                       */}
        {/* ============================================================= */}
        <section className="shell" style={{ padding: "48px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 24,
              flexWrap: "wrap",
              marginBottom: 40,
            }}
          >
            <div>
              <div className="eyebrow"><T k="services.eyebrow" fallback="What we bring to the table" /></div>
              <h2
                style={{
                  fontSize: "clamp(34px, 4.8vw, 56px)",
                  letterSpacing: "-0.06em",
                  lineHeight: 1.08,
                  fontWeight: 800,
                  margin: "12px 0 0",
                  color: "var(--pub-ink)",
                }}
              >
                <T k="services.title" fallback="Good work, with a reason behind it." />
              </h2>
            </div>
            <Link href="/services" className="nova-btn-secondary" style={{ padding: "10px 20px", fontSize: 13 }}>
              <span><T k="services.all_6" fallback="All 6 capabilities" /></span>
              <ArrowUpRight size={14} className="nova-arrow-icon" />
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: 20,
            }}
          >
            {services.map((s, idx) => (
              <Link
                key={s.n}
                href={s.href}
                className="nova-card nova-card-interactive"
                style={{
                  padding: 32,
                  minHeight: 250,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderTop: "3px solid var(--pub-violet)",
                  textDecoration: "none",
                }}
              >
                <div>
                  <div className="eyebrow" style={{ color: "var(--pub-violet)", fontWeight: 700 }}>
                    {s.n} / <T k="services.capability" fallback="Capability" />
                  </div>
                  <h3 style={{ fontSize: 22, letterSpacing: "-0.04em", margin: "24px 0 10px", color: "var(--pub-ink)", fontWeight: 800 }}>
                    <T k={`services.s${idx + 1}_title`} fallback={s.title} />
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--pub-muted)", margin: 0 }}>
                    <T k={`services.s${idx + 1}_text`} fallback={s.text} />
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--pub-violet)", fontSize: 13, fontWeight: 700, marginTop: 24 }}>
                  <span><T k="services.learn_more" fallback="Learn more" /></span>
                  <MoveUpRight size={14} className="nova-card-arrow" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 4: SELECTED WORK & PORTFOLIO SHOWCASE                 */}
        {/* ============================================================= */}
        <section className="shell" style={{ padding: "64px 0 48px" }}>
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
              <div className="eyebrow"><T k="hero.showcase_eyebrow" fallback="Studio Showcase & Builds" /></div>
              <h2
                style={{
                  fontSize: "clamp(34px, 4.8vw, 56px)",
                  letterSpacing: "-0.06em",
                  lineHeight: 1.1,
                  fontWeight: 800,
                  margin: "12px 0 0",
                  color: "var(--pub-ink)",
                }}
              >
                <T k="hero.showcase_title" fallback="Selected Work & Design Mockups" />
              </h2>
              <p style={{ color: "var(--pub-muted)", fontSize: 14, margin: "8px 0 0" }}>
                <T k="hero.showcase_desc" fallback="A glimpse into our responsive web applications, high-converting interfaces, and verified prototypes. All client code is protected under mutual non-disclosure agreements." />
              </p>
            </div>

            <Link href="/portfolio" className="nova-btn-secondary" style={{ padding: "10px 20px", fontSize: 13 }}>
              <span><T k="hero.showcase_view_all" fallback="View Full Showcase" /></span>
              <ArrowUpRight size={14} className="nova-arrow-icon" />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 24 }}>
            {/* If DB items exist, display them */}
            {featuredGallery.map((item) => (
              <div
                key={item.id}
                className="nova-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      height: 230,
                      width: "100%",
                      background: "var(--pub-bg-alt)",
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
                        background: "rgba(10, 12, 19, 0.85)",
                        color: "#FFFFFF",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {item.category}
                    </span>
                  </div>

                  <div style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 8px", color: "var(--pub-ink)", letterSpacing: "-0.03em" }}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p style={{ fontSize: 13, color: "var(--pub-muted)", margin: 0, lineHeight: 1.6 }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    padding: "16px 24px",
                    borderTop: "1px solid var(--pub-line)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--pub-bg-alt)",
                  }}
                >
                  <span style={{ fontSize: 11, color: "var(--pub-muted)", fontFamily: "'DM Mono', monospace" }}>
                    {item.repoName ? `Repo: ${item.repoName}` : "Verified Studio Build"}
                  </span>
                  {item.projectUrl ? (
                    <a
                      href={item.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 12,
                        color: "var(--pub-violet)",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontWeight: 700,
                      }}
                    >
                      <span>Live Preview</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <Link
                      href="/portfolio"
                      style={{ fontSize: 12, color: "var(--pub-violet)", textDecoration: "none", fontWeight: 700 }}
                    >
                      Details &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {/* Fallback / Featured Concept Mockup 1: Travel SaaS */}
            <div className="nova-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="nova-browser-frame" style={{ borderRadius: "18px 18px 0 0", border: "none" }}>
                  <div className="nova-browser-topbar">
                    <div className="nova-traffic-lights">
                      <span className="nova-traffic-dot nova-traffic-red" />
                      <span className="nova-traffic-dot nova-traffic-yellow" />
                      <span className="nova-traffic-dot nova-traffic-green" />
                    </div>
                    <div className="nova-browser-address">allskyfares.com</div>
                    <span className="nova-pill-tag nova-pill-lime" style={{ padding: "2px 6px", fontSize: 9 }}>SaaS</span>
                  </div>
                  <div style={{ height: 180, background: "linear-gradient(135deg, #101428 0%, #1A2242 100%)", padding: 20, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 11, color: "#67E8F9", fontFamily: "'DM Mono', monospace" }}>ALL SKY FARES PLATFORM</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", marginTop: 4 }}>Enterprise Flight &amp; Booking Engine</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 4, color: "#fff" }}>Next.js 15</span>
                      <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 4, color: "#fff" }}>Prisma</span>
                      <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 4, color: "#fff" }}>Stripe API</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 8px", color: "var(--pub-ink)", letterSpacing: "-0.03em" }}>
                    All Sky Fares Web Platform
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--pub-muted)", margin: 0, lineHeight: 1.6 }}>
                    High-volume transaction platform with flight search caching, automated invoice delivery, and customer booking management.
                  </p>
                </div>
              </div>
              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--pub-line)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--pub-bg-alt)" }}>
                <span style={{ fontSize: 11, color: "var(--pub-muted)", fontFamily: "'DM Mono', monospace" }}>All Sky Fares LLC</span>
                <Link href="/portfolio" style={{ fontSize: 12, color: "var(--pub-violet)", textDecoration: "none", fontWeight: 700 }}>
                  Case Study &rarr;
                </Link>
              </div>
            </div>

            {/* Fallback / Featured Concept Mockup 2: Nova CRM */}
            <div className="nova-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="nova-browser-frame" style={{ borderRadius: "18px 18px 0 0", border: "none" }}>
                  <div className="nova-browser-topbar">
                    <div className="nova-traffic-lights">
                      <span className="nova-traffic-dot nova-traffic-red" />
                      <span className="nova-traffic-dot nova-traffic-yellow" />
                      <span className="nova-traffic-dot nova-traffic-green" />
                    </div>
                    <div className="nova-browser-address">nova.internal/admin/crm</div>
                    <span className="nova-pill-tag nova-pill-lime" style={{ padding: "2px 6px", fontSize: 9 }}>CRM</span>
                  </div>
                  <div style={{ height: 180, background: "linear-gradient(135deg, #0C0F1A 0%, #171E36 100%)", padding: 20, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 11, color: "#A8FF7D", fontFamily: "'DM Mono', monospace" }}>NOVA OPERATIONAL SUITE</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", marginTop: 4 }}>Role-Isolated Admin &amp; Portals</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 4, color: "#fff" }}>TOTP 2FA</span>
                      <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 4, color: "#fff" }}>Discord Hook</span>
                      <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 4, color: "#fff" }}>MySQL</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 8px", color: "var(--pub-ink)", letterSpacing: "-0.03em" }}>
                    Nova Studio Operations CRM
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--pub-muted)", margin: 0, lineHeight: 1.6 }}>
                    Operational lead routing, customer milestone management, and audit log tracking built strictly in-house for team scalability.
                  </p>
                </div>
              </div>
              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--pub-line)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--pub-bg-alt)" }}>
                <span style={{ fontSize: 11, color: "var(--pub-muted)", fontFamily: "'DM Mono', monospace" }}>Studio Operations</span>
                <Link href="/portfolio" style={{ fontSize: 12, color: "var(--pub-violet)", textDecoration: "none", fontWeight: 700 }}>
                  Case Study &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 5: DEVELOPMENT PROCESS (CONNECTED 4-STEP TIMELINE)    */}
        {/* ============================================================= */}
        <section className="shell" style={{ padding: "64px 0 48px" }}>
          <div style={{ maxWidth: 700, margin: "0 auto 48px", textAlign: "center" }}>
            <div className="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Workflow size={14} style={{ color: "var(--pub-violet)" }} />
              <span>Predictable Delivery</span>
            </div>
            <h2
              style={{
                fontSize: "clamp(34px, 4.8vw, 54px)",
                letterSpacing: "-0.06em",
                lineHeight: 1.1,
                fontWeight: 800,
                margin: "12px 0 10px",
                color: "var(--pub-ink)",
              }}
            >
              How we take projects from zero to production.
            </h2>
            <p style={{ color: "var(--pub-muted)", fontSize: 15, margin: 0 }}>
              A disciplined, transparent engineering framework designed to eliminate guesswork and ship within 14 days.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: 20 }}>
            {processSteps.map((step) => (
              <div
                key={step.step}
                className="nova-card"
                style={{
                  padding: 30,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderTop: "3px solid var(--pub-violet)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <span className="eyebrow" style={{ color: "var(--pub-violet)", fontWeight: 800, fontSize: 14 }}>
                      {step.step}
                    </span>
                    <span className="nova-pill-tag" style={{ padding: "3px 8px", fontSize: 10 }}>
                      {step.tag}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 19, fontWeight: 800, color: "var(--pub-ink)", margin: "0 0 10px", letterSpacing: "-0.03em" }}>
                    {step.name}
                  </h3>
                  <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--pub-muted)", margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 6: ENGINEERING STANDARDS & ARCHITECTURE               */}
        {/* ============================================================= */}
        <section className="shell" style={{ padding: "64px 0 48px" }}>
          <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
            <div className="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Code2 size={14} style={{ color: "var(--pub-violet)" }} />
              <T k="hero.standards_eyebrow" fallback="Architecture & Standards" />
            </div>
            <h2
              style={{
                fontSize: "clamp(34px, 4.8vw, 54px)",
                letterSpacing: "-0.06em",
                margin: "12px 0 10px",
                fontWeight: 800,
                color: "var(--pub-ink)",
              }}
            >
              <T k="hero.standards_title" fallback="Built to withstand real traffic and hard days." />
            </h2>
            <p style={{ color: "var(--pub-muted)", fontSize: 15, margin: 0 }}>
              <T k="hero.standards_desc" fallback="We do not use bloated page builders or black-box templates. Every project is authored with clean, testable, and maintainable code." />
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: 20,
            }}
          >
            {/* Bento 1: Performance */}
            <div className="nova-card" style={{ padding: 30, borderTop: "3px solid #10B981" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(16, 185, 129, 0.12)",
                  display: "grid",
                  placeItems: "center",
                  color: "#10B981",
                  marginBottom: 18,
                }}
              >
                <Zap size={20} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 8px", color: "var(--pub-ink)" }}>
                <T k="hero.bento1_title" fallback="Core Web Vitals & Speed" />
              </h3>
              <p style={{ fontSize: 13, color: "var(--pub-muted)", lineHeight: 1.7, margin: 0 }}>
                <T k="hero.bento1_desc" fallback="Optimized font loading, priority LCP images, sub-50ms TTFB edge caching, and zero layout shift across devices." />
              </p>
            </div>

            {/* Bento 2: Security */}
            <div className="nova-card" style={{ padding: 30, borderTop: "3px solid var(--pub-violet)" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(108, 76, 255, 0.12)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--pub-violet)",
                  marginBottom: 18,
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 8px", color: "var(--pub-ink)" }}>
                <T k="hero.bento2_title" fallback="Multi-Role Security & 2FA" />
              </h3>
              <p style={{ fontSize: 13, color: "var(--pub-muted)", lineHeight: 1.7, margin: 0 }}>
                <T k="hero.bento2_desc" fallback="Time-based One-Time Passwords (TOTP), signed cookie sessions, rate-limited inquiry routes, and isolated role boundaries." />
              </p>
            </div>

            {/* Bento 3: Architecture */}
            <div className="nova-card" style={{ padding: 30, borderTop: "3px solid #FFB547" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(255, 181, 71, 0.12)",
                  display: "grid",
                  placeItems: "center",
                  color: "#FFB547",
                  marginBottom: 18,
                }}
              >
                <Layers size={20} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 8px", color: "var(--pub-ink)" }}>
                <T k="hero.bento3_title" fallback="Modern Type-Safe Stack" />
              </h3>
              <p style={{ fontSize: 13, color: "var(--pub-muted)", lineHeight: 1.7, margin: 0 }}>
                <T k="hero.bento3_desc" fallback="Next.js 15 App Router, React 19 Server Components, Prisma ORM, and comprehensive Vitest unit test coverage." />
              </p>
            </div>

            {/* Bento 4: Client Portal */}
            <div className="nova-card" style={{ padding: 30, borderTop: "3px solid var(--pub-cyan)" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(78, 228, 245, 0.12)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--pub-cyan)",
                  marginBottom: 18,
                }}
              >
                <FolderGit2 size={20} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 8px", color: "var(--pub-ink)" }}>
                <T k="hero.bento4_title" fallback="Dedicated Client Workspace" />
              </h3>
              <p style={{ fontSize: 13, color: "var(--pub-muted)", lineHeight: 1.7, margin: 0 }}>
                <T k="hero.bento4_desc" fallback="Clients receive their own private portal with real-time sprint milestones, direct communications, and invoice tracking." />
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 7: TECH BADGES STRIP                                  */}
        {/* ============================================================= */}
        <section
          style={{
            padding: "48px 0",
            background: "var(--pub-bg-alt)",
            borderTop: "1px solid var(--pub-line)",
            borderBottom: "1px solid var(--pub-line)",
          }}
        >
          <div className="shell">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
              <span className="eyebrow"><T k="hero.tech_eyebrow" fallback="Technology & Production Tooling" /></span>
              <span style={{ fontSize: 12, color: "var(--pub-muted)" }}><T k="hero.tech_ownership" fallback="No proprietary lock-in · Full codebase ownership" /></span>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {techBadges.map((badge) => (
                <div
                  key={badge.name}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 12,
                    background: "var(--pub-surface)",
                    border: "1px solid var(--pub-line)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--pub-ink)",
                    boxShadow: "var(--pub-shadow-sm)",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--pub-violet)" }} />
                  <span>{badge.name}</span>
                  <span style={{ fontSize: 10, color: "var(--pub-muted)", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
                    ({badge.tag})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* SECTION 8: FREQUENTLY ASKED QUESTIONS                         */}
        {/* ============================================================= */}
        <section className="shell" style={{ padding: "clamp(64px, 8vw, 96px) 0 48px" }}>
          <div style={{ maxWidth: 740, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div className="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--pub-violet)" }}>
                <Sparkles size={13} />
                <span><T k="nav.faq" fallback="FAQ" /></span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(32px, 4.5vw, 50px)",
                  letterSpacing: "-0.06em",
                  lineHeight: 1.1,
                  fontWeight: 800,
                  margin: "12px 0 10px",
                  color: "var(--pub-ink)",
                }}
              >
                Clear answers before we begin.
              </h2>
              <p style={{ color: "var(--pub-muted)", fontSize: 15, margin: 0 }}>
                Transparent pricing, timelines, ownership, and client portal access explained upfront.
              </p>
            </div>

            <FAQAccordion items={homeFaqs} />
          </div>
        </section>

        {/* ============================================================= */}
        {/* CALL TO ACTION BANNER                                         */}
        {/* ============================================================= */}
        <section
          style={{
            padding: "clamp(64px, 8vw, 96px) 0",
            background: "var(--pub-surface-card)",
            borderTop: "1px solid var(--pub-line)",
            borderBottom: "1px solid var(--pub-line)",
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
            <div style={{ maxWidth: 640 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <NovaMascotAvatar size={26} />
                <span className="eyebrow" style={{ color: "var(--pub-violet)" }}>
                  <T k="contact.eyebrow" fallback="A thoughtful place to begin" />
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(36px, 5.5vw, 68px)",
                  letterSpacing: "-0.07em",
                  lineHeight: 1.02,
                  margin: "0 0 16px",
                  fontWeight: 800,
                  color: "var(--pub-ink)",
                }}
              >
                <T k="contact.title" fallback="Have a big idea? Let's make it real." />
              </h2>
              <div style={{ display: "flex", gap: 20, color: "var(--pub-muted)", fontSize: 13, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={14} style={{ color: "#10B981" }} /> Responses within 24 business hours
                </span>
                <span>·</span>
                <span>Operating entity: All Sky Fares LLC</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Link className="nova-btn-primary" href="/contact" style={{ padding: "16px 30px", fontSize: 15 }}>
                <span><T k="hero.start_project" fallback="Tell us about your project" /></span>
                <ArrowUpRight size={17} className="nova-arrow-icon" />
              </Link>
              <Link className="nova-btn-secondary" href="/portfolio" style={{ padding: "13px 22px", fontSize: 13, justifyContent: "center" }}>
                <span><T k="hero.explore_work" fallback="Browse work &amp; GitHub activity" /></span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
