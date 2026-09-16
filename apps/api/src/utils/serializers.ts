/**
 * Response serializers: DATABASE snake_case -> API contract camelCase.
 *
 * Database rows must never become the public API contract directly. Every
 * endpoint that previously returned `SELECT *` rows, or hand-built an object
 * literal inline, now returns an explicit DTO built here, so the shape the
 * clients consume is defined in one place and cannot drift when a column is
 * added or renamed.
 *
 * The DTO types are imported from `@accian/types`, the shared contract package.
 * They are imported as `import type`, which TypeScript erases at compile time:
 * this file compiles against the contract but the emitted JavaScript carries no
 * `require("@accian/types")`. That matters because the API's hosting root is
 * `apps/api` (see docs/deployment.md §5), where a workspace symlink is not
 * guaranteed to exist -- a runtime dependency would pass every local check and
 * then fail in production.
 *
 * Field meanings are taken from the live schema in `src/migrations/init.ts`
 * and from the shapes the clients already bind to -- nothing is invented.
 */

import type {
  AdminUser,
  Contact,
  Project,
  ProjectResult,
  ProjectSummary,
  Service,
  ServiceSummary,
  Testimonial,
} from "@accian/types";
import { toApiContactStatus } from "./contactStatus";

type Row = Record<string, any>;

/**
 * The DTO names this module has always exported, now defined by the shared
 * contract rather than restated here. Keeping the aliases means every existing
 * import keeps working and the contract has exactly one definition.
 */
export type ContactDto = Contact;
export type ProjectDto = Project;
export type ProjectSummaryDto = ProjectSummary;
export type ServiceDto = Service;
export type ServiceSummaryDto = ServiceSummary;
export type TestimonialDto = Testimonial;
export type AdminUserDto = AdminUser;
export type { ProjectResult };

/**
 * Timestamps as the contract states them: strings.
 *
 * `pg` returns `TIMESTAMP` columns as `Date`, and `res.json()` would convert
 * those to ISO strings anyway -- so this changes nothing on the wire. What it
 * changes is honesty: the DTO type now says `string` and the value is a
 * string, instead of the type claiming one thing while the object holds
 * another until Express happens to serialise it.
 *
 * A value that is already a string is passed through untouched rather than
 * reparsed, which preserves whatever precision the database sent.
 */
const toIsoString = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return "";
};

/** As `toIsoString`, for columns the contract declares nullable. */
const toIsoStringOrNull = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  return toIsoString(value);
};

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String) : [];

// ─────────────────────────────────────────────────────────────
// Contacts
// ─────────────────────────────────────────────────────────────

export const serializeContact = (row: Row): ContactDto => ({
  id: String(row.id),
  fullName: row.full_name ?? "",
  email: row.email ?? "",
  company: row.company_name ?? "",
  phone: row.phone ?? "",
  service: row.service_interest ?? "",
  budget: row.project_budget ?? "",
  timeline: row.project_timeline ?? "",
  message: row.message ?? "",
  hearAbout: row.how_heard ?? "",
  status: toApiContactStatus(row.status),
  createdAt: toIsoString(row.created_at),
  lastUpdated: toIsoString(row.updated_at ?? row.created_at),
});

// ─────────────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────────────

/**
 * `projects.results` is a TEXT column. The admin UI models it as an array of
 * {metric, value} pairs, so structured values are stored as JSON. Rows written
 * before that (or by hand) hold free text; those are surfaced as a single
 * unlabelled entry rather than being dropped, so no stored data is lost.
 */
export const parseProjectResults = (value: unknown): ProjectResult[] => {
  if (value === null || value === undefined || value === "") return [];

  if (Array.isArray(value)) {
    return value
      .filter((entry) => entry && typeof entry === "object")
      .map((entry) => ({
        metric: String((entry as Row).metric ?? ""),
        value: String((entry as Row).value ?? ""),
      }));
  }

  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parseProjectResults(parsed);
  } catch {
    // Not JSON — fall through and preserve it as free text.
  }

  return [{ metric: "", value }];
};

/** Inverse of `parseProjectResults`, for the TEXT column. */
export const serializeProjectResults = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return JSON.stringify(value);
  return String(value);
};

export const serializeProject = (row: Row): ProjectDto => ({
  id: String(row.id),
  title: row.title ?? "",
  slug: row.slug ?? "",
  client: row.client_name ?? "",
  category: row.project_type ?? "",
  industry: row.industry ?? "",
  description: row.description ?? "",
  challenge: row.challenge ?? "",
  solution: row.solution ?? "",
  image: row.image_url ?? "",
  status: row.published === false ? "Draft" : "Published",
  featured: Boolean(row.featured),
  technologies: asStringArray(row.technology_stack),
  results: parseProjectResults(row.results),
  clientCompany: row.client_company ?? "",
  clientPosition: row.client_position ?? "",
  testimonial: row.testimonial ?? "",
  orderIndex: Number(row.order_index ?? 0),
  createdAt: toIsoString(row.created_at),
  lastUpdated: toIsoString(row.updated_at ?? row.created_at),
});

/**
 * The lighter shape `GET /api/projects` returns.
 *
 * Derived from `serializeProject` by selecting fields rather than by mapping
 * the row a second time, so the list and detail endpoints cannot disagree
 * about what a field means. The list query selects fewer columns; the omitted
 * ones are the long-form case-study fields and the client attribution.
 */
export const serializeProjectSummary = (row: Row): ProjectSummaryDto => {
  const project = serializeProject(row);
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    industry: project.industry,
    category: project.category,
    description: project.description,
    technologies: project.technologies,
    results: project.results,
    image: project.image,
    featured: project.featured,
    createdAt: project.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────────────────────

export const serializeService = (row: Row): ServiceDto => ({
  id: Number(row.id),
  title: row.title ?? "",
  slug: row.slug ?? "",
  icon: row.icon ?? null,
  shortDescription: row.short_description ?? "",
  fullDescription: row.full_description ?? null,
  features: asStringArray(row.features),
  technologyStack: asStringArray(row.technology_stack),
  processSteps: asStringArray(row.process_steps),
  idealFor: asStringArray(row.ideal_for),
  orderIndex: Number(row.order_index ?? 0),
  published: row.published !== false,
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoStringOrNull(row.updated_at),
});

/**
 * The lighter shape `GET /api/services` returns.
 *
 * As with projects, this selects from the full DTO rather than re-mapping the
 * row. The list query does not select the long-form columns, so returning the
 * full DTO there would answer with `fullDescription: null` and empty arrays --
 * fields that look like real absent data but are really unselected columns.
 */
export const serializeServiceSummary = (row: Row): ServiceSummaryDto => {
  const service = serializeService(row);
  return {
    id: service.id,
    title: service.title,
    slug: service.slug,
    icon: service.icon,
    shortDescription: service.shortDescription,
    features: service.features,
    orderIndex: service.orderIndex,
    published: service.published,
    createdAt: service.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Testimonials
// ─────────────────────────────────────────────────────────────

export const serializeTestimonial = (row: Row): TestimonialDto => ({
  id: String(row.id),
  name: row.client_name ?? "",
  position: row.client_position ?? "",
  company: row.client_company ?? "",
  message: row.testimonial_text ?? "",
  rating: Number(row.rating ?? 5),
  featured: Boolean(row.featured),
  image: row.image_url ?? null,
  createdAt: toIsoString(row.created_at),
  project: row.project_id
    ? {
        id: Number(row.project_id),
        title: row.project_title,
        slug: row.project_slug,
      }
    : null,
});

// ─────────────────────────────────────────────────────────────
// Admin users
// ─────────────────────────────────────────────────────────────

/**
 * The administrator as the API describes them.
 *
 * `password_hash` is not selected by any caller and is not mapped here, so it
 * cannot reach a response even if a future query starts selecting it. The
 * `username` column is deliberately omitted: it is part of the signup request,
 * not part of the user contract, and no client reads it back.
 */
export const serializeAdminUser = (row: Row): AdminUserDto => ({
  id: String(row.id),
  email: row.email ?? "",
  fullName: row.full_name ?? "",
  role: row.role ?? "",
});
