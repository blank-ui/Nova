import LegalPage from "@/components/legal-page";

export default function Accessibility() {
  return (
    <LegalPage
      kind="Accessibility Statement"
      title="Digital experiences should welcome everyone."
      subtitle="Commitment to accessible, inclusive web experiences by All Sky Fares LLC."
      sections={[
        {
          title: "1. Our Commitment",
          body: (
            <p>
              <strong>All Sky Fares LLC</strong> is committed to ensuring digital accessibility for people of all abilities across Nova. We continually improve the user experience for everyone and apply relevant accessibility standards, striving to adhere to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA specifications.
            </p>
          ),
        },
        {
          title: "2. Technical Standards & Practices",
          body: (
            <>
              <p>To ensure accessibility across our site and client portal, we implement the following core practices:</p>
              <ul style={{ margin: "10px 0 10px 20px", display: "grid", gap: 6 }}>
                <li>
                  <strong>Semantic Markup:</strong> Structuring content with semantic HTML5 landmarks, native heading hierarchies, and explicit form labeling.
                </li>
                <li>
                  <strong>Keyboard Navigation:</strong> Ensuring interactive controls, buttons, navigation menus, and form inputs are operable entirely via keyboard with clear, high-contrast focus rings.
                </li>
                <li>
                  <strong>Color & Contrast:</strong> Maintaining contrast ratios meeting or exceeding WCAG AA minimum standards (4.5:1 for normal body text).
                </li>
                <li>
                  <strong>Screen Reader Compatibility:</strong> Utilizing ARIA live regions for dynamic alerts, form error summaries, and descriptive text for non-text visual elements.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "3. Known Limitations & Ongoing Enhancements",
          body: (
            <p>
              While we strive to ensure comprehensive accessibility across all viewports and assistive technologies, some legacy documents or third-party client assets may not yet fully comply with WCAG 2.1 Level AA standards. We regularly audit and refine our codebase to address any identified barriers.
            </p>
          ),
        },
        {
          title: "4. Feedback & Accessibility Contact",
          body: (
            <>
              <p>
                We welcome your feedback on the accessibility of Nova. If you encounter accessibility barriers, difficult-to-navigate elements, or require an alternative format, please contact our team:
              </p>
              <div style={{ marginTop: 12, padding: "14px 18px", background: "var(--paper, #f7f8fb)", borderRadius: 10, border: "1px solid var(--line, #e2e5ec)" }}>
                <div><strong>Operating Entity:</strong> All Sky Fares LLC</div>
                <div style={{ marginTop: 4 }}><strong>Accessibility Feedback:</strong> <a href="mailto:nova@allskyfares.com" style={{ color: "var(--blue)" }}>nova@allskyfares.com</a></div>
              </div>
              <p style={{ marginTop: 10 }}>

                Please specify the web page URL and the specific issue you experienced. We aim to respond to accessibility feedback within two (2) business days.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
