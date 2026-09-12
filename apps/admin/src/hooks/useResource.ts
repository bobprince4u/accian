import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import {
  classifyApiFailure,
  describeApiFailure,
  shouldForceLogout,
} from "../services/apiConfig";
import type { ApiFailureKind } from "../services/apiConfig";

export interface ResourceState<T> {
  data: T[];
  loading: boolean;
  error: { kind: ApiFailureKind; message: string } | null;
}

export interface Resource<T> extends ResourceState<T> {
  /** Re-run the fetch. Safe to call from a click handler. */
  retry: () => void;
  /** Apply a local change without refetching (optimistic list updates). */
  patch: (update: (current: T[]) => T[]) => void;
}

/**
 * Loads one API resource, independently of every other resource.
 *
 * The dashboard previously fetched contacts, projects, services and
 * testimonials in a single `Promise.all` inside one `try`. Any one rejection
 * skipped all four `setState` calls, so a single failing endpoint blanked the
 * entire dashboard — and the shared `catch` then logged the admin out, even
 * for a 500 or a dropped connection.
 *
 * Each resource now owns its state, so three can render while the fourth
 * shows a retryable error.
 *
 * @param fetcher must be referentially stable (module-level or `useCallback`)
 * @param resourceName used in the user-facing error message
 * @param onSessionLost called only when the failure is a genuine 401
 */
export function useResource<T>(
  fetcher: () => Promise<T[]>,
  resourceName: string,
  onSessionLost: () => void
): Resource<T> {
  const [state, setState] = useState<ResourceState<T>>({
    data: [],
    loading: true,
    error: null,
  });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Declared and invoked inside the effect, and every `setState` happens
    // after an `await`. Hoisting this into a `useCallback` would make it a
    // synchronous state update in an effect body and trigger cascading
    // renders (react-hooks/set-state-in-effect).
    const run = async () => {
      try {
        const data = await fetcher();
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (error) {
        if (cancelled) return;

        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;
        const kind = classifyApiFailure(status);

        // Never log the response body: it can contain contact records.
        console.error(
          `Failed to load ${resourceName} (status: ${status ?? "none"})`
        );

        if (shouldForceLogout(kind)) onSessionLost();

        setState({
          data: [],
          loading: false,
          error: { kind, message: describeApiFailure(kind, resourceName) },
        });
      }
    };

    void run();

    // A resource that resolves after the user has navigated away must not
    // write to unmounted state.
    return () => {
      cancelled = true;
    };
  }, [fetcher, resourceName, onSessionLost, reloadCount]);

  const retry = useCallback(() => {
    setState({ data: [], loading: true, error: null });
    setReloadCount((n) => n + 1);
  }, []);

  const patch = useCallback((update: (current: T[]) => T[]) => {
    setState((prev) => ({ ...prev, data: update(prev.data) }));
  }, []);

  return { ...state, retry, patch };
}
