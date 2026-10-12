"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Receipt, Shield, FolderKanban, TrendingUp } from "lucide-react";
import { NovaLogo, NovaMascotAvatar } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";

export function FinanceNav({ userName, userEmail, userRole }: { userName: string; userEmail: string; userRole: string }) {
  const pathname = usePathname();
  const firstName = userName ? userName.trim().split(/\s+/)[0] : "Finance";

  return (
    <header
      style={{
        height: 76,
        borderBottom: "1px solid var(--line)",
        background: "var(--nav-bg, rgba(246,244,238,.88))",
        backdropFilter: "blur(14px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        className="shell"
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div className="no-scrollbar" style={{ display: "flex", alignItems: "center", gap: 24, overflowX: "auto" }}>
          <Link href="/finance" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
            <NovaLogo size={24} markColor="#f59e0b" dotColor="#FFB547" textColor="var(--ink)" withTagline={false} />
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
            <Link
              className={`nav-link ${pathname === "/finance" ? "nav-link-active" : ""}`}
              href="/finance"
              style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, padding: "6px 0" }}
            >
              <TrendingUp size={15} /> Financial Overview
            </Link>
            <Link
              className={`nav-link ${pathname === "/finance/invoices" ? "nav-link-active" : ""}`}
              href="/finance/invoices"
              style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, padding: "6px 0" }}
            >
              <Receipt size={15} /> Invoices & Billing
            </Link>
            <Link
              className={`nav-link ${pathname?.startsWith("/portal/projects") ? "nav-link-active" : ""}`}
              href="/portal/projects"
              style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, padding: "6px 0" }}
            >
              <FolderKanban size={15} /> Client Workspaces
            </Link>
            {userRole === "ADMIN" && (
              <Link
                className="nav-link"
                href="/admin"
                style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "var(--blue)", padding: "6px 0" }}
              >
                &rarr; Admin Console
              </Link>
            )}
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          <Link
            href="/portal/security"
            style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
            title="Profile & security settings"
          >
            <NovaMascotAvatar size={28} />
            <div className="fin-user-details" style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span className="eyebrow" style={{ textTransform: "none", color: "var(--ink)", fontWeight: 700, fontSize: 13 }}>
                {firstName} <span style={{ color: "#d97706", fontSize: 10, background: "rgba(245,158,11,0.12)", padding: "1px 6px", borderRadius: 4 }}>FIN</span>
              </span>
              <span style={{ fontSize: 11, color: "var(--muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userEmail}
              </span>
            </div>
          </Link>
          <Link
            href="/portal/security"
            className="fin-settings-btn button button-outline"
            style={{ padding: "8px 14px", fontSize: 12, borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Shield size={13} /> Settings
          </Link>
          <LogoutButton />
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .fin-user-details {
            display: none !important;
          }
          .fin-settings-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
