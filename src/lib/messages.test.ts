import { describe, expect, it } from "vitest";
import {
  CUID_REGEX,
  messageInputSchema,
  messagePaginationSchema,
} from "./messages";

describe("Messages Validation and Parsing (Unit Tests)", () => {
  describe("CUID format validation", () => {
    it("accepts valid 25-character CUIDs starting with c", () => {
      expect(CUID_REGEX.test("c123456789012345678901234")).toBe(true);
      expect(CUID_REGEX.test("clh8x9q2m000008l05k7k5yv7")).toBe(true);
    });

    it("rejects non-CUID strings", () => {
      expect(CUID_REGEX.test("")).toBe(false);
      expect(CUID_REGEX.test("123")).toBe(false);
      expect(CUID_REGEX.test("c123")).toBe(false);
      expect(CUID_REGEX.test("uuid-1234-5678-9012-345678")).toBe(false);
      expect(CUID_REGEX.test("../malicious/path")).toBe(false);
      expect(CUID_REGEX.test("c123456789012345678901234!")).toBe(false);
    });
  });

  describe("Message input schema", () => {
    it("accepts valid text within character bounds", () => {
      const result = messageInputSchema.safeParse({ body: "Hello team, here is the update." });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body).toBe("Hello team, here is the update.");
      }
    });

    it("trims leading and trailing whitespace", () => {
      const result = messageInputSchema.safeParse({ body: "   Trimmed content   \n" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body).toBe("Trimmed content");
      }
    });

    it("rejects empty string", () => {
      const result = messageInputSchema.safeParse({ body: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/cannot be empty/i);
      }
    });

    it("rejects whitespace-only string", () => {
      const result = messageInputSchema.safeParse({ body: "   \n\t  " });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/cannot be empty/i);
      }
    });

    it("rejects non-string types", () => {
      expect(messageInputSchema.safeParse({ body: 12345 }).success).toBe(false);
      expect(messageInputSchema.safeParse({ body: null }).success).toBe(false);
      expect(messageInputSchema.safeParse({ body: undefined }).success).toBe(false);
      expect(messageInputSchema.safeParse({}).success).toBe(false);
    });

    it("accepts 4,000 characters exactly", () => {
      const exactBody = "A".repeat(4000);
      const result = messageInputSchema.safeParse({ body: exactBody });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.length).toBe(4000);
      }
    });

    it("rejects messages exceeding 4,000 characters", () => {
      const tooLong = "A".repeat(4001);
      const result = messageInputSchema.safeParse({ body: tooLong });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/must not exceed 4,000 characters/i);
      }
    });
  });

  describe("Pagination parameters schema", () => {
    it("defaults limit to 20 when not provided", () => {
      const result = messagePaginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.cursor).toBeUndefined();
      }
    });

    it("clamps limit between 1 and 100", () => {
      const under = messagePaginationSchema.safeParse({ limit: "0" });
      expect(under.success).toBe(true);
      if (under.success) expect(under.data.limit).toBe(1);

      const over = messagePaginationSchema.safeParse({ limit: "250" });
      expect(over.success).toBe(true);
      if (over.success) expect(over.data.limit).toBe(100);

      const standard = messagePaginationSchema.safeParse({ limit: "45" });
      expect(standard.success).toBe(true);
      if (standard.success) expect(standard.data.limit).toBe(45);
    });

    it("accepts valid CUID cursor", () => {
      const result = messagePaginationSchema.safeParse({
        cursor: "clh8x9q2m000008l05k7k5yv7",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cursor).toBe("clh8x9q2m000008l05k7k5yv7");
      }
    });

    it("rejects invalid cursor format", () => {
      const result = messagePaginationSchema.safeParse({
        cursor: "invalid-cursor-id",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/invalid cursor/i);
      }
    });
  });
});
