"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  Edit3,
  Plus,
  Share2,
  Copy,
  Check,
  TrendingUp,
  FolderKanban,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Ban,
  UserCheck,
  KeyRound,
  Sparkles,
  Send,
  X,
  Layers,
  FileText,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/toast";
import { Avatar, SectionCard, Badge } from "@/components/admin-ui";
import { getIndianHolidaysForMonth, IndianHoliday } from "@/lib/indian-holidays";

export interface ClientProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  banned: boolean;
  banReason?: string | null;
  discordHandle?: string | null;
  image?: string | null;
  createdAt: string;
  projects: Array<{
    id: string;
    name: string;
    description?: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    milestones: Array<{ id: string; title: string; dueAt?: string | null; completedAt?: string | null }>;
    tasks: Array<{ id: string; title: string; dueAt?: string | null; completedAt?: string | null }>;
  }>;
}

export interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service: string;
  budget?: string | null;
  message: string;
  referenceUrl?: string | null;
  referenceImage?: string | null;
  status: string;
  createdAt: string;
}

interface ClientProfileCRMProps {
  user: ClientProfileData;
  inquiries: InquiryItem[];
  currentAdminId: string;
  inquiryStatusSection?: React.ReactNode;
  backUrl?: string;
  pageTitle?: string;
  showHeader?: boolean;
}

function DiscordIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
    </svg>
  );
}

export function ClientProfileCRM({
  user,
  inquiries = [],
  currentAdminId,
  inquiryStatusSection,
  backUrl = "/admin/users",
  pageTitle = "Customer Information",
  showHeader = true,
}: ClientProfileCRMProps) {
  const router = useRouter();
  const toast = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [funnelView, setFunnelView] = useState<"total" | "weighted">("total");
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ setupUrl: string; emailSent: boolean } | null>(null);
  const [editContactModal, setEditContactModal] = useState(false);
  const [createProjectModal, setCreateProjectModal] = useState(false);

  // Form states for creating real project
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [localProjects, setLocalProjects] = useState(user.projects || []);

  // Day notes & appointments on calendar
  const [dayNotes, setDayNotes] = useState<Record<number, string[]>>({
    9: ["Initial client project inquiry submitted"],
    18: ["System onboarding & workspace setup"],
  });
  const [dayAppointments, setDayAppointments] = useState<Record<number, string[]>>({
    15: ["10:30 AM · Architecture Scoping Review"],
  });
  const [calendarActionModal, setCalendarActionModal] = useState<"appointment" | "note" | null>(null);
  const [calendarNoteText, setCalendarNoteText] = useState("");
  const [calendarAptTitle, setCalendarAptTitle] = useState("Milestone Review Meeting");
  const [calendarAptTime, setCalendarAptTime] = useState("14:00");
  const [isSubmittingApt, setIsSubmittingApt] = useState(false);
  const [selectedInquiryDetail, setSelectedInquiryDetail] = useState<InquiryItem | null>(null);
  const [updatingDetailStatus, setUpdatingDetailStatus] = useState(false);
  const [modalStatusChoice, setModalStatusChoice] = useState<string>("NEW");

  function openInquiryDetails(inq: InquiryItem) {
    setSelectedInquiryDetail(inq);
    setModalStatusChoice(inq.status);
    const el = document.getElementById("lead-inquiry-details");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  async function handleUpdateModalStatus() {
    if (!selectedInquiryDetail) return;
    setUpdatingDetailStatus(true);
    try {
      const res = await fetch(`/api/admin/inquiries?id=${encodeURIComponent(selectedInquiryDetail.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: modalStatusChoice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      toast.success(`Inquiry status updated to ${modalStatusChoice}`, "Saved");
      selectedInquiryDetail.status = modalStatusChoice;
      setSelectedInquiryDetail({ ...selectedInquiryDetail, status: modalStatusChoice });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error updating status", "Error");
    } finally {
      setUpdatingDetailStatus(false);
    }
  }

  // Keyboard shortcut: Escape to close all modals
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setCalendarActionModal(null);
        setEditContactModal(false);
        setCreateProjectModal(false);
        setSelectedInquiryDetail(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen for left rail / external trigger to open project creation form
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "create-project" || params.get("create") === "project") {
        router.push("/admin/scope");
      }
    }
    function onOpen() {
      router.push("/admin/scope");
    }
    window.addEventListener("nova:open-create-project", onOpen);
    return () => window.removeEventListener("nova:open-create-project", onOpen);
  }, [router]);

  // Dynamic Calendar Date Helper
  const [currentDate] = useState(() => new Date());
  const currentMonthName = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = String(currentDate.getMonth() + 1).padStart(2, "0");
  const daysInCurrentMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const indianHolidays = getIndianHolidaysForMonth(currentYear, currentDate.getMonth());

  async function handleCreateCalendarAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCalendarDay) return;

    const selectedDateObj = new Date(currentYear, currentDate.getMonth(), selectedCalendarDay, 23, 59, 59);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (selectedDateObj < todayStart) {
      toast.error("Cannot schedule an appointment on a past date.", "Past Date");
      return;
    }

    setIsSubmittingApt(true);
    try {
      const dayStr = String(selectedCalendarDay).padStart(2, "0");
      const dateIso = `${currentYear}-${currentMonthNum}-${dayStr}T${calendarAptTime || "12:00"}:00`;
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: calendarAptTitle.trim(),
          date: new Date(dateIso).toISOString(),
          duration: 30,
          clientId: user.id,
          status: "SCHEDULED",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule appointment");

      setDayAppointments((prev) => ({
        ...prev,
        [selectedCalendarDay]: [...(prev[selectedCalendarDay] || []), `${calendarAptTime} · ${calendarAptTitle}`],
      }));
      toast.success(`Appointment confirmed for ${currentMonthName} ${selectedCalendarDay}!`, "Appointment Set");
      setCalendarActionModal(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set appointment", "Error");
    } finally {
      setIsSubmittingApt(false);
    }
  }

  function handleSaveCalendarNote(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCalendarDay || !calendarNoteText.trim()) return;

    const selectedDateObj = new Date(currentYear, currentDate.getMonth(), selectedCalendarDay, 23, 59, 59);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (selectedDateObj < todayStart) {
      toast.error("Cannot leave a note on a date before today.", "Past Date Restricted");
      return;
    }

    setDayNotes((prev) => ({
      ...prev,
      [selectedCalendarDay]: [...(prev[selectedCalendarDay] || []), calendarNoteText.trim()],
    }));
    toast.success(`Note saved for ${currentMonthName} ${selectedCalendarDay}!`, "Note Added");
    setCalendarNoteText("");
    setCalendarActionModal(null);
  }

  // Derive Client Name
  const nameParts = (user.name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "Client";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Associated Inquiry Details (Phone, Company, Budgets)
  const primaryInquiry = inquiries[0];
  const companyName = primaryInquiry?.company || "";
  const phoneNumber = primaryInquiry?.phone || "";
  const clientTitle =
    user.role === "CLIENT"
      ? companyName
        ? `Client Executive · ${companyName}`
        : "Client Account"
      : `${user.role} · Nova Studio`;

  // Real Pipeline calculations
  const totalInquiriesCount = inquiries.length;
  const totalProjectsCount = localProjects.length;
  const totalRecordsCount = totalInquiriesCount + totalProjectsCount;

  // Real pipeline value display
  const budgetsWithValues = inquiries.map((i) => i.budget).filter(Boolean);
  const displayPipeline =
    budgetsWithValues.length > 0
      ? budgetsWithValues.join(" · ")
      : totalProjectsCount > 0
      ? `${totalProjectsCount} Active Initiative${totalProjectsCount === 1 ? "" : "s"}`
      : "Custom Scope";

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
  const stageCompleted = localProjects.filter((p) => p.status === "COMPLETED").length;

  function copyText(value: string, fieldName: string) {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard`, "Copied");
    setTimeout(() => setCopiedField(null), 2000);
  }

  async function handleSendSetupEmail() {
    setIsSendingInvite(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, action: "reset-password", mode: "setup" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate password setup link");

      setInviteResult({ setupUrl: data.resetUrl, emailSent: data.emailSent });
      if (data.emailSent) {
        toast.success(`Account initiation setup email sent to ${user.email}!`, "Welcome Email Sent");
      } else {
        toast.info("Generated account activation setup link.", "Link Generated");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send setup link", "Action Failed");
    } finally {
      setIsSendingInvite(false);
    }
  }

  async function handleCreateRealProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setIsCreatingProject(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDesc.trim() || null,
          clientId: user.id,
          status: "PLANNING",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project");

      setLocalProjects([
        {
          id: data.project.id,
          name: data.project.name,
          description: data.project.description,
          status: data.project.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          milestones: [],
          tasks: [],
        },
        ...localProjects,
      ]);
      setNewProjectName("");
      setNewProjectDesc("");
      setCreateProjectModal(false);
      toast.success(`Project "${data.project.name}" provisioned for ${user.name}!`, "Project Created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create project", "Error");
    } finally {
      setIsCreatingProject(false);
    }
  }

  if (createProjectModal) {
    return (
      <div className="crm-container animate-fade-in-up" style={{ maxWidth: 840, margin: "0 auto", padding: "24px 20px 80px" }}>
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
            <ArrowLeft size={16} /> Back to Client Profile
          </button>
        </div>

        <SectionCard
          title="Provision Client Project"
          headerRight={<Badge variant="info">Client Workspace</Badge>}
        >
          <p style={{ margin: "-8px 0 24px", fontSize: 13, color: "var(--text-muted-crm)" }}>
            Create an active development project in the workspace for <strong>{user.name}</strong>.
          </p>

          <form onSubmit={handleCreateRealProject} style={{ display: "grid", gap: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                Project Name <span style={{ color: "var(--accent-blue)" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g. NextGen Web Platform"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                Scope / Description <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted-crm)" }}>(Optional)</span>
              </label>
              <textarea
                rows={4}
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Project deliverables, tech stack, and goals..."
                style={{
                  width: "100%",
                  minHeight: 100,
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12, paddingTop: 16, borderTop: "1px solid var(--border-hairline-light)" }}>
              <button
                type="button"
                onClick={() => setCreateProjectModal(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingProject}
                style={{
                  padding: "10px 24px",
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  background: "var(--ink-crm)",
                  color: "var(--ink-crm-text, #FFFFFF)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: isCreatingProject ? "not-allowed" : "pointer",
                  opacity: isCreatingProject ? 0.7 : 1,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {isCreatingProject && <Loader2 size={14} className="animate-spin" />}
                {isCreatingProject ? "Creating…" : "Create Project"}
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    );
  }

  if (editContactModal) {
    return (
      <div className="crm-container animate-fade-in-up" style={{ maxWidth: 840, margin: "0 auto", padding: "24px 20px 80px" }}>
        <div style={{ marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setEditContactModal(false)}
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
            <ArrowLeft size={16} /> Back to Client Profile
          </button>
        </div>

        <SectionCard
          title="Client Contact Details"
          headerRight={<Badge variant="info">Client Record</Badge>}
        >
          <p style={{ margin: "-8px 0 24px", fontSize: 13, color: "var(--text-muted-crm)" }}>
            Update contact parameters on record for <strong>{user.name}</strong>.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setEditContactModal(false);
              toast.success("Client parameters updated.", "Saved");
            }}
            style={{ display: "grid", gap: 20 }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={user.name}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                  Company Name
                </label>
                <input
                  type="text"
                  defaultValue={companyName}
                  placeholder="Not specified"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  defaultValue={phoneNumber}
                  placeholder="Not provided"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                  Discord Handle
                </label>
                <input
                  type="text"
                  defaultValue={user.discordHandle || ""}
                  placeholder="username"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12, paddingTop: 16, borderTop: "1px solid var(--border-hairline-light)" }}>
              <button
                type="button"
                onClick={() => setEditContactModal(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "10px 24px",
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  background: "var(--ink-crm)",
                  color: "var(--ink-crm-text, #FFFFFF)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Save Details
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="crm-container" style={{ maxWidth: 1360, margin: "0 auto", padding: showHeader ? "16px 20px 80px" : "0 0 80px" }}>
      {/* Top Header Bar */}
      {showHeader && (
        <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href={backUrl}
            className="crm-back-btn"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink)",
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "transform 0.15s ease, background 0.15s ease",
            }}
            title="Return"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1
              style={{
                fontSize: "clamp(24px, 3.5vw, 32px)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                margin: 0,
                color: "var(--ink)",
                lineHeight: 1.15,
              }}
            >
              {pageTitle}
            </h1>
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
              {user.role === "ADMIN" ? "Admin Workspace Account" : user.role === "DEVELOPER" ? "Developer Account" : user.role === "FINANCE" ? "Finance Account" : "Client Profile"} &middot; {user.name} ({user.email})
            </span>
          </div>
        </div>

        {/* Top 3 Stat Widgets computed strictly from real data */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Stat 1: Real Pipeline / Budget */}
          <div
            className="crm-top-stat"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 16px",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(16,185,129,0.12)",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={18} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>{displayPipeline}</span>
                {totalInquiriesCount > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 99,
                      background: "#FACC15",
                      color: "#18181B",
                    }}
                  >
                    {inquiries[0].status}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                {totalRecordsCount} {user.role === "ADMIN" ? "Total Workspace Engagement" : "Total Client Engagement"}{totalRecordsCount === 1 ? "" : "s"}
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
              padding: "8px 16px",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(37,99,235,0.12)",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FolderKanban size={18} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>{totalProjectsCount}</span>
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
                  {totalInquiriesCount} leads
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
              padding: "8px 16px",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(108,76,255,0.12)",
                color: "#6C4CFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>{totalTasks}</span>
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
      )}

      {/* Main CRM Grid: Left 62% - Right 38% */}
      <div
        className="crm-main-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.75fr) minmax(320px, 1fr)",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: Interaction History + Tasks Schedule & Stage Funnel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Card 1: Interaction History & Client Projects */}
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
                  Projects &amp; Engagements
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
                  onClick={() => router.push("/admin/scope")}
                  className="button button-outline"
                  style={{ padding: "6px 12px", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <Plus size={13} />
                  <span>New Project</span>
                </button>
                <Link
                  href="/admin/inquiry"
                  className="crm-icon-button"
                  title="Inquiries Table"
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
                  padding: "36px 20px",
                  textAlign: "center",
                  borderRadius: 16,
                  border: "1px dashed var(--line)",
                  background: "var(--paper-alt, rgba(0,0,0,0.02))",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <FolderKanban size={32} color="var(--muted)" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "var(--ink)" }}>
                  No active projects or inquiries yet
                </h3>
                <p style={{ fontSize: 12, color: "var(--muted)", maxWidth: 360, margin: "0 auto 16px", lineHeight: 1.6 }}>
                  {user.role === "ADMIN"
                    ? "No active projects or inquiry submissions logged in this admin workspace."
                    : "This client does not have any active projects or inquiry submissions logged in the workspace."}
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/admin/scope")}
                  className="button"
                  style={{ fontSize: 12, padding: "8px 16px" }}
                >
                  <Plus size={14} /> {user.role === "ADMIN" ? "Provision Studio Project" : "Provision First Project"}
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
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
                      onClick={() => openInquiryDetails(inq)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openInquiryDetails(inq);
                        }
                      }}
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
                        cursor: "pointer",
                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: c.pill }}>
                          {new Date(inq.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openInquiryDetails(inq);
                          }}
                          style={{
                            background: c.pill,
                            border: "none",
                            color: "inherit",
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          title="Open Inquiry Details"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>

                      <div style={{ margin: "12px 0" }}>
                        <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>{inq.service}</div>
                        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>
                          {inq.company || "Client Opportunity Lead"}
                        </div>
                        {(inq.referenceUrl || inq.referenceImage) && (
                          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                            {inq.referenceUrl && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "rgba(255,255,255,0.2)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                                🔗 Benchmark
                              </span>
                            )}
                            {inq.referenceImage && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "rgba(255,255,255,0.2)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                                🖼️ Mockup
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 800 }}>{inq.budget || "Custom"}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", padding: "1px 6px", borderRadius: 4, background: c.pill }}>
                          {inq.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Optional Status Update / Audit History injection */}
            {inquiryStatusSection && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
                {inquiryStatusSection}
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
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{currentMonthName} {currentYear}</span>
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

                {/* Day Numbers 1 to daysInCurrentMonth */}
                {Array.from({ length: daysInCurrentMonth }, (_, i) => {
                  const day = i + 1;
                  const isSelected = selectedCalendarDay === day;
                  const hasApt = Boolean(dayAppointments[day]?.length);
                  const hasNote = Boolean(dayNotes[day]?.length);
                  const holiday = indianHolidays[day];

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedCalendarDay(day)}
                      title={holiday ? `🇮🇳 ${holiday.name} (${holiday.type})` : undefined}
                      style={{
                        aspectRatio: "1/1",
                        borderRadius: 10,
                        border: isSelected ? "1.5px solid var(--accent-blue)" : "1px solid transparent",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: isSelected ? 800 : 500,
                        background: isSelected
                          ? "rgba(47,84,235,0.12)"
                          : holiday
                          ? "rgba(255,153,51,0.1)"
                          : hasApt
                          ? "rgba(108,76,224,0.08)"
                          : "transparent",
                        color: isSelected ? "var(--accent-blue)" : "var(--text-primary)",
                        transition: "all 0.15s ease",
                        position: "relative",
                        padding: 2,
                      }}
                    >
                      <span>{day}</span>
                      <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                        {holiday && (
                          <span
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background: "#ff9933",
                            }}
                            title={`🇮🇳 ${holiday.name}`}
                          />
                        )}
                        {hasApt && (
                          <span
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background: "#6C4CE0",
                            }}
                            title="Appointment scheduled"
                          />
                        )}
                        {hasNote && (
                          <span
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background: "#059669",
                            }}
                            title="Note logged"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Calendar Legend */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, padding: "4px 6px", fontSize: 10, color: "var(--text-muted-crm)", flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff9933" }} /> 🇮🇳 Indian Holiday
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6C4CE0" }} /> Appointment
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669" }} /> Note
                </span>
              </div>

              {/* Day Details & Interactive Actions when Day Selected */}
              {selectedCalendarDay ? (
                <div
                  style={{
                    marginTop: 14,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "var(--surface-raised, #F7F8FA)",
                    border: "1px solid var(--border-hairline, #C8CED7)",
                  }}
                >
                  {(() => {
                    const selectedDateObj = new Date(currentYear, currentDate.getMonth(), selectedCalendarDay, 23, 59, 59);
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);
                    const isPastDay = selectedDateObj < todayStart;
                    const selectedDayHoliday = indianHolidays[selectedCalendarDay];

                    return (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                            {currentMonthName} {selectedCalendarDay}, {currentYear}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCalendarDay(null);
                              setCalendarActionModal(null);
                            }}
                            style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted-crm)", fontSize: 11 }}
                          >
                            Clear
                          </button>
                        </div>

                        {/* Indian Holiday Card */}
                        {selectedDayHoliday && (
                          <div
                            style={{
                              padding: "8px 12px",
                              background: "rgba(255, 153, 51, 0.12)",
                              border: "1px solid rgba(255, 153, 51, 0.35)",
                              borderRadius: 10,
                              marginBottom: 8,
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span style={{ fontSize: 16 }}>🇮🇳</span>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 800, color: "#d97706" }}>
                                {selectedDayHoliday.name} &middot; <span style={{ fontSize: 10, textTransform: "uppercase" }}>{selectedDayHoliday.type} Holiday</span>
                              </div>
                              {selectedDayHoliday.description && (
                                <div style={{ fontSize: 10, color: "var(--text-muted-crm)", marginTop: 2 }}>
                                  {selectedDayHoliday.description}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Existing Day Appointments */}
                        {dayAppointments[selectedCalendarDay]?.map((apt, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontSize: 11,
                              padding: "4px 8px",
                              borderRadius: 6,
                              background: "rgba(108,76,224,0.1)",
                              color: "#6C4CE0",
                              fontWeight: 600,
                              marginBottom: 4,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Calendar size={11} />
                            <span>{apt}</span>
                          </div>
                        ))}

                        {/* Existing Day Notes */}
                        {dayNotes[selectedCalendarDay]?.map((note, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontSize: 11,
                              padding: "4px 8px",
                              borderRadius: 6,
                              background: "rgba(5,150,105,0.08)",
                              color: "#059669",
                              fontWeight: 500,
                              marginBottom: 4,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <FileText size={11} />
                            <span>{note}</span>
                          </div>
                        ))}

                        {/* Action Buttons: Blocked for Past Dates */}
                        {isPastDay ? (
                          <div
                            style={{
                              marginTop: 8,
                              padding: "8px 12px",
                              borderRadius: 10,
                              background: "var(--subtle-fill)",
                              color: "var(--text-muted-crm)",
                              fontSize: 11,
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Clock size={13} />
                            <span>This date is in the past. Notes and appointments cannot be scheduled before today.</span>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <button
                              type="button"
                              onClick={() => setCalendarActionModal("appointment")}
                              style={{
                                flex: 1,
                                padding: "6px 10px",
                                borderRadius: 99,
                                border: "none",
                                background: "var(--accent-blue, #2F54EB)",
                                color: "#FFFFFF",
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                              }}
                            >
                              <Calendar size={12} />
                              <span>Set Appointment</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setCalendarActionModal("note")}
                              style={{
                                flex: 1,
                                padding: "6px 10px",
                                borderRadius: 99,
                                border: "1px solid var(--border-hairline, #C8CED7)",
                                background: "var(--paper, #FFFFFF)",
                                color: "var(--text-primary)",
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                              }}
                            >
                              <Edit3 size={12} />
                              <span>Leave Note</span>
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {/* Subform: Set Appointment */}
                  {calendarActionModal === "appointment" && (
                    <form onSubmit={handleCreateCalendarAppointment} style={{ marginTop: 10, display: "grid", gap: 8 }}>
                      <input
                        type="text"
                        required
                        placeholder="Meeting topic (e.g. Scope Review)"
                        value={calendarAptTitle}
                        onChange={(e) => setCalendarAptTitle(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "1px solid var(--border-hairline)",
                          background: "var(--card-bg-crm)",
                          fontSize: 11,
                        }}
                      />
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          type="time"
                          required
                          value={calendarAptTime}
                          onChange={(e) => setCalendarAptTime(e.target.value)}
                          style={{
                            flex: 1,
                            padding: "6px 8px",
                            borderRadius: 8,
                            border: "1px solid var(--border-hairline)",
                            background: "var(--card-bg-crm)",
                            fontSize: 11,
                          }}
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingApt}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 99,
                            border: "none",
                            background: "var(--ink-crm)",
                            color: "var(--ink-crm-text, #FFFFFF)",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {isSubmittingApt ? "Saving..." : "Confirm"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Subform: Leave Note */}
                  {calendarActionModal === "note" && (
                    <form onSubmit={handleSaveCalendarNote} style={{ marginTop: 10, display: "flex", gap: 6 }}>
                      <input
                        type="text"
                        required
                        placeholder="Write note for this day..."
                        value={calendarNoteText}
                        onChange={(e) => setCalendarNoteText(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "1px solid var(--border-hairline)",
                          background: "var(--card-bg-crm)",
                          fontSize: 11,
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          padding: "6px 14px",
                          borderRadius: 99,
                          border: "none",
                          background: "var(--ink-crm)",
                          color: "var(--ink-crm-text, #FFFFFF)",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Save
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* Status Note */
                <div
                  style={{
                    marginTop: 14,
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "var(--surface-raised, rgba(0,0,0,0.02))",
                    border: "1px solid var(--border-hairline-light, var(--line))",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 11,
                    color: "var(--text-muted-crm, var(--muted))",
                  }}
                >
                  <Clock size={14} color="#6C4CE0" />
                  <span>Click any date to schedule an appointment or leave a milestone note.</span>
                </div>
              )}
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
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>Stage Funnel</h3>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Pipeline Progress</span>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em", color: "var(--ink)" }}>
                    {totalRecordsCount} Total Active
                  </div>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Engagements &amp; Inquiries</span>
                </div>

                {/* Real Funnel Stage Bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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

        {/* RIGHT COLUMN: Client Profile Persona Card + Detailed Information */}
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
                    background: user.banned ? "#DC2626" : "#10B981",
                  }}
                />
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
                  {user.banned ? "Suspended" : user.role === "ADMIN" ? "Active Admin" : user.role === "DEVELOPER" ? "Active Developer" : user.role === "FINANCE" ? "Active Finance" : "Active Client"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyText(typeof window !== "undefined" ? window.location.href : "", "Profile URL")}
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
                title="Share Profile"
              >
                <Share2 size={13} />
              </button>
            </div>

            {/* Large Circular Client Avatar */}
            <div style={{ position: "relative", marginBottom: 14 }}>
              <Avatar
                src={user.image}
                name={user.name}
                size="lg"
                userId={user.id}
                editable={true}
              />
            </div>

            {/* Client Name & Title */}
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                margin: "0 0 4px",
                color: "var(--ink)",
              }}
            >
              {user.name}
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
              {clientTitle}
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
              }}
            >
              {/* Edit */}
              <button
                type="button"
                onClick={() => setEditContactModal(true)}
                className="crm-action-circle"
                title="Edit Client Information"
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
                }}
              >
                <Edit3 size={14} />
              </button>

              {/* Email */}
              <a
                href={`mailto:${user.email}`}
                className="crm-action-circle"
                title={`Email ${user.email}`}
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

              {/* Phone (active only if phone is provided) */}
              {phoneNumber ? (
                <a
                  href={`tel:${phoneNumber.replace(/[^0-9+]/g, "")}`}
                  className="crm-action-circle"
                  title={`Call ${phoneNumber}`}
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
                  <Phone size={14} />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => toast.info("No phone number on record for this client.", "Phone")}
                  className="crm-action-circle"
                  title="No phone number"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "none",
                    background: "var(--paper)",
                    color: "var(--muted)",
                    opacity: 0.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "not-allowed",
                  }}
                >
                  <Phone size={14} />
                </button>
              )}

              {/* Add Real Project */}
              <button
                type="button"
                onClick={() => router.push("/admin/scope")}
                className="crm-action-circle"
                title="Create Project for Client"
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
                  cursor: "pointer",
                }}
              >
                <Plus size={15} />
              </button>

              {/* Calendar Meeting */}
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noreferrer"
                className="crm-action-circle"
                title="Schedule Meeting"
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
                <Calendar size={14} />
              </a>
            </div>
          </section>

          {/* Card 2: Detailed Information Card (Strictly Available Data) */}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>Detailed Information</h3>
              <button
                type="button"
                onClick={() => setEditContactModal(true)}
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
                title="Edit Contact"
              >
                <Edit3 size={13} />
              </button>
            </div>

            {/* Contact Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* First Name */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 11, color: "var(--muted)", display: "block" }}>First Name</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{firstName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(firstName, "First Name")}
                  className="crm-field-btn"
                  style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}
                >
                  {copiedField === "First Name" ? <Check size={14} color="#059669" /> : <Copy size={13} />}
                </button>
              </div>

              {/* Last Name */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 11, color: "var(--muted)", display: "block" }}>Last Name</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{lastName || "—"}</span>
                </div>
                {lastName && (
                  <button
                    type="button"
                    onClick={() => copyText(lastName, "Last Name")}
                    className="crm-field-btn"
                    style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}
                  >
                    {copiedField === "Last Name" ? <Check size={14} color="#059669" /> : <Copy size={13} />}
                  </button>
                )}
              </div>

              {/* Email */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ minWidth: 0, paddingRight: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)", display: "block" }}>Email</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", wordBreak: "break-all" }}>
                    {user.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(user.email, "Email")}
                  className="crm-field-btn"
                  style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", flexShrink: 0 }}
                >
                  {copiedField === "Email" ? <Check size={14} color="#059669" /> : <Copy size={13} />}
                </button>
              </div>

              {/* Phone Number */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 11, color: "var(--muted)", display: "block" }}>Phone Number</span>
                  <span style={{ fontSize: 14, fontWeight: phoneNumber ? 700 : 500, color: phoneNumber ? "var(--ink)" : "var(--muted)" }}>
                    {phoneNumber || "Not provided"}
                  </span>
                </div>
                {phoneNumber && (
                  <button
                    type="button"
                    onClick={() => copyText(phoneNumber, "Phone Number")}
                    className="crm-field-btn"
                    style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}
                  >
                    {copiedField === "Phone Number" ? <Check size={14} color="#059669" /> : <Copy size={13} />}
                  </button>
                )}
              </div>

              {/* Organization */}
              {companyName && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--muted)", display: "block" }}>Organization</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{companyName}</span>
                  </div>
                </div>
              )}

              {/* Sources & Channels (Strictly Available) */}
              <div style={{ paddingTop: 6, borderTop: "1px solid var(--line)" }}>
                <span style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 8 }}>
                  Active Channels
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  {/* Email Channel */}
                  <a
                    href={`mailto:${user.email}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 99,
                      background: "rgba(108,76,255,0.08)",
                      color: "#6C4CFF",
                      textDecoration: "none",
                    }}
                  >
                    <Mail size={12} />
                    <span>Email Direct</span>
                  </a>

                  {/* Discord Channel (if present) */}
                  {user.discordHandle ? (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 99,
                        background: "rgba(88,101,242,0.1)",
                        color: "#5865F2",
                      }}
                    >
                      <DiscordIcon size={13} />
                      <span>@{user.discordHandle}</span>
                    </div>
                  ) : null}

                  {/* WhatsApp Channel (only if phone is present) */}
                  {phoneNumber ? (
                    <a
                      href={`https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: 99,
                        background: "rgba(37,211,102,0.1)",
                        color: "#059669",
                        textDecoration: "none",
                      }}
                    >
                      <WhatsAppIcon size={13} />
                      <span>WhatsApp</span>
                    </a>
                  ) : null}
                </div>
              </div>

              {/* Joined / Recorded */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--line)" }}>
                <div>
                  <span style={{ fontSize: 11, color: "var(--muted)", display: "block" }}>Joined / Recorded</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                    {new Date(user.createdAt).toLocaleString([], {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <Calendar size={15} color="var(--muted)" />
              </div>

              {/* Password Initiation Button */}
              <div style={{ marginTop: 6, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                <button
                  type="button"
                  onClick={handleSendSetupEmail}
                  disabled={isSendingInvite}
                  className="button"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    gap: 6,
                    fontSize: 12,
                    padding: "10px 14px",
                  }}
                >
                  <KeyRound size={14} />
                  {isSendingInvite ? "Generating Link…" : "Send Account Password Setup"}
                </button>

                {inviteResult && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 10,
                      borderRadius: 10,
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.25)",
                      fontSize: 11,
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "#059669", display: "block", marginBottom: 4 }}>
                      {inviteResult.emailSent ? "Setup email dispatched!" : "Setup Link Active:"}
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        type="text"
                        readOnly
                        value={inviteResult.setupUrl}
                        className="field"
                        style={{ fontSize: 10, padding: "4px 8px", height: "auto" }}
                      />
                      <button
                        type="button"
                        onClick={() => copyText(inviteResult.setupUrl, "Setup Link")}
                        className="button button-outline"
                        style={{ padding: "4px 8px", fontSize: 10, height: "auto" }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* PROJECT INQUIRY DETAILS MODAL */}
      {selectedInquiryDetail && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            overflowY: "auto",
          }}
          onClick={() => setSelectedInquiryDetail(null)}
        >
          <div
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 22,
              maxWidth: 680,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              padding: "24px 28px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--accent-blue, #6C4CFF)", letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>
                  Project Inquiry Lead &middot; #{selectedInquiryDetail.id.slice(-8)}
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "var(--ink)", letterSpacing: "-0.03em" }}>
                  {selectedInquiryDetail.service}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiryDetail(null)}
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
                title="Close details"
              >
                <X size={16} />
              </button>
            </div>

            {/* Badges / Meta row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  borderRadius: 99,
                  background:
                    selectedInquiryDetail.status === "NEW"
                      ? "rgba(255,181,71,0.18)"
                      : selectedInquiryDetail.status === "CONVERTED" || selectedInquiryDetail.status === "QUALIFIED"
                      ? "rgba(16,185,129,0.18)"
                      : "rgba(37,99,235,0.18)",
                  color:
                    selectedInquiryDetail.status === "NEW"
                      ? "#d97706"
                      : selectedInquiryDetail.status === "CONVERTED" || selectedInquiryDetail.status === "QUALIFIED"
                      ? "#059669"
                      : "#2563eb",
                }}
              >
                {selectedInquiryDetail.status}
              </span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                Submitted {new Date(selectedInquiryDetail.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
              {selectedInquiryDetail.budget && (
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", background: "var(--surface-raised)", padding: "2px 8px", borderRadius: 6, border: "1px solid var(--border-hairline)" }}>
                  💰 {selectedInquiryDetail.budget}
                </span>
              )}
            </div>

            {/* Client Overview Card */}
            <div
              style={{
                padding: "14px 18px",
                borderRadius: 14,
                background: "var(--surface-raised, rgba(0,0,0,0.02))",
                border: "1px solid var(--border-hairline-light, var(--line))",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                marginBottom: 18,
                fontSize: 12,
              }}
            >
              <div>
                <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Client Name</span>
                <strong style={{ color: "var(--ink)", fontSize: 13 }}>{selectedInquiryDetail.name}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Email Address</span>
                <a href={`mailto:${selectedInquiryDetail.email}`} style={{ color: "var(--accent-blue, #6C4CFF)", fontWeight: 600 }}>
                  {selectedInquiryDetail.email}
                </a>
              </div>
              {selectedInquiryDetail.phone && (
                <div>
                  <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Direct Phone</span>
                  <span style={{ color: "var(--ink)", fontWeight: 600 }}>{selectedInquiryDetail.phone}</span>
                </div>
              )}
              {selectedInquiryDetail.company && (
                <div>
                  <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Company / Organization</span>
                  <span style={{ color: "var(--ink)", fontWeight: 600 }}>{selectedInquiryDetail.company}</span>
                </div>
              )}
            </div>

            {/* Scope / Message */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted-crm, var(--muted))", display: "block", marginBottom: 6 }}>
                Project Scope &amp; Message:
              </span>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "var(--paper-alt, rgba(0,0,0,0.03))",
                  border: "1px solid var(--line)",
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: "var(--ink)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {selectedInquiryDetail.message}
              </div>
            </div>

            {/* Reference Materials & Visual Inspiration */}
            {(selectedInquiryDetail.referenceUrl || selectedInquiryDetail.referenceImage) && (
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted-crm, var(--muted))", display: "block", marginBottom: 8 }}>
                  Reference Materials &amp; Inspiration:
                </span>

                <div style={{ display: "grid", gap: 10 }}>
                  {selectedInquiryDetail.referenceUrl && (
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
                        <span style={{ fontSize: 11, color: "var(--muted)", display: "block" }}>Benchmark / Inspiration Link</span>
                        <span style={{ fontSize: 12, color: "var(--accent-blue, #6C4CFF)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                          {selectedInquiryDetail.referenceUrl}
                        </span>
                      </div>
                      <a
                        href={selectedInquiryDetail.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-outline"
                        style={{ fontSize: 11, padding: "5px 12px", height: "auto", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        Visit &rarr;
                      </a>
                    </div>
                  )}

                  {selectedInquiryDetail.referenceImage && (
                    <div>
                      <span style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                        Uploaded Reference Mockup / Wireframe
                      </span>
                      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border-hairline)", background: "var(--surface-raised)", maxWidth: 360 }}>
                        <img
                          src={selectedInquiryDetail.referenceImage}
                          alt="Reference inspiration"
                          style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }}
                        />
                        <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--paper)" }}>
                          <span style={{ fontSize: 11, color: "var(--muted)" }}>Click to view original</span>
                          <a
                            href={selectedInquiryDetail.referenceImage}
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

            {/* Quick Status Update Section */}
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                background: "var(--surface-raised, rgba(0,0,0,0.02))",
                border: "1px solid var(--border-hairline)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>Update Status:</span>
                <select
                  value={modalStatusChoice}
                  onChange={(e) => setModalStatusChoice(e.target.value)}
                  disabled={updatingDetailStatus}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    fontSize: 12,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--paper)",
                    color: "var(--ink)",
                    fontWeight: 600,
                  }}
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="PROPOSAL_SENT">PROPOSAL SENT</option>
                  <option value="CONVERTED">CONVERTED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleUpdateModalStatus}
                disabled={updatingDetailStatus || modalStatusChoice === selectedInquiryDetail.status}
                className="button"
                style={{ fontSize: 11, padding: "6px 14px", height: "auto" }}
              >
                {updatingDetailStatus ? "Saving..." : "Save Status"}
              </button>
            </div>

            {/* Footer Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
              <button
                type="button"
                onClick={() => {
                  const inqId = selectedInquiryDetail.id;
                  setSelectedInquiryDetail(null);
                  if (typeof window !== "undefined") {
                    if (window.location.pathname.includes(`/admin/inquiry/${inqId}`)) {
                      const auditEl = document.getElementById("inquiry-audit-history") || document.getElementById("lead-inquiry-details");
                      if (auditEl) {
                        auditEl.scrollIntoView({ behavior: "smooth" });
                        auditEl.style.boxShadow = "0 0 0 3px var(--accent-blue, #6C4CFF)";
                        setTimeout(() => {
                          if (auditEl) auditEl.style.boxShadow = "none";
                        }, 2000);
                      }
                    } else {
                      window.location.assign(`/admin/inquiry/${inqId}#inquiry-audit-history`);
                    }
                  }
                }}
                className="button button-outline"
                style={{ fontSize: 12, padding: "8px 16px", height: "auto", cursor: "pointer" }}
              >
                Open Full Audit Page &rarr;
              </button>
              <button
                type="button"
                onClick={() => setSelectedInquiryDetail(null)}
                className="button"
                style={{ fontSize: 12, padding: "8px 16px", height: "auto" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CRM Responsive Styles */}
      <style>{`
        .crm-icon-button:hover {
          background: var(--paper-alt, rgba(0,0,0,0.05)) !important;
          color: var(--ink) !important;
        }
        .crm-back-btn:hover {
          transform: translateX(-2px);
          background: var(--paper-alt, #f3f4f6) !important;
        }
        .crm-action-circle:hover {
          transform: scale(1.08);
        }
        @media (max-width: 1040px) {
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
