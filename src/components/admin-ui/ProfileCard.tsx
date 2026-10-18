import React from "react";
import Link from "next/link";
import { ArrowUpRight, Pencil, Mail, Shield, Plus } from "lucide-react";
import { Avatar } from "./Avatar";
import { Badge, BadgeVariant } from "./Badge";

export interface ProfileAction {
  icon: React.ReactNode;
  "aria-label": string;
  href?: string;
  onClick?: () => void;
  title?: string;
}

export interface ProfileCardProps {
  name: string;
  role: string;
  subtitle?: string;
  image?: string | null;
  avatarUrl?: string | null;
  badgeLabel?: string;
  badgeVariant?: BadgeVariant;
  openHref?: string;
  actions?: ProfileAction[];
  cameraButton?: React.ReactNode;
  onEdit?: () => void;
  onMessage?: () => void;
  onSecurity?: () => void;
  onAdd?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ProfileCard({
  name,
  role,
  subtitle = "Workspace owner · Nova",
  image,
  avatarUrl,
  badgeLabel,
  badgeVariant,
  openHref,
  actions = [],
  cameraButton,
  onEdit,
  onMessage,
  onSecurity,
  onAdd,
  className = "",
  style,
}: ProfileCardProps) {
  const displayImage = avatarUrl !== undefined ? avatarUrl : image;
  const displayBadgeVariant: BadgeVariant =
    badgeVariant || (role.toUpperCase() === "ADMIN" ? "admin" : "neutral");
  const displayBadgeLabel = badgeLabel || role.toUpperCase();

  // If actions array is empty but helper callbacks are passed, build standard actions
  let resolvedActions = actions;
  if (resolvedActions.length === 0 && (onEdit || onMessage || onSecurity || onAdd)) {
    const list: ProfileAction[] = [];
    if (onEdit) list.push({ icon: <Pencil size={16} strokeWidth={1.8} />, "aria-label": "Edit profile", onClick: onEdit, title: "Edit profile" });
    if (onMessage) list.push({ icon: <Mail size={16} strokeWidth={1.8} />, "aria-label": "Send email", onClick: onMessage, title: "Send email" });
    if (onSecurity) list.push({ icon: <Shield size={16} strokeWidth={1.8} />, "aria-label": "Security governance", onClick: onSecurity, title: "Security" });
    if (onAdd) list.push({ icon: <Plus size={16} strokeWidth={1.8} />, "aria-label": "Add account", onClick: onAdd, title: "Add" });
    resolvedActions = list;
  }

  return (
    <section
      className={`profile-card ${className}`}
      style={{
        background: "var(--card-bg-crm)",
        borderRadius: "var(--radius-card)",
        padding: "24px 22px",
        border: "1px solid var(--border-hairline-light)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        boxShadow: "none",
        ...style,
      }}
    >
      {/* Top Header Row: Role Badge & Open Icon */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Badge variant={displayBadgeVariant}>
          {displayBadgeLabel}
        </Badge>

        {openHref && (
          <Link
            href={openHref}
            aria-label="View user profile"
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
            }}
          >
            <ArrowUpRight size={14} />
          </Link>
        )}
      </div>

      {/* Large Avatar (104px) with optional camera button */}
      <div style={{ margin: "4px 0 16px" }}>
        <Avatar
          src={displayImage}
          name={name}
          size="lg"
          cameraButton={cameraButton}
        />
      </div>

      {/* Name & Subtitle */}
      <h3
        style={{
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          margin: "0 0 4px",
          color: "var(--text-primary)",
        }}
      >
        {name}
      </h3>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-muted-crm)",
          margin: "0 0 20px",
          lineHeight: 1.4,
        }}
      >
        {subtitle}
      </p>

      {/* Circular Action Buttons Row */}
      {resolvedActions.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
          {resolvedActions.map((act, i) => {
            const btnStyle: React.CSSProperties = {
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "none",
              background: "var(--subtle-fill)",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              textDecoration: "none",
              transition: "transform 0.15s ease, background-color 0.15s ease",
            };

            if (act.href) {
              return (
                <Link
                  key={i}
                  href={act.href}
                  aria-label={act["aria-label"]}
                  title={act.title || act["aria-label"]}
                  className="icon-button-hover"
                  style={btnStyle}
                >
                  {act.icon}
                </Link>
              );
            }

            return (
              <button
                key={i}
                type="button"
                onClick={act.onClick}
                aria-label={act["aria-label"]}
                title={act.title || act["aria-label"]}
                className="icon-button-hover"
                style={btnStyle}
              >
                {act.icon}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
