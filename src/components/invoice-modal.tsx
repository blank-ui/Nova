"use client";

import React, { useState } from "react";
import {
  X,
  Printer,
  Download,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building,
  Receipt,
  Mail,
  ShieldCheck,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/components/toast";

export interface InvoiceItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount: number;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  projectId: string;
  projectName: string;
  projectDescription?: string | null;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  status: string;
  issuedAt: string;
  paidAt?: string | null;
  sentAt?: string | null;
  sentToEmail?: string | null;
  items?: InvoiceItem[];
  notes?: string | null;
}

export interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
  onInvoiceSent?: (updatedInvoice: InvoiceData) => void;
}

export function InvoiceModal({ isOpen, onClose, invoice, onInvoiceSent }: InvoiceModalProps) {
  const toast = useToast();
  const [isSending, setIsSending] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [customNote, setCustomNote] = useState("");

  if (!isOpen || !invoice) return null;

  const formattedIssueDate = new Date(invoice.issuedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedPaidDate = invoice.paidAt
    ? new Date(invoice.paidAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : formattedIssueDate;

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: invoice.currency || "USD",
  }).format(invoice.amount);

  const lineItems: InvoiceItem[] =
    invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0
      ? invoice.items
      : [
          {
            description: `${invoice.projectName} — Milestone Scope & Implementation Deliverables`,
            quantity: 1,
            unitPrice: invoice.amount,
            amount: invoice.amount,
          },
        ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    const invoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Invoice ${invoice.invoiceNumber} — Nova</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #fff; color: #101322; padding: 40px; margin: 0; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #101322; padding-bottom: 20px; }
    .title { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; }
    .badge { display: inline-block; background: #10B981; color: #fff; padding: 4px 12px; border-radius: 99px; font-weight: 700; font-size: 12px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 30px 0; }
    .table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    .table th { text-align: left; background: #f6f4ee; padding: 10px; font-size: 12px; text-transform: uppercase; }
    .table td { padding: 12px 10px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .totals { margin-top: 30px; text-align: right; }
    .totals-row { font-size: 16px; margin-bottom: 6px; }
    .total-large { font-size: 24px; font-weight: 800; color: #101322; }
    .footer { margin-top: 50px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">NOVA &middot; ALL SKY FARES LLC</div>
      <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">Official Commercial & Milestone Billing Statement</div>
    </div>
    <div style="text-align: right;">
      <div class="badge">PAID / SETTLED</div>
      <div style="font-size: 18px; font-weight: 800; margin-top: 6px;">${invoice.invoiceNumber}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div>
      <div style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700;">Billed To</div>
      <div style="font-size: 15px; font-weight: 700; margin-top: 4px;">${invoice.clientName}</div>
      <div style="font-size: 13px; color: #4b5563;">${invoice.clientEmail}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700;">Statement Details</div>
      <div style="font-size: 13px; margin-top: 4px;"><strong>Issue Date:</strong> ${formattedIssueDate}</div>
      <div style="font-size: 13px;"><strong>Settled Date:</strong> ${formattedPaidDate}</div>
      <div style="font-size: 13px;"><strong>Project:</strong> ${invoice.projectName}</div>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Deliverable Description</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Rate</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${lineItems
        .map(
          (item) => `
        <tr>
          <td>${item.description}</td>
          <td style="text-align: center;">${item.quantity || 1}</td>
          <td style="text-align: right;">$${Number(item.unitPrice || item.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
          <td style="text-align: right; font-weight: 700;">$${Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">Subtotal: ${formattedAmount} USD</div>
    <div class="totals-row">Tax / VAT (0% B2B Reverse Charge): $0.00 USD</div>
    <div class="totals-row total-large">Total Paid: ${formattedAmount} USD</div>
    <div style="color: #10B981; font-weight: 700; font-size: 14px; margin-top: 6px;">Balance Due: $0.00 USD</div>
  </div>

  <div class="footer">
    <p>Issued by All Sky Fares LLC &middot; Nova Studio Platform &middot; Contact: billing@allskyfares.com</p>
    <p>Milestone deliverables approved and compensated under Master Services Agreement. All intellectual property transferred to client.</p>
  </div>
</body>
</html>`;

    const blob = new Blob([invoiceHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice-${invoice.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Invoice ${invoice.invoiceNumber} downloaded.`);
  };

  const handleSendInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const res = await fetch("/api/finance/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          invoiceId: invoice.id,
          to: recipientEmail.trim() || invoice.clientEmail,
          customNote: customNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch invoice.");
      }

      toast.success(data.message || `Invoice ${invoice.invoiceNumber} sent successfully!`);
      setSendModalOpen(false);
      if (onInvoiceSent && data.invoice) {
        onInvoiceSent({
          ...invoice,
          sentAt: data.invoice.sentAt,
          sentToEmail: data.invoice.sentToEmail,
          status: "SENT",
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send invoice.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Primary Invoice Modal Overlay */}
      <div
        className="invoice-modal-overlay"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10, 12, 22, 0.72)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          overflowY: "auto",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="invoice-modal-dialog"
          style={{
            width: "100%",
            maxWidth: 820,
            maxHeight: "92vh",
            background: "var(--surface-primary, #FFFFFF)",
            color: "var(--text-primary, #101322)",
            borderRadius: 24,
            boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Top Floating Control Bar (Hidden during print) */}
          <div
            className="invoice-control-bar no-print"
            style={{
              padding: "16px 24px",
              background: "var(--surface-raised, #F6F4EE)",
              borderBottom: "1px solid var(--border-hairline, rgba(0,0,0,0.08))",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "var(--ink-crm, #101322)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Receipt size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>Invoice {invoice.invoiceNumber}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted-crm, #6B7280)" }}>
                  {invoice.projectName} &middot; Status: {invoice.status}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handlePrint}
                className="button button-outline"
                style={{
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                }}
                title="Print or Save as PDF"
              >
                <Printer size={14} />
                <span>Print / Save PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadHtml}
                className="button button-outline"
                style={{
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                }}
                title="Download HTML Document"
              >
                <Download size={14} />
                <span>Download</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRecipientEmail(invoice.clientEmail);
                  setSendModalOpen(true);
                }}
                className="button"
                style={{
                  padding: "8px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  background: "var(--ink-crm, #101322)",
                  color: "#FFFFFF",
                }}
              >
                <Send size={14} />
                <span>Send to Client</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close invoice"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-muted-crm, #6B7280)",
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Invoice Sheet Body */}
          <div
            className="invoice-printable-sheet"
            style={{
              padding: "40px 48px",
              overflowY: "auto",
              flex: 1,
              background: "#FFFFFF",
              color: "#101322",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {/* Invoice Top Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                paddingBottom: 28,
                borderBottom: "2px solid #101322",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "#101322",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em" }}>NOVA</span>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#FFB547",
                      display: "inline-block",
                    }}
                  />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#101322", marginTop: 8 }}>
                  All Sky Fares LLC &middot; Nova Studio Platform
                </div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  Official Commercial & Milestone Billing Statement
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                  Entity Ref: NV-ASF-ENT &middot; billing@allskyfares.com
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: 99,
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#059669",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    marginBottom: 8,
                  }}
                >
                  <CheckCircle2 size={13} />
                  <span>PAID / SETTLED</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", color: "#101322" }}>
                  {invoice.invoiceNumber}
                </div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  Issued: <strong>{formattedIssueDate}</strong>
                </div>
              </div>
            </div>

            {/* Billed To and Commercial Details 2-Column Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 28,
                margin: "28px 0",
                padding: "20px 24px",
                borderRadius: 16,
                background: "#F9F9F8",
                border: "1px solid #ECEAE4",
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#6B7280", letterSpacing: "0.06em" }}>
                  Billed Client & Entity
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#101322", marginTop: 6 }}>
                  {invoice.clientName}
                </div>
                <div style={{ fontSize: 13, color: "#4B5563", marginTop: 2 }}>
                  {invoice.clientEmail}
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                  Client Account ID: <code>{invoice.clientId.slice(0, 16)}...</code>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#6B7280", letterSpacing: "0.06em" }}>
                  Commercial Engagement
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#101322", marginTop: 6 }}>
                  Project: {invoice.projectName}
                </div>
                <div style={{ fontSize: 12, color: "#4B5563", marginTop: 2 }}>
                  Payment Method: <strong>Enterprise Wire / ACH Settled</strong>
                </div>
                <div style={{ fontSize: 12, color: "#4B5563", marginTop: 2 }}>
                  Settlement Date: <strong>{formattedPaidDate}</strong>
                </div>
                {invoice.sentAt && (
                  <div style={{ fontSize: 11, color: "#059669", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <ShieldCheck size={12} /> Dispatched to client ({new Date(invoice.sentAt).toLocaleDateString()})
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", color: "#6B7280", letterSpacing: "0.05em", marginBottom: 10 }}>
                Deliverables & Milestone Itemization
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F4F3EE", borderBottom: "1.5px solid #101322" }}>
                    <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Item Description</th>
                    <th style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, fontSize: 11, textTransform: "uppercase", width: 60 }}>Qty</th>
                    <th style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, fontSize: 11, textTransform: "uppercase", width: 120 }}>Unit Price</th>
                    <th style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, fontSize: 11, textTransform: "uppercase", width: 130 }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #ECEAE4" }}>
                      <td style={{ padding: "14px" }}>
                        <div style={{ fontWeight: 700, color: "#101322" }}>{item.description}</div>
                        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                          Milestone Scope &middot; Fixed-Price Agreement
                        </div>
                      </td>
                      <td style={{ padding: "14px", textAlign: "center", color: "#4B5563" }}>
                        {item.quantity || 1}
                      </td>
                      <td style={{ padding: "14px", textAlign: "right", color: "#4B5563" }}>
                        ${Number(item.unitPrice || item.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "14px", textAlign: "right", fontWeight: 800, color: "#101322" }}>
                        ${Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 28 }}>
              <div style={{ width: 320, display: "grid", gap: 8, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#6B7280" }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>{formattedAmount} USD</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#6B7280" }}>
                  <span>Tax / VAT (0% Export B2B Services):</span>
                  <span>$0.00 USD</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 10,
                    marginTop: 4,
                    borderTop: "2px solid #101322",
                    fontSize: 16,
                    fontWeight: 900,
                    color: "#101322",
                  }}
                >
                  <span>Total Settled:</span>
                  <span>{formattedAmount} USD</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#059669",
                    fontWeight: 800,
                    fontSize: 13,
                    paddingTop: 4,
                  }}
                >
                  <span>Balance Due:</span>
                  <span>$0.00 USD</span>
                </div>
              </div>
            </div>

            {/* Notes & Legal Compliance */}
            <div
              style={{
                marginTop: 40,
                paddingTop: 20,
                borderTop: "1px solid #ECEAE4",
                fontSize: 11,
                color: "#6B7280",
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontWeight: 700, color: "#101322", marginBottom: 4 }}>
                Commercial Terms &amp; Settlement Guarantee:
              </div>
              <div>
                All contracts, invoices, and payments are administered on behalf of <strong>All Sky Fares LLC</strong>.
                Payments received for completed milestone deliverables represent compensation for approved, completed engineering
                hours and deliverables. Upon settlement, all source code, design assets, and architectural rights are transferred to the client.
              </div>
              <div style={{ marginTop: 8, fontStyle: "italic" }}>
                Invoice Hash: <code>{invoice.id}</code> &middot; Authorized by Nova Finance Administration
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nested Dispatch Modal */}
      {sendModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSendModalOpen(false);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              background: "#FFFFFF",
              color: "#101322",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={18} color="#2563EB" /> Send Invoice to Client
              </div>
              <button
                type="button"
                onClick={() => setSendModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendInvoice} style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>
                  Recipient Client Email *
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #D1D5DB",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>
                  Commercial Message Note (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Please find your settled milestone statement attached for Sprint 1 deliverables..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #D1D5DB",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setSendModalOpen(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: "1px solid #D1D5DB",
                    background: "transparent",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 10,
                    border: "none",
                    background: "#101322",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>{isSending ? "Dispatching..." : "Send Invoice Email"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print-only CSS rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .invoice-printable-sheet,
          .invoice-printable-sheet * {
            visibility: visible !important;
          }
          .invoice-printable-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 24px !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
