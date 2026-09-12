/**
 * Shared API contract types for the ACCIAN product.
 *
 * This package is SCAFFOLDING ONLY. It is deliberately empty.
 *
 * Phase 2 is a repository consolidation: it moves three applications into one
 * repository without changing their behaviour. Defining the shared contract is
 * a separate piece of work, because doing it properly means resolving contract
 * disagreements that Phase 2 is not allowed to touch -- the pre-refactor audit
 * recorded, among others:
 *
 *   - `Service` has three separate definitions and none matches the backend.
 *   - `Project` is severely diverged between the admin and the API.
 *   - `DashboardStats` has three of four fields wrong.
 *   - Contact status uses two divergent maps inside the backend itself.
 *
 * Populating this file would therefore require picking a winner for each of
 * those, which changes product behaviour. See docs/accian-integration-audit.md
 * sections 19 and 20, and docs/known-issues.md.
 *
 * The package exists now so that the workspace layout, the root lockfile and
 * the build scripts are already correct when that work starts. No application
 * imports it, and nothing here should be imported until the contract is agreed.
 *
 * The authoritative source for these types should be the database schema, which
 * the API owns: apps/api/src/models/schema.sql.
 */

export {};
