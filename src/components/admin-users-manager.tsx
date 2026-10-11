"use client";

import { useState } from "react";
import {
  UserPlus,
  Shield,
  KeyRound,
  Trash2,
  Ban,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Mail,
  Loader2,
  Search,
  Filter,
  Check,
} from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
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

export function AdminUsersManager({ initialUsers, currentAdminId }: { initialUsers: UserItem[]; currentAdminId: string }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states for creating a new user
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"CLIENT" | "ADMIN" | "DEVELOPER" | "FINANCE">("CLIENT");
  const [createdResult, setCreatedResult] = useState<{ setupUrl: string; emailSent: boolean } | null>(null);

  // Loading states for actions
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.discordHandle && u.discordHandle.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    setCreatedResult(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, email: newEmail, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user.");

      setCreatedResult({ setupUrl: data.setupUrl, emailSent: data.emailSent });
      // Add new user to state
      setUsers([
        {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          emailVerified: true,
          twoFactorEnabled: false,
          banned: false,
          createdAt: new Date().toISOString(),
          _count: { projects: 0, authSessions: 0 },
        },
        ...users,
      ]);
      setNewName("");
      setNewEmail("");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Error creating user");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleSuspend(user: UserItem) {
    if (user.id === currentAdminId) return;
    const isSuspending = !user.banned;
    const promptText = isSuspending
      ? `Are you sure you want to suspend ${user.name} (${user.email})? They will be logged out immediately.`
      : `Reactivate account for ${user.name}?`;
    if (!window.confirm(promptText)) return;

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
    } catch (err) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update user." });
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleResetPassword(user: UserItem) {
    if (!window.confirm(`Send password reset email to ${user.email}?`)) return;

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

      setActionMessage({
        type: "success",
        text: data.emailSent
          ? `Password reset email sent to ${user.email} successfully!`
          : `Password reset link generated: ${data.resetUrl}`,
      });
    } catch (err) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to reset password." });
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleDeleteUser(user: UserItem) {
    if (user.id === currentAdminId) {
      alert("You cannot delete your own administrative account.");
      return;
    }
    if (!window.confirm(`DANGER: Permanently delete ${user.name} (${user.email})? This action cannot be reversed.`)) {
      return;
    }

    setBusyUserId(user.id);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");

      setUsers(users.filter((u) => u.id !== user.id));
      setActionMessage({ type: "success", text: `User ${user.email} was permanently deleted.` });
    } catch (err) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to delete user." });
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Top Banner and Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, letterSpacing: "-.05em", margin: "0 0 6px", color: "var(--ink)" }}>
            Users & Client Accounts
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            Manage client workspaces, create accounts with welcome initiation emails, reset passwords, or suspend access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCreateModal(true);
            setCreatedResult(null);
            setCreateError("");
          }}
          className="button"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12 }}
        >
          <UserPlus size={16} />
          <span>Create New User</span>
        </button>
      </div>

      {actionMessage && (
        <div
          role="status"
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 10,
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
      <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or Discord handle..."
            className="field"
            style={{ paddingLeft: 38, width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Filter size={15} style={{ color: "var(--muted)" }} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="field"
            style={{ width: "auto", padding: "8px 12px" }}
          >
            <option value="ALL">All Roles</option>
            <option value="CLIENT">Clients Only</option>
            <option value="DEVELOPER">Developers Only</option>
            <option value="FINANCE">Finance Only</option>
            <option value="ADMIN">Administrators Only</option>
          </select>
          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
            {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 24, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em" }}>
              <th style={{ padding: "12px 14px" }}>User</th>
              <th style={{ padding: "12px 14px" }}>Role</th>
              <th style={{ padding: "12px 14px" }}>Status</th>
              <th style={{ padding: "12px 14px" }}>Projects</th>
              <th style={{ padding: "12px 14px" }}>Joined</th>
              <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "40px 14px", textAlign: "center", color: "var(--muted)" }}>
                  No users match your criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isCurrentAdmin = u.id === currentAdminId;
                const isBusy = busyUserId === u.id;

                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: "1px solid var(--line)",
                      opacity: u.banned ? 0.6 : 1,
                      transition: "background 0.15s",
                    }}
                  >
                    <td style={{ padding: "14px" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
                          {u.name}
                          {isCurrentAdmin && (
                            <span style={{ fontSize: 10, background: "rgba(108,76,255,0.1)", color: "#6C4CFF", padding: "1px 6px", borderRadius: 4 }}>
                              You
                            </span>
                          )}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>{u.email}</span>
                        {u.discordHandle && (
                          <span style={{ fontSize: 11, color: "#5865F2", marginTop: 2 }}>
                            @{u.discordHandle}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "14px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background:
                            u.role === "ADMIN"
                              ? "rgba(108,76,255,0.12)"
                              : u.role === "DEVELOPER"
                              ? "rgba(16,185,129,0.12)"
                              : u.role === "FINANCE"
                              ? "rgba(245,158,11,0.12)"
                              : "rgba(59,130,246,0.12)",
                          color:
                            u.role === "ADMIN"
                              ? "#6C4CFF"
                              : u.role === "DEVELOPER"
                              ? "#059669"
                              : u.role === "FINANCE"
                              ? "#d97706"
                              : "#2563eb",
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "14px" }}>
                      {u.banned ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", background: "rgba(220,38,38,0.1)", padding: "2px 8px", borderRadius: 6 }}>
                          Suspended
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 6 }}>
                          Active
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "14px", color: "var(--muted)" }}>
                      {u._count.projects} projects
                    </td>
                    <td style={{ padding: "14px", color: "var(--muted)", fontSize: 12 }}>
                      {new Date(u.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "14px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {/* Reset Password Button */}
                        <button
                          type="button"
                          onClick={() => handleResetPassword(u)}
                          disabled={isBusy}
                          className="button button-outline"
                          style={{ padding: "6px 10px", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}
                          title="Generate and send password setup/reset link"
                        >
                          <KeyRound size={13} />
                          <span>Reset PW</span>
                        </button>

                        {/* Suspend / Reactivate Button */}
                        {!isCurrentAdmin && (
                          <button
                            type="button"
                            onClick={() => handleSuspend(u)}
                            disabled={isBusy}
                            className="button button-outline"
                            style={{
                              padding: "6px 10px",
                              fontSize: 11,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              color: u.banned ? "#10b981" : "#d97706",
                              borderColor: u.banned ? "rgba(16,185,129,0.3)" : "rgba(217,119,6,0.3)",
                            }}
                            title={u.banned ? "Reactivate user account" : "Suspend user account"}
                          >
                            <Ban size={13} />
                            <span>{u.banned ? "Unsuspend" : "Suspend"}</span>
                          </button>
                        )}

                        {/* Delete User Button */}
                        {!isCurrentAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            disabled={isBusy}
                            className="button button-outline"
                            style={{
                              padding: "6px 8px",
                              color: "#ef4444",
                              borderColor: "rgba(239,68,68,0.3)",
                              background: "rgba(239,68,68,0.05)",
                            }}
                            title="Permanently delete user"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
            zIndex: 50,
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div className="card user-modal-card" style={{ maxWidth: 520, width: "100%", padding: 32, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="eyebrow">Studio Provisioning</div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            <h2 style={{ fontSize: 22, letterSpacing: "-.04em", margin: "0 0 8px", color: "var(--ink)" }}>
              Create New User Account
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
              The new user will automatically receive a beautifully formatted initiation email from{" "}
              <strong>nova@allskyfares.com</strong> containing their secure setup link to set their password.
            </p>

            {createError && (
              <div
                role="alert"
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  background: "#fef2f2",
                  color: "#991b1b",
                  border: "1px solid #fecaca",
                  marginBottom: 16,
                }}
              >
                {createError}
              </div>
            )}

            {createdResult ? (
              <div style={{ display: "grid", gap: 14 }}>
                <div
                  style={{
                    padding: "16px",
                    borderRadius: 12,
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    color: "#065f46",
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14 }}>
                    <CheckCircle2 size={18} />
                    <span>User created successfully!</span>
                  </div>
                  <p style={{ fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                    {createdResult.emailSent
                      ? "The initiation email has been dispatched via Hostinger SMTP to their inbox."
                      : "The user was created. You can share the setup link below directly with them:"}
                  </p>
                </div>

                <div>
                  <label className="auth-label" style={{ fontSize: 11, marginBottom: 4 }}>
                    One-time Password Setup Link:
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      readOnly
                      value={createdResult.setupUrl}
                      className="field"
                      style={{ fontSize: 11, background: "var(--paper)" }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(createdResult.setupUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      }}
                      className="button button-outline"
                      style={{ padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}
                      title="Copy URL"
                    >
                      {copiedLink ? (
                        <>
                          <Check size={14} style={{ color: "#059669" }} />
                          <span style={{ color: "#059669", fontWeight: 700 }}>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreatedResult(null);
                  }}
                  className="button"
                  style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} style={{ display: "grid", gap: 16 }}>
                <div>
                  <label htmlFor="user-name" className="auth-label" style={{ display: "block", marginBottom: 6 }}>
                    Full Name
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Jane Doe"
                    className="field"
                  />
                </div>

                <div>
                  <label htmlFor="user-email" className="auth-label" style={{ display: "block", marginBottom: 6 }}>
                    Email Address
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="jane@clientdomain.com"
                    className="field"
                  />
                </div>

                <div>
                  <label htmlFor="user-role" className="auth-label" style={{ display: "block", marginBottom: 6 }}>
                    Account Role
                  </label>
                  <select
                    id="user-role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as "CLIENT" | "ADMIN" | "DEVELOPER" | "FINANCE")}
                    className="field"
                  >
                    <option value="CLIENT">Client (Standard Portal Access)</option>
                    <option value="DEVELOPER">Developer (Sprint & Technical Workspace)</option>
                    <option value="FINANCE">Finance (Invoicing & Budget Workspace)</option>
                    <option value="ADMIN">Administrator (Full Studio Control)</option>
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="button button-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={createLoading} className="button">
                    {createLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Provisioning...
                      </>
                    ) : (
                      "Create & Send Invitation"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .user-modal-card {
            padding: 22px 18px !important;
          }
        }
      `}</style>
    </div>
  );
}
