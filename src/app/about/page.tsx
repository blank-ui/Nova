"use client";

import { PublicPage, FeatureGrid, CTA, Checklist } from "@/components/public-page";
import { ShieldCheck, HeartHandshake, Code2 } from "lucide-react";
import { NovaMark } from "@/components/brand";
import { useLanguage } from "@/components/language-provider";

export default function About() {
  const { t } = useLanguage();

  return (
    <PublicPage
      eyebrow={t("about.eyebrow", "The Studio · Small by intention")}
      title={t("about.title", "Good work starts with listening.")}
      subtitle={t("about.subtitle", "Nova is an independent digital studio partnering with teams worldwide to make useful, well-crafted digital products and websites. We keep the process close, collaborative, and grounded in real business problems.")}
    >
      <div style={{ display: "grid", gap: 48 }}>
        {/* Core Philosophy Banner */}
        <div
          className="card card-hover-glow"
          style={{
            padding: "clamp(24px, 4vw, 36px) clamp(20px, 4vw, 40px)",
            borderRadius: 20,
            background: "var(--lav)",
            border: "1px solid var(--line)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div>
            <div className="eyebrow" style={{ color: "var(--blue)" }}>
              {t("about.entity_eyebrow", "Operating Entity & Structure")}
            </div>
            <h2 style={{ fontSize: 24, letterSpacing: "-.04em", margin: "10px 0 12px", color: "var(--ink)", fontWeight: 700 }}>
              {t("about.entity_title", "Operated on behalf of All Sky Fares LLC")}
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
              {t("about.entity_desc", "Nova operates as the bespoke digital innovation, web development, and design services wing of All Sky Fares LLC. We partner directly with clients across North America, Europe, India, and Asia, combining corporate contractual reliability with the agility of an independent design lab.")}
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <NovaMark size={64} starColor="#6C4CFF" dotColor="#FFB547" />
          </div>
        </div>

        {/* Studio Principles Grid */}
        <div>
          <div style={{ marginBottom: 24 }}>
            <div className="eyebrow">{t("about.values_eyebrow", "Guiding Values")}</div>
            <h2 style={{ fontSize: 32, letterSpacing: "-.05em", margin: "8px 0 0", color: "var(--ink)", fontWeight: 700 }}>
              {t("about.values_title", "How we approach every build")}
            </h2>
          </div>

          <FeatureGrid
            items={[
              {
                title: t("about.val1_title", "Care before complexity"),
                text: t("about.val1_desc", "We ask the tough, foundational questions early so the architecture solves the actual bottleneck rather than adding unnecessary layers."),
                icon: <HeartHandshake size={20} />,
              },
              {
                title: t("about.val2_title", "Craft with purpose"),
                text: t("about.val2_desc", "Every micro-interaction, database schema, and CSS token earns its place. We build resilient interfaces that handle unexpected edge cases with grace."),
                icon: <Code2 size={20} />,
              },
              {
                title: t("about.val3_title", "Partnership that lasts"),
                text: t("about.val3_desc", "We believe in honest trade-offs, clear written updates, and complete transparency. When your project ships, you own 100% of the code and assets."),
                icon: <ShieldCheck size={20} />,
              },
            ]}
          />
        </div>

        {/* Why Small By Intention Bento */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          <div className="card" style={{ padding: 32, borderTop: "3px solid var(--blue)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px", color: "var(--ink)" }}>
              {t("about.direct_collab_title", "No Account Managers In Between")}
            </h3>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.75, margin: 0 }}>
              {t("about.direct_collab_desc", "When you work with Nova, you collaborate directly with the engineers and designers shaping your platform. Communication is swift, nuanced, and devoid of corporate bureaucracy or games of telephone.")}
            </p>
          </div>

          <div className="card" style={{ padding: 32, borderTop: "3px solid #10b981" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px", color: "var(--ink)" }}>
              {t("about.standards_title", "Standards We Commit To")}
            </h3>
            <Checklist
              items={[
                t("about.check1", "Strict TypeScript with zero unchecked type errors"),
                t("about.check2", "Sub-100ms LCP & 100% Core Web Vitals optimization"),
                t("about.check3", "WCAG AA compliance for accessible, inclusive UX"),
                t("about.check4", "Full automated test coverage with Vitest & Playwright"),
                t("about.check5", "Clean Prisma ORM schemas with zero database lock-in"),
              ]}
            />
          </div>
        </div>

        <CTA />
      </div>
    </PublicPage>
  );
}
