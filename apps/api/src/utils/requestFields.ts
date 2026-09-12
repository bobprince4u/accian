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

import { UpdateAllowlist } from "./sqlUpdate";
import { serializeProjectResults } from "./serializers";

const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return Boolean(value);
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((entry) => String(entry));
  if (typeof value === "string" && value.trim() !== "") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

const toNullableText = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const text = String(value);
  return text === "" ? null : text;
};

/** "Published" | "Draft" -> projects.published BOOLEAN */
export const projectStatusToPublished = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return true;
  return value.trim().toLowerCase() !== "draft";
};

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
export const PROJECT_FIELDS: UpdateAllowlist = {
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
  status: { column: "published", transform: projectStatusToPublished },
  featured: { column: "featured", transform: toBoolean },
  technologies: { column: "technology_stack", transform: toStringArray },
  results: { column: "results", transform: serializeProjectResults },
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
export const PROJECT_ACCEPTED_BUT_NOT_PERSISTED = ["completedDate", "id"];

// ─────────────────────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────────────────────

export const SERVICE_FIELDS: UpdateAllowlist = {
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

export const SERVICE_ACCEPTED_BUT_NOT_PERSISTED = ["id", "createdAt"];

// ─────────────────────────────────────────────────────────────
// Testimonials
// ─────────────────────────────────────────────────────────────

/**
 * Canonical field names match what GET /api/admin/testimonials already
 * returns and what TestimonialFormModal submits (`name`, `message`, `image`).
 * The `client*`/`testimonialText`/`imageUrl` aliases are the public read
 * contract's vocabulary and are accepted for compatibility.
 */
export const TESTIMONIAL_FIELDS: UpdateAllowlist = {
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
export const TESTIMONIAL_ACCEPTED_BUT_NOT_PERSISTED = ["createdAt", "id"];

// ─────────────────────────────────────────────────────────────

/** Drop fields that are accepted for compatibility but have no column. */
export const omitFields = (
  payload: unknown,
  fields: string[]
): Record<string, unknown> => {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return {};
  }
  const body = payload as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(body)) {
    if (!fields.includes(key)) result[key] = body[key];
  }
  return result;
};

/** Read a canonical value or any of its accepted aliases from a payload. */
export const readField = (
  body: Record<string, unknown>,
  ...names: string[]
): unknown => {
  for (const name of names) {
    if (body[name] !== undefined && body[name] !== null && body[name] !== "") {
      return body[name];
    }
  }
  return undefined;
};
