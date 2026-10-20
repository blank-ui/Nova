import tls from "node:tls";

export interface TransactionalEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface AuthEmailInput {
  to: string;
  subject: string;
  url: string;
}

/**
 * Clean & secure email escaping to prevent header injection
 */
function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/**
 * Formats a standard responsive HTML email matching Nova brand guidelines
 */
export function buildNovaEmailHtml({
  subject,
  heading,
  bodyText,
  actionText,
  actionUrl,
  subtext,
  trackingPixelUrl,
}: {
  subject: string;
  heading: string;
  bodyText: string;
  actionText?: string;
  actionUrl?: string;
  subtext?: string;
  trackingPixelUrl?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${sanitizeHeader(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#F6F4EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#101322;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F6F4EE;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e6e5de;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(16,19,34,0.06);">
          <!-- Header Bar -->
          <tr>
            <td style="padding:32px 36px;border-bottom:1px solid #f0eee6;background:#ffffff;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <span style="font-family:'Segoe UI',sans-serif;font-weight:800;font-size:22px;letter-spacing:-0.04em;color:#101322;text-transform:uppercase;">NOVA</span>
                    <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#FFB547;margin-left:4px;vertical-align:middle;"></span>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;color:#727988;font-family:monospace;letter-spacing:0.1em;text-transform:uppercase;">Web Studio</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:36px;background:#ffffff;">
              <h1 style="font-size:24px;font-weight:700;line-height:1.25;letter-spacing:-0.04em;margin:0 0 16px;color:#101322;">
                ${heading}
              </h1>
              <p style="font-size:15px;line-height:1.75;color:#545b6d;margin:0 0 28px;">
                ${bodyText}
              </p>

              ${
                actionUrl && actionText
                  ? `<div style="margin:30px 0;">
                      <a href="${actionUrl}" style="display:inline-block;padding:14px 28px;background:#101322;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;border-radius:99px;box-shadow:0 4px 14px rgba(16,19,34,0.18);">
                        ${actionText} &rarr;
                      </a>
                    </div>
                    <p style="font-size:12px;color:#8991a1;line-height:1.6;margin:24px 0 0;word-break:break-all;">
                      If button doesn't work, copy this URL into your browser:<br />
                      <a href="${actionUrl}" style="color:#6C4CFF;text-decoration:underline;">${actionUrl}</a>
                    </p>`
                  : ""
              }

              ${
                subtext
                  ? `<div style="margin-top:28px;padding-top:20px;border-top:1px solid #f0eee6;font-size:12px;color:#8991a1;line-height:1.6;">
                      ${subtext}
                    </div>`
                  : ""
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 36px;background:#faf9f6;border-top:1px solid #f0eee6;font-size:11px;color:#8991a1;line-height:1.6;">
              Nova is operated on behalf of <strong>All Sky Fares LLC</strong>.<br />
              Inquiries & support: <a href="mailto:nova@allskyfares.com" style="color:#6C4CFF;text-decoration:none;">nova@allskyfares.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  ${
    trackingPixelUrl
      ? `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;border:0;" />`
      : ""
  }
</body>
</html>`;
}

/**
 * Send an email directly via Hostinger SMTP (TLS port 465)
 */
export async function sendSmtpEmail({
  to,
  subject,
  text,
  html,
}: TransactionalEmailOptions): Promise<void> {
  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const fromHeader = process.env.EMAIL_FROM || "Nova <nova@allskyfares.com>";

  if (!user || !pass) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[Nova Dev Email fallback] To: ${to} | Subject: ${subject}\n${text}`);
      return;
    }
    throw new Error("SMTP credentials are not configured");
  }

  const cleanTo = sanitizeHeader(to);
  const cleanSubject = sanitizeHeader(subject);
  const messageId = `<nova.${Date.now()}.${Math.random().toString(36).slice(2)}@allskyfares.com>`;
  const dateStr = new Date().toUTCString();

  const boundary = `====nova_bound_${Date.now()}====`;
  let mimeBody = "";

  if (html) {
    mimeBody = [
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 7bit",
      "",
      text,
      "",
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: 7bit",
      "",
      html,
      "",
      `--${boundary}--`,
    ].join("\r\n");
  } else {
    mimeBody = [
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 7bit",
      "",
      text,
    ].join("\r\n");
  }

  const fullMessage = [
    `From: ${fromHeader}`,
    `To: ${cleanTo}`,
    `Subject: ${cleanSubject}`,
    `Date: ${dateStr}`,
    `Message-ID: ${messageId}`,
    "MIME-Version: 1.0",
    mimeBody,
    ".",
  ].join("\r\n");

  return new Promise((resolve, reject) => {
    let resolved = false;
    const socket = tls.connect(port, host, { minVersion: "TLSv1.2" }, () => {});

    let step = 0;
    const userB64 = Buffer.from(user).toString("base64");
    const passB64 = Buffer.from(pass).toString("base64");

    const cleanupAndReject = (err: Error) => {
      if (!resolved) {
        resolved = true;
        try {
          socket.destroy();
        } catch {}
        reject(err);
      }
    };

    const cleanupAndResolve = () => {
      if (!resolved) {
        resolved = true;
        try {
          socket.write("QUIT\r\n");
          socket.end();
        } catch {}
        resolve();
      }
    };

    socket.on("data", (data) => {
      const msg = data.toString();

      if (msg.startsWith("220") && step === 0) {
        step = 1;
        socket.write("EHLO localhost\r\n");
      } else if (msg.startsWith("250") && (step === 1 || step === 2)) {
        if (step === 1) {
          step = 3;
          socket.write("AUTH LOGIN\r\n");
        }
      } else if (msg.startsWith("334") && step === 3) {
        step = 4;
        socket.write(`${userB64}\r\n`);
      } else if (msg.startsWith("334") && step === 4) {
        step = 5;
        socket.write(`${passB64}\r\n`);
      } else if (msg.startsWith("235") && step === 5) {
        // Authenticated! Now send envelope
        step = 6;
        socket.write(`MAIL FROM:<${user}>\r\n`);
      } else if (msg.startsWith("250") && step === 6) {
        step = 7;
        socket.write(`RCPT TO:<${cleanTo}>\r\n`);
      } else if (msg.startsWith("250") && step === 7) {
        step = 8;
        socket.write("DATA\r\n");
      } else if (msg.startsWith("354") && step === 8) {
        step = 9;
        socket.write(`${fullMessage}\r\n`);
      } else if (msg.startsWith("250") && step === 9) {
        // Mail accepted for delivery!
        cleanupAndResolve();
      } else if (msg.startsWith("4") || msg.startsWith("5")) {
        cleanupAndReject(new Error(`SMTP server responded with error: ${msg.trim()}`));
      }
    });

    socket.on("error", (err) => cleanupAndReject(err));
    setTimeout(() => cleanupAndReject(new Error("SMTP operation timed out (15s)")), 15_000);
  });
}

/**
 * Universal auth email delivery function plugged into Better Auth
 */
export async function sendAuthEmail({ to, subject, url }: AuthEmailInput) {
  // Try Hostinger SMTP first if credentials exist
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const isVerify = subject.toLowerCase().includes("verify");
      const heading = isVerify ? "Verify your email address" : "Reset your password";
      const actionText = isVerify ? "Confirm Email Address" : "Reset Password";
      const bodyText = isVerify
        ? "Thank you for joining Nova. Please confirm your email address to activate your account and start your workspace."
        : "A password reset was requested for your Nova account. Click the secure button below to set a new password.";

      const html = buildNovaEmailHtml({
        subject,
        heading,
        bodyText,
        actionText,
        actionUrl: url,
        subtext: "If you did not request this, you can safely ignore this email.",
      });

      await sendSmtpEmail({
        to,
        subject,
        text: `${subject}\n\nContinue securely: ${url}`,
        html,
      });
      return;
    } catch (err) {
      console.error("[Nova SMTP] Direct delivery error:", err instanceof Error ? err.message : err);
      // Fall through to dev console or error
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(`[Nova dev email] ${subject} for ${to}: ${url}`);
    return;
  }

  throw new Error("Transactional email is not configured");
}

/**
 * Send an initiation email to a newly created user with their setup/password-creation link.
 * Automatically embeds an invisible tracking pixel to record when the user views the invitation.
 */
export async function sendAccountInitiationEmail({
  to,
  name,
  setupUrl,
  userId,
}: {
  to: string;
  name: string;
  setupUrl: string;
  userId?: string;
}) {
  const subject = "Welcome to Nova — Create your profile & access your workspace";
  const heading = `Welcome to Nova, ${name || "there"}`;
  const bodyText =
    "An account has been created for you on the Nova platform by the studio administrator. Click below to create your profile, choose your password, and activate your workspace.";
  const actionText = "Create Profile & Set Password";
  const subtext =
    "This invitation link is intended for you. For security, do not forward this email. If you were not expecting this, please contact support.";

  // Extract token from setupUrl for the tracking pixel
  let trackingPixelUrl: string | undefined;
  try {
    const urlObj = new URL(setupUrl);
    const token = urlObj.searchParams.get("token");
    if (token || userId) {
      const baseOrigin = urlObj.origin;
      const params = new URLSearchParams();
      if (token) params.set("token", token);
      if (userId) params.set("uid", userId);
      trackingPixelUrl = `${baseOrigin}/api/auth/email-track?${params.toString()}`;
    }
  } catch {}

  const html = buildNovaEmailHtml({
    subject,
    heading,
    bodyText,
    actionText,
    actionUrl: setupUrl,
    subtext,
    trackingPixelUrl,
  });

  return sendSmtpEmail({
    to,
    subject,
    text: `${subject}\n\nHi ${name},\n\nAn account has been created for you on Nova. Create your profile and set up your password here:\n${setupUrl}`,
    html,
  });
}

/**
 * Send an administrative password reset notification email
 */
export async function sendAdminPasswordResetNotificationEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  const subject = "Reset your Nova password (Requested by Administrator)";
  const heading = `Password reset for ${name || "your account"}`;
  const bodyText =
    "An administrator has initiated a password reset for your Nova account. Click the button below to choose your new password.";
  const actionText = "Set New Password";
  const subtext =
    "If you have questions about this request, reach out to your Nova studio administrator or nova@allskyfares.com.";

  const html = buildNovaEmailHtml({
    subject,
    heading,
    bodyText,
    actionText,
    actionUrl: resetUrl,
    subtext,
  });

  return sendSmtpEmail({
    to,
    subject,
    text: `${subject}\n\nHi ${name},\n\nAn administrator has requested a password reset for your Nova account. Set your new password here:\n${resetUrl}`,
    html,
  });
}
