# ACCIAN — Deployment

How the three applications in this repository are built and deployed, what must
be configured outside version control, and what could not be verified from
source.

This document records the state after Phase 2 (monorepo consolidation). It
describes deployments that have **not yet been performed** from this layout —
see [What has not been verified](#what-has-not-been-verified).

---

## 1. The shape of the deployment

One repository, three independently deployable applications. They do not share
a build, a process, or a runtime.

| Application | Path | Hosting | Public URL | Framework |
|---|---|---|---|---|
| Public site | `apps/web` | Netlify | `https://accian.co.uk` | Next.js 16 (SSR via `@netlify/plugin-nextjs`) |
| Admin | `apps/admin` | Netlify | `https://admin.accian.co.uk` | Vite + React (static SPA) |
| API | `apps/api` | **Unknown — see §5** | `https://api.accian.co.uk` | Express 5 (Node, CommonJS) |

The two Netlify applications are **separate Netlify sites**, both connected to
this same repository. That is why there is deliberately **no `netlify.toml` at
the repository root**: Netlify applies a root configuration file to every site
connected to the repo, which would make the public site and the admin fight
over the same build settings. Each app carries its own instead:

- `apps/web/netlify.toml`
- `apps/admin/netlify.toml`

Netlify looks for configuration in this order: **package directory → base
directory → repository root.**

---

## 2. Required dashboard changes

**Neither Netlify site will build until these are changed.** Before
consolidation, each app was the root of its own repository, so no base or
package directory was needed. The apps have moved, and a Netlify site cannot
discover that on its own.

In each site: **Project configuration → Build & deploy → Continuous deployment
→ Build settings → Configure.**

### Public site (`accian.co.uk`)

| Setting | Value |
|---|---|
| Package directory | `apps/web` |
| Base directory | *(empty — the repository root)* |
| Build command | `npm run build:web` |
| Publish directory | `apps/web/.next` |

### Admin (`admin.accian.co.uk`)

| Setting | Value |
|---|---|
| Package directory | `apps/admin` |
| Base directory | *(empty — the repository root)* |
| Build command | `npm run build:admin` |
| Publish directory | `apps/admin/dist` |

### Why base directory stays at the repository root

npm workspaces keep a **single lockfile at the workspace root**, and Netlify
installs dependencies from the **base directory**. Pointing base at `apps/web`
would leave npm looking for a `package-lock.json` that is not there, and it
would fall back to an unpinned `npm install`.

The **package directory** tells Netlify which application a site builds without
moving the install away from the workspace root. It can **only be set in the
Netlify UI** — there is no `netlify.toml` key for it. This is the one piece of
each site's configuration that cannot be reproduced from source.

### Build scoping (optional, recommended)

With base at the repository root, **a change anywhere in the repo triggers a
build of both sites.** To stop the admin rebuilding when only the public site
changed, add an [ignore command](https://docs.netlify.com/build/configure-builds/ignore-builds/)
to each site. This was not configured as part of Phase 2 because it changes
deploy behaviour and should be verified against a real deploy first.

---

## 3. Environment variables

**No secret values appear in this document or anywhere in this repository.**
Variable names and their purpose only. The values live in each host's dashboard.

### `apps/web` — public site (Netlify)

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | API base URL. `NEXT_PUBLIC_`-prefixed, so it is **embedded in the client bundle** and is not a secret. |
| `INTERNAL_AREA_USER` | Yes | Basic-auth username for the `/internal/*` gate added in Phase 1. **Secret.** |
| `INTERNAL_AREA_PASSWORD` | Yes | Basic-auth password for the same gate. **Secret.** |

If `INTERNAL_AREA_USER` / `INTERNAL_AREA_PASSWORD` are unset, the gate in
`apps/web/proxy.ts` **fails closed**: `/internal/*` returns `503` with an empty
body rather than serving the page. That is deliberate — an unconfigured gate
must not expose the content it guards.

### `apps/admin` — admin SPA (Netlify)

| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_URL` | Yes, for production builds | API base URL. |

`VITE_`-prefixed variables are **compiled into the JavaScript bundle at build
time** and are readable by anyone who loads the site. Never put a secret here.

`apps/admin/.env` is **tracked in git**, which is normally a mistake. It is kept
because it holds exactly one variable — `VITE_API_URL`, pointing at
`api.accian.co.uk` — which is public by construction: it ships inside the bundle
either way. It is how the admin has been getting its production API URL.
Removing it would change the build. **No credential is stored in it.** If a
secret is ever needed by the admin, it must not go in this file.

In a production build, `resolveAdminApiBase()`
(`apps/admin/src/services/apiConfig.ts`) **throws** if `VITE_API_URL` is unset,
rather than silently falling back to a development origin.

### `apps/api` — Express API

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string. **Secret.** |
| `DB_PASSWORD` | Yes | Database password. **Secret.** |
| `JWT_ACCESS_SECRET` | Yes | Signing key for access tokens. **Secret.** |
| `JWT_REFRESH_SECRET` | Yes | Signing key for refresh tokens. **Secret.** |
| `RESEND_API_KEY` | Yes | Resend credential. **Secret.** Belongs to `apps/api` only — never to `apps/web` or `apps/admin`. |
| `RESEND_FROM_EMAIL` | Yes | Verified sender address. Must be on a domain verified in Resend (§ below). |
| `ADMIN_EMAIL` | Yes | Recipient for contact-form notifications. Without it, admin notifications fail and say so by name. |
| `SENDGRID_API_KEY` | **Remove** | Former provider. No longer read by any code. Delete it from the host. |
| `SENDGRID_FROM_EMAIL` | Deprecated | Still honoured as a fallback sender so a half-renamed environment keeps working. Rename to `RESEND_FROM_EMAIL`; the API logs a warning while it is in use. |
| `EMAIL_USER` | — | Legacy sender address; see `docs/known-issues.md`. |
| `FRONTEND_URL` | **Should be set** | Comma-separated CORS allowlist. See the warning below. |
| `NODE_ENV` | Yes | Must be `production` in production. |
| `PORT` | Host-dependent | Listen port. |
| `TEST_DATABASE_URL` | Tests only | Database for the migration test suite. Never a production database. |

`apps/api/.env` is **not** tracked. `apps/api/.env.example` is tracked and
contains no values.

> **`FRONTEND_URL` warning.** If it is unset, the API falls back to a hardcoded
> production allowlist (`accian.co.uk`, `www.accian.co.uk`,
> `admin.accian.co.uk`). CORS keeps working, so **a missing variable is
> invisible until someone needs to change an origin.** The value is also split
> on `,` **without trimming whitespace**: `"a.com, b.com"` yields `" b.com"`,
> which will never match an `Origin` header. Do not put spaces after the commas.

### Email provider: SendGrid → Resend

The API sends two emails per contact-form submission: a confirmation to the
person who submitted, and a notification to `ADMIN_EMAIL`. Phase 3 replaced
SendGrid with Resend. `@sendgrid/mail` is no longer a dependency.

The provider sits behind `apps/api/src/services/emailProvider.ts`. Templates,
placeholder substitution, HTML escaping and `email_logs` are unchanged — the
migration changed only how a message leaves the process.

**Cutover, in order:**

1. Verify the sending domain in Resend (below). Nothing sends until this is done.
2. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` on the API host.
3. Deploy.
4. Confirm a real submission produces both emails and two `sent` rows in
   `email_logs`.
5. Only then remove `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` from the host.

Step 5 is last on purpose: while `SENDGRID_FROM_EMAIL` is still set, it acts as
a fallback sender, so a partially-renamed environment keeps sending from the
right address instead of silently falling back to the hardcoded
`noreply@accian.co.uk`.

**Domain verification (DNS).** Resend will not deliver from a domain it has not
verified. The records are generated per-domain in the Resend dashboard —
**they are not reproduced here, because they are account-specific and inventing
them would produce a domain that silently fails to send.** Retrieve them from
Resend → Domains → add `accian.co.uk` → follow the records it displays.

Expect to add, at the registrar that holds `accian.co.uk` DNS:

- a **DKIM** record (a `TXT` or `CNAME` record on a Resend-provided selector
  subdomain), and
- an **SPF** record (a `TXT` record on the sending subdomain), and
- optionally a **DMARC** policy record on `_dmarc.accian.co.uk`.

If `accian.co.uk` already publishes an SPF record for another sender, it must
be **merged**, not duplicated — a domain with two `TXT` SPF records fails SPF
outright. No DNS change has been made as part of this phase.

`RESEND_FROM_EMAIL` must be an address on the verified domain. A verified
domain plus an unverified `From` address is the most common cause of a
`validation_error` from the provider.

**Key handling.** `RESEND_API_KEY` is read only inside `emailProvider.ts`, at
send time. It is never logged, never returned to an API client, and never
placed in an error message: provider errors pass through `redactProviderMessage`,
which strips key- and address-shaped substrings before anything is written to
stdout or to `email_logs.error_message`. It must not be added to `apps/web` or
`apps/admin` in any form — a `VITE_`-prefixed copy would ship inside the browser
bundle.

**Tests never send.** `setEmailTransport` replaces the transport in the suite,
and the real transport refuses to construct a client at all under
`NODE_ENV=test`, so the suite cannot reach the provider even if a real key is
present in the environment.

---

## 4. Node version

**Node 22.** Verified, not assumed — all three applications already agreed
before consolidation:

- `apps/web/package.json`, `apps/api/package.json`, `apps/admin/package.json`
  each declare `"engines": { "node": ">=22.0.0 <23" }`.
- Each app tracks a `.nvmrc` containing `22`, and the repository root now does
  too.

There is **no conflict** between the three, so no version had to be chosen.

Netlify reads `.nvmrc` from the **base directory** — the repository root — which
is why the root `.nvmrc` matters. The per-app files are kept so each app still
declares its own requirement.

---

## 5. The API deployment is not reproducible from source

**This is the single largest gap in this document, and it predates Phase 2.**

The API has **no deployment configuration in version control** — no
`Dockerfile`, no `Procfile`, no `render.yaml`, no `fly.toml`, no `vercel.json`,
no `app.yaml`, no CI workflow. This was confirmed by searching all three
repositories, tracked and untracked, before and after consolidation.

`api.accian.co.uk` demonstrably serves traffic, so something hosts it. What that
is, and how it is configured, exists **only in a hosting dashboard that cannot
be read from this repository.**

Before the first deploy from this layout, a human must record here:

- [ ] Hosting provider and region
- [ ] Repository and branch the deploy tracks
- [ ] **Root/base directory** — this **must** be updated to `apps/api`
- [ ] Build command — expected: `npm run build:api` (or `npm run build` inside `apps/api`)
- [ ] Start command — expected: `npm start` inside `apps/api`, which runs
      `node dist/migrations/cli.js && node dist/server.js`
- [ ] Node version configured on the host
- [ ] Environment variables set there (names only — never values)
- [ ] PostgreSQL host, and whether it is reachable only from the app's network
- [ ] Whether TLS terminates at a proxy in front of the app

> **The API runs database migrations on every start.** `npm start` is
> `node dist/migrations/cli.js && node dist/server.js`. A deploy is therefore
> also a migration. Know what the pending migrations do before deploying.

### `apps/api/dist/` is committed

39 build artifacts are tracked. They were left in place during Phase 2 —
removing them is a behavioural risk, because **if the host does not run a build
step, the committed `dist/` is what actually runs.** Until §5 is answered, that
cannot be ruled out. See `docs/known-issues.md`.

---

## 6. Building locally

From the repository root:

```bash
nvm use            # Node 22, per .nvmrc
npm install        # installs all workspaces from the single root lockfile

npm run build:web      # Next.js production build
npm run build:admin    # tsc -b && vite build
npm run build:api      # tsc, then copy templates and .sql migrations into dist/

npm run lint:web
npm run lint:admin
npm run test:api       # requires TEST_DATABASE_URL for the migration suite
npm run test:admin

npm run guards         # structural checks on the monorepo layout
```

Every one of these commands is wired to a script that already exists in the
corresponding application. None were invented for the sake of a tidy README.

Development servers (`npm run dev:web`, `npm run dev:admin`) run the app's own
`dev` script. **`apps/api` has no working `dev` script** — it points at a file
that does not exist, a bug that predates Phase 2 and was left alone because
fixing it is out of scope. Run the API with `npm run build:api` then
`npm start --workspace accian-backend`. See `docs/known-issues.md`.

---

## 7. Dependencies and the lockfile

There is **one lockfile**, at the repository root. The three per-app lockfiles
were removed — npm workspaces resolves the whole tree into a single file, and a
stray lockfile inside a workspace silently overrides that. `npm run guards`
checks this.

Consolidating the lockfiles **re-resolved 37 direct dependencies** to newer
versions within their declared `^` ranges — among them `react 19.2.4 → 19.3.0`,
`next 16.2.0 → 16.3.5` and `pg 8.16.3 → 8.23.0`. Deleting a lockfile makes npm
resolve every range from scratch, which is exactly what a committed lockfile
exists to prevent.

Those upgrades were **reverted.** Every direct dependency now resolves to the
version it had before the move, and the declared ranges in each `package.json`
are unchanged. Verified mechanically: a comparison against the three original
lockfiles reports **zero** direct-dependency differences. Phase 2 moved files; it
did not upgrade anything.

The root `package.json` carries one `overrides` entry:

```json
"overrides": { "framer-motion": { "motion-dom": "12.23.23", "motion-utils": "12.23.6" } }
```

This is not a preference — it is a correctness fix. `framer-motion@12.23.26`
imports `activeAnimations` from `motion-dom`, declaring the range `^12.23.23`. A
fresh resolve satisfies that range with `12.43.0`, which **no longer exports that
symbol**, and the admin's Vite build fails. The original lockfile had pinned
`motion-dom` to `12.23.23`. Pinning direct dependencies alone does not reach it,
and an `overrides` block inside `apps/admin/package.json` is **ignored** — npm
only honours overrides from the workspace root. Hence the nested form above.

> **Platform-specific binaries.** Some packages (Next's SWC compiler, Tailwind's
> oxide, Vite's rollup, lightningcss) ship a separate prebuilt binary per
> OS/architecture as optional dependencies. An *incremental* `npm install`
> records only the current platform's, which prunes the others from the lockfile
> and makes Next.js attempt a self-patch that fails inside a workspace
> (`ENOWORKSPACES`). The committed lockfile was generated by a **clean** install
> and contains all 8 `@next/swc-*` entries, so Linux, macOS and Windows all
> install correctly. If they ever go missing, restore with
> `rm -rf node_modules package-lock.json && npm install` — and note that
> `npm install --package-lock-only --include=optional` makes it worse, removing
> them entirely. See `docs/known-issues.md`.

`npm ci` was verified to be **idempotent** against this lockfile: it installs
without rewriting the file, byte for byte.

### `@accian/types` is a compile-time-only dependency of `apps/api`

`packages/types` holds the shared API contract. `apps/api` consumes it, but
**only as types** — every import of it in the API is a type-only import, so
TypeScript erases it during compilation and the name appears nowhere in
`apps/api/dist/`.

This is deliberate, and it is why the package is declared in the API's
**`devDependencies`** rather than its `dependencies`:

- §5 records that the API's root directory must be `apps/api`, and **which host
  runs it is not known from this repository.**
- If that host runs `npm install` inside `apps/api` alone, rather than from the
  repository root, there is no workspace symlink and `@accian/types` does not
  resolve at all.
- Because the dependency is erased at compile time, that install still produces
  a working API. A runtime import would crash the process on boot.

Verified, not assumed: after a production build, `@accian/types` is absent from
the API's `require` graph, and its runtime exports appear **zero** times in the
admin's browser bundle.

The practical rule: **never add a value import of `@accian/types` to
`apps/api`** — no enums, no constants, no runtime helpers, only `import type`.
Doing so would turn a compile-time dependency into a runtime one and break a
host that installs inside `apps/api`.

The same applies to `resend`, in the opposite direction: it *is* a genuine
runtime dependency of `apps/api` and is declared in `dependencies`. It must
never be added to `apps/web` or `apps/admin`.

> **Platform-specific binaries.** See §7 — the committed lockfile contains all
> 8 `@next/swc-*` platform entries, so Netlify (Linux x64), macOS and Windows
> all install correctly.

---

## 8. What has not been verified

Stated plainly, because the difference matters:

| Checked | How |
|---|---|
| All three apps build from the monorepo | Run locally — `build:web` (7 routes + middleware), `build:admin`, `build:api` |
| API test suite — 109 pass, 0 fail, 0 cancelled, 0 skipped | Run locally against a real PostgreSQL database |
| Admin test suite — 19 pass, 0 fail, 0 cancelled, 0 skipped | Run locally |
| Lint clean for web and admin | `lint:web` and `lint:admin`, both 0 errors 0 warnings |
| Migration files resolve after relocation | The migration suite ran against a live database, not skipped |
| Monorepo structure invariants | `npm run guards` — 9 checks |
| No secrets in the Phase 2 change set | Pattern scan over every added/modified file |
| `npm ci` reproduces the lockfile exactly | Compared byte for byte before and after |

| **Not checked** | **Why** |
|---|---|
| That either Netlify site deploys from this layout | Requires a deploy. The dashboard changes in §2 have not been made. |
| That the API deploys from this layout | Requires §5 to be answered first. |
| That production URLs still serve correctly | Requires a deploy. |
| That the `/internal/*` gate works in production | Netlify-level headers are not applied by a local `next start`. |
| Response headers in production | `netlify.toml` is not involved locally. Verify with `curl -sI <deploy-preview-url>`. |
| Anything about the production database | Deliberately untouched. |

**Nothing in this repository has been deployed.** No commit has been pushed.

### Verifying after the first deploy

```bash
# Response headers actually served (deploy preview, not localhost)
curl -sI https://<deploy-preview>.netlify.app | grep -iE 'content-security-policy|strict-transport'

# The internal gate: expect 401 without credentials
curl -si https://<deploy-preview>.netlify.app/internal/quote-builder | head -1

# API reachability and CORS
curl -si https://api.accian.co.uk/api/services -H 'Origin: https://accian.co.uk' | head -20
```

---

## 9. Rollback

The three original repositories still exist and are **unchanged**:

- `bobprince4u/accian` — the public site, now this repository's root
- `bobprince4u/accian-backend`
- `bobprince4u/admin`

None has been pushed to. Their last commits before consolidation were
`e40c0fc`, `be5e464` and `a877ba2` respectively, and **all three remain
reachable in this repository's history** — the consolidation preserved all 157
commits rather than starting fresh.

**Do not delete or archive the two source repositories** until a full deploy and
verification cycle has completed for all three applications.
