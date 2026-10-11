import React from "react";
import { PublicPage } from "@/components/public-page";
import { ShieldAlert, Info } from "lucide-react";

export interface LegalSection {
  title: string;
  body: React.ReactNode;
}

export default function LegalPage({
  kind,
  title,
  subtitle,
  sections,
}: {
  kind: string;
  title: string;
  subtitle: string;
  sections: LegalSection[];
}) {
  return (
    <PublicPage eyebrow={`Nova · ${kind}`} title={title} subtitle={subtitle}>
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        <p className="eyebrow" style={{ color: "var(--muted)" }}>
          Operated by All Sky Fares LLC · Last updated: October 2026
        </p>

        <div
          className="card"
          style={{
            padding: "20px 24px",
            background: "rgba(255, 181, 71, 0.08)",
            border: "1px solid rgba(255, 181, 71, 0.25)",
            borderRadius: 16,
            color: "var(--ink)",
            fontSize: 13,
            lineHeight: 1.7,
            margin: "20px 0 32px",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <Info size={18} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Notice:</strong> Nova is a digital studio and client portal service operated on behalf of <strong>All Sky Fares LLC</strong>.
            These terms and policies outline our operational practices, data protection measures, and service standards.
            Formal engagements are governed by executed client statements of work and applicable law.
          </div>
        </div>

        <div style={{ display: "grid", gap: 32 }}>
          {sections.map((s) => (
            <section
              key={s.title}
              className="card"
              style={{
                padding: "28px 32px",
                borderRadius: 18,
                background: "var(--paper)",
                border: "1px solid var(--line)",
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  letterSpacing: "-.04em",
                  color: "var(--ink)",
                  fontWeight: 700,
                  margin: "0 0 14px",
                }}
              >
                {s.title}
              </h2>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.85,
                  color: "var(--muted)",
                }}
              >
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </PublicPage>
  );
}
