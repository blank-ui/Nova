"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Camera, CheckCircle2, User as UserIcon } from "lucide-react";
import { PasswordInput } from "@/components/password-input";
import { evaluatePasswordStrength } from "@/lib/password-policy";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm({ token, mode }: { token: string; mode?: string }) {
  const isSetup = mode === "setup";
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Profile fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [password, setPassword] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch existing user info if token is provided
  useEffect(() => {
    if (!token) return;

    let mounted = true;
    fetch(`/api/auth/setup-account?token=${encodeURIComponent(token)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data?.valid || !data.user) return;
        if (data.user.email) setEmail(data.user.email);
        if (data.user.name) setName(data.user.name);
        if (data.user.phone) setPhone(data.user.phone);
        if (data.user.dateOfBirth) setDateOfBirth(data.user.dateOfBirth);
        if (data.user.image) setAvatarPreview(data.user.image);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [token]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile photo must be 2MB or smaller.");
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const strength = evaluatePasswordStrength(password);
    if (!strength.isValid) {
      setError("Password must be 6 to 12 characters and include uppercase, lowercase, and a special symbol.");
      setBusy(false);
      return;
    }

    try {
      // 1. Submit via setup-account API which saves password, profile fields, and avatar
      const formData = new FormData();
      formData.append("token", token);
      formData.append("password", password);
      if (name.trim()) formData.append("name", name.trim());
      if (phone.trim()) formData.append("phone", phone.trim());
      if (dateOfBirth.trim()) formData.append("dateOfBirth", dateOfBirth.trim());
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await fetch("/api/auth/setup-account", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Fallback to standard Better Auth client resetPassword if endpoint returned token error
        const fb = await authClient.resetPassword({ newPassword: password, token });
        if (fb.error) {
          throw new Error(
            data.error ||
              (isSetup
                ? "This activation link is invalid or has expired. Please contact your administrator."
                : "This reset link is invalid or expired. Request a fresh link and try again.")
          );
        }
      }

      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : isSetup
          ? "The profile and password could not be configured."
          : "The password could not be reset."
      );
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <div className="card" style={{ maxWidth: 520, padding: 32 }}>
        <p role="alert" style={{ color: "#ef4444", fontSize: 14 }}>
          {isSetup
            ? "This activation link is missing its security token. Please ask your administrator for a new invite."
            : "This reset link is missing its token. Request a new link to continue."}
        </p>
        <Link href="/login" style={{ color: "var(--blue)", fontSize: 13, textDecoration: "underline", display: "inline-block", marginTop: 12 }}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="card auth-reset" style={{ maxWidth: 540, padding: "32px 28px", margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ letterSpacing: "-.04em", margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>
          {isSetup ? "Complete your profile." : "Choose a new password."}
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
          {isSetup
            ? "Configure your password and personal details to activate your workspace access."
            : "Enter a fresh, secure password for your account."}
        </p>
        {email && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              padding: "4px 10px",
              background: "var(--surface-raised)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--radius-pill)",
              fontSize: 12,
              color: "var(--text-secondary)",
              fontWeight: 600,
            }}
          >
            <span>Account:</span>
            <span style={{ color: "var(--text-primary)" }}>{email}</span>
          </div>
        )}
      </div>

      {done ? (
        <div style={{ textAlign: "center", padding: "16px 8px" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#10b981",
            }}
          >
            <CheckCircle2 size={30} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>
            {isSetup ? "Profile Initialized & Account Active!" : "Password Successfully Updated!"}
          </h3>
          <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7, margin: "0 0 24px" }}>
            {isSetup
              ? "Your password and profile details have been saved. You can now log into your workspace."
              : "Your password has been changed and your account is ready for sign in."}
          </p>
          <Link
            className="button"
            href="/login"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Sign in to Workspace
            <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "grid", gap: 18 }}>
          {/* Avatar Upload (Setup Mode) */}
          {isSetup && (
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 14px", background: "var(--surface-raised)", borderRadius: 16, border: "1px solid var(--border-hairline)" }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "var(--card-bg-crm, #202431)",
                  border: "2px dashed var(--border-hairline)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                  flexShrink: 0,
                }}
                title="Click to upload profile photo"
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <UserIcon size={24} style={{ color: "var(--muted)" }} />
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.35)",
                    opacity: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    transition: "opacity 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                >
                  <Camera size={18} />
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  Profile Picture
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 6px" }}>
                  JPEG, PNG, or WebP up to 2MB (Optional)
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: "var(--radius-pill)",
                    background: "transparent",
                    color: "var(--blue)",
                    border: "1px solid var(--border-hairline)",
                    cursor: "pointer",
                  }}
                >
                  <Camera size={12} />
                  {avatarPreview ? "Change photo" : "Upload photo"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
              </div>
            </div>
          )}

          {/* Profile Name & Phone */}
          {isSetup && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 14 }}>
              <div>
                <label className="auth-label">
                  Full Name
                  <input
                    className="field"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    maxLength={100}
                    style={{ width: "100%", boxSizing: "border-box" }}
                  />
                </label>
              </div>

              <div>
                <label className="auth-label">
                  Phone Number <span style={{ fontWeight: 400, opacity: 0.7 }}>(Optional)</span>
                  <input
                    className="field"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    maxLength={30}
                    style={{ width: "100%", boxSizing: "border-box" }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Date of Birth */}
          {isSetup && (
            <div>
              <label className="auth-label">
                Date of Birth <span style={{ fontWeight: 400, opacity: 0.7 }}>(Optional)</span>
                <input
                  className="field"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </label>
            </div>
          )}

          {/* Password Input */}
          <PasswordInput
            value={password}
            onChange={setPassword}
            label={isSetup ? "Create secure password" : "New password"}
            autoComplete="new-password"
            showStrengthMeter={true}
            placeholder="6-12 chars with Aa#"
          />

          {error && (
            <p role="alert" style={{ color: "#ef4444", fontSize: 12, margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button"
            disabled={busy}
            style={{ width: "100%", justifyContent: "center", padding: "12px 16px", marginTop: 4 }}
          >
            {busy ? (isSetup ? "Activating account…" : "Updating…") : isSetup ? "Save Profile & Activate" : "Update password"}
            <ArrowUpRight size={15} />
          </button>
        </form>
      )}

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--blue)",
            fontSize: 12,
            textDecoration: "none",
          }}
        >
          &larr; Back to sign in
        </Link>
      </div>

      <style>{`
        .auth-label {
          display: grid;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .auth-reset .field {
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid var(--border-hairline);
          background: var(--surface-raised);
          color: var(--text-primary);
          font-size: 13px;
          outline: none;
        }
        .auth-reset .field:focus {
          border-color: var(--blue);
        }
      `}</style>
    </div>
  );
}
