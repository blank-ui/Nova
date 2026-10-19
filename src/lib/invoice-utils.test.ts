import { describe, it, expect } from "vitest";
import {
  getFiscalYear,
  formatInvoiceNumber,
  parseInvoiceNumber,
  getNextInvoiceNumberFromList,
} from "./invoice-utils";

describe("Invoice Numbering & Fiscal Year (FY) utilities", () => {
  it("computes the 2-digit fiscal year for a given date", () => {
    const d2026 = new Date("2026-10-19T12:00:00Z");
    expect(getFiscalYear(d2026)).toBe("26");

    const d2027 = new Date("2027-01-01T00:00:00Z");
    expect(getFiscalYear(d2027)).toBe("27");

    const d2028 = new Date("2028-12-31T23:59:59Z");
    expect(getFiscalYear(d2028)).toBe("28");
  });

  it("formats invoice number starting with NOVA-FY{year}-01", () => {
    const d2026 = new Date("2026-05-15T00:00:00Z");
    expect(formatInvoiceNumber(1, d2026)).toBe("NOVA-FY26-01");
    expect(formatInvoiceNumber(2, d2026)).toBe("NOVA-FY26-02");
    expect(formatInvoiceNumber(15, d2026)).toBe("NOVA-FY26-15");
  });

  it("automatically increases the fiscal year in invoice number once the year ends", () => {
    const endOfYear2026 = new Date("2026-12-31T23:59:59Z");
    expect(formatInvoiceNumber(1, endOfYear2026)).toBe("NOVA-FY26-01");

    const newYear2027 = new Date("2027-01-01T00:00:01Z");
    expect(formatInvoiceNumber(1, newYear2027)).toBe("NOVA-FY27-01");

    const year2028 = new Date("2028-06-01T00:00:00Z");
    expect(formatInvoiceNumber(1, year2028)).toBe("NOVA-FY28-01");
  });

  it("parses invoice number into FY and sequence", () => {
    expect(parseInvoiceNumber("NOVA-FY26-01")).toEqual({ fy: "26", sequence: 1 });
    expect(parseInvoiceNumber("NOVA-FY27-14")).toEqual({ fy: "27", sequence: 14 });
    expect(parseInvoiceNumber("invalid-string")).toBeNull();
  });

  it("calculates next invoice number for the current FY from existing records", () => {
    const d2026 = new Date("2026-10-19T00:00:00Z");
    const existing = ["NOVA-FY26-01", "NOVA-FY26-02", "NOVA-FY25-09"];

    expect(getNextInvoiceNumberFromList(existing, d2026)).toBe("NOVA-FY26-03");
  });

  it("starts at 01 when a new fiscal year begins even if previous year had invoices", () => {
    const d2027 = new Date("2027-01-05T00:00:00Z");
    const existingFrom2026 = ["NOVA-FY26-01", "NOVA-FY26-02", "NOVA-FY26-99"];

    expect(getNextInvoiceNumberFromList(existingFrom2026, d2027)).toBe("NOVA-FY27-01");
  });
});
