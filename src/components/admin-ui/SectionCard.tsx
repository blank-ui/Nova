import React from "react";
import Link from "next/link";
import { MoreHorizontal, ArrowUpRight } from "lucide-react";

export interface SectionCardProps {
  title?: string;
  headerRight?: React.ReactNode;
  showDefaultActions?: boolean;
  onMoreClick?: () => void;
  openHref?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function SectionCard({
  title,
  headerRight,
  showDefaultActions = false,
  onMoreClick,
  openHref,
  children,
  className = "",
  style,
}: SectionCardProps) {
  return (
    <section
      className={`section-card ${className}`}
      style={{
        background: "var(--card-bg-crm)",
        borderRadius: "var(--radius-card)",
        padding: "22px 24px",
        border: "1px solid var(--border-hairline-light)",
        boxShadow: "none",
        ...style,
      }}
    >
      {(title || headerRight || showDefaultActions || openHref) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          {title ? (
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </h2>
          ) : (
            <div />
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {headerRight}

            {showDefaultActions && (
              <>
                <button
                  type="button"
                  onClick={onMoreClick}
                  aria-label="More options"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "1px solid var(--border-hairline)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <MoreHorizontal size={14} />
                </button>

                {openHref && (
                  <Link
                    href={openHref}
                    aria-label="Open full view"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      border: "1px solid var(--border-hairline)",
                      background: "transparent",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      padding: 0,
                    }}
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {children}
    </section>
  );
}
