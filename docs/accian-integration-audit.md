# ACCIAN — Pre-Refactor Integration Audit

**Audit date:** 2026-09-10
**Scope:** `accian` (frontend), `accian-backend`, `accian-admin/admin` (admin SPA)
**Status:** AUDIT ONLY — no implementation changes were made. No files in any repository were created, modified, moved, or deleted. No dependencies installed or removed. No commits, pushes, or deployments.
**Report location:** `/home/princewill/Desktop/ACCIAN-PROJECT/docs/` — the workspace root is **not** a git repository (verified: `git rev-parse --is-inside-work-tree` fails at that level), so this document sits outside all three repos and does not alter any repository's tracked structure.

**Evidence convention:** every claim below cites `path:line`. Anything not verifiable from the repositories is marked `UNKNOWN / REQUIRES VERIFICATION`.

**Secret handling:** environment variable **names only**. No secret values were read into the report, and no credential, token, connection string, or key value appears anywhere in this document.

---

## 1. Executive summary

ACCIAN is three independently developed, independently deployed applications sharing one PostgreSQL database and one JWT identity table. They are not a system yet — they are three programs that agree on some endpoint names.

The audit found **6 currently-broken production paths**, **3 SQL identifier-injection sites**, **1 tracked secret file**, and a **migration system that will fail on any fresh database**. Critically, the three codebases have drifted apart in time: the frontend's last commit is **2026-04-25**, the backend's is **2026-01-02**, the admin's is **2026-01-04** (`git log -1` per repo). The frontend evolved for nearly four months against a frozen backend, and the contract mismatches show it.

The most important structural finding for the consolidation decision: **the admin application's write paths do not currently work.** Creating a testimonial returns HTTP 400 every time; creating or updating a project returns HTTP 500. This is not a consolidation risk — it is the present state. It matters because it means **there is no working baseline for those features to regress from**, and any post-consolidation testing must not mistake these pre-existing failures for new breakage.

**Verdict: CONSOLIDATE WITH CONDITIONS.** The consolidation itself is low-risk — the three apps are loosely coupled, share one database, and have no shared build or runtime. The risk is entirely in the pre-existing defects that a consolidation would carry forward and obscure. Conditions are listed in §33.

---

## 2. Repository inventory and git state

The brief assumed three repos named `accian-backend`, `accian-frontend`, `accian-admin`. The actual layout differs:

| Path | Git repo | Remote (origin) | Branch | Tracked files | TS/TSX LOC | Commits | Last commit |
|---|---|---|---|---|---|---|---|
| `accian/` | yes | `github.com/bobprince4u/accian.git` | `master` | 535 | 5,277 | 79 | 2026-04-25 |
| `accian-backend/` | yes | `github.com/bobprince4u/accian-backend.git` | `master` | 68 | 3,401 | 44 | 2026-01-02 |
| `accian-admin/` | **no** | — | — | — | — | — | — |
| `accian-admin/admin/` | yes | `github.com/bobprince4u/admin.git` | `master` | 45 | 4,773 | 28 | 2026-01-04 |

Findings:

- **The frontend repo is named `accian`, not `accian-frontend`.** The product name and the frontend repo name collide, which is a naming hazard for any consolidation that keeps `accian` as the umbrella name.
- **`accian-admin/` is a stray wrapper directory, not a repository.** It contains a stub `package.json` whose entire content is `{}` (3 bytes), a `package-lock.json` naming a package `accian-admin` with an empty `packages` map, and a `node_modules/`. Nothing references it. The real admin app is one level down at `accian-admin/admin/`, whose remote is named just `admin`.
- All three repos are on `master`, with only `master` and `remotes/origin/master` present — **no develop branch, no feature branches, no tags**.
- All three are **exactly in sync with origin**: `git rev-list --left-right --count origin/master...HEAD` returns `0 0` for each.
- All three working trees were **clean before this audit began** and remain clean (§34).

---

## 3. Technology stack comparison

| Dimension | `accian` (frontend) | `accian-backend` | `admin` |
|---|---|---|---|
| Framework | Next.js 16.2.0, App Router | Express 5.2.1 | Vite 7.2.4 + React SPA |
| React | 19.2.4 | — | 19.2.0 |
| Language | TypeScript ~5.9.3 | TypeScript ^5.9.3 | TypeScript ^5.9.3 |
| Module system | ESM | **CommonJS** (`tsconfig.json:4`) | ESM (`package.json:5` `"type": "module"`) |
| Styling | Tailwind v4 via `@tailwindcss/postcss` | — | Tailwind v4 via `@tailwindcss/vite` |
| Routing | Next App Router | Express Router | `react-router-dom` 7.10.1 |
| HTTP client | axios **and** native `fetch` | — | axios **and** native `fetch` |
| Database | — | `pg` 8.16.3, raw SQL, **no ORM** | — |
| Auth | none | JWT (`jsonwebtoken` 9.0.3) + `bcryptjs` | JWT consumed, stored in `localStorage` |
| Email | — | SendGrid (`@sendgrid/mail` 8.1.6) | — |
| Animation | — | — | `framer-motion` 12.23.25 |
| Icons | `lucide-react` 0.555.0 | — | `lucide-react` 0.555.0 |
| Deploy target | Netlify (`netlify.toml`) | `UNKNOWN / REQUIRES VERIFICATION` | Netlify (`public/_redirects` only) |
| Dependencies | 20 prod / 14 dev | 15 prod / 12 dev | 8 prod / 18 dev |
| `engines` / `.nvmrc` | **absent** | **absent** | **absent** |
| CI/CD | **none** | **none** | **none** |

**Compatible:** TypeScript version, React version, Tailwind major version, `lucide-react` version, axios major version. These three will coexist in one workspace without version conflict.

**Incompatible:** the backend is CommonJS while both frontends are ESM. This is not a blocker for a workspace-based monorepo (each package keeps its own `tsconfig` and module setting) but it **is** a blocker for any plan that puts backend and frontend code in one compilation unit or shares runtime modules between them (§20).

---

## 4. Product boundaries

| Concern | Owner today | Notes |
|---|---|---|
| Public marketing site | `accian` | 6 routes (§17) |
| Lead capture (contact form) | `accian` → `POST /api/contact` | The only write path from the public site |
| Research Support / EOI | `accian` | **Fully client-side** — `.docx` download + `mailto:`, no backend |
| Internal quote builder | `accian` (`/internal/quote-builder`) | **Fully client-side** — `mailto:` + `window.print()` |
| Content management | `admin` | Contacts, projects, services, testimonials |
| Identity / authentication | `accian-backend` | Single `admin_users` table |
| Email delivery | `accian-backend` | SendGrid |
| Data persistence | `accian-backend` | One PostgreSQL database, 8 tables |

The public site has **no authenticated-user concept at all**. `components/Navigation.tsx` renders Home / Services / Research Support / Contact plus a "Request Consultation" CTA — no login, no account, no admin link. `js-cookie` is present but used only for cookie consent and contact-form draft persistence (`components/CookieBanner.tsx:4`, `pages/ContactPage.tsx:5`), not authentication.

**Implication:** there is exactly one class of authenticated user in the entire product — the admin. Any "unify the identity systems" work is therefore trivial, because there is only one identity system.

---

## 5. Current system map

```
                        ┌───────────────────────────────┐
   Public visitor ────► │  accian (Next.js 16)          │
                        │  Netlify · accian.co.uk       │
                        │                               │
                        │  3 outbound calls only:       │
                        │   POST /api/contact           │
                        │   GET  /api/services          │
                        │   GET  /api/testimonials      │
                        └───────────────┬───────────────┘
                                        │  CORS allowlist
                                        │  (FRONTEND_URL)
                                        ▼
                        ┌───────────────────────────────┐        ┌──────────────┐
                        │  accian-backend (Express 5)   │───────►│  SendGrid    │
                        │  api.accian.co.uk             │        │  (email)     │
                        │  DEPLOY MECHANISM UNKNOWN     │        └──────────────┘
                        │                               │
                        │  28 endpoints                 │
                        │  11 public / 17 admin-guarded │
                        └───────────────┬───────────────┘
                                        │  pg Pool
                                        ▼
                        ┌───────────────────────────────┐
                        │  PostgreSQL — 8 tables        │
                        │  contacts, projects, services,│
                        │  testimonials, admin_users,   │
                        │  email_logs, refresh_tokens,  │
                        │  audit_logs                   │
                        └───────────────▲───────────────┘
                                        │
                        ┌───────────────┴───────────────┐
   Admin user ────────► │  admin (Vite SPA)             │
                        │  Netlify · admin.accian.co.uk │
                        │                               │
                        │  13 call sites, ALL hardcoded │
                        │  to https://api.accian.co.uk  │
                        │  VITE_API_URL never used      │
                        └───────────────────────────────┘
```

Coupling is **loose and one-directional**: both clients talk only to the backend; the backend talks to no client. There is no shared code, no shared build, no service-to-service call, and no message queue. This is the single most favourable fact for consolidation.

---

## 6. Frontend → Backend API audit

The entire frontend makes **three** network calls. This was verified by grepping every `.ts`/`.tsx` file under `app/`, `components/`, `pages/`, `lib/`, `config/`, `data/` for `fetch(` and `axios.`.

| Feature | Method | Endpoint | Request | Response consumed | Auth | Status |
|---|---|---|---|---|---|---|
| Contact form | POST | `/api/contact` | `{...form, securityToken, timestamp, userAgent}` + header `X-Security-Token` | `.referenceNumber` | none | works |
| Homepage services | GET | `/api/services` | — | `res.data.data \|\| res.data` | none | **BROKEN — field mismatch** |
| Homepage testimonials | GET | `/api/testimonials` | — | mapped to `{quote, author, position, rating}` | none | works |

Base URL: `config/api.ts:1` — `export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2025"`. This is the **only** API configuration in the frontend, and it is used consistently by all three calls. The frontend is the best-behaved of the three apps on this dimension.

### 6.1 CONFIRMED BREAK — services render empty on the homepage

`pages/HomePage.tsx:11-19` declares a local type:

```ts
interface Service {
  id?: string; slug: string; title: string;
  description: string;          // ← backend never sends this
  icon?: string; features?: string[]; link?: string;
}
```

It is rendered at `pages/HomePage.tsx:391`, `:425`, and `:441` as `{services[0].description}`, `{services[1].description}`, `{svc.description}`.

But `src/controllers/serviceController.ts` `getAllServices` returns `shortDescription` — not `description`. There is no `description` key and no `link` key in the response.

**Effect:** service descriptions render as empty strings on the production homepage. No error, no fallback — silently blank. This is the clearest evidence of the four-month frontend/backend drift.

### 6.2 Error handling discards server detail

`pages/ContactPage.tsx` checks `if (!response.ok) throw new Error("Failed")`, discarding the backend's `message` and status code. A rate-limit rejection (429), a validation failure (400), and a database outage (500) are indistinguishable to the user.

---

## 7. Admin → Backend API audit

| Feature | Method | Endpoint | Auth | Status |
|---|---|---|---|---|
| Login | POST | `/api/admin/login` | none | works |
| Signup | POST | `/api/admin/create` | none (backend blocks 2nd admin) | works |
| List contacts | GET | `/api/admin/contacts` | Bearer | works |
| Update contact status | PATCH | `/api/admin/contacts/:id` | Bearer | works, but see §9.2 |
| List projects | GET | `/api/admin/projects` | Bearer | **renders wrong — snake_case** |
| Create project | POST | `/api/admin/projects` | Bearer | **BROKEN — HTTP 500** |
| Update project | PUT | `/api/admin/projects/:id` | Bearer | **BROKEN — HTTP 500** |
| Delete project | DELETE | `/api/admin/projects/:id` | Bearer | works (unpublish only) |
| List services | GET | `/api/admin/services` | Bearer | **renders wrong — snake_case** |
| Create service | POST | `/api/admin/services` | Bearer | works |
| Update service | PUT | `/api/admin/services/:id` | Bearer | works |
| Delete service | DELETE | `/api/admin/services/:id` | Bearer | works (unpublish only) |
| List testimonials | GET | `/api/admin/testimonials` | Bearer | works |
| Create testimonial | POST | `/api/admin/testimonials` | Bearer | **BROKEN — HTTP 400 always** |
| Update testimonial | PUT | `/api/admin/testimonials/:id` | Bearer | **BROKEN — field mismatch** |
| Delete testimonial | DELETE | `/api/admin/testimonials/:id` | Bearer | works (unpublish only) |

### 7.1 Every admin call hardcodes the production URL

13 call sites in `src/pages/AdminDashboard.tsx` (lines 74, 77, 80, 83, 187, 246, 273, 297, 321, 347, 373, 398, 424, 451) plus `src/components/LoginForm.tsx:46-47` and `src/components/SignupForm.tsx:44` all embed `https://api.accian.co.uk` as a literal string.

`import.meta.env.VITE_API_URL` appears **exactly once** in the whole admin codebase — at `src/services/adminService.ts:4` — and **that file is never imported by anything**. Verified: grep for `adminService`, `adminLogin`, `adminLogout` across `src/` returns only the definitions themselves. `src/services/adminService.ts` is dead code in its entirety.

**Consequences:**
1. Local admin development hits the **production API and production database**. There is no way to run the admin against a local backend without editing source.
2. `VITE_API_URL` in the admin's `.env` has no effect whatsoever.
3. Any domain change during consolidation silently breaks the admin, and the fix requires source edits in 3 files, not a config change.

Additionally, `adminService.ts:4`'s fallback is `"http://localhost:2025/api/admin"` — it includes the `/api/admin` path segment, while every other URL in the codebase treats the base as an origin. Even if that file were wired up, the two conventions would conflict.

### 7.2 No route guard

`src/App.tsx` in full:

```tsx
<Router><Routes>
  <Route path="/" element={<LoginPage />} />
  <Route path="/AdminDashboard" element={<AdminDashboard />} />
</Routes></Router>
```

There is no guard component, no loader, no redirect wrapper. Navigating directly to `/AdminDashboard` mounts the dashboard. The only gate is inside the component: `src/pages/AdminDashboard.tsx:60-65` reads `localStorage.getItem("adminToken")` and calls `navigate("/")` if absent.

This is cosmetic only — the **backend does enforce** `authenticateToken` + `requireAdmin` on all 17 protected routes (`src/routes/adminRoutes.ts:46`), so an unauthenticated visitor sees an empty shell and an alert, not data. See §11.

### 7.3 Four intended modules are empty files

Verified with `find src -type f -empty`:

- `src/context/AuthContext.tsx` — 0 bytes
- `src/utils/api.tsx` — 0 bytes
- `src/utils/auth.tsx` — 0 bytes
- `src/utils/helpers.tsx` — 0 bytes

The intended auth context and shared API client were scaffolded and never written. This explains the hardcoded URLs and the absent route guard: the abstraction layer that would have held them does not exist.

### 7.4 PII logged to the browser console

`src/pages/AdminDashboard.tsx:89-119` contains eleven `console.log` calls that dump the raw contacts response and named fields — `full_name`, `company_name`, `service_interest`, `email` — to the browser console on every dashboard load. This ships in the production bundle.

### 7.5 One failed request destroys the whole session

`src/pages/AdminDashboard.tsx:72-86` fetches contacts, projects, services and testimonials in a single `Promise.all`. The `catch` at `:151-162` calls `alert("Session expired or server error. Please login again.")` then `handleLogout()`, which clears the token.

Any one of the four endpoints failing for any reason — a 500 from the snake_case project data, a transient network error, a rate limit — logs the admin out and discards their token. There is no retry, no partial render, and no distinction between 401 and 503.

---

## 8. Complete backend endpoint inventory

28 endpoints. Mounted at `src/app.ts:111-115`.

### Public (11)

| # | Method | Path | Handler | Called by |
|---|---|---|---|---|
| 1 | GET | `/` | inline, `src/app.ts:84` | nobody — **POSSIBLY UNUSED — REQUIRES VERIFICATION** |
| 2 | GET | `/health` | inline, `src/app.ts:100` | **POSSIBLY UNUSED — REQUIRES VERIFICATION** (likely used by an uptime monitor or host healthcheck, which is outside the repos) |
| 3 | POST | `/api/contact` | `submitContactForm` | frontend `pages/ContactPage.tsx:373` |
| 4 | GET | `/api/projects` | `getAllProjects` | nobody — **POSSIBLY UNUSED — REQUIRES VERIFICATION** |
| 5 | GET | `/api/projects/:slug` | `getProjectBySlug` | nobody — **POSSIBLY UNUSED — REQUIRES VERIFICATION** |
| 6 | GET | `/api/services` | `getAllServices` | frontend `pages/HomePage.tsx:171` |
| 7 | GET | `/api/services/:slug` | `getServiceBySlug` | nobody — **POSSIBLY UNUSED — REQUIRES VERIFICATION** |
| 8 | GET | `/api/testimonials` | `getAllTestimonials` | frontend `pages/HomePage.tsx:183` |
| 9 | GET | `/api/testimonials/:id` | `getTestimonialById` | nobody — **POSSIBLY UNUSED — REQUIRES VERIFICATION** |
| 10 | POST | `/api/admin/create` | `createAdmin` | admin `LoginForm.tsx:47`, `SignupForm.tsx:44` |
| 11 | POST | `/api/admin/login` | `login` | admin `LoginForm.tsx:46` |

### Admin-guarded (17)

All behind `router.use(authenticateToken, requireAdmin)` at `src/routes/adminRoutes.ts:46`.

| # | Method | Path | Called by |
|---|---|---|---|
| 12 | GET | `/api/admin/contacts` | `AdminDashboard.tsx:74` |
| 13 | GET | `/api/admin/contacts/:id` | nobody — **POSSIBLY UNUSED — REQUIRES VERIFICATION** |
| 14 | PATCH | `/api/admin/contacts/:id` | `AdminDashboard.tsx:187` |
| 15 | DELETE | `/api/admin/contacts/:id` | nobody — **POSSIBLY UNUSED — REQUIRES VERIFICATION** |
| 16 | GET | `/api/admin/dashboard/stats` | nobody — **POSSIBLY UNUSED — REQUIRES VERIFICATION** |
| 17 | GET | `/api/admin/projects` | `AdminDashboard.tsx:77` |
| 18 | POST | `/api/admin/projects` | `AdminDashboard.tsx:246` |
| 19 | PUT | `/api/admin/projects/:id` | `AdminDashboard.tsx:273` |
| 20 | DELETE | `/api/admin/projects/:id` | `AdminDashboard.tsx:297` |
| 21 | GET | `/api/admin/services` | `AdminDashboard.tsx:80` |
| 22 | POST | `/api/admin/services` | `AdminDashboard.tsx:321` |
| 23 | PUT | `/api/admin/services/:id` | `AdminDashboard.tsx:347` |
| 24 | DELETE | `/api/admin/services/:id` | `AdminDashboard.tsx:373` |
| 25 | GET | `/api/admin/testimonials` | `AdminDashboard.tsx:83` |
| 26 | POST | `/api/admin/testimonials` | `AdminDashboard.tsx:398` |
| 27 | PUT | `/api/admin/testimonials/:id` | `AdminDashboard.tsx:424` |
| 28 | DELETE | `/api/admin/testimonials/:id` | `AdminDashboard.tsx:451` |

**19 of 28 endpoints have a known caller. 9 are marked `POSSIBLY UNUSED — REQUIRES VERIFICATION`.** They are not to be deleted — `/health` in particular is almost certainly consumed by infrastructure that is not in these repositories, and the `:slug` detail endpoints look like a planned case-study feature.

### Dead controller code (routed nowhere)

- `refreshToken` — `src/controllers/adminController.ts:126`. **No `/refresh` route exists.** Verified by grepping `src/routes/` for `refresh`.
- `logout` — `src/controllers/adminController.ts:291`. **No `/logout` route exists.**

Both are fully implemented and both are unreachable. See §9.3.

---

## 9. API contract comparison

### 9.1 Casing is inconsistent *within a single controller*

The database is snake_case throughout. There is **no shared serializer** — each handler hand-maps, or doesn't:

| Endpoint | Casing returned | Mechanism |
|---|---|---|
| `GET /api/admin/contacts` | camelCase | manual map, `adminController.ts:331` |
| `GET /api/admin/contacts/:id` | camelCase | manual map, `:392` |
| `GET /api/admin/projects` | **raw snake_case** | `SELECT *` → `result.rows`, `:713-719` |
| `GET /api/admin/services` | **raw snake_case** | `SELECT *` → `result.rows`, `:779-785` |
| `GET /api/admin/testimonials` | camelCase | manual map |
| `GET /api/admin/dashboard/stats` | camelCase, but `recentContacts` is **raw snake_case rows** | `:566` |
| `GET /api/services` (public) | camelCase | manual map |
| `GET /api/testimonials` (public) | camelCase | manual map |

`getDashboardStats` is the sharpest illustration: three of its four fields are camelCase scalars and the fourth is an array of raw database rows.

**This is the single highest-value refactor target in the codebase** (§30, task 4). One serializer layer would fix four separate rendering bugs at once.

### 9.2 CONFIRMED BUG — contact status silently reverts in the list view

Two divergent status maps exist in the same file:

`src/controllers/adminController.ts:273` — `normalizeStatus`, used by `getContacts` at `:331`:
```ts
case "in_progress": return "In Progress";   // UNDERSCORE
```

`src/controllers/adminController.ts:413` — `mapDatabaseStatus`, used by `getContactById` at `:392` and `updateContactStatus` at `:485`:
```ts
"in-progress": "In Progress",                // HYPHEN
```

And the write path, `updateContactStatus` at `:443-449`, persists the **hyphen** form:
```ts
"In Progress": "in-progress",
```

**Effect:** an admin sets a contact to "In Progress". The database stores `in-progress`. The detail view (`getContactById`) reads it correctly. The **list view** (`getContacts`) hits `normalizeStatus`, finds no match for `in-progress`, and falls through to `default: return "New"`.

The same contact shows as **"New" in the table and "In Progress" in the modal**, permanently. There is no `CHECK` constraint on `contacts.status` (verified — the only CHECK in `init.ts` is on `testimonials.rating`, line 86), so both spellings can and do coexist in the column.

### 9.3 Token lifetime vs. renewal — the 15-minute session

| Token | Secret | Lifetime | Source |
|---|---|---|---|
| Access | `JWT_ACCESS_SECRET` | 15m | `src/utils/token.ts:11` |
| Refresh | `JWT_REFRESH_SECRET` | 7d | `src/utils/token.ts:17` |
| Legacy | `JWT_SECRET` | 10h | `src/middleware/auth.ts:71` — **dead code** |

The backend issues both tokens on login and inserts the refresh token into `refresh_tokens` (`adminController.ts:244`). Then:

- **The backend exposes no refresh endpoint** — `refreshToken` at `:126` is routed nowhere.
- **The admin discards the refresh token anyway** — `LoginForm.tsx:74` destructures only `{ accessToken, user }` from the response.

**Effect:** the admin session hard-expires 15 minutes after login with no renewal path. The next API call 401s, and per §7.5 that triggers `alert()` + forced logout. `refresh_tokens` rows are written on every login and **never revoked** (the only `UPDATE ... revoked = true` is in the unreachable `logout`), so the table grows without bound.

`generateToken` (`auth.ts:71`, signing with `JWT_SECRET` for 10h) is imported at `adminController.ts:4` and **never called** — three JWT secrets are configured, two are used, one is vestigial.

### 9.4 CONFIRMED BREAK — creating a testimonial always returns 400

Admin sends (`TestimonialFormModal.tsx:36-43`): `name`, `position`, `company`, `message`, `rating`, `featured`, `image`, `createdAt`.

Backend destructures (`testimonialController.ts:168-177`): `clientName`, `clientPosition`, `clientCompany`, `testimonialText`, `rating`, `projectId`, `featured`, `imageUrl`.

Backend then validates at `:181-186`:
```ts
if (!clientName || !testimonialText) return res.status(400)...
```

`clientName` and `testimonialText` are always `undefined`. **Every testimonial creation fails with HTTP 400.** Only `rating` and `featured` align.

### 9.5 CONFIRMED BREAK — creating and updating a project returns 500

Admin sends (`ProjectFormModal.tsx:19-34`): `title`, `client`, `category`, `industry`, `description`, `challenge`, `solution`, `image`, `status`, `featured`, `technologies`, `results`, `completedDate`.

Backend `createProject` destructures (`adminController.ts:581-600`): `title`, `industry`, `projectType`, `description`, `challenge`, `solution`, `technologyStack`, `results`, `clientName`, `clientCompany`, `clientPosition`, `testimonial`, `featured`, `imageUrl`.

Only `title`, `industry`, `description`, `challenge`, `solution`, `featured` align. `client`, `category`, `image`, `status`, `technologies`, `completedDate` are all silently dropped.

The fatal one is `results`. The admin sends `{metric, value}[]` (`ProjectFormModal.tsx:33`). The column is `results TEXT` (`init.ts:42`). `pg` serialises the JS array to a Postgres array literal, which will not cast to `TEXT` — **HTTP 500**.

`updateProject` fails differently and worse. `src/controllers/adminController.ts:673`:
```ts
const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
```
Column names come straight from `Object.keys(req.body)`. The admin sends `client`, `category`, `image`, `status`, `technologies`, `completedDate` — **none of which are columns** in the `projects` table. The generated SQL references non-existent columns and Postgres rejects it. **HTTP 500 on every project update.**

### 9.6 Admin list views render undefined fields

Because `GET /api/admin/projects` and `GET /api/admin/services` return raw snake_case:

**ProjectsView.tsx** reads `project.image` (`:102`), `project.status` (`:125`, `:128`), `project.client` (`:173`), `project.technologies` (`:226`), `project.results` (`:245`). The backend sends `image_url`, `published`, `client_name`, `technology_stack`, `results`.
`technologies` and `results` are guarded with `|| []` (`:226`, `:245`) so they render empty rather than crashing — **but `:252` reads `project.results[0].metric` unguarded.** Since `results` is a TEXT column, a non-empty string has `length > 0`, passes the `(project.results || []).length > 0` guard at `:245`, and `results[0]` yields a single **character**, which has no `.metric`. **Any project with non-empty `results` crashes the Projects view.**

**ServicesView.tsx** reads `service.icon` (`:137`), `service.status` (`:138`), `service.category` (`:170`), `service.shortDescription` (`:176`), `service.features` (`:184`), `service.pricing` (`:202`). Of these, only `icon` and `features` exist in the response (both survive snake_case unchanged). `shortDescription` renders blank; `status`, `category` and `pricing` do not exist as columns at all. `pricing` and `createdAt` are already commented out at `:199-208` and `:213` — someone hit this and worked around it rather than fixing the contract.

Note `service.features.slice(0, 5)` at `:184` is **unguarded**, but `features` is `TEXT[]` defaulting to `[]` so it happens not to crash.

### 9.7 Dashboard stats — mismatched and unused

| Admin expects (`types.ts` `DashboardStats`) | Backend sends (`adminController.ts:562-567`) |
|---|---|
| `totalContacts` | `totalContacts` ✓ |
| `newInquiries` | `newContacts` ✗ |
| `activeProjects` | `totalProjects` ✗ |
| `conversionRate` | *(does not exist)* ✗ |
| — | `recentContacts` (raw snake_case rows) |

Three of four names mismatch. It doesn't matter in practice, because **`GET /api/admin/dashboard/stats` is never called** — `AdminDashboard.tsx:130-148` computes all four values client-side from the contacts list.

That client-side computation has its own bug: `:145` filters `projectList.filter(p => p.status === "Published")`. The `projects` table has **no `status` column** (`init.ts:32-53`) — only `published BOOLEAN`. `p.status` is always `undefined`, so **`activeProjects` is permanently 0**.

Similarly `:131` and `:134` filter on `c.status === "New"` / `"Converted"`. These *do* work, because `getContacts` normalises to title-case — but per §9.2, any contact stored as `in-progress` is mis-normalised to `"New"` and inflates `newInquiries`.

### 9.8 ID types

| Layer | Type |
|---|---|
| Database | `SERIAL` → integer (all 8 tables) |
| Backend responses | integer |
| Admin `types.ts` | `id: string` for `Contact`, `Project`, `Testimonial`; `number` for `Service` |

The admin's own handlers are inconsistent about this: `handleUpdateService` coerces with `p.id === Number(id)` (`AdminDashboard.tsx:358`) while `handleUpdateTestimonial` compares raw (`:435`). React key warnings and failed local-state updates follow from this. Not a runtime break, but a real trap for anyone unifying the type layer.

### 9.9 Response envelope and status codes

Envelope is consistently `{success: boolean, message?: string, data?: T, count?: number, pagination?: {...}}` — this is the one contract convention the backend holds to reliably.

Status codes: 200 read, 201 create (contact `:  201`, project `:  201`), 400 validation, 401 missing/invalid auth, 403 wrong role **and** signup-disabled, 404 not found, 409 duplicate, 429 rate limit, 500 unhandled. Reasonable. The notable overload is **403 for two unrelated conditions** — "you are not an admin" and "admin signup is closed" (`adminController.ts:82`).

Pagination exists on `GET /api/testimonials` and `GET /api/admin/testimonials` only. The other six list endpoints return unbounded arrays with a `count`. `GET /api/admin/contacts` will degrade linearly as leads accumulate.

Dates are PostgreSQL `TIMESTAMP` (no timezone), serialised by `pg` to ISO 8601 strings. No `TIMESTAMPTZ` anywhere — see §22 for the timezone consequence.

---

## 10. Authentication audit

**Are the frontend and admin using the same identity system?**

**No — because the frontend has no identity system at all.** This is the cleanest possible answer for consolidation purposes.

| Property | Value | Evidence |
|---|---|---|
| Identity store | one table, `admin_users` | `init.ts:98-108` |
| Password hashing | bcryptjs, cost 10 | `adminController.ts` |
| Access token | JWT HS256, 15m, `JWT_ACCESS_SECRET` | `utils/token.ts:11` |
| Refresh token | JWT HS256, 7d, `JWT_REFRESH_SECRET` | `utils/token.ts:17` |
| Client storage | `localStorage.adminToken` | `LoginForm.tsx:76` |
| Transport | `Authorization: Bearer <token>` | `AdminDashboard.tsx:70` |
| Refresh flow | **none reachable** | §9.3 |
| Logout | client-side only | `AdminDashboard.tsx:44-48` |
| Frontend auth | **none** | `components/Navigation.tsx` — no login link |

Findings:

- **Token in `localStorage` is XSS-reachable.** With `script-src 'unsafe-inline' 'unsafe-eval'` in both CSP definitions (§19), any injected script can exfiltrate the admin token. A httpOnly cookie would be the standard remedy — and consolidation to a single origin makes that materially easier (§25).
- **Client-supplied role on signup.** `LoginForm.tsx` sends `role: "admin"` in the signup body, and `createAdmin` inserts `role` straight from `req.body` (`adminController.ts:107-112`). This is currently contained because signup is blocked once one admin exists (`:80-86`), but the pattern is wrong: the client should never nominate its own role.
- **Derived credentials.** `LoginForm.tsx` computes `fullName: email.split("@")[0].replace(/[._]/g," ")` and `username: email.split("@")[0]` client-side. The admin's display name is a mangled email prefix.
- **The token payload is logged.** `src/middleware/auth.ts:45` — `console.log("🔍 Decoded token:", decoded)` writes `{id, email, role}` to server logs on **every authenticated request**.
- **`rememberMe` is captured and unused** (`LoginForm.tsx`) — a checkbox that does nothing.
- **Client-side-only signup lock.** `localStorage.signupDisabled` (`LoginForm.tsx:31`, `:81`) and `localStorage.adminAccountCreated` (`LoginPage.tsx:17`, `:37`) hide the Sign Up UI. Clearing localStorage restores the button — but the backend still returns 403, so this is cosmetic, not a vulnerability.
- **`SignupForm.tsx` writes different keys.** `:68` stores `localStorage.authToken` and `:73` stores `localStorage.userData`, whereas `LoginForm.tsx` uses `adminToken`/`adminUser` and `AdminDashboard.tsx` reads `adminToken`. `SignupForm.tsx` also reads `data.token` and `data.user` at the top level, but the backend's `createAdmin` returns `{success, message, data: {...}}` with no `token` field at all. **Two divergent, incompatible auth-storage conventions in one 45-file app.**

**Consolidation impact: LOW.** One identity system, one table, one token format. The work is fixing the refresh gap and moving off `localStorage` — both of which are *easier* after consolidation, not harder.

---

## 11. Authorization audit

**Is authorization backend-enforced, or only UI-hidden?**

**Backend-enforced, with a purely cosmetic UI layer on top.** The important conclusion: the missing route guard in §7.2 is a UX defect, not a security hole.

Enforcement chain:

1. `src/routes/adminRoutes.ts:46` — `router.use(authenticateToken, requireAdmin)`. Everything registered after this line (17 routes) is guarded. `/create` and `/login` are registered *before* it (`:36`, `:43`) and are intentionally public.
2. `src/middleware/auth.ts:26-57` — `authenticateToken` verifies against `JWT_ACCESS_SECRET`, then at `:47` requires `decoded.id && decoded.email && decoded.role === "admin"`, returning 403 otherwise.
3. `src/middleware/auth.ts:60-68` — `requireAdmin` re-checks `req.user?.role !== "admin"`.

Findings:

- **Role checking is fused into authentication.** `authenticateToken` at `:47` already rejects non-admin roles, so `requireAdmin` is redundant. This works fine for a single-role system but must be untangled before any second role (editor, viewer) can be introduced.
- **There is exactly one role.** `admin_users.role` defaults to `'admin'` (`init.ts:104`) and nothing ever writes another value. There is no permission matrix, no per-resource ownership, no scoping.
- **`src/middleware/isAdmin.ts` is a duplicate, untyped `requireAdmin` that is never imported** (verified by grep across `src/`). Dead code that will confuse the next reader.
- **Audit logging records intent, not outcome.** `src/middleware/audit.ts` runs `auditLog(action)` as middleware *before* the handler (e.g. `adminRoutes.ts:89`), so `audit_logs` records "Created a new project" even when the handler then fails with 500 — which, per §9.5, is **always**. The insert is also wrapped in `try { ... } catch (_) {}` (`audit.ts:11`), so audit failures are silently swallowed.
- **`audit_logs` is write-only.** No endpoint reads it (verified: the only occurrences of `audit_logs` in `src/` are the INSERT at `audit.ts:7` and the CREATE TABLE). The audit trail is inaccessible to the admin UI.
- **Only 12 of 17 protected routes are audited.** All four GET list endpoints and `PATCH /contacts/:id` have no `auditLog` — so contact status changes and contact deletions leave no trace.

---

## 12. Database audit

One PostgreSQL database, accessed through a single `pg` Pool (`src/config/database.ts:3`). Raw SQL throughout — no ORM, no query builder.

### 12.1 Tables (8)

| Table | Created by | Columns | Notes |
|---|---|---|---|
| `contacts` | `init.ts:9` | 16 + 2 | +2 only via orphaned migration — see §12.3 |
| `projects` | `init.ts:32` | 20 | `results` is TEXT, `technology_stack` is TEXT[] |
| `services` | `init.ts:59` | 14 | 4 TEXT[] columns |
| `testimonials` | `init.ts:80` | 11 | only CHECK constraint in the schema (`rating`, `:86`) |
| `admin_users` | `init.ts:98` | 9 | the sole identity table |
| `email_logs` | `init.ts:114` | 9 | written by `emailServices.ts:86`, **never read** |
| `refresh_tokens` | `001_add_refresh_tokens.sql` | 6 | FK to `admin_users` ON DELETE CASCADE; **never pruned** |
| `audit_logs` | `002_add_audit_logs.sql` | 6 | `admin_id` has **no FK**; write-only |

10 indexes in `init.ts:130-157`, plus one in `001_add_refresh_tokens.sql:10`.

### 12.2 ER overview

```
admin_users ──1:N──► refresh_tokens        (FK, ON DELETE CASCADE)
admin_users ─ ─ ─ ─► audit_logs            (admin_id, NO FK — dangling by design)

projects ────1:N──► testimonials           (FK project_id, nullable)

contacts        (island — no relationships)
services        (island — no relationships)
email_logs      (island — recipient_email is a plain string, no FK)
```

Only **two** real foreign keys exist in the entire schema. `audit_logs.admin_id` is an unconstrained integer. `email_logs` has no relationship to `contacts` even though every row it holds was triggered by one.

### 12.3 CRITICAL — the migration system will fail on a fresh database

**Four competing migration mechanisms:**

| # | Mechanism | Trigger | What it does |
|---|---|---|---|
| 1 | `src/migrations/init.ts` | `server.ts:23`, **every boot** | 6 × `CREATE TABLE IF NOT EXISTS`, 10 indexes, seeds 3 testimonials + 5 services |
| 2 | `scripts/runMigrations.ts` | `npm run migrate`, and `npm start` (`package.json:7`) | globs **`.sql` only**, runs every file every time |
| 3 | `src/migrations/run.ts` | **nothing** | imports and runs `001_add_security_fields.ts` |
| 4 | `src/models/schema.sql` | **nothing** | 6 `CREATE TABLE` statements, unreferenced |

`scripts/runMigrations.ts:10` filters `.filter((f) => f.endsWith(".sql"))`. The migrations directory contains:

- `001_add_refresh_tokens.sql` ✓ runs
- `002_add_audit_logs.sql` ✓ runs
- `003_lock_admin_signup.sql` ✓ runs — but it is a `DO $$` block that only `RAISE NOTICE`s. **It is a no-op.** The real signup lock is in `adminController.ts:80-86`.
- **`001_add_security_fields.ts` — SKIPPED. It is TypeScript, not `.sql`.**

That skipped migration is the only thing that adds `contacts.security_token` and `contacts.submission_timestamp` (`001_add_security_fields.ts:9-10`). Verified: grepping `src/migrations/` and `src/models/` for those column names returns **only** that one file. They are absent from `init.ts` and from every `.sql` file.

And `src/controllers/contactControllers.ts:200-205` INSERTs into both of them:

```sql
INSERT INTO contacts (
  full_name, company_name, email, phone,
  service_interest, project_budget, project_timeline,
  message, how_heard, ip_address, user_agent,
  security_token, submission_timestamp, status
) VALUES ($1, ..., $14)
```

**On any fresh database, the contact form — the product's only lead-capture path — fails with `column "security_token" does not exist`.** Production presumably works only because someone ran that migration by hand at some point. There is no record of that, and no mechanism to repeat it.

This is **the single highest-priority blocker** for a redeploy (§28, blocker #1).

Compounding factors:

- **No migrations tracking table.** Every `.sql` file re-runs on every `npm start`. Idempotent today, but the first non-idempotent migration written will corrupt data.
- **No transaction wrapper.** `scripts/runMigrations.ts:19` runs each file bare. A mid-file failure leaves the schema half-applied.
- **Duplicate `001_` prefix** — `001_add_refresh_tokens.sql` and `001_add_security_fields.ts` — so ordering is ambiguous.
- **`init.ts` swallows its own errors.** `src/migrations/init.ts:231-236` catches, logs, and **does not rethrow**. `server.ts:23` awaits it and proceeds to `app.listen()` regardless. **The server starts successfully with a broken or missing schema.**
- **`migrate:down` is a live footgun.** `package.json:12` runs `001_add_security_fields.down()`, which `DROP COLUMN`s `security_token` and `submission_timestamp` — the exact columns the contact form needs. A documented npm script that breaks lead capture.
- **`npm start` requires `ts-node`, a devDependency.** `package.json:7` is `"npm run migrate && node dist/server.js"`, and `migrate` is `ts-node scripts/runMigrations.ts` (`:11`). `tsconfig.json` has `rootDir: "./src"` and `include: ["src/**/*.ts"]`, so `scripts/` is **never compiled** into `dist/`. Under `npm ci --production` or `NODE_ENV=production npm install`, `ts-node` is absent and **the server does not boot at all.**

### 12.4 Connection and query layer

- `src/config/database.ts:3-8` — Pool from `DATABASE_URL`, with `ssl: {rejectUnauthorized: false}` in production. **TLS certificate verification is disabled**, permitting MITM on the database connection.
- `src/config/database.ts:34` — every query logs `text.substring(0,50)`, duration, and rowCount. On a busy endpoint this is high-volume, and the first 50 characters of a query can include column names and literal values.
- `src/config/database.ts:46` — `exports = { pool }`. This is a **no-op assignment to a local binding**, not `module.exports`. `pool` is never actually exported; only `connectionDatabase` (`:11`) and `query` (`:26`) are. Harmless today (nothing wants the raw pool) but it means no consumer can obtain a client for a transaction.
- **No pooled transactions anywhere.** Multi-statement operations are not atomic.
- `src/server.ts:77-86` — SIGTERM and SIGINT handlers call bare `process.exit(0)` with **no `server.close()` and no `pool.end()`**. In-flight requests are dropped and connections are severed abruptly on every deploy.

---

## 13. Database ownership

| Table | Written by | Read by | Owner |
|---|---|---|---|
| `contacts` | public contact form; admin PATCH/DELETE | admin | **shared** |
| `projects` | admin | public API (unused), admin | admin |
| `services` | admin | frontend homepage, admin | admin |
| `testimonials` | admin | frontend homepage, admin | admin |
| `admin_users` | `/api/admin/create` | login | backend |
| `email_logs` | `emailServices.ts:86` | **nobody** | backend |
| `refresh_tokens` | login | unreachable refresh/logout | backend |
| `audit_logs` | `audit.ts:7` | **nobody** | backend |

Ownership is clean: **the backend is the sole database client.** Neither frontend has a database driver, connection string, or direct query. This is the second most favourable fact for consolidation — there is no data-access layer to merge, no dual-writer to reconcile, and no risk of two apps disagreeing about schema.

`contacts` is the only genuinely shared table, and even there the paths are disjoint: the public site only INSERTs, the admin only SELECTs/UPDATEs/DELETEs.

---

## 14. Environment variable matrix

**Variable names only. No values were read into this report.**

| Variable | Backend `.env` | Backend `.env.example` | Referenced in backend code | Frontend | Admin |
|---|---|---|---|---|---|
| `DATABASE_URL` | ✓ | ✓ | ✓ | — | — |
| `NODE_ENV` | ✓ | ✓ | ✓ | — | — |
| `PORT` | ✓ | ✓ | ✓ | — | — |
| `FRONTEND_URL` | ✓ | ✓ | ✓ | — | — |
| `JWT_ACCESS_SECRET` | ✓ | ✓ | ✓ | — | — |
| `JWT_REFRESH_SECRET` | ✓ | ✓ | ✓ | — | — |
| `JWT_SECRET` | ✓ | ✓ | ✓ (dead path only) | — | — |
| `SENDGRID_API_KEY` | ✓ | **✗** | ✓ | — | — |
| `SENDGRID_FROM_EMAIL` | ✓ | **✗** | ✓ | — | — |
| `DB_PASSWORD` | **✗** | **✗** | ✓ (`migrations/run.ts:12`) | — | — |
| `ADMIN_EMAIL` | ✓ **(listed twice)** | ✓ | ✓ | — | — |
| `ADMIN_URL` | ✓ | ✓ | **✗** | — | — |
| `EMAIL_HOST` | ✓ | ✓ | **✗** | — | — |
| `EMAIL_PORT` | ✓ | ✓ | **✗** | — | — |
| `EMAIL_USER` | ✓ | ✓ | ✓ | — | — |
| `EMAIL_PASS` | **✗** | ✓ | **✗** | — | — |
| `CONTACT_EMAIL` | ✓ | ✗ | **✗** | — | — |
| `ACCESS_TOKEN_EXPIRES` | ✓ | ✗ | **✗** | — | — |
| `REFRESH_TOKEN_EXPIRES` | ✓ | ✗ | **✗** | — | — |
| `NEXT_PUBLIC_API_URL` | — | — | — | ✓ | — |
| `VITE_API_URL` | — | — | — | — | ✓ (**no effect** — §7.1) |

Findings:

- **`ADMIN_EMAIL` is declared twice in `.env`.** The later declaration silently wins. Whichever value is intended, one of them is being ignored.
- **Used but undocumented (3):** `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `DB_PASSWORD`. A fresh deploy following `.env.example` will have **no working email**, because the two SendGrid variables the code actually reads are not in the example file.
- **Documented but unused (4):** `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_PASS`, `ADMIN_URL` — residue from an SMTP implementation replaced by SendGrid.
- **Present but unused (3):** `ACCESS_TOKEN_EXPIRES`, `REFRESH_TOKEN_EXPIRES` (lifetimes are hardcoded at `utils/token.ts:11`, `:17`), `CONTACT_EMAIL`.
- **The frontend has no `.env` or `.env.example` file at all.** `NEXT_PUBLIC_API_URL` is configured only in the Netlify dashboard — `UNKNOWN / REQUIRES VERIFICATION`, not inspectable from the repo. A new developer cloning `accian` gets the `http://localhost:2025` fallback (`config/api.ts:1`) with no documentation that the variable exists.
- **Total env surface: 19 backend + 1 frontend + 1 admin (inert) = 21 variables**, of which **7 are dead** and **3 are undocumented**.

### CRITICAL — the admin's `.env` is committed to git

Verified: `git ls-files | grep -E "\.env"` in `accian-admin/admin` returns **`.env`**. The repo's `.gitignore` does not list `.env`.

The file contains `VITE_API_URL`, which is not itself a secret. **But the file is tracked and in remote history at `github.com/bobprince4u/admin.git`**, which means:

1. The convention in that repo is "commit `.env`" — the next variable added will also be committed.
2. Any secret ever placed in it is in git history permanently.

For contrast, the backend's `.env` — which holds the JWT secrets, the database URL, and the SendGrid key — is **correctly untracked** (verified).

**Required action, outside this audit's scope:** audit the remote history of `github.com/bobprince4u/admin.git` for any secret ever committed to `.env`, and rotate anything found. Per the brief, no history rewriting was performed and none is recommended here without human decision.

---

## 15. Deployment audit

| App | Target | Config | Build | Publish | Verified |
|---|---|---|---|---|---|
| `accian` | Netlify | `netlify.toml` | `npm run build` | `.next` | ✓ from repo |
| `admin` | Netlify (inferred) | **none** — only `public/_redirects` | `tsc -b && vite build` | `dist` (Vite default) | ⚠ inferred |
| `accian-backend` | ? | **none found** | `tsc && cp -r src/templates dist/templates` | `dist` | **UNKNOWN** |

### 15.1 The backend's deployment mechanism is unknown

Searched all three repos, tracked and untracked, for: `.github/`, `Dockerfile*`, `docker-compose*`, `Procfile`, `render.yaml`, `railway.json`/`railway.toml`, `fly.toml`, `vercel.json`, `app.yaml`, `.nvmrc`, `.node-version`.

**Result: none exist anywhere.** No `.github` directory in any repo.

`api.accian.co.uk` demonstrably resolves and serves (the admin hardcodes it and the product functions), so **something** hosts the backend. That something is configured entirely outside version control.

**`UNKNOWN / REQUIRES VERIFICATION` — and this is Integration Blocker #2 (§28).** You cannot consolidate a deployment you cannot see. Before any consolidation work begins, a human must document: the hosting provider, the build command, the start command, the Node version, the environment variables set in that dashboard, the database host, and whether TLS terminates at a proxy.

### 15.2 There is no CI/CD anywhere

No pipeline, no automated build, no automated test, no automated deploy in any of the three repos. Deployment is Netlify's git-push trigger for the two frontends, and an unknown mechanism for the backend. **No quality gate exists between a commit and production.**

### 15.3 The admin has no `netlify.toml`

Only `public/_redirects` (`/*  /index.html  200`). Build command, publish directory, and environment variables are all in the Netlify dashboard — `UNKNOWN / REQUIRES VERIFICATION`. The admin's deploy configuration is therefore also outside version control, though less critically than the backend's.

### 15.4 The backend commits its build output

`dist/` is **tracked — 29 files**. `.gitignore` lists `build/`, not `dist/`. Commit `3a27d28` (2026-01-02) is literally "modified: dist/controllers/adminController.js modified: dist/middleware/auth.js modified: dist/routes/adminRoutes.js".

Two consequences:
1. Every source change produces a second, manual, forgettable step. Any commit that updates `src/` but not `dist/` ships stale code if the host runs `node dist/server.js` without building.
2. `npm start` runs `node dist/server.js` — so **the committed artifact is what actually runs**, if the host doesn't build. Whether it does is `UNKNOWN / REQUIRES VERIFICATION`.

### 15.5 `npm run dev` targets a file that does not exist

`package.json:8` — `"dev": "nodemon --watch 'src/**/*.ts' --exec 'ts-node' server.ts"`.

There is no `server.ts` at the repo root (verified — root contains only `dist`, `node_modules`, `package.json`, `package-lock.json`, `READ.md`, `scripts`, `src`, `tsconfig.json`). The real entrypoint is `src/server.ts`. **The documented development command fails immediately.**

### 15.6 No real README in the backend

`READ.md` — misspelled, and **0 bytes**. The backend has no documentation of any kind: no setup steps, no environment variable list beyond the incomplete `.env.example`, no deployment notes, no API reference.

---

## 16. Deployment topology

**Current (3 deployments, 3 origins):**

```
accian.co.uk            → Netlify  → accian (Next.js SSR via @netlify/plugin-nextjs)
admin.accian.co.uk      → Netlify  → admin (static SPA)          [inferred]
api.accian.co.uk        → ???      → accian-backend (Node)       [UNKNOWN]
                                        │
                                        └──► PostgreSQL (host UNKNOWN)
```

Three separate build pipelines, three separate deploy triggers, three separate environment-variable stores, zero shared configuration. A change spanning all three requires three commits to three repos and three independent deploys with no ordering guarantee — which is precisely how the four-month contract drift in §6.1 happened.

---

## 17. CORS and networking

`src/app.ts:25-64`:

```ts
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
  : process.env.NODE_ENV === "production"
  ? ["https://accian.co.uk", "https://www.accian.co.uk", "https://admin.accian.co.uk"]
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:2025",
     "http://localhost:2024", "http://localhost:2023"];
```

Findings:

- **The production fallback list is a safety net that masks misconfiguration.** If `FRONTEND_URL` is unset, CORS still works in production — so nobody notices the variable is missing until they need to change it.
- **`FRONTEND_URL` is comma-split**, so one variable carries multiple origins. Whitespace is not trimmed: `"a.com, b.com"` produces `" b.com"`, which will never match an `Origin` header. Whether the deployed value has spaces is `UNKNOWN / REQUIRES VERIFICATION`.
- **`src/app.ts:43` — requests with no `Origin` header are always allowed**: `if (!origin) return callback(null, true)`. This is conventional (it permits curl, server-to-server, and same-origin navigation) but combined with `credentials: true` (`:53`) it means any non-browser client bypasses the allowlist entirely.
- **CORS is mounted at `app.use("/", cors(corsOptions))` (`:64`)** rather than the more usual `app.use(cors(...))`. Functionally equivalent here.
- **A rejected origin produces a thrown `Error`**, which reaches `errorHandler` and surfaces as **HTTP 500**, not 403. CORS misconfiguration will look like a server crash in monitoring.
- `allowedHeaders` (`:56`) includes the custom `x-security-token` and `x-timestamp`. Note the frontend sends `X-Security-Token` (`ContactPage.tsx:377`) but **never sends `x-timestamp`** — the timestamp travels in the body (`:392`). One allowlisted header is unused.
- `app.set("trust proxy", 1)` (`:21`) — correct for a single reverse proxy, and required for `req.ip` to be meaningful in rate limiting and audit logs. If the actual topology has two proxies (e.g. CDN + host), `req.ip` is the wrong address and **the per-IP rate limits are wrong**. Depends on §15.1.

**Consolidation impact:** if backend and frontend end up same-origin, this entire CORS layer becomes unnecessary for the frontend, and the admin's cross-origin needs shrink to one origin. If they stay separate origins, three hardcoded fallback origins plus two CSP `connect-src` entries (§19) must all be updated in lockstep.

---

## 18. Routing audit

### 18.1 Frontend routes (6)

From `app/`: `/`, `/contact`, `/services`, `/research-support`, `/privacy-policy`, `/internal/quote-builder`.

Note: `accian/pages/` is **not** the Next.js Pages Router. It holds plain components (`HomePage.tsx`, `ContactPage.tsx`, `ServicesPage.tsx`, `ResearchSupport.tsx`, `PrivacyPolicy.tsx`) imported by the `app/` route files. The directory name is misleading and would cause real confusion in a consolidated repo.

### 18.2 Admin routes (2)

`/` (login) and `/AdminDashboard` (`src/App.tsx`). The mixed-case path is unconventional and will be a permanent wart in any URL scheme.

### 18.3 Can the admin live under `/admin` on the main domain?

**Not without code changes — and this is the answer to the §25 strategy question.**

Blockers, all verified:

1. **`vite.config.ts` sets no `base`.** All asset URLs build as absolute `/assets/...`. Served from `/admin/`, every asset 404s. Requires `base: "/admin/"`.
2. **`react-router` has no `basename`.** `src/App.tsx` uses absolute paths `/` and `/AdminDashboard`. Requires `<Router basename="/admin">`.
3. **`public/_redirects` is `/*  /index.html  200`** — a root-level SPA catch-all that would collide with the Next.js app's own routing.
4. **Two different frameworks, two different build outputs.** Next.js publishes `.next` with a plugin; Vite publishes static `dist`. A single Netlify site publishes one directory. Serving both requires either a Netlify rewrite to a second site, or rebuilding the admin as Next.js routes.

Also worth noting: `netlify.toml:45-49` already establishes a precedent for gated internal routes on the main domain:

```toml
[[redirects]]
  from = "/internal/*"
  to = "/internal/:splat"
  status = 200
  conditions = {Role = ["admin"]}
```

This is **Netlify Identity** role gating — a **fourth** identity concept in the product, alongside `admin_users`, `localStorage.adminToken`, and `localStorage.authToken`. Whether Netlify Identity is actually provisioned on this site is `UNKNOWN / REQUIRES VERIFICATION`. **If it is not, `/internal/quote-builder` is publicly accessible**, protected only by `X-Robots-Tag: noindex` (`netlify.toml:40-43`). This needs verification before consolidation, independent of everything else.

---

## 19. Shared code audit

**There is no shared code.** No shared package, no git submodule, no npm workspace, no published internal module, no copied utility directory.

Duplicated concepts, reimplemented independently in each app:

| Concept | Frontend | Admin | Backend |
|---|---|---|---|
| API base URL | `config/api.ts:1` | 3 files, hardcoded | — |
| HTTP client | axios + fetch | axios + fetch | — |
| `Service` type | `pages/HomePage.tsx:11`, `types/Services.ts` (dead) | `types.ts` | implicit in SQL |
| `Testimonial` type | `pages/HomePage.tsx` local | `types.ts` | implicit in SQL |
| Contact status enum | — | `types.ts` | 2 divergent maps (§9.2) |
| Error handling | throw generic | `alert()` | `errorHandler.ts` |
| Tailwind config | `@tailwindcss/postcss` | `@tailwindcss/vite` | — |
| CSP definition | `next.config.ts:15` **and** `netlify.toml:24` | — | `helmet()` defaults |

**Two CSP definitions in the frontend.** `next.config.ts:12-21` sets one via `headers()`; `netlify.toml:20-28` sets another via `[[headers]]`. Both are applied on a Netlify Next.js deploy, and browsers enforce the **intersection** of multiple CSP headers. Both hardcode `https://api.accian.co.uk` in `connect-src`. Both permit `script-src 'unsafe-inline' 'unsafe-eval'`, which substantially weakens the XSS protection that matters most given the `localStorage` token (§10).

`netlify.toml:35-39` sets immutable 1-year caching for `/assets/*` — a **Vite** convention. Next.js emits hashed assets under `/_next/static/*`, which this rule does not match. The frontend's static assets are therefore not getting the intended cache headers.

**Consolidation opportunity:** a shared `@accian/types` package is the highest-leverage single artifact this product could gain. It would have prevented §6.1, §9.4, §9.5, §9.6, and §9.7 — five of the six confirmed breaks.

---

## 20. Type and schema duplication

Where the authoritative schema should live: **`accian-backend`, derived from the database, exported as a shared package.**

Rationale, not trend: the database is the only component that all three apps agree about, the backend is its sole client (§13), and every current contract bug is a case of a client guessing at a shape the backend already knows. Types generated from or validated against the schema, then consumed by both frontends, eliminates the guessing. A schema-first library (Zod at the boundary, or `pg-to-ts`-style generation) would additionally give runtime validation on the responses, catching drift at the seam instead of in the UI.

Current duplication:

| Type | Definitions | Agreement |
|---|---|---|
| `Service` | 3 (frontend inline, frontend dead file, admin) | **none agree with the backend** |
| `Testimonial` | 2 (frontend inline, admin) | frontend agrees; admin agrees with the *admin* endpoint only |
| `Contact` | 1 (admin) | agrees except `id: string` vs integer |
| `Project` | 1 (admin) | **severely diverged** — §9.5 |
| `DashboardStats` | 1 (admin) | 3 of 4 fields wrong — §9.7 |

Dead type/asset files in the frontend, all verified unreferenced:

- `types/Services.ts` (24 LOC) — exports a `Service` with `icon: LucideIcon` and `deliverables`. Never imported.
- `lib/ServiceIcons.ts` — `iconMap` never imported. Worse, its slug keys (`it-consulting`, `web-development`, `social-care`, `data-science-ai`) **do not match the seeded database slugs** (`it-consulting-advisory`, `business-domestic-software-development`, `social-care-community-support`, `data-science-ai-predictive-analytics`). Only `education-training` matches. Even if it were wired up, 4 of 5 icons would miss.
- `components/ServiceCard.tsx` (81 LOC) — never imported.

`accian/pages/ServicesPage.tsx` imports `detailedServices`, `industries`, `comparisonData`, `processSteps`, `faqs` from `data/ServicesMock.ts` — **static mock data**. So the product renders services from the live API on the homepage and from a hardcoded file on the services page. Two sources of truth for the same domain concept, in the same app, guaranteed to diverge.

`components.json` (shadcn config) points at `src/index.css`, a path that **does not exist** in this repo, and sets `"rsc": false` in an App Router project. `eslint.config.js` uses `reactRefresh.configs.vite` in a Next.js project. Both are Vite-era leftovers — the frontend was migrated from Vite to Next.js and the tooling config was never cleaned up. `public/_redirects` (`/*  /index.html  200`) is the third such leftover, and it is meaningless in a Next.js deploy.

---

## 21. Dependency audit

Read-only `npm audit --json` against the already-present `node_modules` in each repo. **No install, no update, no lockfile modification.**

| Repo | Critical | High | Moderate | Low | Total |
|---|---|---|---|---|---|
| `accian` | **1** | 12 | 4 | 1 | **18** |
| `accian-backend` | 0 | 9 | 3 | 2 | **14** |
| `admin` | 0 | 14 | 4 | 1 | **19** |

**The one critical:** `next` in `accian`. The advisory set includes unauthenticated RCE on Windows-hosted servers, RCE in the Image Optimization API via AVIF, middleware/proxy bypass in App Router, cache poisoning of RSC responses, and SSRF via rewrites. The repo pins `"next": "^16.2.0"`; the caret means a `npm install` would already take a patched minor. **Remediation is likely a version bump, not a code change — but that is an implementation action and is out of scope here.**

Notable highs: `axios` (all three repos — a very large advisory set including prototype-pollution-driven credential injection and SSRF), `express-rate-limit` (**IPv4-mapped IPv6 bypass of per-client rate limiting on dual-stack servers** — directly weakens the contact-form and login limiters), `path-to-regexp` and `qs` (Express 5 transitive DoS), `lodash` (prototype pollution — transitive; `lodash` is not a direct dependency), `postcss` (admin).

### Unused direct dependencies

Verified by grepping for `from "<pkg>"` / `require("<pkg>")` across each repo's source.

**`accian` — 9 unused of 20 (45%):**
`@radix-ui/react-accordion`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-aspect-ratio`, `@radix-ui/react-avatar`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-slot`, `class-variance-authority`, `date-fns`, `embla-carousel-react`, `react-day-picker`.

(That is 10 names; `@radix-ui/react-slot` and `class-variance-authority` are the usual shadcn peer set, so they may have been added by a generator rather than by hand. Either way, nothing imports them.)

**`accian-backend` — 2 unused:** `bcrypt` (only `bcryptjs` is imported, in 2 files) and `node-fetch`. Shipping **both** bcrypt implementations is notable: `bcrypt` is a native module requiring compilation, so it adds build fragility and deploy weight for zero benefit. `@types/jsonwebtoken` is also misplaced in `dependencies` rather than `devDependencies`.

**`admin` — 0 unused.** (`tailwindcss` is consumed via `@import "tailwindcss"` in `src/index.css:1`, not a JS import, so it is legitimately used.) The admin's oddity is instead its **18 devDependencies against 8 dependencies**, including five `@types/babel__*` packages that no application code needs — almost certainly artifacts of a generator or a bad install.

### Version alignment

`typescript` (~5.9.3 / ^5.9.3 / ^5.9.3), `react` (19.2.4 / 19.2.0), `tailwindcss` (^4.1.17 both), `lucide-react` (^0.555.0 both), `axios` (^1.13.2 both), `eslint` (^9.39.1 both) — **all compatible**. A workspace hoist would deduplicate cleanly.

---

## 22. Build and runtime compatibility

| Property | `accian` | `accian-backend` | `admin` |
|---|---|---|---|
| Build | `next build` | `tsc && cp -r src/templates dist/templates` | `tsc -b && vite build` |
| Output | `.next` | `dist` | `dist` |
| Module | ESM | **CommonJS** | ESM |
| TS target | Next default | ES2020 | Vite default |
| Node version | unpinned | unpinned | unpinned |
| Runtime | Netlify Functions / Edge | Node process | static files |

Findings:

- **No Node version is pinned anywhere** — no `engines`, no `.nvmrc`, no `.node-version` in any repo. Three apps built on three possibly-different Node versions, none reproducible. **This must be fixed before consolidation**, because a monorepo forces one toolchain version and nobody currently knows what version production runs.
- **The backend's build is fragile.** `tsc && cp -r src/templates dist/templates` — the HTML email templates (`src/templates/emailTemplates/adminNotification.html`, `userConfirmation.html`) are copied by shell. `cp -r` is not portable to Windows shells, and if the copy is skipped the email service fails at runtime when it reads the template from disk.
- **`scripts/` is excluded from compilation** (`tsconfig.json:12` — `include: ["src/**/*.ts"]`) while `package.json:7` needs it at runtime. See §12.3 — this is the `ts-node`-in-production problem.
- **CommonJS vs ESM** is not a monorepo blocker (each package keeps its own `tsconfig`), but it does rule out sharing runtime code directly between backend and frontend. A shared **types** package is unaffected (types erase at compile time). A shared **runtime utility** package would need dual output or ESM-only with backend `tsconfig` changes.

### CONFIRMED BUG — admin notification emails always fail

`src/services/emailServices.ts:159-161`:

```ts
timestamp: new Date(data.timestamp).toLocaleString("en-NG", {
  timeZone: "UK/England/wales",
  dateStyle: "full", timeStyle: "long",
}),
```

`"UK/England/wales"` is not a valid IANA timezone. **Verified by execution** — running that exact `toLocaleString` call in Node throws:

```
RangeError: Invalid time zone specified: UK/England/wales
```

This is in `sendAdminNotification`. Every admin notification email for every contact submission throws. Whether the user's confirmation email still sends depends on the call ordering in `contactControllers.ts` — the emails are fired async and the handler returns 201 regardless, so **the submitter sees success while the business is never notified of the lead.**

Also note the locale is `"en-NG"` (Nigeria) for a `.co.uk` business, alongside an attempted UK timezone. The correct value is `"Europe/London"`.

Separately, `replacePlaceholders` (`emailServices.ts:64-70`) does raw `{{key}}` regex substitution with **no HTML escaping**, and the substituted values include user-submitted `message`, `fullName`, and `companyName`. The `sanitize()` in `contactControllers.ts` strips only `<` and `>` and truncates to 1000 chars, which blunts script injection but does not properly escape HTML entities.

---

## 23. Target architecture options

### Option A — Monorepo, three deployments (RECOMMENDED)

```
accian/
├── package.json                 # npm workspaces
├── apps/
│   ├── web/                     # accian (Next.js) → Netlify
│   ├── admin/                   # admin (Vite SPA) → Netlify
│   └── api/                     # accian-backend  → Node host
└── packages/
    └── types/                   # @accian/types — the shared contract
```

**Pros:** one clone, one install, one lint/typecheck/test command, one PR for a cross-cutting change, atomic contract changes. Kills the four-month-drift failure mode structurally. Each app keeps its own build, its own module system, its own deploy target — so migration risk is low and rollback is per-app.
**Cons:** requires workspace tooling setup; Netlify needs a base directory per site; the two frontend Netlify sites must be reconfigured to build from subdirectories.
**Risk:** LOW.

### Option B — Merge admin into the Next.js app; keep the backend separate

```
accian/
├── apps/web/          # public routes + /admin/* routes
└── apps/api/
```

**Pros:** two deployments instead of three; one frontend toolchain; admin gains SSR, so auth can move to httpOnly cookies and server-side route protection — fixing §7.2 and the `localStorage` exposure in §10 properly.
**Cons:** the admin must be **rewritten** from Vite/react-router to Next App Router — 4,773 LOC, 19 components, `framer-motion` throughout. This is a rewrite disguised as a move, and it must be done on top of an admin whose write paths are already broken (§9.4, §9.5). You would be porting bugs you cannot test.
**Risk:** HIGH. Not recommended as a first step. It is a reasonable **second** phase, after Option A is stable and the contract bugs are fixed.

### Option C — Full consolidation into one Next.js application

Backend rewritten as Next.js API routes / Server Actions; single deployment.

**Pros:** one codebase, one deploy, one origin — CORS disappears entirely, cookies become trivially httpOnly and same-site, and the type boundary collapses to zero.
**Cons:** discards a working Express application. 28 endpoints, 5 controllers, custom middleware (rate limiting, audit, error handling), a `pg` Pool, and a migration system would all need reimplementation against a serverless execution model. **Connection pooling is the specific hazard** — a `pg` Pool per serverless invocation exhausts Postgres connections; this needs a pooler (PgBouncer, or a provider-side equivalent), which is new infrastructure. Long-running work (async email sends) also does not map cleanly to request-scoped functions.
**Risk:** VERY HIGH. It is also the option most likely to be chosen for reasons of fashion rather than need, which the brief explicitly warned against.

### Recommendation: Option A

Chosen because it addresses the **actual** failure mode observed in the evidence — three repos drifting apart because no single change could span them (§6.1, §9.4, §9.5, §9.6) — at the **lowest** risk, while changing nothing about how anything runs. It requires zero rewrites, zero framework migrations, and zero new infrastructure. Every runtime behaviour that works today keeps working identically.

It is explicitly **not** chosen because monorepos are fashionable. If the three apps were genuinely independent products with separate release cadences and separate teams, three repos would be correct and I would say so. They are not: they are one product, one developer, one release cadence, and one database, and the evidence of harm from the split is concrete and dated.

Options B and C remain available afterwards. Option A does not foreclose them; it is a prerequisite for doing either safely.

---

## 24. Admin integration strategy

| Strategy | Effort | Risk | Verdict |
|---|---|---|---|
| Keep `admin.accian.co.uk` (separate subdomain) | none | none | **RECOMMENDED for phase 1** |
| Serve at `accian.co.uk/admin` (Netlify rewrite to a second site) | low-medium | medium | Phase 2 candidate |
| Rewrite as Next.js routes under `/admin` | high | high | Phase 3 at earliest |

**Recommendation: keep the subdomain initially.** The admin is a separate Vite SPA with no `base` and no router `basename` (§18.3); moving it to a path is a config-plus-code change with no user-visible benefit, and it would be layered on top of an app whose write paths are already broken.

Consolidating the *codebase* (Option A) gives you the contract-drift fix immediately. Consolidating the *URL* gives you nothing until the admin's auth model is rebuilt — and at that point Option B's rewrite is the better vehicle for it anyway.

One genuine argument for the path-based move, worth recording: **same-origin admin would allow httpOnly cookie auth**, which fixes the `localStorage` XSS exposure (§10) at the root rather than mitigating it. That is a real security gain. It is just not a phase-1 gain.

---

## 25. Backend integration strategy

**Keep the backend as a single Express application, moved into the monorepo as `apps/api`.**

Do not split it into services. Do not rewrite it as serverless functions. The reasoning is entirely evidence-based:

- 3,401 LOC, 28 endpoints, 5 controllers. This is small. The problems in it are **defects**, not architecture: three injection sites, a broken migration chain, an invalid timezone, an unwired validation middleware. Splitting it into services would multiply the deployment surface while leaving every one of those defects intact.
- It is already the sole database client (§13), so there is no data-layer contention to resolve.
- Express 5 on a Node process is a perfectly good fit for this load profile. There is no evidence in the repository of a scaling problem — no caching layer, no queue, no read replicas, nothing that suggests the current model is strained.

The work that *is* needed on the backend is defect repair and a serializer layer (§30), not restructuring.

---

## 26. Deployment consolidation strategy

**The brief's distinction is the crux of this audit, so to state it plainly:**

| Kind of consolidation | Recommended? | What it means here |
|---|---|---|
| **Codebase** consolidation | **YES** | One repo, npm workspaces, shared types package. Fixes contract drift. |
| **Deployment** consolidation | **PARTIAL** | Keep 3 deploy targets. Unify the *configuration* of them into version control. |
| **Runtime** consolidation | **NO** | Do not merge processes. The backend stays a Node process; the frontends stay static/SSR on Netlify. |

**"One project" does not mean "one process."** The three applications have genuinely different runtime shapes: a long-lived Node process holding a database pool, an SSR framework on a CDN platform, and a bag of static files. Forcing them into one process would mean either putting Next.js in front of the database (Option C's connection-pooling hazard) or putting static files behind a Node server (throwing away CDN delivery). Neither is an improvement.

What *should* be consolidated at the deployment layer is the **configuration**, which is currently invisible: the backend has no deploy config in version control at all (§15.1), the admin has no `netlify.toml` (§15.3), and the frontend has no `.env.example` (§14). Bringing all three into the repo — as config files and documented variable lists — is most of the real benefit, and it carries no runtime risk whatsoever.

---

## 27. Data migration risk

**No data migration is required.** This is worth stating clearly because it is the biggest risk that *isn't* present.

The consolidation recommended in §23 moves source files between directories. It does not touch the database, the schema, the connection string, or any row. One database serves all three apps today and would serve them identically afterwards.

The risks that *are* present are schema-integrity risks that already exist:

| Risk | Severity | Detail |
|---|---|---|
| Fresh DB missing `security_token` / `submission_timestamp` | **CRITICAL** | §12.3 — contact form fails on any new environment |
| `migrate:down` drops those columns | **HIGH** | `package.json:12` — a documented script that breaks lead capture |
| No migrations tracking table | **HIGH** | Every `.sql` re-runs every start; the first non-idempotent migration corrupts |
| `init.ts` swallows errors | **HIGH** | `init.ts:231-236` — server starts with a broken schema |
| Mixed `in-progress` / `in_progress` in `contacts.status` | **MEDIUM** | §9.2 — existing rows may hold either; no CHECK constraint |
| No transaction wrapper on migrations | **MEDIUM** | Partial application on failure |
| Unbounded `refresh_tokens` growth | **LOW** | Never pruned; no revocation reachable |

**Before any redeploy**, the schema of the live database must be captured and compared against `init.ts` + all migrations. That comparison is the only way to know what the live schema actually is, given four competing mechanisms and one of them silently skipped. It requires database access and is therefore `UNKNOWN / REQUIRES VERIFICATION` from the repositories alone.

---

## 28. Domain and URL migration

| URL | Classification | Evidence |
|---|---|---|
| `https://accian.co.uk` | **production** | `netlify.toml:10`, canonical (non-www) |
| `https://www.accian.co.uk` | **production** (redirects to non-www) | `netlify.toml:14-18` |
| `https://api.accian.co.uk` | **production** | hardcoded in 15 admin call sites + 2 CSPs |
| `https://admin.accian.co.uk` | **production** (inferred) | CORS fallback list, `app.ts:33` |
| `http://localhost:2025` | development | backend default port, `server.ts:6` |
| `http://localhost:2024` | development | `.env.example` `FRONTEND_URL` |
| `http://localhost:2023` | development | `.env.example` `ADMIN_URL` (`/admin` path!) |
| `http://localhost:5173`, `:5174` | development | Vite defaults, CORS fallback |
| `https://www.accian.co.uk` in `robots.txt` / `sitemap.xml` | **INCONSISTENT** | uses **www** while `netlify.toml` canonicalises to **non-www** |

Findings:

- **`robots.txt` and `sitemap.xml` disagree with the canonical domain.** They advertise `www.accian.co.uk`; `netlify.toml:14-18` 301-redirects www → non-www. Every sitemap URL therefore costs search engines a redirect hop, and the canonical signal is muddled. `sitemap.xml` also **omits `/research-support`**, the newest page.
- **`.env.example` sets `ADMIN_URL=http://localhost:2023/admin`** — evidence that a path-based admin at `/admin` was the *original* intent. That variable is now unused (§14), but it documents the design direction.
- **`api.accian.co.uk` is hardcoded in 17 places** across 5 files (15 admin call sites, `next.config.ts:15`, `netlify.toml:24`). Any API domain change during consolidation requires edits in all 17. **This is the single largest mechanical obstacle to a domain change**, and it is entirely self-inflicted.

Not determinable from the repositories: DNS records, TLS certificate coverage, whether a staging environment exists at all. **`UNKNOWN / REQUIRES VERIFICATION`.** No staging domain appears anywhere in any repo, which suggests deploys go straight to production — consistent with the absence of CI/CD (§15.2).

---

## 29. External integrations and webhooks

| Integration | Direction | Auth | Used by | Evidence |
|---|---|---|---|---|
| **SendGrid** | outbound | `SENDGRID_API_KEY` | backend | `emailServices.ts` |
| **PostgreSQL** | outbound | `DATABASE_URL` | backend | `config/database.ts:3` |
| **Netlify** | platform | git | frontend, admin | `netlify.toml`, `_redirects` |
| **Netlify Identity** | platform | role gate | frontend `/internal/*` | `netlify.toml:49` — **provisioning UNKNOWN** |
| Google Analytics | — | — | **nobody** | referenced in both CSPs; **no GA/GTM code exists** |
| Google Maps | — | — | **nobody** | `frame-src` in `next.config.ts:19`; no embed found |

### Webhook audit

**There are no webhooks in this system.** No inbound webhook endpoints (the 28-endpoint inventory in §8 contains none), no signature verification code, no outbound webhook calls, no event subscriptions. SendGrid is used send-only — no event webhook is configured in code, so delivery failures, bounces, and spam reports are invisible to the application.

Two related findings:

- **`email_logs` is written but never read** (§12.1). The backend records every email attempt and its status, and no endpoint or UI surfaces it. Given that admin notification emails **always fail** (§22), this table almost certainly contains a long record of that failure that nobody has ever looked at.
- **Analytics is configured in CSP but does not exist in code.** Both CSP definitions allowlist `https://www.google-analytics.com`, and grepping the frontend for `gtag`, `GTM-`, `googletagmanager`, and `analytics` finds only the word "analytics" inside service copy in `data/ServicesMock.ts`. **The product has no analytics.** Either it was removed and the CSP wasn't cleaned, or it was planned and never added.

### The contact form's "security token" is not a security control

`pages/ContactPage.tsx:372` generates `securityToken` client-side, sends it in the `X-Security-Token` header (`:377`) **and** in the body (`:391`). `src/controllers/contactControllers.ts` verifies that the header equals the body value.

Both values come from the same client. Any script can generate a matching pair. This blocks nothing — it is not CSRF protection (there is no session to forge against), not a CAPTCHA, and not rate limiting. It is ceremony.

The actual anti-abuse controls on that endpoint are the `express-rate-limit` limiter (5 per 15 min) and an in-memory `submissionTracker` Map. **The in-memory Map does not survive a restart and is per-process**, so it provides no guarantee on any multi-instance or auto-restarting host.

---

## 30. Security audit

Per the brief: findings only, with severity and evidence. **Nothing was fixed.**

### CRITICAL

**S1. SQL identifier injection — 3 sites.**
- `src/controllers/adminController.ts:673`
- `src/controllers/serviceController.ts:234-236`
- `src/controllers/testimonialController.ts:266-268`

All three build an UPDATE `SET` clause by interpolating `Object.keys(req.body)` directly as column names:

```ts
const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
await query(`UPDATE projects SET ${setClause}, updated_at = $${keys.length + 1} WHERE id = $${keys.length + 2} RETURNING *`, [...values, new Date(), id]);
```

**Values are correctly parameterised. Column names are not.** This is identifier injection rather than classic value injection, which narrows exploitation but does not eliminate it: an attacker controls arbitrary SQL text in the `SET` clause position. At minimum it permits writing to any column in the table (including `published`, bypassing the intended workflow) and error-based information disclosure. All three sit behind admin authentication, which reduces exposure to an authenticated admin — but the same pattern with a client-supplied key list is exactly what makes the admin's own updates return 500 (§9.5), so it is both a vulnerability and a live bug.

**S2. `.env` tracked in git in the admin repo.** §14. `.gitignore` does not cover it. Requires a history audit of the remote and rotation of anything ever committed.

### HIGH

**S3. Validation middleware is never wired.** `src/middleware/handlevalidationErrors.ts` defines `handleValidationErrors`, which calls `validationResult(req)`. **It is never imported anywhere** (verified by grep). Therefore `contactFormValidationRules` and `validateLogin` attach express-validator chains whose results are **never inspected**. Every express-validator rule in the codebase is decorative. `contactControllers.ts` does its own manual validation, so the contact form is not unvalidated — but `validateLogin` on `POST /api/admin/login` (`adminRoutes.ts:43`) provides **no actual validation at all**.

**S4. Error messages leak to production.** `src/middleware/errorHandler.ts:28` — `let message = err.message || "Internal Server Error"`, and `:65` returns `message` unconditionally. Only `error` and `stack` are gated behind `NODE_ENV === "development"` (`:66-69`). Raw error text — including Postgres messages naming tables, columns, and constraints — reaches the client in production. Given §9.5 generates a Postgres error on every project update, the admin UI is receiving schema details in its error responses right now.

**S5. Token stored in `localStorage` with permissive CSP.** §10. `script-src 'unsafe-inline' 'unsafe-eval'` in both CSP definitions (`next.config.ts:14`, `netlify.toml:24`) makes XSS materially easier, and the admin token is readable by any injected script.

**S6. `rejectUnauthorized: false` on the production database connection.** `src/config/database.ts:7`. TLS certificate verification disabled — the connection is encrypted but unauthenticated, permitting MITM.

**S7. Client-supplied role at signup.** §10. `LoginForm.tsx` sends `role: "admin"`; `createAdmin` inserts `req.body.role` verbatim (`adminController.ts:107-112`). Contained only by the "first admin only" check.

**S8. Rate limiter bypass via dependency.** `express-rate-limit`'s IPv4-mapped-IPv6 advisory (§21) directly undermines the login and contact-form limiters on a dual-stack host.

### MEDIUM

**S9. Sensitive data in logs.**
- `src/middleware/auth.ts:45` — full decoded token (`id`, `email`, `role`) on **every** authenticated request.
- `src/controllers/adminController.ts` — logs the email address on every login attempt.
- `src/config/database.ts:34` — first 50 chars of every query.
- `src/pages/AdminDashboard.tsx:89-119` — contact PII (`full_name`, `company_name`, `service_interest`, `email`) to the browser console, in the production bundle.

**S10. Unescaped HTML in email templates.** `emailServices.ts:64-70` — raw `{{key}}` substitution with user-submitted content. `sanitize()` strips only `<>`.

**S11. Rate limit windows contradict their comments.** `src/middleware/rateLimiter.ts:19` — `windowMs: 15 * 60 * 1000, // 1 hour` (it is 15 minutes). Line 42 — `windowMs: 30 * 30 * 1000, // 1 hour` (that is **900,000 ms = 15 minutes**, from an apparent typo of `30 * 30` for `60 * 60`). The signup limiter is 12× shorter than intended.

**S12. `403` overloaded for two unrelated conditions.** `adminController.ts:82` returns 403 for "signup disabled"; `auth.ts:49`/`:66` return 403 for "not an admin". A client cannot distinguish them.

**S13. In-memory rate limiting does not survive restarts.** `contactControllers.ts` `submissionTracker` Map. Per-process, non-persistent.

**S14. Netlify Identity gating may not be provisioned.** `netlify.toml:49`. If not, `/internal/quote-builder` is public. `UNKNOWN / REQUIRES VERIFICATION`.

### LOW / INFORMATIONAL

**S15.** No CSRF protection — acceptable, as auth is a Bearer header rather than a cookie. Would become **required** if auth moves to cookies (as §24 recommends).
**S16.** `helmet()` at defaults (`app.ts:22`) — no explicit HSTS/CSP configuration on the API.
**S17.** `express.json({ limit: "10mb" })` (`app.ts:67`) is generous for an API whose largest payload is a contact form.
**S18.** No account lockout, no password complexity requirement, no MFA on the admin login.
**S19.** `src/middleware/rateLimiter.ts:2` — `import { skip } from "node:test"`. A stray unused import of a **test framework** in production middleware.
**S20.** No `.dockerignore`/`.npmignore` concerns, as no containerisation exists.

---

## 31. Production readiness audit

| Capability | Status | Evidence |
|---|---|---|
| Health endpoint | ✓ | `app.ts:100` |
| Graceful shutdown | ✗ | `server.ts:77-86` — bare `process.exit(0)`, no `server.close()`, no `pool.end()` |
| Structured logging | ✗ | `console.log` with emoji throughout; morgan for HTTP only |
| Error monitoring | ✗ | no Sentry, no APM, nothing |
| Uptime monitoring | UNKNOWN | `/health` exists; no monitor found in repos |
| Metrics | ✗ | none |
| Distributed tracing | ✗ | none |
| Request IDs | ✗ | none — logs cannot be correlated |
| Automated tests | ✗ | zero test files in all three repos |
| CI/CD | ✗ | §15.2 |
| Staging environment | UNKNOWN | no staging domain in any repo |
| Backups | UNKNOWN | database host unknown |
| Migration safety | ✗ | §12.3 |
| Secret management | partial | backend `.env` untracked ✓; admin `.env` tracked ✗ |
| Dependency scanning | ✗ | no Dependabot, no CI audit |
| Rollback capability | partial | Netlify keeps deploy history; backend rollback UNKNOWN |
| API documentation | ✗ | `READ.md` is 0 bytes |
| Runbook | ✗ | none |

**Verdict: NOT production-ready by conventional standards, though it is in production.** The gaps that matter most for a consolidation are the absence of tests (nothing to detect regressions), the absence of CI (no gate), and the unknown backend deployment (nothing to reproduce).

---

## 32. Testing audit

| Repo | Test framework | Test files | Coverage | Test script |
|---|---|---|---|---|
| `accian` | none | **0** | 0% | none |
| `accian-backend` | none | **0** | 0% | `"test": "npm run migrate &&echo \"Error: no test specified\" && exit 1"` |
| `admin` | none | **0** | 0% | none |

**There are zero automated tests in the entire product.**

The backend's `test` script (`package.json:9`) is worse than absent: it **runs the migrations** and then exits 1. Anyone or any CI system invoking `npm test` mutates the database and then reports failure. Note the missing space in `&&echo` — this script was never run successfully by anyone.

**This is the central constraint on the whole consolidation.** Every safety argument for a refactor normally rests on "the tests will catch it." Here nothing will catch anything. Combined with six already-broken paths (§33), any consolidation must be validated by **manual end-to-end verification against a documented checklist**, and that checklist must record the known-broken paths as expected failures so they are not mistaken for regressions.

Highest-value tests to add before refactoring (recommendation only — not implemented):
1. `POST /api/contact` end-to-end, including the `security_token` column dependency (§12.3).
2. Contact status round-trip: PATCH then GET-list, asserting the value survives (catches §9.2).
3. Contract tests asserting each endpoint's response keys — this alone would have caught §6.1, §9.4, §9.5, §9.6, §9.7.
4. Admin login → authenticated request → token expiry behaviour (catches §9.3).

---

## 33. User journey audit

| Journey | Path | Status |
|---|---|---|
| Visitor browses services (homepage) | frontend → `GET /api/services` | **DEGRADED** — descriptions render blank (§6.1) |
| Visitor browses services (services page) | static mock data | works, but diverges from live data (§20) |
| Visitor reads testimonials | frontend → `GET /api/testimonials` | works |
| Visitor submits contact form | frontend → `POST /api/contact` | works on the live DB; **fails on any fresh DB** (§12.3) |
| Visitor receives confirmation email | backend → SendGrid | probably works |
| **Business is notified of a new lead** | backend → SendGrid | **BROKEN — invalid timezone throws** (§22) |
| Visitor downloads EOI form | static `.docx` | works |
| Visitor requests a quote (internal) | `/internal/quote-builder` → `mailto:` | works; **access gating UNVERIFIED** (§18.3) |
| Admin signs up | admin → `POST /api/admin/create` | works (first admin only) |
| Admin logs in | admin → `POST /api/admin/login` | works |
| Admin session persists | — | **BROKEN — dies at 15 min, no refresh** (§9.3) |
| Admin views contacts | `GET /api/admin/contacts` | works |
| Admin updates contact status | `PATCH /api/admin/contacts/:id` | **DEGRADED — reverts to "New" in list view** (§9.2) |
| Admin views dashboard stats | client-computed | **DEGRADED — `activeProjects` always 0** (§9.7) |
| Admin views projects | `GET /api/admin/projects` | **DEGRADED — snake_case; crashes if `results` non-empty** (§9.6) |
| Admin creates a project | `POST /api/admin/projects` | **BROKEN — HTTP 500** (§9.5) |
| Admin updates a project | `PUT /api/admin/projects/:id` | **BROKEN — HTTP 500** (§9.5) |
| Admin views services | `GET /api/admin/services` | **DEGRADED — snake_case** (§9.6) |
| Admin creates a service | `POST /api/admin/services` | works |
| Admin creates a testimonial | `POST /api/admin/testimonials` | **BROKEN — HTTP 400 always** (§9.4) |
| Admin deletes anything | DELETE endpoints | works, but **unpublish-only and irreversible from the UI** (§7) |

**Tally: 6 broken, 6 degraded, 10 working, 1 unverified.**

The `DELETE` finding deserves emphasis. All four DELETE endpoints unpublish rather than delete — but `GET /api/admin/projects` filters `WHERE published = true` (`adminController.ts:713`). **An admin who deletes a project can never see it again in the admin UI.** The row survives in the database, permanently invisible. The same applies to services.

---

## 34. Code quality audit

**Volume:** 13,451 TS/TSX LOC tracked across three repos (5,277 + 3,401 + 4,773).

| Signal | Count | Evidence |
|---|---|---|
| Dead files (0 bytes) | 4 | admin `AuthContext.tsx`, `utils/api.tsx`, `utils/auth.tsx`, `utils/helpers.tsx` |
| Dead files (unreferenced) | 6 | `isAdmin.ts`, `handlevalidationErrors.ts`, `models/schema.sql`, `migrations/run.ts`, `adminService.ts`, frontend `types/Services.ts` + `lib/ServiceIcons.ts` + `components/ServiceCard.tsx` |
| Dead functions | 3 | `refreshToken`, `logout`, `generateToken` |
| Unused direct dependencies | 11 | §21 |
| Duplicate implementations | 3 | 2 status maps, 2 `requireAdmin`, 4 migration mechanisms |
| Stray/incorrect imports | 1 | `import { skip } from "node:test"` in production middleware |
| Config leftovers from a prior framework | 4 | `components.json`, `eslint.config.js`, `public/_redirects`, `pages/` naming |
| Console logging | pervasive | including PII (§30 S9) |
| `any` usage | present | e.g. `audit.ts:4` (`req: any, res: any, next: any`), `adminController.ts:787` (`error: any`) |
| Copy-paste error messages | 6+ | `AdminDashboard.tsx:361`, `:382`, `:410`, `:438`, `:463` all say "project"/"service" in testimonial and service handlers |

The copy-paste error strings are a small thing that says a lot: `handleUpdateTestimonial` logs `"Update Project Error:"` and alerts `"Failed to update project."` (`AdminDashboard.tsx:438-439`), and `handleDeleteTestimonial` asks "Are you sure you want to delete this project?" (`:445`). Handlers were duplicated without adaptation — the same mechanism that produced the field-name mismatches in §9.4 and §9.5.

**TypeScript strictness:** `UNKNOWN / REQUIRES VERIFICATION` for exact `strict` flags per repo, but the presence of `any` in middleware signatures and of `id: string` types against integer columns indicates the type system is not being used as a safety net. Notably, **the field mismatches in §9.4 and §9.5 would have been compile errors** if the admin imported backend-derived types — which is the §20 recommendation.

---

## 35. Git history analysis

| Repo | Commits | First | Last | Authors |
|---|---|---|---|---|
| `accian` | 79 | 2025-12-18 | **2026-04-25** | bobprince (78), Bobprince4u (1, GitHub web UI) |
| `accian-backend` | 44 | 2025-12-18 | **2026-01-02** | bobprince (44) |
| `admin` | 28 | 2025-12-18 | **2026-01-04** | bobprince (28) |

**151 commits, one human author.** All three repos started the same day. All three are in sync with origin. No branches beyond `master`, no tags, no merge commits.

**The single most consequential fact in this section: the backend has not been touched since 2026-01-02, and the admin since 2026-01-04, while the frontend continued to 2026-04-25.** That is roughly 16 weeks of frontend-only evolution against a frozen contract. §6.1 (`description` vs `shortDescription`) is the direct, dated consequence.

Commit message quality is uniformly poor — messages are `git status` output pasted verbatim: `"modified:   src/middleware/auth.ts"`, `"odified:   dist/controllers/adminController.js"` (sic, commit `3a27d28`). No conventional-commits format, no issue references, no rationale. **The history documents what changed but never why**, which removes it as a source of design intent for the refactor.

Two things the history *does* usefully show:
- Commit `3a27d28` explicitly commits `dist/` alongside `src/`, confirming §15.4's manual-artifact workflow.
- The frontend's final three commits (2026-04-25) rename `public/Accian_EOI_Form .docx` (with a space) to `public/Accian_EOI_Form.docx`, and the file is now correctly tracked and present — so the Research Support download works.

Per the brief: **no history was rewritten and nothing was cherry-picked.**

---

## 36. Integration blockers

### CRITICAL — resolve before any consolidation work begins

**B1. The migration chain is broken; a fresh database cannot run the product.**
`001_add_security_fields.ts` is skipped by the `.sql`-only glob in `scripts/runMigrations.ts:10`, and it is the only source of `contacts.security_token` and `contacts.submission_timestamp`, which `contactControllers.ts:200-205` INSERTs into. Any new environment fails on the contact form. Compounded by `init.ts:231-236` swallowing errors so the server starts anyway, and by `npm start` requiring `ts-node` from devDependencies (§12.3).

**B2. The backend's deployment mechanism is unknown and unversioned.**
No CI config, no Dockerfile, no Procfile, no host config file in any repo (§15.1). You cannot reproduce, migrate, or roll back a deployment you cannot see. A human must document the host, build command, start command, Node version, and environment variables before anything else proceeds.

**B3. The admin repo tracks `.env` in git.**
§14. Requires a remote-history audit and rotation of anything ever committed. This is a prerequisite to consolidation because merging repos merges histories.

### HIGH

**B4. Six user-facing paths are already broken.** §33. Consolidating without recording these first means post-consolidation testing cannot distinguish pre-existing failures from new regressions. This is the reason the verdict is *with conditions* rather than *safe*.

**B5. Zero tests.** §32. No regression detection of any kind.

**B6. 17 hardcoded `api.accian.co.uk` occurrences across 5 files.** §28. Any origin change during consolidation requires all 17 to move together; the admin's `VITE_API_URL` is inert (§7.1).

**B7. No Node version pinned in any repo.** §22. A monorepo forces one toolchain, and nobody currently knows what production runs.

**B8. Three SQL identifier-injection sites.** §30 S1. Also the direct cause of B4's project-update failure.

### MEDIUM

**B9. Admin session dies at 15 minutes with no refresh path.** §9.3.
**B10. No shared types; five contract bugs traceable to it.** §20.
**B11. CommonJS backend vs ESM frontends.** §22 — not a monorepo blocker, but blocks shared *runtime* code.
**B12. Admin cannot be served from a path without `base` + `basename` changes.** §18.3.
**B13. Two CSP definitions in the frontend, both hardcoding the API origin.** §19.
**B14. Netlify Identity gating on `/internal/*` unverified.** §30 S14.

### LOW

**B15.** `accian-admin/` stray non-repo wrapper directory with a stub `package.json` (§2).
**B16.** Frontend repo named `accian`, colliding with the product name (§2).
**B17.** `/AdminDashboard` mixed-case route (§18.2).
**B18.** Backend `dist/` tracked in git (§15.4).
**B19.** `robots.txt`/`sitemap.xml` www vs non-www mismatch (§28).

---

## 37. Non-blocking technical debt

Real debt that should **not** hold up the consolidation:

- 11 unused direct dependencies (§21) — 9 in the frontend alone.
- Both `bcrypt` and `bcryptjs` installed; only `bcryptjs` used (§21).
- 10 unreferenced files and 3 dead functions (§34).
- 7 dead environment variables; `ADMIN_EMAIL` declared twice (§14).
- `import { skip } from "node:test"` in production middleware (§30 S19).
- Vite-era config leftovers: `components.json` pointing at a nonexistent path, `eslint.config.js` using `reactRefresh.configs.vite`, `public/_redirects` in a Next.js app (§20).
- Misleading `pages/` directory in the App Router frontend (§18.1).
- `READ.md` — misspelled and empty (§15.6).
- `npm run dev` targets a nonexistent file (§15.5).
- `npm test` runs migrations then exits 1 (§32).
- Rate limit comments contradicting their code (§30 S11).
- Copy-paste error strings across admin handlers (§34).
- `services`/`projects` list endpoints unpaginated (§9.9).
- `email_logs` and `audit_logs` write-only (§12.1).
- `exports = { pool }` no-op in `database.ts:46` (§12.4).
- `ServicesPage.tsx` rendering from static mocks while `HomePage.tsx` uses the API (§20).
- Sitemap omitting `/research-support` (§28).

---

## 38. Recommended target repository structure

```
accian/                                  # one repo, npm workspaces
├── package.json                         # workspaces: ["apps/*", "packages/*"]
├── .nvmrc                               # PIN THE NODE VERSION (fixes B7)
├── README.md                            # setup for all three apps
├── docs/
│   ├── accian-integration-audit.md      # this document
│   ├── deployment.md                    # fixes B2 — the unknown backend deploy
│   └── known-issues.md                  # fixes B4 — the pre-existing-failure baseline
│
├── apps/
│   ├── web/                             # ← accian, unchanged
│   │   ├── app/
│   │   ├── components/
│   │   ├── views/                       # ← renamed from pages/ (fixes the App Router confusion)
│   │   ├── netlify.toml
│   │   └── .env.example                 # NEW — documents NEXT_PUBLIC_API_URL
│   │
│   ├── admin/                           # ← accian-admin/admin, unchanged
│   │   ├── src/
│   │   ├── netlify.toml                 # NEW — currently dashboard-only
│   │   └── .env.example                 # replaces the tracked .env
│   │
│   └── api/                             # ← accian-backend, unchanged
│       ├── src/
│       ├── migrations/                  # ONE mechanism, one format, with a tracking table
│       ├── scripts/
│       └── .env.example                 # completed with the 3 missing vars
│
└── packages/
    └── types/                           # @accian/types — THE shared contract
        ├── contact.ts
        ├── project.ts
        ├── service.ts
        ├── testimonial.ts
        └── enums.ts                     # one canonical contact-status enum
```

Deliberate choices:

- **`apps/` keep their existing internal structure.** Moving files inside them is separate work with separate risk. Phase 1 is a relocation, not a reorganisation.
- **`packages/types` is the only new code.** It is the artifact that would have prevented five of the six confirmed breaks.
- **`.nvmrc` at the root** resolves B7 and is a precondition for reproducible builds.
- **`docs/known-issues.md`** is not optional. With zero tests, a written baseline of the six broken paths is the only defence against mistaking pre-existing failures for regressions.
- **`views/` rather than `pages/`** — the one rename worth doing during the move, because `pages/` actively misleads in an App Router project.

---

## 39. Refactoring sequence

Ordered so that **each step is independently verifiable and independently revertible**, and nothing depends on a later step.

### Phase 0 — Establish ground truth (no code changes)
1. Document the backend's actual deployment: host, build command, start command, Node version, environment variables, database host, TLS termination. **Resolves B2.**
2. Capture the live database schema and diff it against `init.ts` + all migrations. **Resolves the §27 unknown.**
3. Audit the remote history of `github.com/bobprince4u/admin.git` for committed secrets; rotate anything found. **Resolves B3.**
4. Verify whether Netlify Identity is provisioned for `/internal/*`. **Resolves B14.**
5. Write `docs/known-issues.md` recording the six broken and six degraded paths as the baseline. **Resolves B4's testing hazard.**

### Phase 1 — Fix what is broken, in place, in the current repos
6. Fix the migration chain: fold `001_add_security_fields` into a `.sql` migration, add a tracking table, wrap in a transaction, make `init.ts` rethrow, move `ts-node` to dependencies or precompile `scripts/`. **B1.**
7. Fix the timezone: `"UK/England/wales"` → `"Europe/London"`, locale `"en-NG"` → `"en-GB"`. Restores lead notifications. **§22.**
8. Unify the contact-status enum to one map and add a CHECK constraint. **§9.2.**
9. Wire `handleValidationErrors` into the routes that declare validators. **S3.**
10. Parameterise or allowlist the three UPDATE column lists. **B8 / S1.**
11. Stop returning raw `err.message` in production. **S4.**
12. Remove PII from logs (`auth.ts:45`, `AdminDashboard.tsx:89-119`, login email). **S9.**
13. Pin Node in all three repos. **B7.**

*Everything above is deployable independently and improves the product with zero structural change. If the consolidation were cancelled today, this phase would still be worth doing.*

### Phase 2 — Consolidate the codebase
14. Create the monorepo shell; move all three repos in, preserving history (`git subtree` or `git read-tree`).
15. Configure workspaces; verify all three still build byte-identically.
16. Reconfigure the two Netlify sites for their new base directories.
17. Deploy each app from the monorepo, one at a time, verifying against the Phase 0 baseline.

*No behaviour changes in this phase. Three deployments in, three deployments out.*

### Phase 3 — Introduce the shared contract
18. Create `packages/types` from the backend's actual response shapes.
19. Add a serializer layer to the backend so every endpoint returns camelCase consistently. **§9.1.**
20. Consume the types in the frontend — this immediately surfaces §6.1 as a compile error.
21. Consume the types in the admin — this surfaces §9.4, §9.5, §9.6, §9.7 as compile errors, then fix them.
22. Add the four highest-value tests from §32.

### Phase 4 — Deferred, optional
23. Add a refresh endpoint and wire it up; move to httpOnly cookies. **B9.**
24. Replace hardcoded admin URLs with the (now functional) `VITE_API_URL`. **B6.**
25. Evaluate Option B (admin as Next.js routes) — only now, with tests and a working contract.

---

## 40. Migration strategy

**Incremental, per-application, with no big-bang cutover.** The three apps deploy independently today, which is the property that makes this safe — each can be moved into the monorepo and redeployed while the other two continue running from their original repos.

Recommended order within Phase 2: **frontend first** (most recently active, best-understood, its Netlify config is already in-repo), **admin second** (smallest blast radius — it is an internal tool, and its write paths are already broken so there is little to regress), **backend last** (highest risk, and blocked on B2 until Phase 0 completes).

Keep the three original repos intact and untouched as the rollback path until all three apps have served production traffic from the monorepo for a full business cycle.

**Do not delete the old repos.** Archive them read-only.

---

## 41. Rollback plan

| Phase | Rollback mechanism | Recovery time |
|---|---|---|
| Phase 0 | nothing to roll back (documentation only) | — |
| Phase 1 (fixes in place) | `git revert` per fix; redeploy | minutes |
| Phase 1 step 6 (migration) | **needs a database backup taken first** | depends on backup |
| Phase 2 (repo move) | repoint Netlify to the original repo; the old repos still exist | minutes per app |
| Phase 3 (shared types) | `git revert`; types erase at compile time so no runtime change | minutes |

Preconditions before Phase 1 step 6 (the migration fix) — the only step that touches data:
1. A verified database backup, with a **tested** restore.
2. The Phase 0 schema diff completed, so you know what state the live database is actually in.
3. A rehearsal against a copy of production data.

Netlify's deploy history provides per-app rollback for the two frontends. **Backend rollback capability is `UNKNOWN / REQUIRES VERIFICATION`** and depends entirely on B2 — this is a further reason B2 blocks Phase 2.

---

## 42. Questions requiring human decision

Answered where the repositories permit; escalated where they do not.

**Q1. Should this become a monorepo?**
Yes — Option A (§23). Not because monorepos are fashionable, but because the evidence shows a specific, dated harm from the split: 16 weeks of frontend-only evolution produced five contract bugs that a shared types package would have made compile errors. If the three apps had separate teams and separate release cadences, three repos would be right. They have one author and one cadence.

**Q2. Should the admin be merged into the frontend application?**
Not yet (§24). It is a 4,773-LOC Vite SPA with no `base` and no router `basename`, and its write paths are currently broken. Merging it would be a rewrite performed on top of untested, non-working code. Revisit after Phase 3.

**Q3. Should the backend be rewritten as Next.js API routes?**
No (§25). It is a working 3,401-LOC Express app whose problems are defects, not architecture. Serverless would introduce a connection-pooling problem that does not exist today, and would not fix a single one of the six broken paths.

**Q4. Does "one project" require one deployment?**
No — and this is the most important framing correction in this audit (§26). Consolidate the **codebase**; keep three **runtimes**. The three apps have genuinely different runtime shapes, and forcing one process would mean either putting Next.js in front of the database or putting static files behind a Node server.

**Q5. Where should the authoritative schema live?**
The backend, derived from the database, exported as `packages/types` (§20). The database is the only thing all three apps already agree about, and the backend is its sole client.

**Q6. Can the admin live at `accian.co.uk/admin`?**
Not without code changes (§18.3): `vite.config.ts` needs `base`, `react-router` needs `basename`, `public/_redirects` conflicts, and two build systems cannot publish one directory. Note `.env.example` shows `/admin` was the original intent.

**Q7. Is authorization actually enforced, or just hidden in the UI?**
Enforced (§11). The backend guards all 17 protected routes at `adminRoutes.ts:46`. The admin SPA's missing route guard is a UX defect, not a security hole.

**Q8. Are the frontend and admin on the same identity system?**
There is only one identity system, and only the admin uses it (§10). The public site has no authenticated-user concept at all. "Unifying identity" is therefore a non-task.

**Q9. Is it safe to consolidate now?**
Yes, with the conditions in §43 — principally: resolve B1 (migrations), B2 (unknown deployment), and B3 (tracked `.env`) first, and write down the six pre-existing failures before you start, so you can tell them apart from regressions later.

**Q10. What must a human decide that this audit cannot?**

These require access or authority outside the repositories:
- **Where is the backend deployed, and with what configuration?** (B2 — blocks Phase 2)
- **Has any secret ever been committed to the admin's `.env`, and does it need rotating?** (B3)
- **Is Netlify Identity provisioned for `/internal/*`, or is the quote builder public?** (B14)
- **What is the live database's actual schema?** (§27)
- **Does a staging environment exist, and are there database backups?** (§31)
- **Which of the 9 `POSSIBLY UNUSED` endpoints are consumed by something outside these repos** — monitors, integrations, bookmarks? (§8)
- **Is the four-month frontend/backend drift intentional** (backend feature-complete) **or abandonment** (backend work stalled)? This changes whether Phase 1 is maintenance or revival.
- **Should the six broken paths be fixed before, during, or after consolidation?** This audit recommends **before** (Phase 1), because fixing them afterwards means debugging in a codebase that changed underneath them.

---

## 43. Final verdict

### Executive verdict

# CONSOLIDATE WITH CONDITIONS

The consolidation itself is **low-risk and well-justified**. The three applications are loosely and one-directionally coupled (§5), share exactly one database with a single writer (§13), share no code and no build (§19), and have fully compatible dependency versions (§21). Nothing about their structure resists being brought together, and the evidence of harm from keeping them apart is concrete and dated: 16 weeks of frontend-only evolution produced five contract bugs (§35, §6.1).

The conditions exist because of what consolidation would **carry forward and obscure**: six already-broken user-facing paths, a migration chain that fails on any fresh database, and a backend deployment that nobody can see.

**Conditions, all of which are Phase 0 or Phase 1 work (§39):**

1. **Document the backend's deployment** before moving anything. (B2)
2. **Fix the migration chain** and verify against a fresh database. (B1)
3. **Audit and rotate** anything ever committed to the admin's tracked `.env`. (B3)
4. **Write down the six broken paths as a baseline** before you start. With zero tests, this document is your only regression detector. (B4)
5. **Pin the Node version** in all three repos. (B7)
6. **Take and test a database backup** before the migration fix — the one step that touches data.

### Recommended architecture

**Monorepo with npm workspaces; three deployments retained; one shared types package.**

```
accian/  →  apps/web (Netlify)  ·  apps/admin (Netlify)  ·  apps/api (Node)  ·  packages/types
```

Codebase consolidation: **yes**. Deployment consolidation: **configuration only**. Runtime consolidation: **no**.

### Top 10 risks

| # | Risk | Severity | Evidence |
|---|---|---|---|
| 1 | Fresh database cannot run the product — skipped migration | **CRITICAL** | §12.3 |
| 2 | Backend deployment unknown and unversioned | **CRITICAL** | §15.1 |
| 3 | Admin `.env` tracked in git | **CRITICAL** | §14 |
| 4 | Three SQL identifier-injection sites | **CRITICAL** | §30 S1 |
| 5 | Zero tests — no regression detection anywhere | **HIGH** | §32 |
| 6 | Six user-facing paths already broken; no baseline recorded | **HIGH** | §33 |
| 7 | Lead notification emails always fail (invalid timezone) | **HIGH** | §22 |
| 8 | Admin token in `localStorage` under a permissive CSP | **HIGH** | §30 S5 |
| 9 | 1 critical + 35 high dependency advisories across three repos | **HIGH** | §21 |
| 10 | Admin session dies at 15 min with no refresh path | **MEDIUM** | §9.3 |

### Top 10 refactoring tasks

Ordered by value per unit of risk.

| # | Task | Fixes | Phase |
|---|---|---|---|
| 1 | Repair the migration chain (one mechanism, tracking table, transaction, rethrow, `ts-node` out of the runtime path) | B1 | 1 |
| 2 | Document the backend deployment | B2 | 0 |
| 3 | Fix the email timezone → `Europe/London` | lead notifications | 1 |
| 4 | Add a response serializer; one canonical casing | §9.1, §9.6 | 3 |
| 5 | Create `packages/types` and consume it in both clients | §6.1, §9.4, §9.5, §9.6, §9.7 | 3 |
| 6 | Unify the contact-status enum + add a CHECK constraint | §9.2 | 1 |
| 7 | Parameterise/allowlist the three UPDATE column lists | S1 | 1 |
| 8 | Wire `handleValidationErrors` into the routes that declare validators | S3 | 1 |
| 9 | Add a refresh endpoint; wire it in the admin; move to httpOnly cookies | §9.3, S5 | 4 |
| 10 | Replace 17 hardcoded API URLs with the (now working) env var | B6 | 4 |

### Estimated complexity

Rated across the nine dimensions this audit examined. **These are complexity ratings, not time estimates** — per the brief, no hour or day figures are given, because nothing in the repositories supports estimating them: there are no tests to run, no CI timings, no team velocity, and one unknown deployment target.

| Area | Complexity | Why |
|---|---|---|
| Codebase consolidation (repo move) | **LOW** | No shared code, compatible versions, three independent builds |
| Backend integration | **LOW** | Stays as-is; moves directories only |
| Admin integration (subdomain retained) | **LOW** | No change required in phase 1 |
| Authentication unification | **LOW** | Only one identity system exists |
| API contract alignment | **MEDIUM** | 5 mismatches across 4 resources; mechanical once types are shared |
| Database / schema work | **HIGH** | 4 competing migration mechanisms; live schema unverified; touches data |
| Deployment / infrastructure | **HIGH** | Backend target unknown; no CI; no Node pin; 3 config stores |
| Routing / domain migration | **MEDIUM** | 17 hardcoded URLs; 2 CSP definitions; www/non-www inconsistency |
| Testing / verification | **VERY HIGH** | Zero tests, zero CI, six pre-existing failures, manual verification only |

The shape of this table is the finding: **the consolidation is easy; verifying it is hard.** Every low rating is a structural property of the code, and every high rating is an absence of infrastructure.

### Final recommendation

**Proceed — but do Phase 0 and Phase 1 first, and do not skip the baseline document.**

The three ACCIAN applications should become one repository. The evidence for it is not architectural preference; it is a 16-week drift that produced five contract bugs, visible in the git dates and in the field names. A shared types package would have turned every one of those into a compile error.

But consolidating first would be a mistake. Six paths are broken right now, and with zero tests the only thing standing between "we consolidated" and "we broke it" is a human remembering what was already broken. Fix what is broken while the repos are still separate and each fix is independently deployable and revertible. Then move.

The one thing that must happen before anything else: **someone has to write down where the backend is deployed.** Every other task in this report can be done by reading code. That one cannot, and Phase 2 cannot start without it.

---

## 44. Audit safety confirmation

Per §50 of the brief, `git status --porcelain` was run in all three repositories on completion:

| Repository | `git status --porcelain` | Interpretation |
|---|---|---|
| `accian` | 0 lines | clean — unmodified |
| `accian-backend` | 0 lines | clean — unmodified |
| `accian-admin/admin` | 0 lines | clean — unmodified |

Confirmed:

- **No source files** were created, modified, moved, renamed, or deleted in any repository.
- **No dependencies** were installed, updated, or removed. `npm audit` was run read-only against pre-existing `node_modules`; no `package.json` and no lockfile was touched.
- **No deployment configuration** was modified.
- **No database schema** was altered and **no query was executed** against any database.
- **No environment variables** were changed. Secret **values** were never read into this report — variable names only.
- **No commits.** **No pushes.** **No deployments.** **No history rewriting.** **No cherry-picking.**
- The only file created by this audit is this document, at `/home/princewill/Desktop/ACCIAN-PROJECT/docs/accian-integration-audit.md`. The workspace root is not a git repository, so this file is untracked by all three repos and does not alter any repository's structure.

*End of audit.*
