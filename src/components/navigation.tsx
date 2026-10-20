"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { NovaLogo } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/components/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CurrencySwitcher } from "@/components/currency-switcher";
import { authClient } from "@/lib/auth-client";

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();
  const { data: session } = authClient.useSession();

  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const workspaceHref = userRole === "ADMIN" ? "/admin" : "/portal";
  const workspaceLabel = userRole === "ADMIN" ? "Admin Workspace" : "Client Portal";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/services", label: t("nav.services", "Services") },
    { href: "/portfolio", label: t("nav.portfolio", "Selected work") },
    { href: "/about", label: t("nav.about", "Studio") },
    { href: "/process", label: t("nav.process", "Process") },
    { href: "/faq", label: t("nav.faq", "FAQ") },
  ];

  return (
    <header
      style={{
        height: 72,
        borderBottom: scrolled ? "1px solid var(--pub-line, rgba(14, 17, 24, 0.08))" : "1px solid transparent",
        background: scrolled
          ? "var(--pub-surface, rgba(248, 247, 243, 0.88))"
          : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
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
          <NovaLogo size={26} markColor="#6C4CFF" dotColor="#FFB547" textColor="var(--pub-ink, var(--ink))" withTagline={false} />
        </Link>

        {/* Desktop navigation */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            padding: "6px 14px",
            borderRadius: 999,
            background: "var(--pub-surface, var(--card-bg))",
            border: "1px solid var(--pub-line, var(--line))",
            boxShadow: "var(--pub-shadow-sm, 0 2px 8px rgba(0,0,0,0.03))",
          }}
          className="desktop-nav"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                className="nav-link"
                href={link.href}
                style={{
                  padding: "5px 10px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--pub-violet, #6C4CFF)" : "var(--pub-muted, var(--muted))",
                  background: isActive ? "var(--pub-violet-soft, rgba(108,76,255,0.08))" : "transparent",
                  transition: "all 0.18s ease",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Navigation actions */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <CurrencySwitcher compact className="nav-currency-switcher" />
          <LanguageSwitcher compact className="nav-lang-switcher" />
          <ThemeToggle />
          {session?.user ? (
            <Link
              className="nova-btn-secondary desktop-nav"
              href={workspaceHref}
              style={{ padding: "8px 14px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 99 }}
            >
              <span>{workspaceLabel}</span>
              <ArrowUpRight size={13} className="nova-arrow-icon" />
            </Link>
          ) : (
            <Link
              className={`nav-link desktop-nav ${pathname === "/login" ? "nav-link-active" : ""}`}
              href="/login"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--pub-ink, var(--ink))",
                padding: "8px 12px",
              }}
            >
              {t("nav.sign_in", "Sign in")}
            </Link>
          )}
          <Link
            className="nova-btn-primary talk-button"
            href="/contact"
            style={{ padding: "9px 18px", fontSize: 13 }}
          >
            <span>{t("nav.contact", "Let's talk")}</span>
            <ArrowUpRight size={14} className="nova-arrow-icon" />
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-toggle"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            style={{
              background: "var(--pub-surface, var(--card-bg))",
              border: "1px solid var(--pub-line, var(--line))",
              borderRadius: 12,
              width: 42,
              height: 42,
              minWidth: 42,
              minHeight: 42,
              padding: 0,
              cursor: "pointer",
              color: "var(--pub-ink, var(--ink))",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s ease, border-color 0.2s ease",
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
            top: 72,
            left: 0,
            right: 0,
            background: "var(--pub-surface, var(--card-bg))",
            borderBottom: "1px solid var(--pub-line, var(--line))",
            boxShadow: "var(--pub-shadow-lg, 0 20px 50px rgba(0,0,0,0.1))",
            padding: "20px 24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            zIndex: 49,
          }}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: 16,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--pub-violet, #6C4CFF)" : "var(--pub-ink, var(--ink))",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--pub-line, var(--line))",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{link.label}</span>
                {isActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--pub-violet, #6C4CFF)" }} />}
              </Link>
            );
          })}
          {session?.user ? (
            <Link
              href={workspaceHref}
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--pub-violet, #6C4CFF)",
                padding: "10px 0",
                borderBottom: "1px solid var(--pub-line, var(--line))",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{workspaceLabel}</span>
              <ArrowUpRight size={16} />
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: 16,
                fontWeight: pathname === "/login" ? 700 : 500,
                color: pathname === "/login" ? "var(--pub-violet, #6C4CFF)" : "var(--pub-ink, var(--ink))",
                padding: "10px 0",
                borderBottom: "1px solid var(--pub-line, var(--line))",
              }}
            >
              {t("nav.sign_in", "Sign in")}
            </Link>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--pub-line, var(--line))" }}>
            <span style={{ fontSize: 14, color: "var(--pub-muted, var(--muted))" }}>Currency / मुद्रा</span>
            <CurrencySwitcher />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--pub-line, var(--line))" }}>
            <span style={{ fontSize: 14, color: "var(--pub-muted, var(--muted))" }}>Language / भाषा</span>
            <LanguageSwitcher />
          </div>

          <div style={{ paddingTop: 8 }}>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="nova-btn-primary"
              style={{ width: "100%", padding: "12px 18px", fontSize: 14, borderRadius: 12 }}
            >
              {t("hero.start_project", "Start a project")} <ArrowUpRight size={15} className="nova-arrow-icon" />
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:820px){
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: inline-flex !important; }
        }
        @media(max-width:640px){
          .nav-lang-switcher { display: none !important; }
        }
        @media(max-width:480px){
          .talk-button { display: none !important; }
        }
      `}</style>
    </header>
  );
}
