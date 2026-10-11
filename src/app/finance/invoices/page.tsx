import { requireFinance } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { Receipt, DollarSign, Download, CheckCircle2, Clock } from "lucide-react";

export default async function InvoicesPage() {
  await requireFinance();

  const projects = await prisma.project.findMany({
    include: {
      client: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="shell" style={{ padding: "40px 0 80px" }}>
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow" style={{ color: "#d97706", display: "flex", alignItems: "center", gap: 6 }}>
          <Receipt size={14} /> Client Invoicing
        </div>
        <h1 style={{ fontSize: 28, letterSpacing: "-.04em", margin: "6px 0", color: "var(--ink)" }}>
          Invoices & Billing History
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
          Manage client invoices, billing retainers, milestone payments, and receipts.
        </p>
      </div>

      <div className="card" style={{ padding: 28 }}>
        {projects.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)" }}>
            <Receipt size={32} style={{ color: "var(--muted)", margin: "0 auto 10px" }} />
            <p style={{ margin: 0, fontWeight: 600, color: "var(--ink)" }}>No active invoices found.</p>
            <p style={{ fontSize: 12, margin: "4px 0 0" }}>Invoices are generated upon project commissioning.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {projects.map((proj, idx) => (
              <div
                key={proj.id}
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 14,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>
                    Invoice #INV-2026-00{idx + 1} — {proj.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    Billed to: <strong>{proj.client.name}</strong> ({proj.client.email})
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>
                    $12,500.00 USD
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(16,185,129,0.1)", color: "#059669" }}>
                    PAID / SETTLED
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
