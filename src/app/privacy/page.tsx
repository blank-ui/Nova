import LegalPage from "@/components/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How All Sky Fares LLC collects, uses, protects, and respects your personal data across Nova.",
};

export default function Privacy() {
  return (
    <LegalPage
      kind="Privacy Policy"
      title="Privacy, handled with care."
      subtitle="How All Sky Fares LLC collects, uses, protects, and respects your personal data across Nova."
      sections={[
        {
          title: "1. Operating Entity and Scope",
          body: (
            <>
              <p>
                Nova is a digital product and design studio service operated on behalf of{" "}
                <strong>All Sky Fares LLC</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). This Privacy Policy explains our practices regarding the collection, use, disclosure, and protection of personal data when you visit our website, submit project inquiries, or interact with our client portal.
              </p>
              <p style={{ marginTop: 10 }}>
                This policy applies specifically to the Nova digital service platform. While All Sky Fares LLC also operates international travel consultancy and airline ticketing booking services at allskyfares.com, the data processing activities described herein pertain strictly to the software, digital consulting, and client collaboration activities conducted through Nova.
              </p>
            </>
          ),
        },
        {
          title: "2. Information We Collect",
          body: (
            <>
              <p>We only collect personal information that is strictly necessary for legitimate business communication and portal administration:</p>
              <ul style={{ margin: "10px 0 10px 20px", display: "grid", gap: 6 }}>
                <li>
                  <strong>Project Inquiries:</strong> When you complete our contact form, we collect your name, email address, company name, requested service, estimated project budget, and project description.
                </li>
                <li>
                  <strong>Client Portal Accounts:</strong> When an account is created for client collaboration, we collect your name, email address, password hash, and optional multi-factor authentication (TOTP) credentials.
                </li>
                <li>
                  <strong>Project Communications & Files:</strong> When authorized clients and studio administrators collaborate, we store project messages, discussion timestamps, administrative audit trails, and client-uploaded project attachments (such as UI mockups, reference images, and PDF project briefs).
                </li>
                <li>
                  <strong>Technical & Operational Logs:</strong> For system security, rate limiting, and fraud prevention, our servers record IP addresses, user agent headers, and request timestamps.
                </li>
              </ul>
              <p style={{ marginTop: 10 }}>
                <strong>We do not collect sensitive categories of personal data</strong> such as biometric identifiers, financial card numbers, health data, or political affiliations on this website.
              </p>
            </>
          ),
        },
        {
          title: "3. Purposes and Legal Bases for Processing",
          body: (
            <>
              <p>Under applicable data protection laws (including the India Digital Personal Data Protection Act, 2023, and the EU/UK GDPR), we process personal data under the following lawful bases:</p>
              <ul style={{ margin: "10px 0 10px 20px", display: "grid", gap: 6 }}>
                <li>
                  <strong>To Respond to Inquiries & Pre-Contractual Steps (GDPR Art. 6(1)(b) / DPDPA §4):</strong> Processing inquiry details to assess project feasibility, deliver proposals, and schedule discovery meetings.
                </li>
                <li>
                  <strong>Performance of a Contract (GDPR Art. 6(1)(b)):</strong> Managing your client account, delivering software design services, coordinating milestones, and providing project access.
                </li>
                <li>
                  <strong>Legitimate Business Interests (GDPR Art. 6(1)(f)):</strong> Maintaining infrastructure integrity, preventing spam through Honeypot and rate limiting, auditing administrative actions, and ensuring platform security.
                </li>
                <li>
                  <strong>Legal & Regulatory Compliance (GDPR Art. 6(1)(c) / IT Act §70B):</strong> Retaining necessary transaction and cybersecurity records in accordance with statutory obligations.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "4. No Sale or Cross-Context Sharing of Personal Data",
          body: (
            <>
              <p>
                <strong>We do not sell, rent, or trade your personal data to third parties.</strong>
              </p>
              <p style={{ marginTop: 10 }}>
                We do not sell your personal information or share it for cross-context behavioral advertising (as defined under the California Consumer Privacy Act / CPRA and related US state statutes). Nova does not run third-party advertising networks, surveillance scripts, or social tracking pixels on this site.
              </p>
            </>
          ),
        },
        {
          title: "5. Data Processors and Service Providers",
          body: (
            <>
              <p>We work with trusted infrastructure providers who process data strictly on our instructions and under binding confidentiality and data protection agreements:</p>
              <ul style={{ margin: "10px 0 10px 20px", display: "grid", gap: 6 }}>
                <li>
                  <strong>Hosting & Database Infrastructure:</strong> Dedicated application hosting and relational database systems (MySQL) secured with encrypted network connections and access controls.
                </li>
                <li>
                  <strong>Transactional Email Delivery:</strong> Secure email relay providers for delivering verification links, password resets, and inquiry notifications.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "6. Data Retention and Security",
          body: (
            <>
              <p>
                We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by applicable commercial, tax, and cybersecurity regulations:
              </p>
              <ul style={{ margin: "10px 0 10px 20px", display: "grid", gap: 6 }}>
                <li>
                  <strong>General Inquiries:</strong> Retained for up to 24 months from the last communication, after which records are archived or deleted unless a commercial contract was established.
                </li>
                <li>
                  <strong>Client Account Records:</strong> Retained for the duration of the active client relationship plus any statutory limitation period required for contractual records.
                </li>
                <li>
                  <strong>Security & Audit Logs:</strong> Security logs and rate-limiting counters are automatically pruned or rotated according to administrative retention schedules.
                </li>
              </ul>
              <p style={{ marginTop: 10 }}>
                Security measures include cryptographic hashing for passwords (scrypt), time-based one-time password (TOTP) two-factor authentication, HTTP Content Security Policies, rate limiting, and transport layer encryption (TLS/HTTPS).
              </p>
            </>
          ),
        },
        {
          title: "7. Your Legal Rights (DPDPA, GDPR, US State Laws)",
          body: (
            <>
              <p>Depending on your jurisdiction, you have specific statutory rights regarding your personal data:</p>
              <ul style={{ margin: "10px 0 10px 20px", display: "grid", gap: 6 }}>
                <li>
                  <strong>Right to Access & Confirmation:</strong> Request confirmation of whether we are processing your personal data and obtain a summary of such data.
                </li>
                <li>
                  <strong>Right to Rectification:</strong> Request correction or completion of inaccurate or outdated personal records.
                </li>
                <li>
                  <strong>Right to Erasure / Deletion:</strong> Request the deletion of your personal data where retention is no longer justified by law or contract.
                </li>
                <li>
                  <strong>Right to Grievance Redressal (India DPDPA):</strong> Access to an expedited grievance redressal process.
                </li>
                <li>
                  <strong>Right to Nominate (India DPDPA §14):</strong> The right to designate a nominee to exercise your rights in the event of death or incapacity.
                </li>
                <li>
                  <strong>Non-Discrimination:</strong> We will never discriminate against you, deny services, or alter pricing for exercising your statutory privacy rights.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "8. Children's Privacy",
          body: (
            <p>
              Nova is a digital product, web engineering, and client collaboration platform. Users must be at least thirteen (13) years of age to register for an account or submit project inquiries. We do not knowingly collect, solicit, or maintain personal information from children under the age of 13 in compliance with the Children&apos;s Online Privacy Protection Act (COPPA), GDPR Article 8, and the Digital Personal Data Protection Act (DPDPA). If we discover that a user under 13 has registered or provided personal data, we will immediately delete their records and deactivate the account. If you believe a child under 13 has provided personal details to Nova, please notify us immediately at <code>nova@allskyfares.com</code>.
            </p>
          ),
        },
        {
          title: "9. Contact, Privacy Inquiries & Grievance Officer",
          body: (
            <>
              <p>To exercise your rights, submit a privacy inquiry, or register a grievance, please contact our administrative team:</p>
              <div style={{ marginTop: 12, padding: "14px 18px", background: "var(--paper, #f7f8fb)", borderRadius: 10, border: "1px solid var(--line, #e2e5ec)" }}>
                <div><strong>Operating Entity:</strong> All Sky Fares LLC</div>
                <div style={{ marginTop: 4 }}><strong>Service:</strong> Nova (Digital Studio)</div>
                <div style={{ marginTop: 4 }}><strong>Privacy & Legal Inquiries:</strong> <a href="mailto:nova@allskyfares.com" style={{ color: "var(--blue)" }}>nova@allskyfares.com</a></div>
              </div>
              <p style={{ marginTop: 10 }}>
                We respond to verified privacy requests and grievances within the statutory timeframes required by applicable law (typically within 30 days of receipt and verification).
              </p>

            </>
          ),
        },
      ]}
    />
  );
}
