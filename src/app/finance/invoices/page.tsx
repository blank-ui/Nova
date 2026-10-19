import { requireFinance } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { Receipt, ArrowLeft, ArrowUpRight, DollarSign, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PageHeader, SectionCard, Badge, PillButton, EmptyState } from "@/components/admin-ui";

export default async function InvoicesPage() {
  await requireFinance();

  const projects = await prisma.project.findMany({
    include: {
      client: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in-up" style={{ width: "100%" }}>
      <PageHeader
        titleLine1="Client"
        titleLine2="Invoicing"
        stats={[
          {
            icon: <Receipt size={18} strokeWidth={1.8} />,
            value: projects.length,
            badgeLabel: "Invoices",
            badgeVariant: "info",
            caption: "Generated billing statements",
          },
          {
            icon: <DollarSign size={18} strokeWidth={1.8} />,
            value: "$USD",
            badgeLabel: "Settled",
            badgeVariant: "success",
            caption: "Primary currency",
          },
          {
            icon: <CheckCircle2 size={18} strokeWidth={1.8} />,
            value: "Active",
            badgeLabel: "SLA",
            badgeVariant: "neutral",
            caption: "All Sky Fares LLC",
          },
        ]}
      />

      <div style={{ marginBottom: 24 }}>
        <PillButton variant="outline" href="/finance" icon={<ArrowLeft size={14} />}>
          Back to Finance Operations
        </PillButton>
      </div>

      <SectionCard
        title="Client Invoices & Billing Records"
        headerRight={<Badge variant="success">{projects.length} Invoices On File</Badge>}
      >
        {projects.length === 0 ? (
          <EmptyState
            icon={<Receipt size={36} />}
            title="No billing statements found"
            description="Invoices are generated upon contract commissioning and milestone deliverables."
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {projects.map((proj, idx) => (
              <div
                key={proj.id}
                style={{
                  padding: "16px 20px",
                  borderRadius: "var(--radius-card)",
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-hairline-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 14,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                    Invoice #INV-2026-00{idx + 1} &middot; {proj.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted-crm)", marginTop: 4 }}>
                    Billed to: <strong>{proj.client.name}</strong> ({proj.client.email})
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>
                    $12,500.00 USD
                  </span>
                  <Badge variant="success">PAID / SETTLED</Badge>
                  <Link
                    href={`/portal/projects/${proj.id}`}
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--brand-primary, #6366F1)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>Scope</span>
                    <ArrowUpRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
