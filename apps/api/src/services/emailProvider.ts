/**
 * Email transport boundary.
 *
 * `emailServices` owns what an email says — templates, placeholder
 * substitution, HTML escaping, `email_logs`. This module owns only how it
 * leaves the process. Keeping the two apart is what made the SendGrid →
 * Resend move a transport swap rather than a rewrite of the email code.
 *
 * Two rules this boundary exists to enforce:
 *
 *  - The provider API key is read here and nowhere else. It is never logged,
 *    never returned, and never placed in an error message.
 *  - Provider errors are translated into a plain `Error` with a redacted
 *    message. The raw provider payload does not travel past this module, so
 *    it cannot reach an API response.
 */

import { Resend } from "resend";

export interface EmailMessage {
  to: string;
  from: { email: string; name: string };
  subject: string;
  html: string;
}

export interface EmailSendResult {
  /** Provider-assigned id, when the provider returns one. */
  messageId?: string;
}

export interface EmailTransport {
  /** Resolves on acceptance; rejects with a redacted `Error` otherwise. */
  send(message: EmailMessage): Promise<EmailSendResult>;
  /** Name for diagnostics. Never includes credentials. */
  readonly name: string;
}

/**
 * Format an address as RFC 5322 `"Display Name" <local@domain>`.
 *
 * The display names are compile-time constants, but quoting and escaping is
 * unconditional so that a future configurable name cannot inject a header.
 */
const formatAddress = (address: { email: string; name: string }): string => {
  const name = address.name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${name}" <${address.email}>`;
};

/**
 * Strip anything credential- or PII-shaped from a provider message before it
 * is logged or stored.
 *
 * Provider errors quote back what they rejected, which for this application
 * means either an API key or a contact's email address. Neither belongs in
 * stdout or in `email_logs.error_message`.
 *
 * Key patterns run first: an API key is matched and removed before the
 * address pattern could claim part of it.
 */
export const redactProviderMessage = (message: string): string =>
  message
    .replace(/\bre_[A-Za-z0-9_-]+/g, "[redacted-api-key]")
    .replace(/\bSG\.[A-Za-z0-9_.-]+/g, "[redacted-api-key]")
    .replace(/\b[Bb]earer\s+\S+/g, "Bearer [redacted]")
    .replace(/[^\s<>"']+@[^\s<>"']+\.[A-Za-z]{2,}/g, "[redacted-email]");

/** Raised when the transport is asked to send without being configured. */
export class EmailNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailNotConfiguredError";
  }
}

/**
 * Resend-backed transport.
 *
 * The client is built on first send rather than at import, so that importing
 * this module — which the test suite does transitively — never constructs a
 * client or reads a key.
 */
class ResendTransport implements EmailTransport {
  readonly name = "resend";

  private client: Resend | null = null;

  private getClient(): Resend {
    if (this.client) {
      return this.client;
    }

    // Belt-and-braces against a test that forgets to install a stub: no live
    // client is ever constructed under NODE_ENV=test, so the suite cannot
    // reach the network even if the environment happens to carry a real key.
    if (process.env.NODE_ENV === "test") {
      throw new EmailNotConfiguredError(
        "Refusing to construct a live email client under NODE_ENV=test"
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new EmailNotConfiguredError(
        "RESEND_API_KEY is not set; email cannot be sent"
      );
    }

    this.client = new Resend(apiKey);
    return this.client;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const client = this.getClient();

    // Resend reports failure in the resolved value rather than by throwing.
    // Converting it to a throw here is what lets the callers keep a single
    // try/catch, exactly as they had with SendGrid.
    const { data, error } = await client.emails.send({
      from: formatAddress(message.from),
      to: message.to,
      subject: message.subject,
      html: message.html,
    });

    if (error) {
      const detail = redactProviderMessage(error.message || "");
      throw new Error(
        `Email provider rejected the message (${error.name})${
          detail ? `: ${detail}` : ""
        }`
      );
    }

    return { messageId: data?.id };
  }
}

let transport: EmailTransport = new ResendTransport();

/** The transport in use. Callers should not cache the result. */
export const getEmailTransport = (): EmailTransport => transport;

/**
 * Swap the transport. Intended for tests, which use it to assert on what
 * would have been sent without sending anything.
 */
export const setEmailTransport = (next: EmailTransport): EmailTransport => {
  const previous = transport;
  transport = next;
  return previous;
};

/** Restore the real transport. */
export const resetEmailTransport = (): void => {
  transport = new ResendTransport();
};
