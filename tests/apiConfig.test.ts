/**
 * Tests for the admin app's API location and failure-classification rules.
 *
 * `apiConfig.ts` deliberately takes the environment as a parameter instead of
 * reading `import.meta.env` itself, so these rules are testable under plain
 * `node --test` with no bundler and no new dependencies.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  ADMIN_API_PATH,
  DEFAULT_DEV_ORIGIN,
  classifyApiFailure,
  describeApiFailure,
  resolveAdminApiBase,
  shouldForceLogout,
} from "../src/services/apiConfig.ts";

const PROD_ORIGIN = "https://api.example.test";

// ── The base URL is environment-driven ────────────────────────

test("VITE_API_URL determines the API target", () => {
  const base = resolveAdminApiBase({ VITE_API_URL: PROD_ORIGIN, DEV: false });
  assert.equal(base, `${PROD_ORIGIN}${ADMIN_API_PATH}`);
});

test("VITE_API_URL wins over the dev default even in dev mode", () => {
  // The defect: a local dev session silently operated on production data
  // because the host was compiled into the source. Setting the variable must
  // actually redirect the app.
  const base = resolveAdminApiBase({
    VITE_API_URL: "http://localhost:9999",
    DEV: true,
  });
  assert.equal(base, `http://localhost:9999${ADMIN_API_PATH}`);
  assert.ok(!base.includes("example.test"));
});

test("dev with no configuration targets localhost, never production", () => {
  const base = resolveAdminApiBase({ DEV: true });
  assert.equal(base, `${DEFAULT_DEV_ORIGIN}${ADMIN_API_PATH}`);
  assert.ok(base.startsWith("http://localhost"));
});

test("a production build with no configuration fails loudly", () => {
  // Previously an unset variable fell back to a hardcoded production host.
  // Failing the build is the safe outcome: it cannot silently mis-target.
  assert.throws(
    () => resolveAdminApiBase({ DEV: false }),
    /VITE_API_URL is not set/
  );
});

test("an empty or whitespace-only variable is treated as unset", () => {
  assert.throws(() => resolveAdminApiBase({ VITE_API_URL: "   ", DEV: false }));
  assert.equal(
    resolveAdminApiBase({ VITE_API_URL: "", DEV: true }),
    `${DEFAULT_DEV_ORIGIN}${ADMIN_API_PATH}`
  );
});

// ── Both URL conventions found in the repo are accepted ───────

test("a bare origin and an origin already ending in /api/admin agree", () => {
  // The tracked .env holds a bare origin; the previous service default
  // appended /api/admin itself. Both spellings must resolve identically so no
  // existing deployment breaks on whichever way its variable is written.
  const bare = resolveAdminApiBase({ VITE_API_URL: PROD_ORIGIN, DEV: false });
  const withPath = resolveAdminApiBase({
    VITE_API_URL: `${PROD_ORIGIN}${ADMIN_API_PATH}`,
    DEV: false,
  });

  assert.equal(bare, withPath);
  assert.equal(bare, `${PROD_ORIGIN}${ADMIN_API_PATH}`);
});

test("trailing slashes never produce a doubled path segment", () => {
  for (const raw of [
    `${PROD_ORIGIN}/`,
    `${PROD_ORIGIN}///`,
    `${PROD_ORIGIN}${ADMIN_API_PATH}/`,
  ]) {
    const base = resolveAdminApiBase({ VITE_API_URL: raw, DEV: false });
    assert.equal(base, `${PROD_ORIGIN}${ADMIN_API_PATH}`);

    // Checked after the scheme, since "https://" legitimately contains "//".
    const afterScheme = base.replace(/^https?:\/\//, "");
    assert.ok(!afterScheme.includes("//"), `doubled slash in ${base}`);
    assert.ok(!base.includes(`${ADMIN_API_PATH}${ADMIN_API_PATH}`));
  }
});

// ── Failure classification ────────────────────────────────────

test("HTTP statuses map to distinct failure kinds", () => {
  assert.equal(classifyApiFailure(401), "auth");
  assert.equal(classifyApiFailure(403), "forbidden");
  assert.equal(classifyApiFailure(400), "client");
  assert.equal(classifyApiFailure(404), "client");
  assert.equal(classifyApiFailure(500), "server");
  assert.equal(classifyApiFailure(503), "server");
  assert.equal(classifyApiFailure(undefined), "network");
});

test("401 and 403 are not conflated", () => {
  // The dashboard must be able to tell "your session ended" from
  // "you are signed in but not allowed to do this".
  assert.notEqual(classifyApiFailure(401), classifyApiFailure(403));
});

test("only an authentication failure ends the session", () => {
  // The defect: one shared catch block logged the admin out on ANY error, so
  // a transient 500 or a dropped connection looked like a forced logout.
  assert.equal(shouldForceLogout("auth"), true);

  for (const kind of ["forbidden", "client", "server", "network"] as const) {
    assert.equal(
      shouldForceLogout(kind),
      false,
      `a "${kind}" failure must not log the user out`
    );
  }
});

test("every failure kind produces a distinct, non-empty message", () => {
  const kinds = ["auth", "forbidden", "client", "server", "network"] as const;
  const messages = kinds.map((kind) => describeApiFailure(kind, "projects"));

  for (const message of messages) {
    assert.ok(message.length > 0);
  }
  assert.equal(new Set(messages).size, kinds.length);
});

test("the failure message names the resource that failed", () => {
  // So a partially-loaded dashboard says which panel is broken.
  assert.match(describeApiFailure("server", "testimonials"), /testimonials/);
});
