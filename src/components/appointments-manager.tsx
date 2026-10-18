"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  ExternalLink,
  Edit2,
  Check,
  Ban,
  Trash2,
  User,
  Users,
  Search,
} from "lucide-react";
import {
  PageHeader,
  SectionCard,
  Badge,
  Avatar,
  EmptyState,
  DetailRow,
  ConfirmModal,
} from "@/components/admin-ui";
import { useToast } from "@/components/toast";

export interface AppointmentItem {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  duration: number;
  status: string;
  meetingLink?: string | null;
  notes?: string | null;
  requestedById: string;
  requestedBy: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  assignedStaff?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
}

export interface AppointmentsManagerProps {
  initialAppointments: AppointmentItem[];
  currentUserId: string;
  currentUserRole: string;
  clientsList?: { id: string; name: string; email: string }[];
}

function getLocalDatetimeString(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${mins}`;
}

export function AppointmentsManager({
  initialAppointments,
  currentUserId,
  currentUserRole,
  clientsList = [],
}: AppointmentsManagerProps) {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(initialAppointments);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const toast = useToast();

  const isStaff = ["ADMIN", "DEVELOPER", "FINANCE"].includes(currentUserRole);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("14:00");
  const [duration, setDuration] = useState("30");
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(clientsList[0]?.id || "");

  // Date/Time restrictions: cannot book in the past
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const isTodaySelected = dateStr === todayStr;
  const timeMin = isTodaySelected ? currentTimeStr : undefined;

  // Reschedule / Link modal
  const [editingItem, setEditingItem] = useState<AppointmentItem | null>(null);
  const [editMeetingLink, setEditMeetingLink] = useState("");
  const [editDateStr, setEditDateStr] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteAptId, setDeleteAptId] = useState<string | null>(null);

  // Keyboard shortcut: Escape to close modals
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setModalOpen(false);
        setEditingItem(null);
        setDeleteAptId(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = appointments.filter((app) => {
    const matchesFilter = statusFilter === "ALL" ? true : app.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q
      ? true
      : app.title.toLowerCase().includes(q) ||
        app.requestedBy?.name?.toLowerCase().includes(q) ||
        app.requestedBy?.email?.toLowerCase().includes(q) ||
        (app.description && app.description.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const scheduledCount = appointments.filter((a) => a.status === "SCHEDULED").length;
  const requestedCount = appointments.filter((a) => a.status === "REQUESTED").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;

  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dateStr) {
      toast.error("Please fill in the title and date.", "Required");
      return;
    }

    const combinedDateTime = new Date(`${dateStr}T${timeStr || "12:00"}:00`);
    if (isNaN(combinedDateTime.getTime())) {
      toast.error("Invalid date or time format.", "Invalid Input");
      return;
    }

    if (combinedDateTime.getTime() < Date.now() - 60000) {
      toast.error("Appointment date and time cannot be in the past.", "Invalid Time");
      return;
    }

    setActionBusy(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          date: combinedDateTime.toISOString(),
          duration: Number(duration) || 30,
          meetingLink: meetingLink.trim() || null,
          clientId: isStaff && selectedClientId ? selectedClientId : undefined,
          status: isStaff ? "SCHEDULED" : "REQUESTED",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create appointment");

      setAppointments([data.appointment, ...appointments]);
      setModalOpen(false);
      setTitle("");
      setDescription("");
      setDateStr("");
      setMeetingLink("");

      if (isStaff) {
        toast.success(`Appointment "${title}" scheduled successfully.`, "Appointment Set");
      } else {
        toast.success("Your appointment request has been submitted to the studio team.", "Request Sent");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error creating appointment", "Failed");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setActionBusy(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update appointment");

      setAppointments(appointments.map((a) => (a.id === id ? data.appointment : a)));
      toast.success(`Appointment marked as ${newStatus.toLowerCase()}.`, "Status Updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update", "Error");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;

    setActionBusy(true);
    try {
      const updatePayload: any = { id: editingItem.id };
      if (editMeetingLink !== undefined) updatePayload.meetingLink = editMeetingLink.trim() || null;
      if (editDateStr) {
        const parsed = new Date(editDateStr);
        if (isNaN(parsed.getTime())) {
          toast.error("Invalid date format.", "Invalid Input");
          setActionBusy(false);
          return;
        }
        if (parsed.getTime() < Date.now() - 60000) {
          toast.error("Appointment date and time cannot be in the past.", "Invalid Time");
          setActionBusy(false);
          return;
        }
        updatePayload.date = parsed.toISOString();
      }

      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save changes");

      setAppointments(appointments.map((a) => (a.id === editingItem.id ? data.appointment : a)));
      setEditingItem(null);
      toast.success("Appointment updated.", "Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed", "Error");
    } finally {
      setActionBusy(false);
    }
  }

  function handleDeleteAppointment(id: string) {
    setDeleteAptId(id);
  }

  async function executeDeleteAppointment() {
    if (!deleteAptId) return;
    const id = deleteAptId;
    setDeleteAptId(null);

    try {
      const res = await fetch(`/api/appointments?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete appointment");

      setAppointments(appointments.filter((a) => a.id !== id));
      toast.success("Appointment record deleted.", "Deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error deleting", "Error");
    }
  }

  return (
    <div className="animate-fade-in-up" style={{ width: "100%" }}>
      {/* Page Header */}
      <PageHeader
        titleLine1="Schedule &"
        titleLine2="Appointments"
        stats={[
          {
            icon: <Calendar size={18} strokeWidth={1.8} />,
            value: scheduledCount,
            badgeLabel: "Scheduled",
            badgeVariant: "info",
            caption: "Confirmed sessions",
          },
          {
            icon: <Clock size={18} strokeWidth={1.8} />,
            value: requestedCount,
            badgeLabel: "Requested",
            badgeVariant: "warning",
            caption: "Awaiting staff confirmation",
          },
          {
            icon: <CheckCircle2 size={18} strokeWidth={1.8} />,
            value: completedCount,
            badgeLabel: "Completed",
            badgeVariant: "success",
            caption: "Concluded consultations",
          },
        ]}
      />

      {/* Filter Tabs & Action Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {[
            { label: "All Sessions", value: "ALL" },
            { label: "Scheduled", value: "SCHEDULED" },
            { label: "Requested", value: "REQUESTED" },
            { label: "Completed", value: "COMPLETED" },
            { label: "Cancelled", value: "CANCELLED" },
          ].map((tab) => {
            const isSelected = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 500,
                  border: isSelected ? "none" : "1px solid var(--border-hairline)",
                  background: isSelected ? "var(--ink-crm)" : "var(--surface-raised)",
                  color: isSelected ? "var(--ink-crm-text, #FFFFFF)" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Search Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              background: "var(--surface-raised)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius-pill)",
              flex: "1 1 180px",
              maxWidth: 280,
            }}
          >
            <Search size={14} color="var(--text-muted-crm)" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: 12,
                color: "var(--text-primary)",
                width: "100%",
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ border: "none", background: "none", cursor: "pointer", padding: 0, color: "var(--text-muted-crm)" }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setModalOpen(true);
              const now = new Date();
              now.setDate(now.getDate() + 1);
              setDateStr(now.toISOString().split("T")[0]);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: "var(--radius-pill)",
              background: "var(--ink-crm)",
              color: "var(--ink-crm-text, #FFFFFF)",
              border: "none",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Plus size={15} />
            <span>{isStaff ? "Set Appointment" : "Request Appointment"}</span>
          </button>
        </div>
      </div>

      {/* Appointments List Grid */}
      <SectionCard title={`Appointments (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Calendar size={24} />}
            title="No appointments scheduled"
            description={
              isStaff
                ? "Set an appointment directly with a client using the button above."
                : "Need a project review or consultation? Request an appointment with our team."
            }
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((app) => {
              const appDate = new Date(app.date);
              const formattedDate = appDate.toLocaleDateString([], {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const formattedTime = appDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              const monthShort = appDate.toLocaleDateString([], { month: "short" }).toUpperCase();
              const dayNum = appDate.getDate();

              return (
                <div
                  key={app.id}
                  style={{
                    padding: "16px 20px",
                    background: "var(--surface-raised)",
                    borderRadius: "var(--radius-row)",
                    border: "1px solid var(--border-hairline-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Left: Calendar badge + User & Title */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 260, flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        background: "var(--subtle-fill)",
                        border: "1px solid var(--border-hairline)",
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: 10, fontWeight: 800, color: "var(--accent-blue)", lineHeight: 1 }}>
                        {monthShort}
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
                        {dayNum}
                      </span>
                    </div>

                    <Avatar
                      src={app.requestedBy?.image}
                      name={app.requestedBy?.name || "Client"}
                      size="md"
                    />

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                          {app.title}
                        </span>
                        <Badge
                          variant={
                            app.status === "SCHEDULED"
                              ? "info"
                              : app.status === "REQUESTED"
                              ? "warning"
                              : app.status === "COMPLETED"
                              ? "success"
                              : "neutral"
                          }
                        >
                          {app.status}
                        </Badge>
                      </div>

                      <div style={{ fontSize: 12, color: "var(--text-muted-crm)", marginTop: 2 }}>
                        Client: <strong style={{ color: "var(--text-secondary)" }}>{app.requestedBy?.name}</strong> ({app.requestedBy?.email})
                      </div>

                      {app.description && (
                        <div style={{ fontSize: 11, color: "var(--text-muted-crm)", marginTop: 4 }}>
                          {app.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center: Date, Time & Meeting Link */}
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                        {formattedDate}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted-crm)", marginTop: 2 }}>
                        {formattedTime} ({app.duration} mins)
                      </div>
                    </div>

                    {app.meetingLink ? (
                      <a
                        href={app.meetingLink.startsWith("http") ? app.meetingLink : `https://${app.meetingLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 14px",
                          borderRadius: "var(--radius-pill)",
                          background: "var(--accent-blue)",
                          color: "#FFFFFF",
                          fontSize: 12,
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        <Video size={13} />
                        <span>Join Call</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--text-muted-crm)", fontStyle: "italic" }}>
                        Link pending
                      </span>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {isStaff && (
                      <>
                        {app.status === "REQUESTED" && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, "SCHEDULED")}
                            title="Confirm & Schedule"
                            style={{
                              padding: "5px 12px",
                              borderRadius: "var(--radius-pill)",
                              border: "none",
                              background: "var(--ink-crm)",
                              color: "var(--ink-crm-text, #FFFFFF)",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Check size={12} />
                            Confirm
                          </button>
                        )}

                        {app.status === "SCHEDULED" && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, "COMPLETED")}
                            title="Mark Completed"
                            style={{
                              padding: "5px 12px",
                              borderRadius: "var(--radius-pill)",
                              border: "1px solid var(--border-hairline)",
                              background: "#ecfdf5",
                              color: "#059669",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Complete
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(app);
                            setEditMeetingLink(app.meetingLink || "");
                            setEditDateStr(app.date ? getLocalDatetimeString(new Date(app.date)) : "");
                          }}
                          title="Edit Details / Link"
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            border: "none",
                            background: "transparent",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAppointment(app.id)}
                          title="Delete Appointment"
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            border: "none",
                            background: "transparent",
                            color: "#dc2626",
                            cursor: "pointer",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}

                    {!isStaff && app.status !== "CANCELLED" && app.status !== "COMPLETED" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(app.id, "CANCELLED")}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "var(--radius-pill)",
                          border: "1px solid var(--border-hairline)",
                          background: "transparent",
                          color: "#dc2626",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Set / Request Appointment Slide-Over Drawer */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 12, 18, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "stretch",
            zIndex: 1000,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="drawer-slide-in drawer-responsive"
            style={{
              background: "var(--surface-raised)",
              width: "min(500px, 100%)",
              height: "100%",
              maxHeight: "100vh",
              boxShadow: "-16px 0 48px rgba(0,0,0,0.35)",
              borderLeft: "1px solid var(--border-hairline)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Fixed Drawer Header */}
            <div
              style={{
                flexShrink: 0,
                padding: "20px 24px 16px",
                borderBottom: "1px solid var(--border-hairline)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--surface-raised)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "rgba(14, 165, 233, 0.12)",
                    border: "1px solid rgba(14, 165, 233, 0.25)",
                    color: "var(--accent-blue)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                    {isStaff ? "Set Client Appointment" : "Request Studio Appointment"}
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted-crm)" }}>
                    {isStaff
                      ? "Directly provision and schedule an initiative session"
                      : "Choose a convenient date & topic for project discussion"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1px solid var(--border-hairline)",
                  background: "var(--card-bg-crm)",
                  color: "var(--text-muted-crm)",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  transition: "color 0.15s ease, background 0.15s ease",
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Form Wrapping Scrollable Body & Pinned Footer */}
            <form
              onSubmit={handleCreateAppointment}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: "1 1 auto",
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              {/* Scrollable Form Body */}
              <div
                className="drawer-content"
                style={{
                  flex: "1 1 auto",
                  overflowY: "auto",
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                    Meeting Title / Purpose <span style={{ color: "var(--accent-blue)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design Architecture Review & Sprint Scoping"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--card-bg-crm)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {isStaff && clientsList.length > 0 && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                      Client Workspace <span style={{ color: "var(--accent-blue)" }}>*</span>
                    </label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid var(--border-hairline)",
                        background: "var(--card-bg-crm)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                        cursor: "pointer",
                      }}
                    >
                      {clientsList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 2-Column Date & Time Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                      Date <span style={{ color: "var(--accent-blue)" }}>*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={todayStr}
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid var(--border-hairline)",
                        background: "var(--card-bg-crm)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                      Time <span style={{ color: "var(--accent-blue)" }}>*</span>
                    </label>
                    <input
                      type="time"
                      required
                      min={timeMin}
                      value={timeStr}
                      onChange={(e) => setTimeStr(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid var(--border-hairline)",
                        background: "var(--card-bg-crm)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* Interactive Duration Segmented Pills */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                    Session Duration
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {[
                      { label: "15 min", value: "15" },
                      { label: "30 min", value: "30" },
                      { label: "45 min", value: "45" },
                      { label: "60 min", value: "60" },
                    ].map((pill) => {
                      const active = duration === pill.value;
                      return (
                        <button
                          key={pill.value}
                          type="button"
                          onClick={() => setDuration(pill.value)}
                          style={{
                            padding: "9px 0",
                            borderRadius: 10,
                            border: active
                              ? "1px solid var(--accent-blue)"
                              : "1px solid var(--border-hairline)",
                            background: active
                              ? "var(--accent-blue)"
                              : "var(--card-bg-crm)",
                            color: active ? "#ffffff" : "var(--text-primary)",
                            fontSize: 12,
                            fontWeight: active ? 700 : 500,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            textAlign: "center",
                          }}
                        >
                          {pill.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isStaff && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                      Meeting Link (Google Meet / Zoom)
                    </label>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid var(--border-hairline)",
                        background: "var(--card-bg-crm)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                    Description / Agenda <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted-crm)" }}>(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Key deliverables, topics or questions to cover..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: 56,
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--card-bg-crm)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      resize: "vertical",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              {/* Pinned Sticky Footer - Always Visible */}
              <div
                style={{
                  flexShrink: 0,
                  padding: "16px 24px",
                  borderTop: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: "11px 16px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--border-hairline)",
                    background: "transparent",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionBusy}
                  style={{
                    flex: 1.4,
                    padding: "11px 18px",
                    borderRadius: "var(--radius-pill)",
                    border: "none",
                    background: "var(--ink-crm)",
                    color: "var(--ink-crm-text, #FFFFFF)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: actionBusy ? "not-allowed" : "pointer",
                    opacity: actionBusy ? 0.7 : 1,
                    transition: "all 0.15s ease",
                  }}
                >
                  {actionBusy
                    ? "Submitting..."
                    : isStaff
                    ? "Schedule Appointment"
                    : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Reschedule Slide-Over Drawer */}
      {editingItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 12, 18, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "stretch",
            zIndex: 1000,
          }}
          onClick={() => setEditingItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="drawer-slide-in drawer-responsive"
            style={{
              background: "var(--surface-raised)",
              width: "min(460px, 100%)",
              height: "100%",
              maxHeight: "100vh",
              boxShadow: "-16px 0 48px rgba(0,0,0,0.35)",
              borderLeft: "1px solid var(--border-hairline)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Fixed Drawer Header */}
            <div
              style={{
                flexShrink: 0,
                padding: "20px 24px 16px",
                borderBottom: "1px solid var(--border-hairline)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--surface-raised)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "rgba(14, 165, 233, 0.12)",
                    border: "1px solid rgba(14, 165, 233, 0.25)",
                    color: "var(--accent-blue)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Edit2 size={17} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                    Update Appointment
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted-crm)" }}>
                    Reschedule session or update conference link
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                aria-label="Close"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1px solid var(--border-hairline)",
                  background: "var(--card-bg-crm)",
                  color: "var(--text-muted-crm)",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  transition: "color 0.15s ease, background 0.15s ease",
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Form Wrapping Scrollable Body & Pinned Footer */}
            <form
              onSubmit={handleSaveEdit}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: "1 1 auto",
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              {/* Scrollable Form Body */}
              <div
                className="drawer-content"
                style={{
                  flex: "1 1 auto",
                  overflowY: "auto",
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                    Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    min={getLocalDatetimeString()}
                    value={editDateStr}
                    onChange={(e) => setEditDateStr(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--card-bg-crm)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={editMeetingLink}
                    onChange={(e) => setEditMeetingLink(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid var(--border-hairline)",
                      background: "var(--card-bg-crm)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Pinned Sticky Footer - Always Visible */}
              <div
                style={{
                  flexShrink: 0,
                  padding: "16px 24px",
                  borderTop: "1px solid var(--border-hairline)",
                  background: "var(--surface-raised)",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  style={{
                    flex: 1,
                    padding: "11px 16px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--border-hairline)",
                    background: "transparent",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionBusy}
                  style={{
                    flex: 1.4,
                    padding: "11px 18px",
                    borderRadius: "var(--radius-pill)",
                    border: "none",
                    background: "var(--ink-crm)",
                    color: "var(--ink-crm-text, #FFFFFF)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: actionBusy ? "not-allowed" : "pointer",
                    opacity: actionBusy ? 0.7 : 1,
                    transition: "all 0.15s ease",
                  }}
                >
                  {actionBusy ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmModal
        open={!!deleteAptId}
        title="Delete Appointment Record"
        message="Are you sure you want to permanently delete this appointment? Both parties will be notified that this session is cancelled and removed from the active calendar."
        confirmLabel="Delete Appointment"
        variant="danger"
        onConfirm={executeDeleteAppointment}
        onCancel={() => setDeleteAptId(null)}
      />
    </div>
  );
}
