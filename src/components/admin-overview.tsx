"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  CheckCircle2,
  Users,
  Shield,
  Lock,
  Mail,
  Clock,
  Edit2,
  Plus,
  ArrowUpRight,
  User,
} from "lucide-react";
import {
  PageHeader,
  SectionCard,
  StatTile,
  ProfileCard,
  DetailRow,
  Badge,
  SegmentedToggle,
  EmptyState,
  PillButton,
  DataTable,
} from "@/components/admin-ui";

export interface AdminOverviewProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    twoFactorEnabled: boolean;
    image?: string | null;
  };
  metrics: {
    newInquiries: number;
    qualifiedInquiries: number;
    totalUsers: number;
    totalGallery: number;
    totalProjects: number;
    totalInquiries: number;
  };
  recentInquiries: Array<{
    id: string;
    name: string;
    email: string;
    service: string;
    budget?: string | null;
    status: string;
    createdAt: string;
  }>;
}

export function AdminOverview({ user, metrics, recentInquiries }: AdminOverviewProps) {
  const [funnelPeriod, setFunnelPeriod] = useState<"month" | "all">("month");

  return (
    <div className="animate-fade-in-up">
      {/* Page Header: Back button, Admin / Overview, Headline Stats Strip */}
      <PageHeader
        titleLine1="Admin"
        titleLine2="Overview"
        stats={[
          {
            icon: <MessageSquare size={18} strokeWidth={1.8} />,
            value: metrics.newInquiries,
            badgeLabel: "New",
            badgeVariant: "warning",
            caption: "Inquiries awaiting review",
          },
          {
            icon: <CheckCircle2 size={18} strokeWidth={1.8} />,
            value: metrics.qualifiedInquiries,
            badgeLabel: "Qualified",
            badgeVariant: "info",
            caption: "Ready for scoping",
          },
          {
            icon: <Users size={18} strokeWidth={1.8} />,
            value: metrics.totalUsers,
            badgeLabel: "Accounts",
            badgeVariant: "neutral",
            caption: "Users & roles provisioned",
          },
        ]}
      />

      {/* Main Content Layout: Left 65% / Right 35% */}
      <div
        className="overview-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.8fr) minmax(320px, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Card: Workspace Modules */}
          <SectionCard
            title="Workspace Modules"
            showDefaultActions
            openHref="/admin/inquiry"
          >
            <div
              className="workspace-modules-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
              }}
            >
              {/* Tile 1: Blue - New Inquiries */}
              <StatTile
                category="CRM"
                title="New Inquiries"
                value={metrics.newInquiries}
                caption="Awaiting review"
                variant="blue"
                actionIcon="more"
                href="/admin/inquiry?status=NEW"
              />

              {/* Tile 2: Teal - Qualified Leads */}
              <StatTile
                category="CRM"
                title="Qualified Leads"
                value={metrics.qualifiedInquiries}
                caption="Ready to scope"
                variant="teal"
                actionIcon="more"
                href="/admin/inquiry?status=QUALIFIED"
              />

              {/* Tile 3: Black - Users & Accounts */}
              <StatTile
                category="Access"
                title="Users & Accounts"
                value={metrics.totalUsers}
                caption="Provisioning & roles"
                variant="black"
                actionIcon="arrow"
                href="/admin/users"
              />

              {/* Tile 4: Yellow - GitHub & Gallery */}
              <StatTile
                category="Showcase"
                title="GitHub & Gallery"
                value={metrics.totalGallery}
                caption="Mockups & repos"
                variant="yellow"
                actionIcon="more"
                href="/admin/showcase"
              />

              {/* Tile 5: White - Active Projects */}
              <StatTile
                category="Delivery"
                title="Active Projects"
                value={metrics.totalProjects}
                caption="Client workspaces"
                variant="white"
                actionIcon="more"
                href="/admin/projects"
              />

              {/* Tile 6: White - All Inquiries */}
              <StatTile
                category="Totals"
                title="All Inquiries"
                value={metrics.totalInquiries}
                caption="Logged to date"
                variant="white"
                actionIcon="more"
                href="/admin/inquiry"
              />
            </div>
          </SectionCard>

          {/* Subgrid: Recent Inquiries + Lead Funnel */}
          <div
            className="overview-subgrid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
            }}
          >
            {/* Card: Recent Inquiries */}
            <SectionCard
              title="Recent Inquiries"
              headerRight={
                <Link
                  href="/admin/inquiry"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-hairline)",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-pill)",
                    textDecoration: "none",
                  }}
                >
                  View all ({metrics.totalInquiries})
                </Link>
              }
            >
              {recentInquiries.length === 0 ? (
                <EmptyState
                  icon={<User size={22} />}
                  title="No inquiries received yet"
                  description="When customers submit the inquiry form, they will appear here in real time."
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recentInquiries.slice(0, 4).map((inq) => (
                    <Link
                      key={inq.id}
                      href={`/admin/inquiry/${inq.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        borderRadius: "var(--radius-row)",
                        background: "var(--surface-raised)",
                        border: "1px solid var(--border-hairline-light)",
                        textDecoration: "none",
                        color: "inherit",
                        transition: "transform 0.15s ease",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                          {inq.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted-crm)", marginTop: 2 }}>
                          {inq.service}
                        </div>
                      </div>
                      <Badge variant={inq.status === "NEW" ? "warning" : inq.status === "QUALIFIED" ? "info" : "neutral"}>
                        {inq.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Card: Lead Funnel */}
            <SectionCard
              title="Lead Funnel"
              headerRight={
                <SegmentedToggle
                  value={funnelPeriod}
                  onChange={(v) => setFunnelPeriod(v as "month" | "all")}
                  options={[
                    { label: "This month", value: "month" },
                    { label: "All time", value: "all" },
                  ]}
                />
              }
            >
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    color: "var(--text-primary)",
                  }}
                >
                  {metrics.totalInquiries}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted-crm)", marginTop: 4 }}>
                  Total in pipeline
                </div>
              </div>

              {/* Stacked Narrowing Rows */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                }}
              >
                {/* Row 1: New (100% width) */}
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 18px",
                    borderRadius: "var(--radius-row)",
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-hairline-light)",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                    New
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>
                    {metrics.newInquiries}
                  </span>
                </div>

                {/* Row 2: Qualified (88% width) */}
                <div
                  style={{
                    width: "88%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 18px",
                    borderRadius: "var(--radius-row)",
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-hairline-light)",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                    Qualified
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>
                    {metrics.qualifiedInquiries}
                  </span>
                </div>

                {/* Row 3: Active project (76% width) */}
                <div
                  style={{
                    width: "76%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 18px",
                    borderRadius: "var(--radius-row)",
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-hairline-light)",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                    Active project
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>
                    {metrics.totalProjects}
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>

        {/* RIGHT COLUMN: ProfileCard + System & Session Governance */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* ProfileCard */}
          <ProfileCard
            name={user.name || "Bipul"}
            role={user.role}
            subtitle="Workspace owner · Nova"
            image={user.image}
            userId={user.id}
            openHref="/admin/security"
            actions={[
              {
                icon: <Edit2 size={16} strokeWidth={1.8} />,
                "aria-label": "Edit administrator profile",
                href: "/admin/security",
                title: "Edit profile",
              },
              {
                icon: <Mail size={16} strokeWidth={1.8} />,
                "aria-label": "Send email",
                href: `mailto:${user.email}`,
                title: "Send email",
              },
              {
                icon: <Shield size={16} strokeWidth={1.8} />,
                "aria-label": "Security settings",
                href: "/admin/security",
                title: "Security & MFA",
              },
              {
                icon: <Plus size={16} strokeWidth={1.8} />,
                "aria-label": "New Inquiry",
                href: "/admin/inquiry",
                title: "New lead",
              },
            ]}
          />

          {/* SectionCard: System & Session Governance */}
          <SectionCard
            title="System & Session Governance"
            headerRight={
              <Link
                href="/admin/security"
                aria-label="Manage governance credentials"
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
                <Edit2 size={13} strokeWidth={1.8} />
              </Link>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Row 1: Role Authorization */}
              <DetailRow
                icon={<Shield size={16} strokeWidth={1.8} />}
                label="Role Authorization"
                value="Admin workspace access"
                action={<Badge variant="admin">ADMIN</Badge>}
              />

              {/* Row 2: Two-Factor Auth */}
              <DetailRow
                icon={<Lock size={16} strokeWidth={1.8} />}
                label="Two-Factor Auth (TOTP)"
                value={
                  user.twoFactorEnabled
                    ? "Active · TOTP verification"
                    : "Optional · not set up"
                }
                action={
                  <Link href="/admin/security" style={{ textDecoration: "none" }}>
                    <Badge variant={user.twoFactorEnabled ? "success" : "warning"}>
                      {user.twoFactorEnabled ? "Active" : "Enable"}
                    </Badge>
                  </Link>
                }
              />

              {/* Row 3: Operations Dispatch */}
              <DetailRow
                icon={<Mail size={16} strokeWidth={1.8} />}
                label="Operations Dispatch"
                value="nova@allskyfares.com"
              />

              {/* Row 4: Signed in as */}
              <DetailRow
                icon={<Clock size={16} strokeWidth={1.8} />}
                label="Signed in as"
                value={user.email}
              />
            </div>
          </SectionCard>
        </div>
      </div>

      <style>{`
        @media (max-width: 1040px) {
          .overview-grid {
            grid-template-columns: 1fr !important;
          }
          .workspace-modules-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 680px) {
          .workspace-modules-grid {
            grid-template-columns: 1fr !important;
          }
          .overview-subgrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
