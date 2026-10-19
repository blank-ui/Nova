"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { NovaMascotAvatar } from "@/components/brand";
import { useLanguage } from "@/components/language-provider";

export function PublicPage({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main>
        <section
          className="grid-paper"
          style={{
            padding: "88px 0 64px",
            position: "relative",
            overflow: "hidden",
            borderBottom: "1px solid var(--line)",
          }}
        >
          {/* Ambient Orb */}
          <div
            className="orb orb-float"
            style={{
              width: 500,
              height: 500,
              right: "-5%",
              top: -80,
              background: "var(--orb-gradient)",
            }}
          />

          <div className="shell animate-fade-in-up" style={{ position: "relative", zIndex: 1 }}>
            <div
              className="eyebrow"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
                padding: "4px 12px",
                borderRadius: 99,
                background: "rgba(108, 76, 255, 0.08)",
                border: "1px solid rgba(108, 76, 255, 0.2)",
                color: "var(--blue)",
              }}
            >
              <Sparkles size={13} />
              <span>{eyebrow}</span>
            </div>

            <h1
              style={{
                fontSize: "clamp(32px, 6vw, 76px)",
                lineHeight: 1.02,
                letterSpacing: "-.075em",
                fontWeight: 700,
                maxWidth: 920,
                margin: "12px 0 20px",
                color: "var(--ink)",
              }}
            >
              {title}
            </h1>

            <p
              style={{
                fontSize: 17,
                lineHeight: 1.8,
                color: "var(--muted)",
                maxWidth: 680,
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          </div>
        </section>

        <section className="shell" style={{ padding: "60px 0 40px" }}>
          {children}
        </section>
      </main>
      <Footer />
    </>
  );
}

export function FeatureGrid({
  items,
}: {
  items: { title: React.ReactNode; text: React.ReactNode; icon?: React.ReactNode }[];
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
        gap: 18,
      }}
    >
      {items.map((item, i) => (
        <article
          className="card card-hover-glow"
          key={typeof item.title === "string" ? item.title : i}
          style={{
            padding: 28,
            minHeight: 200,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderTop: "3px solid var(--blue)",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="eyebrow" style={{ color: "var(--muted)", fontWeight: 700 }}>
                0{i + 1} / Focus
              </span>
              {item.icon && <div style={{ color: "var(--blue)" }}>{item.icon}</div>}
            </div>
            <h2
              style={{
                fontSize: 20,
                letterSpacing: "-.04em",
                margin: "18px 0 10px",
                color: "var(--ink)",
                fontWeight: 700,
              }}
            >
              {item.title}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--muted)",
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {item.text}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function CTA({
  title,
  subtitle,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div
      className="card card-hover-glow animate-fade-in-up"
      style={{
        marginTop: 64,
        padding: "clamp(24px, 5vw, 44px) clamp(20px, 4.5vw, 40px)",
        borderRadius: 24,
        background: "var(--banner-bg)",
        border: "1px solid var(--line)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 28,
        flexWrap: "wrap",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 540 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <NovaMascotAvatar size={20} />
          <span className="eyebrow" style={{ color: "var(--blue)" }}>
            Nova · Operated on behalf of All Sky Fares LLC
          </span>
        </div>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            letterSpacing: "-.06em",
            margin: "0 0 10px",
            color: "var(--ink)",
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {title || t("hero.cta_title", "Have a big idea? Let's make it real.")}
          {subtitle && (
            <>
              <br />
              <span style={{ color: "var(--muted)" }}>{subtitle}</span>
            </>
          )}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, fontSize: 12, color: "var(--muted)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Clock size={13} style={{ color: "#10b981" }} /> {t("hero.cta_hours", "Replies within 24 hours")}
          </span>
          <span>·</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <ShieldCheck size={13} style={{ color: "var(--blue)" }} /> {t("hero.cta_contract", "Contract entity: All Sky Fares LLC")}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link className="button" href="/contact" style={{ padding: "14px 24px", fontSize: 14 }}>
          {t("hero.start_project", "Start a project")} <ArrowUpRight size={16} />
        </Link>
        <Link className="button button-outline" href="/portfolio" style={{ padding: "14px 22px", fontSize: 14 }}>
          {t("hero.explore_work", "Explore our work")}
        </Link>
      </div>
    </div>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
      {items.map((item) => (
        <li
          key={item}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            fontSize: 14,
            color: "var(--muted)",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "rgba(108, 76, 255, 0.12)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Check size={13} style={{ color: "var(--blue)" }} />
          </div>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
