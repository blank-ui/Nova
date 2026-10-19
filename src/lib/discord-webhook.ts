/**
 * Discord Webhook Dispatcher
 * Sends formatted rich embeds to the configured Discord channel
 * on incoming inquiries and operational events.
 */
export async function sendDiscordInquiryNotification(inquiry: {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service: string;
  budget?: string | null;
  message: string;
  referenceUrl?: string | null;
  referenceImage?: string | null;
}): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    const payload = {
      username: "Nova Studio CRM",
      embeds: [
        {
          title: `📬 New Customer Inquiry: ${inquiry.name}`,
          description:
            inquiry.message.length > 1000
              ? inquiry.message.slice(0, 997) + "..."
              : inquiry.message,
          color: 0x6c4cff, // Nova violet (#6C4CFF)
          fields: [
            { name: "Service", value: inquiry.service || "Not specified", inline: true },
            { name: "Budget", value: inquiry.budget || "Not specified", inline: true },
            { name: "Email", value: inquiry.email, inline: true },
            ...(inquiry.phone ? [{ name: "Phone", value: inquiry.phone, inline: true }] : []),
            ...(inquiry.company ? [{ name: "Company", value: inquiry.company, inline: true }] : []),
            ...(inquiry.id ? [{ name: "Reference", value: `\`${inquiry.id}\``, inline: true }] : []),
            ...(inquiry.referenceUrl ? [{ name: "Reference URL", value: inquiry.referenceUrl, inline: false }] : []),
            ...(inquiry.referenceImage ? [{ name: "Reference File", value: inquiry.referenceImage, inline: false }] : []),
          ],
          footer: {
            text: "Nova Studio Operations • All Sky Fares LLC",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (error) {
    console.error("Failed to dispatch Discord webhook notification:", error);
    return false;
  }
}
