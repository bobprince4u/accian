/**
 * The one HTTP client the admin app uses.
 *
 * Before this, every call was a bare `axios.get(...)` against a production URL
 * written directly into the source, with the token read from `localStorage`
 * and pasted into a header by hand, in 17 places. That meant the production
 * host was compiled into the bundle, a local dev session silently operated on
 * production data, and the refresh and logout endpoints — which exist on the
 * backend — were never called at all, so a session simply died after 15
 * minutes.
 *
 * Session storage note: tokens live in `localStorage`, which is what the
 * existing architecture already did and is readable by any script running on
 * the page. Moving to httpOnly cookies would be a cross-cutting change to the
 * backend's auth design and is out of scope here; the limitation is documented
 * rather than silently accepted.
 */

import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

import { resolveAdminApiBase } from "./apiConfig";

/** Existing key — kept so a signed-in admin is not logged out by this change. */
export const ACCESS_TOKEN_KEY = "adminToken";
export const REFRESH_TOKEN_KEY = "adminRefreshToken";
export const USER_KEY = "adminUser";

export const API_BASE = resolveAdminApiBase({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  DEV: import.meta.env.DEV,
});

// ─────────────────────────────────────────────────────────────
// Session storage
// ─────────────────────────────────────────────────────────────

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const storeSession = (session: {
  accessToken?: string;
  refreshToken?: string;
  user?: unknown;
}): void => {
  if (session.accessToken)
    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  if (session.refreshToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  if (session.user) localStorage.setItem(USER_KEY, JSON.stringify(session.user));
};

export const clearSession = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Lets the router react to a session that ended mid-request without any
 * component having to poll `localStorage`.
 */
const SESSION_ENDED_EVENT = "accian:session-ended";

export const onSessionEnded = (listener: () => void): (() => void) => {
  window.addEventListener(SESSION_ENDED_EVENT, listener);
  return () => window.removeEventListener(SESSION_ENDED_EVENT, listener);
};

const announceSessionEnded = (): void => {
  window.dispatchEvent(new Event(SESSION_ENDED_EVENT));
};

// ─────────────────────────────────────────────────────────────
// Client
// ─────────────────────────────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

/**
 * A separate, interceptor-free instance for the refresh call itself.
 * Refreshing through `apiClient` would re-enter the 401 handler below and
 * recurse when the refresh token is the thing that has expired.
 */
const refreshClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** In-flight refresh, so several parallel 401s trigger exactly one refresh. */
let refreshInFlight: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await refreshClient.post("/refresh", { refreshToken });
    const data = response.data?.data ?? {};

    if (!data.accessToken) return null;

    // The backend rotates the refresh token on every use, so the new one must
    // be stored — keeping the old one would fail the next refresh.
    storeSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return data.accessToken as string;
  } catch {
    // A failed refresh is not an application error: it means the session is
    // over. Deliberately no logging — the response body carries token material.
    return null;
  }
};

interface RetriableRequest extends InternalAxiosRequestConfig {
  _retriedAfterRefresh?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const request = error.config as RetriableRequest | undefined;

    // Only a 401 is a session problem. A 403, 500 or network failure is
    // returned untouched so the caller can show an error and keep the session.
    if (status !== 401 || !request || request._retriedAfterRefresh) {
      return Promise.reject(error);
    }

    request._retriedAfterRefresh = true;

    refreshInFlight = refreshInFlight ?? refreshAccessToken();
    const newToken = await refreshInFlight;
    refreshInFlight = null;

    if (!newToken) {
      clearSession();
      announceSessionEnded();
      return Promise.reject(error);
    }

    request.headers.Authorization = `Bearer ${newToken}`;
    return apiClient(request);
  }
);
