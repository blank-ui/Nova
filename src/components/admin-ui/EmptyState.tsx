import React from "react";

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
  style,
}: EmptyStateProps) {
  return (
    <div
      className={`empty-state ${className}`}
      style={{
        padding: "36px 20px",
        borderRadius: "var(--radius-row)",
        border: "1.5px dashed var(--border-hairline)",
        background: "transparent",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "var(--subtle-fill)",
          color: "var(--accent-blue)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 4,
        }}
      >
        {title}
      </div>

      <p
        style={{
          fontSize: 12,
          color: "var(--text-muted-crm)",
          maxWidth: 380,
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
