"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, FolderKanban } from "lucide-react";
import { NovaLogo, NovaMascotAvatar } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";

export function PortalNav({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();

  const isOverview = pathname === "/portal";
  const isProjects = pathname?.startsWith("/portal/projects");
  const isSecurity = pathname === "/portal/security";

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
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              flexShrink: 0,
            }}
            aria-label="Nova home"
          >
            <NovaLogo size={24} markColor="#6C4CFF" dotColor="#FFB547" textColor="var(--ink)" withTagline={false} />
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
            {userRole === "ADMIN" && (
              <Link
                className="nav-link"
                href="/admin"
                style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--blue)", padding: "6px 0" }}
              >
                &larr; Admin Workspace
              </Link>
            )}
            {userRole === "DEVELOPER" && (
              <Link
                className="nav-link"
                href="/developer"
                style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#10b981", padding: "6px 0" }}
              >
                &larr; Dev Workspace
              </Link>
            )}
            {userRole === "FINANCE" && (
              <Link
                className="nav-link"
                href="/finance"
                style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#f59e0b", padding: "6px 0" }}
              >
                &larr; Finance Workspace
              </Link>
            )}
            <Link
              className={`nav-link ${isOverview ? "nav-link-active" : ""}`}
              href="/portal"
              style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, padding: "6px 0" }}
            >
              Overview
            </Link>
            <Link
              className={`nav-link ${isProjects ? "nav-link-active" : ""}`}
              href="/portal/projects"
              style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, padding: "6px 0" }}
            >
              <FolderKanban size={15} /> Projects
            </Link>
            <Link
              className={`nav-link ${isSecurity ? "nav-link-active" : ""}`}
              href="/portal/security"
              style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, padding: "6px 0" }}
            >
              <Shield size={15} /> Profile & Security
            </Link>
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          <Link
            href="/portal/security"
            style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
            title="Manage profile & security settings"
          >
            <NovaMascotAvatar size={28} />
            <span className="portal-user-name eyebrow" style={{ textTransform: "none", color: "var(--ink)", fontWeight: 600 }}>
              {userName} <span style={{ color: "var(--muted)", fontWeight: 400 }}>({userRole})</span>
            </span>
          </Link>
          <Link
            href="/portal/security"
            className="portal-settings-btn button button-outline"
            style={{ padding: "8px 14px", fontSize: 12, borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 6 }}
            title="Profile & Security Settings"
          >
            <Shield size={13} /> Settings
          </Link>
          <LogoutButton />
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .portal-user-name {
            display: none !important;
          }
          .portal-settings-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}

