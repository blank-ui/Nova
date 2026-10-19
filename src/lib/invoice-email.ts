import { sendSmtpEmail, buildNovaEmailHtml } from "./auth-email";

export interface SendInvoiceEmailParams {
  to: string;
  clientName: string;
  projectName: string;
  invoiceNumber: string;
  amount: number;
  currency?: string;
  issuedAt: Date | string;
  customNote?: string;
  senderName?: string;
}

export async function sendInvoiceEmail({
  to,
  clientName,
  projectName,
  invoiceNumber,
  amount,
  currency = "USD",
  issuedAt,
  customNote,
  senderName = "Nova Finance Operations",
}: SendInvoiceEmailParams): Promise<{ success: boolean; error?: string }> {
  const formattedDate = new Date(issuedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);

  const subject = `[Official Invoice Settled] ${invoiceNumber} — ${projectName}`;

  const bodyParagraphs = [
    `Dear ${clientName || "Valued Client"},`,
    "",
    `Your official commercial invoice ${invoiceNumber} for project "${projectName}" has been recorded and marked as PAID / SETTLED.`,
    "",
    `Invoice Number: ${invoiceNumber}`,
    `Billing Statement Date: ${formattedDate}`,
    `Total Settled: ${formattedAmount} ${currency}`,
    `Payment Status: PAID / SETTLED (Milestone Delivery Agreement)`,
    customNote ? `\nCommercial Note:\n"${customNote}"\n` : "",
    "You may access and download your complete itemized PDF statements directly from your Nova Client Portal.",
    "",
    "Thank you for your ongoing partnership with Nova Studio.",
  ].filter(Boolean).join("\n");

  const emailHtml = buildNovaEmailHtml({
    subject,
    heading: `Invoice Settled: ${invoiceNumber}`,
    bodyText: bodyParagraphs,
    actionText: "View Your Client Workspace",
    actionUrl: "https://nova.allskyfares.com/portal/projects",
    subtext: `Issued on behalf of All Sky Fares LLC by ${senderName}. Inquiries: billing@allskyfares.com`,
  });

  try {
    await sendSmtpEmail({
      to,
      subject,
      text: bodyParagraphs,
      html: emailHtml,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to deliver invoice email" };
  }
}
