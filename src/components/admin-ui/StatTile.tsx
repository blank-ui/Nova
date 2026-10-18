import React from "react";
import Link from "next/link";
import { MoreHorizontal, ArrowUpRight } from "lucide-react";

export type StatTileVariant = "blue" | "teal" | "black" | "yellow" | "white";

export interface StatTileProps {
  category: string;
  title: string;
  value: string | number;
  caption: string;
  variant?: StatTileVariant;
  href?: string;
  actionIcon?: "more" | "arrow";
  onActionClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function StatTile({
  category,
  title,
  value,
  caption,
  variant = "white",
  href,
  actionIcon = "more",
  onActionClick,
  className = "",
  style,
}: StatTileProps) {
  const isDarkTile = variant === "blue" || variant === "teal" || variant === "black";

  const variantStyles: Record<
    StatTileVariant,
    { bg: string; text: string; subText: string; pillBg: string; pillColor: string; circleBorder: string; circleBg: string }
  > = {
    blue: {
      bg: "var(--accent-blue)",
      text: "#FFFFFF",
      subText: "rgba(255, 255, 255, 0.8)",
      pillBg: "rgba(255, 255, 255, 0.18)",
      pillColor: "#FFFFFF",
      circleBorder: "rgba(255, 255, 255, 0.35)",
      circleBg: "rgba(255, 255, 255, 0.12)",
    },
    teal: {
      bg: "var(--accent-teal)",
      text: "#FFFFFF",
      subText: "rgba(255, 255, 255, 0.8)",
      pillBg: "rgba(255, 255, 255, 0.18)",
      pillColor: "#FFFFFF",
      circleBorder: "rgba(255, 255, 255, 0.35)",
      circleBg: "rgba(255, 255, 255, 0.12)",
    },
    black: {
      bg: "var(--ink-crm)",
      text: "#FFFFFF",
      subText: "rgba(255, 255, 255, 0.75)",
      pillBg: "rgba(255, 255, 255, 0.15)",
      pillColor: "#FFFFFF",
      circleBorder: "rgba(255, 255, 255, 0.3)",
      circleBg: "rgba(255, 255, 255, 0.08)",
    },
    yellow: {
      bg: "var(--accent-yellow)",
      text: "#141821",
      subText: "rgba(20, 24, 33, 0.75)",
      pillBg: "rgba(0, 0, 0, 0.07)",
      pillColor: "#141821",
      circleBorder: "rgba(0, 0, 0, 0.18)",
      circleBg: "rgba(0, 0, 0, 0.04)",
    },
    white: {
      bg: "var(--surface-raised)",
      text: "var(--text-primary)",
      subText: "var(--text-muted-crm)",
      pillBg: "var(--subtle-fill)",
      pillColor: "var(--text-secondary)",
      circleBorder: "var(--border-hairline)",
      circleBg: "transparent",
    },
  };

  const current = variantStyles[variant];

  const content = (
    <div
      className={`stat-tile ${className}`}
      style={{
        background: current.bg,
        color: current.text,
        borderRadius: "var(--radius-tile)",
        padding: "20px 22px",
        minHeight: 154,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        ...style,
      }}
    >
      {/* Top Row: Category label + Action circle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              background: current.pillBg,
              color: current.pillColor,
              marginBottom: 8,
              letterSpacing: "0.02em",
            }}
          >
            {category}
          </span>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              lineHeight: 1.25,
              color: current.text,
            }}
          >
            {title}
          </div>
        </div>

        <button
          type="button"
          onClick={onActionClick}
          aria-label={`Options for ${title}`}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `1px solid ${current.circleBorder}`,
            background: current.circleBg,
            color: current.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "opacity 0.15s ease",
          }}
        >
          {actionIcon === "arrow" ? <ArrowUpRight size={15} /> : <MoreHorizontal size={15} />}
        </button>
      </div>

      {/* Bottom Row: Big number + Caption */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginTop: 14,
        }}
      >
        <span
          style={{
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: current.text,
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: current.subText,
            textAlign: "right",
          }}
        >
          {caption}
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "block" }}>
        {content}
      </Link>
    );
  }

  return content;
}
