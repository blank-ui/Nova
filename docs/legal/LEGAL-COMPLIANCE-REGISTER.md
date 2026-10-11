# Legal & Regulatory Compliance Register — Nova (All Sky Fares LLC)

**Document Version:** 1.0.0  
**Operating Entity:** All Sky Fares LLC  
**Service/Product:** Nova (Digital Studio & Client Portal Platform)  
**Effective Date:** October 11, 2026  
**Scope:** Privacy, Consumer Protection, Electronic Commerce, Information Technology, Cybersecurity, and Web Accessibility.

---

## 1. Operating Business Context & Corporate Architecture

1. **Entity Attribution:**  
   Nova is a digital agency and software service operating on behalf of **All Sky Fares LLC**. Nova is not a distinct corporate entity or independent corporation.
2. **Business Separation of Services:**  
   While All Sky Fares LLC's primary commercial operations encompass travel consultancy, airline ticketing intermediary services, and flight booking via `allskyfares.com`, Nova represents an independent technical service offering custom software engineering, website development, product design, and client portal access.
3. **Primary Operating Contacts:**  
   - **Corporate Operating Entity:** All Sky Fares LLC  
   - **Service Inquiries, Studio Operations & Data Privacy:** `nova@allskyfares.com`  
   - **Support Schedule:** Studio business hours (Mon–Fri) for development/portal inquiries.

---

## 2. Regulatory Compliance Matrix

| Requirement ID | Regulatory Citation & Jurisdiction | Summary of Legal Mandate | Applicability Determination | Codebase Reality & Technical Evidence | Compliance Status | Action Taken / Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REG-DPDP-01** | Digital Personal Data Protection Act, 2023 (DPDPA) §5; Draft Rules 2025 | Notice requirement prior to or at time of requesting consent; clear, itemized explanation of personal data collected and specified purpose. | **Mandatory** (Nova processes Indian data principals' data via inquiry forms and client portal accounts). | Public inquiry form at `src/app/contact/page.tsx` collects Name, Email, Company, Service, Budget, Message. Account registration at `src/app/register/page.tsx` collects Name, Email, Password. | **COMPLIANT** | Updated privacy notice embedded at collection points with explicit references to All Sky Fares LLC as Data Fiduciary. |
| **REG-DPDP-02** | DPDPA, 2023 §6; Draft Rules 2025 | Consent must be free, specific, informed, unconditional, and unambiguous with clear affirmative action. | **Mandatory** | Contact form requires affirmative form submission. No pre-ticked checkboxes or hidden consents. Better Auth registration requires clear affirmative action. | **COMPLIANT** | Added contextual privacy statement on `/contact` and `/register` with direct navigation to the modernized Privacy Policy. |
| **REG-DPDP-03** | DPDPA, 2023 §8 | General obligations of Data Fiduciary: security safeguards, data accuracy, data erasure when purpose achieved. | **Mandatory** | Passwords hashed using scrypt (Better Auth default); MFA (TOTP) available; rate limiting on API endpoints; CSP + security headers enforced; isolated schema access. | **COMPLIANT** | Technical security verified in Phase 5B/5C audits. Data retention and erasure procedures detailed in Privacy Policy. |
| **REG-DPDP-04** | DPDPA, 2023 §11, §12, §13 | Rights of Data Principal: Right to access, rectification, erasure, grievance redressal, and nomination. | **Mandatory** | Users can update passwords and TOTP via portal. Requests for data copy or deletion are directed to designated grievance channel. | **COMPLIANT** | Privacy Policy publishes full principal rights and contact channel (`nova@allskyfares.com`) with guaranteed response timeline. |
| **REG-DPDP-05** | DPDPA, 2023 §9 | Processing of personal data of children and persons with disabilities. | **Conditional** | Nova services are strictly B2B and directed at enterprise/business professionals aged 18 and older. | **COMPLIANT** | Age eligibility clause incorporated in Terms of Service and Privacy Policy barring users under 18 years of age. |
| **REG-GDPR-01** | EU/UK GDPR Art. 13 & 14 | Transparent information, communication and modalities for the exercise of the rights of the data subject. | **Mandatory** (when serving European clients/visitors). | Privacy Policy comprehensively enumerates data collected, legal bases (contract performance, legitimate interests), retention periods, and transfer safeguards. | **COMPLIANT** | Comprehensive Art. 13 disclosure implemented on `/privacy`. |
| **REG-GDPR-02** | EU/UK GDPR Art. 6 | Lawful basis for processing: Performance of contract (Art. 6(1)(b)), Legitimate interests (Art. 6(1)(f)), Consent (Art. 6(1)(a)). | **Mandatory** | Inquiries handled under legitimate interest / pre-contractual steps; authenticated portal sessions handled under contract performance; security headers/rate limiting under legitimate interest. | **COMPLIANT** | Legal bases formally detailed in updated Privacy Policy. |
| **REG-GDPR-03** | EU/UK GDPR Art. 15–22 | Data Subject Rights: Access, Rectification, Erasure, Restriction, Portability, Objection. | **Mandatory** | Rights handling channel established. Nova does not engage in automated decision-making or profiling having legal effects. | **COMPLIANT** | Explicit instructions and turnaround expectations provided in Privacy Policy. |
| **REG-GDPR-04** | EU/UK GDPR Art. 44–49 | International data transfers. | **Mandatory** | Infrastructure hosted on standard cloud infrastructure (e.g., MySQL, Vercel/Node hosting). | **COMPLIANT** | Cross-border transfer mechanisms (Standard Contractual Clauses / adequate safeguards) disclosed in Privacy Policy. |
| **REG-US-01** | California CCPA/CPRA, Virginia VCDPA, Colorado CPA, Delaware DPA | Transparency regarding personal data categories collected, sold, or shared; "Do Not Sell or Share My Personal Information". | **Mandatory / Best Practice** | Nova does **not** sell or share personal information with third parties for cross-context behavioral advertising. Zero tracking pixels or advertising cookies. | **COMPLIANT** | Explicit statutory "We do not sell personal data" declaration added across policies. |
| **REG-US-02** | Cal. Bus. & Prof. Code § 22575 (CalOPPA) | Commercial website privacy policy posting and Do-Not-Track disclosure. | **Mandatory** | Accessible privacy link in universal site footer (`src/components/footer.tsx`). | **COMPLIANT** | Verified presence of persistent footer link on every page; added Do-Not-Track / Global Privacy Control statement. |
| **REG-ECOM-01** | India Consumer Protection (E-Commerce) Rules, 2020 §5; FTC Guidelines | Identification of e-commerce entity: legal entity name, geographic address, contact numbers, customer care details, grievance officer. | **Mandatory** | Footer and legal pages must state All Sky Fares LLC operating identity and official contact channels. | **COMPLIANT** | Integrated All Sky Fares LLC legal name and contact email across footer, legal hub, and policy documents. |

| **REG-ECOM-02** | India Information Technology Act, 2000 §43A & SPDI Rules, 2011 | Reasonable security practices and procedures for sensitive personal data or information (passwords, credentials). | **Mandatory** | Scrypt password hashing, session tokens in HttpOnly Secure cookies, CSRF protection via Origin verification, strict CSP, rate limiting. | **COMPLIANT** | Compliant with ISO/IEC 27001 / SPDI standards. |
| **REG-CERT-01** | CERT-In Directions under IT Act §70B (April 2022) | Mandatory 6-hour cybersecurity incident reporting for specified cybersecurity incidents; system log retention. | **Mandatory** (for Indian operational footprint). | System maintains security audit logs (`AuditLog` Prisma model) recording critical administrative actions. | **COMPLIANT** | Incident response and CERT-In cooperation workflow established in operational guidelines. |
| **REG-COOKIE-01** | EU ePrivacy Directive (2002/58/EC as amended 2009/136/EC); UK PECR | Consent required for non-essential cookies. Strictly necessary cookies exempt from prior consent but require disclosure. | **Mandatory** | Codebase inspection confirms **only strictly necessary cookies** are used: Better Auth session cookie (`better-auth.session_token`) and CSRF tokens. No Google Analytics, no Facebook Pixel, no third-party marketing tags. | **COMPLIANT** | Modernized Cookie Notice (`src/app/cookies/page.tsx`) explicitly documenting the exact name, purpose, type, and retention of every first-party cookie. |
| **REG-A11Y-01** | Rights of Persons with Disabilities Act, 2016 (India); ADA Title III; WCAG 2.1 AA | Digital accessibility of electronic services. | **Best Practice / Compliance** | Semantic HTML structure, high-contrast text, keyboard navigable forms, ARIA live regions, visible focus rings. | **COMPLIANT** | Modernized Accessibility Statement (`src/app/accessibility/page.tsx`) detailing compliance target (WCAG 2.1 AA), features, and feedback mechanism. |

---

## 3. Discrepancy & Gap Analysis: All Sky Fares LLC vs. Nova

1. **Industry Domain Discrepancy:**  
   - *All Sky Fares LLC:* Primary business is international travel consultancy, airline ticket search, consolidator fares, and hotel bookings.  
   - *Nova:* Digital agency specializing in web applications, internal tools, UI/UX design, and client portal software.  
   - *Remediation:* Policies must clearly distinguish Nova as an engineering and digital product service of All Sky Fares LLC, avoiding air passenger or airline ticketing terminology within Nova's digital service agreements, while retaining All Sky Fares LLC as the legal contracting entity.
2. **Refund Policy Alignment:**  
   - *All Sky Fares Travel Policy:* Operates a sliding-scale cancellation policy (e.g., 60+ days before flight = 95% refund, non-refundable consolidator fares).  
   - *Nova Studio Policy:* Digital consulting and bespoke software development contracts operate on milestone deliverables, non-refundable discovery/retainer fees, and agreed scope cancellation terms.  
   - *Remediation:* Clarify in Nova's Refund Policy (`src/app/refund-policy/page.tsx`) that custom development deliverables, retained engineering hours, and accepted milestones are governed by individual client Statement of Work (SOW) terms, distinct from All Sky Fares LLC's travel booking cancellation schedules.
3. **Cookie Disclosures:**  
   - *All Sky Fares:* Utilizes third-party customer support scripts (Tawk.to) and flight search APIs (Duffel).  
   - *Nova:* Uses zero third-party widgets, zero advertising pixels, and zero tracking cookies. Nova only sets first-party essential session cookies.  
   - *Remediation:* Ensure Nova's Cookie Notice accurately reflects Nova's lean, privacy-preserving stack without copying unneeded third-party tracking disclosures from external travel sites.

---

## 4. Counsel Review Items (Pre-Launch Legal Hold)

The following items are designated for review and sign-off by qualified legal counsel prior to commercial launch:
1. Formal incorporation details and jurisdictional registration number (EIN/CIN) for All Sky Fares LLC to be confirmed on public filings.
2. Designation of the official Grievance Redressal Officer under India DPDPA 2023 / IT Rules 2021.
3. Master Services Agreement (MSA) template governing enterprise custom software development, indemnification caps, and intellectual property assignment.
