import fs from "fs/promises";
import path from "path";
import { query } from "../config/database";
import {
  EmailMessage,
  getEmailTransport,
  redactProviderMessage,
} from "./emailProvider";

interface UserConfirmationData {
  to: string;
  fullName: string;
  serviceInterest: string;
  referenceNumber: string;
}

interface AdminNotificationData {
  fullName: string;
  companyName?: string;
  email: string;
  phone?: string;
  serviceInterest: string;
  projectBudget?: string;
  projectTimeline?: string;
  message: string;
  howHeard?: string;
  referenceNumber: string;
  timestamp: string | number;
  id?: number;
}

/**
 * Sender identity, read at send time rather than at import.
 *
 * `RESEND_FROM_EMAIL` is the Phase 3 name. `SENDGRID_FROM_EMAIL` and
 * `EMAIL_USER` remain as fallbacks so that an environment still carrying the
 * previous provider's variable names keeps sending from the right address
 * while they are renamed. A deployment that swapped only its API key would
 * otherwise fall back silently to the hardcoded default. Both fallbacks are
 * deprecated — see docs/deployment.md.
 */
const fromEmail = (): string =>
  process.env.RESEND_FROM_EMAIL ||
  process.env.SENDGRID_FROM_EMAIL ||
  process.env.EMAIL_USER ||
  "noreply@accian.co.uk";

const adminEmail = (): string | undefined => process.env.ADMIN_EMAIL;

// Startup diagnostic only, and presence only — the key is read inside the
// transport at send time and is never held, logged or returned by this module.
if (process.env.RESEND_API_KEY) {
  console.log("✅ Email provider configured (resend)");
  console.log(`📧 From Email: ${fromEmail()}`);
} else if (process.env.NODE_ENV !== "test") {
  console.error("❌ RESEND_API_KEY not found in environment variables");
}

if (process.env.SENDGRID_FROM_EMAIL && !process.env.RESEND_FROM_EMAIL) {
  console.warn(
    "⚠️  SENDGRID_FROM_EMAIL is deprecated; rename it to RESEND_FROM_EMAIL"
  );
}

// Load email template
const loadTemplate = async (templateName: string): Promise<string> => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/emailTemplates",
      `${templateName}.html`
    );
    const template = await fs.readFile(templatePath, "utf-8");
    return template;
  } catch (error: unknown) {
    console.error(
      `Error loading template ${templateName}:`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Escape a value for interpolation into an HTML template.
 *
 * Template data comes from the public contact form, so it is untrusted: a
 * name or message containing markup would otherwise be injected verbatim into
 * the HTML email sent to the admin.
 */
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Replace placeholders in template
const replacePlaceholders = (
  template: string,
  data: Record<string, string | number | undefined>
): string =>
  // Driven by the template rather than by `Object.keys(data)`. Previously a
  // placeholder with no corresponding data key was never visited, so it
  // survived verbatim: `{{id}}` was passed by no caller and appeared literally
  // inside the admin notification's "View in Admin Panel" href.
  //
  // A single pass also means a value can never be re-scanned: user input
  // containing `{{email}}` is now left alone instead of being substituted by a
  // later key's pass.
  //
  // The replacement is a function because `$&` and `$1` are special in a
  // replacement string, and user input legitimately contains `$`.
  template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key: string) =>
    escapeHtml(String(data[key] ?? ""))
  );

// Log email to database
const logEmail = async (
  emailType: string,
  recipientEmail: string | undefined,
  subject: string,
  status: "sent" | "failed",
  errorMessage: string | null = null
): Promise<void> => {
  try {
    await query(
      `INSERT INTO email_logs (email_type, recipient_email, subject, status, error_message, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [emailType, recipientEmail, subject, status, errorMessage, new Date()]
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Failed to log email:", errorMsg);
  }
};

// Send user confirmation email
export const sendUserConfirmation = async (
  data: UserConfirmationData
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Correlated by reference number rather than recipient address: the
    // address adds nothing here that `email_logs.recipient_email` does not
    // already record deliberately, and stdout is the wrong place for it.
    console.log(`📤 Sending confirmation email (ref ${data.referenceNumber})...`);

    const template = await loadTemplate("userConfirmation");
    const html = replacePlaceholders(template, {
      fullName: data.fullName,
      serviceInterest: data.serviceInterest,
      referenceNumber: data.referenceNumber,
    });

    const msg: EmailMessage = {
      to: data.to,
      from: {
        email: fromEmail(),
        name: "ACCIAN Limited",
      },
      subject: "Thank you for contacting ACCIAN Limited",
      html: html,
    };

    const { messageId } = await getEmailTransport().send(msg);

    await logEmail("user_confirmation", data.to, msg.subject, "sent");
    console.log(`✅ Confirmation email sent (ref ${data.referenceNumber})`);
    console.log(`📬 Message ID: ${messageId}`);

    return { success: true, messageId: messageId };
  } catch (error: unknown) {
    // Redacted at the boundary: a provider message can quote back the
    // address it rejected, and this string is both logged and stored in
    // `email_logs.error_message`.
    const errorMessage = redactProviderMessage(
      error instanceof Error ? error.message : String(error)
    );
    console.error("❌ Failed to send user confirmation email:", errorMessage);

    await logEmail(
      "user_confirmation",
      data.to,
      "Confirmation Email",
      "failed",
      errorMessage
    );

    return { success: false, error: errorMessage };
  }
};

// Send admin notification email
export const sendAdminNotification = async (
  data: AdminNotificationData
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    console.log(`📤 Attempting to send admin notification...`);

    const template = await loadTemplate("adminNotification");
    const html = replacePlaceholders(template, {
      ...data,
      // "UK/England/wales" is not an IANA timezone: toLocaleString threw a
      // RangeError here, so every admin notification failed before it was
      // ever sent. The UK zone is "Europe/London".
      timestamp: new Date(data.timestamp).toLocaleString("en-GB", {
        timeZone: "Europe/London",
        dateStyle: "full",
        timeStyle: "long",
      }),
    });

    // Previously `to` was `ADMIN_EMAIL` unchecked, so a missing variable
    // handed the provider an undefined recipient and the failure surfaced as
    // a provider error. Failing here names the actual cause.
    const recipient = adminEmail();
    if (!recipient) {
      throw new Error("ADMIN_EMAIL is not set; admin notification not sent");
    }

    const msg: EmailMessage = {
      to: recipient,
      from: {
        email: fromEmail(),
        name: "ACCIAN Contact Form",
      },
      subject: `🔔 New Contact Form Submission - ${data.referenceNumber}`,
      html: html,
    };

    const { messageId } = await getEmailTransport().send(msg);

    await logEmail("admin_notification", recipient, msg.subject, "sent");

    console.log(` Admin notification email sent`);
    console.log(`📬 Message ID: ${messageId}`);

    return { success: true, messageId: messageId };
  } catch (error: unknown) {
    const errorMessage = redactProviderMessage(
      error instanceof Error ? error.message : String(error)
    );
    console.error(" Failed to send admin notification email:", errorMessage);

    await logEmail(
      "admin_notification",
      adminEmail() || "",
      "Admin Notification",
      "failed",
      errorMessage
    );

    return { success: false, error: errorMessage };
  }
};
