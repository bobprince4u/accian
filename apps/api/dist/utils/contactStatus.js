"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidApiContactStatus = exports.toDbContactStatus = exports.toApiContactStatus = exports.CONTACT_DB_STATUSES = exports.CONTACT_STATUSES = void 0;
exports.CONTACT_STATUSES = [
    "New",
    "Contacted",
    "In Progress",
    "Converted",
    "Closed",
];
exports.CONTACT_DB_STATUSES = [
    "new",
    "contacted",
    "in-progress",
    "converted",
    "closed",
];
/**
 * Collapse any spelling to a comparable key: lowercase, and treat spaces and
 * underscores as hyphens. "In Progress", "in_progress" and "in-progress" all
 * collapse to "in-progress".
 */
const canonicalKey = (value) => value.trim().toLowerCase().replace(/[\s_]+/g, "-");
const KEY_TO_DB = {
    new: "new",
    contacted: "contacted",
    "in-progress": "in-progress",
    converted: "converted",
    closed: "closed",
};
const DB_TO_API = {
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
const toApiContactStatus = (dbStatus) => {
    if (typeof dbStatus !== "string")
        return "New";
    const db = KEY_TO_DB[canonicalKey(dbStatus)];
    return db ? DB_TO_API[db] : "New";
};
exports.toApiContactStatus = toApiContactStatus;
/**
 * API value -> database value. Returns null for anything not in the allowlist
 * so callers can reject the request instead of writing an invalid status.
 */
const toDbContactStatus = (apiStatus) => {
    if (typeof apiStatus !== "string")
        return null;
    return KEY_TO_DB[canonicalKey(apiStatus)] ?? null;
};
exports.toDbContactStatus = toDbContactStatus;
const isValidApiContactStatus = (value) => (0, exports.toDbContactStatus)(value) !== null;
exports.isValidApiContactStatus = isValidApiContactStatus;
