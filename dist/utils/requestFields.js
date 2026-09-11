"use strict";
/**
 * Request DTOs: API contract camelCase -> DATABASE snake_case.
 *
 * Each resource declares exactly which request fields it accepts and which
 * column each one writes. Create and update share the same allowlist, so the
 * two paths cannot diverge, and any field outside the allowlist is rejected
 * rather than silently dropped or interpolated into SQL.
 *
 * `ACCEPTED_BUT_NOT_PERSISTED` lists fields the existing clients send that have
 * no column in the current schema. They are accepted so those clients keep
 * working, and are explicitly discarded rather than silently ignored — adding
 * columns for them would be a schema change made only to fit a payload.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.readField = exports.omitFields = exports.TESTIMONIAL_ACCEPTED_BUT_NOT_PERSISTED = exports.TESTIMONIAL_FIELDS = exports.SERVICE_ACCEPTED_BUT_NOT_PERSISTED = exports.SERVICE_FIELDS = exports.PROJECT_ACCEPTED_BUT_NOT_PERSISTED = exports.PROJECT_FIELDS = exports.projectStatusToPublished = void 0;
const serializers_1 = require("./serializers");
const toBoolean = (value) => {
    if (typeof value === "boolean")
        return value;
    if (typeof value === "string")
        return value.toLowerCase() === "true";
    return Boolean(value);
};
const toStringArray = (value) => {
    if (Array.isArray(value))
        return value.map((entry) => String(entry));
    if (typeof value === "string" && value.trim() !== "") {
        return value
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean);
    }
    return [];
};
const toNullableText = (value) => {
    if (value === null || value === undefined)
        return null;
    const text = String(value);
    return text === "" ? null : text;
};
/** "Published" | "Draft" -> projects.published BOOLEAN */
const projectStatusToPublished = (value) => {
    if (typeof value === "boolean")
        return value;
    if (typeof value !== "string")
        return true;
    return value.trim().toLowerCase() !== "draft";
};
exports.projectStatusToPublished = projectStatusToPublished;
// ─────────────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────────────
/**
 * Canonical field names are the domain names the admin UI uses
 * (`client`, `category`, `image`, `status`, `technologies`).
 * The `*Legacy* ` entries beneath them are the earlier backend vocabulary and
 * are kept so existing callers of POST /api/admin/projects keep working; they
 * write the same columns.
 */
exports.PROJECT_FIELDS = {
    // canonical
    title: { column: "title" },
    slug: { column: "slug" },
    client: { column: "client_name" },
    category: { column: "project_type" },
    industry: { column: "industry" },
    description: { column: "description" },
    challenge: { column: "challenge" },
    solution: { column: "solution" },
    image: { column: "image_url", transform: toNullableText },
    status: { column: "published", transform: exports.projectStatusToPublished },
    featured: { column: "featured", transform: toBoolean },
    technologies: { column: "technology_stack", transform: toStringArray },
    results: { column: "results", transform: serializers_1.serializeProjectResults },
    clientCompany: { column: "client_company" },
    clientPosition: { column: "client_position" },
    testimonial: { column: "testimonial" },
    orderIndex: { column: "order_index" },
    // accepted aliases (earlier backend vocabulary, same columns)
    clientName: { column: "client_name" },
    projectType: { column: "project_type" },
    imageUrl: { column: "image_url", transform: toNullableText },
    published: { column: "published", transform: toBoolean },
    technologyStack: { column: "technology_stack", transform: toStringArray },
};
/**
 * `completedDate` is sent by ProjectFormModal but there is no column for it in
 * the projects table. It is accepted and discarded; see the Phase 1 report.
 */
exports.PROJECT_ACCEPTED_BUT_NOT_PERSISTED = ["completedDate", "id"];
// ─────────────────────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────────────────────
exports.SERVICE_FIELDS = {
    title: { column: "title" },
    slug: { column: "slug" },
    icon: { column: "icon", transform: toNullableText },
    shortDescription: { column: "short_description" },
    fullDescription: { column: "full_description", transform: toNullableText },
    features: { column: "features", transform: toStringArray },
    technologyStack: { column: "technology_stack", transform: toStringArray },
    processSteps: { column: "process_steps", transform: toStringArray },
    idealFor: { column: "ideal_for", transform: toStringArray },
    orderIndex: { column: "order_index" },
    published: { column: "published", transform: toBoolean },
};
exports.SERVICE_ACCEPTED_BUT_NOT_PERSISTED = ["id", "createdAt"];
// ─────────────────────────────────────────────────────────────
// Testimonials
// ─────────────────────────────────────────────────────────────
/**
 * Canonical field names match what GET /api/admin/testimonials already
 * returns and what TestimonialFormModal submits (`name`, `message`, `image`).
 * The `client*`/`testimonialText`/`imageUrl` aliases are the public read
 * contract's vocabulary and are accepted for compatibility.
 */
exports.TESTIMONIAL_FIELDS = {
    // canonical (admin UI vocabulary)
    name: { column: "client_name" },
    position: { column: "client_position", transform: toNullableText },
    company: { column: "client_company", transform: toNullableText },
    message: { column: "testimonial_text" },
    rating: { column: "rating" },
    featured: { column: "featured", transform: toBoolean },
    image: { column: "image_url", transform: toNullableText },
    projectId: { column: "project_id" },
    published: { column: "published", transform: toBoolean },
    // accepted aliases (public read contract vocabulary, same columns)
    clientName: { column: "client_name" },
    clientPosition: { column: "client_position", transform: toNullableText },
    clientCompany: { column: "client_company", transform: toNullableText },
    testimonialText: { column: "testimonial_text" },
    imageUrl: { column: "image_url", transform: toNullableText },
};
/**
 * `createdAt` is sent by TestimonialFormModal but the row's creation time is
 * owned by the database (`created_at DEFAULT CURRENT_TIMESTAMP`), so a client
 * may not set it.
 */
exports.TESTIMONIAL_ACCEPTED_BUT_NOT_PERSISTED = ["createdAt", "id"];
// ─────────────────────────────────────────────────────────────
/** Drop fields that are accepted for compatibility but have no column. */
const omitFields = (payload, fields) => {
    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
        return {};
    }
    const body = payload;
    const result = {};
    for (const key of Object.keys(body)) {
        if (!fields.includes(key))
            result[key] = body[key];
    }
    return result;
};
exports.omitFields = omitFields;
/** Read a canonical value or any of its accepted aliases from a payload. */
const readField = (body, ...names) => {
    for (const name of names) {
        if (body[name] !== undefined && body[name] !== null && body[name] !== "") {
            return body[name];
        }
    }
    return undefined;
};
exports.readField = readField;
