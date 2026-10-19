import { describe, it, expect } from "vitest";
import {
  getFiscalYear,
  getFiscalYearMonth,
  formatInvoiceNumber,
  parseInvoiceNumber,
  getNextInvoiceNumberFromList,
} from "./invoice-utils";

describe("Invoice Numbering & Fiscal Year/Month (FY) utilities (NOVA-FYYYMM-01)", () => {
  it("computes the 2-digit fiscal year for a given date", () => {
    const d2026 = new Date("2026-10-19T12:00:00Z");
    expect(getFiscalYear(d2026)).toBe("26");

    const d2027 = new Date("2027-01-01T00:00:00Z");
    expect(getFiscalYear(d2027)).toBe("27");
  });

  it("computes the YYMM period code for a given date", () => {
    const d2026Oct = new Date("2026-10-19T12:00:00Z");
    expect(getFiscalYearMonth(d2026Oct)).toBe("2610");

    const d2027Jan = new Date("2027-01-01T00:00:00Z");
    expect(getFiscalYearMonth(d2027Jan)).toBe("2701");
  });

  it("formats invoice number starting with NOVA-FY{YYMM}-01", () => {
    const d2026May = new Date("2026-05-15T00:00:00Z");
    expect(formatInvoiceNumber(1, d2026May)).toBe("NOVA-FY2605-01");
    expect(formatInvoiceNumber(2, d2026May)).toBe("NOVA-FY2605-02");
    expect(formatInvoiceNumber(15, d2026May)).toBe("NOVA-FY2605-15");

    const d2026Oct = new Date("2026-10-19T00:00:00Z");
    expect(formatInvoiceNumber(1, d2026Oct)).toBe("NOVA-FY2610-01");
  });

  it("automatically increases the period in invoice number once month or year ends", () => {
    const endOfYear2026 = new Date("2026-12-31T23:59:59Z");
    expect(formatInvoiceNumber(1, endOfYear2026)).toBe("NOVA-FY2612-01");

    const newYear2027 = new Date("2027-01-01T00:00:01Z");
    expect(formatInvoiceNumber(1, newYear2027)).toBe("NOVA-FY2701-01");

    const mid2028 = new Date("2028-06-01T00:00:00Z");
    expect(formatInvoiceNumber(1, mid2028)).toBe("NOVA-FY2806-01");
  });

  it("parses invoice number into period and sequence", () => {
    expect(parseInvoiceNumber("NOVA-FY2610-01")).toEqual({ fy: "2610", sequence: 1 });
    expect(parseInvoiceNumber("NOVA-FY2701-14")).toEqual({ fy: "2701", sequence: 14 });
    expect(parseInvoiceNumber("NOVA-FY26-01")).toEqual({ fy: "26", sequence: 1 });
    expect(parseInvoiceNumber("invalid-string")).toBeNull();
  });

  it("calculates next invoice number for the current period from existing records", () => {
    const d2026Oct = new Date("2026-10-19T00:00:00Z");
    const existing = ["NOVA-FY2610-01", "NOVA-FY2610-02", "NOVA-FY2609-05"];

    expect(getNextInvoiceNumberFromList(existing, d2026Oct)).toBe("NOVA-FY2610-03");
  });

  it("starts at 01 when a new period begins even if previous period had invoices", () => {
    const d2027Jan = new Date("2027-01-05T00:00:00Z");
    const existingFrom2026 = ["NOVA-FY2610-01", "NOVA-FY2612-99"];

    expect(getNextInvoiceNumberFromList(existingFrom2026, d2027Jan)).toBe("NOVA-FY2701-01");
  });
});
