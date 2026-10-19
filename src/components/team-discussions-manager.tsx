"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MessagesSquare,
  MessageSquare,
  FolderKanban,
  Search,
  ArrowRight,
  ExternalLink,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/admin-ui";
import { ProjectMessages } from "@/components/project-messages";

export interface ProjectDiscussionSummary {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    email: string;
  } | null;
  messageCount: number;
  lastMessage?: {
    body: string;
    createdAt: string;
    authorName?: string;
  } | null;
}

export interface TeamDiscussionsManagerProps {
  projects: ProjectDiscussionSummary[];
  currentUserId: string;
  currentUserRole?: string | null;
  initialProjectId?: string;
}

export function TeamDiscussionsManager({
  projects,
  currentUserId,
  currentUserRole = "CLIENT",
  initialProjectId,
}: TeamDiscussionsManagerProps) {
  const role = currentUserRole || "CLIENT";
  const isStaff = role === "ADMIN" || role === "DEVELOPER" || role === "FINANCE";
  const [search, setSearch] = useState("");

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.client?.name && p.client.name.toLowerCase().includes(q)) ||
        (p.client?.email && p.client.email.toLowerCase().includes(q)) ||
        (p.lastMessage?.body && p.lastMessage.body.toLowerCase().includes(q))
    );
  }, [projects, search]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    if (initialProjectId && projects.some((p) => p.id === initialProjectId)) {
      return initialProjectId;
    }
    return projects.length > 0 ? projects[0].id : "";
  });

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  const totalMessagesCount = useMemo(() => {
    return projects.reduce((acc, p) => acc + (p.messageCount || 0), 0);
  }, [projects]);

  return (
    <div className="animate-fade-in-up" style={{ width: "100%" }}>
      {/* Page Header */}
      <PageHeader
        titleLine1="Team"
        titleLine2="Discussion"
        backHref={role === "ADMIN" ? "/admin" : role === "DEVELOPER" ? "/developer" : role === "FINANCE" ? "/finance" : "/portal"}
        stats={[
          {
            icon: <MessagesSquare size={18} strokeWidth={1.8} />,
            value: projects.length,
            badgeLabel: "Threads",
            badgeVariant: "brand",
            caption: isStaff ? "All client project threads" : "Your active project channels",
          },
          {
            icon: <MessageSquare size={18} strokeWidth={1.8} />,
            value: totalMessagesCount,
            badgeLabel: "Messages",
            badgeVariant: "info",
            caption: "Direct updates exchanged",
          },
          {
            icon: <Users size={18} strokeWidth={1.8} />,
            value: isStaff ? "Engineering" : "Nova Studio",
            badgeLabel: "Direct SLA",
            badgeVariant: "success",
            caption: "< 24hr response time guarantee",
          },
        ]}
      />

      {projects.length === 0 ? (
        <div
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border-hairline)",
            borderRadius: 20,
            padding: "48px 32px",
            textAlign: "center",
            maxWidth: 680,
            margin: "24px auto",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
              color: "var(--text-muted-crm)",
            }}
          >
            <MessagesSquare size={32} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
            No Active Discussion Threads
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted-crm)", lineHeight: 1.6, margin: "0 auto 24px", maxWidth: 520 }}>
            {isStaff
              ? "No workspace projects currently provisioned in the database. When client inquiries are accepted and projects are created, their direct messaging channels will be listed here."
              : "Discussion threads activate when an engineering workspace or project milestone is provisioned. Connect with our team to start your next milestone or inquire about project scope."}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href={isStaff ? "/admin/projects" : "/portal/projects"}
              className="button"
              style={{
                background: "var(--ink-crm, #101322)",
                color: "#FFFFFF",
                padding: "10px 20px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FolderKanban size={15} />
              <span>{isStaff ? "Manage Workspaces" : "View Initiatives & Scope"}</span>
            </Link>
            <Link
              href="/portal/appointments"
              className="button button-outline"
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Calendar size={15} />
              <span>Schedule Consultation</span>
            </Link>
          </div>
        </div>
      ) : (
        <div
          className="discussions-layout"
          style={{
            display: "grid",
            gridTemplateColumns: projects.length > 1 ? "320px minmax(0, 1fr)" : "minmax(0, 1fr)",
            gap: 20,
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          {/* Left Column: Project Channel / Thread Selector (if multiple projects exist) */}
          {projects.length > 1 && (
            <div
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border-hairline)",
                borderRadius: 18,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                maxHeight: "calc(100vh - 260px)",
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 4px 0" }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted-crm)" }}>
                  Project Channels ({filteredProjects.length})
                </span>
              </div>

              {/* Thread Search Filter */}
              <div style={{ position: "relative" }}>
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted-crm)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Filter threads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 34px",
                    borderRadius: 10,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--card-bg-crm, #FFFFFF)",
                    color: "var(--text-primary)",
                    fontSize: 12,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* List of project channels */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {filteredProjects.map((p) => {
                  const isSelected = p.id === activeProject?.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProjectId(p.id)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: isSelected ? "1.5px solid var(--ink-crm, #101322)" : "1px solid transparent",
                        background: isSelected ? "var(--card-bg-crm, #FFFFFF)" : "transparent",
                        boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: isSelected ? 700 : 600,
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.name}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 6px",
                            borderRadius: 6,
                            fontWeight: 700,
                            background: p.status === "COMPLETED" ? "rgba(16, 185, 129, 0.12)" : "rgba(0,0,0,0.06)",
                            color: p.status === "COMPLETED" ? "#10B981" : "var(--text-muted-crm)",
                            flexShrink: 0,
                          }}
                        >
                          {p.status}
                        </span>
                      </div>

                      {p.client?.name && isStaff && (
                        <div style={{ fontSize: 11, color: "var(--text-muted-crm)", fontWeight: 500 }}>
                          {p.client.name}
                        </div>
                      )}

                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted-crm)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: 2,
                        }}
                      >
                        {p.lastMessage?.body ? (
                          <span>
                            <strong style={{ fontWeight: 600 }}>{p.lastMessage.authorName ? `${p.lastMessage.authorName.split(" ")[0]}: ` : ""}: </strong>
                            {p.lastMessage.body}
                          </span>
                        ) : (
                          <span style={{ fontStyle: "italic", opacity: 0.8 }}>No messages yet</span>
                        )}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, fontSize: 10, color: "var(--text-muted-crm)" }}>
                        <span>{p.messageCount} messages</span>
                        {p.lastMessage?.createdAt && (
                          <span>{new Date(p.lastMessage.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Column: Active Thread Canvas */}
          {activeProject && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                width: "100%",
              }}
            >
              {/* Thread Info Bar */}
              <div
                style={{
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: 16,
                  padding: "12px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                      {activeProject.name}
                    </h3>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 99,
                        fontWeight: 700,
                        background: "rgba(0,0,0,0.06)",
                        color: "var(--text-muted-crm)",
                      }}
                    >
                      {activeProject.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted-crm)", marginTop: 2 }}>
                    Direct communication thread with engineering &amp; design leads
                    {activeProject.client && isStaff ? ` · Client: ${activeProject.client.name} (${activeProject.client.email})` : ""}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Link
                    href={`/portal/projects/${activeProject.id}`}
                    target="_blank"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--card-bg-crm, #FFFFFF)",
                      textDecoration: "none",
                    }}
                  >
                    <span>View Scope &amp; Tasks</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>

              {/* Embedded ProjectMessages Component */}
              <ProjectMessages
                key={activeProject.id}
                projectId={activeProject.id}
                currentUserId={currentUserId}
                style={{
                  height: "calc(100vh - 360px)",
                  minHeight: 520,
                  maxHeight: "none",
                }}
              />
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .discussions-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
