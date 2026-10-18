import React from "react";

export interface SegmentedToggleOption<T extends string = string> {
  label: string;
  value: T;
}

export interface SegmentedToggleProps<T extends string = string> {
  options: SegmentedToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function SegmentedToggle<T extends string = string>({
  options,
  value,
  onChange,
  className = "",
  style,
}: SegmentedToggleProps<T>) {
  return (
    <div
      className={`segmented-toggle ${className}`}
      role="radiogroup"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: 3,
        borderRadius: "var(--radius-pill)",
        background: "var(--subtle-fill-alt)",
        border: "1px solid var(--border-hairline-light)",
        ...style,
      }}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            style={{
              border: "none",
              background: isSelected ? "var(--surface-raised)" : "transparent",
              color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: isSelected ? 700 : 500,
              fontSize: 12,
              padding: "5px 14px",
              borderRadius: "var(--radius-pill)",
              cursor: "pointer",
              boxShadow: isSelected ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
              transition: "background-color 0.15s ease, color 0.15s ease",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
