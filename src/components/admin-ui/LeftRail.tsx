"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  MessageSquare,
  Users,
  Plus,
  Image as ImageIcon,
  Folder,
  Shield,
  Send,
  Calendar,
  Home,
  X,
  Terminal,
  GitBranch,
  DollarSign,
  Receipt,
} from "lucide-react";
import { useToast } from "@/components/toast";

export interface LeftRailProps {
  user?: {
    id?: string;
    role?: string;
    email?: string;
    name?: string | null;
  };
}

export function LeftRail({ user }: LeftRailProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  const userRole = user?.role;
  const isFinanceUser = userRole === "FINANCE";
  const isDeveloperUser = userRole === "DEVELOPER";
  const isClientUser = userRole === "CLIENT";

  const isPortal = pathname?.startsWith("/portal");
  const isDeveloper = pathname?.startsWith("/developer");
  const isFinance = pathname?.startsWith("/finance");

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const adminNavItems = [
    {
      id: "search",
      label: "Search & Command",
      isAction: true,
      onClick: () => setSearchOpen(true),
      icon: <Search size={18} strokeWidth={1.8} />,
    },
    {
      id: "overview",
      label: "Admin Overview",
      href: "/admin",
      icon: <Home size={18} strokeWidth={1.8} />,
    },
    {
      id: "inquiry",
      label: "Customer Inquiries (CRM)",
      href: "/admin/inquiry",
      icon: <MessageSquare size={18} strokeWidth={1.8} />,
    },
    {
      id: "projects",
      label: "Client Projects & Workspaces",
      href: "/admin/projects",
      icon: <Folder size={18} strokeWidth={1.8} />,
    },
    {
      id: "quick-create",
      label: "Provision Workspace Project (+)",
      isAction: true,
      onClick: () => {
        if (pathname?.startsWith("/admin/projects") || pathname === "/admin") {
          window.dispatchEvent(new CustomEvent("nova:open-create-project"));
        } else {
          router.push("/admin/projects?create=project");
        }
      },
      icon: <Plus size={18} strokeWidth={1.8} />,
    },
    {
      id: "appointments",
      label: "Appointments & Schedule",
      href: "/admin/appointments",
      icon: <Calendar size={18} strokeWidth={1.8} />,
    },
    {
      id: "users",
      label: "Users & Accounts",
      href: "/admin/users",
      icon: <Users size={18} strokeWidth={1.8} />,
    },
    {
      id: "showcase",
      label: "GitHub & Gallery Showcase",
      href: "/admin/showcase",
      icon: <ImageIcon size={18} strokeWidth={1.8} />,
    },
    {
      id: "security",
      label: "Security & MFA Governance",
      href: "/admin/security",
      icon: <Shield size={18} strokeWidth={1.8} />,
    },
    {
      id: "portal",
      label: "Switch to Client Portal",
      href: "/portal",
      icon: <Send size={18} strokeWidth={1.8} />,
    },
  ];

  const clientNavItems = [
    {
      id: "search",
      label: "Search Workspace",
      isAction: true,
      onClick: () => setSearchOpen(true),
      icon: <Search size={18} strokeWidth={1.8} />,
    },
    {
      id: "overview",
      label: "Client Overview",
      href: "/portal",
      icon: <Home size={18} strokeWidth={1.8} />,
    },
    {
      id: "projects",
      label: "Initiatives & Deliverables",
      href: "/portal/projects",
      icon: <Folder size={18} strokeWidth={1.8} />,
    },
    {
      id: "appointments",
      label: "Schedule Consultation",
      href: "/portal/appointments",
      icon: <Calendar size={18} strokeWidth={1.8} />,
    },
    {
      id: "security",
      label: "Profile & Security",
      href: "/portal/security",
      icon: <Shield size={18} strokeWidth={1.8} />,
    },
  ];

  const developerNavItems = [
    {
      id: "search",
      label: "Search Workspace",
      isAction: true,
      onClick: () => setSearchOpen(true),
      icon: <Search size={18} strokeWidth={1.8} />,
    },
    {
      id: "console",
      label: "Developer Console",
      href: "/developer",
      icon: <Terminal size={18} strokeWidth={1.8} />,
    },
    {
      id: "repos",
      label: "Studio Repositories",
      href: "/developer/repos",
      icon: <GitBranch size={18} strokeWidth={1.8} />,
    },
    {
      id: "projects",
      label: "Client Projects & Tasks",
      href: "/portal/projects",
      icon: <Folder size={18} strokeWidth={1.8} />,
    },
    {
      id: "appointments",
      label: "Appointments & Schedule",
      href: "/portal/appointments",
      icon: <Calendar size={18} strokeWidth={1.8} />,
    },
    {
      id: "security",
      label: "Profile & Security",
      href: "/portal/security",
      icon: <Shield size={18} strokeWidth={1.8} />,
    },
  ];

  const financeNavItems = [
    {
      id: "search",
      label: "Search Finance",
      isAction: true,
      onClick: () => setSearchOpen(true),
      icon: <Search size={18} strokeWidth={1.8} />,
    },
    {
      id: "finance",
      label: "Finance & Operations",
      href: "/finance",
      icon: <DollarSign size={18} strokeWidth={1.8} />,
    },
    {
      id: "invoices",
      label: "Billing & Invoices",
      href: "/finance/invoices",
      icon: <Receipt size={18} strokeWidth={1.8} />,
    },
    {
      id: "projects",
      label: "Client Projects",
      href: "/portal/projects",
      icon: <Folder size={18} strokeWidth={1.8} />,
    },
    {
      id: "appointments",
      label: "Consultations",
      href: "/portal/appointments",
      icon: <Calendar size={18} strokeWidth={1.8} />,
    },
    {
      id: "security",
      label: "Profile & Security",
      href: "/portal/security",
      icon: <Shield size={18} strokeWidth={1.8} />,
    },
  ];

  const navItems = isFinanceUser
    ? financeNavItems
    : isDeveloperUser
    ? developerNavItems
    : isClientUser
    ? clientNavItems
    : isFinance
    ? financeNavItems
    : isDeveloper
    ? developerNavItems
    : isPortal
    ? clientNavItems
    : adminNavItems;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    if (isFinanceUser || isFinance) {
      router.push(`/finance?search=${encodeURIComponent(searchQuery.trim())}`);
    } else if (isDeveloperUser || isDeveloper) {
      router.push(`/portal/projects?search=${encodeURIComponent(searchQuery.trim())}`);
    } else if (isPortal) {
      router.push(`/portal/projects?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/admin/inquiry?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <>
      <aside
        aria-label="Quick Navigation"
        className="left-rail-container"
        style={{
          width: 58,
          background: "var(--left-rail-bg)",
          borderRadius: 999,
          padding: "16px 7px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
          flexShrink: 0,
        }}
      >
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                aria-label={item.label}
                title={item.label}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--left-rail-icon)",
                  background: "transparent",
                  border: "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  padding: 0,
                  flexShrink: 0,
                }}
                className="left-rail-btn"
              >
                {item.icon}
              </button>
            );
          }

          const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/portal" && item.href !== "/developer" && item.href !== "/finance" && pathname?.startsWith(item.href!));

          return (
            <Link
              key={item.id}
              href={item.href!}
              aria-label={item.label}
              title={item.label}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isActive ? "#FFFFFF" : "var(--left-rail-icon)",
                background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                border: isActive ? "1px solid var(--left-rail-btn-border)" : "1px solid transparent",
                transition: "all 0.15s ease",
                textDecoration: "none",
                flexShrink: 0,
              }}
              className="left-rail-btn"
            >
              {item.icon}
            </Link>
          );
        })}
      </aside>

      {/* Search Modal */}
      {searchOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "12vh",
            zIndex: 1000,
          }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface-raised)",
              borderRadius: 24,
              width: "min(560px, calc(100% - 32px))",
              padding: 24,
              boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
              border: "1px solid var(--border-hairline)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700 }}>
                <Search size={16} /> Quick Search &amp; Command
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted-crm)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit}>
              <input
                type="search"
                autoFocus
                placeholder={
                  (isFinanceUser || isFinance)
                    ? "Search billing accounts, valuations, or invoices..."
                    : (isDeveloperUser || isDeveloper)
                    ? "Search tasks, repos, or deliverables..."
                    : isPortal
                    ? "Search project initiatives and deliverables..."
                    : "Search leads, clients, company, or services..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  borderRadius: 16,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--card-bg-crm)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </form>

            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted-crm)", alignSelf: "center" }}>Quick jumps:</span>
              {(isFinanceUser || isFinance) ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); router.push("/finance"); }}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, border: "1px solid var(--border-hairline)", background: "transparent", cursor: "pointer" }}
                  >
                    Revenue Pipeline
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); router.push("/finance/invoices"); }}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, border: "1px solid var(--border-hairline)", background: "transparent", cursor: "pointer" }}
                  >
                    Invoices
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); router.push("/portal/projects"); }}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, border: "1px solid var(--border-hairline)", background: "transparent", cursor: "pointer" }}
                  >
                    Client Projects
                  </button>
                </>
              ) : (isDeveloperUser || isDeveloper) ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); router.push("/developer"); }}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, border: "1px solid var(--border-hairline)", background: "transparent", cursor: "pointer" }}
                  >
                    Sprint Console
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); router.push("/developer/repos"); }}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, border: "1px solid var(--border-hairline)", background: "transparent", cursor: "pointer" }}
                  >
                    Repositories
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); router.push("/portal/projects"); }}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, border: "1px solid var(--border-hairline)", background: "transparent", cursor: "pointer" }}
                  >
                    Client Projects
                  </button>
                </>
              ) : isPortal ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); router.push("/portal/projects"); }}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, border: "1px solid var(--border-hairline)", background: "transparent", cursor: "pointer" }}
                  >
                    My Projects
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); router.push("/portal/appointments"); }}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, border: "1px solid var(--border-hairline)", background: "transparent", cursor: "pointer" }}
                  >
                    Appointments
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); router.push("/admin/inquiry?status=NEW"); }}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, border: "1px solid var(--border-hairline)", background: "transparent", cursor: "pointer" }}
                  >
                    New Inquiries
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); router.push("/admin/appointments"); }}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, border: "1px solid var(--border-hairline)", background: "transparent", cursor: "pointer" }}
                  >
                    Appointments
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); router.push("/admin/users"); }}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, border: "1px solid var(--border-hairline)", background: "transparent", cursor: "pointer" }}
                  >
                    Users &amp; Roles
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .left-rail-btn:hover {
          background: rgba(255,255,255,0.12) !important;
          color: #ffffff !important;
          transform: scale(1.05);
        }
      `}</style>
    </>
  );
}
