# ACCIAN — Deployment

Verified on 6 October 2026 (Africa/Lagos). Phase 4 is **BLOCKED** pending
hosting access, credential rotation, a controlled delivery test, and authenticated
business-flow verification. Source configuration and live production observations
are different evidence: no deployment was performed during this verification.
See [the Phase 4 report](phase4-production-report.md) for results and limitations.

## Repository and topology

Repository: `github.com/bobprince4u/accian`; local directory:
`~/Desktop/ACCIAN-PROJECT/accian`. Current branch: `master`.

| Application | Workspace | Provider observed | Production URL |
|---|---|---|---|
| Web | `apps/web` (`accian`) | Netlify response headers | https://accian.co.uk |
| Admin | `apps/admin` (`admin`) | Netlify response headers | https://admin.accian.co.uk |
| API | `apps/api` (`accian-backend`) | Render origin, Cloudflare response headers | https://api.accian.co.uk |
| Shared types | `packages/types` (`@accian/types`) | Built dependency; no runtime | — |

Web/admin communicate with the API over HTTPS. Only the API connects to
PostgreSQL and Resend. There are three independent deployments and runtimes.
Node must be 22, as specified by root and application `.nvmrc` files and engines.
Verification used Node 22.21.1 and npm 11.8.0.

## Netlify settings

These are the prepared source settings. Project IDs, deployment SHAs, repository
links, deployed branch, dashboard values, and environment scopes have not been
read from either account. Confirm them before deploying.

| Setting | Web | Admin |
|---|---|---|
| Config file | `apps/web/netlify.toml` | `apps/admin/netlify.toml` |
| Package directory (dashboard) | `apps/web` | `apps/admin` |
| Base directory | Empty: repository root | Empty: repository root |
| Build command | `npm run build:web` | `npm run build:admin` |
| Publish directory | `apps/web/.next` | `apps/admin/dist` |
| Node | 22 | 22 |
| Public API variable | `NEXT_PUBLIC_API_URL` | `VITE_API_URL` |

Both API URL variables must target `https://api.accian.co.uk`. They are public
build-time values, not credentials. Production contexts in the TOML files set
these URLs; preview contexts must also configure the required public API URL.
The root lockfile and workspace types must be available during installation.
There is no root `netlify.toml`, because each site has its own configuration.

Netlify's [monorepo documentation](https://docs.netlify.com/build/configure-builds/monorepos/)
describes the package-directory setup. Package directory is a dashboard setting.
Keep the base at the workspace root; use the application package directory to
select its configuration file. Verify the resolved settings in the deploy log.

The web uses Next.js 16 and `@netlify/plugin-nextjs`. `.next` is adapter input,
not a directory to serve as an ordinary static site. Next headers come from
`apps/web/config/securityHeaders.ts`; CDN headers repeat them in Netlify TOML.
`npm run guards` checks that both declarations agree. Local `next start` now
serves them, but live HTML still lacks CSP and X-Frame-Options until deployment.
Existing HTTP redirects remain in place. `/internal/*` is protected by the
server-side proxy, independently of the existing Netlify role redirect.

Admin SPA fallback lives in `apps/admin/public/_redirects` and is copied by
Vite. `/AdminDashboard` currently returns HTTP 200. Prepared admin headers add
HSTS, frame protection, content-type protection, referrer and permissions policies.
CSP is report-only pending an authenticated browser check; it does not yet enforce
resource restrictions. Do not describe it as an enforcing CSP.

## Render API configuration

Production responses include `x-render-origin-server: Render` and `rndr-id`.
The service name/ID, region, plan, source repository, deployed SHA, branch,
commands, environment, and proxy topology still require dashboard confirmation.
No existing Render manifest was found, and none has been invented.

**Use the repository root as Render's Root Directory (empty), with the API
workspace selected by commands.** Although the application is in `apps/api`,
setting Render Root Directory to that path is incompatible with this workspace:
Render makes files outside that directory unavailable, including root
`package-lock.json` and `packages/types`. This restriction is explicit in
[Render's monorepo documentation](https://render.com/docs/monorepo-support).

| Setting to confirm/configure | Prepared value |
|---|---|
| Repository | `https://github.com/bobprince4u/accian` |
| Branch | `master`, subject to confirmation of the deployment branch |
| Root Directory | Empty: repository root |
| Build command | `npm ci --include=dev && npm run build:api` |
| Start command | `npm start --workspace accian-backend` |
| Health check path | `/health` |
| Runtime | Node 22 |
| Listen port | Render-provided `PORT` |

Dev dependencies are required at build time for TypeScript and shared types.
The API reads the provided port and listens successfully; its existing local
fallback is 2025. `/health` reports process health, not an active database probe.
There is no separate readiness endpoint. Startup checks database connectivity.
Combined request logging is enabled outside development; inspect logs after deploy.
The code trusts one proxy hop; confirm the actual chain before adjusting it.

**Startup runs migrations twice:** the start script runs the CLI, then the server
calls the same idempotent runner. Both check migration records. Before any deploy
or restart, inspect current schema/history and confirm a provider backup or
restorable snapshot. Do not use the migration test suite on production: it drops
and recreates the public schema. Do not run `migrate:down` as an application
rollback; it targets only migration 001 and is not a general rollback command.

## Production environment matrix

Values for secrets belong in host environments only. Use placeholders in any
handoff document. Neither `NEXT_PUBLIC_*` nor `VITE_*` may contain secrets.

| Host | Variable | Requirement |
|---|---|---|
| Web | `NEXT_PUBLIC_API_URL` | Public API origin, build time |
| Web | `INTERNAL_AREA_USER` | Server-only Basic-auth username, runtime |
| Web | `INTERNAL_AREA_PASSWORD` | New random server-only password, runtime |
| Admin | `VITE_API_URL` | Public API origin, build time |
| API | `NODE_ENV` | Production mode |
| API | `PORT` | Supplied by host |
| API | `DATABASE_URL` | Secret PostgreSQL connection string |
| API | `JWT_ACCESS_SECRET` | Secret access-token signing key |
| API | `JWT_REFRESH_SECRET` | Separate secret refresh-token signing key |
| API | `FRONTEND_URL` | Comma-separated trusted origins |
| API | `RESEND_API_KEY` | Secret sending key |
| API | `RESEND_FROM_EMAIL` | Sender on the verified Resend domain |
| API | `ADMIN_EMAIL` | Controlled business notification recipient |
| API | `PRE_CONSULTATION_RECIPIENT` | Submission recipient; falls back to `ADMIN_EMAIL` |

Actual code uses `RESEND_FROM_EMAIL`, not `EMAIL_FROM`, and two JWT signing
variables rather than `JWT_SECRET`. The internal credentials belong to the web
runtime, not the API. `DB_PASSWORD` is not required by the active database pool.
`TEST_DATABASE_URL` is only for an isolated disposable test database.

Set `FRONTEND_URL` to `https://accian.co.uk,https://admin.accian.co.uk` and add
`https://www.accian.co.uk` only if it is an intended browser origin. The current
parser trims whitespace. Production startup rejects a missing/empty allowlist.
Both primary origins and their preflights passed live; unrelated origins returned
403 without an allow-origin header. Credentialed requests use explicit origins,
never a wildcard.

Remove `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, and obsolete SMTP variables
from the host after verifying the Resend sender. The code still accepts legacy
sender fallbacks (`SENDGRID_FROM_EMAIL`, `EMAIL_USER`); this is compatibility,
not an active SendGrid transport. Do not rely on these fallbacks in production.
The host environment has not yet been inspected, so removal is unverified.
No private environment files are tracked; `.gitignore` excludes `.env.*` while
allowing `.env.example`. Local ignored files are not evidence of host values.

## Internal credential rotation

The old browser-shipped password remains compromised in Git history. Generate a
new high-entropy password in a password manager and store it directly in Netlify's
server environment with `INTERNAL_AREA_USER`. Do not place it in a public variable,
source, log, terminal output, or documentation. Deploy with the runtime values
available, then verify unauthenticated/wrong/malformed credentials return 401
and valid credentials return 200. Also verify `Cache-Control: no-store` on denials.

Current live responses are 503 for all three negative cases: the gate fails
closed because it is unconfigured. Rotation has not been performed. Local
production-server checks with throwaway credentials returned 401/401/401/200.
Do not substitute these local results for production rotation verification.

## PostgreSQL

The ignored local connection points to a Neon hostname. This supports a provider
inference only; the Render connection and Neon project/branch must be confirmed.
A read-only transaction verified the nine expected tables, relevant columns,
and all six migration records in that configured database. No rows were exposed,
written, deleted, or migrated. Backup availability is unconfirmed.

For a deployment: compare migration registry with `schema_migrations`; inspect
SQL and current columns; confirm a restorable backup and rollback implications;
only then run the existing startup process. Use `scripts/phase4-db-readonly.cjs`
for explicit read-only auditing. It prints schema metadata and aggregate counts,
never connection details. Connection errors are suppressed. It uses the existing
PostgreSQL TLS configuration; confirm provider TLS/certificate requirements.

## Resend

The actual sending domain, key permissions, production sender, host configuration,
and delivery are unverified. Intended domain: `accian.co.uk`. Sender format:
`ACCIAN <notifications@verified-domain.example>` or a bare verified-domain address.
The real address is set with `RESEND_FROM_EMAIL`.

Use Resend's dashboard-generated DNS records; do not invent or duplicate SPF
records. Verify the domain before sending. Use a sending-only API key where
possible, scoped to the intended domain. Rotation: create replacement, store
it in the API host, redeploy, perform the agreed single controlled delivery test,
then revoke the former key after success. Never expose a key to browser builds.

A contact submission sends two messages: submitter confirmation and business
notification. Plan one controlled submission with both recipient mailboxes under
control, and verify provider acceptance and actual inbox receipt of both messages.
Record message IDs privately, sender/subject, rendered HTML, escaped user content,
and persisted contact/email-log status. Do not submit repeatedly. Local tests
stub the transport and verify escaping, persistence, and failure contracts;
they do not establish production delivery. Do not disable production email or
break its provider to test failure. Pre-consultation delivery and attachment limits
also need verification before declaring that production flow complete.

## Reproducible commands

From a fresh repository root, with Node 22:

```bash
npm ci
npm test
npm run lint
npm run guards
NEXT_PUBLIC_API_URL=https://api.accian.co.uk npm run build:web
VITE_API_URL=https://api.accian.co.uk npm run build:admin
npm run build:api
```

Set `TEST_DATABASE_URL` only to a disposable database to include real migration
tests. Existing tests refuse real email under test mode. Web build downloads
Google Fonts, so it needs network access. No dependency versions were changed;
root lockfile hash was unchanged after installation. The audit reports 19
advisories in the final clean-install audit, including two critical; dependency remediation requires separate,
scoped assessment rather than broad upgrades in this phase.

## Deployment procedure

1. Review changes and obtain explicit commit/push instructions. No commit or push
   was made during this run. Record current deploy IDs/SHAs and backups first.
2. Merge/push only when instructed; verify auto-deploy effects for all three hosts.
3. Deploy web with the package-directory settings and rotated runtime credentials;
   verify headers, gate, public routes, assets, and browser API requests.
4. Deploy admin with its package-directory settings; verify SPA routing, API target,
   login/refresh/logout, protected lists, and security headers.
5. Deploy API using root workspace commands after migration/backup review;
   verify `/health`, CORS, public endpoints, logs, and authenticated requests.
6. Run smoke tests and compare dashboard counts with the confirmed production DB.
7. Perform the single controlled contact/email test and verify actual receipt.
8. Verify reversible project/testimonial test records through admin/API/DB/web,
   and record cleanup. Verify services and relevant pre-consultation behavior.
9. Update the production report with observed results, deployment IDs, and remaining
   conditions. Never mark an unperformed test PASS.

Local tests of unavailable/invalid API responses cover error contracts without
interrupting production. Authenticated invalid-record tests must use a controlled
session and safe records. An HTTP 200 document is not proof of browser rendering
or successful authenticated business flows.

## Rollback

Netlify: identify each site's previous known-good deploy ID, then use its deploy
history to publish that deployment independently; restore compatible environment
values if they changed. Render: identify the previous successful deploy and use
the service's rollback/redeploy mechanism; verify health, CORS, and DB compatibility.
Record target IDs before deployment. Dashboard availability and target IDs have
not been verified, so these are procedures awaiting confirmation, not a tested
rollback path. Application rollback does not undo database migrations or rotate
secrets back to compromised values. Confirm backup/restore capability separately.
