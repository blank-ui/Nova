"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Receipt,
  Search,
  Download,
  Send,
  Printer,
  Plus,
  CheckCircle2,
  ArrowUpRight,
  Filter,
  DollarSign,
  Calendar,
  Sparkles,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Badge, EmptyState, SectionCard } from "@/components/admin-ui";
import { InvoiceModal, type InvoiceData } from "./invoice-modal";
import { useToast } from "@/components/toast";
import { useCurrency } from "@/components/currency-provider";

export interface FinanceInvoicesManagerProps {
  initialInvoices: InvoiceData[];
  availableProjects: Array<{ id: string; name: string; clientName: string; clientEmail: string }>;
}

export function FinanceInvoicesManager({
  initialInvoices,
  availableProjects,
}: FinanceInvoicesManagerProps) {
  const toast = useToast();
  const { formatMoney, currency: currentSelectedCurrency } = useCurrency();
  const [invoices, setInvoices] = useState<InvoiceData[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "SENT">("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Keyboard shortcut: Escape closes create modal
  useEffect(() => {
    if (!isCreateModalOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsCreateModalOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCreateModalOpen]);

  // New Invoice Form State
  const [createProjectId, setCreateProjectId] = useState(availableProjects[0]?.id || "");
  const [createAmount, setCreateAmount] = useState(12500);
  const [createNotes, setCreateNotes] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.projectName.toLowerCase().includes(q) ||
      inv.clientName.toLowerCase().includes(q) ||
      inv.clientEmail.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === "SENT") {
      return Boolean(inv.sentAt);
    }
    if (statusFilter === "PAID") {
      return inv.status === "PAID" || inv.status === "SENT";
    }

    return true;
  });

  const handleOpenInvoice = (inv: InvoiceData) => {
    setSelectedInvoice(inv);
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceSent = (updatedInv: InvoiceData) => {
    setInvoices((prev) =>
      prev.map((item) => (item.id === updatedInv.id ? { ...item, ...updatedInv } : item))
    );
    if (selectedInvoice && selectedInvoice.id === updatedInv.id) {
      setSelectedInvoice((prev) => (prev ? { ...prev, ...updatedInv } : null));
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createProjectId) {
      toast.error("Please select a project.");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/finance/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          projectId: createProjectId,
          amount: Number(createAmount),
          notes: createNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create invoice.");
      }

      toast.success(data.message || "Invoice generated successfully!");
      setIsCreateModalOpen(false);

      // Refresh invoices from API
      const refreshRes = await fetch("/api/finance/invoices");
      const refreshData = await refreshRes.json();
      if (refreshData.ok && refreshData.invoices) {
        setInvoices(
          refreshData.invoices.map((inv: any) => ({
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
            issuedAt: inv.issuedAt,
            paidAt: inv.paidAt,
            sentAt: inv.sentAt,
            sentToEmail: inv.sentToEmail,
            items: inv.items,
            notes: inv.notes,
          }))
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSeedSample = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/finance/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed-sample" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to seed sample project.");
      toast.success(data.message || "Sample project and invoice created!");

      // Refresh
      const refreshRes = await fetch("/api/finance/invoices");
      const refreshData = await refreshRes.json();
      if (refreshData.ok && refreshData.invoices) {
        setInvoices(
          refreshData.invoices.map((inv: any) => ({
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
            issuedAt: inv.issuedAt,
            paidAt: inv.paidAt,
            sentAt: inv.sentAt,
            sentToEmail: inv.sentToEmail,
            items: inv.items,
            notes: inv.notes,
          }))
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize sample data.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <>
      {/* Search, Filter & Quick Action Strip */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        {/* Search Input */}
        <div style={{ position: "relative", minWidth: 260, flex: 1, maxWidth: 380 }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted-crm)",
            }}
          />
          <input
            type="search"
            placeholder="Search invoice #, project, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--border-hairline)",
              background: "var(--surface-raised)",
              color: "var(--text-primary)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        {/* Filter Pills & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              borderRadius: "var(--radius-pill)",
              background: "var(--surface-raised)",
              padding: 3,
              border: "1px solid var(--border-hairline)",
            }}
          >
            {(["ALL", "PAID", "SENT"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: 12,
                  fontWeight: statusFilter === filter ? 700 : 500,
                  background: statusFilter === filter ? "var(--ink-crm)" : "transparent",
                  color: statusFilter === filter ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {filter === "ALL" ? "All Invoices" : filter === "PAID" ? "Settled" : "Dispatched"}
              </button>
            ))}
          </div>

          {availableProjects.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="button button-outline"
              style={{
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <Plus size={14} />
              <span>Issue Invoice</span>
            </button>
          )}

          {invoices.length === 0 && (
            <button
              type="button"
              onClick={handleSeedSample}
              disabled={isSeeding}
              className="button"
              style={{
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                background: "var(--ink-crm)",
                color: "#FFFFFF",
              }}
            >
              {isSeeding ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>{isSeeding ? "Initializing..." : "Seed Sample Paid Project"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Invoice Records Card */}
      <SectionCard
        title="Client Invoices & Settlement Records"
        headerRight={
          <Badge variant="success">
            {filteredInvoices.length} {filteredInvoices.length === 1 ? "Invoice" : "Invoices"} on file
          </Badge>
        }
      >
        {filteredInvoices.length === 0 ? (
          <EmptyState
            icon={<Receipt size={36} />}
            title="No billing statements match criteria"
            description="Invoices are sequentially generated upon project commissioning and milestone delivery settlement."
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                style={{
                  padding: "16px 20px",
                  borderRadius: "var(--radius-card)",
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-hairline-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16,
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                }}
              >
                {/* Left Side: Invoice # & Billed To */}
                <div style={{ minWidth: 240 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        fontWeight: 900,
                        fontSize: 15,
                        letterSpacing: "-0.02em",
                        color: "var(--text-primary)",
                      }}
                    >
                      {inv.invoiceNumber}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text-muted-crm)" }}>&middot;</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                      {inv.projectName}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: "var(--text-muted-crm)", marginTop: 4 }}>
                    Billed to: <strong>{inv.clientName}</strong> ({inv.clientEmail})
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted-crm)", marginTop: 2 }}>
                    Issued: {new Date(inv.issuedAt).toLocaleDateString()} &middot; Statement ID:{" "}
                    <code>{inv.id.slice(0, 8)}</code>
                  </div>
                </div>

                {/* Right Side: Amount, Badges & Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "var(--text-primary)" }}>
                      {currentSelectedCurrency !== "USD"
                        ? formatMoney(inv.amount)
                        : `$${Number(inv.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`}
                    </div>
                    {currentSelectedCurrency !== "USD" && (
                      <div style={{ fontSize: 10, color: "var(--text-muted-crm)" }}>
                        Base: ${Number(inv.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "#10B981", fontWeight: 700, marginTop: 2 }}>
                      PAID / SETTLED
                    </div>
                  </div>

                  {inv.sentAt ? (
                    <Badge variant="info">
                      Sent ({new Date(inv.sentAt).toLocaleDateString()})
                    </Badge>
                  ) : (
                    <Badge variant="warning">Ready to Send</Badge>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenInvoice(inv)}
                      className="button button-outline"
                      style={{
                        padding: "7px 13px",
                        fontSize: 12,
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        cursor: "pointer",
                      }}
                      title="View and download invoice"
                    >
                      <Download size={13} />
                      <span>View &amp; Download</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenInvoice(inv)}
                      className="button"
                      style={{
                        padding: "7px 13px",
                        fontSize: 12,
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        cursor: "pointer",
                        background: "var(--ink-crm)",
                        color: "#FFFFFF",
                      }}
                      title="Send invoice via email"
                    >
                      <Send size={13} />
                      <span>Send</span>
                    </button>

                    <Link
                      href={`/portal/projects/${inv.projectId}`}
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--brand-primary, #6366F1)",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "7px 10px",
                      }}
                      title="View project scope"
                    >
                      <span>Scope</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Invoice View & Download & Send Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={selectedInvoice}
        onInvoiceSent={handleInvoiceSent}
      />

      {/* Modal to Issue New Invoice for Existing Project */}
      {isCreateModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "var(--surface-primary, #FFFFFF)",
              color: "var(--text-primary, #101322)",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                <Receipt size={18} color="#10B981" /> Issue New Commercial Statement
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted-crm)" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>
                  Select Project *
                </label>
                <select
                  value={createProjectId}
                  onChange={(e) => setCreateProjectId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                  }}
                >
                  {availableProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>
                  Total Settlement Amount (USD) *
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  step={100}
                  value={createAmount}
                  onChange={(e) => setCreateAmount(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>
                  Invoice Scope Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Milestone delivery compensation for Sprint 1 & 2 architecture..."
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-raised)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="button button-outline"
                  style={{ padding: "8px 16px", fontSize: 13, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="button"
                  style={{
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: "var(--ink-crm)",
                    color: "#FFFFFF",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>{isCreating ? "Generating..." : "Generate Invoice"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
