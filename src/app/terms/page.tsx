import LegalPage from "@/components/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions governing the use of Nova and professional engagements with All Sky Fares LLC.",
};

export default function Terms() {
  return (
    <LegalPage
      kind="Terms of Service"
      title="Clear expectations make better work."
      subtitle="Terms and conditions governing the use of Nova and professional engagements with All Sky Fares LLC."
      sections={[
        {
          title: "1. Acceptance of Terms & Operating Entity",
          body: (
            <>
              <p>
                These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the Nova website, services, and client portal, operated by{" "}
                <strong>All Sky Fares LLC</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). By accessing our website, submitting an inquiry, or registering for an account on Nova, you agree to be bound by these Terms.
              </p>
              <p style={{ marginTop: 10 }}>
                If you are using Nova on behalf of an organization, company, or legal entity, you represent and warrant that you have the requisite authority to bind that entity to these Terms. If you do not agree with any provision of these Terms, you must immediately discontinue use of the platform.
              </p>
            </>
          ),
        },
        {
          title: "2. Services and Statements of Work (SOW)",
          body: (
            <>
              <p>
                Nova provides bespoke digital design, software engineering, branding, web development, and digital consulting services. The display of services, portfolio works, and sample pricing ranges on this website represents an invitation to treat and does not constitute a binding unilateral offer to contract.
              </p>
              <p style={{ marginTop: 10 }}>
                All professional engagements, deliverable milestones, project timelines, payment schedules, and technical specifications are formally established in a mutually executed Master Services Agreement (MSA), Statement of Work (SOW), or project proposal signed by authorized representatives of both parties. In the event of any conflict between these website Terms and an executed SOW, the terms of the executed SOW shall prevail.
              </p>
              <p style={{ marginTop: 10 }}>
                For specific rules regarding discovery deposits, milestone acceptance, pro-rata unused hours, and our 30-day warranty, please review our <a href="/refund-policy" style={{ color: "var(--blue)" }}>Refund &amp; Cancellation Policy</a>. For technical incident priorities and post-launch response times, please review our <a href="/support-policy" style={{ color: "var(--blue)" }}>Support Policy &amp; SLA</a>.
              </p>
            </>
          ),
        },
        {
          title: "3. Account Security and Client Portal Responsibilities",
          body: (
            <>
              <p>
                Clients granted access to the Nova client portal are responsible for safeguarding their login credentials and maintaining the confidentiality of their passwords and multi-factor authentication (TOTP) devices.
              </p>
              <ul style={{ margin: "10px 0 10px 20px", display: "grid", gap: 6 }}>
                <li>You agree to provide true, accurate, and current information when creating an account.</li>
                <li>You are solely responsible for all activities, messages, and approvals conducted under your authenticated credentials.</li>
                <li>You agree to notify us immediately at <code>nova@allskyfares.com</code> if you suspect any unauthorized access, breach of security, or compromised credentials.</li>
                <li>We reserve the right to suspend or revoke access to any account found violating security policies, attempting unauthorized access, or breaching these Terms.</li>
              </ul>
            </>
          ),
        },
        {
          title: "4. Client Obligations & Material Approvals",
          body: (
            <>
              <p>
                Successful project delivery relies on timely collaboration. Clients agree to:
              </p>
              <ul style={{ margin: "10px 0 10px 20px", display: "grid", gap: 6 }}>
                <li>Provide accurate source materials, copy, assets, credentials, and specifications required for project execution.</li>
                <li>Ensure that all materials, trademarks, software, and data supplied to Nova are lawfully owned or appropriately licensed, and do not infringe any third-party intellectual property rights.</li>
                <li>Provide prompt written feedback, sign-offs, and deliverable approvals according to the schedules established in the applicable SOW.</li>
              </ul>
            </>
          ),
        },
        {
          title: "5. Intellectual Property Rights",
          body: (
            <>
              <p>
                <strong>Client Deliverables:</strong> Upon receipt of full and final payment for the agreed milestones under the applicable SOW, intellectual property ownership of the final deliverables (including customized code, website designs, and assets created specifically for the client) will transfer to the client as specified in the client agreement.
              </p>
              <p style={{ marginTop: 10 }}>
                <strong>Nova & Background IP:</strong> All Sky Fares LLC and Nova retain all rights, title, and interest in pre-existing software, generic component libraries, starter kits, algorithms, tooling, and proprietary workflow infrastructure (&ldquo;Background IP&rdquo;) developed prior to or independently of the client engagement. Clients receive a perpetual, non-exclusive, royalty-free license to use Background IP embedded within their final deliverables.
              </p>
              <p style={{ marginTop: 10 }}>
                <strong>Platform IP:</strong> All rights, trademarks, brand assets, logos, and website code of Nova itself remain the exclusive property of All Sky Fares LLC.
              </p>
            </>
          ),
        },
        {
          title: "6. Prohibited Uses",
          body: (
            <>
              <p>You agree not to use the Nova website or client portal to:</p>
              <ul style={{ margin: "10px 0 10px 20px", display: "grid", gap: 6 }}>
                <li>Violate any local, national, or international statute, regulation, or data protection law.</li>
                <li>Transmit malicious code, viruses, automated bots, scrapers, or attempt denial-of-service attacks against our infrastructure.</li>
                <li>Bypass authentication mechanisms, probe or scan system vulnerabilities without written authorization.</li>
                <li>Transmit unlawful, defamatory, infringing, or harassing materials through project messaging.</li>
              </ul>
            </>
          ),
        },
        {
          title: "7. Disclaimer of Warranties & Limitation of Liability",
          body: (
            <>
              <p>
                The website, client portal, and informational content are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, whether express, implied, statutory, or otherwise.
              </p>
              <p style={{ marginTop: 10 }}>
                To the maximum extent permitted by applicable law, in no event shall All Sky Fares LLC, its directors, officers, employees, or contractors be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, revenue, or business opportunities, arising out of or related to your use of this platform.
              </p>
              <p style={{ marginTop: 10 }}>
                Any monetary liability in connection with bespoke design and engineering services shall be strictly limited to the total fees paid by the client under the specific Statement of Work giving rise to the claim during the six (6) months preceding the event.
              </p>
            </>
          ),
        },
        {
          title: "8. Governing Law and Dispute Resolution",
          body: (
            <>
              <p>
                These Terms and any non-contractual obligations arising out of or in connection with them shall be governed by and construed in accordance with the substantive laws applicable to All Sky Fares LLC, without regard to conflict of laws principles.
              </p>
              <p style={{ marginTop: 10 }}>
                In the event of any dispute, claim, or controversy arising from or relating to these Terms or the services, the parties agree to first seek resolution through good-faith executive negotiations. If unresolved, disputes shall be submitted to the competent courts of jurisdiction as stipulated in the executed client agreement.
              </p>
            </>
          ),
        },
        {
          title: "9. Contact Information",
          body: (
            <>
              <p>For questions regarding these Terms of Service or commercial agreements, please contact:</p>
              <div style={{ marginTop: 12, padding: "14px 18px", background: "var(--paper, #f7f8fb)", borderRadius: 10, border: "1px solid var(--line, #e2e5ec)" }}>
                <div><strong>Operating Entity:</strong> All Sky Fares LLC</div>
                <div style={{ marginTop: 4 }}><strong>Service Name:</strong> Nova</div>
                <div style={{ marginTop: 4 }}><strong>Legal Notices & Inquiries:</strong> <a href="mailto:nova@allskyfares.com" style={{ color: "var(--blue)" }}>nova@allskyfares.com</a></div>
              </div>
            </>
          ),
        },

      ]}
    />
  );
}
