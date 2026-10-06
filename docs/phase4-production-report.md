# ACCIAN Phase 4 — Production Verification Report

## Status

**BLOCKED**. Local preparation and safe production inspection are complete.
Production deployment, internal credential rotation, authenticated business flows,
and actual email receipt remain unverified. No production readiness claim is made.

## Date

6 October 2026, Africa/Lagos. Production probes began around 02:07 WAT.

## Deployment topology

| Application | Path | Observed hosting | URL |
|---|---|---|---|
| Web | `apps/web` | Netlify | https://accian.co.uk |
| Admin | `apps/admin` | Netlify | https://admin.accian.co.uk |
| API | `apps/api` | Render origin, Cloudflare response headers | https://api.accian.co.uk |
| PostgreSQL | API connection only | Neon inferred from local connection hostname | Private |
| Email | API transport only | Resend in source; live account unverified | Private |

Web → API → PostgreSQL; API → Resend. Admin → API → PostgreSQL.
No direct frontend database or Resend access was introduced.
Render service identity, region, dashboard configuration, deployed SHA, and
production database identity have not been inspected. Netlify project IDs and
live build settings have not been inspected. See [deployment.md](deployment.md).

## Baseline

Branch `master`; HEAD `86096a42`. The initial working tree already contained
8 modified files and 3 untracked files from unfinished Phase 4 work. Those
changes were preserved and inspected. No AGENTS.md was found in the workspace.

Initial recent commits:

```text
86096a42 modified:   apps/api/src/controllers/contactControllers.ts
8da886e6 Pre-Consultation Web Form added and improved
762930c0 fix: update admin contact email link
59afd4a0 fix(admin): build shared types before admin
43e4f9d4 modified:   apps/web/views/HomePage.tsx
```

Node 22.21.1 matches `.nvmrc` (22); npm 11.8.0. Four root workspaces resolve.
`npm ci` initially failed because the sandbox blocked esbuild execution; the
unsandboxed rerun passed. Root lockfile was unchanged:

```text
SHA-256 88bf0b13ef1d976c237121f9f6be200965f381a2c085ea4fd777fe3084fa7361
```

Initial test run passed but skipped the database migration suite. A subsequent
full run against an isolated disposable PostgreSQL instance passed all actual
tests: web 74, admin 19, API 189 — **282 passed, 0 failed, 0 skipped**.
The web build initially failed to download its existing Google Font inside the
network sandbox. With network access it passed. Admin and API builds passed.
Web/admin lint passed; all 11 architecture checks passed. No dependencies were
upgraded and no package-lock changes occurred.

## Deployment changes

Prepared source changes, including the work already present at the start:

- Root `test` and `lint` commands cover existing application suites; API build
  builds shared types first.
- Web production API configuration fails when its required public URL is missing.
- Netlify production contexts set each frontend's public API URL.
- Web Next.js response headers read the shared security-header module; the
  architecture guard checks that the Netlify CDN copy agrees.
- Admin configuration adds baseline response headers and report-only CSP.
- API environment example removes unused legacy variables and lists both local
  frontend origins.
- Internal gate regression tests cover credentials, denial headers, and failure
  when environment values are absent. The misleading comment that Phase 4 forbids
  configuring credentials was corrected.
- Explicit read-only database audit script inspects schema/migrations/counts.
- Root ignore rules exclude private `.env.*` files and retain `.env.example`.
- Deployment documentation records Render's workspace-root requirement, actual
  variable names, provider evidence, migration safeguards, and rollback limits.
- `next-env.d.ts` reflects the normal generated production route-types path.

No dashboard settings changed. No deployment, migration, database write,
credential rotation, email send, commit, or push was performed.

## Environment configuration

Names only; host values and scopes are not verified.

| Application | Required/configured variable names |
|---|---|
| Web | `NEXT_PUBLIC_API_URL`, `INTERNAL_AREA_USER`, `INTERNAL_AREA_PASSWORD` |
| Admin | `VITE_API_URL` |
| API | `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`, `PRE_CONSULTATION_RECIPIENT` |
| Disposable tests only | `TEST_DATABASE_URL` |

The application uses `RESEND_FROM_EMAIL`, not `EMAIL_FROM`. The API uses separate
access/refresh JWT secrets. Internal-area credentials are web server variables.
Legacy SendGrid/SMTP host configuration has not been inspected or removed.

## Database verification

The existing ignored local API connection was used only for a `BEGIN READ ONLY`
transaction, with a statement timeout, then rolled back. Connection: PASS.
Nine expected tables exist: `admin_users`, `audit_logs`, `contacts`, `email_logs`,
`projects`, `refresh_tokens`, `schema_migrations`, `services`, `testimonials`.
Schema metadata includes contact security fields, project results stored as text
(the serializer normalizes the API representation), service
short/full descriptions, and the testimonial source columns.

All six migration names are recorded: `000_init_schema`,
`001_add_refresh_tokens`, `001_add_security_fields`, `002_add_audit_logs`,
`003_lock_admin_signup`, `004_normalize_contact_status`. No pending registered
migration was found in this connection.

Aggregate counts: projects 0, services 5, testimonials 3, contacts 2,
email_logs 7, admin_users 1. Public API counts match the first three, supporting
but not proving that Render uses this database. Production identity: UNCONFIRMED.
Backup/snapshot and restore capability: UNCONFIRMED.
Controlled production write: **NOT RUN — SAFETY**.

A separate local disposable PostgreSQL server was created for migration tests
and production-mode API startup. The destructive migration suite ran only there.
Actual `npm start --workspace accian-backend` passed with production mode,
TLS database connectivity, an explicit supplied port, and `/health` returning 200.
The temporary startup did not send email. Temporary API/web verification
servers and the disposable PostgreSQL server were stopped after verification. Production database migrations were
not run. The existing startup invokes the idempotent migrator in both CLI/server.

## Resend verification

Production domain status: NOT VERIFIED. Sending permissions: NOT VERIFIED.
Actual sender: NOT VERIFIED. Controlled provider send/receipt: NOT RUN.
A controlled recipient and hosting/provider access were requested; none was
available during this run. No email was sent or fabricated as delivered.

Source uses Resend and has no active SendGrid transport dependency. Legacy sender
fallback names remain for compatibility. Local tests verify HTML escaping,
provider-error redaction, email failure contracts, and persistence behavior with
stubbed delivery. These tests do not establish real provider acceptance or receipt.
Contact submissions produce confirmation plus business notification; any future
single controlled test must account for both recipients. Pre-consultation delivery
and attachment rendering also remain unverified.

## Smoke tests

PASS below is scoped to the described probe, not a full browser or business-flow
claim. No browser automation capability or authenticated session was available.

| Area | Test | Result |
|------|------|--------|
| Web | Homepage document and referenced scripts | PASS — HTTP 200, scripts downloaded |
| Web | Services document | PASS — HTTP 200; browser rendering not verified |
| Web | Projects | NOT RUN — no dedicated route; `/projects` is expected 404, API empty |
| Web | Testimonials | PARTIAL — API DTO verified; no dedicated route (`/testimonials` 404); homepage rendering unverified |
| Web | Contact document | PASS — HTTP 200; valid submission not run |
| Web | Research support | PASS — HTTP 200 |
| Web | Pre-consultation | PASS — HTTP 200; delivery not run |
| Web | Privacy policy | PASS — HTTP 200 |
| Web | Internal gate, unauthenticated/wrong/malformed | FAIL — 503 each; production environment unconfigured |
| Web | Internal gate, valid rotated credential | NOT RUN — rotation unavailable |
| API | Health | PASS — HTTP 200, healthy, production |
| API | Public endpoints | PASS — services 5, projects 0, testimonials 3 |
| API | Trusted-origin CORS and OPTIONS | PASS — explicit web/admin origins, credentials true |
| API | Unrelated-origin CORS and OPTIONS | PASS — 403, no allow-origin header |
| API | Protected dashboard/contacts without authentication | PASS — HTTP 401 |
| API | Empty contact payload | PASS — HTTP 400 |
| API | Malformed JSON | PASS — HTTP 400 |
| API | Empty login payload | PASS — HTTP 400; not proof of invalid valid-shaped credentials |
| Admin | Homepage and SPA dashboard document | PASS — HTTP 200 |
| Admin | Login/session | NOT RUN — authenticated access unavailable |
| Admin | Dashboard | NOT RUN — authenticated access unavailable |
| Admin | Projects | NOT RUN — authenticated access unavailable |
| Admin | Services | NOT RUN — authenticated access unavailable |
| Admin | Testimonials | NOT RUN — authenticated access unavailable |
| Admin | Contacts | NOT RUN — authenticated access unavailable |
| Email | Resend delivery | NOT RUN — controlled recipient/account access unavailable |

## End-to-end business flows and failure behavior

| Flow | Evidence | Production result |
|---|---|---|
| A — Contact → database → email | Invalid input rejected; persistence/delivery contracts pass local tests | NOT RUN — SAFETY for real write/send until controlled recipients established |
| B — Admin project → database → web | Local controller/DTO tests pass; public list is empty | NOT RUN — SAFETY for CRUD; authenticated access absent |
| C — Admin testimonial → database → web | Live DTO has name, position, company, message, image, createdAt | PARTIAL read verification; CRUD NOT RUN — SAFETY |
| D — Services → web | API returns canonical shortDescription; homepage maps it to display description in source | PARTIAL — runtime browser display unverified |
| E — Dashboard → database | Read-only DB aggregate counts available | NOT RUN — protected dashboard comparison needs a session |

Malformed JSON, unrelated origins, unauthenticated protected requests, and invalid
contact/login payloads returned controlled responses without detected stack,
connection-string, or provider-key leakage. Invalid authenticated project/testimonial
submissions were not run without a session. API unavailability, invalid response,
and provider-failure contracts are covered locally; production infrastructure was
not disrupted to simulate them. User-facing browser errors remain unverified.

## Security verification

- HTTPS production endpoints returned responses with HSTS. All three HTTP URLs returned 301 redirects
  to the corresponding HTTPS URLs.
- Live API serves Helmet headers including CSP/frame/content-type protection.
- Live web HTML lacks CSP and X-Frame-Options: FAIL. Prepared correction verified
  on local production server; still requires deployment and a browser CSP check.
- Live admin lacks prepared baseline headers/CSP: FAIL. Report-only CSP is prepared
  and must be assessed before any enforcement decision.
- Internal gate is closed (503), but credential rotation is incomplete: BLOCKED.
- Local web gate returned 401/401/401/200 for none/wrong/malformed/valid throwaway
  credentials; these are local checks, not production credential verification.
- CORS/preflight boundaries passed live; no wildcard accepted origin was observed.
- Pattern scan inspected 206 tracked files at baseline and 2,127 reachable history objects.
  Two credential-shaped matches refer to the same deliberate fictitious database
  URL in `errorHandler.test.ts` (current source/history), not deployment credentials.
  History still contains the known compromised internal password; rotation is
  mandatory and history was not rewritten.
- No private `.env` files are tracked. No deployment credential was added.
- Downloaded homepage/admin script chunks and fresh local frontend bundles contained
  no matches for the named backend secret variables or available local secret values.
  Known old internal password was extracted without printing it and absent from
  downloaded homepage chunks and fresh web bundles. This is a scoped pattern scan,
  not proof that every historical credential or every production chunk is safe.
- Downloaded web/admin chunks target the production API; no localhost-with-port or
  old onrender API URL matches were found in those chunks.
- `npm audit` reports 19 advisories in the final clean-install audit: 2 critical, 15 high, 1 moderate, 1 low. Next is
  among the affected direct dependencies. No broad upgrade or audit fix was applied;
  assess affected functionality and targeted remediation separately. The earlier
  working-tree audit reported 16; the final clean-install audit is the count
  reported here. The lockfile hash did not change.

## Deployment reproducibility

A fresh export of the candidate source was created without existing dependencies,
private `.env` files, or build output. This checks the uncommitted candidate rather
than claiming it is already available as a Git checkout. `npm ci` and all three
builds were run there with only the public API URL build variables. **PASS**: fresh `npm ci`, web build, admin build, and API build all completed.
The root lockfile remained byte-for-byte identical to the baseline hash.

Commands: `npm ci`; `NEXT_PUBLIC_API_URL=https://api.accian.co.uk npm run build:web`;
`VITE_API_URL=https://api.accian.co.uk npm run build:admin`; `npm run build:api`.

## Known limitations

No hosting account access, production admin session, controlled email recipient,
confirmed production database identity, backup, deploy IDs, or rollback target
was supplied. Production credential rotation and deploying prepared headers are
critical outstanding work. Account settings, logs, provider receipt, authenticated
CRUD, dashboard counts, browser console/rendering, and controlled error UX remain
unverified. Existing ServicesPage uses static service content; homepage uses live
API summaries. No feature rewrite was undertaken to change that architecture.

## Rollback

Independent Netlify publish-previous-deploy and Render rollback procedures are
documented. Actual target IDs and dashboard rollback availability: NOT VERIFIED.
No rollout occurred, so no rollback was executed. Database rollback requires
confirmed backup and schema compatibility; the hardcoded migration-down script
must not be used as a general rollback. Never restore the compromised password.

## Final verdict

**BLOCKED**
