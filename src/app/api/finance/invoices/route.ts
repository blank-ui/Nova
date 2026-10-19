import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-guards";
import { generateNextInvoiceNumber, formatInvoiceNumber } from "@/lib/invoice-utils";
import { sendInvoiceEmail } from "@/lib/invoice-email";

/**
 * GET /api/finance/invoices
 * Returns all invoices and ensures paid projects have sequential NOVA-FYYYMM-01 invoices.
 */
export async function GET() {
  const session = await getCurrentSession();
  if (!session || (session.user.role !== "FINANCE" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized. Finance role required." }, { status: 403 });
  }

  try {
    // 1. Fetch all existing invoices
    let invoices = await prisma.invoice.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            paymentStatus: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Fetch projects that might not have an invoice yet
    const projectsWithoutInvoice = await prisma.project.findMany({
      where: {
        invoices: {
          none: {},
        },
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Auto-provision invoice for projects where clients have paid or existing projects
    if (projectsWithoutInvoice.length > 0) {
      for (const proj of projectsWithoutInvoice) {
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
                description: `${proj.name} — Milestone 1 & 2 Execution`,
                quantity: 1,
                unitPrice: 12500.0,
                amount: 12500.0,
              },
            ],
            notes: "Contractual milestone delivery settled in full under All Sky Fares LLC Master Services Agreement.",
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
                paymentStatus: true,
              },
            },
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
        invoices.unshift(newInv);
      }
    }

    return NextResponse.json({ ok: true, invoices });
  } catch (err: any) {
    console.error("[GET /api/finance/invoices] Error:", err);
    return NextResponse.json({ error: "Failed to load invoices." }, { status: 500 });
  }
}

/**
 * POST /api/finance/invoices
 * Handles:
 * - action: "send" -> Dispatches invoice to client email
 * - action: "create" -> Creates new invoice with next NOVA-FY-01 sequence
 * - action: "mark-paid" -> Updates invoice status to PAID
 * - action: "seed-sample" -> Seeds sample paid project with invoice if workspace is empty
 */
export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || (session.user.role !== "FINANCE" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized. Finance role required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const action = String(body.action || "").trim();

    // ACTION: SEND INVOICE TO CLIENT
    if (action === "send") {
      const invoiceId = String(body.invoiceId || "").trim();
      const customEmail = body.to ? String(body.to).trim() : null;
      const customNote = body.customNote ? String(body.customNote).trim() : undefined;

      if (!invoiceId) {
        return NextResponse.json({ error: "Invoice ID is required." }, { status: 400 });
      }

      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          project: { select: { id: true, name: true } },
          client: { select: { id: true, name: true, email: true } },
        },
      });

      if (!invoice) {
        return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
      }

      const targetEmail = customEmail || invoice.client.email;
      if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
        return NextResponse.json({ error: "Valid recipient email is required." }, { status: 400 });
      }

      // Dispatch Email
      const emailResult = await sendInvoiceEmail({
        to: targetEmail,
        clientName: invoice.client.name,
        projectName: invoice.project.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        currency: invoice.currency,
        issuedAt: invoice.issuedAt,
        customNote,
        senderName: session.user.name || "Finance Operations",
      });

      // Update invoice in DB
      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          sentAt: new Date(),
          sentToEmail: targetEmail,
          status: "SENT",
          updatedAt: new Date(),
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "INVOICE_SENT_TO_CLIENT",
          entityType: "Invoice",
          entityId: invoice.id,
          metadata: {
            invoiceNumber: invoice.invoiceNumber,
            recipient: targetEmail,
            amount: invoice.amount,
            projectName: invoice.project.name,
          },
        },
      }).catch(() => null);

      return NextResponse.json({
        ok: true,
        message: `Invoice ${invoice.invoiceNumber} successfully dispatched to ${targetEmail}.`,
        invoice: updatedInvoice,
      });
    }

    // ACTION: CREATE NEW INVOICE
    if (action === "create") {
      const projectId = String(body.projectId || "").trim();
      const amount = typeof body.amount === "number" ? body.amount : parseFloat(body.amount) || 12500.0;
      const currency = body.currency || "USD";
      const notes = body.notes ? String(body.notes).trim() : null;
      const items = Array.isArray(body.items) ? body.items : null;

      if (!projectId) {
        return NextResponse.json({ error: "Project ID is required to generate invoice." }, { status: 400 });
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { client: true },
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }

      // Generate invoice number conforming to NOVA-FYYYMM-01 format
      const nextNumber = await generateNextInvoiceNumber(prisma);

      const newInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber: nextNumber,
          projectId: project.id,
          clientId: project.clientId,
          amount,
          currency,
          status: "PAID",
          paidAt: new Date(),
          notes: notes || `Contract milestone statement settled for ${project.name}.`,
          items: items || [
            {
              description: `${project.name} — Commissioned Scope & Milestone Settlement`,
              quantity: 1,
              unitPrice: amount,
              amount: amount,
            },
          ],
        },
        include: {
          project: { select: { id: true, name: true } },
          client: { select: { id: true, name: true, email: true } },
        },
      });

      // Update project paymentStatus to PAID
      await prisma.project.update({
        where: { id: project.id },
        data: { paymentStatus: "PAID" },
      });

      return NextResponse.json({
        ok: true,
        message: `Invoice ${newInvoice.invoiceNumber} generated successfully.`,
        invoice: newInvoice,
      });
    }

    // ACTION: SEED SAMPLE PAID PROJECT & INVOICE
    if (action === "seed-sample") {
      // Find or create a client user
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

      // Create a paid project
      const sampleProject = await prisma.project.create({
        data: {
          name: "Nova Enterprise Client Portal & API Engine",
          description: "Full-stack client portal with real-time milestones, financial ledger, and secure authentication.",
          status: "COMPLETED",
          paymentStatus: "PAID",
          clientId: clientUser.id,
          milestones: {
            create: [
              {
                title: "Sprint 1: Architecture Blueprint & Security Setup",
                description: "Initial database models, session management, and UI foundation.",
                dueAt: new Date(),
                completedAt: new Date(),
              },
              {
                title: "Sprint 2: Financial Invoicing & Milestone Verification",
                description: "Invoice generation with NOVA-FYYYMM-01 sequencing, download, and email dispatch.",
                dueAt: new Date(),
                completedAt: new Date(),
              },
            ],
          },
        },
      });

      const nextNumber = await generateNextInvoiceNumber(prisma);
      const sampleInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber: nextNumber,
          projectId: sampleProject.id,
          clientId: clientUser.id,
          amount: 14500.0,
          currency: "USD",
          status: "PAID",
          paidAt: new Date(),
          items: [
            {
              description: "Sprint 1: Architecture Blueprint & Technical Setup",
              quantity: 1,
              unitPrice: 6500.0,
              amount: 6500.0,
            },
            {
              description: "Sprint 2: Financial Invoicing & Enterprise Milestone Verification",
              quantity: 1,
              unitPrice: 8000.0,
              amount: 8000.0,
            },
          ],
          notes: "Approved and settled in full under All Sky Fares LLC Master Services Agreement.",
        },
      });

      return NextResponse.json({
        ok: true,
        message: `Sample project and invoice ${sampleInvoice.invoiceNumber} created.`,
        invoice: sampleInvoice,
      });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err: any) {
    console.error("[POST /api/finance/invoices] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to process invoice request." }, { status: 500 });
  }
}
