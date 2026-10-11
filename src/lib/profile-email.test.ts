import { describe, expect, it } from "vitest";
import { buildNovaEmailHtml } from "./auth-email";

describe("Transactional Email and Brand Templates", () => {
  it("renders branded email HTML with proper structure, colors, and All Sky Fares LLC footer", () => {
    const html = buildNovaEmailHtml({
      subject: "Verify your email",
      heading: "Confirm your account",
      bodyText: "Please click the link below to confirm your new email address.",
      actionText: "Verify Email",
      actionUrl: "https://nova.allskyfares.com/verify-email?token=xyz123",
      subtext: "If you did not request this change, secure your account immediately.",
    });

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("NOVA");
    expect(html).toContain("All Sky Fares LLC");
    expect(html).toContain("nova@allskyfares.com");
    expect(html).toContain("Verify Email");
    expect(html).toContain("https://nova.allskyfares.com/verify-email?token=xyz123");
    expect(html).toContain("If you did not request this change");
    // Ensure no phone numbers exist in the email template
    expect(html).not.toMatch(/\+1[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);
  });

  it("handles email templates without action button or subtext cleanly", () => {
    const html = buildNovaEmailHtml({
      subject: "Security Notification",
      heading: "Password Changed",
      bodyText: "Your Nova account password was recently changed.",
    });

    expect(html).toContain("Password Changed");
    expect(html).toContain("Your Nova account password was recently changed.");
    expect(html).not.toContain("&rarr;");
    expect(html).toContain("nova@allskyfares.com");
  });
});
