/**
 * Shared API contract types for the ACCIAN product.
 *
 * This package is the single source of truth for the shapes that cross the
 * HTTP boundary between `apps/api` and its two clients, `apps/web` and
 * `apps/admin`.
 *
 * Scope, deliberately narrow:
 *
 *   - It describes the API contract, NOT the PostgreSQL schema. Where the two
 *     disagree, the database name is an implementation detail and the mapping
 *     belongs to the API.
 *   - It is framework-agnostic. No Express, Next.js, React, Vite, pg or email
 *     provider types appear here, and nothing in it reads an environment
 *     variable.
 *   - It contains no runtime logic beyond small guards over literal unions.
 *
 * It carries no dependencies, and it is consumable from both module systems:
 * `apps/api` is CommonJS, `apps/web` and `apps/admin` are ESM.
 *
 * TypeScript types are erased at runtime. They are not a substitute for the
 * API's own validation -- the backend stays authoritative.
 */

// The `.js` extensions are required: Node's ESM resolver does not guess them,
// and TypeScript maps a `.js` specifier back to the `.ts` source when
// compiling. Bundlers accept them too, so one spelling works everywhere.

export type {
  ApiSuccess,
  ApiSuccessList,
  Pagination,
  PaginatedResponse,
  ApiError,
  ApiFieldError,
  ApiResponse,
  ApiPaginatedResponse,
  PaginationQuery,
} from "./api.js";
export { isApiError } from "./api.js";

export type {
  Contact,
  ContactStatus,
  ContactSubmission,
  ContactSubmissionResult,
  ContactStatusUpdate,
} from "./contact.js";
export { CONTACT_STATUSES, isContactStatus } from "./contact.js";

export type { Service, ServiceSummary, ServiceInput } from "./service.js";

export type {
  Testimonial,
  TestimonialInput,
  TestimonialProject,
} from "./testimonial.js";

export type {
  Project,
  ProjectSummary,
  ProjectInput,
  ProjectResult,
  ProjectStatus,
} from "./project.js";
export { PROJECT_STATUSES, isProjectStatus } from "./project.js";

export type { DashboardStats } from "./dashboard.js";

export type {
  AdminUser,
  LoginRequest,
  LoginResult,
  RefreshRequest,
  RefreshResult,
} from "./auth.js";
