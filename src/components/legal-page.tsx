import React from "react";
import { PublicPage } from "@/components/public-page";

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
      <div style={{ maxWidth: 820 }}>
        <p className="eyebrow">Operated by All Sky Fares LLC · Last updated: October 11, 2026</p>
        <div
          style={{
            padding: 18,
            background: "#fff4d9",
            borderRadius: 13,
            color: "#6d531b",
            fontSize: 13,
            lineHeight: 1.7,
            margin: "22px 0 30px",
          }}
        >
          <strong>Notice:</strong> Nova is a digital studio and client portal service operated on behalf of All Sky Fares LLC.
          These terms and policies outline our operational practices, data protection measures, and service standards.
          Formal engagements are governed by executed client statements of work and applicable law.
        </div>
        {sections.map((s) => (
          <section key={s.title} style={{ margin: "28px 0" }}>
            <h2 style={{ fontSize: 21, letterSpacing: "-.05em", color: "var(--foreground, #171a24)" }}>{s.title}</h2>
            <div style={{ fontSize: 14, lineHeight: 1.85, color: "#687080" }}>{s.body}</div>
          </section>
        ))}
      </div>
    </PublicPage>
  );
}

