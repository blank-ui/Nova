"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  TrendingUp,
  FolderKanban,
  Calendar,
  ExternalLink,
  Plus,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Shield,
  Users,
  MessageSquare,
  Image as ImageIcon,
  Mail,
  ChevronRight,
  Activity,
  X,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { NovaMascotAvatar } from "@/components/brand";
import { useToast } from "@/components/toast";

export interface DashboardInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service: string;
  budget?: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export interface DashboardProject {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  milestones: Array<{ id: string; title: string; dueAt?: string | null; completedAt?: string | null }>;
  tasks: Array<{ id: string; title: string; dueAt?: string | null; completedAt?: string | null }>;
}

export interface AdminSessionData {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
  image?: string | null;
  discordHandle?: string | null;
}

interface AdminDashboardCRMProps {
  sessionUser: AdminSessionData;
  inquiries: DashboardInquiry[];
  projects: DashboardProject[];
  totalUsersCount: number;
  totalGalleryCount: number;
}

function DiscordIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function AdminDashboardCRM({
  sessionUser,
  inquiries = [],
  projects = [],
  totalUsersCount,
  totalGalleryCount,
}: AdminDashboardCRMProps) {
  const toast = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [funnelView, setFunnelView] = useState<"total" | "weighted">("total");
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const [createProjectModal, setCreateProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectClientId, setNewProjectClientId] = useState(
    inquiries[0]?.id || sessionUser.id
  );
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [localProjects, setLocalProjects] = useState<DashboardProject[]>(projects);

  useEffect(() => {
    if (searchParams?.get("action") === "create-project" || searchParams?.get("create") === "project") {
      setCreateProjectModal(true);
    }
    function onOpen() {
      setCreateProjectModal(true);
    }
    window.addEventListener("nova:open-create-project", onOpen);
    return () => window.removeEventListener("nova:open-create-project", onOpen);
  }, [searchParams]);

  const adminFirstName = sessionUser.name ? sessionUser.name.trim().split(/\s+/)[0] : "Admin";

  // Real calculations
  const totalInquiriesCount = inquiries.length;
  const totalProjectsCount = localProjects.length;
  const totalRecordsCount = totalInquiriesCount + totalProjectsCount;

  // Real Pipeline value display
  const budgetsWithValues = inquiries.map((i) => i.budget).filter(Boolean);
  const displayPipeline =
    budgetsWithValues.length > 0
      ? budgetsWithValues.slice(0, 2).join(" · ")
      : totalProjectsCount > 0
      ? `${totalProjectsCount} Active Initiatives`
      : "Under Scoping";

  const totalTasks = localProjects.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = localProjects.reduce(
    (acc, p) => acc + p.tasks.filter((t) => t.completedAt !== null).length,
    0
  );
  const totalMilestones = localProjects.reduce((acc, p) => acc + p.milestones.length, 0);
  const pendingMilestones = localProjects.reduce(
    (acc, p) => acc + p.milestones.filter((m) => m.completedAt === null).length,
    0
  );

  // Real Stage Funnel Breakdown
  const stageQualification = inquiries.filter((i) => i.status === "NEW" || i.status === "CONTACTED").length;
  const stageProposal = inquiries.filter((i) => i.status === "QUALIFIED" || i.status === "PROPOSAL_SENT").length;
  const stageActive =
    localProjects.filter((p) => p.status === "IN_PROGRESS" || p.status === "PLANNING").length +
    inquiries.filter((i) => i.status === "CONVERTED").length;
  const stageCompleted =
    localProjects.filter((p) => p.status === "COMPLETED").length +
    inquiries.filter((i) => i.status === "CLOSED").length;

  function copyText(value: string, fieldName: string) {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard`, "Copied");
    setTimeout(() => setCopiedField(null), 2000);
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim()) {
      toast.error("Please enter a project title", "Required");
      return;
    }

    setIsCreatingProject(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDesc.trim() || null,
          clientId: newProjectClientId,
          status: "IN_PROGRESS",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      toast.success(`Project "${newProjectName}" created successfully!`, "Provisioned");
      setLocalProjects([data.project, ...localProjects]);
      setNewProjectName("");
      setNewProjectDesc("");
      setCreateProjectModal(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error creating project", "Failed");
    } finally {
      setIsCreatingProject(false);
    }
  }

  if (createProjectModal) {
    return (
      <div className="shell animate-fade-in-up" style={{ padding: "40px 0 80px", maxWidth: 840, margin: "0 auto" }}>
        {/* Navigation Bar */}
        <div style={{ marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setCreateProjectModal(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-secondary, var(--muted))",
              background: "var(--surface-raised, var(--paper))",
              border: "1px solid var(--border-hairline, var(--line))",
              borderRadius: 99,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <ArrowLeft size={16} /> Back to CRM Overview
          </button>
        </div>

        <div
          className="card"
          style={{
            padding: "28px 32px",
            background: "var(--card-bg, var(--paper))",
            border: "1px solid var(--border-hairline, var(--line))",
            borderRadius: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <FolderKanban size={22} color="#2563EB" />
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>
              Provision New Workspace Project
            </h2>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 24px", lineHeight: 1.6 }}>
            Create an active workspace project. This will immediately display in the client&apos;s portal, developer boards, and real project pipelines.
          </p>

          <form onSubmit={handleCreateProject} style={{ display: "grid", gap: 18 }}>
            <div>
              <label className="auth-label" style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "var(--ink)" }}>
                Project Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Flight Booking Portal Redesign"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="field"
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label className="auth-label" style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "var(--ink)" }}>
                Description (Optional)
              </label>
              <textarea
                placeholder="Scope of work, deliverables, and timeline..."
                rows={4}
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                className="field"
                style={{ resize: "vertical", width: "100%" }}
              />
            </div>

            {inquiries.length > 0 && (
              <div>
                <label className="auth-label" style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "var(--ink)" }}>
                  Associate with Client / Lead
                </label>
                <select
                  value={newProjectClientId}
                  onChange={(e) => setNewProjectClientId(e.target.value)}
                  className="field"
                  style={{ width: "100%" }}
                >
                  <option value={sessionUser.id}>Admin Workspace ({sessionUser.name || sessionUser.email})</option>
                  {inquiries.map((inq) => (
                    <option key={inq.id} value={inq.id}>
                      {inq.name} · {inq.service} ({inq.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 8,
                paddingTop: 18,
                borderTop: "1px solid var(--border-hairline, var(--line))",
              }}
            >
              <button
                type="button"
                onClick={() => setCreateProjectModal(false)}
                className="button button-outline"
                style={{ minWidth: 100, justifyContent: "center" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingProject}
                className="button"
                style={{ minWidth: 150, justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                {isCreatingProject ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Provisioning...
                  </>
                ) : (
                  "Create Project"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="shell" style={{ padding: "40px 0 80px" }}>
      {/* Top Header & Stat Widgets Bar */}
      <header
        className="animate-fade-in-up"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 36,
          paddingBottom: 24,
          borderBottom: "1px solid var(--line)",
        }}
      >
        {/* Left: Branding & Breadcrumbs */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <NovaMascotAvatar size={20} />
              <span>Nova · Administration Control Center</span>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 10px",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 600,
                background: "rgba(16, 185, 129, 0.1)",
                color: "#10b981",
                border: "1px solid rgba(16, 185, 129, 0.25)",
              }}
            >
              <span className="radar-dot" style={{ width: 6, height: 6 }} />
              Live Operations Online
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(26px, 4vw, 36px)",
              letterSpacing: "-0.05em",
              margin: "10px 0 6px",
              color: "var(--ink)",
            }}
          >
            Admin Workspace
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", maxWidth: 540 }}>
            Welcome back,{" "}
            <strong style={{ color: "var(--ink)" }}>{adminFirstName}</strong> ({sessionUser.email}).
            Salesforce-styled executive overview with real pipeline records.
          </p>

          {/* Quick Nav Pill Shortcuts */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
            <Link
              href="/admin/inquiry"
              className="button"
              style={{ padding: "8px 14px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <MessageSquare size={14} /> Inquiries ({totalInquiriesCount})
            </Link>
            <Link
              href="/admin/projects"
              className="button button-outline"
              style={{ padding: "8px 14px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <FolderKanban size={14} /> Projects ({totalProjectsCount})
            </Link>
            <Link
              href="/admin/users"
              className="button button-outline"
              style={{ padding: "8px 14px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Users size={14} /> Users ({totalUsersCount})
            </Link>
            <Link
              href="/admin/showcase"
              className="button button-outline"
              style={{ padding: "8px 14px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <ImageIcon size={14} /> Gallery ({totalGalleryCount})
            </Link>
            <Link
              href="/admin/security"
              className="button button-outline"
              style={{ padding: "8px 14px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Shield size={14} /> Security
            </Link>
          </div>
        </div>

        {/* Right: Modern Pill Stat Widgets */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          {/* Stat 1: Real Pipeline Value */}
          <div
            className="crm-top-stat"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 18,
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(16,185,129,0.12)",
                color: "#10B981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>
                  {displayPipeline}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 99,
                    background: "#10B981",
                    color: "#FFFFFF",
                  }}
                >
                  +{totalInquiriesCount} leads
                </span>
              </div>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                {totalRecordsCount} Total Client Engagement{totalRecordsCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Stat 2: Real Active Projects */}
          <div
            className="crm-top-stat"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 18,
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(37,99,235,0.12)",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FolderKanban size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)" }}>{totalProjectsCount}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 99,
                    background: "#2563EB",
                    color: "#FFFFFF",
                  }}
                >
                  {totalUsersCount} accounts
                </span>
              </div>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>Active Projects in Workspace</span>
            </div>
          </div>

          {/* Stat 3: Real Tasks & Milestones */}
          <div
            className="crm-top-stat"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 18,
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(108,76,255,0.12)",
                color: "#6C4CFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)" }}>{totalTasks}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 99,
                    background: "rgba(0,0,0,0.07)",
                    color: "var(--ink)",
                  }}
                >
                  {pendingMilestones} pending
                </span>
              </div>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                {completedTasks}/{totalTasks} Completed Tasks
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main CRM Grid: Left 62% - Right 38% */}
      <div
        className="crm-main-layout animate-fade-in-up"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.75fr) minmax(320px, 1fr)",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: Projects & Active Leads + Tasks Schedule & Stage Funnel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Card 1: Projects & Active Leads */}
          <section
            className="crm-card"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", margin: 0, color: "var(--ink)" }}>
                  Projects &amp; Active Leads
                </h2>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: "rgba(108,76,255,0.12)",
                    color: "#6C4CFF",
                  }}
                >
                  {totalRecordsCount} Available
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setCreateProjectModal(true)}
                  className="button button-outline"
                  style={{ padding: "6px 12px", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <Plus size={13} />
                  <span>New Project</span>
                </button>
                <Link
                  href="/admin/inquiry"
                  className="crm-icon-button"
                  title="All Inquiries (CRM)"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "1px solid var(--line)",
                    background: "transparent",
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>

            {/* REAL DATA ONLY: Projects & Inquiries Grid */}
            {totalRecordsCount === 0 ? (
              <div
                style={{
                  padding: "48px 20px",
                  textAlign: "center",
                  borderRadius: 18,
                  border: "1px dashed var(--line)",
                  background: "var(--paper-alt, rgba(0,0,0,0.02))",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <FolderKanban size={34} color="var(--muted)" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "var(--ink)" }}>
                  No active projects or inquiries yet
                </h3>
                <p style={{ fontSize: 12, color: "var(--muted)", maxWidth: 360, margin: "0 auto 16px", lineHeight: 1.6 }}>
                  Inquiries submitted through the website or client workspaces provisioned will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => setCreateProjectModal(true)}
                  className="button"
                  style={{ fontSize: 12, padding: "8px 16px" }}
                >
                  <Plus size={14} /> Provision First Project
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 14,
                }}
              >
                {/* 1. Real Client Projects */}
                {localProjects.map((proj, idx) => {
                  const colors = [
                    { bg: "#2563EB", text: "#FFFFFF", pill: "rgba(255,255,255,0.2)" },
                    { bg: "#0E7490", text: "#FFFFFF", pill: "rgba(255,255,255,0.2)" },
                    { bg: "#111827", text: "#FFFFFF", pill: "rgba(255,255,255,0.2)" },
                    { bg: "#FACC15", text: "#18181B", pill: "rgba(0,0,0,0.1)" },
                  ];
                  const c = colors[idx % colors.length];
                  const completedCount = proj.tasks.filter((t) => t.completedAt !== null).length;

                  return (
                    <div
                      key={proj.id}
                      style={{
                        background: c.bg,
                        color: c.text,
                        borderRadius: 18,
                        padding: "18px 20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: 145,
                        boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: c.pill }}>
                          {new Date(proj.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                        <Link href={`/portal/projects/${proj.id}`} style={{ color: "inherit", opacity: 0.85 }} title="Open Project Workspace">
                          <ExternalLink size={14} />
                        </Link>
                      </div>

                      <div style={{ margin: "12px 0" }}>
                        <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>{proj.name}</div>
                        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>
                          {proj.milestones.length} milestones &middot; {completedCount}/{proj.tasks.length} tasks
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Link
                          href={`/portal/projects/${proj.id}`}
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "inherit",
                            textDecoration: "underline",
                            textUnderlineOffset: 3,
                          }}
                        >
                          Workspace &rarr;
                        </Link>
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", padding: "1px 6px", borderRadius: 4, background: c.pill }}>
                          {proj.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* 2. Real Inquiries */}
                {inquiries.map((inq, idx) => {
                  const colors = [
                    { bg: "#2563EB", text: "#FFFFFF", pill: "rgba(255,255,255,0.2)" },
                    { bg: "#0E7490", text: "#FFFFFF", pill: "rgba(255,255,255,0.2)" },
                    { bg: "#111827", text: "#FFFFFF", pill: "rgba(255,255,255,0.2)" },
                    { bg: "#FACC15", text: "#18181B", pill: "rgba(0,0,0,0.1)" },
                  ];
                  const c = colors[(idx + localProjects.length) % colors.length];

                  return (
                    <div
                      key={inq.id}
                      style={{
                        background: c.bg,
                        color: c.text,
                        borderRadius: 18,
                        padding: "18px 20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: 145,
                        boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: c.pill }}>
                          {new Date(inq.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                        <Link href={`/admin/inquiry/${inq.id}`} style={{ color: "inherit", opacity: 0.85 }} title="Open Lead CRM">
                          <ExternalLink size={14} />
                        </Link>
                      </div>

                      <div style={{ margin: "12px 0" }}>
                        <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>{inq.service}</div>
                        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>
                          {inq.name} {inq.company ? `(${inq.company})` : ""}
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 800 }}>{inq.budget || "Custom"}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", padding: "1px 6px", borderRadius: 4, background: c.pill }}>
                          {inq.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Subgrid: Tasks Schedule (Calendar) & Stage Funnel */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {/* Tasks Schedule Calendar Card */}
            <section
              className="crm-card"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 24,
                padding: 22,
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>Tasks Schedule</h3>
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
                  {totalTasks} scheduled
                </span>
              </div>

              {/* Month Selector */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>October 2026</span>
              </div>

              {/* Calendar Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 6,
                  textAlign: "center",
                  fontSize: 11,
                }}
              >
                {/* Day Labels */}
                {["M", "T", "W", "T", "F", "S", "S"].map((d, di) => (
                  <div key={di} style={{ color: "var(--muted)", fontWeight: 700, paddingBottom: 4 }}>
                    {d}
                  </div>
                ))}

                {/* Day Numbers 1 to 21 */}
                {Array.from({ length: 21 }, (_, i) => {
                  const day = i + 1;
                  const isSelected = selectedCalendarDay === day;

                  // Active indicator dot for days with items
                  const hasItem = day === 12 || day === 14 || day === 18;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedCalendarDay(isSelected ? null : day)}
                      style={{
                        padding: "8px 0",
                        borderRadius: 10,
                        border: isSelected ? "1px solid #2563EB" : "1px solid transparent",
                        background: isSelected
                          ? "#2563EB"
                          : hasItem
                          ? "var(--subtle-fill, rgba(255,255,255,0.06))"
                          : "transparent",
                        color: isSelected ? "#FFFFFF" : "var(--ink)",
                        fontWeight: isSelected || hasItem ? 700 : 500,
                        cursor: "pointer",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <span>{day}</span>
                      {hasItem && (
                        <span
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: isSelected ? "#FFFFFF" : "#2563EB",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Day or Real Tasks Callout */}
              <div
                style={{
                  marginTop: 18,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "var(--subtle-fill, rgba(255,255,255,0.04))",
                  border: "1px solid var(--line)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(37,99,235,0.1)",
                    color: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Clock size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>
                    {selectedCalendarDay ? `October ${selectedCalendarDay}, 2026` : "Studio Task Cadence"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    {totalTasks > 0
                      ? `${totalTasks} task${totalTasks === 1 ? "" : "s"} across active workspaces`
                      : "Zero pending deadlines in active sprints"}
                  </div>
                </div>
              </div>
            </section>

            {/* Stage Funnel Card */}
            <section
              className="crm-card"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 24,
                padding: 22,
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>Stage Funnel</h3>
                <div style={{ display: "flex", gap: 4, background: "var(--line)", padding: 2, borderRadius: 8 }}>
                  <button
                    type="button"
                    onClick={() => setFunnelView("total")}
                    style={{
                      border: "none",
                      background: funnelView === "total" ? "var(--paper)" : "transparent",
                      color: funnelView === "total" ? "var(--ink)" : "var(--muted)",
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Total
                  </button>
                  <button
                    type="button"
                    onClick={() => setFunnelView("weighted")}
                    style={{
                      border: "none",
                      background: funnelView === "weighted" ? "var(--paper)" : "transparent",
                      color: funnelView === "weighted" ? "var(--ink)" : "var(--muted)",
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Share
                  </button>
                </div>
              </div>

              {/* Funnel Bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "var(--muted)" }}>Qualification &amp; Leads</span>
                    <span style={{ fontWeight: 700, color: "var(--ink)" }}>{stageQualification}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: "var(--subtle-fill)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${totalRecordsCount > 0 ? (stageQualification / totalRecordsCount) * 100 : 0}%`,
                        height: "100%",
                        borderRadius: 99,
                        background: "#2563EB",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "var(--muted)" }}>Proposal &amp; Scoping</span>
                    <span style={{ fontWeight: 700, color: "var(--ink)" }}>{stageProposal}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: "var(--subtle-fill)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${totalRecordsCount > 0 ? (stageProposal / totalRecordsCount) * 100 : 0}%`,
                        height: "100%",
                        borderRadius: 99,
                        background: "#0E7490",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "var(--muted)" }}>Active Development</span>
                    <span style={{ fontWeight: 700, color: "var(--ink)" }}>{stageActive}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: "var(--subtle-fill)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${totalRecordsCount > 0 ? (stageActive / totalRecordsCount) * 100 : 0}%`,
                        height: "100%",
                        borderRadius: 99,
                        background: "#FACC15",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "var(--muted)" }}>Delivered &amp; Converted</span>
                    <span style={{ fontWeight: 700, color: "var(--ink)" }}>{stageCompleted}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: "var(--subtle-fill)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${totalRecordsCount > 0 ? (stageCompleted / totalRecordsCount) * 100 : 0}%`,
                        height: "100%",
                        borderRadius: 99,
                        background: "#10B981",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  paddingTop: 12,
                  borderTop: "1px solid var(--line)",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "var(--muted)",
                }}
              >
                <span>Projects: <strong>{totalProjectsCount}</strong></span>
                <span>Inquiries: <strong>{totalInquiriesCount}</strong></span>
              </div>
            </section>
          </div>
        </div>

        {/* RIGHT COLUMN: Administrator Persona Card + Operational Hub */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Persona Card */}
          <section
            className="crm-card"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 24,
              padding: "28px 24px 24px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Top Row Status Indicator */}
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#10B981",
                  }}
                />
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
                  Super Administrator · Online
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyText(sessionUser.email, "Admin Email")}
                className="crm-icon-button"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "1px solid var(--line)",
                  background: "transparent",
                  color: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                title="Share / Copy Email"
              >
                <Share2 size={13} />
              </button>
            </div>

            {/* Large Circular Avatar */}
            <div style={{ position: "relative", marginBottom: 14 }}>
              {sessionUser.image ? (
                <img
                  src={sessionUser.image}
                  alt={sessionUser.name || "Admin"}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid var(--paper)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                    color: "#FFFFFF",
                    fontSize: 34,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    letterSpacing: "-0.04em",
                    border: "3px solid var(--paper)",
                    boxShadow: "0 8px 24px rgba(37,99,235,0.25)",
                  }}
                >
                  {adminFirstName[0]}
                </div>
              )}
            </div>

            {/* Admin Name & Title */}
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                margin: "0 0 4px",
                color: "var(--ink)",
              }}
            >
              {sessionUser.name || "Administrator"}
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "var(--muted)",
                margin: "0 0 20px",
                maxWidth: 240,
                lineHeight: 1.5,
              }}
            >
              Super Administrator &middot; Nova Studio &amp; Operations
            </p>

            {/* Quick Action Pill Bar */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 99,
                background: "var(--paper-alt, rgba(0,0,0,0.04))",
                border: "1px solid var(--line)",
                marginBottom: 20,
              }}
            >
              {/* Settings / Security */}
              <Link
                href="/admin/security"
                className="crm-action-circle"
                title="Security & 2FA Settings"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "none",
                  background: "var(--paper)",
                  color: "var(--ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  textDecoration: "none",
                }}
              >
                <ShieldCheck size={14} />
              </Link>

              {/* Email */}
              <a
                href={`mailto:${sessionUser.email}`}
                className="crm-action-circle"
                title={`Email ${sessionUser.email}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "none",
                  background: "var(--paper)",
                  color: "var(--ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  textDecoration: "none",
                }}
              >
                <Mail size={14} />
              </a>

              {/* Inquiries */}
              <Link
                href="/admin/inquiry"
                className="crm-action-circle"
                title="View All Inquiries"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "none",
                  background: "var(--paper)",
                  color: "var(--ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  textDecoration: "none",
                }}
              >
                <MessageSquare size={14} />
              </Link>

              {/* Discord */}
              <a
                href={
                  sessionUser.discordHandle
                    ? `https://discord.com/users/${sessionUser.discordHandle}`
                    : "https://discord.com/users/superr_nova_"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="crm-action-circle"
                title="Open Studio Discord"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "none",
                  background: "var(--paper)",
                  color: "#5865F2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  textDecoration: "none",
                }}
              >
                <DiscordIcon size={14} />
              </a>
            </div>

            {/* Information List with Copy Buttons */}
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                textAlign: "left",
                borderTop: "1px solid var(--line)",
                paddingTop: 18,
              }}
            >
              {/* Row: Role */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Role Authorization</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: "rgba(108, 76, 255, 0.12)",
                    color: "var(--blue)",
                    border: "1px solid rgba(108, 76, 255, 0.25)",
                  }}
                >
                  ADMIN
                </span>
              </div>

              {/* Row: Email */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Admin Email</span>
                <button
                  type="button"
                  onClick={() => copyText(sessionUser.email, "Admin Email")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>{sessionUser.email}</span>
                  {copiedField === "Admin Email" ? <Check size={12} color="#10B981" /> : <Copy size={12} color="var(--muted)" />}
                </button>
              </div>

              {/* Row: Two-Factor */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Two-Factor (TOTP)</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: sessionUser.twoFactorEnabled ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                    color: sessionUser.twoFactorEnabled ? "#059669" : "#d97706",
                  }}
                >
                  {sessionUser.twoFactorEnabled ? "Active (TOTP)" : "Disabled (Optional)"}
                </span>
              </div>

              {/* Row: Operations Dispatch */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Operations Dispatch</span>
                <button
                  type="button"
                  onClick={() => copyText("nova@allskyfares.com", "Dispatch Email")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>nova@allskyfares.com</span>
                  {copiedField === "Dispatch Email" ? <Check size={12} color="#10B981" /> : <Copy size={12} color="var(--muted)" />}
                </button>
              </div>

              {/* Row: Discord Channel */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Studio Discord</span>
                <a
                  href="https://discord.com/users/superr_nova_"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: "rgba(88, 101, 242, 0.12)",
                    color: "#5865F2",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  @superr_nova_ <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </section>

          {/* Operational Hub & System Status Card */}
          <section
            className="crm-card"
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div>
                <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Activity size={13} style={{ color: "var(--blue)" }} /> System Engine
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "4px 0 0", color: "var(--ink)" }}>
                  Operations &amp; Hub
                </h3>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 99,
                  background: "rgba(16, 185, 129, 0.12)",
                  color: "#059669",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                Healthy
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Row 1: Database */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "var(--paper-alt, rgba(0,0,0,0.02))",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "rgba(16, 185, 129, 0.12)",
                      display: "grid",
                      placeItems: "center",
                      color: "#10b981",
                    }}
                  >
                    <CheckCircle2 size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>PostgreSQL Database</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>Prisma connection active</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#059669" }}>Connected</span>
              </div>

              {/* Row 2: Mailer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "var(--paper-alt, rgba(0,0,0,0.02))",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "rgba(108, 76, 255, 0.12)",
                      display: "grid",
                      placeItems: "center",
                      color: "#6C4CFF",
                    }}
                  >
                    <Mail size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>Hostinger SMTP</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>Port 465 (SSL) Dispatch</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)" }}>Live</span>
              </div>

              {/* Row 3: Security */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "var(--paper-alt, rgba(0,0,0,0.02))",
                  border: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "rgba(6, 182, 212, 0.12)",
                      display: "grid",
                      placeItems: "center",
                      color: "#0891b2",
                    }}
                  >
                    <ShieldCheck size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>Session Security</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>Token rotation &amp; guard</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#0891b2" }}>Protected</span>
              </div>
            </div>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)", display: "grid", gap: 8 }}>
              <Link
                href="/admin/projects"
                className="button"
                style={{ padding: "9px 14px", fontSize: 12, justifyContent: "center" }}
              >
                <Plus size={14} /> Provision Client Project
              </Link>
              <Link
                href="/portal"
                className="button button-outline"
                style={{ padding: "9px 14px", fontSize: 12, justifyContent: "center" }}
              >
                <ExternalLink size={14} /> Open Client Portal View
              </Link>
            </div>
          </section>
        </div>
      </div>



      {/* Global CRM Responsive Styles */}
      <style>{`
        .crm-icon-button:hover {
          background: var(--paper-alt, rgba(0,0,0,0.05)) !important;
          color: var(--ink) !important;
        }
        .crm-action-circle:hover {
          transform: scale(1.08);
        }
        @media (max-width: 900px) {
          .crm-main-layout {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .crm-card {
            padding: 16px 14px !important;
            border-radius: 18px !important;
          }
          .crm-top-stat {
            flex: 1 1 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
