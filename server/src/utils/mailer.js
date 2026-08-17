import nodemailer from "nodemailer";

let cachedTransporter = null;

/**
 * Returns a configured SMTP transporter, or null when no SMTP_URL is set.
 *
 * SMTP_URL is a standard connection string, so any provider works without a
 * code change, e.g.
 *   smtps://apikey:SG.xxxx@smtp.sendgrid.net:465
 *   smtps://resend:re_xxxx@smtp.resend.com:465
 */
function getTransporter() {
  if (!process.env.SMTP_URL) return null;
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport(process.env.SMTP_URL);
  }
  return cachedTransporter;
}

export function isMailConfigured() {
  return Boolean(process.env.SMTP_URL);
}

/**
 * Sends the password-reset link.
 *
 * With no SMTP_URL configured the link is written to the server log instead, so the
 * flow is exercisable in local development without an email provider. The link is
 * never returned to the caller — putting it in the HTTP response would let anyone
 * who can hit the endpoint reset the admin's password.
 */
export async function sendPasswordResetEmail({ to, resetUrl, expiresInMinutes }) {
  const subject = "Reset your Football Club admin password";

  const text = [
    "A password reset was requested for this Football Club admin account.",
    "",
    "Open the link below to choose a new password:",
    resetUrl,
    "",
    `The link expires in ${expiresInMinutes} minutes and can only be used once.`,
    "If you didn't request this, no action is needed — your password is unchanged.",
  ].join("\n");

  const html = `
    <p>A password reset was requested for this Football Club admin account.</p>
    <p><a href="${resetUrl}">Choose a new password</a></p>
    <p>Or paste this into your browser:<br><code>${resetUrl}</code></p>
    <p>The link expires in ${expiresInMinutes} minutes and can only be used once.<br>
       If you didn't request this, no action is needed — your password is unchanged.</p>
  `;

  const transporter = getTransporter();

  if (!transporter) {
    console.log(
      [
        "",
        "─".repeat(72),
        "  SMTP_URL is not set — password reset email was NOT sent.",
        `  Recipient:   ${to}`,
        `  Reset link:  ${resetUrl}`,
        `  Expires in:  ${expiresInMinutes} minutes`,
        "─".repeat(72),
        "",
      ].join("\n"),
    );
    return { delivered: false };
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || "Football Club <no-reply@footballclub.demo>",
    to,
    subject,
    text,
    html,
  });

  return { delivered: true };
}
