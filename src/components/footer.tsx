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
        background: "#0c0e1a",
        color: "#f6f4ee",
        padding: "clamp(40px, 6vw, 72px) 0 32px",
        marginTop: "clamp(48px, 8vw, 90px)",
        borderTop: "1px solid rgba(108, 76, 255, 0.2)",
      }}
    >
      <div className="shell">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: "clamp(28px, 4vw, 40px)",
            paddingBottom: 54,
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
                textColor="#f6f4ee"
                withTagline={true}
                taglineColor="#9ba3b5"
              />
            </Link>
            <p style={{ color: "#a6adbd", fontSize: 13, lineHeight: 1.7, marginTop: 18 }}>
              {t("footer.tagline", "Independent digital product and design studio. Operated on behalf of All Sky Fares LLC.")}
            </p>
            <p style={{ color: "#7e8799", fontSize: 12, lineHeight: 1.6, marginTop: 8 }}>
              Direct inquiries: <a href="mailto:nova@allskyfares.com" style={{ color: "var(--cyan)", textDecoration: "underline" }}>nova@allskyfares.com</a>
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, padding: "3px 10px", borderRadius: 99, background: "rgba(16, 185, 129, 0.12)", color: "#10b981", fontSize: 11, fontWeight: 600 }}>
              <span className="radar-dot" style={{ width: 6, height: 6 }} />
              Production Systems Operational
            </div>
          </div>

          {/* Column 2: Capabilities & Services */}
          <div>
            <div className="eyebrow" style={{ color: "#8b92a4", marginBottom: 18 }}>
              {t("services.eyebrow", "Capabilities")}
            </div>
            <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
              <Link href="/services" style={{ color: "#d0d4e0", transition: "color 0.15s" }}>
                {t("services.web_apps", "Custom Web Applications")}
              </Link>
              <Link href="/services" style={{ color: "#d0d4e0", transition: "color 0.15s" }}>
                {t("services.design", "UI/UX & Design Systems")}
              </Link>
              <Link href="/services" style={{ color: "#d0d4e0", transition: "color 0.15s" }}>
                {t("services.crm", "Client Portals & CRM Dashboards")}
              </Link>
              <Link href="/services" style={{ color: "#d0d4e0", transition: "color 0.15s" }}>
                API Integrations & Automation
              </Link>
            </div>
          </div>

          {/* Column 3: Studio & Workspaces */}
          <div>
            <div className="eyebrow" style={{ color: "#8b92a4", marginBottom: 18 }}>
              {t("nav.about", "Studio")} & {t("nav.portal", "Portals")}
            </div>
            <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
              <Link href="/about" style={{ color: "#d0d4e0" }}>
                {t("nav.about", "Studio")}
              </Link>
              <Link href="/portfolio" style={{ color: "#d0d4e0" }}>
                {t("nav.portfolio", "Selected Work & Gallery")}
              </Link>
              <Link href="/process" style={{ color: "#d0d4e0" }}>
                {t("nav.process", "Our 4-Step Process")}
              </Link>
              <Link href="/faq" style={{ color: "#d0d4e0" }}>
                {t("nav.faq", "Frequently Asked Questions")}
              </Link>
              <Link href="/portal" style={{ color: "#67E8F9", fontWeight: 600 }}>
                {t("nav.portal", "Client Portal")} &rarr;
              </Link>
            </div>
          </div>

          {/* Column 4: Contact & Channels */}
          <div>
            <div className="eyebrow" style={{ color: "#8b92a4", marginBottom: 18 }}>
              {t("contact.eyebrow", "Connect")}
            </div>
            <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
              <Link href="/contact" style={{ color: "#d0d4e0" }}>
                {t("hero.start_project", "Start a Project")} <ArrowUpRight size={12} style={{ display: "inline" }} />
              </Link>
              <a href="mailto:nova@allskyfares.com" style={{ color: "#d0d4e0" }}>
                nova@allskyfares.com
              </a>
              <a
                href="https://discord.com/users/superr_nova_"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#5865F2" }}
              >
                Discord (@superr_nova_) <ArrowUpRight size={12} style={{ display: "inline" }} />
              </a>
              <a
                href="https://github.com/blank-ui/Nova"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#d0d4e0" }}
              >
                GitHub Repository <ArrowUpRight size={12} style={{ display: "inline" }} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div
          style={{
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            color: "#7e8799",
            fontSize: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span>© {currentYear} All Sky Fares LLC. {t("footer.rights", "All rights reserved.")}</span>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link href="/privacy" style={{ color: "#9ba3b5" }}>{t("footer.privacy", "Privacy")}</Link>
            <Link href="/terms" style={{ color: "#9ba3b5" }}>{t("footer.terms", "Terms")}</Link>
            <Link href="/cookies" style={{ color: "#9ba3b5" }}>{t("footer.cookies", "Cookies")}</Link>
            <Link href="/refund-policy" style={{ color: "#9ba3b5" }}>{t("footer.refunds", "Refunds")}</Link>
            <Link href="/support-policy" style={{ color: "#9ba3b5" }}>{t("footer.support", "Support")}</Link>
            <Link href="/accessibility" style={{ color: "#9ba3b5" }}>{t("footer.accessibility", "Accessibility")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

