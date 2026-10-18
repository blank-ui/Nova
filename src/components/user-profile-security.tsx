"use client";

import { FormEvent, useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  User,
  Mail,
  KeyRound,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { PasswordInput } from "@/components/password-input";
import { evaluatePasswordStrength } from "@/lib/password-policy";
import { useToast } from "@/components/toast";
import { Avatar, AvatarMenu } from "@/components/admin-ui";

interface UserProfileSecurityProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string | null;
    dateOfBirth?: string | Date | null;
    image?: string | null;
    twoFactorEnabled: boolean;
    discordHandle?: string | null;
  };
  accountRole: "ADMIN" | "CLIENT";
  googleAvailable: boolean;
  discordAvailable?: boolean;
}

type TabKey = "profile" | "account" | "security" | "mfa" | "sessions";

export function UserProfileSecurity({
  initialUser,
  accountRole,
  googleAvailable,
  discordAvailable = false,
}: UserProfileSecurityProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const toast = useToast();

  // Detect status / linked params from OAuth redirect on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const linked = params.get("linked");
    const errorParam = params.get("error");
    const errorDesc = params.get("error_description");

    if (linked === "discord") {
      toast.success("Your Discord account has been authorized and securely linked to your profile!", "Discord Connected");
      setSavedDiscordHandle("superr_nova_");
      setDiscordHandle("superr_nova_");
      // Clean query param from URL without reload
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    } else if (errorParam) {
      const friendlyMsg =
        errorParam === "account_already_linked_to_different_user"
          ? "This Discord account is already connected to another user."
          : errorParam === "email_does_not_match"
          ? "The Discord account email does not match your current account."
          : errorDesc || `Discord authorization could not be completed (${errorParam}).`;
      toast.error(friendlyMsg, "Authorization Notice");
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, [toast]);

  // Live session — gives us accurate twoFactorEnabled after mutations
  const { data: liveSession, refetch: refetchSession } = authClient.useSession();
  const liveTwoFactorEnabled = liveSession?.user?.twoFactorEnabled;

  // Profile fields state
  const [name, setName] = useState(initialUser.name);
  const [phone, setPhone] = useState(initialUser.phone ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(() => {
    if (!initialUser.dateOfBirth) return "";
    const d = new Date(initialUser.dateOfBirth);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialUser.image ?? null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const initialDobStr = initialUser.dateOfBirth
    ? new Date(initialUser.dateOfBirth).toISOString().split("T")[0]
    : "";
  const isProfileDirty =
    name.trim() !== initialUser.name ||
    phone.trim() !== (initialUser.phone ?? "") ||
    dateOfBirth !== initialDobStr;
  const maxDobStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    function onAvatarUpdated(e: Event) {
      const customEvent = e as CustomEvent<{ userId?: string; avatarUrl: string | null }>;
      if (!customEvent.detail) return;
      if (!customEvent.detail.userId || customEvent.detail.userId === initialUser.id) {
        setAvatarUrl(customEvent.detail.avatarUrl);
      }
    }
    window.addEventListener("nova:avatar-updated", onAvatarUpdated);
    return () => window.removeEventListener("nova:avatar-updated", onAvatarUpdated);
  }, [initialUser.id]);

  // Discord integration state
  const initialDiscord = initialUser.discordHandle ?? "";
  const [discordHandle, setDiscordHandle] = useState(initialDiscord);
  const [savedDiscordHandle, setSavedDiscordHandle] = useState(initialDiscord);
  const [discordSaving, setDiscordSaving] = useState(false);
  const [discordDisconnecting, setDiscordDisconnecting] = useState(false);
  const [discordMessage, setDiscordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleLinkDiscordOAuth() {
    setDiscordSaving(true);
    setDiscordMessage(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://nova.allskyfares.com";
      const targetPage = accountRole === "ADMIN" ? "/admin/security" : "/portal/security";
      const callbackURL = `${origin}${targetPage}?linked=discord`;
      const errorCallbackURL = `${origin}${targetPage}?error=discord_link_failed`;
      await authClient.linkSocial({
        provider: "discord",
        callbackURL,
        errorCallbackURL,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start Discord OAuth linking.";
      setDiscordMessage({ type: "error", text: msg });
      toast.error(msg, "Discord Linking Failed");
      setDiscordSaving(false);
    }
  }

  async function handleDiscordSave(e?: FormEvent) {
    if (e) e.preventDefault();
    const clean = discordHandle.trim().replace(/^@/, "");
    if (!clean) {
      const msg = "Please provide a valid Discord username or tag.";
      setDiscordMessage({ type: "error", text: msg });
      toast.error(msg, "Validation Error");
      return;
    }
    setDiscordSaving(true);
    setDiscordMessage(null);
    try {
      const res = await fetch("/api/user/discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: clean }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to link Discord handle.");
      setSavedDiscordHandle(data.discordHandle || clean);
      setDiscordHandle(data.discordHandle || clean);
      const successText = `Successfully linked Discord account: @${data.discordHandle || clean}`;
      setDiscordMessage({ type: "success", text: successText });
      toast.success(successText, "Discord Connected");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to link Discord account.";
      setDiscordMessage({ type: "error", text: msg });
      toast.error(msg, "Discord Error");
    } finally {
      setDiscordSaving(false);
    }
  }

  async function handleDiscordDisconnect() {
    setDiscordDisconnecting(true);
    setDiscordMessage(null);
    try {
      const res = await fetch("/api/user/discord", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disconnect Discord.");
      setSavedDiscordHandle("");
      setDiscordHandle("");
      const successText = "Discord account disconnected.";
      setDiscordMessage({ type: "success", text: successText });
      toast.info(successText, "Discord Disconnected");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to disconnect Discord.";
      setDiscordMessage({ type: "error", text: msg });
      toast.error(msg, "Disconnect Failed");
    } finally {
      setDiscordDisconnecting(false);
    }
  }

  // Email change state
  const [currentEmail] = useState(initialUser.email);
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherOnPasswordChange, setRevokeOtherOnPasswordChange] = useState(true);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // MFA local override — only set during explicit enable/disable mutations
  // so the UI responds instantly without waiting for a session refetch.
  // null means "defer to the live session value".
  const [mfaOverride, setMfaOverride] = useState<boolean | null>(null);

  // Derive the effective mfaEnabled value:
  // 1. If we just mutated in this session, use the override for instant feedback.
  // 2. Otherwise, use the live session (most accurate, auto-updates after refetch).
  // 3. Fall back to the server-rendered prop (initial SSR value).
  const mfaEnabled =
    mfaOverride !== null
      ? mfaOverride
      : liveTwoFactorEnabled !== undefined
      ? liveTwoFactorEnabled
      : initialUser.twoFactorEnabled;

  // Thin setMfaEnabled wrapper for existing handlers below
  function setMfaEnabled(val: boolean) {
    setMfaOverride(val);
  }
  const [mfaPassword, setMfaPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaMessage, setMfaMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  // Sessions state
  const [sessionsBusy, setSessionsBusy] = useState(false);
  const [sessionsMessage, setSessionsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Profile Update
  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      const msg = "Display name must be at least 2 characters.";
      setProfileMessage({ type: "error", text: msg });
      toast.error(msg, "Validation Error");
      return;
    }

    if (dateOfBirth) {
      const parsedDob = new Date(dateOfBirth);
      if (isNaN(parsedDob.getTime()) || parsedDob > new Date()) {
        const msg = "Date of birth cannot be in the future.";
        setProfileMessage({ type: "error", text: msg });
        toast.error(msg, "Validation Error");
        return;
      }
    }

    setProfileSaving(true);
    setProfileMessage(null);
    try {
      // 1. Update user profile (name, phone, dateOfBirth) in database
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          phone: phone.trim() || null,
          dateOfBirth: dateOfBirth ? dateOfBirth : null,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update profile information.");
      }

      // 2. Also keep Better Auth session cookie updated if name changed
      if (trimmed !== initialUser.name) {
        await fetch("/api/auth/update-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        }).catch(() => null);
      }

      refetchSession?.();

      setProfileMessage({ type: "success", text: "Profile information updated successfully." });
      toast.success("Profile information updated successfully.", "Profile Saved");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Profile update failed.";
      setProfileMessage({ type: "error", text: msg });
      toast.error(msg, "Update Failed");
    } finally {
      setProfileSaving(false);
    }
  }

  // 2. Verified Email Change Request
  async function handleEmailChange(e: FormEvent) {
    e.preventDefault();
    const target = newEmail.trim().toLowerCase();
    if (!target || target === currentEmail.toLowerCase()) {
      const msg = "Please provide a new email address different from your current one.";
      setEmailMessage({ type: "error", text: msg });
      toast.error(msg, "Invalid Email");
      return;
    }
    setEmailSaving(true);
    setEmailMessage(null);
    try {
      const res = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newEmail: target,
          callbackURL: accountRole === "ADMIN" ? "/admin/security" : "/portal/security",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to submit email change request.");
      }
      const successText = `A verification link has been sent to ${target}. Your account email will update once verified.`;
      setEmailMessage({
        type: "success",
        text: successText,
      });
      toast.info(successText, "Verification Link Sent");
      setNewEmail("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Email change failed.";
      setEmailMessage({ type: "error", text: msg });
      toast.error(msg, "Email Change Failed");
    } finally {
      setEmailSaving(false);
    }
  }

  // 3. Password Change
  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    const strength = evaluatePasswordStrength(newPassword);
    if (!strength.isValid) {
      const msg = "New password must be 6 to 12 characters and include uppercase, lowercase, and a special symbol.";
      setPasswordMessage({
        type: "error",
        text: msg,
      });
      toast.error(msg, "Password Policy Requirement");
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = "New passwords do not match.";
      setPasswordMessage({ type: "error", text: msg });
      toast.error(msg, "Password Mismatch");
      return;
    }
    setPasswordSaving(true);
    setPasswordMessage(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          revokeOtherSessions: revokeOtherOnPasswordChange,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Password update failed. Verify your current password.");
      }
      setPasswordMessage({ type: "success", text: "Password changed successfully." });
      toast.success("Your password has been changed successfully.", "Password Updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Password update failed.";
      setPasswordMessage({ type: "error", text: msg });
      toast.error(msg, "Password Update Failed");
    } finally {
      setPasswordSaving(false);
    }
  }

  // 4. MFA Enrollment & Verification
  async function handleStartMfa(e: FormEvent) {
    e.preventDefault();
    setMfaBusy(true);
    setMfaMessage(null);
    try {
      const result = await authClient.twoFactor.enable({
        password: mfaPassword,
        issuer: "Nova",
      });
      if (result.error || !result.data) {
        throw new Error(result.error?.message || "Could not begin MFA enrollment. Verify your password.");
      }
      if ("totpURI" in result.data && result.data.totpURI) {
        const uri = new URL(result.data.totpURI);
        setMfaSecret(uri.searchParams.get("secret") ?? "");
        setBackupCodes(result.data.backupCodes ?? []);
      }
      const successText = "Authenticator secret generated. Add this secret to your authenticator app, then verify a code below.";
      setMfaMessage({
        type: "success",
        text: successText,
      });
      toast.info(successText, "MFA Secret Ready");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "MFA setup failed.";
      setMfaMessage({ type: "error", text: msg });
      toast.error(msg, "MFA Setup Failed");
    } finally {
      setMfaBusy(false);
    }
  }

  async function handleVerifyMfa(e: FormEvent) {
    e.preventDefault();
    setMfaBusy(true);
    setMfaMessage(null);
    try {
      const result = await authClient.twoFactor.verifyTotp({
        code: mfaCode.replace(/\s/g, ""),
        trustDevice: false,
      });
      if (result.error) {
        throw new Error("Invalid authenticator code. Check your app's current 6-digit code.");
      }
      setMfaEnabled(true);
      setMfaSecret("");
      setMfaCode("");
      setMfaPassword("");
      void refetchSession();
      const successText = "MFA enabled and verified successfully for your account!";
      setMfaMessage({ type: "success", text: successText });
      toast.success(successText, "Two-Factor Auth Active");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Verification failed.";
      setMfaMessage({ type: "error", text: msg });
      toast.error(msg, "Verification Failed");
    } finally {
      setMfaBusy(false);
    }
  }

  async function handleGenerateBackupCodes() {
    setMfaBusy(true);
    setMfaMessage(null);
    try {
      const result = await authClient.twoFactor.generateBackupCodes({
        password: mfaPassword || "dummy",
      });
      if (result.error || !result.data?.backupCodes) {
        throw new Error(result.error?.message || "Failed to regenerate backup codes.");
      }
      setBackupCodes(result.data.backupCodes);
      const successText = "New backup codes generated. Old backup codes have been invalidated.";
      setMfaMessage({ type: "success", text: successText });
      toast.success(successText, "Backup Codes Updated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Regeneration failed.";
      setMfaMessage({ type: "error", text: msg });
      toast.error(msg, "Regeneration Failed");
    } finally {
      setMfaBusy(false);
    }
  }

  async function handleDisableMfa(e: FormEvent) {
    e.preventDefault();
    setMfaBusy(true);
    setMfaMessage(null);
    try {
      const result = await authClient.twoFactor.disable({
        password: disablePassword,
      });
      if (result.error) {
        throw new Error(result.error?.message || "Failed to disable MFA. Verify your current password.");
      }
      setMfaEnabled(false);
      setShowDisableConfirm(false);
      setDisablePassword("");
      void refetchSession();
      const successText = "Multi-factor authentication has been disabled.";
      setMfaMessage({ type: "success", text: successText });
      toast.warning(successText, "MFA Disabled");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Disable MFA failed.";
      setMfaMessage({ type: "error", text: msg });
      toast.error(msg, "MFA Disable Failed");
    } finally {
      setMfaBusy(false);
    }
  }

  // 5. Sessions Management
  async function handleRevokeOtherSessions() {
    setSessionsBusy(true);
    setSessionsMessage(null);
    try {
      const result = await authClient.revokeOtherSessions();
      if (result.error) throw new Error("Could not revoke other sessions.");
      const successText = "All other active sessions have been signed out.";
      setSessionsMessage({ type: "success", text: successText });
      toast.success(successText, "Sessions Revoked");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Revocation failed.";
      setSessionsMessage({ type: "error", text: msg });
      toast.error(msg, "Revocation Failed");
    } finally {
      setSessionsBusy(false);
    }
  }

  async function handleSignOutAll() {
    setSessionsBusy(true);
    try {
      toast.info("Signing out from all devices...", "Signing Out");
      await authClient.signOut();
      window.location.assign("/");
    } catch {
      const msg = "Sign out failed. Please refresh.";
      setSessionsMessage({ type: "error", text: msg });
      toast.error(msg, "Sign Out Failed");
      setSessionsBusy(false);
    }
  }

  async function handleLinkGoogle() {
    setSessionsBusy(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://nova.allskyfares.com";
      const targetPage = accountRole === "ADMIN" ? "/admin/security" : "/portal/security";
      const result = await authClient.linkSocial({
        provider: "google",
        callbackURL: `${origin}${targetPage}?linked=google`,
        errorCallbackURL: `${origin}${targetPage}?error=google_link_failed`,
      });
      if (result.error) throw new Error("Google account linking failed.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google linking failed.";
      setSessionsMessage({ type: "error", text: msg });
      toast.error(msg, "Google Link Failed");
      setSessionsBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 840, margin: "0 auto" }}>
      {/* Settings Navigation Tabs - Segmented Pill Bar */}
      <nav
        aria-label="Settings sections"
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: 6,
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: 6,
          marginBottom: 28,
          overflowX: "auto",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          style={{
            padding: "9px 16px",
            border: activeTab === "profile" ? "1px solid var(--line)" : "1px solid transparent",
            background: activeTab === "profile" ? "var(--card-bg)" : "transparent",
            color: activeTab === "profile" ? "var(--ink)" : "var(--muted)",
            fontWeight: activeTab === "profile" ? 700 : 500,
            fontSize: 13,
            borderRadius: 10,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
            boxShadow: activeTab === "profile" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.18s ease",
          }}
        >
          <User size={15} color={activeTab === "profile" ? "var(--blue)" : "currentColor"} />
          Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("account")}
          style={{
            padding: "9px 16px",
            border: activeTab === "account" ? "1px solid var(--line)" : "1px solid transparent",
            background: activeTab === "account" ? "var(--card-bg)" : "transparent",
            color: activeTab === "account" ? "var(--ink)" : "var(--muted)",
            fontWeight: activeTab === "account" ? 700 : 500,
            fontSize: 13,
            borderRadius: 10,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
            boxShadow: activeTab === "account" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.18s ease",
          }}
        >
          <Mail size={15} color={activeTab === "account" ? "var(--blue)" : "currentColor"} />
          Account & Email
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          style={{
            padding: "9px 16px",
            border: activeTab === "security" ? "1px solid var(--line)" : "1px solid transparent",
            background: activeTab === "security" ? "var(--card-bg)" : "transparent",
            color: activeTab === "security" ? "var(--ink)" : "var(--muted)",
            fontWeight: activeTab === "security" ? 700 : 500,
            fontSize: 13,
            borderRadius: 10,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
            boxShadow: activeTab === "security" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.18s ease",
          }}
        >
          <KeyRound size={15} color={activeTab === "security" ? "var(--blue)" : "currentColor"} />
          Password
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mfa")}
          style={{
            padding: "9px 16px",
            border: activeTab === "mfa" ? "1px solid var(--line)" : "1px solid transparent",
            background: activeTab === "mfa" ? "var(--card-bg)" : "transparent",
            color: activeTab === "mfa" ? "var(--ink)" : "var(--muted)",
            fontWeight: activeTab === "mfa" ? 700 : 500,
            fontSize: 13,
            borderRadius: 10,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
            boxShadow: activeTab === "mfa" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.18s ease",
          }}
        >
          <ShieldCheck size={15} color={activeTab === "mfa" ? "var(--blue)" : "currentColor"} />
          <span>Multi-Factor Auth</span>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: mfaEnabled ? "#10b981" : "#f59e0b",
              display: "inline-block",
            }}
            title={mfaEnabled ? "MFA Active" : "MFA Disabled"}
          />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sessions")}
          style={{
            padding: "9px 16px",
            border: activeTab === "sessions" ? "1px solid var(--line)" : "1px solid transparent",
            background: activeTab === "sessions" ? "var(--card-bg)" : "transparent",
            color: activeTab === "sessions" ? "var(--ink)" : "var(--muted)",
            fontWeight: activeTab === "sessions" ? 700 : 500,
            fontSize: 13,
            borderRadius: 10,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
            boxShadow: activeTab === "sessions" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.18s ease",
          }}
        >
          <Laptop size={15} color={activeTab === "sessions" ? "var(--blue)" : "currentColor"} />
          Sessions & Devices
        </button>
      </nav>

      {/* =================================================================== */}
      {/* TAB 1: Profile Settings                                             */}
      {/* =================================================================== */}
      {activeTab === "profile" && (
        <section className="card security-card animate-fade-in-up" style={{ padding: 32 }}>
          <div className="eyebrow">Personal Information</div>
          <h2 style={{ fontSize: 22, letterSpacing: "-.04em", margin: "6px 0 10px" }}>Display Profile</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 24px" }}>
            Update your public display name and profile picture shown across project updates, discussions, and activity logs.
          </p>

          {/* Profile Picture & Avatar Management */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "20px 24px",
              background: "var(--surface-raised, #F7F8FA)",
              border: "1px solid var(--border-hairline, #C8CED7)",
              borderRadius: 20,
              marginBottom: 28,
              maxWidth: 640,
              flexWrap: "wrap",
            }}
          >
            <Avatar
              src={avatarUrl}
              name={name}
              size="lg"
              userId={initialUser.id}
              editable={true}
              onAvatarChanged={(newUrl) => setAvatarUrl(newUrl)}
            />

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                  Profile Picture
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: avatarUrl ? "rgba(16,185,129,0.12)" : "rgba(108,76,224,0.12)",
                    color: avatarUrl ? "#059669" : "#6C4CE0",
                  }}
                >
                  {avatarUrl ? "Custom Photo Set" : "Using Default Initial"}
                </span>
              </div>
              <p style={{ margin: "0", fontSize: 12, color: "var(--text-muted-crm)", lineHeight: 1.5 }}>
                Click the camera icon on your avatar to upload, reposition, crop, or remove your photo. JPEG, PNG, or WebP up to 2 MB.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} style={{ display: "grid", gap: 20, maxWidth: 640 }}>
            <div>
              <label htmlFor="display-name" style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--text-secondary, var(--ink))" }}>
                Display Name *
              </label>
              <input
                id="display-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                className="field"
              />
            </div>

            {/* Phone Number & Date of Birth (Responsive 2-column grid) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              <div>
                <label htmlFor="profile-phone" style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--text-secondary, var(--ink))" }}>
                  Phone Number
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={30}
                  className="field"
                  style={{ width: "100%" }}
                />
                <span style={{ fontSize: 11, color: "var(--muted)", display: "block", marginTop: 4 }}>
                  For direct updates, consultation scheduling &amp; verification.
                </span>
              </div>

              <div>
                <label htmlFor="profile-dob" style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--text-secondary, var(--ink))" }}>
                  Date of Birth
                </label>
                <input
                  id="profile-dob"
                  type="date"
                  max={maxDobStr}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="field"
                  style={{ width: "100%" }}
                />
                <span style={{ fontSize: 11, color: "var(--muted)", display: "block", marginTop: 4 }}>
                  Account identity verification and age compliance.
                </span>
              </div>
            </div>

            {/* Role Card */}
            <div>
              <span style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--text-secondary, var(--ink))" }}>
                Account Role &amp; Permissions
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderRadius: 14,
                  background: "var(--surface-raised, var(--paper))",
                  border: "1px solid var(--border-hairline, var(--line))",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: initialUser.role === "ADMIN" ? "rgba(108,76,255,0.14)" : "rgba(16,185,129,0.14)",
                      display: "grid",
                      placeItems: "center",
                      color: initialUser.role === "ADMIN" ? "var(--blue)" : "#10b981",
                      flexShrink: 0,
                    }}
                  >
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
                      {initialUser.role === "ADMIN"
                        ? "System Administrator"
                        : initialUser.role === "DEVELOPER"
                        ? "Software & System Engineer"
                        : initialUser.role === "FINANCE"
                        ? "Financial & Billing Specialist"
                        : "Client Account"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3, lineHeight: 1.5 }}>
                      {initialUser.role === "ADMIN"
                        ? "Full administrative control across CRM inquiries, client workspaces, and system settings."
                        : initialUser.role === "DEVELOPER"
                        ? "Direct access to engineering sprints, technical tasks, codebase milestones, and project infrastructure."
                        : initialUser.role === "FINANCE"
                        ? "Full visibility into project billing, client estimates, scopes, and budget analytics."
                        : "Dedicated client workspace access for milestones, tasks, and deliverables."}
                    </div>
                  </div>
                </div>
                <span
                  className="eyebrow"
                  style={{
                    padding: "5px 12px",
                    borderRadius: 99,
                    background:
                      initialUser.role === "ADMIN"
                        ? "rgba(108,76,255,0.18)"
                        : initialUser.role === "DEVELOPER"
                        ? "rgba(16,185,129,0.18)"
                        : initialUser.role === "FINANCE"
                        ? "rgba(245,158,11,0.18)"
                        : "rgba(59,130,246,0.18)",
                    color:
                      initialUser.role === "ADMIN"
                        ? "var(--blue)"
                        : initialUser.role === "DEVELOPER"
                        ? "#047857"
                        : initialUser.role === "FINANCE"
                        ? "#d97706"
                        : "#2563eb",
                    fontWeight: 700,
                  }}
                >
                  {initialUser.role}
                </span>
              </div>
            </div>

            {profileMessage && (
              <div
                role="status"
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: profileMessage.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                  color: profileMessage.type === "success" ? "#10b981" : "#ef4444",
                  border: `1px solid ${profileMessage.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                }}
              >
                {profileMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 6,
                paddingTop: 18,
                borderTop: "1px solid var(--line)",
              }}
            >
              <button type="submit" disabled={profileSaving || !isProfileDirty} className="button" style={{ minWidth: 140 }}>
                {profileSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Changes"}
              </button>
              {isProfileDirty && (
                <button
                  type="button"
                  onClick={() => {
                    setName(initialUser.name);
                    setPhone(initialUser.phone ?? "");
                    setDateOfBirth(initialDobStr);
                    setProfileMessage(null);
                  }}
                  className="button button-outline"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Connected Accounts: Discord Integration Card */}
          <div
            style={{
              marginTop: 32,
              paddingTop: 28,
              borderTop: "1px solid var(--line)",
              maxWidth: 640,
            }}
          >
            <div className="eyebrow" style={{ color: "#5865F2", display: "flex", alignItems: "center", gap: 6 }}>
              <DiscordIcon size={14} /> Connected Channels & Integrations
            </div>
            <h3 style={{ fontSize: 18, letterSpacing: "-.03em", margin: "6px 0 10px", color: "var(--ink)" }}>
              Discord Integration
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 20px" }}>
              Connect your Discord handle to coordinate directly with the Nova operations team and receive project status updates.
            </p>

            <div
              style={{
                padding: "20px 22px",
                borderRadius: 16,
                background: "var(--paper)",
                border: "1px solid var(--line)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "rgba(88, 101, 242, 0.12)",
                      border: "1px solid rgba(88, 101, 242, 0.25)",
                      display: "grid",
                      placeItems: "center",
                      color: "#5865F2",
                      flexShrink: 0,
                    }}
                  >
                    <DiscordIcon size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
                      Discord Account
                      {savedDiscordHandle ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 99,
                            background: "rgba(16, 185, 129, 0.12)",
                            color: "#059669",
                            border: "1px solid rgba(16, 185, 129, 0.25)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                          Connected
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 99,
                            background: "rgba(156, 163, 175, 0.12)",
                            color: "var(--muted)",
                            border: "1px solid var(--line)",
                          }}
                        >
                          Not Connected
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
                      {savedDiscordHandle ? (
                        <span>Linked handle: <strong style={{ color: "var(--ink)" }}>@{savedDiscordHandle}</strong>{discordAvailable ? " • Discord OAuth sign-in enabled" : ""}</span>
                      ) : (
                        <span>Link your Discord ID (e.g. <strong>superr_nova_</strong>){discordAvailable ? " • Discord OAuth sign-in enabled" : ""}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {discordAvailable && (
                    <button
                      type="button"
                      onClick={handleLinkDiscordOAuth}
                      disabled={discordSaving}
                      className="button button-outline"
                      style={{
                        padding: "7px 14px",
                        fontSize: 12,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "rgba(88, 101, 242, 0.1)",
                        borderColor: "rgba(88, 101, 242, 0.4)",
                        color: "#5865F2",
                        fontWeight: 600,
                      }}
                    >
                      <DiscordIcon size={14} />
                      <span>Authorize Discord OAuth</span>
                    </button>
                  )}
                  {savedDiscordHandle && (
                    <a
                      href={`https://discord.com/users/${savedDiscordHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button button-outline"
                      style={{ padding: "7px 14px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <span>Open Discord DM</span>
                      <ArrowUpRight size={13} />
                    </a>
                  )}
                </div>
              </div>

              {/* Input & Action controls */}
              <form onSubmit={handleDiscordSave} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--muted)",
                      fontWeight: 700,
                      fontSize: 13,
                      pointerEvents: "none",
                    }}
                  >
                    @
                  </span>
                  <input
                    type="text"
                    className="field"
                    style={{ paddingLeft: 30 }}
                    value={discordHandle}
                    onChange={(e) => setDiscordHandle(e.target.value)}
                    placeholder="superr_nova_"
                    maxLength={32}
                  />
                </div>
                <button
                  type="submit"
                  disabled={discordSaving || !discordHandle.trim() || discordHandle.trim() === savedDiscordHandle}
                  className="button"
                  style={{ padding: "11px 18px", fontSize: 13 }}
                >
                  {discordSaving ? <><Loader2 size={13} className="animate-spin" /> Linking...</> : savedDiscordHandle ? "Update Handle" : "Connect Discord"}
                </button>
                {savedDiscordHandle && (
                  <button
                    type="button"
                    onClick={handleDiscordDisconnect}
                    disabled={discordDisconnecting}
                    className="button button-outline"
                    style={{ padding: "11px 16px", fontSize: 13, color: "#ef4444" }}
                  >
                    {discordDisconnecting ? "Disconnecting..." : "Disconnect"}
                  </button>
                )}
              </form>

              {discordMessage && (
                <div
                  role="status"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: discordMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
                    color: discordMessage.type === "success" ? "#065f46" : "#991b1b",
                    border: `1px solid ${discordMessage.type === "success" ? "#a7f3d0" : "#fecaca"}`,
                  }}
                >
                  {discordMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  <span>{discordMessage.text}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* TAB 2: Account & Verified Email Change                              */}
      {/* =================================================================== */}
      {activeTab === "account" && (
        <section className="card security-card animate-fade-in-up" style={{ padding: 32 }}>
          <div className="eyebrow">Account Security</div>
          <h2 style={{ fontSize: 22, letterSpacing: "-.04em", margin: "6px 0 10px" }}>Email Address Management</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 24px" }}>
            Your account email is used for sign-in and security notifications. Any changes require verification before taking effect.
          </p>

          <div style={{ padding: "14px 18px", borderRadius: 12, background: "var(--paper)", border: "1px solid var(--line)", marginBottom: 24, maxWidth: 520 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--muted)", fontWeight: 700 }}>
              Current Verified Email
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
              {currentEmail}
              <span style={{ fontSize: 11, background: "#ecfdf5", color: "#065f46", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>
                Verified
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailChange} style={{ display: "grid", gap: 16, maxWidth: 460 }}>
            <div>
              <label htmlFor="new-email" style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                Proposed New Email Address
              </label>
              <input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                maxLength={254}
                placeholder="new-address@company.com"
                className="field"
              />
              <p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0 0", lineHeight: 1.5 }}>
                We will send a single-use verification link from <strong>nova@allskyfares.com</strong> to confirm you own this address.
              </p>
            </div>

            {emailMessage && (
              <div
                role="status"
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: emailMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
                  color: emailMessage.type === "success" ? "#065f46" : "#991b1b",
                  border: `1px solid ${emailMessage.type === "success" ? "#a7f3d0" : "#fecaca"}`,
                }}
              >
                {emailMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{emailMessage.text}</span>
              </div>
            )}

            <button type="submit" disabled={emailSaving || !newEmail.trim()} className="button" style={{ justifySelf: "start" }}>
              {emailSaving ? <><Loader2 size={14} className="animate-spin" /> Sending verification...</> : "Send Verification Email"}
            </button>
          </form>
        </section>
      )}

      {/* =================================================================== */}
      {/* TAB 3: Password Security                                            */}
      {/* =================================================================== */}
      {activeTab === "security" && (
        <section className="card animate-fade-in-up" style={{ padding: 32 }}>
          <div className="eyebrow">Credential Protection</div>
          <h2 style={{ fontSize: 22, letterSpacing: "-.04em", margin: "6px 0 10px" }}>Change Account Password</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 24px" }}>
            Choose a strong password (6 to 12 characters with uppercase, lowercase, and a symbol). You will need your current password to confirm this change.
          </p>

          <form onSubmit={handlePasswordChange} style={{ display: "grid", gap: 16, maxWidth: 460 }}>
            <PasswordInput
              id="current-pw"
              value={currentPassword}
              onChange={setCurrentPassword}
              label="Current Password"
              autoComplete="current-password"
              showStrengthMeter={false}
              placeholder="Your current password"
            />

            <PasswordInput
              id="new-pw"
              value={newPassword}
              onChange={setNewPassword}
              label="New Password"
              autoComplete="new-password"
              showStrengthMeter={true}
              placeholder="6-12 chars with Aa#"
            />

            <PasswordInput
              id="confirm-pw"
              value={confirmPassword}
              onChange={setConfirmPassword}
              label="Confirm New Password"
              autoComplete="new-password"
              showStrengthMeter={false}
              placeholder="Re-type new password"
            />

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={revokeOtherOnPasswordChange}
                onChange={(e) => setRevokeOtherOnPasswordChange(e.target.checked)}
              />
              <span>Sign out all other active devices & sessions upon password change</span>
            </label>

            {passwordMessage && (
              <div
                role="status"
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: passwordMessage.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                  color: passwordMessage.type === "success" ? "#10b981" : "#ef4444",
                  border: `1px solid ${passwordMessage.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                }}
              >
                {passwordMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <button type="submit" disabled={passwordSaving} className="button" style={{ justifySelf: "start" }}>
              {passwordSaving ? <><Loader2 size={14} className="animate-spin" /> Updating...</> : "Update Password"}
            </button>
          </form>
        </section>
      )}

      {/* =================================================================== */}
      {/* TAB 4: Multi-Factor Authentication (MFA)                            */}
      {/* =================================================================== */}
      {activeTab === "mfa" && (
        <section className="card security-card animate-fade-in-up" style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            {mfaEnabled ? <ShieldCheck size={22} style={{ color: "#10b981" }} /> : <ShieldAlert size={22} style={{ color: "#f59e0b" }} />}
            <span className="eyebrow">Two-Factor Authentication</span>
          </div>

          <h2 style={{ fontSize: 22, letterSpacing: "-.04em", margin: "6px 0 10px" }}>
            {mfaEnabled ? "Authenticator App is Active" : "Set Up Authenticator App"}
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 24px" }}>
            {mfaEnabled
              ? "Your account requires an authenticator code (TOTP) from Google Authenticator, 1Password, or similar apps on sign in."
              : "Protect your account and workspace by requiring a one-time code alongside your password."}
          </p>

          {/* ACTIVE MFA VIEW */}
          {mfaEnabled ? (
            <div style={{ display: "grid", gap: 20 }}>
              <div style={{ padding: 18, borderRadius: 12, background: "var(--surface-raised, var(--paper))", border: "1px solid var(--border-hairline, var(--line))" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: 15, margin: 0 }}>Recovery Backup Codes</h3>
                    <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 0" }}>
                      Emergency one-time codes in case you lose access to your authenticator device.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateBackupCodes}
                    disabled={mfaBusy}
                    className="button button-outline"
                    style={{ fontSize: 12, padding: "7px 14px", height: "auto" }}
                  >
                    <RefreshCw size={12} /> Regenerate Codes
                  </button>
                </div>

                {backupCodes.length > 0 && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-hairline, var(--line))" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--amber)", marginBottom: 6 }}>
                      New Backup Codes (Save these now, they will not be shown again):
                    </div>
                    <pre
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        background: "var(--ink-crm, var(--ink))",
                        color: "var(--ink-crm-text, var(--paper))",
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 12,
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {backupCodes.join("\n")}
                    </pre>
                  </div>
                )}
              </div>

              {/* Disable MFA section */}
              <div>
                {!showDisableConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDisableConfirm(true)}
                    className="button button-outline"
                    style={{ color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)" }}
                  >
                    Disable Multi-Factor Authentication
                  </button>
                ) : (
                  <form onSubmit={handleDisableMfa} style={{ padding: 18, borderRadius: 12, border: "1px solid rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.08)", maxWidth: 440 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 6 }}>
                      Confirm MFA Disablement
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 14px" }}>
                      Disabling MFA lowers your account security. Confirm your password to proceed.
                    </p>
                    <input
                      type="password"
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      placeholder="Current password"
                      required
                      className="field"
                      style={{ marginBottom: 12 }}
                    />
                    <div style={{ display: "flex", gap: 10 }}>
                      <button type="submit" disabled={mfaBusy} className="button" style={{ background: "#dc2626", color: "white" }}>
                        {mfaBusy ? "Disabling..." : "Confirm & Disable"}
                      </button>
                      <button type="button" onClick={() => setShowDisableConfirm(false)} className="button button-outline">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : mfaSecret ? (
            /* ENROLLMENT IN PROGRESS */
            <div style={{ display: "grid", gap: 20 }}>
              <div style={{ padding: 16, background: "var(--paper)", borderRadius: 12, border: "1px solid var(--line)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  1. Scan or Enter Key into Authenticator App
                </div>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <code style={{ fontSize: 14, background: "var(--card-bg)", padding: "8px 14px", borderRadius: 8, border: "1px solid var(--line)", wordBreak: "break-all" }}>
                    {mfaSecret}
                  </code>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(mfaSecret)}
                    className="button button-outline"
                    style={{ padding: "8px 12px", height: "auto" }}
                    title="Copy secret"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              {backupCodes.length > 0 && (
                <div style={{ padding: 16, background: "var(--paper)", borderRadius: 12, border: "1px solid var(--line)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                    2. Emergency Backup Codes (Store somewhere safe)
                  </div>
                  <pre style={{ margin: "10px 0 0", fontSize: 12, lineHeight: 1.6, fontFamily: "'DM Mono', monospace" }}>
                    {backupCodes.join("\n")}
                  </pre>
                </div>
              )}

              <form onSubmit={handleVerifyMfa} style={{ display: "grid", gap: 14, maxWidth: 360 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  3. Verify 6-Digit Code
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="field"
                  style={{ fontSize: 18, letterSpacing: 4, textAlign: "center" }}
                />
                <button type="submit" disabled={mfaBusy || mfaCode.length < 6} className="button">
                  {mfaBusy ? "Verifying..." : "Verify & Enable MFA"} <ArrowUpRight size={14} />
                </button>
              </form>
            </div>
          ) : (
            /* ENROLLMENT INITIAL STATE */
            <form onSubmit={handleStartMfa} style={{ display: "grid", gap: 16, maxWidth: 440 }}>
              <div>
                <label htmlFor="mfa-pw-setup" style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  Confirm Your Current Password
                </label>
                <input
                  id="mfa-pw-setup"
                  type="password"
                  value={mfaPassword}
                  onChange={(e) => setMfaPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="field"
                />
              </div>
              <button type="submit" disabled={mfaBusy || !mfaPassword} className="button" style={{ justifySelf: "start" }}>
                {mfaBusy ? <><Loader2 size={14} className="animate-spin" /> Preparing...</> : "Begin Authenticator Setup"}
              </button>
            </form>
          )}

          {mfaMessage && (
            <div
              role="status"
              style={{
                marginTop: 20,
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: mfaMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
                color: mfaMessage.type === "success" ? "#065f46" : "#991b1b",
                border: `1px solid ${mfaMessage.type === "success" ? "#a7f3d0" : "#fecaca"}`,
              }}
            >
              {mfaMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{mfaMessage.text}</span>
            </div>
          )}
        </section>
      )}

      {/* =================================================================== */}
      {/* TAB 5: Sessions & Devices                                           */}
      {/* =================================================================== */}
      {activeTab === "sessions" && (
        <section className="card security-card animate-fade-in-up" style={{ padding: 32 }}>
          <div className="eyebrow">Session Controls</div>
          <h2 style={{ fontSize: 22, letterSpacing: "-.04em", margin: "6px 0 10px" }}>Active Sessions & Sign-ins</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 24px" }}>
            Control devices signed into your Nova account. Revoke other browser sessions to secure your account immediately.
          </p>

          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ padding: 20, borderRadius: 14, background: "var(--paper)", border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, margin: 0 }}>This Current Device</h3>
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 0" }}>
                    Active browser session with full authorization cookies.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOutAll}
                  disabled={sessionsBusy}
                  className="button button-outline"
                  style={{ fontSize: 12, padding: "8px 14px", height: "auto" }}
                >
                  Sign Out of This Device
                </button>
              </div>
            </div>

            <div style={{ padding: 20, borderRadius: 14, background: "var(--paper)", border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, margin: 0 }}>Sign Out Other Devices</h3>
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 0" }}>
                    Revoke all other active sessions across phones, laptops, and tablets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRevokeOtherSessions}
                  disabled={sessionsBusy}
                  className="button"
                  style={{ fontSize: 12, padding: "8px 16px", height: "auto" }}
                >
                  Revoke Other Sessions
                </button>
              </div>
            </div>

            {googleAvailable && (
              <div style={{ padding: 20, borderRadius: 14, background: "var(--paper)", border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 15, margin: 0 }}>Connected Google Sign-In</h3>
                    <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 0" }}>
                      Link your Google identity for one-click authentication.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLinkGoogle}
                    disabled={sessionsBusy}
                    className="button button-outline"
                    style={{ fontSize: 12, padding: "8px 14px", height: "auto" }}
                  >
                    Link Google Account
                  </button>
                </div>
              </div>
            )}

            {sessionsMessage && (
              <div
                role="status"
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: sessionsMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
                  color: sessionsMessage.type === "success" ? "#065f46" : "#991b1b",
                  border: `1px solid ${sessionsMessage.type === "success" ? "#a7f3d0" : "#fecaca"}`,
                }}
              >
                {sessionsMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{sessionsMessage.text}</span>
              </div>
            )}
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 640px) {
          .security-card {
            padding: 20px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

function DiscordIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 127.14 96.36" fill="currentColor" aria-hidden="true">
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.91,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
  );
}

