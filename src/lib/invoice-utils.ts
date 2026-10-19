/**
 * Invoice Numbering and Fiscal Year/Month (FY) utilities.
 * Complies with specification:
 * - Starts with NOVA-FYYYMM-01 (e.g. NOVA-FY2610-01)
 * - The FY period automatically rolls over once the month or year ends (e.g. in 2027 -> NOVA-FY2701-01)
 * - Sequence starts at 01 for each new period.
 */

/**
 * Returns the 2-digit fiscal year string for a given date.
 * E.g. 2026 -> "26"
 *      2027 -> "27"
 */
export function getFiscalYear(date: Date = new Date()): string {
  return date.getUTCFullYear().toString().slice(-2);
}

/**
 * Returns the 4-character period code YYMM for a given date.
 * E.g. October 2026 -> "2610"
 *      January 2027 -> "2701"
 */
export function getFiscalYearMonth(date: Date = new Date()): string {
  const yy = date.getUTCFullYear().toString().slice(-2);
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}${mm}`;
}

/**
 * Formats an invoice number based on sequence number and date.
 * e.g. sequence 1 in Oct 2026 -> "NOVA-FY2610-01"
 *      sequence 2 in Oct 2026 -> "NOVA-FY2610-02"
 *      sequence 1 in Jan 2027 -> "NOVA-FY2701-01"
 */
export function formatInvoiceNumber(sequence: number, date: Date = new Date()): string {
  const period = getFiscalYearMonth(date);
  const padded = String(Math.max(1, sequence)).padStart(2, "0");
  return `NOVA-FY${period}-${padded}`;
}

/**
 * Parses an invoice number string to extract period/FY and sequence number.
 * Supports:
 * - NOVA-FY2610-01 (YYMM format, 4 digits period)
 * - NOVA-FY202610-01 (YYYYMM format, 6 digits period)
 * - NOVA-FY26-01 (legacy YY format, 2 digits period)
 */
export function parseInvoiceNumber(invoiceNumber: string): { fy: string; sequence: number } | null {
  const match = invoiceNumber.match(/^NOVA-FY(\d{2,6})-(\d+)$/i);
  if (!match) return null;
  return {
    fy: match[1],
    sequence: parseInt(match[2], 10),
  };
}

/**
 * Calculates the next invoice number for the current fiscal period from a list of existing invoice numbers.
 */
export function getNextInvoiceNumberFromList(existingNumbers: string[], date: Date = new Date()): string {
  const currentPeriod = getFiscalYearMonth(date);
  let maxSeq = 0;

  for (const invNum of existingNumbers) {
    const parsed = parseInvoiceNumber(invNum);
    if (parsed && parsed.fy === currentPeriod) {
      if (parsed.sequence > maxSeq) {
        maxSeq = parsed.sequence;
      }
    }
  }

  return formatInvoiceNumber(maxSeq + 1, date);
}

/**
 * Queries database to compute the next available invoice number for the current fiscal period.
 */
export async function generateNextInvoiceNumber(prismaClient: any, date: Date = new Date()): Promise<string> {
  const period = getFiscalYearMonth(date);
  const prefix = `NOVA-FY${period}-`;

  try {
    const records = await prismaClient.invoice.findMany({
      where: {
        invoiceNumber: {
          startsWith: prefix,
        },
      },
      select: { invoiceNumber: true },
    });

    const numbers = records.map((r: { invoiceNumber: string }) => r.invoiceNumber);
    return getNextInvoiceNumberFromList(numbers, date);
  } catch (err) {
    console.error("[generateNextInvoiceNumber] Failed to query existing invoices:", err);
    return formatInvoiceNumber(1, date);
  }
}
