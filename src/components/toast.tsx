"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  toast: (options: { type?: ToastType; title?: string; message: string; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      type = "info",
      title,
      message,
      duration = 4500,
    }: {
      type?: ToastType;
      title?: string;
      message: string;
      duration?: number;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // keep at most 5 toasts visible

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback((message: string, title?: string) => toast({ type: "success", title, message }), [toast]);
  const error = useCallback((message: string, title?: string) => toast({ type: "error", title, message }), [toast]);
  const info = useCallback((message: string, title?: string) => toast({ type: "info", title, message }), [toast]);
  const warning = useCallback((message: string, title?: string) => toast({ type: "warning", title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, info, warning, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <aside
      aria-live="polite"
      aria-atomic="false"
      role="region"
      aria-label="Notifications"
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 420,
        width: "calc(100vw - 32px)",
        pointerEvents: "none",
      }}
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={() => onDismiss(item.id)} />
      ))}
    </aside>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger smooth slide-in
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const config = {
    success: {
      icon: CheckCircle2,
      accent: "#10b981",
      glow: "rgba(16, 185, 129, 0.18)",
      border: "rgba(16, 185, 129, 0.35)",
      bg: "var(--card-bg, #ffffff)",
      badgeBg: "rgba(16, 185, 129, 0.12)",
      badgeColor: "#059669",
    },
    error: {
      icon: AlertCircle,
      accent: "#f43f5e",
      glow: "rgba(244, 63, 94, 0.18)",
      border: "rgba(244, 63, 94, 0.35)",
      bg: "var(--card-bg, #ffffff)",
      badgeBg: "rgba(244, 63, 94, 0.12)",
      badgeColor: "#e11d48",
    },
    warning: {
      icon: AlertTriangle,
      accent: "#f59e0b",
      glow: "rgba(245, 158, 11, 0.18)",
      border: "rgba(245, 158, 11, 0.35)",
      bg: "var(--card-bg, #ffffff)",
      badgeBg: "rgba(245, 158, 11, 0.12)",
      badgeColor: "#d97706",
    },
    info: {
      icon: Info,
      accent: "#6366f1",
      glow: "rgba(99, 102, 241, 0.18)",
      border: "rgba(99, 102, 241, 0.35)",
      bg: "var(--card-bg, #ffffff)",
      badgeBg: "rgba(99, 102, 241, 0.12)",
      badgeColor: "#4f46e5",
    },
  }[item.type];

  const Icon = config.icon;

  return (
    <div
      role="alert"
      style={{
        pointerEvents: "auto",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 14,
        background: config.bg,
        border: `1px solid ${config.border}`,
        boxShadow: `0 12px 36px rgba(0, 0, 0, 0.12), 0 0 24px ${config.glow}`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        transform: mounted ? "translateX(0) scale(1)" : "translateX(20px) scale(0.96)",
        opacity: mounted ? 1 : 0,
        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: config.badgeBg,
          color: config.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} strokeWidth={2.4} />
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
        {item.title && (
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "var(--ink)",
              marginBottom: 3,
            }}
          >
            {item.title}
          </div>
        )}
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.5,
            color: "var(--muted)",
            wordBreak: "break-word",
          }}
        >
          {item.message}
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        style={{
          background: "transparent",
          border: "none",
          padding: 4,
          borderRadius: 6,
          cursor: "pointer",
          color: "var(--muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color 0.15s, background-color 0.15s",
          marginRight: -4,
          marginTop: -2,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--ink)";
          e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--muted)";
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
