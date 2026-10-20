"use client";

import Link from "next/link";
import { PublicPage, CTA } from "@/components/public-page";
import {
  Globe,
  Layers,
  LineChart,
  Figma,
  Cpu,
  HeartPulse,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function Services() {
  const { t } = useLanguage();

  const serviceList = [
    {
      icon: <Globe size={24} />,
      title: t("services_page.card1_title", "Websites & Brand Experiences"),
      text: t("services_page.card1_desc", "Distinctive, lightning-fast marketing websites built around your positioning, narrative, and conversion goals."),
      deliverables: [
        "Custom responsive layout & design system",
        "Next.js App Router static/dynamic rendering",
        "Interactive fluid motion & dark/light theme support",
        "Search engine optimization (SEO) & structured schema",
      ],
      badge: "Most Popular",
    },
    {
      icon: <Layers size={24} />,
      title: t("services_page.card2_title", "Custom Web Applications & SaaS"),
      text: t("services_page.card2_desc", "Purpose-built platforms and customer portals designed to scale with your user base and complex data models."),
      deliverables: [
        "Type-safe full-stack Next.js & React 19 architecture",
        "Prisma ORM with PostgreSQL or MySQL databases",
        "Role-based access control (RBAC) & TOTP multi-factor auth",
        "Stripe / Razorpay payment and billing integration",
      ],
      badge: "Core Expertise",
    },
    {
      icon: <LineChart size={24} />,
      title: t("services_page.card3_title", "Operational Dashboards & CRM Systems"),
      text: t("services_page.card3_desc", "Focused internal tools that eliminate manual spreadsheet chaos and bring mission-critical metrics into one clean workspace."),
      deliverables: [
        "Inquiry and lead pipeline tracking with status workflows",
        "Interactive data visualization and real-time metric charts",
        "User role isolation (Admin, Developer, Finance, Client)",
        "Audit logs, activity history, and granular security controls",
      ],
      badge: "Enterprise",
    },
    {
      icon: <Figma size={24} />,
      title: t("services_page.card4_title", "Product Design & Prototyping"),
      text: t("services_page.card4_desc", "Transforming vague requirements into clickable prototypes, cohesive component libraries, and validated UX journeys."),
      deliverables: [
        "High-fidelity responsive UI mockups & component tokens",
        "Interactive prototypes to test flows before writing code",
        "Information architecture, user personas, and customer journey mapping",
        "Design systems handoff with complete CSS guidelines",
      ],
      badge: "Design",
    },
    {
      icon: <Cpu size={24} />,
      title: t("services_page.card5_title", "APIs, Integrations & Automation"),
      text: t("services_page.card5_desc", "Connecting disjointed SaaS platforms, automating repetitive back-office tasks, and building resilient API integrations."),
      deliverables: [
        "Third-party API integrations (GitHub, Discord, Google, Hostinger)",
        "Transactional email workflows with beautiful responsive HTML templates",
        "Webhook listeners with idempotent delivery and signature validation",
        "Automated rate-limiting and anti-abuse defense layers",
      ],
      badge: "Infrastructure",
    },
    {
      icon: <HeartPulse size={24} />,
      title: t("services_page.card6_title", "Ongoing Architecture & Continuous Care"),
      text: t("services_page.card6_desc", "Reliable maintenance, dependency security upgrades, performance auditing, and direct architectural advisory."),
      deliverables: [
        "Monthly package security patching & Next.js upgrades",
        "Core Web Vitals monitoring and database query tuning",
        "Priority SLA bug resolution with direct founder communication",
        "Staged staging environments and automated regression suites",
      ],
      badge: "Partnership",
    },
  ];

  return (
    <PublicPage
      eyebrow={t("services_page.eyebrow", "Capabilities · Clear thinking, careful making")}
      title={t("services_page.title", "Digital capabilities that move your business forward.")}
      subtitle={t("services_page.subtitle", "We bring strategy, product design, and modern software engineering together to deliver digital experiences and tools that solve real bottlenecks.")}
    >
      <div style={{ display: "grid", gap: 54 }}>
        {/* Services Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 24 }}>
          {serviceList.map((service) => (
            <div
              key={service.title}
              className="nova-card"
              style={{
                padding: 34,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderTop: "3px solid var(--pub-violet)",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "var(--pub-violet-soft)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--pub-violet)",
                    }}
                  >
                    {service.icon}
                  </div>
                  <span
                    className="nova-pill-tag"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {service.badge}
                  </span>
                </div>

                <h2 style={{ fontSize: 22, letterSpacing: "-0.04em", margin: "0 0 10px", color: "var(--pub-ink)", fontWeight: 800 }}>
                  {service.title}
                </h2>
                <p style={{ fontSize: 14, color: "var(--pub-muted)", lineHeight: 1.7, margin: "0 0 24px" }}>
                  {service.text}
                </p>

                <div style={{ borderTop: "1px solid var(--pub-line)", paddingTop: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--pub-muted)", letterSpacing: "0.08em", marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>
                    {t("services_page.deliverables", "Key Deliverables:")}
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                    {service.deliverables.map((item) => (
                      <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--pub-ink)", lineHeight: 1.5 }}>
                        <CheckCircle2 size={15} style={{ color: "var(--pub-violet)", flexShrink: 0, marginTop: 2 }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid var(--pub-line)" }}>
                <Link
                  href="/contact"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--pub-violet)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    textDecoration: "none",
                  }}
                >
                  <span>{t("hero.start_project", "Inquire about this service")}</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Transparent Engagements Banner */}
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
              {t("process.eyebrow", "Transparent Scoping")}
            </div>
            <h3 style={{ fontSize: "clamp(24px, 3.2vw, 36px)", letterSpacing: "-0.05em", margin: "0 0 12px", color: "var(--pub-ink)", fontWeight: 800 }}>
              {t("services_page.banner_title", "Fixed milestone scopes. No surprise invoices.")}
            </h3>
            <p style={{ fontSize: 14, color: "var(--pub-muted)", lineHeight: 1.75, margin: 0 }}>
              {t("services_page.banner_desc", "Every engagement starts with a clearly defined specification, timeline milestones, and deliverables. You always know what is being built, when it will be delivered, and exactly what it costs.")}
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link className="nova-btn-primary" href="/contact" style={{ padding: "14px 26px", fontSize: 14 }}>
              <span>{t("hero.start_project", "Discuss your project scope")}</span>
              <ArrowUpRight size={15} className="nova-arrow-icon" />
            </Link>
          </div>
        </div>

        <CTA />
      </div>
    </PublicPage>
  );
}
