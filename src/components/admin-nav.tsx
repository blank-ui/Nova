"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, FolderKanban, Users } from "lucide-react";
import { NovaLogo, NovaMascotAvatar } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";

export function AdminNav({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();

  const isOverview = pathname === "/admin";
  const isInquiries = pathname?.startsWith("/admin/inquiry");
  const isSecurity = pathname === "/admin/security";
  const isPortal = pathname?.startsWith("/portal");

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
            href="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              flexShrink: 0,
            }}
            aria-label="Nova admin dashboard"
          >
            <NovaLogo size={24} markColor="#6C4CFF" dotColor="#FFB547" textColor="var(--ink)" withTagline={false} />
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
            <Link
              className={`nav-link ${isOverview ? "nav-link-active" : ""}`}
              href="/admin"
              style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, padding: "6px 0" }}
            >
              Overview
            </Link>
            <Link
              className={`nav-link ${isInquiries ? "nav-link-active" : ""}`}
              href="/admin/inquiry"
              style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, padding: "6px 0" }}
            >
              <Users size={15} /> Inquiries (CRM)
            </Link>
            <Link
              className={`nav-link ${isSecurity ? "nav-link-active" : ""}`}
              href="/admin/security"
              style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, padding: "6px 0" }}
            >
              <Shield size={15} /> Security & MFA
            </Link>
            <Link
              className={`nav-link ${isPortal ? "nav-link-active" : ""}`}
              href="/portal"
              style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, padding: "6px 0" }}
            >
              <FolderKanban size={15} /> Client Portal
            </Link>
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ThemeToggle />
          <Link
            href="/admin/security"
            style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
            title="Administrator profile & security settings"
          >
            <NovaMascotAvatar size={28} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span className="eyebrow" style={{ textTransform: "none", color: "var(--ink)", fontWeight: 700, fontSize: 12 }}>
                Admin Console
              </span>
              <span style={{ fontSize: 11, color: "var(--muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {adminEmail}
              </span>
            </div>
          </Link>
          <Link
            href="/admin/security"
            className="button button-outline"
            style={{ padding: "8px 14px", fontSize: 12, borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 6 }}
            title="Profile & Security Settings"
          >
            <Shield size={13} /> Settings
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
