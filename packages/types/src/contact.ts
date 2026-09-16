/**
 * Contact contract.
 *
 * The API vocabulary is the title-cased form; the database stores a
 * lowercase hyphenated form. That mapping lives in the API
 * (`apps/api/src/utils/contactStatus.ts`) and is deliberately not exposed
 * here -- a client never sees or sends a database value.
 */

/**
 * Contact status as it appears in the API.
 *
 * A runtime array rather than a TypeScript `enum` so it can be iterated and
 * validated at runtime, which a type alone cannot do.
 */
export const CONTACT_STATUSES = [
  "New",
  "Contacted",
  "In Progress",
  "Converted",
  "Closed",
] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];

/** Runtime guard for a value arriving from outside the process. */
export const isContactStatus = (value: unknown): value is ContactStatus =>
  typeof value === "string" &&
  (CONTACT_STATUSES as readonly string[]).includes(value);

/**
 * A contact as the admin API returns it.
 *
 * Dates are serialised by `JSON.stringify` on the way out, so a client always
 * receives strings; the API's own DTO type permits `Date` before that point.
 */
export interface Contact {
  id: string;
  fullName: string;
  email: string;
  company: string;
  phone: string;
  /** Which service the enquiry is about. */
  service: string;
  budget: string;
  timeline: string;
  message: string;
  /** How the contact heard about ACCIAN. */
  hearAbout: string;
  status: ContactStatus;
  createdAt: string;
  lastUpdated: string;
}

/**
 * The public contact-form submission body (`POST /api/contact`).
 *
 * These are the field names the form posts today. The API maps them onto
 * database columns internally.
 */
export interface ContactSubmission {
  fullName: string;
  email: string;
  companyName?: string;
  phone?: string;
  serviceInterest: string;
  projectBudget?: string;
  projectTimeline?: string;
  message: string;
  howHeard?: string;
}

/** What `POST /api/contact` returns inside its success envelope. */
export interface ContactSubmissionResult {
  referenceNumber: string;
  timestamp: string;
}

/** Body accepted by `PATCH /api/admin/contacts/:id`. */
export interface ContactStatusUpdate {
  status: ContactStatus;
}
