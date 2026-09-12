# ACCIAN

One repository. Three independently deployable applications.

| Application | Path | Stack | Deploys to |
|---|---|---|---|
| Public site | [`apps/web`](apps/web) | Next.js 16, React 19, Tailwind 4 | [accian.co.uk](https://accian.co.uk) |
| Admin | [`apps/admin`](apps/admin) | Vite 7 + React 19 (SPA) | [admin.accian.co.uk](https://admin.accian.co.uk) |
| API | [`apps/api`](apps/api) | Express 5, PostgreSQL (CommonJS) | [api.accian.co.uk](https://api.accian.co.uk) |

They share a repository, a lockfile and a Node version. They do **not** share a
build, a process or a runtime — each is built, deployed and rolled back on its
own. That is deliberate: consolidation was about having one place to read the
product, not one thing to deploy.

The applications also legitimately differ in module system — `apps/web` and
`apps/admin` are ESM, `apps/api` is CommonJS. Converting the API for the sake of
consistency would be a rewrite with no benefit.

---

## Getting started

Requires **Node 22** (see [`.nvmrc`](.nvmrc)) and npm 10+.

```bash
nvm use
npm install        # installs all workspaces from the single root lockfile
```

Install from the **repository root**, not from inside an app. npm workspaces
keeps one lockfile here and links the apps together; installing inside
`apps/web` would create a second lockfile and silently diverge. `npm run guards`
checks for exactly that.

## Commands

Run from the repository root. Every command here is wired to a script that
already exists in the target application — none are placeholders.

```bash
# Build
npm run build:web        # Next.js production build
npm run build:admin      # tsc -b && vite build
npm run build:api        # tsc, then copy templates and .sql migrations into dist/

# Develop
npm run dev:web
npm run dev:admin

# Check
npm run lint:web
npm run lint:admin
npm run test:api         # 109 tests; migration suite needs TEST_DATABASE_URL
npm run test:admin       # 19 tests
npm run guards           # structural invariants of the monorepo layout
```

There is no `dev:api`, because the API's own `dev` script points at a file that
does not exist — a bug that predates consolidation. Run it with
`npm run build:api && npm start --workspace accian-backend`, and note that
`npm start` **also applies pending database migrations**. Both are covered in
[`docs/known-issues.md`](docs/known-issues.md).

To target a workspace directly, use its package name, which is not always its
directory name:

| Directory | Package name |
|---|---|
| `apps/web` | `accian` |
| `apps/admin` | `admin` |
| `apps/api` | `accian-backend` |
| `packages/types` | `@accian/types` |

```bash
npm run <script> --workspace accian-backend
```

## Layout

```
accian/
├── apps/
│   ├── web/         Next.js public site      (ESM)
│   ├── admin/       Vite React admin SPA     (ESM)
│   └── api/         Express API + PostgreSQL (CommonJS)
├── packages/
│   └── types/       scaffold — see docs/known-issues.md §9
├── docs/
├── scripts/
└── package.json     workspace root, private, not published
```

`packages/types` is intentionally empty. Populating it means resolving real
contract disagreements between the three apps, which changes product behaviour —
a separate piece of work, not a side effect of moving files.

## Documentation

| Document | What it covers |
|---|---|
| [`docs/deployment.md`](docs/deployment.md) | How each app is built and deployed, environment variables (names only), and **required Netlify dashboard changes** |
| [`docs/known-issues.md`](docs/known-issues.md) | Known problems deliberately left unfixed, each with a reason and a fix |
| [`docs/phase2-monorepo-report.md`](docs/phase2-monorepo-report.md) | How this repository was consolidated, and what was and was not verified |
| [`docs/phase1-stabilization-report.md`](docs/phase1-stabilization-report.md) | The preceding stabilization work (CSP, the `/internal/*` gate, PII in logs) |
| [`docs/accian-integration-audit.md`](docs/accian-integration-audit.md) | The pre-consolidation audit of all three codebases |

> **Deploying for the first time from this layout?** Read
> [`docs/deployment.md` §2](docs/deployment.md#2-required-dashboard-changes)
> first. Both Netlify sites need their build settings updated before they will
> build — the apps moved out of their own repository roots, and a Netlify site
> cannot discover that by itself.

## Environment variables

No secret values are stored in this repository. Every variable is documented by
**name and purpose only** in [`docs/deployment.md` §3](docs/deployment.md#3-environment-variables);
the values live in each host's dashboard.

`apps/api/.env.example` lists the API's variables with no values. There is one
tracked `.env`, `apps/admin/.env`, which holds a single public build-time API URL
and no credentials — explained in
[`docs/known-issues.md` §6](docs/known-issues.md#6-appsadminenv-is-tracked-in-git).
