import LegalPage from "@/components/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Policy & SLA",
  description: "Clear guidelines for maintenance, technical assistance, and post-launch stability with All Sky Fares LLC.",
};

export default function Support() {
  return (
    <LegalPage
      kind="Support Policy"
      title="Support that fits the agreement."
      subtitle="Clear guidelines for maintenance, technical assistance, and post-launch stability with All Sky Fares LLC."
      sections={[
        {
          title: "1. Scope and Support Tiers",
          body: (
            <>
              <p>
                Nova provides post-launch maintenance, security patch updates, and ongoing technical support for digital products developed on behalf of{" "}
                <strong>All Sky Fares LLC</strong>.
              </p>
              <p style={{ marginTop: 10 }}>
                Support services are categorized into distinct operational tiers agreed within client contracts:
              </p>
              <ul style={{ margin: "10px 0 10px 20px", display: "grid", gap: 6 }}>
                <li>
                  <strong>Warranty Support:</strong> Standard bug fixes and defect remediation during the initial post-deployment warranty period.
                </li>
                <li>
                  <strong>Retained Ongoing Maintenance:</strong> Scheduled security updates, dependency patching, uptime monitoring, and proactive maintenance retainers.
                </li>
                <li>
                  <strong>Ad-Hoc Technical Assistance:</strong> Time-and-materials enhancements and feature expansions outside retainer agreements.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "2. Incident Priority & Target Response Times",
          body: (
            <>
              <p>For active support retainer clients, issues are classified by severity:</p>
              <ul style={{ margin: "10px 0 10px 20px", display: "grid", gap: 6 }}>
                <li>
                  <strong>Critical (Severity 1):</strong> Complete platform outage or severe security vulnerability affecting all users. Target initial response within 2 to 4 business hours.
                </li>
                <li>
                  <strong>Major (Severity 2):</strong> Significant feature degradation or business impediment with an available workaround. Target initial response within 1 business day.
                </li>
                <li>
                  <strong>Standard / Minor (Severity 3):</strong> Minor cosmetic bugs, general inquiries, or non-blocking modifications. Target response within 2 business days.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "3. How to Report a Technical Issue",
          body: (
            <>
              <p>Clients should report issues through the authorized project portal or official channels:</p>
              <ul style={{ margin: "10px 0 10px 20px", display: "grid", gap: 6 }}>
                <li>
                  <strong>Client Portal:</strong> Send a message directly within the affected project thread at <code>/portal</code>.
                </li>
                <li>
                  <strong>Studio Support Email:</strong> Contact <code>nova@allskyfares.com</code> with steps to reproduce and system screenshots.
                </li>
                <li>
                  <strong>Security Best Practice:</strong> Please never submit passwords, MFA tokens, or unencrypted customer records within support tickets.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "4. Contact Channels",
          body: (
            <div style={{ marginTop: 12, padding: "14px 18px", background: "var(--paper, #f7f8fb)", borderRadius: 10, border: "1px solid var(--line, #e2e5ec)" }}>
              <div><strong>Operating Entity:</strong> All Sky Fares LLC</div>
              <div style={{ marginTop: 4 }}><strong>Support Email:</strong> <a href="mailto:nova@allskyfares.com" style={{ color: "var(--blue)" }}>nova@allskyfares.com</a></div>
            </div>
          ),
        },

      ]}
    />
  );
}
