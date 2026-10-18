import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge, BadgeVariant } from "./Badge";

export interface HeadlineStat {
  icon: React.ReactNode;
  value: string | number;
  badgeLabel: string;
  badgeVariant?: BadgeVariant;
  caption: string;
}

export interface PageHeaderProps {
  titleLine1?: string;
  titleLine2: string;
  backHref?: string;
  stats?: HeadlineStat[];
  className?: string;
  style?: React.CSSProperties;
}

export function PageHeader({
  titleLine1,
  titleLine2,
  backHref,
  stats = [],
  className = "",
  style,
}: PageHeaderProps) {
  return (
    <div
      className={`page-header ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        marginBottom: 28,
        ...style,
      }}
    >
      {/* Left: Back Button + Two-line Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {backHref && (
          <Link
            href={backHref}
            aria-label="Go back"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "1px solid var(--border-hairline)",
              background: "var(--surface-raised)",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              flexShrink: 0,
              transition: "transform 0.15s ease",
            }}
          >
            <ArrowLeft size={18} strokeWidth={1.8} />
          </Link>
        )}

        <div>
          {titleLine1 && (
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
                color: "var(--text-primary)",
              }}
            >
              {titleLine1}
            </div>
          )}
          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            {titleLine2}
          </h1>
        </div>
      </div>

      {/* Right: Strip of Headline Stats */}
      {stats.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          {stats.map((st, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* Icon Circle */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--subtle-fill)",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {st.icon}
              </div>

              {/* Number + Badge + Caption */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      color: "var(--text-primary)",
                      lineHeight: 1,
                    }}
                  >
                    {st.value}
                  </span>
                  <Badge variant={st.badgeVariant || "neutral"}>
                    {st.badgeLabel}
                  </Badge>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-muted-crm)",
                    marginTop: 3,
                  }}
                >
                  {st.caption}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
