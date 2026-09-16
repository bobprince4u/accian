/**
 * The admin app's types.
 *
 * Everything that crosses the HTTP boundary is re-exported from
 * `@accian/types`, the shared API contract, rather than redeclared here.
 * These definitions had drifted: `Project` was missing `slug`, `createdAt`,
 * `clientCompany`, `clientPosition`, `testimonial` and `orderIndex` (all of
 * which the API sends), and declared `completedDate`, which it does not.
 * `Service` marked `id` optional though every response carries one. Re-export
 * means a future contract change breaks the build here instead of silently
 * producing `undefined` at runtime.
 *
 * Only genuinely local shapes are declared below: view state that never
 * leaves the browser.
 *
 * Imports elsewhere in the app keep pointing at `../types`, so this file is
 * the single place the contract enters the admin app.
 */

import type { DashboardStats as ApiDashboardStats } from "@accian/types";

// ── API contract: what the admin endpoints return ─────────────

export type {
  Contact,
  ContactStatus,
  Project,
  ProjectResult,
  ProjectStatus,
  Service,
  Testimonial,
} from "@accian/types";

// ── API contract: what the admin endpoints accept ─────────────

/**
 * Write payloads are deliberately a different type from read models. A form
 * cannot produce `id`, `createdAt` or `lastUpdated` -- those are the
 * database's to assign -- so typing a submission as `Omit<Project, "id">`
 * would require the form to invent them.
 */
export type {
  ProjectInput,
  ServiceInput,
  TestimonialInput,
} from "@accian/types";

// ── Local view state (never sent or received) ─────────────────

/**
 * The counters shown on the dashboard.
 *
 * The field names are pinned to the API's `DashboardStats` so the two cannot
 * drift, but the values are computed in the browser from the already-loaded
 * contact and project lists -- the admin app does not call
 * `GET /api/admin/dashboard/stats`. One consequence of that: the API reports
 * `conversionRate` to one decimal place, while the dashboard rounds to a
 * whole percent.
 */
export type DashboardStats = Pick<
  ApiDashboardStats,
  "totalContacts" | "newInquiries" | "activeProjects" | "conversionRate"
>;

/** Which section of the dashboard is on screen. */
export type ViewType =
  | "dashboard"
  | "contacts"
  | "projects"
  | "testimonials"
  | "services";
