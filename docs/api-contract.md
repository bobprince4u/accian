# ACCIAN — API contract

The shapes that cross the HTTP boundary between `apps/api` and its two clients,
`apps/web` and `apps/admin`.

The types live in `packages/types` and are published as `@accian/types`. That
package is the **single source of truth**: this document describes it, it does
not restate it. Where the two disagree, the package is right and this file is
stale.

**Written for:** developers changing an endpoint, a client that consumes one,
or the contract itself.

---

## 1. What this contract is, and is not

It describes **the API contract, not the database schema.** Where the two
disagree, the column name is an implementation detail and the mapping belongs
to the API's serializers (`apps/api/src/utils/serializers.ts`).

Three properties hold by construction:

- **No framework types.** No Express, Next.js, React, Vite, `pg` or email
  provider types appear in the package, and nothing in it reads an environment
  variable. It is consumable from a browser bundle and from Node.
- **Both module systems.** `apps/api` is CommonJS; `apps/web` and `apps/admin`
  are ESM. The package works from both.
- **Almost no runtime.** The only runtime exports are small guards over literal
  unions (`isApiError`, `isContactStatus`, `isProjectStatus`) and the arrays
  behind them (`CONTACT_STATUSES`, `PROJECT_STATUSES`). Everything else is a
  type and is erased at compile time.

The contract **describes the API as it is, not as it would be if designed
today.** Where handlers are inconsistent — and several are, see §3 and §6 —
the inconsistency is modelled rather than smoothed over. A type that flattered
the API would typecheck and then fail at runtime, which is the failure this
package exists to prevent.

> **Types are not validation.** TypeScript is erased at runtime. A client
> asserting a response is `Contact` does not make it one. The API stays
> authoritative for validating what it receives; the contract exists so that
> the two sides *agree on names and shapes*, not so either can skip checking.

---

## 2. Read models and write models are different types

This is the part most likely to be got wrong, because the mistake typechecks
against a stale local definition and only fails at runtime.

A **read model** is what the API returns. It includes fields the server owns:
`id`, `slug`, `createdAt`, `lastUpdated`, `orderIndex`.

A **write model** — the `*Input` types, and `ContactSubmission` — is what a
client may submit.

| Read model | Write model |
|---|---|
| `Project` | `ProjectInput` |
| `Service` | `ServiceInput` |
| `Testimonial` | `TestimonialInput` |
| `Contact` | `ContactSubmission` |

**`Omit<Project, "id">` is not `ProjectInput`.** Omitting only `id` still
demands `slug`, `createdAt` and `orderIndex` from a form that has no business
supplying them. The admin dashboard used to be typed that way against its own
local definitions; those are now re-exports of this package
(`apps/admin/src/types.ts`), and the `*Input` types are what the write paths use.

### The contact form renames its fields in transit

`ContactSubmission` and `Contact` are not the same shape under different
optionality. **The same datum has a different name on the way in and on the way
out:**

| Submitted (`ContactSubmission`) | Returned (`Contact`) |
|---|---|
| `companyName` | `company` |
| `serviceInterest` | `service` |
| `projectBudget` | `budget` |
| `projectTimeline` | `timeline` |
| `howHeard` | `hearAbout` |

`fullName`, `email`, `phone` and `message` keep their names. This is a real
property of the API, not a documentation slip — a client that posts `company`
or reads `serviceInterest` off a response gets `undefined` either way, with no
type error if it was typed against a hand-rolled local interface.

`POST /api/contact` does **not** echo the created contact. It returns
`ContactSubmissionResult` — `{ referenceNumber, timestamp }` — only.

### Fields accepted and discarded

Some write paths accept fields they then drop, listed in
`apps/api/src/utils/requestFields.ts` as `PROJECT_ACCEPTED_BUT_NOT_PERSISTED`
(`completedDate`, `id`), `SERVICE_ACCEPTED_BUT_NOT_PERSISTED` (`id`,
`createdAt`) and `TESTIMONIAL_ACCEPTED_BUT_NOT_PERSISTED` (`createdAt`, `id`).
They are deliberately absent from the `*Input` types. Sending them is harmless;
expecting them back is not.

---

## 3. Envelopes — there are three, not one

Every response is wrapped, and **which wrapper you get depends on the
endpoint.** Getting this wrong is the most likely runtime failure in a client,
because `undefined` from the wrong accessor reads as "empty" rather than as an
error.

```ts
// Single value — ApiSuccess<T>
{ success: true, data: T, message?: string }

// List reporting a count — ApiSuccessList<T>
{ success: true, data: T[], count: number }

// List reporting a page — PaginatedResponse<T>
{ success: true, data: T[], pagination: { total, page, limit, totalPages } }
```

**`count` and `pagination` are mutually exclusive.** A paginated endpoint has no
`count`; a counted endpoint has no `pagination`. §4 gives the wrapper for every
endpoint. Paginated endpoints accept `PaginationQuery` (`page`, `limit`).

The failure shape is:

```ts
{ success: false, message: string, errors?: ApiFieldError[], code?: string }
```

The field is **`errors`**, not `fields`. It appears only where
express-validator's array is passed through, and `code` only where a handler
sets one deliberately. `ApiFieldError` mirrors express-validator's own shape
(`path`, `msg`, `type`, `location`, `value`), all optional.

`isApiError(response)` is the runtime guard; it tests `success === false` rather
than the absence of `data`, because a successful list can legitimately be empty.

**Errors never carry internals.** No stack traces, no database errors, no SQL,
no provider errors, no secrets — in **any** environment, including development.

This is enforced in one place, `apps/api/src/middleware/errorHandler.ts`, and
the rule there is *safe by default*: a message is sent to the client only if it
is recognised as caller-facing — a sub-500 `AppError`, a mapped SQLSTATE, a
known library error name — and everything else becomes `"Internal Server
Error"`. Full detail still goes to the server log, which is where an operator
should read it.

The inversion matters because the previous default was the opposite. Anything
unrecognised was relayed verbatim, so a database connection failure answered the
caller with `connect ECONNREFUSED <host>:<port>`. Adding a SQLSTATE to the
mapped set is therefore a deliberate act of disclosure, and the replacement text
must never quote the driver. `tests/errorHandler.test.ts` holds the boundary:
11 of its 15 cases fail against the old handler.

---

## 4. Endpoints

Mounted in `apps/api/src/app.ts`. Public endpoints need no credential; admin
endpoints require a valid access token. The **Envelope** column is the wrapper
from §3.

### Public

| Method | Path | Request | Payload | Envelope |
|---|---|---|---|---|
| `POST` | `/api/contact` | `ContactSubmission` | `ContactSubmissionResult` | single |
| `GET` | `/api/projects` | `PaginationQuery` | `ProjectSummary[]` | **pagination** |
| `GET` | `/api/projects/:slug` | — | `Project` | single |
| `GET` | `/api/services` | — | `ServiceSummary[]` | **count** |
| `GET` | `/api/services/:slug` | — | `Service` | single |
| `GET` | `/api/testimonials` | `PaginationQuery` | `Testimonial[]` | **pagination** |
| `GET` | `/api/testimonials/:id` | — | `Testimonial` | single |

The list endpoints return **summary** shapes. `ServiceSummary` is not `Service`:
a client needing `fullDescription`, `technologyStack`, `processSteps`,
`idealFor` or `updatedAt` must fetch the single-item endpoint. Same for
`ProjectSummary` versus `Project`.

Note the asymmetry: projects and testimonials paginate, services does not.

### Admin — auth

| Method | Path | Request | Payload | Envelope |
|---|---|---|---|---|
| `POST` | `/api/admin/login` | `LoginRequest` | `LoginResult` | single |
| `POST` | `/api/admin/refresh` | `RefreshRequest` | `RefreshResult` | single |
| `POST` | `/api/admin/logout` | — | — | single |
| `POST` | `/api/admin/create` | see below | `AdminUser` | single |

`LoginResult` is `{ accessToken, refreshToken, user: AdminUser }`. Refresh
**rotates**: the presented token is spent and a new pair issued, so a client
must store both values from `RefreshResult`, not just the access token.

`AdminUser` is `{ id, email, fullName, role }` — no password hash, no JWT
internals, no `username`. `POST /api/admin/create` requires `email`, `password`,
`fullName` **and `username`** in its body, but `username` is not part of
`AdminUser` and does not come back. It has no contract type because it is an
operator-facing bootstrap endpoint rather than a client-facing one.

### Admin — resources

| Method | Path | Request | Payload | Envelope |
|---|---|---|---|---|
| `GET` | `/api/admin/contacts` | — | `Contact[]` | count |
| `GET` | `/api/admin/contacts/:id` | — | `Contact` | single |
| `PATCH` | `/api/admin/contacts/:id` | `ContactStatusUpdate` | `Contact` | single |
| `DELETE` | `/api/admin/contacts/:id` | — | — | single |
| `GET` | `/api/admin/dashboard/stats` | — | `DashboardStats` | single |
| `GET` | `/api/admin/projects` | — | `Project[]` | count |
| `POST` | `/api/admin/projects` | `ProjectInput` | `Project` | single |
| `PUT` | `/api/admin/projects/:id` | `ProjectInput` | `Project` | single |
| `DELETE` | `/api/admin/projects/:id` | — | — | single |
| `GET` | `/api/admin/services` | — | `Service[]` | count |
| `POST` | `/api/admin/services` | `ServiceInput` | `Service` | single |
| `PUT` | `/api/admin/services/:id` | `ServiceInput` | `Service` | single |
| `DELETE` | `/api/admin/services/:id` | — | — | single |
| `GET` | `/api/admin/testimonials` | — | `Testimonial[]` | **pagination** |
| `POST` | `/api/admin/testimonials` | `TestimonialInput` | `Testimonial` | single |
| `PUT` | `/api/admin/testimonials/:id` | `TestimonialInput` | `Testimonial` | single |
| `DELETE` | `/api/admin/testimonials/:id` | — | — | single |

Admin testimonials paginate; admin contacts, projects and services do not.

### `DELETE` does not mean the same thing everywhere

| Endpoint | Actual effect |
|---|---|
| `DELETE /api/admin/contacts/:id` | **Hard delete** — `DELETE FROM contacts` |
| `DELETE /api/admin/projects/:id` | Soft — `UPDATE projects SET published = false` |
| `DELETE /api/admin/services/:id` | Soft — `UPDATE services SET published = false` |
| `DELETE /api/admin/testimonials/:id` | Soft — `UPDATE testimonials SET published = false` |

Three of the four unpublish; the contact one is irreversible. A UI offering a
single "Delete" affordance across these resources is promising the user
something different in each case. Recorded rather than changed — altering
either behaviour is a product decision, not a contract fix.

> `GET /api/admin/dashboard/stats` exists and returns `DashboardStats`, but the
> admin dashboard **does not call it** — it computes the same four figures in
> the browser from lists it has already fetched. The API reports
> `conversionRate` to one decimal place; the dashboard rounds to a whole
> percent. `apps/admin/src/types.ts` pins its local `DashboardStats` to the
> API's via `Pick<>` so the names cannot drift. Noted rather than changed:
> making the admin call it is a behaviour change.

---

## 5. Naming

The API speaks **camelCase**. PostgreSQL columns are snake_case. The serializers
are the only place the two meet, and every read handler passes through them.

`short_description` → `shortDescription`, `order_index` → `orderIndex`,
`created_at` → `createdAt`. A snake_case key in a response is a bug in a
serializer, not a contract variant to accommodate on the client.

The timestamp for "last changed" is **not named consistently**: `Contact` and
`Project` call it `lastUpdated`, `Service` calls it `updatedAt`, and
`Testimonial` and the `*Summary` shapes carry only `createdAt`. Check the type
rather than assuming.

Never exposed: password hashes, JWT internals, database-only columns, email
provider internals, internal error detail.

---

## 6. `id` is not one type

| Resource | `id` |
|---|---|
| `Contact` | `string` |
| `Project` / `ProjectSummary` | `string` |
| `AdminUser` | `string` |
| `Testimonial` | `string` |
| `Service` / `ServiceSummary` | **`number`** |
| `TestimonialProject` | **`number`** |

This mirrors the database, where these resources do not share a key type. The
consequence for clients: `===` against a literal, `sort`, and any arithmetic
behave differently per resource, and a `Record<string, T>` keyed by id coerces
the numeric ones. Both are modelled honestly rather than widened to
`string | number`, which would push the problem into every consumer.

---

## 7. The contract and the email provider

`packages/types` contains **no email provider types**. The provider is an
implementation detail of `apps/api` and is invisible across the HTTP boundary:
the contact endpoint's contract (`ContactSubmission` → `ContactSubmissionResult`)
is identical before and after the SendGrid → Resend migration. That is the test
of whether the seam is in the right place, and it passed.

Provider errors do not reach clients. They are translated at the transport
boundary (`apps/api/src/services/emailProvider.ts`) into a generic message and
passed through `redactProviderMessage`, which strips key-shaped and
address-shaped substrings before anything is logged or written to
`email_logs.error_message`.

`RESEND_API_KEY` belongs to `apps/api` alone. It is read only inside the
transport, at send time, and must never be added to `apps/web` or `apps/admin`
in any form.

---

## 8. Changing the contract

1. Change `packages/types` first.
2. Rebuild it: the API and admin consume the built output.
3. Fix the compile errors. That is the point — the admin re-exports the
   contract from `apps/admin/src/types.ts`, so a contract change breaks its
   build rather than silently yielding `undefined` at runtime.
4. Update this document.

**Do not add a value import of `@accian/types` to `apps/api`.** Every import
there is type-only and is erased at compile time, which is what allows the
package to be a `devDependency` and the API to build on a host that installs
inside `apps/api` alone. See `docs/deployment.md` §7.
