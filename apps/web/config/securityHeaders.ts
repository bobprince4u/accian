/**
 * Security response headers for the public site — the single source of truth.
 *
 * ## Why this file exists
 *
 * These headers were declared twice, in `next.config.ts` and in
 * `netlify.toml`, and the two copies drifted (different HSTS max-age, a
 * `frame-src` in only one). A browser enforces every CSP header it receives
 * and takes the intersection, so the policy actually in force matched neither
 * file. The duplicate in `next.config.ts` was removed and `netlify.toml` was
 * made the sole declaration.
 *
 * That fixed the drift but left the headers on the wrong layer. Netlify's
 * `[[headers]]` decorate responses served by the CDN; with
 * `@netlify/plugin-nextjs`, every HTML document is rendered by the Next
 * runtime instead, which that layer does not touch. Measured in production on
 * 2026-09-25 — static files carried the full policy while all six HTML routes
 * carried no CSP, no `X-Frame-Options`, no `Referrer-Policy`, and Netlify's
 * default HSTS rather than the declared one:
 *
 *     /sitemap.xml   csp=1  xfo=DENY  hsts=max-age=63072000; includeSubDomains; preload
 *     /              csp=0  xfo=-     hsts=max-age=31536000
 *     /contact       csp=0  xfo=-     hsts=max-age=31536000
 *
 * So the pages that carry applicant data were the ones with no policy.
 *
 * ## How it is arranged now
 *
 * The values live here, in one place, and both layers read them:
 *
 *   - `next.config.ts` imports this and returns it from `headers()`, which
 *     covers documents rendered by the Next runtime.
 *   - `netlify.toml` repeats the same values for files served straight from
 *     the CDN, which never reach Next at all.
 *
 * `npm run guards` fails if the two disagree, so the drift that caused the
 * original consolidation cannot come back unnoticed. Where both layers do
 * apply, the two headers are identical, and identical policies intersect to
 * themselves.
 *
 * ## Every directive below is verified against the current source
 *
 *   script-src   `'unsafe-inline'` and `'unsafe-eval'` are kept as-is.
 *                Tightening them needs a nonce or hash strategy and a deploy
 *                to verify; that is follow-up work, not a header move.
 *   style-src    fonts.googleapis.com is REQUIRED:
 *                `app/internal/quote-builder/page.tsx` loads a stylesheet with
 *                `@import url('https://fonts.googleapis.com/...')`. An @import
 *                is governed by style-src and `'unsafe-inline'` does not cover
 *                it. This directive can go when that page moves to
 *                `next/font` like the rest of the site.
 *   font-src     fonts.gstatic.com is where those stylesheets fetch the font
 *                files. Everything else is self-hosted by `next/font`, so no
 *                blanket `https:` is needed.
 *   connect-src  api.accian.co.uk is the one outbound call in the app —
 *                `lib/preConsultation/payload.ts` posting the form.
 *   frame-src    omitted deliberately. There is no iframe, embed or object in
 *                the source, so `default-src 'self'` already covers it.
 *   img-src      `https:` is broad, but images are the one place the site
 *                pulls from arbitrary hosts, and an image cannot execute.
 */

/** One header, as both Next and Netlify need it: a name and a value. */
export type SecurityHeader = { readonly key: string; readonly value: string };

/**
 * Written as one literal rather than a joined array so that it can be compared
 * to the copy in `netlify.toml` character for character — which is exactly
 * what `npm run guards` does. The directive-by-directive reasoning is in the
 * comment above; this is the string that ships.
 */
export const CONTENT_SECURITY_POLICY =
  "default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https: data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.accian.co.uk; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests;";

export const SECURITY_HEADERS: readonly SecurityHeader[] = [
  // Two years, with subdomains and preload — api. and admin. are both covered.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  // `frame-ancestors 'none'` above supersedes this for modern browsers; it is
  // kept for the ones that never implemented frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), camera=(), microphone=()",
  },
];
