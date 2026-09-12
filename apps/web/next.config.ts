import type { NextConfig } from "next";

/**
 * Response headers are NOT configured here.
 *
 * This file used to declare a `headers()` block that set a Content-Security-
 * Policy, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and
 * Permissions-Policy — all of which `netlify.toml` also declared. The two
 * copies had drifted apart:
 *
 *   - HSTS max-age was 31536000 here and 63072000 in netlify.toml.
 *   - The CSP here allowed `frame-src https://www.google.com` and
 *     `connect-src ws: wss:`; netlify.toml's did not, and instead carried
 *     `base-uri`, `object-src`, `form-action`, `frame-ancestors` and
 *     `upgrade-insecure-requests`, which this one omitted.
 *
 * When both are present a browser enforces every CSP header it receives and
 * takes the intersection, so the policy actually in force matched neither
 * file and could not be reasoned about from either one.
 *
 * `netlify.toml` is now the single source of truth. It is the layer that
 * applies uniformly to static assets and to SSR function responses, and it is
 * what Netlify's documentation recommends for security headers.
 *
 * Consequence to be aware of: `next dev` and a local `next start` now serve no
 * CSP, because netlify.toml is not involved locally. A CSP violation will
 * therefore only appear on a deploy preview, not on localhost.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
