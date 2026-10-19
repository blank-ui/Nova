import LegalPage from "@/components/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Notice",
  description: "How All Sky Fares LLC uses strictly necessary cookies and storage technologies on Nova.",
};

export default function Cookies() {
  return (
    <LegalPage
      kind="Cookie Notice"
      title="A simpler, more respectful web."
      subtitle="How All Sky Fares LLC uses cookies and storage technologies on Nova."
      sections={[
        {
          title: "1. What Are Cookies?",
          body: (
            <p>
              Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work properly, ensure secure navigation, authenticate user sessions, and provide essential functionality.
            </p>
          ),
        },
        {
          title: "2. Our Approach: Strictly Necessary Storage Only",
          body: (
            <>
              <p>
                Nova is built with privacy-by-design principles.{" "}
                <strong>We only set strictly necessary, first-party cookies</strong> required to operate the application securely and authenticate clients in our portal.
              </p>
              <p style={{ marginTop: 10 }}>
                <strong>We do not use advertising cookies, third-party tracking pixels, or cross-site behavioral telemetry.</strong> We do not run Google Analytics, Meta Pixel, TikTok tracking, or commercial ad network cookies on this domain.
              </p>
            </>
          ),
        },
        {
          title: "3. Cookie Inventory & Technical Specifications",
          body: (
            <>
              <p>The following first-party cookies may be set when you use Nova:</p>
              <div style={{ marginTop: 12, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--line, #e2e5ec)", background: "var(--paper, #f7f8fb)" }}>
                      <th style={{ padding: "10px 12px" }}>Cookie Name</th>
                      <th style={{ padding: "10px 12px" }}>Category</th>
                      <th style={{ padding: "10px 12px" }}>Purpose</th>
                      <th style={{ padding: "10px 12px" }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid var(--line, #e2e5ec)" }}>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>better-auth.session_token</td>
                      <td style={{ padding: "10px 12px" }}>Strictly Necessary</td>
                      <td style={{ padding: "10px 12px" }}>Maintains authenticated user session state for portal clients and administrators. Protected by HttpOnly and Secure flags.</td>
                      <td style={{ padding: "10px 12px" }}>7 days (rolling)</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--line, #e2e5ec)" }}>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>better-auth.csrf_token</td>
                      <td style={{ padding: "10px 12px" }}>Strictly Necessary</td>
                      <td style={{ padding: "10px 12px" }}>Mitigates Cross-Site Request Forgery (CSRF) during authentication and state-changing POST requests.</td>
                      <td style={{ padding: "10px 12px" }}>Session</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--line, #e2e5ec)" }}>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>nova-auth-next (sessionStorage)</td>
                      <td style={{ padding: "10px 12px" }}>Strictly Necessary</td>
                      <td style={{ padding: "10px 12px" }}>Browser session storage storing post-login redirect path so users return to their intended project page upon login.</td>
                      <td style={{ padding: "10px 12px" }}>Until browser tab closed</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--line, #e2e5ec)" }}>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>nova-locale</td>
                      <td style={{ padding: "10px 12px" }}>Functionality / Preference</td>
                      <td style={{ padding: "10px 12px" }}>Stores your selected language preference across page navigations and sessions without tracking your identity.</td>
                      <td style={{ padding: "10px 12px" }}>1 year</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--line, #e2e5ec)" }}>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>nova-currency</td>
                      <td style={{ padding: "10px 12px" }}>Functionality / Preference</td>
                      <td style={{ padding: "10px 12px" }}>Stores your chosen currency preference (USD, EUR, GBP, INR, etc.) for localized price formatting.</td>
                      <td style={{ padding: "10px 12px" }}>1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ),
        },
        {
          title: "4. Legal Basis under EU ePrivacy / UK PECR / DPDPA",
          body: (
            <p>
              Under the EU ePrivacy Directive (Directive 2002/58/EC as amended), UK Privacy and Electronic Communications Regulations (PECR), and the India Digital Personal Data Protection Act, strictly necessary cookies that are essential for providing an online service requested by the user are exempt from prior consent requirements. Because Nova sets no optional, analytics, or advertising cookies, no intrusive tracking banner or consent mechanism is required to block tracking cookies.
            </p>
          ),
        },
        {
          title: "5. Managing Cookies in Your Browser",
          body: (
            <>
              <p>
                Most modern browsers allow you to manage and block cookies through browser settings. You can configure your browser to reject all cookies or notify you when a cookie is placed.
              </p>
              <p style={{ marginTop: 10 }}>
                Please note that blocking strictly necessary cookies will prevent you from signing in to the Nova client portal, as session management relies on secure authentication tokens.
              </p>
            </>
          ),
        },
        {
          title: "6. Contact Information",
          body: (
            <>
              <p>If you have questions regarding our use of cookies or privacy practices, please contact:</p>
              <div style={{ marginTop: 12, padding: "14px 18px", background: "var(--paper, #f7f8fb)", borderRadius: 10, border: "1px solid var(--line, #e2e5ec)" }}>
                <div><strong>Operating Entity:</strong> All Sky Fares LLC</div>
                <div style={{ marginTop: 4 }}><strong>Email:</strong> <a href="mailto:nova@allskyfares.com" style={{ color: "var(--blue)" }}>nova@allskyfares.com</a></div>
              </div>

            </>
          ),
        },
      ]}
    />
  );
}
