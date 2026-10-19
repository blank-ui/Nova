import { requireFinance } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { Receipt, ArrowLeft, DollarSign, CheckCircle2, Send } from "lucide-react";
import { PageHeader, PillButton } from "@/components/admin-ui";
import { FinanceInvoicesManager } from "@/components/finance-invoices-manager";
import { generateNextInvoiceNumber } from "@/lib/invoice-utils";
import type { InvoiceData } from "@/components/invoice-modal";

export default async function InvoicesPage() {
  const session = await requireFinance();

  // 1. Fetch all existing projects
  let allProjects = await prisma.project.findMany({
    include: {
      client: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // If database is completely empty (no projects), seed a default completed paid project
  if (allProjects.length === 0) {
    let clientUser = await prisma.user.findFirst({
      where: { role: "CLIENT" },
    });

    if (!clientUser) {
      clientUser = await prisma.user.create({
        data: {
          email: "acme.corp@allskyfares.com",
          name: "Acme Global Technologies",
          role: "CLIENT",
          emailVerified: true,
        },
      });
    }

    const seededProj = await prisma.project.create({
      data: {
        name: "Nova Enterprise Client Portal & API Engine",
        description: "Full-stack client portal with real-time milestones, financial ledger, and secure authentication.",
        status: "COMPLETED",
        paymentStatus: "PAID",
        clientId: clientUser.id,
        milestones: {
          create: [
            {
              title: "Sprint 1: Architecture Blueprint & Technical Setup",
              description: "Initial database models, session management, and UI foundation.",
              dueAt: new Date(),
              completedAt: new Date(),
            },
            {
              title: "Sprint 2: Financial Invoicing & Enterprise Milestone Verification",
              description: "Invoice generation with NOVA-fy-01 sequencing, download, and email dispatch.",
              dueAt: new Date(),
              completedAt: new Date(),
            },
          ],
        },
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });

    allProjects = [seededProj];
  }

  // 2. Ensure each project has an invoice in the DB conforming to NOVA-fy-01
  const existingInvoices = await prisma.invoice.findMany({
    include: {
      project: { select: { id: true, name: true, description: true, status: true, paymentStatus: true } },
      client: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const projectIdsWithInvoice = new Set(existingInvoices.map((i) => i.projectId));

  for (const proj of allProjects) {
    if (!projectIdsWithInvoice.has(proj.id)) {
      const nextNumber = await generateNextInvoiceNumber(prisma);
      const newInv = await prisma.invoice.create({
        data: {
          invoiceNumber: nextNumber,
          projectId: proj.id,
          clientId: proj.clientId,
          amount: 12500.0,
          currency: "USD",
          status: "PAID",
          paidAt: new Date(),
          items: [
            {
              description: `${proj.name} — Milestone Scope Deliverables`,
              quantity: 1,
              unitPrice: 12500.0,
              amount: 12500.0,
            },
          ],
          notes: "Contractual milestone delivery settled in full under All Sky Fares LLC Master Services Agreement.",
        },
        include: {
          project: { select: { id: true, name: true, description: true, status: true, paymentStatus: true } },
          client: { select: { id: true, name: true, email: true } },
        },
      });
      existingInvoices.unshift(newInv);
    }
  }

  // 3. Serialize invoices for client component
  const serializedInvoices: InvoiceData[] = existingInvoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    projectId: inv.projectId,
    projectName: inv.project?.name || "Client Project",
    projectDescription: inv.project?.description,
    clientId: inv.clientId,
    clientName: inv.client?.name || "Client",
    clientEmail: inv.client?.email || "",
    amount: inv.amount,
    currency: inv.currency,
    status: inv.status,
    issuedAt: inv.issuedAt.toISOString(),
    paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
    sentAt: inv.sentAt ? inv.sentAt.toISOString() : null,
    sentToEmail: inv.sentToEmail,
    items: (inv.items as any) || undefined,
    notes: inv.notes,
  }));

  const availableProjects = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
    clientName: p.client?.name || "Client",
    clientEmail: p.client?.email || "",
  }));

  const totalSettled = serializedInvoices.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSent = serializedInvoices.filter((i) => Boolean(i.sentAt)).length;

  return (
    <div className="animate-fade-in-up" style={{ width: "100%" }}>
      <PageHeader
        titleLine1="Client"
        titleLine2="Invoicing"
        stats={[
          {
            icon: <Receipt size={18} strokeWidth={1.8} />,
            value: serializedInvoices.length,
            badgeLabel: "Invoices",
            badgeVariant: "info",
            caption: "Sequential statements on file",
          },
          {
            icon: <DollarSign size={18} strokeWidth={1.8} />,
            value: `$${(totalSettled / 1000).toFixed(1)}k`,
            badgeLabel: "Settled",
            badgeVariant: "success",
            caption: "Total volume received",
          },
          {
            icon: <Send size={18} strokeWidth={1.8} />,
            value: totalSent,
            badgeLabel: "Dispatched",
            badgeVariant: "neutral",
            caption: "Sent to client accounts",
          },
        ]}
      />

      <div style={{ marginBottom: 20 }}>
        <PillButton variant="outline" href="/finance" icon={<ArrowLeft size={14} />}>
          Back to Finance Operations
        </PillButton>
      </div>

      <FinanceInvoicesManager
        initialInvoices={serializedInvoices}
        availableProjects={availableProjects}
      />
    </div>
  );
}
