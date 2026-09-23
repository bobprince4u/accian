# ACCIAN — Known Issues

Problems that are known, deliberately **not** fixed, and safe to leave. Each entry
records what is wrong, why it was left alone, and what fixing it would involve.

Almost everything here **predates Phase 2**. Phase 2 consolidated three
repositories into one; it did not set out to change how the applications behave,
so pre-existing bugs were documented rather than quietly fixed. Where an issue
*was* introduced or changed by the consolidation, it says so.

Nothing in this list blocks a build. All three applications build and lint clean
from this repository, and all test suites pass.

---

## 1. `apps/api` has no working `dev` script

**Severity: low — affects developers, not production.**

```
"dev": "nodemon --watch 'src/**/*.ts' --exec 'ts-node' server.ts"
```

It targets `server.ts` at the package root. That file does not exist; the real
entry point is `src/server.ts`. The script has therefore never worked, and this
is why the root `package.json` provides `dev:web` and `dev:admin` but no
`dev:api` — §7 of the Phase 2 brief forbids documenting commands that do not
work.

**Workaround.** Build and run:

```bash
npm run build:api
npm start --workspace accian-backend
```

Note that `npm start` also runs migrations — see [§4](#4-the-api-runs-migrations-on-every-start).

**Fix.** Change `server.ts` to `src/server.ts`. It is a one-word edit, left out
of Phase 2 only because it changes a script rather than a path, and no
verification of it was possible beyond "nodemon starts".

---

## 2. `apps/api/dist/` is committed — 39 tracked build artifacts

**Severity: medium — this may be what actually runs in production.**

The compiled output is tracked in git. Normally that is just noise, but here it
carries real risk in both directions:

- If the host runs a build step, the committed `dist/` is dead weight that will
  drift out of sync with `src/` and mislead anyone reading the repository.
- **If the host does *not* run a build step, the committed `dist/` is the
  application.** Deleting it would break production.

Which of those is true cannot be determined from this repository, because the
API has no deployment configuration in version control at all — see
[`deployment.md` §5](./deployment.md#5-the-api-deployment-is-not-reproducible-from-source).

**Left in place deliberately.** Removing 39 tracked files whose role is unknown
is not a cleanup, it is an untested production change.

**Fix.** Answer `deployment.md` §5 first. Once the host is known to run
`npm run build`, add `apps/api/dist/` to `.gitignore` and `git rm -r --cached`
it — and deploy immediately afterwards, while the previous release is still
rollback-able.

---

## 3. `migrate:down` only reverts one specific migration

**Severity: low — it does what it says, just less than the name suggests.**

```
"migrate:down": "ts-node -e \"require('./src/migrations/001_add_security_fields').down()...\""
```

The module referenced does exist (`src/migrations/001_add_security_fields.ts`),
so the script runs. But the name reads like a general "roll back the last
migration" command, and it is not — it is hardcoded to migration 001. Running it
expecting a general rollback would revert the wrong thing.

The four `.sql` migrations have no `down` path at all. The migrator is
forward-only.

**Fix.** Out of scope for Phase 2 by rule — §12 forbids schema and migration
changes. Renaming it to `migrate:down:001` would at least stop it being
misleading, and costs nothing.

---

## 4. The API runs migrations on every start

**Severity: medium — a deploy is also a migration.**

```
"start": "node dist/migrations/cli.js && node dist/server.js"
```

Convenient, and it guarantees the schema matches the code. It also means
**every restart applies any pending migration**, including an autoscaling event
or a crash-loop restart. There is no separate, deliberate migration step.

This is behaviour, not a bug, and changing it is a deployment-process decision
rather than a code one. Recorded so nobody is surprised.

---

## 5. `apps/admin` sends no security headers

**Severity: medium for a site behind a login.**

The admin SPA sets no `Content-Security-Policy`, `Strict-Transport-Security`,
`X-Frame-Options` or `X-Content-Type-Options`. The public site got a
consolidated CSP in Phase 1; the admin did not, because it was a separate
repository at the time.

`apps/admin/netlify.toml` was created during Phase 2 for the build settings the
relocation required. It deliberately **does not** add headers: that would change
how the deployed product behaves, is not needed to make the monorepo work, and
could not be verified without a production deploy. A CSP that is wrong is worse
than none — it breaks the app for real users after the deploy, not during it.

**Fix.** Add a `[[headers]]` block to `apps/admin/netlify.toml`, then verify
against a Netlify **deploy preview** before promoting:

```bash
curl -sI https://<deploy-preview>.netlify.app | grep -i content-security-policy
```

Start report-only (`Content-Security-Policy-Report-Only`) and watch for
violations before enforcing.

---

## 6. `apps/admin/.env` is tracked in git

**Severity: none as it stands — but it is a trap.**

Tracking a `.env` file is normally a mistake. This one holds exactly one
variable, `VITE_API_URL`, and `VITE_`-prefixed values are **compiled into the
JavaScript bundle** — so its value is public by construction and readable by
anyone who loads the site. No credential is in it, and it is how the admin has
been getting its production API URL. Removing it would change the build.

The root `.gitignore` ignores `.env*` and carries a comment recording this file
as a deliberate, documented exception. Note that **gitignore never untracks an
already-tracked file**, so the file continues to be tracked either way.

**The trap:** the next person to add a variable to this file may add a real
secret, which would then be committed *and* shipped in the bundle. Any secret the
admin needs must live in the Netlify dashboard, not here.

---

## 7. Cosmetic leftovers from project scaffolding

**Severity: cosmetic.** Grouped because they share one cause: template output
that was never replaced.

| Where | What |
|---|---|
| `apps/admin/index.html` | `<title>admin</title>` and the default `vite.svg` favicon |
| `apps/admin/README.md` | still the stock "React + TypeScript + Vite" template text |
| `apps/api/READ.md` | 0 bytes, and misspelled — presumably meant to be `README.md` |
| `apps/admin/tsconfig.tsbuildinfo` | a tracked build cache; ignored going forward, but already tracked |

None affects behaviour. All are quick wins for whoever next touches these apps.

---

## 8. Platform-specific binaries in the lockfile

**Severity: low — a developer-experience wrinkle.**

Several dependencies ship a prebuilt binary per OS/architecture as optional
dependencies (Next's SWC compiler, Tailwind's oxide engine, Vite's rollup,
lightningcss). npm records only the ones matching the machine that generated the
lockfile, unless the install was a clean one.

The committed lockfile was generated by a **clean** install on Linux x64 and does
contain all 8 `@next/swc-*` platform entries (88 platform-specific entries
overall), which is what a Netlify Linux build and a macOS or Windows developer
both need.

**Why it matters.** An *incremental* `npm install` on a single platform prunes
the other platforms' entries. When the SWC entries went missing, Next.js tried to
self-patch the lockfile and failed inside a workspace, emitting
`npm error code ENOWORKSPACES` and `Failed to get registry from "pnpm"` on every
build. Builds still succeeded, but noisily and more slowly.

**Guidance.** If those errors appear, or `git diff` shows platform entries
disappearing from `package-lock.json`, restore them with a clean install:

```bash
rm -rf node_modules package-lock.json && npm install
```

`npm install --package-lock-only --include=optional` does **not** fix this — it
removes the entries entirely. Do not use it here.

---

## 9. ~~`packages/types` is an empty scaffold~~ — resolved

**Severity: none — kept for the reasoning, which still applies.**

**No longer true.** `packages/types` now holds the shared contract
(`api`, `auth`, `contact`, `dashboard`, `project`, `service`, `testimonial`,
`preConsultation`) and all three applications consume it. The entry is kept
because the reason it was *once* empty explains how the contract was
eventually filled in, and the same constraint still governs changes to it.

It was empty because populating it meant **choosing** a definition wherever the
three applications disagreed, and every such choice changes product behaviour.
The disagreements are documented in
[`accian-integration-audit.md`](./accian-integration-audit.md) §19–20:

- `Service` had three different definitions, none matching the backend's schema
- `Project` had diverged severely between admin and API
- `DashboardStats` — three of its four fields differed from what the API returns
- contact `status` had two divergent value maps

Phase 2's brief said explicitly not to turn consolidation into the
shared-contract phase, so the package stayed scaffolding until Phase 3 did that
work deliberately, with its own tests. `preConsultation.ts` was added later
still, for the PhD pre-consultation form; it had no legacy definitions to
reconcile, being new on both sides.

One constraint from that work is load-bearing and easy to break: **`apps/api`
may only `import type` from this package** — see
[`deployment.md`](./deployment.md) §7 — so it keeps a runtime copy of the
pre-consultation constants in `src/utils/preConsultationContract.ts`, guarded
by a drift test.

---

## 10. Both Netlify sites need dashboard changes before they will build

**Severity: high, but expected and unavoidable.**

Each app used to be the root of its own repository. They are now in `apps/`, and
a Netlify site cannot discover that on its own. **Until the dashboard settings in
[`deployment.md` §2](./deployment.md#2-required-dashboard-changes) are updated,
both sites will fail to build.**

This is inherent to consolidation, not a defect in it. The required values are
recorded in `deployment.md` and repeated in comments at the top of each
`netlify.toml`.

Related: the **package directory** setting can only be set in the Netlify UI —
there is no `netlify.toml` key for it — so that one piece of each site's
configuration cannot be reproduced from source.

---

## 11. A root-directory build triggers both Netlify sites

**Severity: low — wasted build minutes.**

Both sites build with their base directory at the repository root (required, so
npm workspaces finds the single root lockfile). A consequence is that **any**
commit triggers a rebuild of both sites, even one touching only the other app.

**Fix.** Add an [ignore command](https://docs.netlify.com/build/configure-builds/ignore-builds/)
to each site, for example `git diff --quiet HEAD^ HEAD -- apps/web`. Not
configured during Phase 2 because it changes deploy behaviour and should be
validated against a real deploy first.

---

## 12. Path-filtered git log does not show pre-move history for `apps/api` and `apps/admin`

**Severity: low — the history is present, just not path-reachable.**

All 157 commits from the three original repositories are in this repository, and
all three pre-consolidation HEADs (`e40c0fc`, `be5e464`, `a877ba2`) are ancestors
of the current HEAD. Nothing was squashed or discarded.

But the API and admin were imported with `git subtree add`, and their historical
commits record paths as they were *then* (`src/server.ts`, not
`apps/api/src/server.ts`). So a path-filtered query shows only the merge:

```bash
git log --oneline -- apps/api      # shows the subtree merge only
git log --oneline --follow apps/api/src/server.ts   # this does find the history
```

`apps/web` is unaffected — it was moved with `git mv` in this repository, and git
recorded 47 renames at 100% similarity, so its 80-commit history follows the
files normally.

**Why not fixed.** The only way to rewrite those historical paths is to rewrite
history, which Phase 2's rules forbid — and which would be a bad trade regardless:
it would change every commit hash in all three lineages, breaking the rollback
refs above. `--follow` works today; that is sufficient.

---

## 13. ~~One API email test asserts a link the template does not contain~~ — resolved

**Severity: none — kept because the admin panel still has no per-contact route,
which is the fact the test now pins.**

For a while `npm run test:api` reported **179 of 180 passing**. The failure was
`tests/email.test.ts` → `sendAdminNotification` → *"the admin panel link
resolves to a real contact id"*:

```
The input did not match the regular expression /\/contacts\/42/
```

It was briefly recorded here as an open product decision — deep-link the
template, or rewrite the assertion. **That was a misreading: the decision had
already been made.** `git log` on the template shows commit `762930c0`
(16 September 2026, *"fix: update admin contact email link"*) replacing the deep
link deliberately:

```diff
-        <a href="https://admin.accian.co.uk/contacts/{{id}}" class="button"
+       <a href="https://admin.accian.co.uk/AdminDashboard" class="button"
```

And it was right to. `apps/admin/src/App.tsx` declares exactly two routes, `/`
and `/AdminDashboard`; there is no `/contacts/:id`. Contacts are reached through
`ContactsView` and `ContactModal` *inside* the dashboard and have no URL of
their own, so the old deep link 404'd in every notification the API ever sent.
The template was the thing being fixed; the test was simply not updated
alongside it.

**Resolved** by rewriting the assertion to pin the deliberate behaviour rather
than the abandoned intent. It now checks that the button points at
`/AdminDashboard`, that `/contacts/` has *not* come back, and that the
reference number is present — which is how a recipient finds one submission
once the dashboard opens, absent a per-contact URL.

The same commit left a comment in `contactControllers.ts` saying the `id` it
passes is what stops the button rendering a literal `{{id}}`. The template no
longer contains `{{id}}`, so that was no longer true either; the comment now
says why the key is kept (substitution is template-driven, so an unused key is
inert) rather than claiming a job it no longer does.

**If a deep link is wanted back**, the order is: add a `/contacts/:id` route to
the admin SPA, then change the template, then this test. Doing it in the other
order ships a broken button.

