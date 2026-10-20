"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NovaLogo } from "@/components/brand";
import { useLanguage } from "@/components/language-provider";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer
      style={{
        background: "#080A10",
        color: "#F7F6F2",
        padding: "clamp(56px, 7vw, 96px) 0 36px",
        marginTop: "clamp(64px, 10vw, 120px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient background glow orb */}
      <div
        style={{
          position: "absolute",
          top: -100,
          right: "10%",
          width: 480,
          height: 300,
          background: "radial-gradient(ellipse at center, rgba(108, 76, 255, 0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div className="shell" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: "clamp(32px, 5vw, 48px)",
            paddingBottom: 60,
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Column 1: Brand & Operating Entity */}
          <div style={{ maxWidth: 360 }}>
            <Link href="/" style={{ display: "inline-block" }} aria-label="Nova home">
              <NovaLogo
                size={28}
                markColor="#6C4CFF"
                dotColor="#FFB547"
                textColor="#F7F6F2"
                withTagline={true}
                taglineColor="#8E98AC"
              />
            </Link>
            <p style={{ color: "#9CA5B8", fontSize: 13, lineHeight: 1.75, marginTop: 20 }}>
              {t("footer.tagline", "Independent digital product and web development studio. Operated on behalf of All Sky Fares LLC.")}
            </p>
            <p style={{ color: "#7A8498", fontSize: 12, lineHeight: 1.6, marginTop: 10 }}>
              Direct inquiries:{" "}
              <a href="mailto:nova@allskyfares.com" style={{ color: "#4EE4F5", textDecoration: "underline", textUnderlineOffset: 3 }}>
                nova@allskyfares.com
              </a>
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 18,
                padding: "5px 12px",
                borderRadius: 999,
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                color: "#34D399",
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              <span className="nova-status-dot" style={{ width: 6, height: 6, background: "#10B981" }} />
              Production Systems Operational
            </div>
          </div>

          {/* Column 2: Capabilities & Services */}
          <div>
            <div className="eyebrow" style={{ color: "#8E98AC", marginBottom: 20, letterSpacing: "0.12em" }}>
              {t("services.eyebrow", "Capabilities")}
            </div>
            <div style={{ display: "grid", gap: 12, fontSize: 13 }}>
              <Link href="/services" style={{ color: "#CBD3E1", transition: "color 0.15s" }}>
                {t("services.web_apps", "Custom Web Applications")}
              </Link>
              <Link href="/services" style={{ color: "#CBD3E1", transition: "color 0.15s" }}>
                {t("services.design", "UI/UX & Design Systems")}
              </Link>
              <Link href="/services" style={{ color: "#CBD3E1", transition: "color 0.15s" }}>
                {t("services.crm", "Client Portals & CRM Dashboards")}
              </Link>
              <Link href="/services" style={{ color: "#CBD3E1", transition: "color 0.15s" }}>
                API Integrations & Cloud Automation
              </Link>
            </div>
          </div>

          {/* Column 3: Studio & Workspaces */}
          <div>
            <div className="eyebrow" style={{ color: "#8E98AC", marginBottom: 20, letterSpacing: "0.12em" }}>
              {t("nav.about", "Studio")} & {t("nav.portal", "Portals")}
            </div>
            <div style={{ display: "grid", gap: 12, fontSize: 13 }}>
              <Link href="/about" style={{ color: "#CBD3E1" }}>
                {t("nav.about", "Studio")}
              </Link>
              <Link href="/portfolio" style={{ color: "#CBD3E1" }}>
                {t("nav.portfolio", "Selected Work & Gallery")}
              </Link>
              <Link href="/process" style={{ color: "#CBD3E1" }}>
                {t("nav.process", "Our 4-Step Process")}
              </Link>
              <Link href="/faq" style={{ color: "#CBD3E1" }}>
                {t("nav.faq", "Frequently Asked Questions")}
              </Link>
              <Link href="/portal" style={{ color: "#4EE4F5", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span>{t("nav.portal", "Client Portal")}</span> &rarr;
              </Link>
            </div>
          </div>

          {/* Column 4: Contact & Channels */}
          <div>
            <div className="eyebrow" style={{ color: "#8E98AC", marginBottom: 20, letterSpacing: "0.12em" }}>
              {t("contact.eyebrow", "Connect")}
            </div>
            <div style={{ display: "grid", gap: 12, fontSize: 13 }}>
              <Link href="/contact" style={{ color: "#CBD3E1", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span>{t("hero.start_project", "Start a Project")}</span>
                <ArrowUpRight size={13} />
              </Link>
              <a href="mailto:nova@allskyfares.com" style={{ color: "#CBD3E1" }}>
                nova@allskyfares.com
              </a>
              <a
                href="https://discord.com/users/superr_nova_"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#7289DA", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <span>Discord (@superr_nova_)</span>
                <ArrowUpRight size={13} />
              </a>
              <a
                href="https://github.com/blank-ui/Nova"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#CBD3E1", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <span>GitHub Repository</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div
          style={{
            paddingTop: 28,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            color: "#7A8498",
            fontSize: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span>© {currentYear} All Sky Fares LLC. {t("footer.rights", "All rights reserved.")}</span>
          </div>

          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Link href="/privacy" style={{ color: "#9CA5B8" }}>{t("footer.privacy", "Privacy")}</Link>
            <Link href="/terms" style={{ color: "#9CA5B8" }}>{t("footer.terms", "Terms")}</Link>
            <Link href="/cookies" style={{ color: "#9CA5B8" }}>{t("footer.cookies", "Cookies")}</Link>
            <Link href="/refund-policy" style={{ color: "#9CA5B8" }}>{t("footer.refunds", "Refunds")}</Link>
            <Link href="/support-policy" style={{ color: "#9CA5B8" }}>{t("footer.support", "Support")}</Link>
            <Link href="/accessibility" style={{ color: "#9CA5B8" }}>{t("footer.accessibility", "Accessibility")}</Link>
          </div>
        </div>

        {/* Legal Disclaimers & Fair Use Notices */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 18,
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            fontSize: 11,
            color: "#636C80",
            lineHeight: 1.65,
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>Trademark &amp; Non-Endorsement Notice:</strong> All product names, logos, brands, trademarks, and registered trademarks mentioned on this website (including Next.js, React, TypeScript, Tailwind CSS, Prisma, MySQL, Better Auth, Hostinger, GitHub, Discord, Google, Stripe, Razorpay, and Figma) are the property of their respective owners. Their mention is strictly for technical identification, compatibility, and descriptive purposes only and does not imply any official endorsement, affiliation, or sponsorship.
          </p>
          <p style={{ margin: "6px 0 0" }}>
            <strong>Operating Structure:</strong> Nova is the independent digital product and software engineering studio wing operated on behalf of All Sky Fares LLC. All client agreements, Statements of Work (SOW), and invoices are legally executed by All Sky Fares LLC.
          </p>
        </div>
      </div>
    </footer>
  );
}
