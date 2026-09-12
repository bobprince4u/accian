/**
 * The single source of truth for where the admin app talks to the API, and for
 * how an API failure should be interpreted.
 *
 * Everything here is a pure function that takes its inputs as arguments — in
 * particular it never touches `import.meta.env` directly. That is deliberate:
 * `import.meta.env` only exists under Vite, so keeping the logic pure is what
 * makes it testable under plain `node --test` without adding a test framework.
 * `apiClient.ts` is the one place that supplies the real environment.
 */

/**
 * Where a dev machine talks to when nothing is configured.
 *
 * The previous code hardcoded the production API host in 17 places, so
 * running the admin app locally silently read and wrote **production** data.
 * An unconfigured dev build now targets localhost and fails visibly instead.
 */
export const DEFAULT_DEV_ORIGIN = "http://localhost:2025";

/** Path the backend mounts its admin router on (`app.use("/api/admin", ...)`). */
export const ADMIN_API_PATH = "/api/admin";

export interface ApiEnvironment {
  /** Raw `VITE_API_URL`, if set. */
  VITE_API_URL?: string;
  /** Vite's dev-server flag. */
  DEV: boolean;
}

/**
 * Reduce a configured value to a bare origin.
 *
 * Both conventions existed in the codebase at once — the tracked `.env` holds
 * a bare origin while the dead `adminService.ts`
 * defaulted to an origin *plus* `/api/admin`. Accepting either means an
 * existing deployment keeps working whichever way its variable is written.
 */
const toOrigin = (raw: string): string =>
  raw
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/admin$/, "")
    .replace(/\/+$/, "");

/**
 * Resolve the base URL every admin API call is built from.
 *
 * Throws in a production build when `VITE_API_URL` is absent. A thrown error
 * naming the missing variable is far cheaper to diagnose than a production
 * bundle quietly pointing at `localhost`, which would fail on every request
 * with an opaque network error.
 */
export const resolveAdminApiBase = (env: ApiEnvironment): string => {
  const configured = env.VITE_API_URL?.trim();

  if (configured) return `${toOrigin(configured)}${ADMIN_API_PATH}`;

  if (env.DEV) return `${DEFAULT_DEV_ORIGIN}${ADMIN_API_PATH}`;

  throw new Error(
    "VITE_API_URL is not set. The admin app cannot determine which API to " +
      "call. Set VITE_API_URL to the API origin (for example " +
      "https://api.example.com) before building."
  );
};

// ─────────────────────────────────────────────────────────────
// Failure classification
// ─────────────────────────────────────────────────────────────

/**
 * How a failed request should be treated by the UI.
 *
 * - `auth`      the session is genuinely gone (401 that survived a refresh)
 * - `forbidden` authenticated but not permitted (403) — the session is fine
 * - `client`    a 4xx we caused (400, 404, 409, 422 …)
 * - `server`    the API broke (5xx)
 * - `network`   the request never got an answer (offline, DNS, CORS, timeout)
 */
export type ApiFailureKind =
  | "auth"
  | "forbidden"
  | "client"
  | "server"
  | "network";

export const classifyApiFailure = (status?: number): ApiFailureKind => {
  if (status === undefined) return "network";
  if (status === 401) return "auth";
  if (status === 403) return "forbidden";
  if (status >= 500) return "server";
  return "client";
};

/**
 * Whether a failure justifies destroying the session.
 *
 * Only a 401 does. The dashboard used to call `handleLogout()` from a single
 * `catch` covering *every* error, so one 500 or a dropped connection threw the
 * admin back to the login screen with "Session expired" — while the session was
 * in fact perfectly valid.
 */
export const shouldForceLogout = (kind: ApiFailureKind): boolean =>
  kind === "auth";

/** A short, non-sensitive message for a failure kind. */
export const describeApiFailure = (
  kind: ApiFailureKind,
  resource: string
): string => {
  switch (kind) {
    case "auth":
      return "Your session has expired. Please sign in again.";
    case "forbidden":
      return `You do not have permission to view ${resource}.`;
    case "server":
      return `The server failed while loading ${resource}. Please retry.`;
    case "network":
      return `Could not reach the server to load ${resource}. Check your connection and retry.`;
    case "client":
      return `${resource} could not be loaded.`;
  }
};
