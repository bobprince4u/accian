/**
 * Item 7 — admin auth / token lifetime.
 * Item 14 — refreshToken and logout are reachable and behave correctly.
 * Item 10 — no PII in logs on the auth path.
 *
 * Exercises the real jsonwebtoken signing/verification against the real
 * handlers, with only the database stubbed.
 */

import { test, describe, afterEach, before } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { stubQuery, createResponse, captureConsole } from "./helpers";

const ACCESS_SECRET = "test-access-secret";
const REFRESH_SECRET = "test-refresh-secret";

// Both modules under test read these lazily, inside the functions, so setting
// them here — after the hoisted imports have run — is still in time.
process.env.JWT_ACCESS_SECRET = ACCESS_SECRET;
process.env.JWT_REFRESH_SECRET = REFRESH_SECRET;

import { login, refreshToken, logout } from "../src/controllers/adminController";
import { authenticateToken, requireAdmin } from "../src/middleware/auth";
import { generateAccessToken, generateRefreshToken } from "../src/utils/token";

const noopNext = (() => undefined) as any;

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "correct-horse-battery";

let passwordHash = "";

before(async () => {
  passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 4);
});

const adminRow = () => ({
  id: 1,
  email: ADMIN_EMAIL,
  full_name: "Admin Person",
  role: "admin",
  password_hash: passwordHash,
  active: true,
});

let active: { restore: () => void } | null = null;

afterEach(() => {
  active?.restore();
  active = null;
});

/** Runs the middleware and reports which branch it took. */
const runAuth = (token: string | undefined) => {
  const res = createResponse();
  let passed = false;
  const req: any = {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  };
  authenticateToken(req, res as any, (() => {
    passed = true;
  }) as any);
  return { res, passed, req };
};

describe("login", () => {
  test("returns an access token and a refresh token", async () => {
    const stub = stubQuery((text) => {
      if (text.includes("SELECT * FROM admin_users")) {
        return { rows: [adminRow()], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    active = stub;

    const res = createResponse();
    await login(
      { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 200, JSON.stringify(res.body));
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.accessToken, "no access token issued");
    assert.ok(res.body.data.refreshToken, "no refresh token issued");
    assert.equal(res.body.data.user.email, ADMIN_EMAIL);
    // The hash must never reach the client.
    assert.ok(!JSON.stringify(res.body).includes(passwordHash));
  });

  test("persists the refresh token so it can be validated later", async () => {
    const stub = stubQuery((text) =>
      text.includes("SELECT * FROM admin_users")
        ? { rows: [adminRow()], rowCount: 1 }
        : { rows: [], rowCount: 0 }
    );
    active = stub;

    const res = createResponse();
    await login(
      { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } } as any,
      res as any,
      noopNext
    );

    const insert = stub.calls.find((c) =>
      c.text.includes("INSERT INTO refresh_tokens")
    );
    assert.ok(insert, "refresh token was not stored");
    assert.ok(insert.params.includes(res.body.data.refreshToken));
  });

  test("the issued access token authenticates a request", async () => {
    active = stubQuery((text) =>
      text.includes("SELECT * FROM admin_users")
        ? { rows: [adminRow()], rowCount: 1 }
        : { rows: [], rowCount: 0 }
    );

    const res = createResponse();
    await login(
      { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } } as any,
      res as any,
      noopNext
    );

    const outcome = runAuth(res.body.data.accessToken);
    assert.ok(outcome.passed, JSON.stringify(outcome.res.body));
    assert.equal(outcome.req.user.email, ADMIN_EMAIL);
  });

  test("the access token is short-lived (15 minutes)", () => {
    const token = generateAccessToken({
      id: "1",
      email: ADMIN_EMAIL,
      role: "admin",
    });
    const decoded = jwt.verify(token, ACCESS_SECRET) as jwt.JwtPayload;
    const lifetime = (decoded.exp as number) - (decoded.iat as number);
    assert.equal(lifetime, 15 * 60);
  });

  test("the refresh token is long-lived (7 days)", () => {
    const token = generateRefreshToken({ id: "1" });
    const decoded = jwt.verify(token, REFRESH_SECRET) as jwt.JwtPayload;
    const lifetime = (decoded.exp as number) - (decoded.iat as number);
    assert.equal(lifetime, 7 * 24 * 60 * 60);
  });

  test("two refresh tokens for the same user are never identical", () => {
    // Regression: with a `{id}`-only payload and one-second `iat` resolution,
    // tokens minted in the same second were byte-identical. Rotation revokes
    // by token string, so an identical replacement meant the revocation
    // applied to the string being handed back.
    const tokens = new Set(
      Array.from({ length: 50 }, () => generateRefreshToken({ id: "1" }))
    );
    assert.equal(tokens.size, 50);
  });

  test("a wrong password is rejected with 401", async () => {
    active = stubQuery((text) =>
      text.includes("SELECT * FROM admin_users")
        ? { rows: [adminRow()], rowCount: 1 }
        : { rows: [], rowCount: 0 }
    );

    const res = createResponse();
    await login(
      { body: { email: ADMIN_EMAIL, password: "wrong" } } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 401);
    assert.ok(!res.body.data);
  });

  test("an unknown email is rejected with 401 and the same message", async () => {
    active = stubQuery(() => ({ rows: [], rowCount: 0 }));

    const res = createResponse();
    await login(
      { body: { email: "nobody@example.com", password: "x" } } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 401);
    // Identical to the wrong-password message: no account enumeration.
    assert.match(res.body.message, /Invalid credentials/);
  });

  test("does not log the email address (item 10)", async () => {
    active = stubQuery((text) =>
      text.includes("SELECT * FROM admin_users")
        ? { rows: [adminRow()], rowCount: 1 }
        : { rows: [], rowCount: 0 }
    );
    const logs = captureConsole();

    try {
      await login(
        { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } } as any,
        createResponse() as any,
        noopNext
      );
    } finally {
      logs.restore();
    }

    const combined = logs.lines.join("\n");
    assert.ok(!combined.includes(ADMIN_EMAIL), combined);
    assert.ok(!combined.includes("Admin Person"), combined);
  });
});

describe("authenticateToken", () => {
  test("a valid access token passes", () => {
    const token = generateAccessToken({
      id: "1",
      email: ADMIN_EMAIL,
      role: "admin",
    });
    assert.ok(runAuth(token).passed);
  });

  test("an expired access token is 401 with TOKEN_EXPIRED", () => {
    const expired = jwt.sign(
      { id: "1", email: ADMIN_EMAIL, role: "admin" },
      ACCESS_SECRET,
      { expiresIn: "-1s" }
    );

    const { res, passed } = runAuth(expired);
    assert.equal(passed, false);
    assert.equal(res.statusCode, 401);
    // The distinct code is what lets the client refresh instead of logging out.
    assert.equal(res.body.code, "TOKEN_EXPIRED");
  });

  test("a token signed with the wrong secret is 401", () => {
    const forged = jwt.sign(
      { id: "1", email: ADMIN_EMAIL, role: "admin" },
      "not-the-secret",
      { expiresIn: "15m" }
    );

    const { res, passed } = runAuth(forged);
    assert.equal(passed, false);
    assert.equal(res.statusCode, 401);
  });

  test("a refresh token cannot be used as an access token", () => {
    const { res, passed } = runAuth(generateRefreshToken({ id: "1" }));
    assert.equal(passed, false);
    assert.equal(res.statusCode, 401);
  });

  test("a missing Authorization header is 401", () => {
    const { res, passed } = runAuth(undefined);
    assert.equal(passed, false);
    assert.equal(res.statusCode, 401);
  });

  test("garbage in the header is 401, not a crash", () => {
    const { res, passed } = runAuth("not-a-jwt");
    assert.equal(passed, false);
    assert.equal(res.statusCode, 401);
  });

  test("nothing from the token is logged (item 10)", () => {
    const logs = captureConsole();
    try {
      runAuth(
        generateAccessToken({ id: "1", email: ADMIN_EMAIL, role: "admin" })
      );
    } finally {
      logs.restore();
    }
    assert.ok(!logs.lines.join("\n").includes(ADMIN_EMAIL));
  });
});

describe("requireAdmin", () => {
  test("a valid non-admin token is 403, not 401", () => {
    const res = createResponse();
    let passed = false;
    requireAdmin({ user: { role: "editor" } } as any, res as any, (() => {
      passed = true;
    }) as any);

    assert.equal(passed, false);
    assert.equal(res.statusCode, 403);
  });

  test("an admin passes", () => {
    let passed = false;
    requireAdmin({ user: { role: "admin" } } as any, createResponse() as any, (() => {
      passed = true;
    }) as any);
    assert.ok(passed);
  });
});

describe("refreshToken", () => {
  const validRefresh = () => generateRefreshToken({ id: "1" });

  test("a valid refresh token yields a new access token", async () => {
    const token = validRefresh();
    const stub = stubQuery((text) => {
      if (text.includes("SELECT * FROM refresh_tokens")) {
        return { rows: [{ id: 9, token, revoked: false }], rowCount: 1 };
      }
      if (text.includes("FROM admin_users")) {
        return { rows: [adminRow()], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    active = stub;

    const res = createResponse();
    await refreshToken({ body: { refreshToken: token } } as any, res as any, noopNext);

    assert.equal(res.statusCode, 200, JSON.stringify(res.body));
    assert.ok(res.body.data.accessToken);
    // The new access token must actually work.
    assert.ok(runAuth(res.body.data.accessToken).passed);
  });

  test("the presented token is rotated: old revoked, new stored", async () => {
    const token = validRefresh();
    const stub = stubQuery((text) => {
      if (text.includes("SELECT * FROM refresh_tokens")) {
        return { rows: [{ id: 9, token, revoked: false }], rowCount: 1 };
      }
      if (text.includes("FROM admin_users")) {
        return { rows: [adminRow()], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });
    active = stub;

    const res = createResponse();
    await refreshToken({ body: { refreshToken: token } } as any, res as any, noopNext);

    const revoke = stub.calls.find(
      (c) => c.text.includes("SET revoked = true") && c.params.includes(token)
    );
    assert.ok(revoke, "the spent refresh token was not revoked");

    const insert = stub.calls.find((c) =>
      c.text.includes("INSERT INTO refresh_tokens")
    );
    assert.ok(insert, "the rotated refresh token was not stored");
    assert.ok(insert.params.includes(res.body.data.refreshToken));
    assert.notEqual(res.body.data.refreshToken, token);
  });

  test("the database lookup excludes revoked and expired rows", async () => {
    const token = validRefresh();
    const stub = stubQuery((text) =>
      text.includes("SELECT * FROM refresh_tokens")
        ? { rows: [{ id: 9, token }], rowCount: 1 }
        : { rows: [adminRow()], rowCount: 1 }
    );
    active = stub;

    await refreshToken(
      { body: { refreshToken: token } } as any,
      createResponse() as any,
      noopNext
    );

    const lookup = stub.calls[0];
    assert.match(lookup.text, /revoked = false/);
    assert.match(lookup.text, /expires_at > NOW\(\)/);
  });

  test("a revoked refresh token fails with 401", async () => {
    // The handler's query filters on `revoked = false`, so a revoked row
    // simply does not come back.
    const stub = stubQuery(() => ({ rows: [], rowCount: 0 }));
    active = stub;

    const res = createResponse();
    await refreshToken(
      { body: { refreshToken: validRefresh() } } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 401);
    assert.ok(!res.body.data);
    // It must not have proceeded to issue anything.
    assert.ok(!stub.calls.some((c) => c.text.includes("INSERT INTO refresh_tokens")));
  });

  test("a token absent from the database fails even if well-signed", async () => {
    active = stubQuery(() => ({ rows: [], rowCount: 0 }));

    const res = createResponse();
    await refreshToken(
      { body: { refreshToken: validRefresh() } } as any,
      res as any,
      noopNext
    );

    assert.equal(res.statusCode, 401);
  });

  test("a forged token present in the database is revoked and rejected", async () => {
    const forged = jwt.sign({ id: "1" }, "wrong-secret", { expiresIn: "7d" });
    const stub = stubQuery((text) =>
      text.includes("SELECT * FROM refresh_tokens")
        ? { rows: [{ id: 9, token: forged }], rowCount: 1 }
        : { rows: [], rowCount: 0 }
    );
    active = stub;

    const res = createResponse();
    await refreshToken({ body: { refreshToken: forged } } as any, res as any, noopNext);

    assert.equal(res.statusCode, 401);
    const revoke = stub.calls.find((c) => c.text.includes("SET revoked = true"));
    assert.ok(revoke, "a token that failed verification should be revoked");
  });

  test("an expired refresh token fails with 401", async () => {
    const expired = jwt.sign({ id: "1" }, REFRESH_SECRET, { expiresIn: "-1s" });
    const stub = stubQuery((text) =>
      text.includes("SELECT * FROM refresh_tokens")
        ? { rows: [{ id: 9, token: expired }], rowCount: 1 }
        : { rows: [], rowCount: 0 }
    );
    active = stub;

    const res = createResponse();
    await refreshToken({ body: { refreshToken: expired } } as any, res as any, noopNext);

    assert.equal(res.statusCode, 401);
  });

  test("a missing refresh token is 401, not a crash", async () => {
    active = stubQuery(() => ({ rows: [], rowCount: 0 }));

    const res = createResponse();
    await refreshToken({ body: {} } as any, res as any, noopNext);
    assert.equal(res.statusCode, 401);
  });

  test("an inactive user cannot refresh", async () => {
    const token = validRefresh();
    active = stubQuery((text) =>
      text.includes("SELECT * FROM refresh_tokens")
        ? { rows: [{ id: 9, token }], rowCount: 1 }
        : { rows: [], rowCount: 0 }
    );

    const res = createResponse();
    await refreshToken({ body: { refreshToken: token } } as any, res as any, noopNext);

    assert.equal(res.statusCode, 403);
  });

  test("does not log the email address (item 10)", async () => {
    const token = validRefresh();
    active = stubQuery((text) =>
      text.includes("SELECT * FROM refresh_tokens")
        ? { rows: [{ id: 9, token }], rowCount: 1 }
        : { rows: [adminRow()], rowCount: 1 }
    );
    const logs = captureConsole();

    try {
      await refreshToken(
        { body: { refreshToken: token } } as any,
        createResponse() as any,
        noopNext
      );
    } finally {
      logs.restore();
    }

    assert.ok(!logs.lines.join("\n").includes(ADMIN_EMAIL));
  });
});

describe("logout", () => {
  test("revokes the presented refresh token", async () => {
    const token = generateRefreshToken({ id: "1" });
    const stub = stubQuery(() => ({ rows: [], rowCount: 1 }));
    active = stub;

    const res = createResponse();
    await logout({ body: { refreshToken: token } } as any, res as any, noopNext);

    assert.equal(res.statusCode, 200, JSON.stringify(res.body));
    const revoke = stub.calls.find((c) => c.text.includes("SET revoked = true"));
    assert.ok(revoke, "logout did not revoke the token");
    assert.ok(revoke.params.includes(token));
  });

  test("a logged-out refresh token can no longer be exchanged", async () => {
    const token = generateRefreshToken({ id: "1" });

    // Model the database: logout sets revoked, and the refresh lookup filters
    // revoked rows out, so the subsequent exchange finds nothing.
    let revoked = false;
    const stub = stubQuery((text, params) => {
      if (text.includes("SET revoked = true") && params.includes(token)) {
        revoked = true;
        return { rows: [], rowCount: 1 };
      }
      if (text.includes("SELECT * FROM refresh_tokens")) {
        return revoked
          ? { rows: [], rowCount: 0 }
          : { rows: [{ id: 9, token }], rowCount: 1 };
      }
      return { rows: [adminRow()], rowCount: 1 };
    });
    active = stub;

    await logout(
      { body: { refreshToken: token } } as any,
      createResponse() as any,
      noopNext
    );

    const res = createResponse();
    await refreshToken({ body: { refreshToken: token } } as any, res as any, noopNext);

    assert.equal(res.statusCode, 401, JSON.stringify(res.body));
  });

  test("logging out twice is not an error", async () => {
    active = stubQuery(() => ({ rows: [], rowCount: 0 }));
    const token = generateRefreshToken({ id: "1" });

    const first = createResponse();
    await logout({ body: { refreshToken: token } } as any, first as any, noopNext);
    const second = createResponse();
    await logout({ body: { refreshToken: token } } as any, second as any, noopNext);

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
  });

  test("a missing refresh token is 400, not a crash", async () => {
    active = stubQuery(() => ({ rows: [], rowCount: 0 }));

    const res = createResponse();
    await logout({ body: {} } as any, res as any, noopNext);
    assert.equal(res.statusCode, 400);
  });
});
