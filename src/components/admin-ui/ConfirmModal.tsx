"use client";

import React, { useEffect } from "react";
import { AlertTriangle, HelpCircle, X } from "lucide-react";

export interface ConfirmModalProps {
  isOpen?: boolean;
  open?: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary" | "warning";
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const isModalOpen = isOpen ?? open ?? false;

  useEffect(() => {
    if (!isModalOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, onCancel]);

  if (!isModalOpen) return null;

  const confirmBg =
    variant === "danger"
      ? "#DC2626"
      : variant === "warning"
      ? "#D97706"
      : "var(--accent-blue, #2F54EB)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(12, 13, 16, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--card-bg-crm, #E3E7EC)",
          border: "1px solid var(--border-hairline, #C8CED7)",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 20px 48px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          animation: "fadeInUp 0.18s ease-out",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background:
                variant === "danger"
                  ? "rgba(220, 38, 38, 0.12)"
                  : variant === "warning"
                  ? "rgba(217, 119, 6, 0.12)"
                  : "rgba(47, 84, 235, 0.12)",
              color: confirmBg,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            {variant === "danger" || variant === "warning" ? (
              <AlertTriangle size={22} />
            ) : (
              <HelpCircle size={22} />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                margin: "0 0 6px",
                fontSize: 17,
                fontWeight: 700,
                color: "var(--text-primary, #141821)",
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "var(--text-muted-crm, #555C69)",
                lineHeight: 1.5,
              }}
            >
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "var(--surface-raised, #F7F8FA)",
              color: "var(--text-secondary, #3A4150)",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 8,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              border: "1px solid var(--border-hairline, #C8CED7)",
              background: "var(--surface-raised, #F7F8FA)",
              color: "var(--text-primary, #141821)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: "none",
              background: confirmBg,
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 700,
              cursor: isBusy ? "not-allowed" : "pointer",
              opacity: isBusy ? 0.7 : 1,
            }}
          >
            {isBusy ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
