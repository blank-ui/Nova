"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Sun, Moon } from "lucide-react";
import { Avatar } from "./Avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";

export interface TopBarProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role?: string;
  };
}

export function TopBar({ user }: TopBarProps) {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith("/portal");
  const isAdmin = user.role === "ADMIN";

  const navLinks = isPortal
    ? [
        { label: "Overview", href: "/portal", matchExact: true },
        { label: "Projects", href: "/portal/projects", matchExact: false },
        { label: "Appointments", href: "/portal/appointments", matchExact: false },
        { label: "Profile & Security", href: "/portal/security", matchExact: false },
        ...(isAdmin ? [{ label: "Admin Space", href: "/admin", matchExact: false }] : []),
      ]
    : [
        { label: "Overview", href: "/admin", matchExact: true },
        { label: "Inquiries", href: "/admin/inquiry", matchExact: false },
        { label: "Appointments", href: "/admin/appointments", matchExact: false },
        { label: "Users & Accounts", href: "/admin/users", matchExact: false },
        { label: "GitHub & Gallery", href: "/admin/showcase", matchExact: false },
        { label: "Security", href: "/admin/security", matchExact: false },
        { label: "Client Portal", href: "/portal", matchExact: false },
      ];

  const profileHref = isPortal ? "/portal/security" : "/admin/security";

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        paddingBottom: 24,
      }}
    >
      {/* Left: Nova Logo */}
      <Link
        href={isPortal ? "/portal" : "/admin"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          color: "var(--text-primary)",
        }}
        aria-label="Nova Platform Home"
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--ink-crm)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
          </svg>
        </div>
        <span
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--text-primary)",
          }}
        >
          nova
        </span>
      </Link>

      {/* Center: Pill Navigation */}
      <nav
        aria-label="Platform Sections"
        className="topbar-nav-pill-track no-scrollbar"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: 4,
          borderRadius: "var(--radius-pill)",
          background: "transparent",
          overflowX: "auto",
          maxWidth: "100%",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {navLinks.map((item) => {
          const isActive = item.matchExact
            ? pathname === item.href
            : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-pill)",
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                textDecoration: "none",
                background: isActive ? "var(--ink-crm)" : "transparent",
                color: isActive ? "var(--ink-crm-text, #FFFFFF)" : "var(--text-secondary)",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right: Circular 44px Buttons & Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <ThemeToggle />
        </div>

        <button
          type="button"
          aria-label="View notifications"
          title="Notifications"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "1px solid var(--border-hairline)",
            background: "var(--surface-raised)",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s ease",
            padding: 0,
          }}
        >
          <Bell size={18} strokeWidth={1.8} />
        </button>

        <LogoutButton />

        <Link href={profileHref} aria-label="User profile & security">
          <Avatar
            src={user.image}
            name={user.name || user.email}
            size="md"
            userId={user.id}
          />
        </Link>
      </div>
    </header>
  );
}
