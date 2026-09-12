# PHASE 1 — ACCIAN STABILIZATION — FINAL REPORT

---

## 1. Summary

Phase 1 fixed confirmed defects across three separately-versioned repositories (`accian`, `accian-backend`, `accian-admin/admin`) without consolidating them, moving them, or altering deployment architecture. The three applications remain structurally separate.

Every audit finding was re-verified against current source before being touched. Where the source had already diverged from the audit, the difference is recorded in §10 rather than assumed away. Nothing was committed, pushed, merged, rebased, or deployed.

**Headline results**

| Repo | Tests | Typecheck | Build | Lint |
| --- | --- | --- | --- | --- |
| `accian-backend` | **109/109 pass**, 23 suites, 0 skipped, 0 cancelled | via build | pass | no script (pre-existing) |
| `accian-admin/admin` | **19/19 pass** | `tsc -b` exit 0 | pass | **0 errors, 0 warnings** |
| `accian` | no suite (see §10) | via build | pass | **0 errors** (script was broken; fixed) |

Test coverage was added with **zero new dependencies** in both repos that gained tests.

**Three findings that changed the shape of the work:**

1. **The internal-area password gate was never protection.** It compared a password *in the browser, after the page had already been delivered*. Setting one variable in devtools bypassed it. The password was also a literal in a client component, so it shipped in a public JavaScript chunk. Replaced with a server-side gate; **the old credential requires rotation** (§11).
2. **Every frontend page was reachable at two URLs.** `pages/*.tsx` were imported as components by the App Router *and* simultaneously served as Pages Router routes — `.next/server/pages/HomePage.html` existed in the build. The second copy rendered without `app/layout.tsx`.
3. **The CSP in force matched neither file that defined it.** `netlify.toml` and `next.config.ts` both set `Content-Security-Policy`; browsers enforce the intersection of all CSP headers received, so the effective policy was not readable from either file. Both also blocked a font the site actually loads.

---

## 2. Changes by repository

### `accian-backend` — 30 files
Serializers (`src/utils/serializers.ts`), safe SQL identifier mapping (`src/utils/requestFields.ts`), contact-status normalization (`src/utils/contactStatus.ts`), migration runner (`src/migrations/migrator.ts`, `cli.ts`), 4 new SQL migrations, CORS hardening (`src/app.ts`), token handling (`src/utils/token.ts`, `src/middleware/auth.ts`), controllers, email service, `.nvmrc`, test suite (6 files).

### `accian-admin/admin` — 21 files
API config (`src/services/apiConfig.ts`, `apiClient.ts`), auth error classification (`authErrors.ts`), independent resource loading (`src/hooks/`, `resourceService.ts`), route guard (`RequireAuth.tsx`), error surface (`ResourceError.tsx`), dashboard rewrite, PII removal, `.nvmrc`, test suite (2 files).

### `accian` — 19 files
`proxy.ts` (new, server-side gate), `app/internal/quote-builder/page.tsx` (client gate removed), `pages/` → `views/` (5 files), service DTO mapping in `views/HomePage.tsx`, `netlify.toml` (CSP consolidated, dead cache rules removed), `next.config.ts` (duplicate headers removed), `eslint.config.js` (Vite-era config corrected), `.gitignore`, `package.json`, dead `public/_redirects` deleted, 6 dead `eslint-disable` comments removed.

---

## 3. Defects fixed

Items are numbered as in the Phase 1 scope.

### Item 1 — API contract consistency

**1A. `GET /api/services` field mismatch.**
*Original:* Every service card on the homepage rendered an empty paragraph.
*Root cause:* The API returns `shortDescription` (from `services.short_description`). `views/HomePage.tsx` read `.description`. Never mapped, so the value was `undefined`.
*Fix:* Explicit `ServiceResponse` interface and mapping at the fetch boundary — matching how testimonials were already handled. The database column was **not** renamed.
*Files:* `accian/views/HomePage.tsx`, `accian-backend/src/utils/serializers.ts`

**1B/1C. Raw snake_case leaking from admin endpoints.**
*Fix:* Explicit serializers (`serializeProject`, `serializeService`, `serializeContact`, `serializeTestimonial`). Where the frontend expected a field with no column behind it, the existing source of truth was used rather than inventing one — see item 11 for the `published` → `status` case.

**1D. Dashboard stats.** Now computed from serialized values that the API actually emits.

### Item 2 — Project create/update contract
*Original:* Create and update accepted different shapes; submitted fields were silently dropped.
*Fix:* One shared contract via `buildInsert`/`buildUpdate`. `results` (a TEXT column) is serialized/deserialized per its existing intended representation — proved by the `project results — TEXT column round trip` test. Input is validated before SQL executes. No schema change.

### Item 3 — SQL identifier injection (3 sites)
*Original:* `Object.keys(req.body)` was interpolated directly into SQL.
*Fix:* A strict allowlist maps request fields to column names (`client → client_name`, `image → image_url`, `technologies → technology_stack`). Unknown fields are **rejected**, not ignored. Identifiers are never parameterized as `$1` (which is invalid SQL); the allowlist is the mechanism.
*Regression tests:* `buildUpdate — SQL identifier safety`, `buildInsert — same contract as update` prove an arbitrary field name cannot reach SQL.
*Files:* `src/utils/requestFields.ts`, `src/controllers/adminController.ts`

### Item 4 — Testimonial create/update returned 400 for valid input
*Fix:* Explicit request DTO shared by POST and PUT. Tests: `createTestimonial`, `updateTestimonial`.

### Item 5 — Contact status normalization
*Fix:* One canonical representation via a single shared backend function (`src/utils/contactStatus.ts`). Migration `004_normalize_contact_status.sql` converts legacy spellings **non-destructively** (no column drop, no data loss). Test: `contact status — one canonical representation`; the "In Progress" case is covered explicitly.

### Item 6 — Admin API base URL
*Original:* Hardcoded production URL; local dev silently targeted production.
*Fix:* Single config module. `VITE_API_URL` now actually controls the target; dev with no config targets localhost and **can never** fall back to production; a production build with no config **fails loudly** rather than guessing. Endpoint paths unchanged. No environment file containing real credentials was added.

### Item 7 — Admin auth / token lifetime
The existing implementation was read in full first; authentication was **not** redesigned. Refresh-token support was added as the smallest safe change, with revocation. Token expiry was **not** weakened. Remaining storage limitation documented in §6.

### Item 8 — Admin UI auth guard
Minimal `RequireAuth` route wrapper. It is a UX layer only — backend authorization remains mandatory on every endpoint, and token presence in `localStorage` is never treated as proof of authorization.

### Item 9 — Admin dashboard error handling
*Original:* One failed request blanked the whole dashboard; any error logged the user out.
*Fix:* Each resource loads independently through a `useResource` hook with its own error state and retry. One failure cannot destroy already-loaded resources. 401 and 403 are distinguished, and **only** an authentication failure ends the session — 500s and network errors do not. No new state-management dependency.
*Tests:* `401 and 403 are not conflated`, `only an authentication failure ends the session`.

### Item 10 — PII in browser logs
*Fix:* Removed. Errors now log status codes only, never response bodies (which echoed submitted contact details). PII was **not** rerouted to another logging mechanism.
*Enforcement:* A static scanner (`tests/noPiiLogging.test.ts`) parses every `console.*` call with balanced-paren extraction — so it catches multi-line calls a line-grep would miss — and fails on any reference to a PII field, any whole-record dump, and any `console.log` in app source. Three self-tests prove the scanner detects a planted leak, spans multiple lines, and actually reads files.

### Item 11 — Active project count always zero
*Original:* Dashboard tested `project.status === "Published"`; the API never returned `status`. The count was permanently 0.
*Root cause:* The column is `published BOOLEAN`.
*Fix:* `serializeProject` maps the boolean to `"Published"`/`"Draft"`, so the comparison now tests a value the API actually emits. Test: `active project count (item 11)`.

### Item 12 — Database migrations
*Fix:* Ordered runner with reliable tracking in `schema_migrations`. No ORM, no migration framework.
*Verified by 9 tests against a genuinely fresh database* (all named, all passing — see §8): fresh-DB init from empty, ordering, complete tracking, and **repeated startup safety** (second and third runs apply nothing and do not throw, existing data survives).

### Item 13 — Tracked secret
Located without printing its value; see §11 for the required rotation.

### Item 14 — Dead auth controller code
Reviewed, **not deleted** merely for having been unreachable. Reachability was restored where the code was correct.

### Item 15 — Response serialization
DATABASE snake_case → BACKEND DTO → API camelCase, implemented as a small set of per-entity functions. No abstraction framework; controllers were not rewritten wholesale.

### Item 16 — CORS/networking hardening
Production fallback origin list removed; `FRONTEND_URL` is now **required in production** (see §11); comma-separated origins are trimmed; a rejected origin returns 4xx, not 500. `trust proxy` is set in source but its correctness depends on deployment topology — see §10.

### Item 17 — Contact notification email
*Original:* **Every admin notification failed before it was sent.* `"UK/England/wales"` is not an IANA timezone, so `toLocaleString` threw a `RangeError`.
*Status:* This fix was already in place from earlier in this phase — verified at `src/services/emailServices.ts:184-188` (`timeZone: "Europe/London"`), not re-applied.
*Regression test:* `the original timezone defect` plus `sendAdminNotification` prove admin notification formatting now succeeds.
*Also fixed (found during review of placeholder substitution):* template values were interpolated into HTML unescaped, and substitution was driven by `Object.keys(data)` so a placeholder with no matching key survived verbatim — `{{id}}` appeared literally in the admin email's "View in Admin Panel" link. Now a single template-driven pass with HTML escaping, so user input containing `{{email}}` or `$&` is safe. The email system was not redesigned.

### Item 18 — Runtime reproducibility
`.nvmrc` (`22`) in all three repos; `engines: { "node": ">=22.0.0 <23" }` in all three `package.json` files. No framework was upgraded.

### Item 19 — Frontend routing/security verification

**Duplicate routes (new finding, confirmed not theoretical).** `pages/*.tsx` were imported as components by `app/` *and* served as Pages Router routes — `.next/server/pages/HomePage.html` existed in the build output, so every page was reachable at a second URL that rendered without `app/layout.tsx`.
*Fix:* `pages/` renamed to `views/`; all 5 importing files updated.
*Verified:* the post-change build emits only `Route (app)`; `HomePage.html`, `ContactPage.html`, `ServicesPage.html`, `PrivacyPolicy.html` and `ResearchSupport.html` are all gone, and `routes-manifest.json` lists only intended App Router paths. (`404.html`/`500.html` remain — those are Next's own error pages, present in every build.)

**`/internal/quote-builder` protection.** Replaced the client-side password with `proxy.ts`, a server-side HTTP Basic gate on `/internal/*`.
Per the explicit instruction, the `netlify.toml` `Role = ["admin"]` condition is **not** relied upon — Netlify Identity provisioning cannot be confirmed from the repository, so it is treated as providing no protection. The redirect was left in place as harmless defence-in-depth.
*Implementation notes:* fails closed (503) when unconfigured rather than publishing the page; timing-safe comparison; malformed base64 yields 401, not 500; `Cache-Control: no-store` and `X-Robots-Tag: noindex`. Uses Next 16's `proxy` convention (`middleware` was renamed in 16.0.0) — confirmed against current official documentation rather than from memory.

### Item 19 (cont.) — Frontend cleanup

**CSP consolidated.** Both `netlify.toml` and `next.config.ts` set a CSP, and they had drifted: different HSTS max-age (63072000 vs 31536000), a `frame-src` in only one, and `base-uri`/`object-src`/`form-action`/`frame-ancestors`/`upgrade-insecure-requests` in only the other. Because a browser enforces every CSP header it receives and takes the intersection, the policy actually in force matched neither file.
`netlify.toml` is now the single source of truth (Netlify's own guidance for security headers, since it covers static assets *and* SSR function responses); the duplicate block in `next.config.ts` was removed with a comment explaining why.

**A real bug found while consolidating:** both policies set `style-src 'self' 'unsafe-inline'` with no `fonts.googleapis.com`. Two files load a stylesheet via `@import url('https://fonts.googleapis.com/...')`, and an `@import` is governed by `style-src` — which `'unsafe-inline'` does **not** cover. Both policies were therefore blocking those font loads outright. The consolidated policy allows `fonts.googleapis.com` in `style-src` and `fonts.gstatic.com` in `font-src`.

Directives were verified against source, not assumed: `frame-src` was dropped (no iframe, embed or object anywhere), and `google-analytics.com` was dropped from `connect-src` (no analytics or external script anywhere). `font-src` was narrowed from blanket `https:` because everything else is self-hosted by `next/font`. `'unsafe-inline'`/`'unsafe-eval'` in `script-src` were **retained** — tightening them needs a nonce strategy and a deploy to verify, which is beyond a stabilization fix (§10).

**Dead config removed** (each confirmed dead first):
- `public/_redirects` — contained `/* /index.html 200`, a Vite/CRA SPA fallback that is wrong for Next. No references anywhere.
- `netlify.toml` cache rules for `/*.html` and `/assets/*` — Vite-era. Next routes are extensionless and its hashed output is served from `/_next/static/`, so both matched nothing. **No replacement rule was added**: the Netlify Next.js adapter configures cache-control for `/_next/static/` itself, and a hand-written rule would compete with it.
- An indentation bug that nested the `/internal/*` header block inside the preceding table.
- A `.gitignore` entry `.src/pages/PortfolioPage.tsx` — a typo (leading dot) matching nothing.

**`accian` lint script fixed.** `npm run lint` failed with `Invalid project directory provided, no such directory: .../lint` — `next lint` was removed in Next 16, so `lint` was parsed as a directory name. This was **pre-existing breakage, not a regression.** Now `eslint .`. Fixing it exposed three further Vite-era problems in `eslint.config.js`: it ignored `dist` but not `.next` (so `eslint .` walked ~500 generated files and effectively hung — the first run had to be killed at 120s); it extended `reactRefresh.configs.vite`, a Vite HMR plugin config, in a Next app; and it declared browser globals only, making `process` undefined in server-side `proxy.ts`. All three corrected; the 6 now-dead `eslint-disable react-refresh/...` comments they required were removed. Result: **0 errors**.

---

## 4. API contract changes

All existing paths preserved. **No endpoint was deleted**, including the nine marked POSSIBLY UNUSED and `/health`. This phase was not endpoint cleanup.

| Endpoint | Change |
| --- | --- |
| `GET /api/services` | `shortDescription` now consistently serialized; consumed correctly by the frontend |
| `GET /api/admin/projects` | snake_case → camelCase via serializer; `published` boolean → `status` string |
| `GET /api/admin/services` | snake_case → camelCase via serializer |
| `GET /api/admin/contacts` | canonical status values; camelCase |
| `POST`/`PUT /api/admin/projects` | one shared contract; unknown fields rejected |
| `POST`/`PUT /api/admin/testimonials` | explicit DTO; valid submissions no longer 400 |
| `POST /api/admin/refresh` | refresh flow with revocation |

Public `GET` endpoints for testimonials retain their own inline mappings and emit exactly what the frontend expects — verified explicitly, since a serializer change there would have broken the homepage.

---

## 5. Database changes

Four additive migrations, all tracked in `schema_migrations`:

| Migration | Purpose |
| --- | --- |
| `001_add_refresh_tokens.sql` | refresh-token storage with revocation |
| `002_add_audit_logs.sql` | admin action audit trail |
| `003_lock_admin_signup.sql` | close open admin signup |
| `004_normalize_contact_status.sql` | convert legacy status spellings |

**No column was renamed, dropped, or retyped. No table was dropped. No destructive migration.** The schema was not redesigned and no ORM was introduced. `004` rewrites values in place and is safe to re-run.

---

## 6. Auth changes

The existing implementation was read in full before any change; it was **not** redesigned from scratch.

- Refresh tokens with server-side revocation (smallest safe change to address token lifetime)
- Access-token expiry **not** weakened
- Admin signup closed (`003`)
- `requireAdmin` enforced server-side on admin routes
- UI route guard added as a UX layer only

**Documented remaining limitation:** tokens remain in `localStorage`, which is what the current architecture already required — this is unchanged, not newly introduced, and is therefore XSS-readable. Moving to httpOnly cookies is a cross-repo change affecting CORS, CSRF posture and the admin's request path; it belongs to a later phase, not a stabilization pass.

---

## 7. Security changes

1. **`/internal/*` gated server-side.** The page is now *withheld* rather than hidden. Proved by test: an unauthenticated response body contains **zero** HTML (§8).
2. **Publicly-shipped credential removed.** Verified absent from a fresh production build. **Rotation still required** — §11.
3. **SQL identifier injection closed at 3 sites**, with regression tests.
4. **PII removed from browser logs**, with an automated scanner preventing reintroduction.
5. **HTML escaping in email templates** — the contact form is untrusted input.
6. **CORS production fallback removed**; `FRONTEND_URL` required in production.
7. **CSP made single-source and correct** — including fixing a font load both prior policies blocked.
8. **Admin signup closed**; refresh-token revocation added.
9. **Duplicate routes eliminated** — pages no longer reachable at a second URL bypassing the root layout.

---

## 8. Test results

### `accian-backend`
```
cd accian-backend
TEST_DATABASE_URL="postgresql://app_user:***@127.0.0.1:5433/accian_phase1_verify" npm test
```
```
# tests 109
# suites 23
# pass 109
# fail 0
# cancelled 0
# skipped 0
```

All 23 suites: `createProject`, `updateProject`, `createTestimonial`, `updateTestimonial`, `updateService`, `login`, `authenticateToken`, `requireAdmin`, `refreshToken`, `logout`, `the original timezone defect`, `sendAdminNotification`, `sendUserConfirmation`, `migrations against a fresh database`, `contact status — one canonical representation`, `serializeContact — API contract casing`, `serializeProject — published boolean to status string`, `active project count (item 11)`, `project results — TEXT column round trip`, `serializeService — item 1A/1C`, `serializeTestimonial`, `buildUpdate — SQL identifier safety`, `buildInsert — same contract as update`.

**On the migration suite specifically:** it is gated on `TEST_DATABASE_URL`. Without it the run reports `# tests 100` and the 9 migration tests do not register — and if the variable points at an unreachable database they report as **`cancelled`**, not `skipped` or `failed`. Both states are easy to mistake for a pass. The 109/109 result above was produced against a real throwaway PostgreSQL database, and the 9 tests were confirmed individually by name:

```
cd accian-backend
rm -rf dist-test && npx tsc -p tsconfig.test.json
mkdir -p dist-test/src/templates dist-test/src/migrations
cp -R src/templates/. dist-test/src/templates/ && cp src/migrations/*.sql dist-test/src/migrations/
TEST_DATABASE_URL="postgresql://app_user:***@127.0.0.1:5433/accian_phase1_verify" \
  NODE_ENV=test node --experimental-test-isolation=none --test dist-test/tests/migrations.test.js
```
```
ok 1 - a fresh database migrates from empty without error
ok 2 - every expected table exists afterwards
ok 3 - the security-fields migration actually ran
ok 4 - every migration is recorded in schema_migrations
ok 5 - the base schema is recorded first
ok 6 - re-running applies nothing and does not throw
ok 7 - a third run is still safe (repeated startup)
ok 8 - existing data survives a re-run
ok 9 - the status normalisation migration converts legacy spellings
# pass 9   # fail 0   # cancelled 0   # skipped 0
```
The throwaway database was dropped afterwards and `dist-test/` removed.

### `accian-admin/admin`
```
cd accian-admin/admin && npm test
```
```
# tests 19   # pass 19   # fail 0   # cancelled 0   # skipped 0
```
All 19 by name: `VITE_API_URL determines the API target`, `VITE_API_URL wins over the dev default even in dev mode`, `dev with no configuration targets localhost, never production`, `a production build with no configuration fails loudly`, `an empty or whitespace-only variable is treated as unset`, `a bare origin and an origin already ending in /api/admin agree`, `trailing slashes never produce a doubled path segment`, `HTTP statuses map to distinct failure kinds`, `401 and 403 are not conflated`, `only an authentication failure ends the session`, `every failure kind produces a distinct, non-empty message`, `the failure message names the resource that failed`, `no console call references a contact PII field`, `no console call dumps a whole record or payload`, `no console call logs a token or credential`, `console.log is not used anywhere in the app source`, `the scanner itself detects a planted leak`, `the scanner captures a call spanning multiple lines`, `the scan actually reads files`.

### `accian` — runtime verification of the internal gate
No automated suite exists in this repo (§10). The gate was verified against a real production server on both configured and unconfigured paths:

```
cd accian && npm run build
env -u INTERNAL_AREA_USER -u INTERNAL_AREA_PASSWORD npx next start -p 3111
INTERNAL_AREA_USER=... INTERNAL_AREA_PASSWORD=... npx next start -p 3112
```

| Case | Result |
| --- | --- |
| Unconfigured → `/internal/quote-builder` | **503**, `no-store`, `noindex`, **0 HTML in body** |
| Unconfigured → `/` | **200** (public site unaffected) |
| Configured, no credentials | **401** + `WWW-Authenticate`, **0 HTML in body** |
| Wrong password | **401** |
| Wrong username | **401** |
| Malformed base64 | **401** (not 500) |
| No colon in decoded credentials | **401** (not 500) |
| Correct credentials | **200**, page renders, no trace of the old password prompt |

The zero-HTML result on the unauthenticated cases is the point: the page is withheld, which is exactly what the old client-side check failed to do.

**Matcher scope** was verified by extracting the compiled regex from `functions-config-manifest.json` and testing it against 14 paths: all of `/internal`, `/internal/`, `/internal/quote-builder`, `/internal/quote-builder/`, `/internal/anything/deeper` are gated; `/`, `/contact`, `/services`, `/privacy-policy`, `/research-support`, `/api/contact`, `/_next/static/chunk.js`, `/not-internal` are not — and neither is `/internalx`, the prefix-collision case.

### Testing requirements checklist

| Required proof | Test |
| --- | --- |
| Testimonial creation/update succeeds | `createTestimonial`, `updateTestimonial` |
| Project creation/update succeeds | `createProject`, `updateProject` |
| Arbitrary SQL identifiers rejected | `buildUpdate — SQL identifier safety`, `buildInsert` |
| Project/service API casing correct | `serializeProject`, `serializeService — item 1A/1C` |
| Contact "In Progress" stays "In Progress" | `contact status — one canonical representation` |
| Active project count correct | `active project count (item 11)` |
| Admin API base URL environment-driven | 5 `VITE_API_URL` tests |
| Refresh flow works | `refreshToken` |
| Revoked refresh tokens fail | `refreshToken` (revocation case) |
| Generic API errors do not force logout | `only an authentication failure ends the session` |
| PII not logged | 4 scanner tests + 3 scanner self-tests |

No new testing framework was added. Both suites use `node --test`, which is built in. In the admin app this relies on Node 22's native TypeScript type-stripping — verified empirically before being depended on. **Zero new dependencies in either repo.**

---

## 9. Build / typecheck / lint results

`package.json` was inspected in each repo before choosing commands; no dependency was installed.

| Repo | Command | Result |
| --- | --- | --- |
| `accian-backend` | `npm run build` | exit 0 |
| `accian-admin/admin` | `npx tsc -b` | exit 0 |
| `accian-admin/admin` | `npm run build` | success, 476.55 kB |
| `accian-admin/admin` | `npm run lint` | **0 errors, 0 warnings** |
| `accian` | `npm run build` | success — 7 routes, TypeScript passed, `ƒ Proxy (Middleware)` registered |
| `accian` | `npm run lint` | **0 errors** (script was broken pre-existing; fixed — §3) |

`accian-admin/admin` lint is **better than the baseline**, which had 1 warning.

### npm audit — all pre-existing

| Repo | Vulnerabilities |
| --- | --- |
| `accian` | 18 (1 low, 4 moderate, 12 high, 1 critical) |
| `accian-backend` | 14 (2 low, 3 moderate, 9 high) |
| `accian-admin/admin` | 19 (1 low, 4 moderate, 14 high) |

**Proved pre-existing, not asserted:** `git diff package.json` in all three repos shows only `scripts` and `engines` lines changed, and **no `package-lock.json` was modified in any repo**. No dependency line was added, removed, or changed anywhere, so none of these 51 vulnerabilities originates from this phase. They remain outstanding and need a dedicated dependency pass.

---

## 10. Remaining known issues

Nothing here is hidden or resolved.

**Pre-existing, unrelated to this phase**
1. **51 npm vulnerabilities** across three repos (§9), including 1 critical in `accian`. Needs its own upgrade pass.
2. **`accian-backend/dist/` is committed** (29 files), so every build dirties the working tree. It also contains a stale nested `dist/templates/templates/` from a previous build command. The corrected build command no longer creates it, but the committed copy remains.
3. **`accian-admin/admin` tracks build artifacts**: `tsconfig.tsbuildinfo`, plus `vite.config.js` and `vite.config.d.ts` alongside the real `vite.config.ts`. **Vite resolves `.js` before `.ts`**, so the compiled artifact shadows the source. I diffed them: they are semantically identical (indentation only), so this is currently harmless — but it is a live trap, because editing `vite.config.ts` would silently have no effect.
4. **`accian-admin/admin/tsconfig.json` references `../../accian/src/data`**, which does not exist.
5. **`accian-admin/admin/tsconfig.app.json` is orphaned** — `tsc -b` builds `tsconfig.json`, which references only `tsconfig.node.json`. Its `erasableSyntaxOnly`, `verbatimModuleSyntax` and `types: ["vite/client"]` settings are **not applied by the build**, so anyone reading that file will draw wrong conclusions about what is enforced.
6. **Four 0-byte tracked files** in the admin app: `src/utils/api.tsx`, `src/utils/auth.tsx`, `src/utils/helpers.tsx`, `src/context/AuthContext.tsx`. Confirmed no importers. **Deliberately not deleted** — they are empty, so there is nothing to preserve and nothing to break, and removing tracked files delivers no stabilization benefit. Flagged for Phase 2.
7. **`accian` has 489 tracked `.next/` build artifacts** out of 535 tracked files — all under `.next/dev/`, a dev server's cache. `.gitignore` now excludes `.next/`, which stops new artifacts being tracked but does not untrack these. See §11.
8. **`accian` has no test suite.** Its Phase 1 changes were verified by production build plus the runtime gate tests in §8. Adding a frontend test framework was out of scope ("do not add a huge new testing framework merely for this phase").

**Introduced by this phase, deliberately**
9. **`next dev` and local `next start` now serve no CSP**, because `netlify.toml` is not involved locally. The trade-off of single-source headers: a CSP violation will only appear on a deploy preview. Documented in both files. Verify with `curl -sI <deploy-preview-url> | grep -i content-security-policy`.
10. **`script-src` still allows `'unsafe-inline'` and `'unsafe-eval'`.** Unchanged from before. Tightening it needs a nonce/hash strategy and a deploy to verify — a hardening project, not a stabilization fix.

**Cannot be verified from source — needs deployment access**
11. **`trust proxy`** is set in `src/app.ts`, but whether it is *correct* depends on how many proxies sit in front of the API. If misconfigured, client IPs may be wrong. Requires checking the deployed topology.
12. **Netlify Identity provisioning** for the `Role = ["admin"]` condition cannot be confirmed from the repo. Per instruction it is treated as providing **no** protection; `proxy.ts` does not depend on it.
13. **Whether Netlify applies `next.config.ts` headers** is documented as supported but its precedence against `netlify.toml` is not documented. This is why all headers were consolidated into `netlify.toml` — the layer that certainly applies. Confirm on a deploy preview.

---

## 11. Manual actions required

### 🔴 1. Rotate the internal-area credential — MANDATORY

A password was hardcoded in `app/internal/quote-builder/page.tsx` in a client component. It is:
- **committed in Git history** (present at commit `51aa927`), and
- **was shipped in a public JavaScript chunk** under `/_next/static/` — I confirmed it was present in a built chunk before the fix, and confirmed it is absent from a fresh build after.

**Anyone who viewed the site could have read it. It must be treated as fully disclosed and rotated wherever it is used.**

Removing the code does **not** make it safe — the value remains in Git history and in any cached or archived copy of the old JS bundle. I have not rewritten history, and will not without an explicit instruction. Its value does not appear anywhere in this report.

### 🔴 2. Configure the internal area — breaking change

`/internal/*` now returns **503 for everyone** until these are set in the Netlify environment:
```
INTERNAL_AREA_USER
INTERNAL_AREA_PASSWORD
```
This fail-closed direction is deliberate: the alternative would quietly publish the page. Use a newly generated password — **not** the rotated one from item 1.

### 🔴 3. `FRONTEND_URL` now required in production

The backend no longer falls back to a hardcoded production origin list. `FRONTEND_URL` must be set in the API's production environment or CORS will reject the frontend. Comma-separated values are supported and trimmed.

### 🟡 4. Run the new migrations
```
cd accian-backend && npm run build && npm start
```
`start` runs the migration CLI first. Proven safe to run repeatedly against an existing database (§8). Take a backup first as normal practice, though `004` is non-destructive.

### 🟡 5. Untrack `accian`'s build artifacts
```
cd accian && git rm -r --cached .next
```
Stages 489 deletions — **review before committing.** I did not run this: it mutates the Git index, which is outside what I was authorized to do. `.gitignore` now prevents new artifacts being added.

### 🟡 6. Verify headers on a deploy preview
```
curl -sI https://<deploy-preview>.netlify.app/ | grep -iE "content-security-policy|strict-transport"
```
Confirms exactly one CSP header is returned and that the Google Fonts allowance works. Also worth confirming the two `@import` fonts now load without a console CSP violation.

### ⚪ 7. No rotation needed
The admin app's `.env` contains only a public API URL — no credential. No secret was committed by this phase, and no environment file containing real credentials was added.

---

## 12. Phase 2 readiness

## `READY WITH CONDITIONS`

The defects in scope are fixed and verified: 128 tests pass across two repos, all three build, two lint clean and the third's lint script now works at all. Contracts are explicit and serialized in one place, the injection sites are closed with regression tests, migrations are proven safe on both a fresh database and repeated startup, and the frontend no longer ships a credential, no longer serves every page at two URLs, and no longer relies on a client-side password for its internal area.

The three applications remain structurally separate. No consolidation work was begun.

**Conditions to clear before consolidating:**

1. **Rotate the exposed credential** (§11.1). Non-negotiable, and independent of Phase 2.
2. **Set `INTERNAL_AREA_*` and `FRONTEND_URL`** (§11.2, §11.3), or the internal area stays 503 and CORS rejects the frontend.
3. **Verify on a deploy preview** (§11.6) — three things genuinely cannot be settled from source: header precedence, `trust proxy` correctness, and Netlify Identity provisioning. A consolidation that assumes any of them is building on an unverified base.
4. **Untrack build artifacts** in all three repos (§11.5, §10.2, §10.3). Repo merges with `dist/` and `.next/` committed produce large, conflict-prone merges — and the `vite.config.js` shadowing is the kind of trap that gets much harder to diagnose after a move.
5. **Address the 51 npm vulnerabilities** (§9), including the critical one. Best done while the repos are still separate and independently testable.

None of these are blockers in the sense of unresolved defects — they are configuration, verification and hygiene tasks. Hence *with conditions* rather than *ready*.

---

## 13. Final Git status

**No commits. No pushes. No merges. No rebases. No history rewriting. No deployments.**

```
accian                 branch=master  [level with origin]  stashes=0  staged=0
accian-backend         branch=master  [level with origin]  stashes=0  staged=0
accian-admin/admin     branch=master  [level with origin]  stashes=0  staged=0
```
All three repos report 0 reflog entries in the last 24 hours — confirming no commit, amend, reset or rebase occurred.

### `accian` — HEAD `b7347c5`
```
 M .gitignore
 M app/contact/page.tsx
 M app/internal/quote-builder/page.tsx
 M app/layout.tsx
 M app/page.tsx
 M app/privacy-policy/page.tsx
 M app/research-support/page.tsx
 M app/services/page.tsx
 M eslint.config.js
 M netlify.toml
 M next-env.d.ts
 M next.config.ts
 M package.json
 D pages/ContactPage.tsx
 D pages/HomePage.tsx
 D pages/PrivacyPolicy.tsx
 D pages/ResearchSupport.tsx
 D pages/ServicesPage.tsx
 D public/_redirects
?? .nvmrc
?? proxy.ts
?? views/
```
Two notes:
- The `pages/` → `views/` rename shows as `D pages/*` + `?? views/` because it was done with plain `mv`, deliberately **not** `git mv`, to leave the index untouched.
- `next-env.d.ts` is generated by Next itself (`"This file should not be edited"`); the import path differs between dev and production builds, so running the production build rewrote it. Not a hand edit, and reverting it would be undone by the next build.

### `accian-backend` — HEAD `9a02f18`
```
 M .gitignore                                  M src/app.ts
 M dist/app.js                                 M src/config/database.ts
 M dist/config/database.js                     M src/controllers/adminController.ts
 M dist/controllers/adminController.js         M src/controllers/contactControllers.ts
 M dist/controllers/contactControllers.js      M src/controllers/serviceController.ts
 M dist/controllers/serviceController.js       M src/controllers/testimonialController.ts
 M dist/controllers/testimonialController.js   M src/middleware/auth.ts
 M dist/middleware/auth.js                     M src/migrations/init.ts
 M dist/migrations/init.js                     M src/migrations/run.ts
 M dist/migrations/run.js                      M src/routes/adminRoutes.ts
 M dist/routes/adminRoutes.js                  M src/server.ts
 M dist/server.js                              M src/services/emailServices.ts
 M dist/services/emailServices.js              M src/utils/token.ts
 M dist/templates/emailTemplates/userConfirmation.html
 M dist/utils/token.js                         M package.json
 M scripts/runMigrations.ts

?? .nvmrc                                      ?? dist/migrations/cli.js
?? dist/migrations/001_add_refresh_tokens.sql  ?? dist/migrations/migrator.js
?? dist/migrations/002_add_audit_logs.sql      ?? dist/utils/contactStatus.js
?? dist/migrations/003_lock_admin_signup.sql   ?? dist/utils/requestFields.js
?? dist/migrations/004_normalize_contact_status.sql
?? dist/utils/serializers.js
```
The `dist/` entries are build output, not hand edits — `dist/` is committed in this repo (§10.2), so running the build necessarily shows them as modified.

### `accian-admin/admin` — HEAD `d230741`
```
 M .gitignore                    ?? .nvmrc
 M package.json                  ?? src/components/RequireAuth.tsx
 M src/App.tsx                   ?? src/components/ResourceError.tsx
 M src/components/ContactsView.tsx   ?? src/hooks/
 M src/components/LoginForm.tsx   ?? src/services/apiClient.ts
 M src/components/SignupForm.tsx  ?? src/services/apiConfig.ts
 M src/pages/AdminDashboard.tsx   ?? src/services/authErrors.ts
 M src/pages/LoginPage.tsx        ?? src/services/resourceService.ts
 M src/services/adminService.ts   ?? tests/
 M tsconfig.json
 M tsconfig.tsbuildinfo
```
`tsconfig.tsbuildinfo` is typecheck output and is committed in this repo (§10.3).

### Working-tree hygiene

Only files related to Phase 1 scope were modified. Two incidental effects were found and corrected rather than left in place:

- I removed `.next/dev/` before the production build, which registered as **489 tracked-file deletions** — my own side effect, which would have buried the real changes in review noise. Restored with `git checkout -- .next/` (working tree only; index and history untouched). The working tree now shows 0 such deletions.
- Test scaffolding was cleaned up: throwaway databases created and dropped, `dist-test/` removed, the two `next start` servers stopped (they required killing the `next-server` child processes directly — `kill` on the `npx` wrapper left them holding ports 3111/3112), and temporary log files deleted.

No secret value and no personal data appears anywhere in this report.
