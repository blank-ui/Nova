import Link from "next/link";
import { PublicPage, FeatureGrid, CTA, Checklist } from "@/components/public-page";
import { ShieldCheck, HeartHandshake, Code2, Users, Sparkles, ArrowUpRight } from "lucide-react";
import { NovaMark, NovaMascotAvatar } from "@/components/brand";

export default function About() {
  return (
    <PublicPage
      eyebrow="The Studio · Small by intention"
      title="Good work starts with listening."
      subtitle="Nova is an independent digital studio partnering with teams worldwide to make useful, well-crafted digital products and websites. We keep the process close, collaborative, and grounded in real business problems."
    >
      <div style={{ display: "grid", gap: 48 }}>
        {/* Core Philosophy Banner */}
        <div
          className="card card-hover-glow"
          style={{
            padding: "36px 40px",
            borderRadius: 20,
            background: "var(--lav)",
            border: "1px solid var(--line)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div>
            <div className="eyebrow" style={{ color: "var(--blue)" }}>
              Operating Entity & Structure
            </div>
            <h2 style={{ fontSize: 24, letterSpacing: "-.04em", margin: "10px 0 12px", color: "var(--ink)", fontWeight: 700 }}>
              Operated on behalf of All Sky Fares LLC
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
              Nova operates as the bespoke digital innovation, web development, and design services wing of <strong>All Sky Fares LLC</strong>. We partner directly with clients across North America, Europe, India, and Asia, combining corporate contractual reliability with the agility of an independent design lab.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <NovaMark size={64} starColor="#6C4CFF" dotColor="#FFB547" />
          </div>
        </div>

        {/* Studio Principles Grid */}
        <div>
          <div style={{ marginBottom: 24 }}>
            <div className="eyebrow">Guiding Values</div>
            <h2 style={{ fontSize: 32, letterSpacing: "-.05em", margin: "8px 0 0", color: "var(--ink)", fontWeight: 700 }}>
              How we approach every build
            </h2>
          </div>

          <FeatureGrid
            items={[
              {
                title: "Care before complexity",
                text: "We ask the tough, foundational questions early so the architecture solves the actual bottleneck rather than adding unnecessary layers.",
                icon: <HeartHandshake size={20} />,
              },
              {
                title: "Craft with purpose",
                text: "Every micro-interaction, database schema, and CSS token earns its place. We build resilient interfaces that handle unexpected edge cases with grace.",
                icon: <Code2 size={20} />,
              },
              {
                title: "Partnership that lasts",
                text: "We believe in honest trade-offs, clear written updates, and complete transparency. When your project ships, you own 100% of the code and assets.",
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
              No Account Managers In Between
            </h3>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.75, margin: 0 }}>
              When you work with Nova, you collaborate directly with the engineers and designers shaping your platform. Communication is swift, nuanced, and devoid of corporate bureaucracy or games of telephone.
            </p>
          </div>

          <div className="card" style={{ padding: 32, borderTop: "3px solid #10b981" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px", color: "var(--ink)" }}>
              Standards We Commit To
            </h3>
            <Checklist
              items={[
                "Strict TypeScript with zero unchecked type errors",
                "Sub-100ms LCP & 100% Core Web Vitals optimization",
                "WCAG AA compliance for accessible, inclusive UX",
                "Full automated test coverage with Vitest & Playwright",
                "Clean Prisma ORM schemas with zero database lock-in",
              ]}
            />
          </div>
        </div>

        <CTA
          title="Looking for a thoughtful digital partner?"
          subtitle="Let's make something remarkable together."
        />
      </div>
    </PublicPage>
  );
}
