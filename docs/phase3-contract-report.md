# Phase 3 — contract and Resend migration report

**Status:** complete, uncommitted. Working tree only. `HEAD` is unchanged at
`83b00881`.

**Written for:** the reviewer of this phase.

Phase 3 had two goals: make `packages/types` a real contract between the API
and its clients, and replace SendGrid with Resend. Both are done. Along the way
three latent defects surfaced; they are described below with the evidence,
because two of them were reachable in production.

No secret values appear in this report, in the repository, or in any document
written during this phase.

---

## 1. What changed

| Area | Change |
|---|---|
| `packages/types` | Split into per-resource modules; dual ESM/CJS build; consumed by all three apps |
| `apps/api` | SendGrid → Resend behind a transport seam; error handler no longer leaks internals |
| `apps/admin` | Local type definitions replaced by re-exports of the contract |
| `apps/web` | Home page reads contract types |
| `docs/` | New `api-contract.md`; `deployment.md` updated for Resend |

**26 files modified, 15 added, 4 deleted** (+856 / −594 across tracked files).
Nothing committed.

---

## 2. Defects found and fixed

### 2.1 The error handler disclosed database internals — *reachable in production*

The most serious finding of this phase, and not one the brief predicted.

`errorHandler.ts` ended with `message = err.message || "Internal Server Error"`.
Three SQLSTATEs (`23505`, `23503`, `22P02`) were mapped to safe text; **every
other error was relayed to the client verbatim.** Every controller routes
database failures into this middleware via `next(error)` — 12+ call sites — so
the path was reachable from essentially every endpoint.

I probed a real `pg` failure rather than reasoning about the shape:

```
name: "Error"   code: "ECONNREFUSED"   statusCode: undefined
message: "connect ECONNREFUSED 127.0.0.1:1"
```

It matches no branch, so it fell to the default and the caller received the
database host and port. Against production `DATABASE_URL` that is live
infrastructure disclosure. A `42601` would have returned SQL text; `42703`,
column names.

**Fix.** The default is inverted: a message is sent only if it is *recognised as
caller-facing* — a sub-500 `AppError`, a mapped SQLSTATE, a known library error
name — and everything else becomes `"Internal Server Error"`. Full detail still
reaches the server log.

Two tightenings beyond the reported defect:

- **A 5xx `AppError` no longer passes its message through.** `AppError(500)` is
  a server fault whose message was written for an operator.
- **The `NODE_ENV === "development"` branch that attached `stack` and `error`
  is gone.** It made the response shape differ by environment, so the leak was
  only observable in production — and `NODE_ENV` is set by the host, not by
  this code.

**Evidence the tests are load-bearing.** Passing tests prove nothing unless
they would have caught the bug, so the new suite was run against the restored
old handler:

| | Old handler | New handler |
|---|---|---|
| `tests/errorHandler.test.ts` (15 cases) | **11 fail** | 15 pass |

The 4 passing either way are the preserved-behaviour cases — the three original
SQLSTATEs and JWT translation — which were already correct and were kept
deliberately.

**No bypass.** Zero controller `catch` blocks respond directly; all route
through the handler, so the fix covers every one.

### 2.2 `sendAdminNotification` sent to an undefined recipient

`to` was `process.env.ADMIN_EMAIL`, typed `string | undefined` and unchecked. A
missing variable handed the provider an undefined recipient, so the failure
surfaced as an opaque provider error rather than naming its cause. It now fails
by name before reaching the transport, with a test asserting nothing is sent.

### 2.3 A fresh deploy had no working email configuration

`.env.example` documented no email provider variables at all, so a deployment
following it started successfully and silently sent nothing. The Resend
variables are now documented there, marked secret, with the constraint that the
key belongs to `apps/api` alone.

---

## 3. The Resend migration

The migration went in behind a seam rather than as a find-and-replace.
`emailServices` owns *what an email says* — templates, substitution, escaping,
`email_logs`. `emailProvider` owns *how it leaves the process*.

The test of whether that seam is in the right place: **every pre-existing email
assertion survived the provider swap unchanged.** Only one string changed
(`/SendGrid unavailable/` → `/Email provider unavailable/`). The contact
endpoint's contract is identical before and after. `email.test.ts` now runs 25
tests: the 17 that predate this phase, plus 8 covering the transport boundary,
redaction, the `ADMIN_EMAIL` guard and the test-send refusal.

> **Run the suite with `npm test`, not `npx tsx --test`.** The npm script
> compiles to CommonJS in `dist-test/` first. Several tests stub
> `database.query` via `Object.defineProperty`, which works on a CJS exports
> object but throws `Cannot redefine property` against an ESM namespace binding
> when `tsx` executes the TypeScript directly. Running those files through
> `tsx` reports spurious failures that say nothing about the code.

Three properties worth noting:

- **Resend reports failure in the resolved value** (`{ data, error }`), not by
  throwing. The adapter converts that to a `throw`, which is what lets callers
  keep their single pre-existing `try/catch`.
- **Provider errors are redacted at the boundary.** They quote back what they
  rejected — an API key or a contact's address. `redactProviderMessage` strips
  both before anything reaches stdout or `email_logs.error_message`. Key
  patterns run before the address pattern so an address regex cannot claim part
  of a key.
- **Two independent layers prevent test sends.** `setEmailTransport` swaps the
  transport, *and* `ResendTransport.getClient()` refuses to construct a client
  under `NODE_ENV=test` — so the suite cannot reach the network even with a real
  key in the environment. A test asserts the second layer directly.

### Verified empirically, not assumed

- **Type resolution.** `resend`'s `types` field points at `dist/index.d.mts`
  while `apps/api` is CommonJS with node10 resolution. Rather than assume that
  works, I built an isolated probe with the API's exact compiler options and a
  realistic `emails.send` call: **tsc exit 0.** Only then was the real lockfile
  touched.
- **No key leakage.** A probe with a deliberately fake key captured all console
  output and the returned error: key in stdout/stderr `false`, key in returned
  error `false`. *This made one outbound request with an invalid key; it was
  rejected at authentication, no email was sent, and no real data was
  transmitted.*
- **Lockfile integrity.** Counts were baselined before installing, and the
  package-level diff afterwards contained only the SendGrid removals and the
  Resend additions — platform-specific optional dependencies were unchanged,
  which an incremental `npm install` can otherwise prune. `npm ci` then
  reproduced the tree byte-identically. Current state, verified directly:
  `resend@6.28.0` resolves under `apps/api`, and `@sendgrid/mail` is absent
  from both the dependency tree and `node_modules`.

---

## 4. The contract

`packages/types` is now the single source of truth, consumed by all three apps.
It carries no framework types, reads no environment variables, and its only
runtime exports are five guards and arrays over literal unions.

**§24 — consumable, not merely buildable.** Verified against the built output
from both module systems:

```
require('@accian/types')  → isApiError, CONTACT_STATUSES, isContactStatus, PROJECT_STATUSES, isProjectStatus
import  '@accian/types'   → same five
```

The `dist/cjs/package.json` marker (`{"type":"commonjs"}`) is what overrides the
root `"type": "module"` for that subtree; without it the CJS build would be
parsed as ESM.

`@accian/types` is a **devDependency** of `apps/api`, deliberately. Every import
there is type-only and erased at compile time, so the API builds on a host that
installs inside `apps/api` alone — which matters because `docs/deployment.md`
records the API host as unknown with root directory `apps/api`. The
corresponding rule: **never add a value import of `@accian/types` to
`apps/api`.** Re-verified this phase — the only `@accian/types` occurrences in
`dist/` are inside a doc comment, with no `require()` call.

### What documenting the contract exposed

Writing `docs/api-contract.md` meant checking every claim against source, and
six drafted from memory were wrong. Four would have misled a reader:

| Assumed | Actual |
|---|---|
| One list envelope `{data, count}` | **Three envelopes.** Projects and testimonials paginate; only services counts |
| Error field `fields?` | **`errors?`**, plus an undocumented `code?` |
| `Testimonial.id` is `number` | `string` — swapped with `TestimonialProject` |
| `Project` uses `updatedAt` | `lastUpdated`; only `Service` has `updatedAt` |
| `DELETE` unpublishes | True for 3 — **contacts is a hard `DELETE FROM`** |
| Write models omit server fields | The contact form **renames 5 fields in transit** |

The envelope error was the worst: a client following that table would read
`.count` on `/api/projects`, get `undefined`, and read it as an empty list.

### Three inconsistencies recorded rather than changed

Each is a behaviour change, not a contract defect, and rules 6, 7 and 23 put
them out of scope. All are documented:

1. **`ContactSubmission` → `Contact` renames five fields** (`companyName`→
   `company`, `serviceInterest`→`service`, `projectBudget`→`budget`,
   `projectTimeline`→`timeline`, `howHeard`→`hearAbout`).
2. **`DELETE` means two different things.** Contacts is irreversible; projects,
   services and testimonials unpublish. A UI with one "Delete" affordance
   promises the user something different per resource.
3. **`id` is `string` for contacts/projects/testimonials/admin, `number` for
   services and nested `TestimonialProject`.** The serializers coerce
   deliberately per resource, so one `Testimonial` object graph carries both.

`GET /api/admin/dashboard/stats` also exists but is never called — the admin
computes the same four figures in the browser and rounds `conversionRate` to a
whole percent where the API reports one decimal.

---

## 5. Verification

| Check | Result |
|---|---|
| API tests | **123/123** (108 baseline + 15 new) |
| `tsc --noEmit` (api) | exit 0 |
| Build — api / admin / web | all pass |
| Architecture guards | 9/9 |
| `@accian/types` dual consumption | require + import both resolve |
| Secret scan | clean |
| `npm ci` reproducibility | byte-identical |
| Git | `HEAD` unchanged, nothing committed |

The only credential-shaped strings in the tree are deliberately fake test
fixtures, which exist to assert that they *do not* leak.

---

## 6. Not done, deliberately

- **DNS records are not invented.** `docs/deployment.md` names the record
  *kinds* Resend requires (DKIM, SPF, optional DMARC) and states plainly that
  the values are account-specific. Inventing them would produce a domain that
  silently fails to send. It also warns that a second SPF `TXT` record fails SPF
  outright.
- **No production email was sent.**
- **The 404 handler still echoes `req.path`.** That is client-supplied data the
  caller already has, JSON-encoded, and not on §7's list. Changing it would be
  scope creep.
- **Nothing committed, pushed, merged, rebased or deployed.**

---

## 7. Requires attention before deploy

1. **Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` on the API host**, and verify
   the sending domain in Resend first — `RESEND_FROM_EMAIL` must be on a
   verified domain or sends fail.
2. **Set `ADMIN_EMAIL`.** It now fails by name rather than silently.
3. **Remove `SENDGRID_API_KEY`** from the host once Resend is confirmed
   working. `SENDGRID_FROM_EMAIL` still works as a deprecated fallback and warns
   on startup; step 5 of the cutover in `docs/deployment.md` removes it last,
   deliberately.
4. **Rotate the SendGrid key** if it was ever exposed. Removing a variable does
   not invalidate a credential that has already leaked.
