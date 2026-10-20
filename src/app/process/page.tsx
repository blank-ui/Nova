"use client";

import Link from "next/link";
import { PublicPage, CTA } from "@/components/public-page";
import { Search, PenTool, Code, Rocket, CheckCircle2, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function Process() {
  const { t } = useLanguage();

  const steps = [
    {
      phase: "01",
      name: t("process_page.step1_name", "Discover & Map"),
      timeframe: t("process_page.step1_time", "Week 1"),
      icon: <Search size={22} />,
      summary: t("process_page.step1_summary", "We dig deep into your goals, audience constraints, business model, and existing tech stack to build a bulletproof roadmap."),
      points: [
        "Discovery call & architecture requirements workshop",
        "Competitive benchmarking & user journey mapping",
        "Technical feasibility check & stack selection",
        "Fixed milestone agreement & written specification",
      ],
    },
    {
      phase: "02",
      name: t("process_page.step2_name", "Design & Prototype"),
      timeframe: t("process_page.step2_time", "Weeks 2–3"),
      icon: <PenTool size={22} />,
      summary: t("process_page.step2_summary", "Visualizing the solution early through clickable mockups, responsive artboards, and cohesive design system tokens."),
      points: [
        "Information architecture & low-fidelity wireframing",
        "High-fidelity design components in light and dark modes",
        "Clickable interactive prototypes to test real user flows",
        "Iterative client reviews until every detail feels right",
      ],
    },
    {
      phase: "03",
      name: t("process_page.step3_name", "Engineer & Verify"),
      timeframe: t("process_page.step3_time", "Weeks 3–5"),
      icon: <Code size={22} />,
      summary: t("process_page.step3_summary", "Turning approved designs into clean, production-grade Next.js, React 19, and TypeScript code backed by automated testing."),
      points: [
        "Full-stack implementation with clean modular components",
        "Prisma schema design & optimized database queries",
        "100% Core Web Vitals performance tuning & WCAG AA checks",
        "Unit & integration tests run via Vitest before every milestone",
      ],
    },
    {
      phase: "04",
      name: t("process_page.step4_name", "Deploy & Handover"),
      timeframe: t("process_page.step4_time", "Week 6+"),
      icon: <Rocket size={22} />,
      summary: t("process_page.step4_summary", "Carefully staged deployment, DNS setup, security verification, and complete codebase handover with zero vendor lock-in."),
      points: [
        "Final client review on a dedicated private staging environment",
        "Smooth production deployment to Edge network / VPS",
        "DNS cutover, SSL validation, and automated backups configured",
        "Codebase repository transfer & administrative walkthrough",
      ],
    },
  ];

  return (
    <PublicPage
      eyebrow={t("process_page.eyebrow", "How We Work · Clear milestones")}
      title={t("process_page.title", "A calm, structured path from concept to code.")}
      subtitle={t("process_page.subtitle", "We believe uncertainty kills momentum. Our 4-step process replaces guesswork with fixed milestones, direct access to builders, and continuous visibility.")}
    >
      <div style={{ display: "grid", gap: 54 }}>
        {/* Timeline Steps Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 24 }}>
          {steps.map((step) => (
            <div
              key={step.phase}
              className="nova-card"
              style={{
                padding: 32,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderTop: "3px solid var(--pub-violet)",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 18,
                      fontWeight: 800,
                      color: "var(--pub-violet)",
                    }}
                  >
                    Phase {step.phase}
                  </span>
                  <span className="nova-pill-tag" style={{ fontSize: 10, fontWeight: 700 }}>
                    {step.timeframe}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 12px" }}>
                  <div style={{ color: "var(--pub-violet)" }}>{step.icon}</div>
                  <h2 style={{ fontSize: 20, letterSpacing: "-0.04em", margin: 0, color: "var(--pub-ink)", fontWeight: 800 }}>
                    {step.name}
                  </h2>
                </div>

                <p style={{ fontSize: 14, color: "var(--pub-muted)", lineHeight: 1.7, margin: "0 0 20px" }}>
                  {step.summary}
                </p>

                <div style={{ borderTop: "1px solid var(--pub-line)", paddingTop: 18 }}>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                    {step.points.map((pt) => (
                      <li key={pt} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--pub-ink)", lineHeight: 1.5 }}>
                        <CheckCircle2 size={15} style={{ color: "var(--pub-violet)", flexShrink: 0, marginTop: 2 }} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Client Portal Integration Spotlight */}
        <div
          className="nova-card"
          style={{
            padding: "clamp(28px, 4vw, 40px)",
            borderRadius: 24,
            background: "var(--pub-surface-card)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: 28,
            alignItems: "center",
          }}
        >
          <div>
            <div className="eyebrow" style={{ color: "var(--pub-violet)", marginBottom: 10 }}>
              {t("process.eyebrow", "Direct Transparency")}
            </div>
            <h3 style={{ fontSize: "clamp(24px, 3.2vw, 36px)", letterSpacing: "-0.05em", margin: "0 0 12px", color: "var(--pub-ink)", fontWeight: 800 }}>
              {t("process_page.portal_title", "Track everything in your private Client Portal")}
            </h3>
            <p style={{ fontSize: 14, color: "var(--pub-muted)", lineHeight: 1.75, margin: "0 0 20px" }}>
              {t("process_page.portal_desc", "Every client receives login credentials to our dedicated Nova Client Portal. View real-time milestone completions, task breakdowns, direct communications, and invoice history in one secure place.")}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span className="nova-pill-tag">
                {t("process_page.badge_milestones", "Sprint Milestones")}
              </span>
              <span className="nova-pill-tag">
                {t("process_page.badge_messaging", "Direct Messaging")}
              </span>
              <span className="nova-pill-tag">
                {t("process_page.badge_security", "Role-Isolated Security")}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link className="nova-btn-primary" href="/contact" style={{ padding: "14px 26px", fontSize: 14 }}>
              <span>{t("hero.start_project", "Start your project roadmap")}</span>
              <ArrowUpRight size={15} className="nova-arrow-icon" />
            </Link>
          </div>
        </div>

        <CTA />
      </div>
    </PublicPage>
  );
}
