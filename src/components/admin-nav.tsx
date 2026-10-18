"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, FolderKanban, Users, Image as ImageIcon, MessageSquare } from "lucide-react";
import { NovaLogo, NovaMascotAvatar } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";

export function AdminNav({
  adminEmail,
  adminName,
}: {
  adminEmail: string;
  adminName?: string;
}) {
  const pathname = usePathname();

  const isOverview = pathname === "/admin";
  const isInquiries = pathname?.startsWith("/admin/inquiry");
  const isProjects = pathname?.startsWith("/admin/projects");
  const isUsers = pathname?.startsWith("/admin/users");
  const isSecurity = pathname === "/admin/security";
  const isPortal = pathname?.startsWith("/portal");
  const isShowcase = pathname?.startsWith("/admin/showcase");

  const firstName = adminName ? adminName.trim().split(/\s+/)[0] : "Admin";

  return (
    <header
      style={{
        height: 76,
        borderBottom: "1px solid var(--line)",
        background: "var(--nav-bg, rgba(246,244,238,.92))",
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

          <nav style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
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
              <MessageSquare size={15} /> Inquiries (CRM)
            </Link>
            <Link
              className={`nav-link ${isProjects ? "nav-link-active" : ""}`}
              href="/admin/projects"
              style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, padding: "6px 0" }}
            >
              <FolderKanban size={15} /> Projects
            </Link>
            <Link
              className={`nav-link ${isUsers ? "nav-link-active" : ""}`}
              href="/admin/users"
              style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, padding: "6px 0" }}
            >
              <Users size={15} /> Users & Accounts
            </Link>
            <Link
              className={`nav-link ${isShowcase ? "nav-link-active" : ""}`}
              href="/admin/showcase"
              style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, padding: "6px 0" }}
            >
              <ImageIcon size={15} /> GitHub & Gallery
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

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <ThemeToggle />
          <Link
            href="/admin/security"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              padding: "5px 10px",
              borderRadius: 10,
              border: "1px solid var(--line)",
              background: "var(--paper)",
              transition: "border-color 0.15s ease",
            }}
            title="Administrator profile & security settings"
          >
            <NovaMascotAvatar size={26} />
            <div className="admin-user-details" style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--ink)", fontWeight: 700, fontSize: 13 }}>
                  {firstName}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: ".05em",
                    padding: "1px 5px",
                    borderRadius: 4,
                    background: "rgba(108,76,255,0.12)",
                    color: "#6C4CFF",
                  }}
                >
                  ADMIN
                </span>
              </div>
              <span style={{ fontSize: 11, color: "var(--muted)", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {adminEmail}
              </span>
            </div>
          </Link>
          <LogoutButton />
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .admin-user-details {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
