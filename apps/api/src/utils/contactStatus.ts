/**
 * Canonical contact-status representation.
 *
 * There are two vocabularies in play:
 *   - API / admin UI : "New" | "Contacted" | "In Progress" | "Converted" | "Closed"
 *   - Database       : "new" | "contacted" | "in-progress" | "converted" | "closed"
 *
 * The database vocabulary is the hyphenated form because that is what
 * `updateContactStatus` has always written, so existing rows already use it.
 * Reads stay tolerant of the underscore form ("in_progress") that an older
 * read-side mapper expected, so legacy rows keep working without a rewrite.
 *
 * This module is the single source of truth: every read and every write must
 * go through it so list, detail and update responses cannot drift apart.
 */

export const CONTACT_STATUSES = [
  "New",
  "Contacted",
  "In Progress",
  "Converted",
  "Closed",
] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const CONTACT_DB_STATUSES = [
  "new",
  "contacted",
  "in-progress",
  "converted",
  "closed",
] as const;

export type ContactDbStatus = (typeof CONTACT_DB_STATUSES)[number];

/**
 * Collapse any spelling to a comparable key: lowercase, and treat spaces and
 * underscores as hyphens. "In Progress", "in_progress" and "in-progress" all
 * collapse to "in-progress".
 */
const canonicalKey = (value: string): string =>
  value.trim().toLowerCase().replace(/[\s_]+/g, "-");

const KEY_TO_DB: Record<string, ContactDbStatus> = {
  new: "new",
  contacted: "contacted",
  "in-progress": "in-progress",
  converted: "converted",
  closed: "closed",
};

const DB_TO_API: Record<ContactDbStatus, ContactStatus> = {
  new: "New",
  contacted: "Contacted",
  "in-progress": "In Progress",
  converted: "Converted",
  closed: "Closed",
};

/**
 * Database value -> API value. Unknown/missing values fall back to "New",
 * which preserves the previous read behaviour for unexpected rows.
 */
export const toApiContactStatus = (dbStatus: unknown): ContactStatus => {
  if (typeof dbStatus !== "string") return "New";
  const db = KEY_TO_DB[canonicalKey(dbStatus)];
  return db ? DB_TO_API[db] : "New";
};

/**
 * API value -> database value. Returns null for anything not in the allowlist
 * so callers can reject the request instead of writing an invalid status.
 */
export const toDbContactStatus = (
  apiStatus: unknown
): ContactDbStatus | null => {
  if (typeof apiStatus !== "string") return null;
  return KEY_TO_DB[canonicalKey(apiStatus)] ?? null;
};

export const isValidApiContactStatus = (
  value: unknown
): value is ContactStatus => toDbContactStatus(value) !== null;
