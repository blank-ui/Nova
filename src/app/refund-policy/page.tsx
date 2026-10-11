import LegalPage from "@/components/legal-page";

export default function Refund() {
  return (
    <LegalPage
      kind="Refund & Cancellation Policy"
      title="Fair terms, agreed up front."
      subtitle="Clear, predictable terms governing digital consulting, milestones, and cancellations with All Sky Fares LLC."
      sections={[
        {
          title: "1. Scope and Distinction from Travel Services",
          body: (
            <>
              <p>
                Nova is a digital product, software design, and engineering studio operated on behalf of{" "}
                <strong>All Sky Fares LLC</strong>.
              </p>
              <p style={{ marginTop: 10 }}>
                <strong>Important Distinction:</strong> While All Sky Fares LLC operates travel consultancy and flight ticketing services at allskyfares.com (which are subject to airline fare tariffs and sliding-scale travel cancellation rules), the policies stated below apply exclusively to custom design, software engineering, and digital development services provided by Nova.
              </p>
            </>
          ),
        },
        {
          title: "2. Custom Software & Professional Services Framework",
          body: (
            <>
              <p>
                Professional digital engineering and custom software development involve dedicated studio time, architectural research, custom coding, and intellectual property creation.
              </p>
              <ul style={{ margin: "10px 0 10px 20px", display: "grid", gap: 6 }}>
                <li>
                  <strong>Project Retainers & Initial Deposits:</strong> Initial deposits and discovery phase fees compensate the studio for upfront research, sprint scheduling, and architectural planning. Unless expressly specified otherwise in an executed Statement of Work (SOW), initial deposits are non-refundable once discovery or development work has commenced.
                </li>
                <li>
                  <strong>Milestone-Based Deliverables:</strong> Projects are structured into discrete phases or milestones. Invoices paid upon milestone sign-off and client acceptance represent compensation for approved, completed deliverables and are non-refundable.
                </li>
                <li>
                  <strong>Unbilled Retainers & Prepaid Hours:</strong> In the event a monthly support retainer is terminated in accordance with its contractual notice terms, any unallocated, unspent prepaid hours will be refunded pro-rata to the client or credited to future tasks as mutually agreed.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "3. Project Cancellation & Offboarding Procedures",
          body: (
            <>
              <p>
                Either party may terminate an ongoing project engagement pursuant to the termination provisions set out in the applicable client agreement:
              </p>
              <ul style={{ margin: "10px 0 10px 20px", display: "grid", gap: 6 }}>
                <li>
                  <strong>Written Notice:</strong> Cancellation requests must be submitted in writing to <code>nova@allskyfares.com</code>.
                </li>
                <li>
                  <strong>Payment for Work Performed:</strong> In the event of early termination by the client, the client shall be invoiced for all professional hours expended and work completed up to the effective date of termination.
                </li>
                <li>
                  <strong>Delivery of Work-in-Progress:</strong> Upon settlement of all outstanding invoices for completed hours, Nova will package and deliver all source code, assets, design files, and documentation created up to that date.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "4. Satisfaction and Defect Resolution (Warranty)",
          body: (
            <p>
              We stand behind the quality of our craftsmanship. For custom web applications and websites, Nova provides a standard thirty (30) day warranty period following final deployment (as detailed in your SOW) during which verified functional bugs and discrepancies from agreed specifications are remediated at no additional charge.
            </p>
          ),
        },
        {
          title: "5. Billing Inquiries & Dispute Escalation",
          body: (
            <>
              <p>If you have any questions regarding an invoice or wish to discuss an adjustment, please contact our billing administration:</p>
              <div style={{ marginTop: 12, padding: "14px 18px", background: "var(--paper, #f7f8fb)", borderRadius: 10, border: "1px solid var(--line, #e2e5ec)" }}>
                <div><strong>Operating Entity:</strong> All Sky Fares LLC</div>
                <div style={{ marginTop: 4 }}><strong>Service:</strong> Nova Billing & Finance</div>
                <div style={{ marginTop: 4 }}><strong>Email:</strong> <a href="mailto:nova@allskyfares.com" style={{ color: "var(--blue)" }}>nova@allskyfares.com</a></div>
              </div>

            </>
          ),
        },
      ]}
    />
  );
}
