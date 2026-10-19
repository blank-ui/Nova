"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserPlus,
  KeyRound,
  Trash2,
  Ban,
  CheckCircle2,
  AlertCircle,
  Copy,
  Loader2,
  Search,
  Check,
  UserCheck,
  Shield,
  ExternalLink,
  Mail,
  FolderKanban,
  Clock,
  User as UserIcon,
  X,
  Phone,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import {
  PageHeader,
  SectionCard,
  ProfileCard,
  Avatar,
  Badge,
  DetailRow,
  DataTable,
  EmptyState,
  PillButton,
  IconButton,
  ConfirmModal,
} from "@/components/admin-ui";
import { useToast } from "@/components/toast";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  image?: string | null;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  banned: boolean;
  banReason?: string | null;
  discordHandle?: string | null;
  createdAt: string;
  _count: {
    projects: number;
    authSessions: number;
  };
}

export function AdminUsersManager({
  initialUsers,
  currentAdminId,
}: {
  initialUsers: UserItem[];
  currentAdminId: string;
}) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    initialUsers[0]?.id || null
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const toast = useToast();

  // Form states for creating a new user
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDob, setNewDob] = useState("");
  const [newRole, setNewRole] = useState<"CLIENT" | "ADMIN" | "DEVELOPER" | "FINANCE">("CLIENT");
  const [createdResult, setCreatedResult] = useState<{ setupUrl: string; emailSent: boolean } | null>(null);

  // In-app Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: "danger" | "primary" | "warning";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    variant: "danger",
    onConfirm: () => {},
  });

  // Loading states for actions
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  // Keyboard shortcut: Escape to close modals
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowCreateModal(false);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0] || null;

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.discordHandle && u.discordHandle.toLowerCase().includes(search.toLowerCase()));
    const matchesRole =
      roleFilter === "ALL"
        ? true
        : roleFilter === "SUSPENDED"
        ? u.banned
        : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const clientCount = users.filter((u) => u.role === "CLIENT").length;
  const totalCount = users.length;

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    setCreatedResult(null);

    const isStaff = newRole !== "CLIENT";
    if (isStaff) {
      if (!newName.trim() || newName.trim().length < 2) {
        setCreateError("Staff account requires a full name.");
        setCreateLoading(false);
        return;
      }
      if (!newDob.trim()) {
        setCreateError("Staff account requires date of birth.");
        setCreateLoading(false);
        return;
      }
      if (!newPhone.trim() || newPhone.trim().length < 7) {
        setCreateError("Staff account requires a valid phone number.");
        setCreateLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          role: newRole,
          phone: newPhone.trim() || undefined,
          dateOfBirth: newDob.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user.");

      setCreatedResult({ setupUrl: data.setupUrl, emailSent: data.emailSent });
      const newUser: UserItem = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        phone: data.user.phone || null,
        dateOfBirth: data.user.dateOfBirth || null,
        image: null,
        emailVerified: true,
        twoFactorEnabled: false,
        banned: false,
        createdAt: new Date().toISOString(),
        _count: { projects: 0, authSessions: 0 },
      };
      setUsers([newUser, ...users]);
      setSelectedUserId(newUser.id);
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewDob("");

      if (data.emailSent) {
        toast.success(`Account created for ${data.user.name}. Setup email dispatched to ${data.user.email}.`, "User Initiated");
      } else {
        toast.info(`Account created for ${data.user.name}. Copy the one-time setup link below.`, "User Created");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error creating user";
      setCreateError(msg);
      toast.error(msg, "Creation Failed");
    } finally {
      setCreateLoading(false);
    }
  }

  function handleSuspend(user: UserItem) {
    if (user.id === currentAdminId) return;
    const isSuspending = !user.banned;
    const title = isSuspending ? "Suspend User Account?" : "Reactivate User Account?";
    const message = isSuspending
      ? `Are you sure you want to suspend ${user.name} (${user.email})? All active sessions will be terminated immediately.`
      : `Reactivate account access for ${user.name} (${user.email})?`;

    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmLabel: isSuspending ? "Suspend Account" : "Reactivate Account",
      variant: isSuspending ? "warning" : "primary",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setBusyUserId(user.id);
        setActionMessage(null);
        try {
          const res = await fetch("/api/admin/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user.id, action: "suspend" }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to update suspension status");

          setUsers(users.map((u) => (u.id === user.id ? { ...u, banned: data.banned } : u)));
          setActionMessage({ type: "success", text: data.message });
          if (data.banned) {
            toast.warning(`Account for ${user.name} suspended. All active sessions revoked.`, "User Suspended");
          } else {
            toast.success(`Account for ${user.name} has been reactivated.`, "User Reactivated");
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to update user.";
          setActionMessage({ type: "error", text: msg });
          toast.error(msg, "Status Update Failed");
        } finally {
          setBusyUserId(null);
        }
      },
    });
  }

  function handleResetPassword(user: UserItem) {
    setConfirmModal({
      isOpen: true,
      title: "Dispatch Password Setup / Reset?",
      message: `Send an official password setup and initiation link to ${user.email}?`,
      confirmLabel: "Send Email",
      variant: "primary",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setBusyUserId(user.id);
        setActionMessage(null);
        try {
          const res = await fetch("/api/admin/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user.id, action: "reset-password" }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to trigger password reset");

          const successText = data.emailSent
            ? `Password setup email sent to ${user.email} successfully!`
            : `Password link generated: ${data.resetUrl}`;
          setActionMessage({ type: "success", text: successText });
          if (data.emailSent) {
            toast.success(`Password link dispatched to ${user.email}.`, "Email Dispatched");
          } else {
            toast.info("Password link generated.", "Link Created");
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to reset password.";
          setActionMessage({ type: "error", text: msg });
          toast.error(msg, "Reset Failed");
        } finally {
          setBusyUserId(null);
        }
      },
    });
  }

  function handleDeleteUser(user: UserItem) {
    if (user.id === currentAdminId) {
      toast.warning("You cannot delete your own administrative account.", "Action Forbidden");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Permanently Delete User Account?",
      message: `DANGER: Permanently delete ${user.name} (${user.email})? This action cannot be reversed and deletes all credentials.`,
      confirmLabel: "Delete Permanently",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setBusyUserId(user.id);
        setActionMessage(null);
        try {
          const res = await fetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to delete user");

          setUsers(users.filter((u) => u.id !== user.id));
          if (selectedUserId === user.id) {
            setSelectedUserId(users.find((u) => u.id !== user.id)?.id || null);
          }
          setActionMessage({ type: "success", text: data.message });
          toast.success(`User ${user.name} was permanently removed.`, "User Deleted");
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to delete user.";
          setActionMessage({ type: "error", text: msg });
          toast.error(msg, "Deletion Failed");
        } finally {
          setBusyUserId(null);
        }
      },
    });
  }

  const columns = [
    {
      key: "user",
      header: "User & Identity",
      width: "minmax(240px, 2fr)",
      render: (u: UserItem) => {
        const isCurrentAdmin = u.id === currentAdminId;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, overflow: "hidden" }}>
            <Avatar src={u.image} name={u.name} size="sm" />
            <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {u.name}
                </span>
                {isCurrentAdmin && (
                  <Badge variant="brand">You</Badge>
                )}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted-crm)",
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 200,
                }}
                title={u.email}
              >
                {u.email}
              </div>
              {u.discordHandle && (
                <div style={{ fontSize: 10, color: "#5865F2", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  @{u.discordHandle}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      header: "Role",
      width: "110px",
      render: (u: UserItem) => (
        <Badge variant={u.role === "ADMIN" ? "brand" : u.role === "DEVELOPER" ? "success" : "neutral"}>
          {u.role}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "110px",
      render: (u: UserItem) =>
        u.banned ? (
          <Badge variant="warning">Suspended</Badge>
        ) : (
          <Badge variant="success">Active</Badge>
        ),
    },
    {
      key: "projects",
      header: "Projects",
      width: "90px",
      render: (u: UserItem) => (
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
          {u._count.projects}
        </span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      width: "100px",
      render: (u: UserItem) => (
        <span style={{ fontSize: 11, color: "var(--text-muted-crm)", fontWeight: 600 }}>
          {new Date(u.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "140px",
      align: "right" as const,
      render: (u: UserItem) => {
        const isCurrentAdmin = u.id === currentAdminId;
        const isBusy = busyUserId === u.id;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            <Link
              href={`/admin/users/${u.id}`}
              style={{
                padding: "4px 10px",
                borderRadius: "var(--radius-pill)",
                background: "var(--subtle-fill)",
                color: "var(--text-primary)",
                fontSize: 11,
                fontWeight: 700,
                textDecoration: "none",
              }}
              title="Open full client profile"
            >
              Profile
            </Link>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleResetPassword(u);
              }}
              disabled={isBusy}
              aria-label={`Send setup email to ${u.name}`}
              title="Send setup email"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                background: "transparent",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              <KeyRound size={13} />
            </button>

            {!isCurrentAdmin && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSuspend(u);
                  }}
                  disabled={isBusy}
                  aria-label={u.banned ? "Reactivate user" : "Suspend user"}
                  title={u.banned ? "Reactivate user" : "Suspend user"}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: "none",
                    background: "transparent",
                    color: u.banned ? "#10b981" : "#f59e0b",
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Ban size={13} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteUser(u);
                  }}
                  disabled={isBusy}
                  aria-label="Delete user"
                  title="Delete user"
                  style={{
                    width: 28,
                    height: 28,
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
          </div>
        );
      },
    },
  ];

  if (showCreateModal) {
    return (
      <div className="animate-fade-in-up" style={{ width: "100%", maxWidth: 840, margin: "0 auto", paddingBottom: 40 }}>
        {/* Navigation Bar */}
        <div style={{ marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => {
              setShowCreateModal(false);
              setCreatedResult(null);
              setCreateError("");
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "var(--card-bg-crm)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius-pill)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <ArrowLeft size={16} /> Back to Team Directory
          </button>
        </div>

        <SectionCard
          title="Provision New User Account"
          headerRight={
            <Badge variant="info">User Provisioning</Badge>
          }
        >
          <p style={{ margin: "-8px 0 20px", fontSize: 13, color: "var(--text-muted-crm)" }}>
            Creates the user account in the system and automatically dispatches a secure onboarding email.
          </p>

          {createdResult ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div
                style={{
                  padding: 18,
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: 16,
                  textAlign: "center",
                }}
              >
                <CheckCircle2 size={32} color="#10b981" style={{ margin: "0 auto 8px" }} />
                <div style={{ fontWeight: 700, color: "#10b981", fontSize: 14 }}>
                  Account Initialized Successfully!
                </div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "6px 0 0" }}>
                  {createdResult.emailSent
                    ? "A welcome initiation email was dispatched to the user with a secure link to set their password."
                    : "Email dispatch failed. Please share the manual initiation link below:"}
                </p>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  Initiation Link
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    readOnly
                    value={createdResult.setupUrl}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "var(--surface-raised)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-hairline)",
                      fontSize: 12,
                      fontFamily: "monospace",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdResult.setupUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--radius-pill)",
                      border: "none",
                      background: "var(--ink-crm)",
                      color: "var(--ink-crm-text, #FFFFFF)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    {copiedLink ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreatedResult(null);
                  }}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "var(--radius-pill)",
                    border: "none",
                    background: "var(--ink-crm)",
                    color: "var(--ink-crm-text, #FFFFFF)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {createError && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "rgba(239, 68, 68, 0.12)",
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                  Full Name <span style={{ color: "var(--accent-blue)" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
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
                  Email Address <span style={{ color: "var(--accent-blue)" }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="client@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
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
                  Access Role <span style={{ color: "var(--accent-blue)" }}>*</span>
                </label>
                <select
                  value={newRole}
                  onChange={(e) =>
                    setNewRole(e.target.value as "CLIENT" | "ADMIN" | "DEVELOPER" | "FINANCE")
                  }
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
                    cursor: "pointer",
                  }}
                >
                  <option value="CLIENT">Client (Standard Portal Access)</option>
                  <option value="DEVELOPER">Developer (Workspace Access)</option>
                  <option value="FINANCE">Finance (Invoicing &amp; Billing)</option>
                  <option value="ADMIN">Administrator (Full Access)</option>
                </select>
              </div>

              {/* 2-Column Phone & Date of Birth Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6, color: "var(--text-secondary)" }}>
                    Phone {newRole !== "CLIENT" ? "*" : "(Optional)"}
                  </label>
                  <input
                    type="tel"
                    required={newRole !== "CLIENT"}
                    placeholder="+91 98765 43210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
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
                    Date of Birth {newRole !== "CLIENT" ? "*" : "(Optional)"}
                  </label>
                  <input
                    type="date"
                    required={newRole !== "CLIENT"}
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
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

              {/* Action Buttons Footer */}
              <div
                style={{
                  paddingTop: 18,
                  borderTop: "1px solid var(--border-hairline-light)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
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
                  disabled={createLoading}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "var(--radius-pill)",
                    border: "none",
                    background: "var(--ink-crm)",
                    color: "var(--ink-crm-text, #FFFFFF)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: createLoading ? "not-allowed" : "pointer",
                    opacity: createLoading ? 0.7 : 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.15s ease",
                  }}
                >
                  {createLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          )}
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Page Header with Headline Stats Strip */}
      <PageHeader
        titleLine1="Users &"
        titleLine2="Accounts"
        backHref="/admin"
        stats={[
          {
            icon: <UserIcon size={18} strokeWidth={1.8} />,
            value: totalCount,
            badgeLabel: "Accounts",
            badgeVariant: "neutral",
            caption: "Provisioned credentials",
          },
          {
            icon: <CheckCircle2 size={18} strokeWidth={1.8} />,
            value: clientCount,
            badgeLabel: "Clients",
            badgeVariant: "info",
            caption: "Customer client accounts",
          },
          {
            icon: <Shield size={18} strokeWidth={1.8} />,
            value: adminCount,
            badgeLabel: "Admins",
            badgeVariant: "brand",
            caption: "Workspace operators",
          },
        ]}
      />

      {/* Action status message banner */}
      {actionMessage && (
        <div
          role="status"
          style={{
            padding: "12px 18px",
            borderRadius: "var(--radius-row)",
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            background: actionMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: actionMessage.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${actionMessage.type === "success" ? "#a7f3d0" : "#fecaca"}`,
          }}
        >
          {actionMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        {/* Role Filter Pills */}
        <div className="crm-filter-pills" style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {[
            { label: "All Accounts", value: "ALL" },
            { label: "Clients", value: "CLIENT" },
            { label: "Developers", value: "DEVELOPER" },
            { label: "Finance", value: "FINANCE" },
            { label: "Admins", value: "ADMIN" },
            { label: "Suspended", value: "SUSPENDED" },
          ].map((tab) => {
            const isSelected = roleFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setRoleFilter(tab.value)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 500,
                  border: isSelected ? "none" : "1px solid var(--border-hairline)",
                  background: isSelected ? "var(--ink-crm)" : "var(--surface-raised)",
                  color: isSelected ? "var(--ink-crm-text, #FFFFFF)" : "var(--text-secondary)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Create Button */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", flex: "1 1 280px", justifyContent: "flex-end" }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted-crm)",
                pointerEvents: "none",
              }}
            />
            <input
              type="search"
              placeholder="Search name, email, discord..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 14px 8px 34px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border-hairline)",
                background: "var(--surface-raised)",
                color: "var(--text-primary)",
                fontSize: 12,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setShowCreateModal(true);
              setCreatedResult(null);
              setCreateError("");
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
              whiteSpace: "nowrap",
            }}
          >
            <UserPlus size={15} />
            <span>New User</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid: DataTable Left 65% / ProfileCard Right 35% */}
      <div
        className="users-layout-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.8fr) minmax(320px, 1fr)",
          gap: 20,
          alignItems: "start",
          width: "100%",
        }}
      >
        {/* Left Column: Users DataTable */}
        <div>
          <SectionCard
            title={`Account Records (${filteredUsers.length})`}
            showDefaultActions
          >
            <DataTable
              columns={columns}
              data={filteredUsers}
              keyExtractor={(u) => u.id}
              minWidth={720}
              onRowClick={(u) => setSelectedUserId(u.id)}
              emptyState={
                <EmptyState
                  icon={<UserIcon size={24} />}
                  title="No accounts match filter"
                  description="Try adjusting your role filter or search query to find accounts."
                />
              }
            />
          </SectionCard>
        </div>

        {/* Right Column: ProfileCard & Governance Detail Rows */}
        <div>
          {selectedUser ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <ProfileCard
                name={selectedUser.name}
                role={`${selectedUser.role} · ${selectedUser.banned ? "Suspended" : "Active"}`}
                avatarUrl={selectedUser.image}
                userId={selectedUser.id}
                badgeLabel={selectedUser.role}
                badgeVariant={selectedUser.role === "ADMIN" ? "brand" : "neutral"}
                onEdit={() => handleResetPassword(selectedUser)}
                onMessage={() => {
                  window.location.href = `mailto:${selectedUser.email}`;
                }}
                onSecurity={() => {
                  window.location.href = `/admin/users/${selectedUser.id}`;
                }}
                onAdd={() => setShowCreateModal(true)}
              />

              <SectionCard
                title="Account Credentials & State"
                headerRight={
                  <Link
                    href={`/admin/users/${selectedUser.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--accent-blue)",
                      textDecoration: "none",
                    }}
                  >
                    Client Workspace <ExternalLink size={12} />
                  </Link>
                }
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <DetailRow
                    icon={<Mail size={16} strokeWidth={1.8} />}
                    label="Email Address"
                    value={selectedUser.email}
                  />

                  {selectedUser.phone && (
                    <DetailRow
                      icon={<Phone size={16} strokeWidth={1.8} />}
                      label="Phone Number"
                      value={selectedUser.phone}
                    />
                  )}

                  {selectedUser.dateOfBirth && (
                    <DetailRow
                      icon={<Calendar size={16} strokeWidth={1.8} />}
                      label="Date of Birth"
                      value={selectedUser.dateOfBirth}
                    />
                  )}

                  <DetailRow
                    icon={<Shield size={16} strokeWidth={1.8} />}
                    label="Two-Factor (TOTP)"
                    value={selectedUser.twoFactorEnabled ? "Enforced" : "Optional"}
                    action={
                      <Badge variant={selectedUser.twoFactorEnabled ? "success" : "warning"}>
                        {selectedUser.twoFactorEnabled ? "Active" : "Not Set"}
                      </Badge>
                    }
                  />

                  <DetailRow
                    icon={<FolderKanban size={16} strokeWidth={1.8} />}
                    label="Active Projects"
                    value={`${selectedUser._count.projects} client project workspaces`}
                  />

                  <DetailRow
                    icon={<Clock size={16} strokeWidth={1.8} />}
                    label="Member Since"
                    value={new Date(selectedUser.createdAt).toLocaleDateString([], {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  />

                  <DetailRow
                    icon={<UserCheck size={16} strokeWidth={1.8} />}
                    label="Account Access"
                    value={selectedUser.banned ? "Suspended" : "Authorized"}
                    action={
                      <Badge variant={selectedUser.banned ? "warning" : "success"}>
                        {selectedUser.banned ? "Suspended" : "Active"}
                      </Badge>
                    }
                  />

                  {/* Quick Action Button for Selected User */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleResetPassword(selectedUser)}
                      style={{
                        padding: "10px",
                        borderRadius: "var(--radius-pill)",
                        border: "1px solid var(--border-hairline)",
                        background: "var(--surface-raised)",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <KeyRound size={13} />
                      Setup Email
                    </button>

                    {selectedUser.id !== currentAdminId && (
                      <button
                        type="button"
                        onClick={() => handleSuspend(selectedUser)}
                        style={{
                          padding: "10px",
                          borderRadius: "var(--radius-pill)",
                          border: "1px solid var(--border-hairline)",
                          background: selectedUser.banned ? "#ecfdf5" : "var(--surface-raised)",
                          color: selectedUser.banned ? "#059669" : "var(--text-primary)",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <Ban size={13} />
                        {selectedUser.banned ? "Reactivate" : "Suspend"}
                      </button>
                    )}
                  </div>
                </div>
              </SectionCard>
            </div>
          ) : (
            <SectionCard title="Account Overview">
              <EmptyState
                icon={<UserIcon size={20} />}
                title="No user selected"
                description="Select an account row from the table to inspect credentials and settings."
              />
            </SectionCard>
          )}
        </div>
      </div>


      {/* In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <style>{`
        @media (max-width: 1040px) {
          .users-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
