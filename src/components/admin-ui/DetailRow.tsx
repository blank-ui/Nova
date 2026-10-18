import React from "react";

export interface DetailRowProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function DetailRow({
  icon,
  label,
  value,
  action,
  className = "",
  style,
}: DetailRowProps) {
  return (
    <div
      className={`detail-row ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        padding: "12px 16px",
        borderRadius: "var(--radius-row)",
        background: "var(--surface-raised)",
        border: "1px solid var(--border-hairline-light)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        {icon && (
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "var(--subtle-fill)",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}

        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted-crm)", fontWeight: 600, marginBottom: 2 }}>
            {label}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {value}
          </div>
        </div>
      </div>

      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
