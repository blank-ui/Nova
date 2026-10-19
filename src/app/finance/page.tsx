import { requireFinance } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  DollarSign,
  Receipt,
  Building,
  Shield,
  CreditCard,
  Calendar,
  FolderKanban,
  ArrowUpRight,
  Landmark,
  Scale,
} from "lucide-react";
import {
  PageHeader,
  SectionCard,
  StatTile,
  ProfileCard,
  DetailRow,
  Badge,
  EmptyState,
  PillButton,
} from "@/components/admin-ui";

export default async function FinanceWorkspace() {
  const session = await requireFinance();

  // Fetch inquiries with budgets, projects, clients, and db user
  const [inquiries, projects, clients, dbUser] = await Promise.all([
    prisma.inquiry.findMany({
      where: { budget: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true, email: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "CLIENT" },
      select: { id: true, name: true, email: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        twoFactorEnabled: true,
      },
    }),
  ]);

  const userName = dbUser?.name ?? session.user.name ?? "Finance";
  const userImage = dbUser?.image ?? session.user.image ?? null;

  return (
    <div className="animate-fade-in-up" style={{ width: "100%" }}>
      {/* Page Header */}
      <PageHeader
        titleLine1="Finance"
        titleLine2="Operations"
        stats={[
          {
            icon: <DollarSign size={18} strokeWidth={1.8} />,
            value: clients.length,
            badgeLabel: "Accounts",
            badgeVariant: "neutral",
            caption: "Active billing entities",
          },
          {
            icon: <Receipt size={18} strokeWidth={1.8} />,
            value: projects.length,
            badgeLabel: "Contracts",
            badgeVariant: "success",
            caption: "Commissioned projects",
          },
          {
            icon: <Building size={18} strokeWidth={1.8} />,
            value: inquiries.length,
            badgeLabel: "Pipeline",
            badgeVariant: "warning",
            caption: "Qualified budget scopes",
          },
        ]}
      />

      {/* Action Strip */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <PillButton variant="primary" href="/finance/invoices" icon={<Receipt size={14} />}>
            Billing &amp; Invoices
          </PillButton>
          <PillButton variant="outline" href="/portal/scope" icon={<DollarSign size={14} />}>
            + Request Financial Scope
          </PillButton>
          <PillButton variant="outline" href="/portal/projects" icon={<FolderKanban size={14} />}>
            Client Projects ({projects.length})
          </PillButton>
          <PillButton variant="subtle" href="/portal/appointments" icon={<Calendar size={14} />}>
            Consultations Schedule
          </PillButton>
        </div>
      </div>

      {/* Main Two-Column Grid matching Design Language */}
      <div
        className="overview-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.8fr) minmax(320px, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Left Column (65%) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          {/* 3 Metric Stat Tiles */}
          <div
            className="stat-tiles-row"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14,
            }}
          >
            <StatTile
              category="Client Accounts"
              title="Billing Entities"
              value={clients.length}
              caption="Registered enterprise accounts"
              variant="black"
              href="/finance"
              actionIcon="arrow"
            />
            <StatTile
              category="Commercial Execution"
              title="Active Contracts"
              value={projects.length}
              caption="Retainers &amp; milestones"
              variant="teal"
              href="/portal/projects"
              actionIcon="arrow"
            />
            <StatTile
              category="Valuation Pipeline"
              title="Qualified Scopes"
              value={inquiries.length}
              caption="Declared budget ranges"
              variant="yellow"
              href="/finance"
              actionIcon="arrow"
            />
          </div>

          {/* Financial Pipeline Table */}
          <SectionCard
            title="Project Scope & Budget Valuations"
            headerRight={
              <Badge variant="warning">{inquiries.length} Qualified Scopes</Badge>
            }
          >
            {inquiries.length === 0 ? (
              <EmptyState
                icon={<DollarSign size={36} />}
                title="No qualified budget scopes"
                description="When new client inquiries declare budget ranges, they will automatically appear here for commercial review."
              />
            ) : (
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--border-hairline-light)",
                        color: "var(--text-muted-crm)",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                      }}
                    >
                      <th style={{ padding: "12px 14px", fontWeight: 700 }}>Client / Entity</th>
                      <th style={{ padding: "12px 14px", fontWeight: 700 }}>Declared Budget</th>
                      <th style={{ padding: "12px 14px", fontWeight: 700 }}>Service Focus</th>
                      <th style={{ padding: "12px 14px", fontWeight: 700 }}>Pipeline Status</th>
                      <th style={{ padding: "12px 14px", fontWeight: 700 }}>Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inq) => (
                      <tr
                        key={inq.id}
                        style={{
                          borderBottom: "1px solid var(--border-hairline-light)",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <td style={{ padding: "14px" }}>
                          <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{inq.name}</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted-crm)" }}>
                            {inq.company || inq.email}
                          </div>
                        </td>
                        <td style={{ padding: "14px", fontWeight: 700, color: "var(--accent-teal, #10b981)" }}>
                          {inq.budget || "$5,000 – $15,000"}
                        </td>
                        <td style={{ padding: "14px", color: "var(--text-secondary)" }}>
                          {inq.service}
                        </td>
                        <td style={{ padding: "14px" }}>
                          <Badge variant={inq.status === "QUALIFIED" ? "info" : "warning"}>
                            {inq.status}
                          </Badge>
                        </td>
                        <td style={{ padding: "14px", color: "var(--text-muted-crm)", fontSize: 12 }}>
                          {new Date(inq.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Corporate Entity Banner */}
          <SectionCard title="Corporate & Commercial Entity">
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                padding: "4px 0",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "var(--subtle-fill)",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Landmark size={20} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                  All Sky Fares LLC &middot; Corporate Invoicing Authority
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted-crm)", margin: 0, lineHeight: 1.6 }}>
                  All engineering retainers, commercial milestones, and transactional settlements are processed under
                  All Sky Fares LLC. Client invoices are backed by formalized master services agreements (MSA) and
                  standard studio statements of work (SOW).
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column (35%) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Finance Profile Card */}
          <ProfileCard
            name={userName}
            role="FINANCE"
            subtitle="Financial Operations &middot; Nova"
            image={userImage}
            openHref="/portal/security"
            badgeLabel="FINANCE"
            badgeVariant="info"
            actions={[
              {
                icon: <Shield size={16} strokeWidth={1.8} />,
                "aria-label": "Security settings",
                href: "/portal/security",
                title: "Security & MFA",
              },
            ]}
          />

          {/* Financial Fast Actions */}
          <SectionCard title="Financial Fast Actions">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <DetailRow
                icon={<Receipt size={16} />}
                label="Billing Records"
                value="Invoices &amp; Receipts"
                action={
                  <Link
                    href="/finance/invoices"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--brand-primary, #6366F1)",
                      textDecoration: "none",
                    }}
                  >
                    View →
                  </Link>
                }
              />
              <DetailRow
                icon={<FolderKanban size={16} />}
                label="Commissioned Projects"
                value={`${projects.length} Active Contracts`}
                action={
                  <Link
                    href="/portal/projects"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--brand-primary, #6366F1)",
                      textDecoration: "none",
                    }}
                  >
                    Manage →
                  </Link>
                }
              />
              <DetailRow
                icon={<Calendar size={16} />}
                label="Client Consultations"
                value="Retainer Bookings"
                action={
                  <Link
                    href="/portal/appointments"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--brand-primary, #6366F1)",
                      textDecoration: "none",
                    }}
                  >
                    Schedule →
                  </Link>
                }
              />
              <DetailRow
                icon={<Shield size={16} />}
                label="MFA & Governance"
                value={dbUser?.twoFactorEnabled ? "2FA Active" : "Setup 2FA"}
                action={
                  <Link
                    href="/portal/security"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--brand-primary, #6366F1)",
                      textDecoration: "none",
                    }}
                  >
                    Configure →
                  </Link>
                }
              />
            </div>
          </SectionCard>

          {/* Billing & Tax Compliance */}
          <SectionCard title="Billing &amp; Entity Compliance">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <DetailRow
                icon={<Landmark size={16} />}
                label="Corporate Authority"
                value={<Badge variant="neutral">All Sky Fares LLC</Badge>}
              />
              <DetailRow
                icon={<Scale size={16} />}
                label="Tax &amp; Legal Registry"
                value={<Badge variant="success">US Registered</Badge>}
              />
              <DetailRow
                icon={<DollarSign size={16} />}
                label="Settlement Currency"
                value={<Badge variant="neutral">USD ($)</Badge>}
              />
              <DetailRow
                icon={<CreditCard size={16} />}
                label="Payment Rails"
                value={<Badge variant="info">Wire &middot; Stripe &middot; ACH</Badge>}
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
