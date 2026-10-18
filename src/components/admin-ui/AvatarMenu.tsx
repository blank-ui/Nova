"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Trash2, Loader2, X, AlertTriangle } from "lucide-react";
import { AvatarCropModal } from "./AvatarCropModal";
import { useToast } from "@/components/toast";

export interface AvatarMenuProps {
  currentAvatarUrl?: string | null;
  userId?: string;
  userName?: string;
  onAvatarChanged?: (newUrl: string | null) => void;
}

export function AvatarMenu({
  currentAvatarUrl,
  userId,
  userName,
  onAvatarChanged,
}: AvatarMenuProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Close menu on click outside or escape
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setConfirmRemoveOpen(false);
      }
    }
    if (menuOpen || confirmRemoveOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, confirmRemoveOpen]);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please select a JPEG, PNG, or WebP image.", "Unsupported Format");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size cannot exceed 2 MB.", "File Too Large");
      return;
    }

    setSelectedFile(file);
    setMenuOpen(false);
    setCropModalOpen(true);
    // Reset input value so same file can be re-selected if desired
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleRemovePhoto() {
    setLoading(true);
    try {
      const url = userId ? `/api/user/avatar?userId=${encodeURIComponent(userId)}` : "/api/user/avatar";
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove avatar");
      }

      toast.success("Profile photo removed.", "Photo Removed");
      setConfirmRemoveOpen(false);
      setMenuOpen(false);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("nova:avatar-updated", {
            detail: {
              userId: data.userId || userId,
              avatarUrl: null,
            },
          })
        );
      }

      onAvatarChanged?.(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error deleting photo";
      toast.error(msg, "Error");
    } finally {
      setLoading(false);
    }
  }

  const hasPhoto = Boolean(currentAvatarUrl);

  return (
    <>
      <div ref={menuRef} style={{ position: "relative" }}>
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleFileSelected}
        />

        {/* Circular Camera Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Change profile photo"
          title="Change profile photo"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--surface-raised)",
            color: "var(--text-primary)",
            border: "2px solid var(--card-bg-crm)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "all 0.15s ease",
            padding: 0,
          }}
          className="avatar-camera-btn"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Camera size={15} strokeWidth={2} />
          )}
        </button>

        {/* Menu Popup */}
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: 8,
              background: "var(--surface-raised)",
              borderRadius: 16,
              padding: 6,
              boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-hairline)",
              zIndex: 100,
              minWidth: 160,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 12,
                border: "none",
                background: "transparent",
                color: "var(--text-primary)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
              className="avatar-menu-item"
            >
              <Upload size={14} />
              <span>{hasPhoto ? "Change photo" : "Upload photo"}</span>
            </button>

            {hasPhoto && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmRemoveOpen(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "none",
                  background: "transparent",
                  color: "#dc2626",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
                className="avatar-menu-item"
              >
                <Trash2 size={14} />
                <span>Remove photo</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Removing Photo */}
      {confirmRemoveOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 2000,
          }}
          onClick={() => setConfirmRemoveOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface-raised)",
              borderRadius: 24,
              width: "min(380px, 100%)",
              padding: 24,
              boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
              border: "1px solid var(--border-hairline)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#fef2f2",
                color: "#dc2626",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 12px",
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              Remove profile photo?
            </h4>
            <p style={{ margin: "0 0 20px", fontSize: 12, color: "var(--text-muted-crm)" }}>
              Your avatar will revert to your name initial.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setConfirmRemoveOpen(false)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--border-hairline)",
                  background: "transparent",
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  background: "#dc2626",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {cropModalOpen && selectedFile && (
        <AvatarCropModal
          imageFile={selectedFile}
          userId={userId}
          onClose={() => {
            setCropModalOpen(false);
            setSelectedFile(null);
          }}
          onSuccess={(newAvatarUrl) => {
            setCropModalOpen(false);
            setSelectedFile(null);
            onAvatarChanged?.(newAvatarUrl);
          }}
        />
      )}

      <style>{`
        .avatar-camera-btn:hover {
          transform: scale(1.1);
        }
        .avatar-menu-item:hover {
          background: var(--subtle-fill) !important;
        }
      `}</style>
    </>
  );
}
