"use client";

import React from "react";
import { PublicPage } from "@/components/public-page";
import { Info } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export interface LegalSection {
  title: string;
  body: React.ReactNode;
}

const SECTION_KEY_MAP: Record<string, string> = {
  // Terms
  "1. Acceptance of Terms & Operating Entity": "terms.s1",
  "2. Services and Statements of Work (SOW)": "terms.s2",
  "3. Account Security and Client Portal Responsibilities": "terms.s3",
  "4. Client Obligations & Material Approvals": "terms.s4",
  "5. Intellectual Property Rights": "terms.s5",
  "6. Prohibited Uses": "terms.s6",
  "7. Disclaimer of Warranties & Limitation of Liability": "terms.s7",
  "8. Governing Law and Dispute Resolution": "terms.s8",
  "9. Contact Information": "terms.s9",

  // Cookies
  "1. What Are Cookies?": "cookies.s1",
  "2. Our Approach: Strictly Necessary Storage Only": "cookies.s2",
  "3. Cookie Inventory & Technical Specifications": "cookies.s3",
  "4. Legal Basis under EU ePrivacy / UK PECR / DPDPA": "cookies.s4",
  "5. How to Manage Cookies in Your Browser": "cookies.s5",
  "6. Contact Information": "cookies.s6",

  // Privacy
  "1. Operating Entity and Scope": "privacy.s1",
  "2. Information We Collect": "privacy.s2",
  "3. Purposes and Legal Bases for Processing": "privacy.s3",
  "4. No Sale or Cross-Context Sharing of Personal Data": "privacy.s4",
  "5. Data Security Measures": "privacy.s5",
  "5. Data Processors and Service Providers": "privacy.s5",
  "6. Data Retention Policies": "privacy.s6",
  "6. Data Retention and Security": "privacy.s6",
  "7. Your Legal Rights (DPDPA, GDPR, US State Laws)": "privacy.s7",
  "8. Children's Privacy": "privacy.s8",
  "8. Third-Party Service Providers and Sub-Processors": "privacy.s8",
  "8. Third-Party Service Providers & Sub-processors": "privacy.s8",
  "9. Contact, Privacy Inquiries & Grievance Officer": "privacy.s9",

  // Refund
  "1. Scope and Distinction from Travel Services": "refunds.s1",
  "2. Custom Software & Professional Services Framework": "refunds.s2",
  "3. Project Cancellation & Offboarding Procedures": "refunds.s3",
  "4. Satisfaction and Defect Resolution (Warranty)": "refunds.s4",
  "5. Billing Inquiries & Dispute Escalation": "refunds.s5",

  // Support
  "1. Scope and Support Tiers": "support.s1",
  "2. Incident Priority & Target Response Times": "support.s2",
  "3. How to Report a Technical Issue": "support.s3",
  "4. Contact Channels": "support.s4",

  // Accessibility
  "1. Our Commitment": "a11y.s1",
  "2. Technical Standards & Practices": "a11y.s2",
  "3. Known Limitations & Ongoing Enhancements": "a11y.s3",
  "4. Feedback & Accessibility Contact": "a11y.s4",
};

const KIND_KEY_MAP: Record<string, { kindKey: string; titleKey: string; subtitleKey: string }> = {
  "Terms of Service": { kindKey: "legal.terms", titleKey: "legal.terms_title", subtitleKey: "legal.terms_subtitle" },
  "Privacy Policy": { kindKey: "legal.privacy", titleKey: "legal.privacy_title", subtitleKey: "legal.privacy_subtitle" },
  "Cookie Notice": { kindKey: "legal.cookies", titleKey: "legal.cookies_title", subtitleKey: "legal.cookies_subtitle" },
  "Refund & Cancellation Policy": { kindKey: "legal.refunds", titleKey: "legal.refunds_title", subtitleKey: "legal.refunds_subtitle" },
  "Support Policy": { kindKey: "legal.support", titleKey: "legal.support_title", subtitleKey: "legal.support_subtitle" },
  "Accessibility Statement": { kindKey: "legal.accessibility", titleKey: "legal.a11y_title", subtitleKey: "legal.a11y_subtitle" },
};

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
  const { t } = useLanguage();
  const meta = KIND_KEY_MAP[kind];
  const translatedKind = meta ? t(meta.kindKey, kind) : kind;
  const translatedTitle = meta ? t(meta.titleKey, title) : title;
  const translatedSubtitle = meta ? t(meta.subtitleKey, subtitle) : subtitle;

  return (
    <PublicPage eyebrow={`Nova · ${translatedKind}`} title={translatedTitle} subtitle={translatedSubtitle}>
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        <p className="eyebrow" style={{ color: "var(--muted)" }}>
          {t("legal.last_updated", "Operated by All Sky Fares LLC · Last updated: October 2026")}
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
            <strong>{t("legal.notice_label", "Notice:")}</strong>{" "}
            {t(
              "legal.notice_body",
              "Nova is a digital studio and client portal service operated on behalf of All Sky Fares LLC. These terms and policies outline our operational practices, data protection measures, and service standards. Formal engagements are governed by executed client statements of work and applicable law."
            )}
          </div>
        </div>

        <div style={{ display: "grid", gap: 32 }}>
          {sections.map((s) => {
            const mappedKey = SECTION_KEY_MAP[s.title];
            const sectionHeading = mappedKey ? t(mappedKey, s.title) : s.title;

            return (
              <section
                key={s.title}
                className="card"
                style={{
                  padding: "clamp(18px, 4vw, 28px) clamp(16px, 4vw, 32px)",
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
                  {sectionHeading}
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
            );
          })}
        </div>
      </div>
    </PublicPage>
  );
}
