"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Loader2,
  FolderPlus,
  Edit3,
  Send,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Building,
} from "lucide-react";
import { useToast } from "@/components/toast";
import type { PortalProject, PortalInquiry } from "./client-portal-tracker";

export interface ClientOption {
  id: string;
  name: string;
  email: string;
}

export interface ScopeActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  projects: PortalProject[];
  inquiries: PortalInquiry[];
  availableClients?: ClientOption[];
  onSuccess?: () => void;
}

export function ScopeActionsModal({
  isOpen,
  onClose,
  userRole = "DEVELOPER",
  projects,
  inquiries,
  availableClients = [],
  onSuccess,
}: ScopeActionsModalProps) {
  const router = useRouter();
  const toast = useToast();

  const isStaff = userRole === "DEVELOPER" || userRole === "ADMIN" || userRole === "FINANCE";

  // Tab State
  const [activeTab, setActiveTab] = useState<"take-scope" | "update-project" | "send-invite">(
    "take-scope"
  );

  // Tab 1: Take Scope Form
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>("");
  const [scopeName, setScopeName] = useState<string>("");
  const [scopeDescription, setScopeDescription] = useState<string>("");
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [selectedClientId, setSelectedClientId] = useState<string>(
    availableClients[0]?.id || ""
  );
  const [newClientEmail, setNewClientEmail] = useState<string>("");
  const [newClientName, setNewClientName] = useState<string>("");
  const [scopeStatus, setScopeStatus] = useState<string>("IN_PROGRESS");
  const [initialMilestone, setInitialMilestone] = useState<string>("");

  // Tab 2: Update Project Form
  const [updateProjectId, setUpdateProjectId] = useState<string>(
    projects[0]?.id || ""
  );
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [newProjectStatus, setNewProjectStatus] = useState<string>("");
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState<string>("");
  const [targetDueDate, setTargetDueDate] = useState<string>("");
  const [notifyClient, setNotifyClient] = useState<boolean>(true);

  // Tab 3: Send Invitation Form
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteName, setInviteName] = useState<string>("");
  const [inviteProjectTitle, setInviteProjectTitle] = useState<string>("");
  const [inviteCustomNote, setInviteCustomNote] = useState<string>("");

  // Client Scope Form
  const [clientService, setClientService] = useState<string>("Full-Stack Web Application");
  const [clientBudget, setClientBudget] = useState<string>("$5,000 – $15,000");
  const [clientMessage, setClientMessage] = useState<string>("");
  const [clientCompany, setClientCompany] = useState<string>("");

  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle when developer chooses an inquiry to convert into a scope
  const handleSelectInquiry = (inqId: string) => {
    setSelectedInquiryId(inqId);
    if (!inqId) return;
    const inq = inquiries.find((i) => i.id === inqId);
    if (inq) {
      setScopeName(`${inq.service} Scope`);
      setScopeDescription(inq.message || "");
      if (inq.company) {
        setNewClientName(inq.company);
      }
      setInitialMilestone("Sprint 1: Architecture Blueprint & Technical Setup");
    }
  };

  // Submit Action 1: Take Scope
  const handleTakeScopeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scopeName.trim()) {
      setErrorMsg("Please enter a project scope title.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/portal/projects/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "take-scope",
          name: scopeName.trim(),
          description: scopeDescription.trim(),
          clientId: clientMode === "existing" ? selectedClientId : undefined,
          clientEmail: clientMode === "new" ? newClientEmail.trim() : undefined,
          clientName: clientMode === "new" ? newClientName.trim() : undefined,
          inquiryId: selectedInquiryId || undefined,
          initialMilestone: initialMilestone.trim() || undefined,
          status: scopeStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to provision project scope.");
      }

      toast.success(data.message || `Scope "${scopeName}" provisioned successfully!`);
      onClose();
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Action 2: Update Existing Project
  const handleUpdateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateProjectId) {
      setErrorMsg("Please select a project to update.");
      return;
    }
    if (!updateMessage.trim() && !newProjectStatus && !newTaskTitle.trim() && !newMilestoneTitle.trim()) {
      setErrorMsg("Please provide an update note, status change, or new task deliverable.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/portal/projects/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-project",
          projectId: updateProjectId,
          message: updateMessage.trim(),
          newStatus: newProjectStatus || undefined,
          taskTitle: newTaskTitle.trim() || undefined,
          milestoneTitle: newMilestoneTitle.trim() || undefined,
          dueAt: targetDueDate || undefined,
          notifyClient,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to post project update.");
      }

      toast.success(data.message || "Project update recorded successfully!");
      onClose();
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Action 3: Send Invitation Email
  const handleSendInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setErrorMsg("Please enter a recipient email address.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/portal/projects/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-invite",
          email: inviteEmail.trim(),
          recipientName: inviteName.trim() || undefined,
          projectScopeTitle: inviteProjectTitle.trim() || undefined,
          customMessage: inviteCustomNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send invitation email.");
      }

      toast.success(data.message || `Scope invitation sent to ${inviteEmail}!`);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Action 4: Client Self-Service Scope Request
  const handleClientScopeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientMessage.trim() || clientMessage.trim().length < 10) {
      setErrorMsg("Please provide at least 10 characters describing your scope.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/portal/projects/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "client-scope",
          service: clientService,
          budget: clientBudget,
          message: clientMessage.trim(),
          company: clientCompany.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit project scope.");
      }

      toast.success(data.message || "Scope request submitted to Nova engineers!");
      onClose();
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const selectedProjectObj = projects.find((p) => p.id === updateProjectId);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--paper, #ffffff)",
          borderRadius: 24,
          maxWidth: 640,
          width: "100%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 28px 70px rgba(0, 0, 0, 0.35)",
          border: "1px solid var(--border-hairline)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-hairline-light, var(--line))",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--surface-raised, #faf9f6)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                color: "var(--brand-primary, #6366F1)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 2,
              }}
            >
              <Sparkles size={13} /> {isStaff ? "Engineering Operations" : "Client Portal"}
            </div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "var(--text-primary, #101322)",
                margin: 0,
                letterSpacing: "-0.03em",
              }}
            >
              {isStaff ? "Project Scope & Studio Actions" : "Request New Project Scope"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "var(--subtle-fill, rgba(0,0,0,0.05))",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted-crm, #727988)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Staff Segmented Navigation Tabs */}
        {isStaff && (
          <div
            style={{
              display: "flex",
              padding: "10px 20px",
              background: "var(--surface-raised, #faf9f6)",
              borderBottom: "1px solid var(--border-hairline-light, var(--line))",
              gap: 8,
              overflowX: "auto",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab("take-scope");
                setErrorMsg(null);
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: activeTab === "take-scope" ? 700 : 500,
                background: activeTab === "take-scope" ? "var(--ink-crm, #101322)" : "transparent",
                color: activeTab === "take-scope" ? "#ffffff" : "var(--text-secondary, #545b6d)",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              <FolderPlus size={14} />
              <span>1. Take / Provision Scope</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("update-project");
                setErrorMsg(null);
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: activeTab === "update-project" ? 700 : 500,
                background: activeTab === "update-project" ? "var(--ink-crm, #101322)" : "transparent",
                color: activeTab === "update-project" ? "#ffffff" : "var(--text-secondary, #545b6d)",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              <Edit3 size={14} />
              <span>2. Update Project</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("send-invite");
                setErrorMsg(null);
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: activeTab === "send-invite" ? 700 : 500,
                background: activeTab === "send-invite" ? "var(--ink-crm, #101322)" : "transparent",
                color: activeTab === "send-invite" ? "#ffffff" : "var(--text-secondary, #545b6d)",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              <Send size={14} />
              <span>3. Email Scope Link</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div style={{ padding: "22px 24px", overflowY: "auto", flex: 1 }}>
          {errorMsg && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#dc2626",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 18,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: TAKE / PROVISION NEW SCOPE (DEVELOPER / ADMIN)       */}
          {/* ============================================================ */}
          {isStaff && activeTab === "take-scope" && (
            <form onSubmit={handleTakeScopeSubmit} style={{ display: "grid", gap: 16 }}>
              {/* Optional Convert Existing Inquiry */}
              {inquiries.filter((i) => i.status !== "CONVERTED").length > 0 && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                    Convert Submitted Inquiry (Optional):
                  </label>
                  <select
                    value={selectedInquiryId}
                    onChange={(e) => handleSelectInquiry(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      fontSize: 13,
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  >
                    <option value="">-- Create Fresh Scope (No Inquiry) --</option>
                    {inquiries
                      .filter((i) => i.status !== "CONVERTED")
                      .map((inq) => (
                        <option key={inq.id} value={inq.id}>
                          {inq.service} &middot; {inq.company || inq.budget || "Client Lead"} ({new Date(inq.createdAt).toLocaleDateString()})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Scope Title */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                  Project Scope Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js 16 Web Application & Core APIs"
                  value={scopeName}
                  onChange={(e) => setScopeName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    fontSize: 13,
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
              </div>

              {/* Client Selection */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                    Client Assignment *
                  </label>
                  <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
                    <button
                      type="button"
                      onClick={() => setClientMode("existing")}
                      style={{
                        background: clientMode === "existing" ? "var(--ink-crm)" : "transparent",
                        color: clientMode === "existing" ? "#fff" : "var(--text-muted-crm)",
                        padding: "2px 8px",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Existing ({availableClients.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientMode("new")}
                      style={{
                        background: clientMode === "new" ? "var(--ink-crm)" : "transparent",
                        color: clientMode === "new" ? "#fff" : "var(--text-muted-crm)",
                        padding: "2px 8px",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      + New Client Email
                    </button>
                  </div>
                </div>

                {clientMode === "existing" && availableClients.length > 0 ? (
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      fontSize: 13,
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  >
                    {availableClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <input
                      type="text"
                      placeholder="Client Name (e.g. Acme Studio)"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid var(--border-hairline)",
                        background: "var(--surface-raised)",
                        fontSize: 13,
                        color: "var(--text-primary)",
                      }}
                    />
                    <input
                      type="email"
                      required={clientMode === "new"}
                      placeholder="Client Email (e.g. client@domain.com)"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid var(--border-hairline)",
                        background: "var(--surface-raised)",
                        fontSize: 13,
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Scope Description */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                  Technical Scope & Deliverables Details:
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline key deliverables, tech stack requirements, integration endpoints, and timeline targets..."
                  value={scopeDescription}
                  onChange={(e) => setScopeDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    fontSize: 13,
                    color: "var(--text-primary)",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Status and Initial Milestone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                    Initial Status
                  </label>
                  <select
                    value={scopeStatus}
                    onChange={(e) => setScopeStatus(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      fontSize: 13,
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="PLANNING">PLANNING (Scoping)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (Active)</option>
                    <option value="REVIEW">REVIEW (Staging)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                    Initial Milestone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sprint 1: Prototype Deliverable"
                    value={initialMilestone}
                    onChange={(e) => setInitialMilestone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      fontSize: 13,
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 99,
                    border: "1px solid var(--border-hairline)",
                    background: "transparent",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--text-primary)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "10px 22px",
                    borderRadius: 99,
                    border: "none",
                    background: "var(--ink-crm, #101322)",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  <span>Provision Project Scope &rarr;</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* TAB 2: UPDATE PRE-EXISTING PROJECT (DEVELOPER / ADMIN)       */}
          {/* ============================================================ */}
          {isStaff && activeTab === "update-project" && (
            <form onSubmit={handleUpdateProjectSubmit} style={{ display: "grid", gap: 16 }}>
              {/* Select Existing Project */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                  Select Pre-Existing Project Workspace *
                </label>
                {projects.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--text-muted-crm)" }}>
                    No projects found. Use Tab 1 to provision a new scope first.
                  </p>
                ) : (
                  <select
                    value={updateProjectId}
                    onChange={(e) => setUpdateProjectId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      fontSize: 13,
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} &middot; Status: {p.status} {p.client ? `(${p.client.name})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Progress Update Message */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                  Engineering Progress Note / Update Message:
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail sprint progress, code updates, staging links, or completed deliverables..."
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    fontSize: 13,
                    color: "var(--text-primary)",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Lifecycle Status & Add Task / Milestone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                    Advance Lifecycle Status
                  </label>
                  <select
                    value={newProjectStatus}
                    onChange={(e) => setNewProjectStatus(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      fontSize: 13,
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="">Keep Current Status ({selectedProjectObj?.status || "Current"})</option>
                    <option value="PLANNING">PLANNING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="REVIEW">REVIEW (Staging Ready)</option>
                    <option value="COMPLETED">COMPLETED (Passed QA)</option>
                    <option value="ON_HOLD">ON_HOLD</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                    Target Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={targetDueDate}
                    onChange={(e) => setTargetDueDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      fontSize: 13,
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                    + Add New Task (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Implement webhook handlers"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      fontSize: 13,
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                    + Add Milestone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Milestone 2: Beta Launch"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      fontSize: 13,
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              {/* Checkbox: Email Client */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-hairline-light)",
                }}
              >
                <input
                  type="checkbox"
                  id="notifyClient"
                  checked={notifyClient}
                  onChange={(e) => setNotifyClient(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "var(--brand-primary, #6366F1)" }}
                />
                <label htmlFor="notifyClient" style={{ fontSize: 13, color: "var(--text-primary)", cursor: "pointer" }}>
                  Notify client via transactional email with this progress update
                  {selectedProjectObj?.client?.email ? ` (${selectedProjectObj.client.email})` : ""}
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 99,
                    border: "1px solid var(--border-hairline)",
                    background: "transparent",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--text-primary)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || projects.length === 0}
                  style={{
                    padding: "10px 22px",
                    borderRadius: 99,
                    border: "none",
                    background: "var(--ink-crm, #101322)",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  <span>Post Project Update &rarr;</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* TAB 3: SEND SCOPE INVITATION EMAIL                          */}
          {/* ============================================================ */}
          {isStaff && activeTab === "send-invite" && (
            <form onSubmit={handleSendInviteSubmit} style={{ display: "grid", gap: 16 }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 14,
                  background: "rgba(99, 102, 241, 0.08)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                Send an official Nova invitation email containing a secure scope definition link. When the recipient submits their requirements, their scope will automatically surface in your pipeline.
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                  Recipient Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="client@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    fontSize: 13,
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                    Recipient / Client Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Connor"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      fontSize: 13,
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                    Scope Title / Focus (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. E-Commerce Redesign"
                    value={inviteProjectTitle}
                    onChange={(e) => setInviteProjectTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      fontSize: 13,
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                  Personal Note from Engineer (Optional):
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Hi Sarah, excited to collaborate! Please use this link to define your technical deliverables, target launch date, and integrations."
                  value={inviteCustomNote}
                  onChange={(e) => setInviteCustomNote(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    fontSize: 13,
                    color: "var(--text-primary)",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Delivery Preview */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-hairline-light)",
                  fontSize: 12,
                  color: "var(--text-muted-crm)",
                }}
              >
                <strong>Delivery Route:</strong> Direct via Hostinger SMTP (TLS 465) with sender <code>nova@allskyfares.com</code>.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 99,
                    border: "1px solid var(--border-hairline)",
                    background: "transparent",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--text-primary)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "10px 22px",
                    borderRadius: 99,
                    border: "none",
                    background: "var(--ink-crm, #101322)",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  <span>Dispatch Scope Email &rarr;</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* CLIENT SELF-SERVICE SCOPE SUBMISSION FORM                   */}
          {/* ============================================================ */}
          {!isStaff && (
            <form onSubmit={handleClientScopeSubmit} style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                  Service Needed *
                </label>
                <select
                  value={clientService}
                  onChange={(e) => setClientService(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    fontSize: 13,
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="Full-Stack Web Application">Full-Stack Web Application (Next.js & APIs)</option>
                  <option value="API & Backend Architecture">API &amp; Cloud Backend Architecture</option>
                  <option value="UI/UX & Design Systems">UI/UX &amp; High-Craft Design System</option>
                  <option value="Security & Code Audit">Security, MFA &amp; Authentication Audit</option>
                  <option value="Enterprise Retainer">Enterprise Technical Retainer</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                    Budget Scope
                  </label>
                  <select
                    value={clientBudget}
                    onChange={(e) => setClientBudget(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      fontSize: 13,
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="$5,000 – $15,000">$5,000 – $15,000</option>
                    <option value="$15,000 – $35,000">$15,000 – $35,000</option>
                    <option value="$35,000+">$35,000+ (Enterprise)</option>
                    <option value="Custom / Flexible">Custom / Flexible</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                    Company / Brand (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--surface-raised)",
                      fontSize: 13,
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                  Scope Description &amp; Technical Requirements *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your project goals, required integrations (e.g. Stripe, Discord), target launch timelines, and reference inspirations..."
                  value={clientMessage}
                  onChange={(e) => setClientMessage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    fontSize: 13,
                    color: "var(--text-primary)",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 99,
                    border: "1px solid var(--border-hairline)",
                    background: "transparent",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--text-primary)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "10px 22px",
                    borderRadius: 99,
                    border: "none",
                    background: "var(--ink-crm, #101322)",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  <span>Submit Project Scope &rarr;</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
