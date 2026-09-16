/**
 * Project contract.
 *
 * `results` is the field the audit flagged. The database column is TEXT, and
 * the admin UI models it as labelled pairs. The conversion belongs to the API:
 * clients send and receive `ProjectResult[]`, and the API is responsible for
 * storing it and for tolerating rows written before that convention existed.
 */

/** Project publication state as the API expresses it. */
export const PROJECT_STATUSES = ["Published", "Draft"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const isProjectStatus = (value: unknown): value is ProjectStatus =>
  typeof value === "string" &&
  (PROJECT_STATUSES as readonly string[]).includes(value);

/** One measured outcome, e.g. `{ metric: "Latency", value: "-40%" }`. */
export interface ProjectResult {
  metric: string;
  value: string;
}

/**
 * A project as `GET /api/projects` returns it.
 *
 * The public list omits the long-form case-study fields and the client
 * attribution; `GET /api/projects/:slug` adds them.
 */
export interface ProjectSummary {
  id: string;
  title: string;
  slug: string;
  industry: string;
  /** What kind of engagement it was. Database column: `project_type`. */
  category: string;
  description: string;
  /** Database column: `technology_stack`. */
  technologies: string[];
  results: ProjectResult[];
  /** Database column: `image_url`. */
  image: string;
  featured: boolean;
  createdAt: string;
}

/** A project as the detail and admin endpoints return it. */
export interface Project extends ProjectSummary {
  /** Database column: `client_name`. */
  client: string;
  challenge: string;
  solution: string;
  status: ProjectStatus;
  clientCompany: string;
  clientPosition: string;
  testimonial: string;
  orderIndex: number;
  lastUpdated: string;
}

/** Body accepted when creating or updating a project. */
export interface ProjectInput {
  title: string;
  slug?: string;
  client?: string;
  category?: string;
  industry?: string;
  description?: string;
  challenge?: string;
  solution?: string;
  image?: string;
  status?: ProjectStatus;
  featured?: boolean;
  technologies?: string[];
  results?: ProjectResult[];
  clientCompany?: string;
  clientPosition?: string;
  testimonial?: string;
  orderIndex?: number;
}
