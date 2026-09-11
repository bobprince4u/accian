/**
 * Minimal route guard (Phase 1, item 8).
 *
 * **This is a UX layer, not a security boundary.** It only checks that a token
 * string is present in `localStorage`; it does not and cannot validate it. Any
 * user can put an arbitrary string there. Authorisation is enforced by the
 * backend — every protected route sits behind `authenticateToken` and
 * `requireAdmin`, which verify the signature and expiry on every request. An
 * expired or forged token still yields 401/403 from the API, and the client
 * reacts to that rather than trusting what it found locally.
 *
 * Its job is to stop an unauthenticated visitor landing on an empty dashboard
 * that fires four doomed requests.
 */

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { getAccessToken, onSessionEnded } from "../services/apiClient";

export default function RequireAuth({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const location = useLocation();
  const [hasToken, setHasToken] = useState(() => Boolean(getAccessToken()));

  useEffect(() => {
    // The API client announces a session that ended mid-request (a 401 that
    // survived a refresh attempt), which redirects without a full reload.
    return onSessionEnded(() => setHasToken(false));
  }, []);

  if (!hasToken) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}
