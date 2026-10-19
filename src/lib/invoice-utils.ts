/**
 * Invoice Numbering and Fiscal Year (FY) utilities.
 * Complies with specification:
 * - Starts with NOVA-fy-01 (e.g. NOVA-FY26-01)
 * - The FY year automatically increases once the year ends (e.g. in 2027 -> NOVA-FY27-01)
 */

/**
 * Returns the 2-digit fiscal year string for a given date.
 * E.g. 2026 -> "26"
 *      2027 -> "27"
 */
export function getFiscalYear(date: Date = new Date()): string {
  return date.getFullYear().toString().slice(-2);
}

/**
 * Formats an invoice number based on sequence number and date.
 * e.g. sequence 1 in 2026 -> "NOVA-FY26-01"
 *      sequence 2 in 2026 -> "NOVA-FY26-02"
 *      sequence 1 in 2027 -> "NOVA-FY27-01"
 */
export function formatInvoiceNumber(sequence: number, date: Date = new Date()): string {
  const fy = getFiscalYear(date);
  const padded = String(Math.max(1, sequence)).padStart(2, "0");
  return `NOVA-FY${fy}-${padded}`;
}

/**
 * Parses an invoice number string to extract FY and sequence number.
 */
export function parseInvoiceNumber(invoiceNumber: string): { fy: string; sequence: number } | null {
  const match = invoiceNumber.match(/^NOVA-FY(\d{2})-(\d+)$/i);
  if (!match) return null;
  return {
    fy: match[1],
    sequence: parseInt(match[2], 10),
  };
}

/**
 * Calculates the next invoice number for the current fiscal year from a list of existing invoice numbers.
 */
export function getNextInvoiceNumberFromList(existingNumbers: string[], date: Date = new Date()): string {
  const currentFy = getFiscalYear(date);
  let maxSeq = 0;

  for (const invNum of existingNumbers) {
    const parsed = parseInvoiceNumber(invNum);
    if (parsed && parsed.fy === currentFy) {
      if (parsed.sequence > maxSeq) {
        maxSeq = parsed.sequence;
      }
    }
  }

  return formatInvoiceNumber(maxSeq + 1, date);
}

/**
 * Queries database to compute the next available invoice number for the current fiscal year.
 */
export async function generateNextInvoiceNumber(prismaClient: any, date: Date = new Date()): Promise<string> {
  const fy = getFiscalYear(date);
  const prefix = `NOVA-FY${fy}-`;

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
