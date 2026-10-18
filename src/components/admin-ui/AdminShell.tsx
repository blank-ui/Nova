"use client";

import React from "react";
import Link from "next/link";
import { TopBar, TopBarProps } from "./TopBar";
import { LeftRail } from "./LeftRail";

export interface AdminShellProps {
  user: TopBarProps["user"];
  children: React.ReactNode;
}

export function AdminShell({ user, children }: AdminShellProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--page-bg)",
        padding: "12px 16px 20px",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        className="admin-app-shell"
        style={{
          width: "100%",
          minHeight: "calc(100vh - 32px)",
          background: "var(--app-bg)",
          borderRadius: "var(--radius-shell)",
          padding: "24px 32px 28px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
          flex: 1,
          boxSizing: "border-box",
        }}
      >
        {/* Top Bar with Logo, Central Pill Nav, and Right Action Buttons */}
        <TopBar user={user} />

        {/* Body Layout: Left floating rail + Main content */}
        <div
          className="admin-body-layout"
          style={{
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
            marginTop: 8,
            flex: 1,
            width: "100%",
          }}
        >
          {/* Floating Dark Left Rail */}
          <LeftRail />

          {/* Main Page Area */}
          <main style={{ flex: 1, minWidth: 0, width: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1 }}>
              {children}
            </div>

            {/* Workspace Legalities & Compliance Footer */}
            <footer
              style={{
                marginTop: 48,
                paddingTop: 18,
                borderTop: "1px solid var(--border-hairline-light)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                fontSize: 12,
                color: "var(--text-muted-crm)",
              }}
            >
              <div>
                &copy; {currentYear} All Sky Fares LLC &middot; Nova Studio Platform &middot; Production Enterprise Edition
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms of Service</Link>
                <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</Link>
                <Link href="/cookies" style={{ color: "inherit", textDecoration: "none" }}>Cookie Preferences</Link>
                <Link href="/support-policy" style={{ color: "inherit", textDecoration: "none" }}>Support SLA</Link>
                <Link href="/refund-policy" style={{ color: "inherit", textDecoration: "none" }}>Refund Policy</Link>
                <Link href="/accessibility" style={{ color: "inherit", textDecoration: "none" }}>Accessibility</Link>
              </div>
            </footer>
          </main>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-app-shell {
            padding: 16px 14px 20px !important;
            border-radius: 20px !important;
          }
          .admin-body-layout {
            flex-direction: column !important;
          }
          .left-rail-container {
            width: 100% !important;
            flex-direction: row !important;
            justifyContent: center !important;
            border-radius: var(--radius-pill) !important;
            overflow-x: auto !important;
          }
          .topbar-nav-pill-track {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
