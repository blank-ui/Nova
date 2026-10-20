"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  FileText,
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
  const [ccEmail, setCcEmail] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [zoom, setZoom] = useState(1);
  const [isFitWidth, setIsFitWidth] = useState(false);
  const [paperFormat, setPaperFormat] = useState<"A4" | "Letter">("A4");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sheetMaxWidth = paperFormat === "A4" ? 794 : 816;
  const sheetMinHeight = paperFormat === "A4" ? 1123 : 1056;

  function handleZoomIn() {
    setIsFitWidth(false);
    setZoom((prev) => Math.min(2.0, Math.round((prev + 0.15) * 100) / 100));
  }

  function handleZoomOut() {
    setIsFitWidth(false);
    setZoom((prev) => Math.max(0.5, Math.round((prev - 0.15) * 100) / 100));
  }

  function handleResetZoom() {
    setIsFitWidth(false);
    setZoom(1);
  }

  function handleToggleFitWidth() {
    if (isFitWidth) {
      setIsFitWidth(false);
      setZoom(1);
    } else {
      setIsFitWidth(true);
      if (typeof window !== "undefined") {
        const availableWidth = Math.max(340, window.innerWidth - 64);
        const computed = Math.min(1.5, Math.max(0.5, Math.round((availableWidth / sheetMaxWidth) * 100) / 100));
        setZoom(computed);
      }
    }
  }

  function handlePaperFormatChange(format: "A4" | "Letter") {
    setPaperFormat(format);
    if (isFitWidth && typeof window !== "undefined") {
      const availableWidth = Math.max(340, window.innerWidth - 64);
      const width = format === "A4" ? 794 : 816;
      setZoom(Math.min(1.5, Math.max(0.5, Math.round((availableWidth / width) * 100) / 100)));
    }
  }

  // Keyboard shortcut: Escape closes dispatch submodal or primary invoice modal
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (sendModalOpen) {
          setSendModalOpen(false);
        } else {
          onClose();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, sendModalOpen]);

  if (!isOpen || !invoice || !mounted) return null;

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
    @page { size: ${paperFormat === "A4" ? "A4 portrait" : "letter portrait"}; margin: 15mm; }
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
    const finalTo = recipientEmail.trim() || invoice.clientEmail?.trim();
    if (!finalTo) {
      toast.error("Please specify a valid recipient email.");
      return;
    }
    setIsSending(true);

    try {
      const res = await fetch("/api/finance/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          invoiceId: invoice.id,
          to: finalTo,
          cc: ccEmail.trim() || undefined,
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

  return createPortal(
    <>
      {/* Primary Invoice Modal Overlay / Total Space Canvas */}
      <div
        className="invoice-modal-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "var(--surface-primary, #FFFFFF)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          margin: 0,
          padding: 0,
        }}
      >
        <div
          className="invoice-modal-dialog"
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            background: "var(--surface-primary, #FFFFFF)",
            color: "var(--text-primary, #101322)",
            borderRadius: 0,
            boxShadow: "none",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Top Floating Control Bar (Full-width, zero-leak, compact) */}
          <div
            className="invoice-control-bar no-print"
            style={{
              padding: "10px 18px",
              background: "var(--surface-raised, #F6F4EE)",
              borderBottom: "1px solid var(--border-hairline, rgba(0,0,0,0.08))",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
              width: "100%",
              boxSizing: "border-box",
              overflowX: "auto",
              scrollbarWidth: "none",
            }}
          >
            {/* Left: Navigation and Invoice Info */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <button
                type="button"
                onClick={onClose}
                className="button button-outline"
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  borderRadius: 8,
                }}
                title="Back to Invoices (Esc)"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <div style={{ height: 20, width: 1, background: "var(--border-hairline, rgba(0,0,0,0.12))" }} />

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: "var(--ink-crm, #101322)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Receipt size={14} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>Invoice {invoice.invoiceNumber}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted-crm, #6B7280)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{invoice.projectName}</span>
                    &middot;
                    <strong style={{ color: "#059669" }}>{invoice.status}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Zoom and Paper Format Controls */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "nowrap",
                flexShrink: 0,
              }}
            >
              {/* Zoom Pill */}
              <div
                className="invoice-zoom-toolbar"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                  background: "var(--card-bg-crm, #FFFFFF)",
                  border: "1px solid var(--border-hairline, rgba(0,0,0,0.12))",
                  borderRadius: 8,
                  padding: "2px 5px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  title="Zoom Out (-15%)"
                  style={{
                    padding: "4px 7px",
                    borderRadius: 5,
                    border: "none",
                    background: "transparent",
                    color: zoom <= 0.5 ? "var(--text-muted-crm, #9CA3AF)" : "var(--text-primary, #101322)",
                    cursor: zoom <= 0.5 ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ZoomOut size={13} />
                </button>

                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Reset to 100%"
                  style={{
                    padding: "3px 6px",
                    borderRadius: 5,
                    border: "none",
                    background: zoom === 1 && !isFitWidth ? "rgba(0,0,0,0.06)" : "transparent",
                    fontSize: 11,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--text-primary, #101322)",
                    cursor: "pointer",
                    minWidth: 40,
                    textAlign: "center",
                  }}
                >
                  {Math.round(zoom * 100)}%
                </button>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoom >= 2.0}
                  title="Zoom In (+15%)"
                  style={{
                    padding: "4px 7px",
                    borderRadius: 5,
                    border: "none",
                    background: "transparent",
                    color: zoom >= 2.0 ? "var(--text-muted-crm, #9CA3AF)" : "var(--text-primary, #101322)",
                    cursor: zoom >= 2.0 ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ZoomIn size={13} />
                </button>

                <div style={{ height: 14, width: 1, background: "var(--border-hairline, rgba(0,0,0,0.1))", margin: "0 3px" }} />

                <button
                  type="button"
                  onClick={handleToggleFitWidth}
                  title={isFitWidth ? "Return to 100%" : "Fit document to window width"}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 5,
                    border: "none",
                    background: isFitWidth ? "var(--ink-crm, #101322)" : "transparent",
                    color: isFitWidth ? "#FFFFFF" : "var(--text-muted-crm, #4B5563)",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Maximize2 size={11} />
                  <span>Fit</span>
                </button>
              </div>

              {/* Paper Format Selector: A4 vs Letter */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "var(--card-bg-crm, #FFFFFF)",
                  border: "1px solid var(--border-hairline, rgba(0,0,0,0.12))",
                  borderRadius: 8,
                  padding: 2,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                <button
                  type="button"
                  onClick={() => handlePaperFormatChange("A4")}
                  title="ISO A4 Standard (210mm × 297mm)"
                  style={{
                    padding: "3px 8px",
                    borderRadius: 6,
                    border: "none",
                    background: paperFormat === "A4" ? "var(--ink-crm, #101322)" : "transparent",
                    color: paperFormat === "A4" ? "#FFFFFF" : "var(--text-muted-crm, #6B7280)",
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <FileText size={11} />
                  <span>A4</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePaperFormatChange("Letter")}
                  title="US Letter (8.5in × 11in)"
                  style={{
                    padding: "3px 8px",
                    borderRadius: 6,
                    border: "none",
                    background: paperFormat === "Letter" ? "var(--ink-crm, #101322)" : "transparent",
                    color: paperFormat === "Letter" ? "#FFFFFF" : "var(--text-muted-crm, #6B7280)",
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  <span>Letter</span>
                </button>
              </div>
            </div>

            {/* Right: Actions (Cleanly sized, non-overflowing) */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
              <button
                type="button"
                onClick={handlePrint}
                className="button button-outline"
                style={{
                  padding: "6px 11px",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  cursor: "pointer",
                  borderRadius: 8,
                }}
                title="Print or Save as PDF"
              >
                <Printer size={13} />
                <span>Print / PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadHtml}
                className="button button-outline"
                style={{
                  padding: "6px 11px",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  cursor: "pointer",
                  borderRadius: 8,
                }}
                title="Download HTML Document"
              >
                <Download size={13} />
                <span>HTML</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRecipientEmail(invoice.clientEmail || "");
                  setCcEmail("");
                  setCustomNote("");
                  setSendModalOpen(true);
                }}
                className="button"
                style={{
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  cursor: "pointer",
                  background: "var(--ink-crm, #101322)",
                  color: "#FFFFFF",
                  borderRadius: 8,
                }}
              >
                <Send size={13} />
                <span>Send</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close invoice"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.05)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-muted-crm, #6B7280)",
                  marginLeft: 2,
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Document Workspace Canvas */}
          <div
            className="invoice-canvas-scroll-container"
            style={{
              flex: 1,
              overflow: "auto",
              background: "#ECE9E2",
              padding: "28px 16px 80px",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              boxSizing: "border-box",
              width: "100%",
            }}
          >
            <div
              className="invoice-zoom-wrapper"
              style={{
                width: "100%",
                maxWidth: sheetMaxWidth,
                zoom: zoom,
                transformOrigin: "top center",
                transition: "zoom 0.15s ease-out, transform 0.15s ease-out",
                boxSizing: "border-box",
                margin: "0 auto",
              }}
            >
              <div
                className="invoice-printable-sheet"
                style={{
                  background: "#FFFFFF",
                  color: "#101322",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  borderRadius: 10,
                  boxShadow: "0 14px 40px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.03)",
                  border: "1px solid #DCD7CD",
                  padding: "44px 48px",
                  boxSizing: "border-box",
                  width: "100%",
                  minHeight: sheetMinHeight,
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
    </div>
  </div>

      {/* Nested Dispatch Modal */}
      {sendModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 12, 19, 0.72)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(16px, 4vw, 24px)",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSendModalOpen(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 520,
              margin: "auto",
              background: "var(--card-bg-crm, var(--surface-raised, #FFFFFF))",
              color: "var(--text-primary, #101322)",
              borderRadius: 24,
              padding: "clamp(20px, 4vw, 28px)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
              border: "1px solid var(--border-hairline, rgba(0, 0, 0, 0.12))",
              animation: "fadeInUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: "rgba(37, 99, 235, 0.1)",
                    color: "#2563EB",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Mail size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary, #101322)", letterSpacing: "-0.02em" }}>
                    Send Invoice by Email
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted-crm, #6B7280)", marginTop: 2 }}>
                    Official settlement statement for <strong>{invoice.invoiceNumber}</strong> &middot; {formattedAmount}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSendModalOpen(false)}
                aria-label="Close"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted-crm, #6B7280)",
                  padding: 6,
                  borderRadius: 8,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Context Card */}
            <div
              style={{
                background: "var(--surface-raised, #F9FAFB)",
                border: "1px solid var(--border-hairline, #E5E7EB)",
                borderRadius: 14,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 12,
              }}
            >
              <div>
                <span style={{ color: "var(--text-muted-crm, #6B7280)" }}>Project: </span>
                <strong style={{ color: "var(--text-primary, #101322)" }}>{invoice.projectName}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--text-muted-crm, #6B7280)" }}>Total: </span>
                <span
                  style={{
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#059669",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 99,
                    fontSize: 12,
                  }}
                >
                  {formattedAmount}
                </span>
              </div>
            </div>

            <form onSubmit={handleSendInvoice} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Pre-registered Emails Selector */}
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 6,
                    color: "var(--text-primary, #101322)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Pre-Registered Contact Emails (Click to select)
                </label>
                <div style={{ display: "grid", gap: 8 }}>
                  {invoice.clientEmail && (
                    <button
                      type="button"
                      onClick={() => setRecipientEmail(invoice.clientEmail)}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: 12,
                        cursor: "pointer",
                        border:
                          recipientEmail.toLowerCase() === invoice.clientEmail.toLowerCase()
                            ? "2px solid #2563EB"
                            : "1px solid var(--border-hairline, #E5E7EB)",
                        background:
                          recipientEmail.toLowerCase() === invoice.clientEmail.toLowerCase()
                            ? "rgba(37, 99, 235, 0.06)"
                            : "var(--surface-raised, #F9FAFB)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border:
                              recipientEmail.toLowerCase() === invoice.clientEmail.toLowerCase()
                                ? "5px solid #2563EB"
                                : "2px solid #9CA3AF",
                            background: "#FFFFFF",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary, #101322)" }}>
                            {invoice.clientEmail}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted-crm, #6B7280)", marginTop: 1 }}>
                            {invoice.clientName} &middot; Primary Client Account
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          background: "#2563EB",
                          color: "#FFFFFF",
                          padding: "2px 7px",
                          borderRadius: 99,
                          flexShrink: 0,
                        }}
                      >
                        Registered
                      </span>
                    </button>
                  )}

                  {invoice.sentToEmail &&
                    invoice.sentToEmail.toLowerCase() !== invoice.clientEmail?.toLowerCase() && (
                      <button
                        type="button"
                        onClick={() => setRecipientEmail(invoice.sentToEmail!)}
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          borderRadius: 12,
                          cursor: "pointer",
                          border:
                            recipientEmail.toLowerCase() === invoice.sentToEmail.toLowerCase()
                              ? "2px solid #2563EB"
                              : "1px solid var(--border-hairline, #E5E7EB)",
                          background:
                            recipientEmail.toLowerCase() === invoice.sentToEmail.toLowerCase()
                              ? "rgba(37, 99, 235, 0.06)"
                              : "var(--surface-raised, #F9FAFB)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              border:
                                recipientEmail.toLowerCase() === invoice.sentToEmail.toLowerCase()
                                ? "5px solid #2563EB"
                                : "2px solid #9CA3AF",
                              background: "#FFFFFF",
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary, #101322)" }}>
                              {invoice.sentToEmail}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-muted-crm, #6B7280)", marginTop: 1 }}>
                              Previous Invoice Recipient
                            </div>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            background: "#6B7280",
                            color: "#FFFFFF",
                            padding: "2px 7px",
                            borderRadius: 99,
                            flexShrink: 0,
                          }}
                        >
                          Last Sent
                        </span>
                      </button>
                    )}
                </div>
              </div>

              {/* To Email Input */}
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 5,
                    color: "var(--text-primary, #101322)",
                  }}
                >
                  Send To Email *
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="client@company.com"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline, #D1D5DB)",
                    background: "var(--surface-raised, #F9FAFB)",
                    color: "var(--text-primary, #101322)",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* CC Input & Quick Chips */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-primary, #101322)",
                    }}
                  >
                    CC Email(s) (Optional)
                  </label>
                  <span style={{ fontSize: 11, color: "var(--text-muted-crm, #6B7280)" }}>
                    Separate multiple with commas
                  </span>
                </div>
                <input
                  type="text"
                  value={ccEmail}
                  onChange={(e) => setCcEmail(e.target.value)}
                  placeholder="e.g. billing@allskyfares.com, accountant@client.com"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline, #D1D5DB)",
                    background: "var(--surface-raised, #F9FAFB)",
                    color: "var(--text-primary, #101322)",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {/* CC Quick Chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {["billing@allskyfares.com", "contact@allskyfares.com"].map((emailChip) => (
                    <button
                      key={emailChip}
                      type="button"
                      onClick={() => {
                        const trimmed = ccEmail.trim();
                        if (!trimmed) {
                          setCcEmail(emailChip);
                        } else if (!trimmed.toLowerCase().includes(emailChip.toLowerCase())) {
                          setCcEmail(`${trimmed}, ${emailChip}`);
                        }
                      }}
                      style={{
                        padding: "3px 9px",
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 600,
                        border: "1px solid var(--border-hairline, #E5E7EB)",
                        background: "var(--surface-raised, #F3F4F6)",
                        color: "var(--text-muted-crm, #4B5563)",
                        cursor: "pointer",
                      }}
                    >
                      + {emailChip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commercial Cover Note */}
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 5,
                    color: "var(--text-primary, #101322)",
                  }}
                >
                  Commercial Cover Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please find attached the settled milestone billing statement for your recent project sprint..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline, #D1D5DB)",
                    background: "var(--surface-raised, #F9FAFB)",
                    color: "var(--text-primary, #101322)",
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Footer Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 6,
                  paddingTop: 12,
                  borderTop: "1px solid var(--border-hairline, rgba(0,0,0,0.08))",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSendModalOpen(false)}
                  disabled={isSending}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 12,
                    border: "1px solid var(--border-hairline, #D1D5DB)",
                    background: "transparent",
                    color: "var(--text-primary, #101322)",
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
                    padding: "10px 22px",
                    borderRadius: 12,
                    border: "none",
                    background: "#2563EB",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                  }}
                >
                  {isSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  <span>{isSending ? "Dispatching..." : "Send Invoice Email"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print-only CSS rules with configurable paper format */}
      <style>{`
        @media print {
          @page {
            size: ${paperFormat === "A4" ? "A4 portrait" : "letter portrait"};
            margin: 12mm;
          }
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
            max-width: 100% !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            zoom: 1 !important;
            transform: none !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>,
    document.body
  );
}
