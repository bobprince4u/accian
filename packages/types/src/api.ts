/**
 * Response envelopes and pagination.
 *
 * These describe the shapes the ACCIAN API actually returns today. They are
 * not an aspiration: every field here was read off a live handler in
 * `apps/api/src/controllers`, and where handlers disagree, the disagreement is
 * modelled rather than smoothed over.
 */

/** Successful response carrying a single value. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  /** Present on some handlers (create/update/delete confirmations). */
  message?: string;
}

/**
 * Successful list response that reports a count rather than a page.
 *
 * `GET /api/services` uses this: it returns every published service in one
 * response and reports how many came back. It is not paginated.
 */
export interface ApiSuccessList<T> {
  success: true;
  data: T[];
  count: number;
}

/** Page metadata, exactly as the paginated handlers emit it. */
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Successful list response carrying page metadata.
 *
 * Used by `GET /api/testimonials` and `GET /api/projects`.
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: Pagination;
}

/**
 * Failure response.
 *
 * The API answers failures with `success: false` and a human-readable
 * `message`. `errors` appears only where express-validator's array is passed
 * through, and `code` only where a handler sets one deliberately.
 *
 * Provider errors, SQL text and stack traces are never part of this shape.
 */
export interface ApiError {
  success: false;
  message: string;
  errors?: ApiFieldError[];
  code?: string;
}

/** A single field-level validation failure. */
export interface ApiFieldError {
  /** The offending field. express-validator calls this `path`. */
  path?: string;
  msg?: string;
  type?: string;
  location?: string;
  value?: unknown;
}

/** Any response the API can produce for a single-value endpoint. */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Any response a paginated endpoint can produce. */
export type ApiPaginatedResponse<T> = PaginatedResponse<T> | ApiError;

/** Query parameters accepted by the paginated public endpoints. */
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

/**
 * Narrow an envelope to its failure branch.
 *
 * Tests `success === false` rather than the absence of `data`, because a
 * successful list endpoint can legitimately answer with an empty `data` array.
 */
export const isApiError = <T>(
  response: ApiResponse<T> | ApiPaginatedResponse<T>
): response is ApiError => response.success === false;
