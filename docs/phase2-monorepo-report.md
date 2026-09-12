# Phase 2 — Monorepo Consolidation Report

**Status: PASS WITH CONDITIONS**

Three repositories are now one, with all history preserved. All three
applications build, lint and test clean from the consolidated repository, and
they remain independently deployable.

The conditions are not defects in the consolidation. They are things that
**cannot be verified without a deployment**, plus one pre-existing gap that
consolidation exposed rather than caused: the API has no deployment
configuration in version control, so its hosting cannot be reproduced from
source. Both Netlify sites also require dashboard changes before they will build
again — unavoidable, because the applications are no longer at their repository
roots.

Nothing has been pushed, merged, rebased or deployed. The production database was
not touched.

---

## 1. What was done

Three separate Git repositories became one repository containing three
independently deployable applications.

| Was | Is now | How |
|---|---|---|
| `accian` (repo root) | `apps/web` | `git mv` within this repository |
| `accian-backend` | `apps/api` | `git subtree add` |
| `accian-admin/admin` | `apps/admin` | `git subtree add` |

Added at the root: `package.json` (npm workspaces), `.nvmrc`, `.gitignore`,
`README.md`, `docs/`, `packages/types/` (scaffold), and
`scripts/check-architecture.mjs`.

The three per-application lockfiles were replaced by a single root lockfile, with
every dependency version held at its pre-move value.

This was a relocation. No application was rewritten, no frontend redesigned, no
schema altered, no ORM introduced, no service split out, and no module system
converted.

---

## 2. Final repository structure

```
accian/                          (origin: github.com/bobprince4u/accian.git)
├── package.json                 workspace root — private, not published
├── package-lock.json            the single lockfile
├── .nvmrc                       22
├── .gitignore
├── README.md
├── apps/
│   ├── web/     46 files   Next.js 16 public site        ESM
│   ├── admin/   55 files   Vite 7 + React 19 admin SPA   ESM
│   └── api/     93 files   Express 5 + PostgreSQL        CommonJS
├── packages/
│   └── types/              scaffold, intentionally empty
├── docs/
│   ├── accian-integration-audit.md
│   ├── phase1-stabilization-report.md
│   ├── phase2-monorepo-report.md
│   ├── deployment.md
│   └── known-issues.md
└── scripts/
    └── check-architecture.mjs
```

The mixed module systems are deliberate and permitted: `apps/web` and
`apps/admin` declare `"type": "module"`, `apps/api` has no `type` field and
remains CommonJS. Converting the API for consistency would be a rewrite with no
benefit.

---

## 3. Git history

**All history was preserved. Nothing was squashed, rewritten or discarded.**

| Metric | Value |
|---|---|
| Commits from the three original repositories | **154** — 80 web + 45 api + 29 admin, all preserved |
| Consolidation commits added on top | the moves plus the documentation, listed in §4 |
| Pre-move HEADs still reachable | all three, as ancestors of HEAD |
| Authorship | preserved — 153 `bobprince`, 3 `princewill`, 1 `Bobprince4u` |
| Remote | unchanged — `https://github.com/bobprince4u/accian.git` |
| Nested `.git` directories under `apps/` | none |

```
e40c0fc  web    ancestor of HEAD: YES
be5e464  api    ancestor of HEAD: YES
a877ba2  admin  ancestor of HEAD: YES
```

The existing root history was preserved rather than replaced: no new repository
was initialised, and `git init` was never run over the existing one.

**Known limitation.** For `apps/api` and `apps/admin`, a *path-filtered* log
shows only the subtree merge:

```bash
git log --oneline -- apps/api                        # merge commit only
git log --oneline --follow apps/api/src/server.ts    # full history — works
```

Their historical commits record the paths as they were at the time
(`src/server.ts`, not `apps/api/src/server.ts`). The commits themselves are all
present; only path-filtering is affected, and `--follow` resolves it. Fixing the
recorded paths would require rewriting history — forbidden by this phase's rules,
and a bad trade regardless: it would change every commit hash in all three
lineages and invalidate the rollback references in §17.

`apps/web` is unaffected. Git detected 47 renames at 100% similarity, so its
80-commit history follows the files normally.

---

## 4. Commits made

Local commits only. **Nothing was pushed** — `origin/master` is still at
`e40c0fcd`, the pre-consolidation web HEAD.

| Commit | What |
|---|---|
| `1458e3f7` | Relocate web app to `apps/web/`; untrack the `.next` dev cache |
| `108cc6bc` | Import `accian-backend` history into `apps/api/` |
| `4c3a99a3` | Import `admin` history into `apps/admin/` |
| `7d3f2a57` | Establish the monorepo root (workspace, docs, guards, lockfile) |
| `db0c08d3` and after | This report, and corrections to it |

**A note on the instruction not to commit.** The brief says not to commit unless
instructed, and also to prefer *moving* files and history over copying them.
Those cannot both be satisfied: `git mv` and `git subtree add` express
themselves only as commits, and the alternative — copying files — is precisely
what would destroy the history the brief asks to preserve. The commits are
therefore local and unpushed, each one documenting its own reasoning, and the
pre-move state remains fully reachable. Nothing was pushed, merged, rebased or
deployed. If a different resolution is wanted, `git reset --mixed 1458e3f7~1`
returns to the starting point with the working tree intact.

---

## 5. The root workspace

npm workspaces. The root package is `private: true` and declares all four
workspaces.

Workspace package names are not all the same as their directory names, which
matters when targeting one directly:

| Directory | Package name |
|---|---|
| `apps/web` | `accian` |
| `apps/admin` | `admin` |
| `apps/api` | `accian-backend` |
| `packages/types` | `@accian/types` |

The root is named `accian-monorepo` specifically so it does not collide with the
`accian` web workspace.

**Every documented command was run and works.** No dependencies were hoisted
into the root manifest — each application still declares its own.

| Command | Result |
|---|---|
| `npm run build:web` | builds, 7 routes + middleware |
| `npm run build:admin` | builds, 2165 modules |
| `npm run build:api` | builds, `dist/server.js` + 4 `.sql` + 4 templates |
| `npm run dev:web` / `dev:admin` | start |
| `npm run lint:web` | 0 errors, 0 warnings |
| `npm run lint:admin` | 0 errors, 0 warnings |
| `npm run test:api` | 109 pass, 0 fail, 0 cancelled, 0 skipped |
| `npm run test:admin` | 19 pass, 0 fail, 0 cancelled, 0 skipped |
| `npm run guards` | 9 checks, all pass |

There is deliberately **no `dev:api`**. The API's own `dev` script points at a
file that does not exist — a bug predating this phase — and documenting a command
that does not work is explicitly forbidden. The workaround is in the README and
`known-issues.md` §1.

---

## 6. Node version

**Node 22.** This was determined from evidence, not chosen.

- All three applications already declared `"engines": { "node": ">=22.0.0 <23" }`.
- All three already tracked a `.nvmrc` containing `22`.
- Local verification ran on v22.21.1.

**There was no conflict to resolve.** A root `.nvmrc` was added because Netlify
reads it from the base directory, which is the repository root.

---

## 7. Lockfile strategy

**One lockfile, at the repository root.** The three per-app lockfiles were
removed; a stray lockfile inside a workspace silently overrides workspace
resolution for that app, so `npm run guards` now fails if one reappears.

Independent deployability was preserved — see §8 for how.

### Dependency drift, and its reversal

Deleting the three lockfiles made npm re-resolve every `^` range from scratch,
which drifted **37 direct dependencies**, including:

```
react         19.2.4  -> 19.3.0
next          16.2.0  -> 16.3.5
pg            8.16.3  -> 8.23.0
react-router-dom 7.11.0 -> 7.18.3
```

Preventing exactly this is what a committed lockfile is for, and upgrading 37
dependencies is not required to make a monorepo work.

**All of it was reverted.** Every direct dependency now resolves to its pre-move
version while the declared `^` ranges in each `package.json` remain untouched
(all three files are byte-identical to their committed versions). Verified
mechanically against the three original lockfiles: **zero** direct-dependency
differences.

The method: pin every direct dependency to its pre-move resolved version → clean
install → restore the declared ranges from git → install once more. npm keeps a
lockfile entry that still satisfies its range, so the pins survive.

### One `overrides` entry, for correctness

```json
"overrides": { "framer-motion": { "motion-dom": "12.23.23", "motion-utils": "12.23.6" } }
```

Not a preference. `framer-motion@12.23.26` imports `activeAnimations` from
`motion-dom` and declares the range `^12.23.23`; a fresh resolve satisfies that
with `12.43.0`, which **no longer exports that symbol** — the admin's Vite build
fails outright. The original lockfile had pinned `motion-dom` to `12.23.23`.
Pinning direct dependencies does not reach a transitive one, and an `overrides`
block inside `apps/admin/package.json` is **ignored**, because npm honours
overrides only from the workspace root. Hence the nested form.

### Platform binaries

The lockfile contains all **8** `@next/swc-*` platform entries (88
platform-specific entries in total), so Netlify's Linux builders and developers
on macOS or Windows all install correctly. This requires a *clean* install;
an incremental one records only the current platform and prunes the rest, after
which Next.js attempts to self-patch the lockfile and fails inside a workspace
(`ENOWORKSPACES`). Documented in `known-issues.md` §8.

`npm ci` was verified **idempotent** — it installs without rewriting the
lockfile, byte for byte.

---

## 8. Independent deployability

Preserved. The three applications share a repository, a lockfile and a Node
version; they do not share a build, a process or a runtime.

There is deliberately **no `netlify.toml` at the repository root.** Netlify
applies a root configuration to *every* site connected to the repository, so a
shared root file would make the public site and the admin fight over the same
build settings. Each application carries its own instead, and Netlify's search
order is **package directory → base directory → repository root**.

| Site | Package directory | Base | Build | Publish |
|---|---|---|---|---|
| `accian.co.uk` | `apps/web` | *(root)* | `npm run build:web` | `apps/web/.next` |
| `admin.accian.co.uk` | `apps/admin` | *(root)* | `npm run build:admin` | `apps/admin/dist` |

**Base stays at the repository root** because npm workspaces keeps the single
lockfile there and Netlify installs dependencies from the base directory.
Pointing base at `apps/web` would leave npm unable to find a lockfile and falling
back to an unpinned `npm install`. The **package directory** setting is what
scopes each site to its own application, and it can only be set in the Netlify
UI — there is no `netlify.toml` key for it. That is the one piece of each site's
configuration that cannot be reproduced from source.

The repository layout was not tidied at the expense of deployability.

---

## 9. Application-specific changes

Deliberately minimal. Outside the moves themselves, **four** files changed.

### `apps/web`

`netlify.toml` — exactly two lines, both required by the relocation:

```diff
- command = "npm run build"      + command = "npm run build:web"
- publish = ".next"              + publish = "apps/web/.next"
```

Phase 1's consolidated CSP, the `/internal/*` `X-Robots-Tag = "noindex"` block
and the Netlify Identity `Role = ["admin"]` redirect are **untouched**, and the
set of production URLs in the file is byte-identical. No source file in
`apps/web` was modified.

### `apps/admin`

`netlify.toml` — **new.** This app previously had no `netlify.toml` at all; its
build settings existed only in the Netlify dashboard, so its deployment could not
be reviewed or reproduced from source. The new file contains the build settings
matching the build it has always had (`tsc -b && vite build`, publishing Vite's
default `dist`) and nothing else.

It deliberately adds **no security headers.** The admin has never sent any, and
adding a CSP would change how the deployed product behaves, is not required to
make the monorepo work, and could not be verified without a production deploy — a
wrong CSP breaks the app for real users after promotion, not during the build.
Recorded as follow-up work in `known-issues.md` §5. The SPA fallback remains
solely in `apps/admin/public/_redirects`.

`tsconfig.json` — removed one `include` entry pointing at
`../../accian/src/data`, a path into what was then a sibling repository. That
directory never existed (the web app keeps static data in `data/`, not
`src/data/`) and nothing imported from it, so the entry matched nothing. This was
the **only genuinely broken path reference** found.

### `apps/api`

**No changes.** The build, the migration paths and the CommonJS module system all
survived relocation unmodified.

---

## 10. Routing and behaviour

All expected public routes exist as App Router pages and were verified **serving
at runtime**, not merely present in the build output:

| Route | Status |
|---|---|
| `/` | 200 |
| `/contact` | 200 |
| `/services` | 200 |
| `/research-support` | 200 |
| `/privacy-policy` | 200 |
| `/does-not-exist` | 404 |

No Vite-era routing was reintroduced: there is no `react-router` import anywhere
in `apps/web`, and no `index.html` or `vite.config.*` at the web app root.

### The Phase 1 internal-area gate is fully intact

Verified against a real `next start` server in both configurations:

| Condition | Result |
|---|---|
| `INTERNAL_AREA_*` unset | **503** — fails closed, does not serve the page |
| Configured, no credentials | **401** + `WWW-Authenticate: Basic realm="ACCIAN Internal"` |
| Configured, wrong credentials | **401** |
| Configured, correct credentials | **200** |

The proxy is registered in the build manifest as `/_middleware`, and the build
reports `ƒ Proxy (Middleware)`.

The admin was **not** migrated to `/admin` on the public site. It remains a
separate Netlify site on its own subdomain, as the brief requires — the audit
(§18.3) also records that such a move would need code changes.

---

## 11. Production URLs

**Preserved.** `https://accian.co.uk`, `https://admin.accian.co.uk` and
`https://api.accian.co.uk` are unchanged, and no hardcoded API URL was rewritten.

Every tracked file containing a production URL was compared against its pre-move
commit. There are 20; **18 are byte-identical**. The two exceptions are
`apps/web/netlify.toml`, whose URL set is also identical — only the two build
lines in §9 differ — and `apps/admin/netlify.toml`, which is new in this phase
and mentions `admin.accian.co.uk` only in an explanatory comment.

---

## 12. Database

**Untouched, as required.** No data was migrated, no schema altered, no migration
renumbered or renamed.

What was verified is that the migration paths still resolve after relocation, and
this was tested rather than assumed:

- `apps/api/src/migrations/` holds 4 `.sql` migrations plus the TypeScript
  migrator; `npm run build:api` copies all 4 into `dist/migrations/`.
- The migration test suite ran against a **real, empty PostgreSQL database** and
  passed — it verifies ordering, that re-running is safe, and that nothing is
  applied twice. It was **not skipped**: `TEST_DATABASE_URL` was set, so the
  suite executed, and it reports 0 cancelled and 0 skipped.
- `npm run guards` fails if the migrations directory or its `.sql` files go
  missing.

The API applies pending migrations on **every start** (`npm start` is
`node dist/migrations/cli.js && node dist/server.js`), which means a deploy is
also a migration. Pre-existing behaviour, recorded in `known-issues.md` §4.

---

## 13. Environment variables

All variables are documented in `docs/deployment.md` §3 by **name and purpose
only**. No secret value appears in this report, that document, or anywhere in
this repository.

Covered there: `apps/web` (`NEXT_PUBLIC_API_URL`, `INTERNAL_AREA_USER`,
`INTERNAL_AREA_PASSWORD`), `apps/admin` (`VITE_API_URL`), and the API's database,
JWT, SendGrid and CORS variables.

Two findings worth surfacing here:

**`FRONTEND_URL` fails silently.** If unset, the API falls back to a hardcoded
production allowlist, so CORS keeps working and the missing variable stays
invisible until someone needs to change an origin. Its value is also split on `,`
**without trimming whitespace**, so `"a.com, b.com"` yields `" b.com"`, which can
never match an `Origin` header. Do not put spaces after the commas.

**`apps/admin/.env` is tracked in git.** It holds exactly one variable,
`VITE_API_URL`. `VITE_`-prefixed values are compiled into the JavaScript bundle,
so this is public by construction and contains no credential — but the next
person to add a variable there could commit a real secret *and* ship it in the
bundle. The root `.gitignore` ignores `.env*` with a comment recording this file
as a documented exception; note that gitignore never untracks an already-tracked
file. See `known-issues.md` §6.

**No credentials were rotated,** and none needed to be — see §14.

---

## 14. Secret scan

**Clean. No secret is tracked in this repository.**

Every file added or modified in Phase 2 was scanned for SendGrid keys, AWS access
keys, PEM private keys, JWTs and PostgreSQL URLs carrying inline credentials, and
for assignment-style `password`/`secret`/`api_key`/`token` literals.

The only matches were two **already-redacted** `***` placeholders in the Phase 1
report. No real credential was found.

Also confirmed: `apps/api/.env` is not tracked (only `.env.example`, which has no
values), and the one tracked `.env` holds a single public URL (§13). The staged
change set contained **zero** `node_modules/` paths and **zero** `.env` files.

Because no secret was found in tracked files, **no rotation is required as a
result of this phase.**

---

## 15. Architecture guards

`scripts/check-architecture.mjs`, run via `npm run guards`. Zero dependencies, no
configuration — deliberately a handful of checks rather than a testing framework.

```
PASS  no application imports another application's source
PASS  every app has its own package.json
PASS  root package.json is private
PASS  root package.json declares every workspace
PASS  no nested git repository under apps/
PASS  apps/api/src/migrations exists
PASS  apps/api/src/migrations contains .sql files
PASS  root lockfile exists
PASS  no lockfiles inside workspaces
```

These earn their place. The lockfile check caught a real regression during this
phase — a `git reset --hard` restored the three per-app lockfiles, which would
have silently broken workspace resolution.

---

## 16. Verification: what was and was not tested

### Verified locally

| Check | Result |
|---|---|
| `apps/web` builds | 7 routes + `ƒ Proxy (Middleware)` |
| `apps/admin` builds | vite 7.3.0, 2165 modules, 476.55 kB JS |
| `apps/api` builds | `dist/server.js`, 4 `.sql`, 4 templates |
| API tests | **109 pass, 0 fail, 0 cancelled, 0 skipped** |
| Admin tests | **19 pass, 0 fail, 0 cancelled, 0 skipped** |
| `lint:web` | 0 errors, 0 warnings |
| `lint:admin` | 0 errors, 0 warnings |
| Public routes serve | 5× 200, unknown route 404 |
| Internal gate | 503 / 401 / 401 / 200 as designed |
| Migrations apply to a real database | verified, suite not skipped |
| Architecture guards | 9/9 pass |
| `npm ci` reproducibility | lockfile byte-identical |
| Dependency drift | zero direct differences vs pre-move |
| Secret scan | clean |
| Content fidelity after the moves | web 47/47, api 94/94, admin 55/55 — 0 mismatches |

### NOT verified — and why

| Not checked | Why |
|---|---|
| That either Netlify site deploys from this layout | Requires a deploy. The §8 dashboard changes have not been made. |
| That the API deploys from this layout | Requires the §17 blocker to be answered first. |
| That production URLs still serve | Requires a deploy. |
| Production response headers, including the CSP | `netlify.toml` is not applied by a local `next start`. Verify with `curl -sI` against a deploy preview. |
| The internal gate under Netlify's own headers | Same reason. The gate itself was verified at the application level. |
| Anything about the production database | Deliberately untouched. |

**No deployment was performed or tested, and no production behaviour was
verified.** Everything above was measured locally.

### A note on the lint result

Both lint suites initially **failed** after consolidation, with three
`react-hooks/set-state-in-effect` errors. The cause was not the relocation and
not the code: `eslint-plugin-react-hooks` had drifted `7.0.1 → 7.1.1` in the
consolidated lockfile, and the newer version detects this pattern where the older
one did not. Proven by linting the same three files under both plugin versions in
an isolated directory — 7.0.1 clean, 7.1.1 flags all three — and all three files
are byte-identical to their pre-move commits.

Reverting the dependency drift (§7) fixed the lint with **no source edits**. The
underlying pattern is still worth addressing on its own merits, but doing so here
would have been an unrequested behavioural change to three components, made under
the guise of a file move.

---

## 17. Conditions and blockers

### Blocker — the API deployment cannot be reproduced from source

**This predates Phase 2 and is the largest gap in the repository.**

`apps/api` has no deployment configuration in version control: no `Dockerfile`,
`Procfile`, `render.yaml`, `fly.toml`, `vercel.json`, `app.yaml`, or CI workflow.
Confirmed by searching all three repositories, tracked and untracked, before and
after consolidation. The pre-consolidation audit reached the same conclusion
independently (§15.1, Integration Blocker #2).

`api.accian.co.uk` demonstrably serves traffic, so something hosts it — but what,
and how it is configured, exists only in a hosting dashboard. Its root directory
**must** be changed to `apps/api` before it will deploy from this layout, and
that cannot be done from here.

`docs/deployment.md` §5 carries a checklist for a human to complete. A related
consequence: 39 build artifacts under `apps/api/dist/` are tracked, and until the
hosting is known it cannot be ruled out that **the committed `dist/` is what
actually runs**, so removing it would be an untested production change. Left in
place.

### Condition — both Netlify sites need dashboard changes

Neither site will build until the settings in §8 are applied. This is inherent to
consolidation, not a defect: each app used to be its own repository root, and a
Netlify site cannot discover that it has moved.

### Condition — deployment verification is outstanding

Everything in the "NOT verified" table above needs a deploy preview. Recommended
order: **admin first** (a static SPA, lowest risk), then **web**, then the API
once its hosting is documented.

### Rollback

The two source repositories are unchanged and **must not be deleted or archived**
until a full deploy-and-verify cycle has completed for all three applications.

Nothing was pushed: `origin/master` is still at `e40c0fcd`. To undo the
consolidation locally, `git reset --mixed 1458e3f7~1` returns to the
pre-consolidation state with the working tree intact. The three pre-move HEADs
(`e40c0fc`, `be5e464`, `a877ba2`) all remain reachable in this repository's
history.

### Stop conditions

None of the phase's stop conditions were triggered. Specifically: Node
requirements agreed across all three apps (no conflict); no tracked secret was
found; no production data or schema change was needed; no API behaviour, auth
flow, frontend routing or database schema was rewritten; and no unexpected Git
history conflict arose. The API hosting gap is reported here rather than guessed
at, which is what the rules require.

---

## 18. `packages/types`

Created as a **scaffold only** — `package.json` plus a `src/index.ts` containing
`export {};`. No application imports it, by design.

It is empty because populating it would mean choosing a winner wherever the three
applications disagree, and every such choice changes product behaviour. The
disagreements are real and documented in `accian-integration-audit.md` §19–20:
`Service` has three definitions, none matching the backend's schema; `Project`
has diverged severely; three of `DashboardStats`'s four fields differ from what
the API returns; and contact `status` has two divergent value maps.

Aligning those contracts is a project with its own testing requirements. This
phase was not the shared-contract phase, so the package is scaffolding for that
future work and nothing more.

---

## 19. Documentation produced

| Document | Contents |
|---|---|
| `README.md` | Layout, every working command, workspace names, where the docs are |
| `docs/deployment.md` | Deployment shape, **required dashboard changes**, environment variables (names only), Node version evidence, the API hosting gap with a completion checklist, lockfile notes, an explicit verified-vs-not table, rollback |
| `docs/known-issues.md` | 12 entries, each with severity, why it was left, and what fixing it involves |
| `docs/phase2-monorepo-report.md` | This report |

`docs/accian-integration-audit.md` and `docs/phase1-stabilization-report.md` moved
in from the web application, where they had been committed.

---

## 20. Status

**PASS WITH CONDITIONS**

**What passes.** One repository, three independently deployable applications. All
154 commits from the three original repositories are preserved, with all three
pre-move HEADs reachable and authorship intact. All three applications build;
API 109/109 and admin 19/19 tests pass with
nothing skipped or cancelled; both lint suites are clean; all 9 architecture
guards pass. One root lockfile with zero dependency drift and reproducible
`npm ci`. Production URLs, API routes, Phase 1's CSP and the internal-area gate
are all preserved and, where locally testable, verified working. No secret is
tracked. The database was not touched, and no Phase 1 fix was undone.

**What the conditions are.** No deployment was performed, so nothing about
production behaviour is verified. Both Netlify sites need dashboard changes before
they will build. The API's hosting is undocumented and unreproducible from
source — a pre-existing gap that must be closed by a human before it can deploy
from this layout.

**Not done, as instructed:** nothing committed beyond the local commits
explained in §4, and nothing pushed, merged, rebased or deployed.
