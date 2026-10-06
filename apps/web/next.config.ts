import type { NextConfig } from "next";

import { SECURITY_HEADERS } from "./config/securityHeaders";

/**
 * Response headers are declared in `config/securityHeaders.ts`.
 *
 * This file used to carry its own copy of them, which drifted from the copy in
 * `netlify.toml` — different HSTS max-age, a `frame-src` in only one. A
 * browser enforces every CSP header it receives and takes the intersection, so
 * the policy in force matched neither file. The block was removed and
 * `netlify.toml` became the sole declaration.
 *
 * That removed the drift but put the headers on a layer that does not reach
 * the documents. `@netlify/plugin-nextjs` renders every HTML route through the
 * Next runtime, and Netlify's `[[headers]]` decorate CDN-served files, not
 * function responses — so in production the static files carried the full
 * policy and every page carried none. The `headers()` block below is what puts
 * them back on the documents, reading the same values `netlify.toml` declares
 * for the CDN. `npm run guards` fails if the two ever disagree.
 *
 * A welcome side effect: `next dev` and `next start` now serve the real policy,
 * so a CSP violation surfaces locally instead of only on a deploy preview.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        // Every route this runtime serves. Files served straight from the CDN
        // never reach here, which is why `netlify.toml` still declares them.
        source: "/:path*",
        headers: [...SECURITY_HEADERS],
      },
    ];
  },
};

export default nextConfig;
