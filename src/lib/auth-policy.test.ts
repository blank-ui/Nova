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

  it("isolates client resources by authenticated owner", () => {
    expect(canOpenClientResource("CLIENT", "client-a", "client-a")).toBe(true);
    expect(canOpenClientResource("CLIENT", "client-a", "client-b")).toBe(false);
    expect(canOpenClientResource("ADMIN", "admin", "client-a")).toBe(false);
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
