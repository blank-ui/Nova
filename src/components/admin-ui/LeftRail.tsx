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
} from "lucide-react";
import { useToast } from "@/components/toast";

export function LeftRail() {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  const isPortal = pathname?.startsWith("/portal");

  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Create form states
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adminNavItems = [
    {
      id: "search",
      label: "Search & Command",
      isAction: true,
      onClick: () => setSearchOpen(true),
      icon: <Search size={18} strokeWidth={1.8} />,
    },
    {
      id: "inquiry",
      label: "Customer Inquiries (CRM)",
      href: "/admin/inquiry",
      icon: <MessageSquare size={18} strokeWidth={1.8} />,
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
      id: "quick-create",
      label: "Quick Provision (+)",
      isAction: true,
      onClick: () => setCreateOpen(true),
      icon: <Plus size={18} strokeWidth={1.8} />,
    },
    {
      id: "showcase",
      label: "GitHub & Gallery Showcase",
      href: "/admin/showcase",
      icon: <ImageIcon size={18} strokeWidth={1.8} />,
    },
    {
      id: "projects",
      label: "Client Projects & Workspaces",
      href: "/admin/projects",
      icon: <Folder size={18} strokeWidth={1.8} />,
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

  const navItems = isPortal ? clientNavItems : adminNavItems;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setCreateOpen(false);
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
    if (isPortal) {
      router.push(`/portal/projects?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/admin/inquiry?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  async function handleQuickProjectCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!projectName.trim()) {
      toast.error("Please enter a project title.", "Required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName.trim(),
          description: projectDesc.trim() || null,
          clientId: "admin",
          status: "IN_PROGRESS",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      toast.success(`Project "${projectName}" provisioned successfully!`, "Created");
      setProjectName("");
      setProjectDesc("");
      setCreateOpen(false);
      router.push(`/admin/projects`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error creating project", "Failed");
    } finally {
      setIsSubmitting(false);
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

          const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/portal" && pathname?.startsWith(item.href!));

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
                placeholder={isPortal ? "Search project initiatives and deliverables..." : "Search leads, clients, company, or services..."}
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
              {isPortal ? (
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

      {/* Quick Create Project Modal */}
      {createOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1000,
          }}
          onClick={() => setCreateOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface-raised)",
              borderRadius: 24,
              width: "min(480px, 100%)",
              padding: 28,
              boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
              border: "1px solid var(--border-hairline)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--accent-blue)", color: "#fff", display: "grid", placeItems: "center" }}>
                  <Plus size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>
                    Quick Provision Project
                  </h3>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted-crm)" }}>
                    Instantly create an active workspace project
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                aria-label="Close"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted-crm)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickProjectCreate} style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5 }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js SaaS Platform Redesign"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 14,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--card-bg-crm)",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5 }}>
                  Scope / Summary (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief deliverables, tech stack, or milestones..."
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 14,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--card-bg-crm)",
                    fontSize: 13,
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 99,
                    border: "1px solid var(--border-hairline)",
                    background: "transparent",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 99,
                    border: "none",
                    background: "var(--ink-crm)",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {isSubmitting ? "Provisioning..." : "Provision Project"}
                </button>
              </div>
            </form>
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
