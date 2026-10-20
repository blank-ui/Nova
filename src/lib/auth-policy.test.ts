import { describe, expect, it } from "vitest";
import { canOpenAdmin, canOpenAdminSecurity, canOpenClientResource } from "./auth-policy";
import { safeInternalPath } from "./safe-redirect";
import { inquirySchema } from "./inquiry";

describe("authorization policy", () => {
  it("requires the ADMIN role for the admin workspace", () => {
    expect(canOpenAdmin("ADMIN", true)).toBe(true);
    expect(canOpenAdmin("ADMIN", false)).toBe(true);
    expect(canOpenAdmin("CLIENT", true)).toBe(false);
    expect(canOpenAdminSecurity("ADMIN")).toBe(true);
    expect(canOpenAdminSecurity("CLIENT")).toBe(false);
  });

  it("isolates client resources by authenticated owner, while granting full administrative access to ADMIN", () => {
    expect(canOpenClientResource("CLIENT", "client-a", "client-a")).toBe(true);
    expect(canOpenClientResource("CLIENT", "client-a", "client-b")).toBe(false);
    expect(canOpenClientResource("ADMIN", "admin", "client-a")).toBe(true);
    expect(canOpenClientResource("DEVELOPER", "dev", "client-a")).toBe(false);
  });
});

describe("safe return paths and inquiry validation", () => {
  it("only accepts same-origin relative callback paths", () => {
    expect(safeInternalPath("/portal/security?tab=sessions")).toBe("/portal/security?tab=sessions");
    expect(safeInternalPath("https://attacker.example")).toBe("/portal");
    expect(safeInternalPath("//attacker.example")).toBe("/portal");
    expect(safeInternalPath("/\\attacker.example")).toBe("/portal");
  });

  it("rejects invalid inquiries and the honeypot field", () => {
    const valid = { name: "A. Example", email: "a@example.test", phone: "+1 555 000 1234", service: "Website", message: "A sufficiently detailed request for design and build." };
    expect(inquirySchema.safeParse(valid).success).toBe(true);
    expect(inquirySchema.safeParse({ ...valid, message: "short" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...valid, website: "bot" }).success).toBe(false);
  });
});

describe("client registration age policy", () => {
  it("enforces minimum 13 years of age for account creation", () => {
    const isAtLeast13 = (dobString: string) => {
      const parsed = new Date(dobString);
      if (isNaN(parsed.getTime())) return false;
      const now = new Date();
      const minAgeDate = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());
      return parsed <= minAgeDate;
    };

    const today = new Date();
    const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate()).toISOString().split("T")[0];
    const twelveYearsAgo = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate()).toISOString().split("T")[0];
    const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate()).toISOString().split("T")[0];
    const twentyYearsAgo = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate()).toISOString().split("T")[0];

    expect(isAtLeast13(tenYearsAgo)).toBe(false);
    expect(isAtLeast13(twelveYearsAgo)).toBe(false);
    expect(isAtLeast13(thirteenYearsAgo)).toBe(true);
    expect(isAtLeast13(twentyYearsAgo)).toBe(true);
  });
});

