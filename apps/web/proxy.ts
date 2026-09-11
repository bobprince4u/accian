/**
 * Server-side gate for `/internal/*`.
 *
 * ## What was wrong
 *
 * The internal quote builder was "protected" by a password compared in the
 * browser (`app/internal/quote-builder/page.tsx`). Two separate problems:
 *
 * 1. The password was a literal in a client component, so it was compiled into
 *    a public JavaScript chunk under `/_next/static/`. Anyone could read it
 *    with devtools or `curl`, and it is committed in Git history — so it must
 *    be treated as disclosed and **rotated**.
 * 2. Even with a secret password, the check ran *after* the page had already
 *    been sent to the browser. The gate only hid the UI; it never withheld the
 *    page. Setting `authed` in devtools bypassed it entirely.
 *
 * `netlify.toml` also carries a `conditions = {Role = ["admin"]}` redirect for
 * `/internal/*`, but that only enforces anything when Netlify Identity is
 * provisioned with role claims. That cannot be confirmed from this repository,
 * so it is not relied upon here.
 *
 * ## What this does
 *
 * Withholds the response until HTTP Basic credentials match
 * `INTERNAL_AREA_USER` / `INTERNAL_AREA_PASSWORD`, which are read on the
 * server and never sent to the browser. The page is no longer served at all to
 * an unauthenticated request.
 *
 * **Fails closed**: if the environment variables are not configured, every
 * request to `/internal/*` is refused rather than allowed through. That is the
 * safe direction — the alternative would quietly publish the page.
 *
 * Basic Auth is chosen because it needs no session store, no login route and
 * no token handling, and it is enforced before any application code runs. It
 * is transmitted on every request, so it relies on HTTPS — which
 * `netlify.toml` already forces via HSTS and an http→https redirect.
 */

import type { NextRequest } from "next/server";

const REALM = 'Basic realm="ACCIAN Internal", charset="UTF-8"';

const deny = (): Response =>
  new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": REALM,
      // Never let a proxy or CDN cache a gated response.
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });

const unavailable = (): Response =>
  new Response(
    "This area is not configured. Set INTERNAL_AREA_USER and " +
      "INTERNAL_AREA_PASSWORD to enable it.",
    {
      status: 503,
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
    }
  );

/**
 * Length-independent comparison, so a response time cannot be used to learn
 * the expected value one character at a time.
 */
const timingSafeEqual = (a: string, b: string): boolean => {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);

  // Compare a fixed number of bytes regardless of input length.
  let mismatch = left.length === right.length ? 0 : 1;
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i += 1) {
    mismatch |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }

  return mismatch === 0;
};

const decodeBasic = (
  header: string | null
): { user: string; password: string } | null => {
  if (!header?.startsWith("Basic ")) return null;

  try {
    const decoded = atob(header.slice("Basic ".length).trim());
    const separator = decoded.indexOf(":");
    if (separator === -1) return null;

    return {
      user: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    // Malformed base64 — treat as no credentials rather than a server error.
    return null;
  }
};

export function proxy(request: NextRequest): Response | undefined {
  const expectedUser = process.env.INTERNAL_AREA_USER;
  const expectedPassword = process.env.INTERNAL_AREA_PASSWORD;

  if (!expectedUser || !expectedPassword) return unavailable();

  const credentials = decodeBasic(request.headers.get("authorization"));
  if (!credentials) return deny();

  // Both comparisons always run, so the failure reason is not observable.
  const userMatches = timingSafeEqual(credentials.user, expectedUser);
  const passwordMatches = timingSafeEqual(
    credentials.password,
    expectedPassword
  );

  if (!userMatches || !passwordMatches) return deny();

  // Authenticated — fall through to the route.
  return undefined;
}

export const config = {
  matcher: "/internal/:path*",
};
