"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FolderPlus,
  Edit3,
  Send,
  Loader2,
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
  DollarSign,
  Receipt,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { PageHeader, SectionCard, StatTile } from "@/components/admin-ui";
import { useToast } from "@/components/toast";
import type { PortalProject, PortalInquiry } from "./client-portal-tracker";
import type { ClientOption } from "./scope-actions-modal";

export interface ScopeActionsPageProps {
  userRole?: string;
  currentUserId: string;
  projects: PortalProject[];
  inquiries: PortalInquiry[];
  availableClients?: ClientOption[];
  initialTab?: "take-scope" | "update-project" | "send-invite";
}

export function ScopeActionsPage({
  userRole = "DEVELOPER",
  currentUserId,
  projects,
  inquiries,
  availableClients = [],
  initialTab = "take-scope",
}: ScopeActionsPageProps) {
  const router = useRouter();
  const toast = useToast();

  const isFinance = userRole === "FINANCE";
  const isDeveloper = userRole === "DEVELOPER";
  const isAdmin = userRole === "ADMIN";
  const isStaff = isDeveloper || isAdmin || isFinance;

  // Active Tab for Staff
  const [activeTab, setActiveTab] = useState<"take-scope" | "update-project" | "send-invite">(
    initialTab
  );

  const currentFY = new Date().getFullYear().toString().slice(-2);

  // Tab 1: Take Scope Form States
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>("");
  const [scopeName, setScopeName] = useState<string>(
    isFinance ? `FY${currentFY} Commercial Retainer & Milestone Scope` : ""
  );
  const [scopeDescription, setScopeDescription] = useState<string>("");
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [selectedClientId, setSelectedClientId] = useState<string>(
    availableClients[0]?.id || ""
  );
  const [newClientEmail, setNewClientEmail] = useState<string>("");
  const [newClientName, setNewClientName] = useState<string>("");
  const [scopeStatus, setScopeStatus] = useState<string>("IN_PROGRESS");
  const [initialMilestone, setInitialMilestone] = useState<string>("");

  // Financial Scope Form States
  const [financeScopeType, setFinanceScopeType] = useState<string>("Milestone-Based Commercial Contract");
  const [financeBudget, setFinanceBudget] = useState<string>("$12,500");
  const [financePaymentTerms, setFinancePaymentTerms] = useState<string>("50% Advance Deposit / 50% Milestone Sign-off");
  const [financeAutoInvoice, setFinanceAutoInvoice] = useState<boolean>(true);

  // Tab 2: Update Project Form States
  const [updateProjectId, setUpdateProjectId] = useState<string>(
    projects[0]?.id || ""
  );
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [newProjectStatus, setNewProjectStatus] = useState<string>("");
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState<string>("");
  const [targetDueDate, setTargetDueDate] = useState<string>("");
  const [notifyClient, setNotifyClient] = useState<boolean>(true);

  // Tab 3: Send Invitation Form States
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteName, setInviteName] = useState<string>("");
  const [inviteProjectTitle, setInviteProjectTitle] = useState<string>("");
  const [inviteCustomNote, setInviteCustomNote] = useState<string>("");

  // Client Scope Form States
  const [clientService, setClientService] = useState<string>("Full-Stack Web Application");
  const [clientBudget, setClientBudget] = useState<string>("$5,000 – $15,000");
  const [clientMessage, setClientMessage] = useState<string>("");
  const [clientCompany, setClientCompany] = useState<string>("");

  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle when staff chooses an inquiry to convert into a scope
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

  // Submit Action 1: Take Scope / Provision Project
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
          initialMilestone:
            initialMilestone.trim() ||
            (isFinance ? "Milestone 1: Commercial Deposit & Scope Validation (50%)" : undefined),
          status: scopeStatus,
          scopeCategory: isFinance ? "FINANCE" : "ENGINEERING",
          budget: isFinance ? financeBudget : undefined,
          paymentTerms: isFinance ? financePaymentTerms : undefined,
          autoInvoice: isFinance ? financeAutoInvoice : false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to provision project scope.");
      }

      toast.success(data.message || `Scope provisioned: ${data.project?.name}`);
      router.push("/portal/projects");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred while creating scope.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Action 2: Update Existing Project
  const handleUpdateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateProjectId) {
      setErrorMsg("Please select a target project to update.");
      return;
    }
    if (!updateMessage.trim() && !newTaskTitle.trim() && !newMilestoneTitle.trim() && !newProjectStatus) {
      setErrorMsg("Please provide at least one update (note, new task, milestone, or status).");
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
          updateMessage: updateMessage.trim() || undefined,
          newStatus: newProjectStatus || undefined,
          newTaskTitle: newTaskTitle.trim() || undefined,
          newMilestoneTitle: newMilestoneTitle.trim() || undefined,
          dueDate: targetDueDate || undefined,
          notifyClient,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to post scope update.");
      }

      toast.success(data.message || "Project scope update dispatched successfully.");
      router.push("/portal/projects");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update project.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Action 3: Send Client Invitation Email
  const handleSendInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setErrorMsg("Please enter a valid recipient client email.");
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
          name: inviteName.trim() || undefined,
          projectTitle: inviteProjectTitle.trim() || undefined,
          customNote: inviteCustomNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch invitation email.");
      }

      toast.success(data.message || "Invitation sent successfully.");
      setInviteEmail("");
      setInviteName("");
      setInviteProjectTitle("");
      setInviteCustomNote("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send email invite.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Action 4: Client Scope Request
  const handleClientScopeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientMessage.trim()) {
      setErrorMsg("Please describe your project scope & requirements.");
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
          company: clientCompany.trim() || undefined,
          message: clientMessage.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit project scope.");
      }

      toast.success(data.message || "Scope request submitted! Our engineering team will review it shortly.");
      router.push("/portal/projects");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit scope request.");
    } finally {
      setLoading(false);
    }
  };

  const backUrl = isFinance ? "/finance" : isDeveloper ? "/developer" : isAdmin ? "/admin" : "/portal/projects";

  return (
    <div className="animate-fade-in-up" style={{ width: "100%", maxWidth: 1040, margin: "0 auto" }}>
      {/* Page Header */}
      <PageHeader
        titleLine1={isFinance ? "Financial" : isDeveloper ? "Engineering" : isAdmin ? "Project" : "Request"}
        titleLine2="Scope Intake"
        backHref={backUrl}
        stats={[
          {
            icon: <FolderPlus size={18} strokeWidth={1.8} />,
            value: projects.length,
            badgeLabel: "Workspaces",
            badgeVariant: "brand",
            caption: "Active client projects",
          },
          {
            icon: <FileText size={18} strokeWidth={1.8} />,
            value: inquiries.length,
            badgeLabel: "Inquiries",
            badgeVariant: "info",
            caption: "In CRM pipeline",
          },
          {
            icon: <Sparkles size={18} strokeWidth={1.8} />,
            value: isStaff ? userRole : "Client",
            badgeLabel: "Full-Page Mode",
            badgeVariant: "success",
            caption: "No modal popup constraints",
          },
        ]}
      />

      {/* Main Form Container Card */}
      <div
        style={{
          background: "var(--surface-raised, #FFFFFF)",
          border: "1px solid var(--border-hairline)",
          borderRadius: 24,
          padding: "32px 36px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
          marginTop: 8,
        }}
      >
        {/* Error Alert Box */}
        {errorMsg && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#EF4444",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              marginBottom: 24,
            }}
          >
            <AlertCircle size={18} flex-shrink={0} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Staff Mode: 3-Tab Pill Switcher */}
        {isStaff ? (
          <div>
            <div
              style={{
                display: "flex",
                gap: 8,
                background: "var(--paper, rgba(0,0,0,0.04))",
                padding: 4,
                borderRadius: 14,
                marginBottom: 28,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => { setActiveTab("take-scope"); setErrorMsg(null); }}
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: activeTab === "take-scope" ? "var(--ink-crm, #101322)" : "transparent",
                  color: activeTab === "take-scope" ? "#FFFFFF" : "var(--text-muted-crm)",
                  fontSize: 13,
                  fontWeight: activeTab === "take-scope" ? 700 : 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.15s ease",
                }}
              >
                <FolderPlus size={15} />
                <span>+ Take / Provision Scope</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("update-project"); setErrorMsg(null); }}
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: activeTab === "update-project" ? "var(--ink-crm, #101322)" : "transparent",
                  color: activeTab === "update-project" ? "#FFFFFF" : "var(--text-muted-crm)",
                  fontSize: 13,
                  fontWeight: activeTab === "update-project" ? 700 : 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.15s ease",
                }}
              >
                <Edit3 size={15} />
                <span>Update Existing Project</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("send-invite"); setErrorMsg(null); }}
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: activeTab === "send-invite" ? "var(--ink-crm, #101322)" : "transparent",
                  color: activeTab === "send-invite" ? "#FFFFFF" : "var(--text-muted-crm)",
                  fontSize: 13,
                  fontWeight: activeTab === "send-invite" ? 700 : 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.15s ease",
                }}
              >
                <Send size={15} />
                <span>Send Client Invitation Link</span>
              </button>
            </div>

            {/* TAB 1: Take Scope Form */}
            {activeTab === "take-scope" && (
              <form onSubmit={handleTakeScopeSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {inquiries.length > 0 && (
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                      Convert from Inbound Inquiry (Optional)
                    </label>
                    <select
                      value={selectedInquiryId}
                      onChange={(e) => handleSelectInquiry(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: 12,
                        border: "1px solid var(--border-hairline)",
                        background: "var(--card-bg-crm, #FFFFFF)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                      }}
                    >
                      <option value="">-- Choose an inbound inquiry or start empty --</option>
                      {inquiries.map((inq) => (
                        <option key={inq.id} value={inq.id}>
                          {inq.name} ({inq.email}) &middot; {inq.service} &middot; {inq.budget || "Budget Unspecified"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                    Project Scope Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next-Gen Enterprise CRM & Billing Architecture"
                    value={scopeName}
                    onChange={(e) => setScopeName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--card-bg-crm, #FFFFFF)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                    Technical Blueprint & Scope Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Specify target deliverables, technical stack requirements, architecture boundaries, and QA criteria..."
                    value={scopeDescription}
                    onChange={(e) => setScopeDescription(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--card-bg-crm, #FFFFFF)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                {/* Client Allocation Selection */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
                    Client Allocation
                  </label>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="clientMode"
                        checked={clientMode === "existing"}
                        onChange={() => setClientMode("existing")}
                      />
                      <span>Select Existing Client Account</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="clientMode"
                        checked={clientMode === "new"}
                        onChange={() => setClientMode("new")}
                      />
                      <span>Provision New Client Account</span>
                    </label>
                  </div>

                  {clientMode === "existing" ? (
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: 12,
                        border: "1px solid var(--border-hairline)",
                        background: "var(--card-bg-crm, #FFFFFF)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                      }}
                    >
                      {availableClients.length > 0 ? (
                        availableClients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} &middot; {c.email}
                          </option>
                        ))
                      ) : (
                        <option value="">No existing clients found</option>
                      )}
                    </select>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <input
                        type="email"
                        required
                        placeholder="Client Email (e.g. client@company.com)"
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: 12,
                          border: "1px solid var(--border-hairline)",
                          background: "var(--card-bg-crm, #FFFFFF)",
                          color: "var(--text-primary)",
                          fontSize: 13,
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Company or Contact Name"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: 12,
                          border: "1px solid var(--border-hairline)",
                          background: "var(--card-bg-crm, #FFFFFF)",
                          color: "var(--text-primary)",
                          fontSize: 13,
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Initial Milestone */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                    Initial Sprint Milestone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Milestone 1: Production Infrastructure & API Contracts"
                    value={initialMilestone}
                    onChange={(e) => setInitialMilestone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--card-bg-crm, #FFFFFF)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Submit Row */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                  <Link
                    href={backUrl}
                    className="button button-outline"
                    style={{ padding: "11px 20px", fontSize: 13, borderRadius: 12 }}
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="button"
                    style={{
                      padding: "11px 24px",
                      borderRadius: 12,
                      background: "var(--ink-crm, #101322)",
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: 700,
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <FolderPlus size={16} />}
                    <span>{loading ? "Provisioning Scope..." : "Provision Scope & Allocate Workspace"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Update Project Form */}
            {activeTab === "update-project" && (
              <form onSubmit={handleUpdateProjectSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                    Select Target Project *
                  </label>
                  <select
                    required
                    value={updateProjectId}
                    onChange={(e) => setUpdateProjectId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--card-bg-crm, #FFFFFF)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                    Scope Progress Update / Engineering Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief summary of work completed, blockers resolved, or upcoming implementation target..."
                    value={updateMessage}
                    onChange={(e) => setUpdateMessage(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--card-bg-crm, #FFFFFF)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                      Add Deliverable Task
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Implement webhook retry mechanism"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: 12,
                        border: "1px solid var(--border-hairline)",
                        background: "var(--card-bg-crm, #FFFFFF)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                      Target Due Date
                    </label>
                    <input
                      type="date"
                      value={targetDueDate}
                      onChange={(e) => setTargetDueDate(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: 12,
                        border: "1px solid var(--border-hairline)",
                        background: "var(--card-bg-crm, #FFFFFF)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                  <Link
                    href={backUrl}
                    className="button button-outline"
                    style={{ padding: "11px 20px", fontSize: 13, borderRadius: 12 }}
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="button"
                    style={{
                      padding: "11px 24px",
                      borderRadius: 12,
                      background: "var(--ink-crm, #101322)",
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: 700,
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Edit3 size={16} />}
                    <span>{loading ? "Updating Project..." : "Post Scope Update"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: Send Invitation Form */}
            {activeTab === "send-invite" && (
              <form onSubmit={handleSendInviteSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                      Client Recipient Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="client@enterprise.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: 12,
                        border: "1px solid var(--border-hairline)",
                        background: "var(--card-bg-crm, #FFFFFF)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                      Contact Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Connor"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: 12,
                        border: "1px solid var(--border-hairline)",
                        background: "var(--card-bg-crm, #FFFFFF)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                    Proposed Project Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Custom Multi-Tenant Logistics System"
                    value={inviteProjectTitle}
                    onChange={(e) => setInviteProjectTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--card-bg-crm, #FFFFFF)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                    Custom Welcome Note
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Add a personalized message outlining the proposal, initial call takeaways, or onboarding instructions..."
                    value={inviteCustomNote}
                    onChange={(e) => setInviteCustomNote(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--card-bg-crm, #FFFFFF)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                  <Link
                    href={backUrl}
                    className="button button-outline"
                    style={{ padding: "11px 20px", fontSize: 13, borderRadius: 12 }}
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="button"
                    style={{
                      padding: "11px 24px",
                      borderRadius: 12,
                      background: "var(--ink-crm, #101322)",
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: 700,
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    <span>{loading ? "Dispatching Email..." : "Send Invitation & Scope Link"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Client Mode: Dedicated Full-Page Scope Intake Form */
          <form onSubmit={handleClientScopeSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                Service Category *
              </label>
              <select
                value={clientService}
                onChange={(e) => setClientService(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--card-bg-crm, #FFFFFF)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none",
                }}
              >
                <option value="Full-Stack Web Application">Full-Stack Web Application</option>
                <option value="Mobile App (iOS & Android)">Mobile App (iOS &amp; Android)</option>
                <option value="Enterprise Dashboard & Analytics">Enterprise Dashboard &amp; Analytics</option>
                <option value="Cloud Infrastructure & DevOps">Cloud Infrastructure &amp; DevOps</option>
                <option value="API Integration & Architecture">API Integration &amp; Architecture</option>
                <option value="UI/UX Redesign & Modernization">UI/UX Redesign &amp; Modernization</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                  Budget Expectations
                </label>
                <select
                  value={clientBudget}
                  onChange={(e) => setClientBudget(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--card-bg-crm, #FFFFFF)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                  }}
                >
                  <option value="Under $5,000">Under $5,000</option>
                  <option value="$5,000 – $15,000">$5,000 – $15,000</option>
                  <option value="$15,000 – $30,000">$15,000 – $30,000</option>
                  <option value="$30,000+">$30,000+</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--card-bg-crm, #FFFFFF)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                Project Deliverables &amp; Requirements *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Describe what you want to build, user workflows, target timelines, benchmarks, and key deliverables..."
                value={clientMessage}
                onChange={(e) => setClientMessage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--card-bg-crm, #FFFFFF)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
              <Link
                href="/portal/projects"
                className="button button-outline"
                style={{ padding: "11px 20px", fontSize: 13, borderRadius: 12 }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="button"
                style={{
                  padding: "11px 24px",
                  borderRadius: 12,
                  background: "var(--ink-crm, #101322)",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                <span>{loading ? "Submitting Request..." : "Submit Project Scope Request"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
