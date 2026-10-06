/**
 * The server-side gate on `/internal/*` (`apps/web/proxy.ts`).
 *
 * Added during Phase 4. The gate had no test at all, and production cannot
 * supply one: `INTERNAL_AREA_USER` / `INTERNAL_AREA_PASSWORD` are not set on
 * the Netlify site, so every production request is answered by the
 * "not configured" branch (503) and the credential comparison never runs.
 * Production verification requires configuring and rotating the credentials
 * on Netlify, as Phase 4 requires. These tests cover the gate independently
 * while authenticated access to that environment is unavailable.
 *
 * So the four outcomes the phase asks about — unauthenticated, wrong,
 * malformed, valid — are pinned here instead, against the real function with
 * the environment supplied locally. Throwaway values; nothing here is or
 * resembles a real credential.
 *
 * `proxy` reads only `request.headers.get("authorization")`, so a bare object
 * with a `Headers` is a faithful stand-in for `NextRequest`.
 */

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { proxy } from "../proxy";

import type { NextRequest } from "next/server";

const USER = "test-user";
const PASSWORD = "test-password-not-a-real-one";

/** Minimal `NextRequest`: the gate reads one header and nothing else. */
const requestWith = (authorization?: string): NextRequest =>
  ({
    headers: new Headers(authorization ? { authorization } : {}),
  }) as NextRequest;

const basic = (user: string, password: string): string =>
  `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;

let saved: { user?: string; password?: string };

beforeEach(() => {
  saved = {
    user: process.env.INTERNAL_AREA_USER,
    password: process.env.INTERNAL_AREA_PASSWORD,
  };
  process.env.INTERNAL_AREA_USER = USER;
  process.env.INTERNAL_AREA_PASSWORD = PASSWORD;
});

afterEach(() => {
  if (saved.user === undefined) delete process.env.INTERNAL_AREA_USER;
  else process.env.INTERNAL_AREA_USER = saved.user;

  if (saved.password === undefined) delete process.env.INTERNAL_AREA_PASSWORD;
  else process.env.INTERNAL_AREA_PASSWORD = saved.password;
});

describe("the four outcomes Phase 4 asks about", () => {
  test("no credentials at all → 401", () => {
    const response = proxy(requestWith());

    assert.ok(response, "the request was allowed through unauthenticated");
    assert.equal(response.status, 401);
  });

  test("wrong credentials → 401", () => {
    const response = proxy(requestWith(basic("wrong-user", "wrong-password")));

    assert.ok(response, "wrong credentials were allowed through");
    assert.equal(response.status, 401);
  });

  test("malformed credentials → 401", () => {
    // Each of these is a distinct way to be malformed, and none of them may
    // become a 500: a crash in the gate is a crash on a public URL.
    const malformed = [
      "Basic !!!not-base64!!!",
      "Basic ", // scheme, no payload
      `Basic ${Buffer.from("no-colon-in-here").toString("base64")}`,
      basic(USER, PASSWORD).replace("Basic", "Bearer"), // wrong scheme
      "basic dGVzdDp0ZXN0", // lowercase scheme: not what RFC 7617 sends
      Buffer.from(`${USER}:${PASSWORD}`).toString("base64"), // no scheme
    ];

    for (const header of malformed) {
      const response = proxy(requestWith(header));

      assert.ok(response, `allowed through: ${header}`);
      assert.equal(response.status, 401, `wrong status for: ${header}`);
    }
  });

  test("valid credentials → allowed through to the route", () => {
    const response = proxy(requestWith(basic(USER, PASSWORD)));

    // `undefined` is how Next middleware says "continue"; the route then
    // answers, which is the 200 the phase asks for.
    assert.equal(response, undefined);
  });
});

describe("what the 401 says", () => {
  test("it asks for Basic credentials, so a browser prompts", () => {
    const response = proxy(requestWith())!;

    assert.match(
      response.headers.get("www-authenticate") ?? "",
      /^Basic realm=/
    );
  });

  test("it is not cacheable, so no CDN can serve it as the page", () => {
    const response = proxy(requestWith())!;

    assert.equal(response.headers.get("cache-control"), "no-store");
  });

  test("it is not indexable", () => {
    const response = proxy(requestWith())!;

    assert.match(response.headers.get("x-robots-tag") ?? "", /noindex/);
  });

  test("neither the expected user nor the expected password is echoed", async () => {
    const response = proxy(requestWith(basic(USER, "guess")))!;
    const body = await response.text();
    const headers = [...response.headers.entries()].flat().join(" ");

    for (const secret of [USER, PASSWORD]) {
      assert.ok(!body.includes(secret), "a credential reached the body");
      assert.ok(!headers.includes(secret), "a credential reached a header");
    }
  });

  test("a wrong user and a wrong password are indistinguishable", async () => {
    const wrongUser = proxy(requestWith(basic("someone-else", PASSWORD)))!;
    const wrongPassword = proxy(requestWith(basic(USER, "not-the-password")))!;

    // Telling the two apart would confirm a valid username, which is half the
    // credential. Both comparisons run regardless, so the responses match.
    assert.equal(wrongUser.status, wrongPassword.status);
    assert.equal(await wrongUser.text(), await wrongPassword.text());
  });
});

describe("near-misses are still misses", () => {
  test("a correct prefix does not pass", () => {
    const response = proxy(
      requestWith(basic(USER, PASSWORD.slice(0, PASSWORD.length - 1)))
    );

    assert.ok(response, "a truncated password was accepted");
    assert.equal(response.status, 401);
  });

  test("a correct password with trailing padding does not pass", () => {
    const response = proxy(requestWith(basic(USER, `${PASSWORD} `)));

    assert.ok(response, "a padded password was accepted");
    assert.equal(response.status, 401);
  });

  test("the comparison is case-sensitive", () => {
    const response = proxy(requestWith(basic(USER, PASSWORD.toUpperCase())));

    assert.ok(response, "case was ignored");
    assert.equal(response.status, 401);
  });

  test("a password containing a colon survives the split", () => {
    // The header is `user:password`; splitting on the last colon instead of
    // the first would corrupt any password containing one.
    process.env.INTERNAL_AREA_PASSWORD = "has:a:colon";

    const response = proxy(requestWith(basic(USER, "has:a:colon")));

    assert.equal(response, undefined, "a colon in the password broke the gate");
  });
});

describe("an unconfigured environment fails closed", () => {
  // This is what production answers today, and it is the safe direction: an
  // unset variable must not publish the page.
  test("no user configured → 503, not a pass-through", () => {
    delete process.env.INTERNAL_AREA_USER;

    const response = proxy(requestWith(basic(USER, PASSWORD)));

    assert.ok(response, "an unconfigured gate let the request through");
    assert.equal(response.status, 503);
  });

  test("no password configured → 503, not a pass-through", () => {
    delete process.env.INTERNAL_AREA_PASSWORD;

    const response = proxy(requestWith(basic(USER, PASSWORD)));

    assert.ok(response, "an unconfigured gate let the request through");
    assert.equal(response.status, 503);
  });

  test("an empty string is treated as unset, not as a valid password", () => {
    // `""` is falsy, so it must reach the 503 branch. Were it treated as
    // configured, `timingSafeEqual("", "")` would match and anyone sending
    // `user:` would be in.
    process.env.INTERNAL_AREA_PASSWORD = "";

    const response = proxy(requestWith(basic(USER, "")));

    assert.ok(response, "an empty password authenticated");
    assert.equal(response.status, 503);
  });

  test("the 503 is not cacheable either", () => {
    delete process.env.INTERNAL_AREA_USER;

    const response = proxy(requestWith())!;

    assert.equal(response.headers.get("cache-control"), "no-store");
  });
});

describe("the matcher covers the whole internal area", () => {
  test("it matches /internal and everything under it", async () => {
    const { config } = await import("../proxy");

    assert.equal(config.matcher, "/internal/:path*");
  });
});
