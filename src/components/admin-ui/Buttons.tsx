import React from "react";
import Link from "next/link";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  "aria-label": string;
  variant?: "outline" | "subtle" | "ghost" | "dark";
  size?: number;
  href?: string;
  target?: string;
  rel?: string;
}

export function IconButton({
  icon,
  "aria-label": ariaLabel,
  variant = "outline",
  size = 44,
  href,
  target,
  rel,
  style,
  className = "",
  onClick,
  ...rest
}: IconButtonProps) {
  const bgStyles: Record<string, React.CSSProperties> = {
    outline: {
      background: "transparent",
      border: "1px solid var(--border-hairline)",
      color: "var(--text-primary)",
    },
    subtle: {
      background: "var(--subtle-fill)",
      border: "none",
      color: "var(--text-primary)",
    },
    ghost: {
      background: "transparent",
      border: "none",
      color: "var(--text-muted-crm)",
    },
    dark: {
      background: "var(--ink-crm)",
      border: "1px solid var(--left-rail-btn-border)",
      color: "var(--left-rail-icon)",
    },
  };

  const combinedStyles: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: 44,
    minHeight: 44,
    borderRadius: "var(--radius-pill)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background-color 0.15s ease, transform 0.15s ease, color 0.15s ease",
    textDecoration: "none",
    padding: 0,
    ...bgStyles[variant],
    ...style,
  };

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        className={`icon-button-hover ${className}`}
        style={combinedStyles}
      >
        {icon}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`icon-button-hover ${className}`}
      style={combinedStyles}
      onClick={onClick}
      {...rest}
    >
      {icon}
    </button>
  );
}

export interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "subtle";
  href?: string;
  icon?: React.ReactNode;
  target?: string;
  rel?: string;
}

export function PillButton({
  children,
  variant = "outline",
  href,
  icon,
  target,
  rel,
  style,
  className = "",
  onClick,
  ...rest
}: PillButtonProps) {
  const bgStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--ink-crm)",
      color: "#FFFFFF",
      border: "none",
    },
    outline: {
      background: "transparent",
      border: "1px solid var(--border-hairline)",
      color: "var(--text-primary)",
    },
    subtle: {
      background: "var(--subtle-fill)",
      border: "none",
      color: "var(--text-primary)",
    },
  };

  const combinedStyles: React.CSSProperties = {
    minHeight: 44,
    padding: "0 20px",
    borderRadius: "var(--radius-pill)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.15s ease, transform 0.15s ease, color 0.15s ease",
    textDecoration: "none",
    ...bgStyles[variant],
    ...style,
  };

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={`pill-button-hover ${className}`}
        style={combinedStyles}
      >
        {icon}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`pill-button-hover ${className}`}
      style={combinedStyles}
      onClick={onClick}
      {...rest}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
