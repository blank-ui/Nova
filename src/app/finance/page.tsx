import { requireFinance } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  DollarSign,
  Receipt,
  Building,
} from "lucide-react";

export default async function FinanceWorkspace() {
  const session = await requireFinance();
  const firstName = session.user.name ? session.user.name.trim().split(/\s+/)[0] : "Finance";

  // Fetch inquiries with budgets and projects
  const [inquiries, projects, clients] = await Promise.all([
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
  ]);

  return (
    <main className="shell" style={{ padding: "40px 0 80px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <div className="eyebrow" style={{ color: "#d97706", display: "flex", alignItems: "center", gap: 6 }}>
            <DollarSign size={14} /> Finance & Revenue Operations
          </div>
          <h1 style={{ fontSize: 32, letterSpacing: "-.05em", margin: "8px 0 6px", color: "var(--ink)" }}>
            Welcome back, {firstName}.
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, maxWidth: 540 }}>
            Financial control room: qualified project budgets, active client agreements, revenue pipelines, and billing under <strong>All Sky Fares LLC</strong>.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/finance/invoices"
            className="button"
            style={{ padding: "10px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
          >
            <Receipt size={14} /> Billing Records
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 36,
        }}
      >
        <div className="card" style={{ padding: "20px 22px", borderTop: "3px solid #f59e0b" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>
            Active Client Accounts
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "var(--ink)", margin: "8px 0 4px", letterSpacing: "-.05em" }}>
            {clients.length}
          </div>
          <div style={{ fontSize: 12, color: "#d97706", fontWeight: 600 }}>Billing entities on file</div>
        </div>

        <div className="card" style={{ padding: "20px 22px", borderTop: "3px solid #10b981" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>
            Commissioned Projects
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "var(--ink)", margin: "8px 0 4px", letterSpacing: "-.05em" }}>
            {projects.length}
          </div>
          <div style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>Contracts in execution</div>
        </div>

        <div className="card" style={{ padding: "20px 22px", borderTop: "3px solid #6C4CFF" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>
            Pipeline Inquiries
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "var(--ink)", margin: "8px 0 4px", letterSpacing: "-.05em" }}>
            {inquiries.length}
          </div>
          <div style={{ fontSize: 12, color: "#6C4CFF", fontWeight: 600 }}>With declared budget ranges</div>
        </div>
      </div>

      {/* Financial Pipeline Table */}
      <div className="card" style={{ padding: 28, marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, letterSpacing: "-.03em", margin: "0 0 16px", color: "var(--ink)" }}>
          Project Scope & Budget Valuations
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em" }}>
                <th style={{ padding: "12px 14px" }}>Client / Lead</th>
                <th style={{ padding: "12px 14px" }}>Declared Budget</th>
                <th style={{ padding: "12px 14px" }}>Service Category</th>
                <th style={{ padding: "12px 14px" }}>Pipeline Status</th>
                <th style={{ padding: "12px 14px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "30px 14px", textAlign: "center", color: "var(--muted)" }}>
                    No qualified budget inquiries yet.
                  </td>
                </tr>
              ) : (
                inquiries.map((inq) => (
                  <tr key={inq.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "14px" }}>
                      <div style={{ fontWeight: 700, color: "var(--ink)" }}>{inq.name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{inq.company || inq.email}</div>
                    </td>
                    <td style={{ padding: "14px", fontWeight: 700, color: "#059669" }}>
                      {inq.budget || "$5,000 – $15,000"}
                    </td>
                    <td style={{ padding: "14px", color: "var(--muted)" }}>
                      {inq.service}
                    </td>
                    <td style={{ padding: "14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "rgba(245,158,11,0.1)", color: "#d97706" }}>
                        {inq.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px", color: "var(--muted)", fontSize: 12 }}>
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Entity Banner */}
      <div
        className="card"
        style={{
          padding: "20px 24px",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Building size={24} style={{ color: "var(--muted)" }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
              All Sky Fares LLC — Treasury & Merchant Details
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Official registered operator for Nova. All invoices, wire instructions, and tax filings are recorded under All Sky Fares LLC.
            </div>
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
          Contact: nova@allskyfares.com
        </span>
      </div>
    </main>
  );
}
