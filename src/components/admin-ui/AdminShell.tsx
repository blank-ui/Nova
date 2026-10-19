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
      className="admin-page-wrapper"
      suppressHydrationWarning
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
        suppressHydrationWarning
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
          <LeftRail user={user} />

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
                <Link href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Terms of Service</Link>
                <Link href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</Link>
                <Link href="/cookies" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Cookie Preferences</Link>
                <Link href="/support-policy" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Support SLA</Link>
                <Link href="/refund-policy" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Refund Policy</Link>
                <Link href="/accessibility" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Accessibility</Link>
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
            gap: 16px !important;
          }
          .topbar-header {
            flex-wrap: wrap !important;
          }
          .topbar-nav-pill-track {
            order: 3 !important;
            width: 100% !important;
            display: flex !important;
            justify-content: flex-start !important;
            overflow-x: auto !important;
            padding-bottom: 4px !important;
            margin-top: 4px !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .topbar-nav-pill-track::-webkit-scrollbar {
            display: none !important;
          }
        }
        @media (max-width: 600px) {
          .admin-page-wrapper {
            padding: 6px 6px 84px !important;
          }
          .admin-app-shell {
            padding: 12px 10px 18px !important;
            border-radius: 16px !important;
          }
          .topbar-header {
            padding-bottom: 12px !important;
            gap: 10px !important;
          }
          .topbar-actions {
            gap: 6px !important;
          }
          .topbar-actions > button,
          .topbar-actions > a > div,
          .topbar-actions .avatar-wrapper {
            width: 38px !important;
            height: 38px !important;
          }
        }
      `}</style>
    </div>
  );
}
