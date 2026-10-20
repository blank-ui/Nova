"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { NovaMascotAvatar } from "@/components/brand";
import { useLanguage } from "@/components/language-provider";
import "@/app/public-redesign.css";

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
    <div className="nova-public-root">
      <Navigation />
      <main>
        <section
          className="nova-grid-bg"
          style={{
            padding: "96px 0 72px",
            position: "relative",
            overflow: "hidden",
            borderBottom: "1px solid var(--pub-line, rgba(14, 17, 24, 0.08))",
          }}
        >
          {/* Subtle Ambient Glow Orbs */}
          <div
            className="nova-glow-orb nova-glow-violet"
            style={{
              width: 520,
              height: 520,
              right: "-5%",
              top: -80,
            }}
          />
          <div
            className="nova-glow-orb nova-glow-lime"
            style={{
              width: 320,
              height: 320,
              left: "-3%",
              bottom: 0,
            }}
          />

          <div className="shell" style={{ position: "relative", zIndex: 1 }}>
            <div
              className="nova-pill-tag"
              style={{
                marginBottom: 20,
                color: "var(--pub-violet, #6C4CFF)",
                background: "var(--pub-violet-soft, rgba(108, 76, 255, 0.08))",
                borderColor: "rgba(108, 76, 255, 0.25)",
              }}
            >
              <Sparkles size={13} />
              <span>{eyebrow}</span>
            </div>

            <h1
              className="nova-editorial-headline"
              style={{
                fontSize: "clamp(34px, 5.5vw, 76px)",
                maxWidth: 960,
                margin: "12px 0 20px",
              }}
            >
              {title}
            </h1>

            <p
              className="nova-editorial-subhead"
              style={{
                maxWidth: 680,
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          </div>
        </section>

        <section className="shell" style={{ padding: "64px 0 48px" }}>
          {children}
        </section>
      </main>
      <Footer />
    </div>
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
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
        gap: 20,
      }}
    >
      {items.map((item, i) => (
        <article
          className="nova-card"
          key={typeof item.title === "string" ? item.title : i}
          style={{
            padding: 30,
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderTop: "3px solid var(--pub-violet, #6C4CFF)",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="eyebrow" style={{ color: "var(--pub-muted)", fontWeight: 700 }}>
                0{i + 1} / Focus
              </span>
              {item.icon && <div style={{ color: "var(--pub-violet, #6C4CFF)" }}>{item.icon}</div>}
            </div>
            <h2
              style={{
                fontSize: 20,
                letterSpacing: "-.04em",
                margin: "20px 0 10px",
                color: "var(--pub-ink)",
                fontWeight: 700,
              }}
            >
              {item.title}
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--pub-muted)",
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
      className="nova-card"
      style={{
        marginTop: 64,
        padding: "clamp(28px, 5vw, 48px) clamp(24px, 4.5vw, 44px)",
        borderRadius: 24,
        background: "var(--pub-surface-card)",
        border: "1px solid var(--pub-line)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 32,
        flexWrap: "wrap",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <NovaMascotAvatar size={22} />
          <span className="eyebrow" style={{ color: "var(--pub-violet, #6C4CFF)" }}>
            Nova · Operated on behalf of All Sky Fares LLC
          </span>
        </div>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            letterSpacing: "-.06em",
            margin: "0 0 10px",
            color: "var(--pub-ink)",
            fontWeight: 800,
            lineHeight: 1.08,
          }}
        >
          {title || t("hero.cta_title", "Have a big idea? Let's make it real.")}
          {subtitle && (
            <>
              <br />
              <span style={{ color: "var(--pub-muted)", fontWeight: 400, fontSize: "0.85em" }}>{subtitle}</span>
            </>
          )}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, fontSize: 13, color: "var(--pub-muted)", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Clock size={14} style={{ color: "#10B981" }} /> {t("hero.cta_hours", "Replies within 24 hours")}
          </span>
          <span>·</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ShieldCheck size={14} style={{ color: "var(--pub-violet, #6C4CFF)" }} /> {t("hero.cta_contract", "Contract entity: All Sky Fares LLC")}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link className="nova-btn-primary" href="/contact" style={{ padding: "14px 26px", fontSize: 14 }}>
          <span>{t("hero.start_project", "Start a project")}</span>
          <ArrowUpRight size={16} className="nova-arrow-icon" />
        </Link>
        <Link className="nova-btn-secondary" href="/portfolio" style={{ padding: "14px 22px", fontSize: 14 }}>
          <span>{t("hero.explore_work", "Explore our work")}</span>
        </Link>
      </div>
    </div>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 14 }}>
      {items.map((item) => (
        <li
          key={item}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            fontSize: 14,
            color: "var(--pub-muted)",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--pub-violet-soft, rgba(108, 76, 255, 0.12))",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Check size={13} style={{ color: "var(--pub-violet, #6C4CFF)" }} />
          </div>
          <span style={{ color: "var(--pub-ink)", fontWeight: 500 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
