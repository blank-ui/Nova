import LegalPage from "@/components/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Notice",
  description: "How All Sky Fares LLC uses strictly necessary cookies and storage technologies on Nova.",
};

const COOKIE_INVENTORY = [
  {
    name: "better-auth.session_token",
    category: "Strictly Necessary",
    purpose: "Maintains authenticated user session state for portal clients and administrators. Protected by HttpOnly and Secure flags.",
    duration: "7 days (rolling)",
  },
  {
    name: "better-auth.csrf_token",
    category: "Strictly Necessary",
    purpose: "Mitigates Cross-Site Request Forgery (CSRF) during authentication and state-changing POST requests.",
    duration: "Session",
  },
  {
    name: "nova-auth-next (sessionStorage)",
    category: "Strictly Necessary",
    purpose: "Browser session storage storing post-login redirect path so users return to their intended project page upon login.",
    duration: "Until browser tab closed",
  },
  {
    name: "nova-locale",
    category: "Functionality / Preference",
    purpose: "Stores your selected language preference across page navigations and sessions without tracking your identity.",
    duration: "1 year",
  },
  {
    name: "nova-currency",
    category: "Functionality / Preference",
    purpose: "Stores your chosen currency preference (USD, EUR, GBP, INR, etc.) for localized price formatting.",
    duration: "1 year",
  },
];

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

              {/* Mobile Card-Based View (< 640px) */}
              <div className="nova-cookie-cards" style={{ marginTop: 16 }}>
                {COOKIE_INVENTORY.map((cookie) => (
                  <div
                    key={cookie.name}
                    style={{
                      background: "var(--pub-surface-card, rgba(0, 0, 0, 0.02))",
                      border: "1px solid var(--pub-line, var(--line, #e2e5ec))",
                      borderRadius: 14,
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      width: "100%",
                      maxWidth: "100%",
                      minWidth: 0,
                      boxSizing: "border-box",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <code
                        style={{
                          fontFamily: "monospace",
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "var(--ink)",
                          wordBreak: "break-all",
                          background: "var(--paper, #f7f8fb)",
                          padding: "3px 6px",
                          borderRadius: 6,
                          border: "1px solid var(--line, #e2e5ec)",
                        }}
                      >
                        {cookie.name}
                      </code>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: "rgba(108, 76, 255, 0.1)",
                          color: "var(--pub-violet, #6c4cff)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cookie.category}
                      </span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 13, lineHeight: 1.6, color: "var(--muted)", wordBreak: "break-word" }}>
                      {cookie.purpose}
                    </p>
                    <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
                      <strong style={{ color: "var(--ink)", fontWeight: 600 }}>Duration:</strong> {cookie.duration}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= 640px) */}
              <div className="nova-cookie-table-view nova-table-wrapper" style={{ marginTop: 14 }}>
                <table style={{ width: "100%", minWidth: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--line, #e2e5ec)", background: "var(--paper, #f7f8fb)" }}>
                      <th style={{ padding: "10px 12px", width: "28%" }}>Cookie Name</th>
                      <th style={{ padding: "10px 12px", width: "22%" }}>Category</th>
                      <th style={{ padding: "10px 12px", width: "35%" }}>Purpose</th>
                      <th style={{ padding: "10px 12px", width: "15%" }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COOKIE_INVENTORY.map((cookie) => (
                      <tr key={cookie.name} style={{ borderBottom: "1px solid var(--line, #e2e5ec)" }}>
                        <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 12, wordBreak: "break-all" }}>
                          {cookie.name}
                        </td>
                        <td style={{ padding: "10px 12px" }}>{cookie.category}</td>
                        <td style={{ padding: "10px 12px", lineHeight: 1.6 }}>{cookie.purpose}</td>
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{cookie.duration}</td>
                      </tr>
                    ))}
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
          title: "5. How to Manage Cookies in Your Browser",
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
              <div
                style={{
                  marginTop: 12,
                  padding: "14px 18px",
                  background: "var(--paper, #f7f8fb)",
                  borderRadius: 10,
                  border: "1px solid var(--line, #e2e5ec)",
                  boxSizing: "border-box",
                  maxWidth: "100%",
                }}
              >
                <div><strong>Operating Entity:</strong> All Sky Fares LLC</div>
                <div style={{ marginTop: 4 }}>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:nova@allskyfares.com" style={{ color: "var(--blue)" }}>
                    nova@allskyfares.com
                  </a>
                </div>
              </div>
            </>
          ),
        },
      ]}
    />
  );
}
