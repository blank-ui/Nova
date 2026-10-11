import { describe, it, expect } from "vitest";
import Privacy from "@/app/privacy/page";
import Terms from "@/app/terms/page";
import Cookies from "@/app/cookies/page";
import Refund from "@/app/refund-policy/page";
import Support from "@/app/support-policy/page";
import Accessibility from "@/app/accessibility/page";

describe("Legal Pages Compliance & Content Verification", () => {
  it("renders Privacy page with All Sky Fares LLC attribution and DPDPA/GDPR coverage", () => {
    const element = Privacy();
    expect(element).toBeDefined();
    expect(element.props.kind).toBe("Privacy Policy");
    expect(element.props.title).toBe("Privacy, handled with care.");
    
    // Verify required legal sections exist
    const titles = element.props.sections.map((s: { title: string }) => s.title);
    expect(titles).toContain("1. Operating Entity and Scope");
    expect(titles).toContain("2. Information We Collect");
    expect(titles).toContain("3. Purposes and Legal Bases for Processing");
    expect(titles).toContain("4. No Sale or Cross-Context Sharing of Personal Data");
    expect(titles).toContain("7. Your Legal Rights (DPDPA, GDPR, US State Laws)");
    expect(titles).toContain("9. Contact, Privacy Inquiries & Grievance Officer");
  });

  it("renders Terms of Service with All Sky Fares LLC and SOW contractual hierarchy", () => {
    const element = Terms();
    expect(element).toBeDefined();
    expect(element.props.kind).toBe("Terms of Service");
    
    const titles = element.props.sections.map((s: { title: string }) => s.title);
    expect(titles).toContain("1. Acceptance of Terms & Operating Entity");
    expect(titles).toContain("2. Services and Statements of Work (SOW)");
    expect(titles).toContain("5. Intellectual Property Rights");
    expect(titles).toContain("8. Governing Law and Dispute Resolution");
  });

  it("renders Cookie Notice with strictly necessary cookie inventory and ePrivacy exemption", () => {
    const element = Cookies();
    expect(element).toBeDefined();
    expect(element.props.kind).toBe("Cookie Notice");
    
    const titles = element.props.sections.map((s: { title: string }) => s.title);
    expect(titles).toContain("2. Our Approach: Strictly Necessary Storage Only");
    expect(titles).toContain("3. Cookie Inventory & Technical Specifications");
    expect(titles).toContain("4. Legal Basis under EU ePrivacy / UK PECR / DPDPA");
  });

  it("renders Refund Policy with digital consulting scope and distinction from travel services", () => {
    const element = Refund();
    expect(element).toBeDefined();
    expect(element.props.kind).toBe("Refund & Cancellation Policy");
    
    const titles = element.props.sections.map((s: { title: string }) => s.title);
    expect(titles).toContain("1. Scope and Distinction from Travel Services");
    expect(titles).toContain("2. Custom Software & Professional Services Framework");
    expect(titles).toContain("3. Project Cancellation & Offboarding Procedures");
  });

  it("renders Support Policy with SLAs and reporting instructions", () => {
    const element = Support();
    expect(element).toBeDefined();
    expect(element.props.kind).toBe("Support Policy");
    
    const titles = element.props.sections.map((s: { title: string }) => s.title);
    expect(titles).toContain("1. Scope and Support Tiers");
    expect(titles).toContain("2. Incident Priority & Target Response Times");
    expect(titles).toContain("3. How to Report a Technical Issue");
  });

  it("renders Accessibility Statement with WCAG 2.1 AA targets", () => {
    const element = Accessibility();
    expect(element).toBeDefined();
    expect(element.props.kind).toBe("Accessibility Statement");
    
    const titles = element.props.sections.map((s: { title: string }) => s.title);
    expect(titles).toContain("1. Our Commitment");
    expect(titles).toContain("2. Technical Standards & Practices");
    expect(titles).toContain("4. Feedback & Accessibility Contact");
  });
});
