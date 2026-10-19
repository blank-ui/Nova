"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Camera, CheckCircle2, User as UserIcon } from "lucide-react";
import { NovaMark } from "@/components/brand";
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
    <div className="card auth-reset" style={{ maxWidth: 580, padding: "clamp(24px, 4vw, 36px)", margin: "0 auto" }}>
      {/* Brand Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="eyebrow" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {isSetup ? "Profile & Account Setup" : "Account Recovery"}
        </div>
        <NovaMark size={22} starColor="#6C4CFF" dotColor="#FFB547" />
      </div>

      <div style={{ marginBottom: 22 }}>
        <h2 style={{ letterSpacing: "-.04em", margin: "0 0 6px", fontSize: 24, fontWeight: 700, color: "var(--ink)" }}>
          {isSetup ? "Create your profile & password." : "Choose a new password."}
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
          {isSetup
            ? "Configure your personal details and create a secure password to activate your workspace access."
            : "Enter a fresh, secure password for your account."}
        </p>
      </div>

      {done ? (
        <div style={{ textAlign: "center", padding: "20px 8px" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#10b981",
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: "var(--ink)" }}>
            {isSetup ? "Profile Initialized & Account Active!" : "Password Successfully Updated!"}
          </h3>
          <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7, margin: "0 0 24px" }}>
            {isSetup
              ? "Your profile details and password have been saved. You can now log into your workspace."
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
        <form onSubmit={submit} style={{ display: "grid", gap: 20 }}>
          {/* Centered Avatar Upload (Setup Mode) */}
          {isSetup && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "20px 16px",
                background: "var(--surface-raised)",
                borderRadius: 18,
                border: "1px solid var(--border-hairline)",
              }}
            >
              <div
                onClick={() => fileInputRef.current?.click()}
                className="avatar-circle-btn"
                style={{
                  width: 76,
                  height: 76,
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
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                  transition: "transform 0.15s ease, border-color 0.15s ease",
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
                  <UserIcon size={32} style={{ color: "var(--muted)" }} />
                )}
                <div
                  className="avatar-hover-overlay"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    opacity: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    transition: "opacity 0.15s ease",
                  }}
                >
                  <Camera size={20} />
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  Profile Photo
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  JPEG, PNG, or WebP up to 2MB (Optional)
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 8,
                  padding: "5px 14px",
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
          )}

          {/* Symmetrical 2x2 Fields Grid (Setup Mode) */}
          {isSetup && (
            <div
              className="setup-fields-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              {/* Full Name */}
              <div>
                <label className="auth-label">
                  Full Name *
                  <input
                    className="field"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    maxLength={100}
                  />
                </label>
              </div>

              {/* Email Address (Pre-configured & Verified) */}
              <div>
                <label className="auth-label">
                  Email Address
                  <div style={{ position: "relative" }}>
                    <input
                      className="field"
                      type="email"
                      disabled
                      value={email || "Loading..."}
                      style={{
                        paddingRight: 74,
                        opacity: 0.85,
                        cursor: "not-allowed",
                        background: "var(--surface-raised)",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#10b981",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        pointerEvents: "none",
                      }}
                    >
                      Verified
                    </span>
                  </div>
                </label>
              </div>

              {/* Phone Number */}
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
                  />
                </label>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="auth-label">
                  Date of Birth <span style={{ fontWeight: 400, opacity: 0.7 }}>(Optional)</span>
                  <input
                    className="field"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Password Section (Full Width, Centered) */}
          <div style={{ display: "grid", gap: 6 }}>
            <PasswordInput
              value={password}
              onChange={setPassword}
              label={isSetup ? "Create secure password" : "New password"}
              autoComplete="new-password"
              showStrengthMeter={true}
              placeholder="6-12 chars with Aa#"
            />
          </div>

          {error && (
            <p role="alert" style={{ color: "#ef4444", fontSize: 12, margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button"
            disabled={busy}
            style={{ width: "100%", justifyContent: "center", padding: "13px 18px", marginTop: 4, fontWeight: 700 }}
          >
            {busy ? (isSetup ? "Activating account…" : "Updating…") : isSetup ? "Save Profile & Activate" : "Update password"}
            <ArrowUpRight size={15} />
          </button>
        </form>
      )}

      <div style={{ marginTop: 22, textAlign: "center" }}>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--blue)",
            fontSize: 12,
            fontWeight: 600,
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
          width: 100%;
          box-sizing: border-box;
          padding: 11px 14px;
          border-radius: 12px;
          border: 1px solid var(--border-hairline);
          background: var(--surface-raised);
          color: var(--text-primary);
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .auth-reset .field:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(108, 76, 255, 0.15);
        }
        .avatar-circle-btn:hover {
          transform: scale(1.03);
          border-color: var(--blue) !important;
        }
        .avatar-circle-btn:hover .avatar-hover-overlay {
          opacity: 1 !important;
        }
        @media (max-width: 520px) {
          .setup-fields-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
