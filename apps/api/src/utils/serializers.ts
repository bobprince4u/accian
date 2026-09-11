/**
 * Response serializers: DATABASE snake_case -> API contract camelCase.
 *
 * Database rows must never become the public API contract directly. Every
 * admin endpoint that previously returned `SELECT *` rows now returns an
 * explicit DTO built here, so the shape the clients consume is defined in one
 * place and cannot drift when a column is added or renamed.
 *
 * Field meanings are taken from the live schema in `src/migrations/init.ts`
 * and from the shapes the admin UI already binds to — nothing is invented.
 */

import { toApiContactStatus, ContactStatus } from "./contactStatus";

type Row = Record<string, any>;

// ─────────────────────────────────────────────────────────────
// Contacts
// ─────────────────────────────────────────────────────────────

export interface ContactDto {
  id: string;
  fullName: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
  hearAbout: string;
  status: ContactStatus;
  createdAt: Date | string;
  lastUpdated: Date | string;
}

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
  createdAt: row.created_at,
  lastUpdated: row.updated_at ?? row.created_at,
});

// ─────────────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────────────

export interface ProjectResult {
  metric: string;
  value: string;
}

export interface ProjectDto {
  id: string;
  title: string;
  slug: string;
  client: string;
  category: string;
  industry: string;
  description: string;
  challenge: string;
  solution: string;
  image: string;
  status: "Published" | "Draft";
  featured: boolean;
  technologies: string[];
  results: ProjectResult[];
  clientCompany: string;
  clientPosition: string;
  testimonial: string;
  orderIndex: number;
  createdAt: Date | string;
  lastUpdated: Date | string;
}

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
  technologies: Array.isArray(row.technology_stack) ? row.technology_stack : [],
  results: parseProjectResults(row.results),
  clientCompany: row.client_company ?? "",
  clientPosition: row.client_position ?? "",
  testimonial: row.testimonial ?? "",
  orderIndex: Number(row.order_index ?? 0),
  createdAt: row.created_at,
  lastUpdated: row.updated_at ?? row.created_at,
});

// ─────────────────────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────────────────────

export interface ServiceDto {
  id: number;
  title: string;
  slug: string;
  icon: string | null;
  shortDescription: string;
  fullDescription: string | null;
  features: string[];
  technologyStack: string[];
  processSteps: string[];
  idealFor: string[];
  orderIndex: number;
  published: boolean;
  createdAt: Date | string;
  updatedAt: Date | string | null;
}

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String) : [];

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
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? null,
});

// ─────────────────────────────────────────────────────────────
// Testimonials
// ─────────────────────────────────────────────────────────────

export interface TestimonialDto {
  id: string;
  name: string;
  position: string;
  company: string;
  message: string;
  rating: number;
  featured: boolean;
  image: string | null;
  createdAt: Date | string;
  project: { id: number; title?: string; slug?: string } | null;
}

export const serializeTestimonial = (row: Row): TestimonialDto => ({
  id: String(row.id),
  name: row.client_name ?? "",
  position: row.client_position ?? "",
  company: row.client_company ?? "",
  message: row.testimonial_text ?? "",
  rating: Number(row.rating ?? 5),
  featured: Boolean(row.featured),
  image: row.image_url ?? null,
  createdAt: row.created_at,
  project: row.project_id
    ? {
        id: Number(row.project_id),
        title: row.project_title,
        slug: row.project_slug,
      }
    : null,
});
