"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Layers,
  Calendar,
  X,
  FileText,
  Mail,
  ShieldCheck,
} from "lucide-react";

export interface PortalProjectMilestone {
  id: string;
  title: string;
  dueAt: string | null;
  completedAt: string | null;
}

export interface PortalProjectTask {
  id: string;
  title: string;
  dueAt: string | null;
  completedAt: string | null;
}

export interface PortalProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  milestones: PortalProjectMilestone[];
  tasks: PortalProjectTask[];
}

export interface PortalInquiry {
  id: string;
  service: string;
  budget: string | null;
  company: string | null;
  message: string;
  status: string;
  referenceUrl: string | null;
  referenceImage: string | null;
  createdAt: string;
}

interface ClientPortalTrackerProps {
  userName: string;
  userEmail: string;
  projects: PortalProject[];
  inquiries: PortalInquiry[];
  isAdminPreview?: boolean;
}

export function ClientPortalTracker({
  userName,
  userEmail,
  projects,
  inquiries,
  isAdminPreview = false,
}: ClientPortalTrackerProps) {
  const [activeInquiryDetail, setActiveInquiryDetail] = useState<PortalInquiry | null>(null);

  const activeProjects = projects.filter(
    (p) => p.status === "IN_PROGRESS" || p.status === "PLANNING" || p.status === "REVIEW"
  );
  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = projects.reduce(
    (acc, p) => acc + p.tasks.filter((t) => t.completedAt !== null).length,
    0
  );

  const getInquiryStage = (status: string) => {
    switch (status) {
      case "NEW":
        return {
          step: 1,
          label: "Inquiry Received",
          desc: "Our engineering leads are reviewing your project requirements and technical feasibility.",
          color: "#d97706",
          bg: "rgba(245,158,11,0.12)",
        };
      case "CONTACTED":
        return {
          step: 2,
          label: "Discovery & Technical Review",
          desc: "Consultation in progress. We are clarifying specs and integrations.",
          color: "#2563eb",
          bg: "rgba(37,99,235,0.12)",
        };
      case "QUALIFIED":
      case "PROPOSAL_SENT":
        return {
          step: 3,
          label: "Milestone Proposal & Blueprint",
          desc: "Architecture blueprint and fixed milestone agreement prepared for your approval.",
          color: "#7c3aed",
          bg: "rgba(124,58,237,0.12)",
        };
      case "CONVERTED":
        return {
          step: 4,
          label: "Workspace Provisioned",
          desc: "Initiative accepted! Active development project provisioned in your portal.",
          color: "#059669",
          bg: "rgba(16,185,129,0.12)",
        };
      case "CLOSED":
        return {
          step: 4,
          label: "Concluded",
          desc: "Inquiry completed or archived.",
          color: "var(--muted)",
          bg: "rgba(0,0,0,0.06)",
        };
      default:
        return {
          step: 1,
          label: status,
          desc: "Status logged with studio engineers.",
          color: "var(--muted)",
          bg: "rgba(0,0,0,0.06)",
        };
    }
  };

  const getProjectStatusLabel = (status: string) => {
    switch (status) {
      case "PLANNING":
        return {
          title: "Architecture & Blueprinting",
          caption: "Schema design, wireframes, and milestone breakdown in progress.",
          color: "#2563eb",
        };
      case "IN_PROGRESS":
        return {
          title: "Active Sprint Engineering",
          caption: "Features and deliverables currently being authored by studio engineers.",
          color: "#059669",
        };
      case "REVIEW":
        return {
          title: "Staging QA & Client Review",
          caption: "Deployed to your private staging environment for milestone sign-off.",
          color: "#d97706",
        };
      case "COMPLETED":
        return {
          title: "Production Deployed & Handed Over",
          caption: "100% completed, full repository transfer and deployment keys delivered.",
          color: "#10b981",
        };
      default:
        return {
          title: status.replace("_", " "),
          caption: "Workspace active.",
          color: "var(--muted)",
        };
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 1160, margin: "0 auto", paddingBottom: 60 }}>
      {/* Admin Preview Notice */}
      {isAdminPreview && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            background: "var(--surface-raised, #f3f4f6)",
            border: "1px solid var(--border-hairline, #e5e7eb)",
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
            color: "var(--text-secondary)",
          }}
        >
          <span>
            Admin Preview Mode: You are viewing this workspace as client <strong>{userName}</strong> ({userEmail}).
          </span>
          <Link href="/admin/projects" style={{ fontWeight: 700, color: "var(--accent-blue, #6C4CFF)" }}>
            &larr; Switch to Admin Projects
          </Link>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 18, marginBottom: 32 }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--accent-blue, #6C4CFF)", display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={14} /> Client Portal &middot; Real-Time Deliverables
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-.05em", margin: "8px 0 6px", color: "var(--ink)" }}>
            Project Status &amp; Workspace
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, maxWidth: 620, lineHeight: 1.7 }}>
            Track active engineering sprints, deliverable milestones, review staging deployments, and inspect submitted project requests with Nova engineers.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/contact"
            className="button"
            style={{ padding: "10px 18px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <span>+ Request New Scope</span>
            <ArrowUpRight size={14} />
          </Link>
          <Link
            href="/portal/appointments"
            className="button button-outline"
            style={{ padding: "10px 16px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Calendar size={14} />
            <span>Book Consultation</span>
          </Link>
        </div>
      </div>

      {/* Top Status Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 16,
          marginBottom: 36,
        }}
      >
        {/* Card 1: Active Deliverables */}
        <div className="card card-hover-glow" style={{ padding: 22, borderRadius: 18, borderTop: "3px solid #2563EB" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <FolderKanban size={15} color="#2563EB" /> Active Projects
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, margin: "8px 0 4px", color: "var(--ink)", letterSpacing: "-0.04em" }}>
            {projects.length}
          </div>
          <div style={{ fontSize: 12, color: "#2563EB", fontWeight: 600 }}>
            {activeProjects.length} currently in development
          </div>
        </div>

        {/* Card 2: Tasks Completed */}
        <div className="card card-hover-glow" style={{ padding: 22, borderRadius: 18, borderTop: "3px solid #059669" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <CheckCircle2 size={15} color="#059669" /> Tasks &amp; Milestones
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, margin: "8px 0 4px", color: "var(--ink)", letterSpacing: "-0.04em" }}>
            {completedTasks}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            of {totalTasks} tracked deliverables completed
          </div>
        </div>

        {/* Card 3: Inquiries in Pipeline */}
        <div className="card card-hover-glow" style={{ padding: 22, borderRadius: 18, borderTop: "3px solid #d97706" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <MessageSquare size={15} color="#d97706" /> Inquiries &amp; Scopes
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, margin: "8px 0 4px", color: "var(--ink)", letterSpacing: "-0.04em" }}>
            {inquiries.length}
          </div>
          <div style={{ fontSize: 12, color: "#d97706", fontWeight: 600 }}>
            {inquiries.filter((i) => i.status !== "CLOSED").length} active in pipeline
          </div>
        </div>

        {/* Card 4: Support Channel */}
        <div className="card card-hover-glow" style={{ padding: 22, borderRadius: 18, borderTop: "3px solid #7c3aed" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <ShieldCheck size={15} color="#7c3aed" /> Direct Engineering SLA
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, margin: "14px 0 6px", color: "var(--ink)" }}>
            nova@allskyfares.com
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Operated by All Sky Fares LLC
          </div>
        </div>
      </div>

      {/* SECTION 1: ACTIVE COMMISSIONED PROJECTS */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: 0, color: "var(--ink)" }}>
              Active Project Workspaces
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>
              Dedicated development environments with milestone timelines and direct engineer messaging.
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div
            className="card"
            style={{
              padding: "40px 24px",
              textAlign: "center",
              borderRadius: 20,
              background: "var(--paper)",
              border: "1px dashed var(--line)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <FolderKanban size={36} color="var(--muted)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px", color: "var(--ink)" }}>
              No active development projects provisioned yet
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 440, margin: "0 auto 20px", lineHeight: 1.7 }}>
              When your scope or proposal is approved by Nova studio engineers, your dedicated project workspace, milestones, and deliverables will appear right here.
            </p>
            <Link href="/contact" className="button" style={{ display: "inline-flex", gap: 6, fontSize: 13 }}>
              <span>Submit Project Inquiry</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            {projects.map((proj) => {
              const statusInfo = getProjectStatusLabel(proj.status);
              const completedCount = proj.tasks.filter((t) => t.completedAt !== null).length;
              const percent = proj.tasks.length > 0 ? Math.round((completedCount / proj.tasks.length) * 100) : 0;

              return (
                <div
                  key={proj.id}
                  className="card card-hover-glow"
                  style={{
                    padding: 24,
                    borderRadius: 20,
                    background: "var(--paper)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 99,
                            background: "rgba(37,99,235,0.12)",
                            color: statusInfo.color,
                            textTransform: "uppercase",
                          }}
                        >
                          {statusInfo.title}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>
                          Last activity {new Date(proj.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "var(--ink)", letterSpacing: "-0.03em" }}>
                        <Link href={`/portal/projects/${proj.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                          {proj.name}
                        </Link>
                      </h3>
                      {proj.description && (
                        <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 0", lineHeight: 1.6, maxWidth: 680 }}>
                          {proj.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <Link
                        href={`/portal/projects/${proj.id}`}
                        className="button"
                        style={{ padding: "8px 16px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <span>Open Workspace</span>
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ margin: "18px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Sprint Completion</span>
                      <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                        {completedCount} of {proj.tasks.length} tasks completed ({percent}%)
                      </span>
                    </div>
                    <div style={{ height: 8, borderRadius: 99, background: "var(--subtle-fill, rgba(0,0,0,0.06))", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: "100%",
                          borderRadius: 99,
                          background: percent === 100 ? "#10b981" : "#2563EB",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Milestones list preview */}
                  {proj.milestones.length > 0 && (
                    <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 12 }}>
                      <span style={{ fontWeight: 700, color: "var(--text-muted-crm)", textTransform: "uppercase", fontSize: 10 }}>
                        Milestones:
                      </span>
                      {proj.milestones.map((m) => (
                        <span
                          key={m.id}
                          style={{
                            padding: "3px 10px",
                            borderRadius: 6,
                            background: m.completedAt ? "rgba(16,185,129,0.12)" : "var(--surface-raised)",
                            color: m.completedAt ? "#059669" : "var(--text-secondary)",
                            fontWeight: 600,
                            border: "1px solid var(--border-hairline)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {m.completedAt ? "✓ " : "⏳ "}
                          {m.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: SUBMITTED INQUIRIES & SCOPE TRACKER */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: 0, color: "var(--ink)" }}>
              Project Inquiries &amp; Scoping Pipeline
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>
              Check current assessment stage, reference materials, and engineering responses for your submitted requests.
            </p>
          </div>
          <Link href="/contact" className="button button-outline" style={{ fontSize: 12, padding: "6px 14px", height: "auto" }}>
            Submit Another Request &rarr;
          </Link>
        </div>

        {inquiries.length === 0 ? (
          <div
            className="card"
            style={{
              padding: "36px 20px",
              textAlign: "center",
              borderRadius: 20,
              background: "var(--paper)",
              border: "1px dashed var(--line)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <MessageSquare size={32} color="var(--muted)" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px", color: "var(--ink)" }}>
              No inquiries on record for this account
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 400, margin: "0 auto 16px" }}>
              Have an upcoming product, website, or web app in mind? Submit your requirements along with benchmark links and mockups.
            </p>
            <Link href="/contact" className="button" style={{ fontSize: 12, padding: "8px 16px" }}>
              Request Project Scope
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {inquiries.map((inq) => {
              const stage = getInquiryStage(inq.status);

              return (
                <div
                  key={inq.id}
                  className="card card-hover-glow"
                  style={{
                    padding: 22,
                    borderRadius: 18,
                    background: "var(--paper)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            textTransform: "uppercase",
                            padding: "3px 10px",
                            borderRadius: 99,
                            background: stage.bg,
                            color: stage.color,
                          }}
                        >
                          Step {stage.step}/4 &middot; {stage.label}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>
                          Ref #{inq.id.slice(-8)} &middot; Submitted {new Date(inq.createdAt).toLocaleDateString()}
                        </span>
                        {inq.budget && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", background: "var(--surface-raised)", padding: "1px 6px", borderRadius: 4 }}>
                            💰 {inq.budget}
                          </span>
                        )}
                      </div>

                      <h4 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px", color: "var(--ink)" }}>
                        {inq.service}
                      </h4>
                      <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
                        {stage.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveInquiryDetail(inq)}
                      className="button button-outline"
                      style={{ fontSize: 12, padding: "6px 14px", height: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <FileText size={13} />
                      <span>View Scope Details</span>
                    </button>
                  </div>

                  {/* 4-Stage Progress Tracker Visual */}
                  <div style={{ margin: "16px 0 12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                      {[
                        { num: 1, name: "1. Received", shortName: "Received" },
                        { num: 2, name: "2. Technical Review", shortName: "Review" },
                        { num: 3, name: "3. Scope Blueprint", shortName: "Blueprint" },
                        { num: 4, name: "4. Workspace Provisioned", shortName: "Ready" },
                      ].map((s) => {
                        const isDone = stage.step >= s.num;
                        const isCurrent = stage.step === s.num;

                        return (
                          <div key={s.num} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <div
                              style={{
                                height: 6,
                                borderRadius: 99,
                                background: isDone ? stage.color : "var(--subtle-fill, rgba(0,0,0,0.06))",
                              }}
                            />
                            <span
                              className="desktop-stage-name"
                              style={{
                                fontSize: 10,
                                fontWeight: isCurrent ? 800 : 500,
                                color: isCurrent ? "var(--ink)" : "var(--muted)",
                              }}
                            >
                              {s.name}
                            </span>
                            <span
                              className="mobile-stage-name"
                              style={{
                                fontSize: 9,
                                fontWeight: isCurrent ? 800 : 500,
                                color: isCurrent ? "var(--ink)" : "var(--muted)",
                                textAlign: "center",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {s.shortName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reference Materials summary */}
                  {(inq.referenceUrl || inq.referenceImage) && (
                    <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10, marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", fontSize: 11 }}>
                      <span style={{ fontWeight: 700, color: "var(--text-muted-crm)" }}>Reference Materials:</span>
                      {inq.referenceUrl && (
                        <a
                          href={inq.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: "var(--surface-raised)",
                            color: "var(--accent-blue, #6C4CFF)",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontWeight: 600,
                          }}
                        >
                          🔗 Benchmark Link <ExternalLink size={10} />
                        </a>
                      )}
                      {inq.referenceImage && (
                        <button
                          type="button"
                          onClick={() => setActiveInquiryDetail(inq)}
                          style={{
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: "var(--surface-raised)",
                            border: "none",
                            color: "var(--ink)",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          🖼️ Mockup Uploaded (Click to Inspect)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL: CLIENT INQUIRY DETAIL INSPECTOR */}
      {activeInquiryDetail && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            overflowY: "auto",
          }}
          onClick={() => setActiveInquiryDetail(null)}
        >
          <div
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 22,
              maxWidth: 640,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              padding: "24px 28px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--accent-blue, #6C4CFF)", letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>
                  Submitted Request &middot; Ref #{activeInquiryDetail.id.slice(-8)}
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "var(--ink)", letterSpacing: "-0.03em" }}>
                  {activeInquiryDetail.service}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveInquiryDetail(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1px solid var(--line)",
                  background: "var(--paper-alt, rgba(0,0,0,0.04))",
                  color: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Status explanation */}
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: getInquiryStage(activeInquiryDetail.status).bg,
                color: getInquiryStage(activeInquiryDetail.status).color,
                marginBottom: 20,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Current Status: {getInquiryStage(activeInquiryDetail.status).label}
              <div style={{ fontSize: 12, fontWeight: 400, marginTop: 4, opacity: 0.9 }}>
                {getInquiryStage(activeInquiryDetail.status).desc}
              </div>
            </div>

            {/* Scope / Message */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>
                Your Submitted Project Scope &amp; Requirements:
              </span>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "var(--surface-raised, rgba(0,0,0,0.03))",
                  border: "1px solid var(--border-hairline)",
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: "var(--ink)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {activeInquiryDetail.message}
              </div>
            </div>

            {/* Reference Materials */}
            {(activeInquiryDetail.referenceUrl || activeInquiryDetail.referenceImage) && (
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 8 }}>
                  Reference Materials Submitted:
                </span>

                <div style={{ display: "grid", gap: 10 }}>
                  {activeInquiryDetail.referenceUrl && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "var(--surface-raised)",
                        border: "1px solid var(--border-hairline)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div style={{ minWidth: 0, overflow: "hidden" }}>
                        <span style={{ fontSize: 11, color: "var(--muted)", display: "block" }}>Benchmark Link:</span>
                        <span style={{ fontSize: 12, color: "var(--accent-blue, #6C4CFF)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                          {activeInquiryDetail.referenceUrl}
                        </span>
                      </div>
                      <a
                        href={activeInquiryDetail.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-outline"
                        style={{ fontSize: 11, padding: "5px 12px", height: "auto", flexShrink: 0 }}
                      >
                        Visit Link &rarr;
                      </a>
                    </div>
                  )}

                  {activeInquiryDetail.referenceImage && (
                    <div>
                      <span style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                        Reference Mockup / Wireframe
                      </span>
                      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border-hairline)", background: "var(--surface-raised)", maxWidth: 360 }}>
                        <img
                          src={activeInquiryDetail.referenceImage}
                          alt="Submitted mockup"
                          style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }}
                        />
                        <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--paper)" }}>
                          <span style={{ fontSize: 11, color: "var(--muted)" }}>Uploaded Asset</span>
                          <a
                            href={activeInquiryDetail.referenceImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-blue, #6C4CFF)", textDecoration: "none" }}
                          >
                            Open Full Size &rarr;
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Need adjustments */}
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                Need to adjust your scope? Reach out directly via <a href="mailto:nova@allskyfares.com" style={{ color: "var(--accent-blue, #6C4CFF)", fontWeight: 600 }}>nova@allskyfares.com</a>
              </span>
              <button
                type="button"
                onClick={() => setActiveInquiryDetail(null)}
                className="button"
                style={{ fontSize: 12, padding: "8px 16px", height: "auto" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
