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
      <div style={{ display: "grid", gap: 48 }}>
        {/* Timeline Steps Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {steps.map((step) => (
            <div
              key={step.phase}
              className="card card-hover-glow"
              style={{
                padding: 30,
                borderRadius: 20,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderTop: "3px solid var(--blue)",
                position: "relative",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 18,
                      fontWeight: 800,
                      color: "var(--blue)",
                    }}
                  >
                    Phase {step.phase}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 99,
                      background: "rgba(108, 76, 255, 0.1)",
                      color: "var(--blue)",
                    }}
                  >
                    {step.timeframe}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 10px" }}>
                  <div style={{ color: "var(--ink)" }}>{step.icon}</div>
                  <h2 style={{ fontSize: 20, letterSpacing: "-.04em", margin: 0, color: "var(--ink)", fontWeight: 700 }}>
                    {step.name}
                  </h2>
                </div>

                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 18px" }}>
                  {step.summary}
                </p>

                <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                    {step.points.map((pt) => (
                      <li key={pt} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--ink)", lineHeight: 1.5 }}>
                        <CheckCircle2 size={14} style={{ color: "var(--blue)", flexShrink: 0, marginTop: 2 }} />
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
          className="card"
          style={{
            padding: "clamp(24px, 4vw, 36px) clamp(20px, 4vw, 40px)",
            borderRadius: 20,
            background: "var(--lav)",
            border: "1px solid var(--line)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: 28,
            alignItems: "center",
          }}
        >
          <div>
            <div className="eyebrow" style={{ color: "var(--blue)" }}>
              {t("process.eyebrow", "Direct Transparency")}
            </div>
            <h3 style={{ fontSize: 24, letterSpacing: "-.04em", margin: "10px 0 10px", color: "var(--ink)", fontWeight: 700 }}>
              {t("process_page.portal_title", "Track everything in your private Client Portal")}
            </h3>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 16px" }}>
              {t("process_page.portal_desc", "Every client receives login credentials to our dedicated Nova Client Portal. View real-time milestone completions, task breakdowns, direct communications, and invoice history in one secure place.")}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "var(--paper)", border: "1px solid var(--line)", fontWeight: 600 }}>
                {t("process_page.badge_milestones", "Sprint Milestones")}
              </span>
              <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "var(--paper)", border: "1px solid var(--line)", fontWeight: 600 }}>
                {t("process_page.badge_messaging", "Direct Messaging")}
              </span>
              <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "var(--paper)", border: "1px solid var(--line)", fontWeight: 600 }}>
                {t("process_page.badge_security", "Role-Isolated Security")}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link className="button" href="/contact" style={{ padding: "14px 24px", fontSize: 14 }}>
              {t("hero.start_project", "Start your project roadmap")} <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>

        <CTA />
      </div>
    </PublicPage>
  );
}
