"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { NovaLogo } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Selected work" },
  { href: "/about", label: "Studio" },
  { href: "/process", label: "Process" },
  { href: "/faq", label: "FAQ" },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      style={{
        height: 76,
        borderBottom: "1px solid var(--line)",
        background: "var(--nav-bg, rgba(246,244,238,.88))",
        backdropFilter: "blur(14px)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        className="shell"
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
          aria-label="Nova home"
        >
          <NovaLogo size={26} markColor="#6C4CFF" dotColor="#FFB547" textColor="var(--ink)" withTagline={false} />
        </Link>

        {/* Desktop navigation */}
        <nav
          style={{ display: "flex", alignItems: "center", gap: 28 }}
          className="desktop-nav"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                href={link.href}
                style={{
                  padding: "6px 0",
                  transition: "color 0.15s ease",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Navigation actions */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <ThemeToggle />
          <Link
            className={`nav-link desktop-nav ${pathname === "/login" ? "nav-link-active" : ""}`}
            href="/login"
          >
            Sign in
          </Link>
          <Link
            className="button talk-button"
            href="/contact"
            style={{ padding: "10px 16px", fontSize: 13 }}
          >
            <span>Let&apos;s talk</span>
            <ArrowUpRight size={14} />
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-toggle"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            style={{
              background: "transparent",
              border: "1px solid var(--line)",
              borderRadius: 10,
              padding: "7px 9px",
              cursor: "pointer",
              color: "var(--ink)",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="mobile-drawer animate-fade-in-up"
          style={{
            position: "absolute",
            top: 76,
            left: 0,
            right: 0,
            background: "var(--card-bg)",
            borderBottom: "1px solid var(--line)",
            boxShadow: "var(--glass-shadow)",
            padding: "20px 24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            zIndex: 39,
          }}
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: 16,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--blue)" : "var(--ink)",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--line)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{link.label}</span>
                {isActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--blue)" }} />}
              </Link>
            );
          })}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            style={{
              fontSize: 16,
              fontWeight: pathname === "/login" ? 700 : 500,
              color: pathname === "/login" ? "var(--blue)" : "var(--ink)",
              padding: "10px 0",
              borderBottom: "1px solid var(--line)",
            }}
          >
            Sign in
          </Link>
          <div style={{ paddingTop: 8 }}>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="button"
              style={{ width: "100%", padding: "12px 18px", fontSize: 14, borderRadius: 12 }}
            >
              Start a project <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:820px){
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: inline-flex !important; }
        }
        @media(max-width:480px){
          .talk-button { display: none !important; }
        }
      `}</style>
    </header>
  );
}
