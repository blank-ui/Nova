"use client";

import React, { useState } from "react";
import { CheckCircle2, Shield, Zap, Sparkles, FolderGit2, ArrowUpRight, BarChart3, Terminal } from "lucide-react";
import { NovaMascotAvatar } from "@/components/brand";

export function HeroProductPreview() {
  const [activeTab, setActiveTab] = useState<"website" | "portal" | "crm">("website");

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Top Interactive Switcher Pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 6px",
          borderRadius: 999,
          background: "var(--pub-surface)",
          border: "1px solid var(--pub-line)",
          boxShadow: "var(--pub-shadow-sm)",
          marginBottom: 16,
        }}
        role="tablist"
        aria-label="Product previews"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "website"}
          onClick={() => setActiveTab("website")}
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: activeTab === "website" ? 700 : 500,
            border: "none",
            cursor: "pointer",
            background: activeTab === "website" ? "var(--pub-ink)" : "transparent",
            color: activeTab === "website" ? "var(--pub-bg)" : "var(--pub-muted)",
            transition: "all 0.2s ease",
          }}
        >
          Studio Website
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "portal"}
          onClick={() => setActiveTab("portal")}
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: activeTab === "portal" ? 700 : 500,
            border: "none",
            cursor: "pointer",
            background: activeTab === "portal" ? "var(--pub-ink)" : "transparent",
            color: activeTab === "portal" ? "var(--pub-bg)" : "var(--pub-muted)",
            transition: "all 0.2s ease",
          }}
        >
          Client Portal
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "crm"}
          onClick={() => setActiveTab("crm")}
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: activeTab === "crm" ? 700 : 500,
            border: "none",
            cursor: "pointer",
            background: activeTab === "crm" ? "var(--pub-ink)" : "transparent",
            color: activeTab === "crm" ? "var(--pub-bg)" : "var(--pub-muted)",
            transition: "all 0.2s ease",
          }}
        >
          Operational CRM
        </button>
      </div>

      {/* Realistic Browser Mockup Frame */}
      <div className="nova-browser-frame">
        {/* Browser Chrome Header */}
        <div className="nova-browser-topbar">
          <div className="nova-traffic-lights">
            <span className="nova-traffic-dot nova-traffic-red" />
            <span className="nova-traffic-dot nova-traffic-yellow" />
            <span className="nova-traffic-dot nova-traffic-green" />
          </div>

          <div className="nova-browser-address">
            <span style={{ color: "#10B981", marginRight: 6 }}>🔒</span>
            <span>
              {activeTab === "website" && "https://nova.allskyfares.com"}
              {activeTab === "portal" && "https://nova.allskyfares.com/portal/sprint-3"}
              {activeTab === "crm" && "https://nova.allskyfares.com/admin/telemetry"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="nova-pill-tag nova-pill-lime" style={{ padding: "2px 8px", fontSize: 10 }}>
              Live 60 FPS
            </span>
          </div>
        </div>

        {/* Tab 1: Studio Website Preview */}
        {activeTab === "website" && (
          <div style={{ padding: "clamp(20px, 3.5vw, 32px)", background: "var(--pub-bg)", minHeight: 320 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 16 }}>
              {/* Card 1 */}
              <div
                style={{
                  background: "var(--pub-surface)",
                  borderRadius: 14,
                  padding: 20,
                  border: "1px solid var(--pub-line)",
                  boxShadow: "var(--pub-shadow-sm)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="eyebrow" style={{ color: "var(--pub-violet)" }}>01 · Velocity</span>
                  <Zap size={16} style={{ color: "#FFB547" }} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--pub-ink)", letterSpacing: "-0.04em" }}>
                  14-Day Delivery
                </div>
                <p style={{ fontSize: 13, color: "var(--pub-muted)", margin: "8px 0 0", lineHeight: 1.6 }}>
                  From scoping and high-fidelity prototype to production deployment with full QA.
                </p>
              </div>

              {/* Card 2 */}
              <div
                style={{
                  background: "var(--pub-surface)",
                  borderRadius: 14,
                  padding: 20,
                  border: "1px solid var(--pub-line)",
                  boxShadow: "var(--pub-shadow-sm)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="eyebrow" style={{ color: "#10B981" }}>02 · Core Web Vitals</span>
                  <CheckCircle2 size={16} style={{ color: "#10B981" }} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--pub-ink)", letterSpacing: "-0.04em" }}>
                  100 / 100 Score
                </div>
                <p style={{ fontSize: 13, color: "var(--pub-muted)", margin: "8px 0 0", lineHeight: 1.6 }}>
                  Sub-50ms TTFB edge caching, zero CLS shift, and priority LCP image pipelines.
                </p>
              </div>

              {/* Card 3 */}
              <div
                style={{
                  background: "var(--pub-surface)",
                  borderRadius: 14,
                  padding: 20,
                  border: "1px solid var(--pub-line)",
                  boxShadow: "var(--pub-shadow-sm)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="eyebrow" style={{ color: "var(--pub-cyan)" }}>03 · Security</span>
                  <Shield size={16} style={{ color: "var(--pub-violet)" }} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--pub-ink)", letterSpacing: "-0.04em" }}>
                  Zero-Trust 2FA
                </div>
                <p style={{ fontSize: 13, color: "var(--pub-muted)", margin: "8px 0 0", lineHeight: 1.6 }}>
                  TOTP authenticator app verification, signed sessions, and rate-limited endpoints.
                </p>
              </div>
            </div>

            {/* Code Snippet Row */}
            <div
              style={{
                marginTop: 18,
                padding: "12px 18px",
                borderRadius: 10,
                background: "#0A0C13",
                color: "#A8FF7D",
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Terminal size={14} style={{ color: "#FFB547" }} />
                <span>$ git clone https://github.com/blank-ui/Nova.git &amp;&amp; npm run dev</span>
              </div>
              <span style={{ color: "#8E98AC", fontSize: 11 }}>Next.js 15 · React 19 · Prisma</span>
            </div>
          </div>
        )}

        {/* Tab 2: Client Portal Preview */}
        {activeTab === "portal" && (
          <div style={{ padding: "clamp(20px, 3.5vw, 32px)", background: "var(--pub-bg)", minHeight: 320 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Sprint Milestones */}
              <div
                style={{
                  background: "var(--pub-surface)",
                  borderRadius: 14,
                  padding: 20,
                  border: "1px solid var(--pub-line)",
                }}
              >
                <div className="eyebrow" style={{ color: "var(--pub-violet)", marginBottom: 10 }}>
                  Sprint 3 Status · 85% Complete
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--pub-ink)" }}>
                    <CheckCircle2 size={16} style={{ color: "#10B981" }} />
                    <span>Design System &amp; Figma Tokens</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--pub-ink)" }}>
                    <CheckCircle2 size={16} style={{ color: "#10B981" }} />
                    <span>Database Schema &amp; Prisma Migrations</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--pub-ink)" }}>
                    <CheckCircle2 size={16} style={{ color: "#10B981" }} />
                    <span>Custom Client Portal &amp; Messaging</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--pub-muted)" }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--pub-line)" }} />
                    <span>Final Production Staging &amp; Domain SSL</span>
                  </div>
                </div>
              </div>

              {/* Direct Team Communication */}
              <div
                style={{
                  background: "var(--pub-surface)",
                  borderRadius: 14,
                  padding: 20,
                  border: "1px solid var(--pub-line)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div className="eyebrow" style={{ color: "#FFB547", marginBottom: 12 }}>
                    Private Channel
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
                    <NovaMascotAvatar size={28} />
                    <div style={{ background: "var(--pub-bg)", padding: "8px 12px", borderRadius: 10, fontSize: 12 }}>
                      <span style={{ fontWeight: 700, display: "block", marginBottom: 2 }}>Nova Lead Engineer</span>
                      Sprint 3 build is deployed to staging. Core Web Vitals audit scored 100/100!
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--pub-muted)", fontFamily: "'DM Mono', monospace" }}>
                  Encrypted · Discord webhook synced · Role isolated
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Operational CRM Preview */}
        {activeTab === "crm" && (
          <div style={{ padding: "clamp(20px, 3.5vw, 32px)", background: "var(--pub-bg)", minHeight: 320 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 16 }}>
              <div style={{ background: "var(--pub-surface)", padding: 18, borderRadius: 12, border: "1px solid var(--pub-line)" }}>
                <span className="eyebrow" style={{ color: "var(--pub-muted)" }}>Average SLA</span>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--pub-ink)", marginTop: 6 }}>1.8 Hours</div>
                <span style={{ fontSize: 11, color: "#10B981" }}>99.2% on-time resolution</span>
              </div>
              <div style={{ background: "var(--pub-surface)", padding: 18, borderRadius: 12, border: "1px solid var(--pub-line)" }}>
                <span className="eyebrow" style={{ color: "var(--pub-muted)" }}>Inquiries Managed</span>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--pub-ink)", marginTop: 6 }}>100% Verified</div>
                <span style={{ fontSize: 11, color: "var(--pub-violet)" }}>Encrypted client records</span>
              </div>
              <div style={{ background: "var(--pub-surface)", padding: 18, borderRadius: 12, border: "1px solid var(--pub-line)" }}>
                <span className="eyebrow" style={{ color: "var(--pub-muted)" }}>Deployment Uptime</span>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--pub-ink)", marginTop: 6 }}>99.98%</div>
                <span style={{ fontSize: 11, color: "#10B981" }}>Production systems healthy</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
