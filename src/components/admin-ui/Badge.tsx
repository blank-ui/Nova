import React from "react";

export type BadgeVariant = "admin" | "brand" | "warning" | "info" | "neutral" | "success";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ children, variant = "neutral", className = "", style }: BadgeProps) {
  const configs: Record<BadgeVariant, { bg: string; color: string; border?: string }> = {
    admin: {
      bg: "var(--brand-purple)",
      color: "#FFFFFF",
    },
    brand: {
      bg: "var(--brand-purple)",
      color: "#FFFFFF",
    },
    warning: {
      bg: "var(--accent-yellow)",
      color: "#141821",
    },
    info: {
      bg: "var(--accent-blue)",
      color: "#FFFFFF",
    },
    success: {
      bg: "#10B981",
      color: "#FFFFFF",
    },
    neutral: {
      bg: "var(--subtle-fill)",
      color: "var(--text-secondary)",
    },
  };

  const current = configs[variant] || configs.neutral;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3px 10px",
        borderRadius: "var(--radius-pill)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.02em",
        background: current.bg,
        color: current.color,
        border: current.border,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
