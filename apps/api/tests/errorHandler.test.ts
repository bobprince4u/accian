/**
 * Phase 3 §7 — what an error is allowed to tell a client.
 *
 * The rule: a response body may carry a message that was deliberately written
 * for a caller, and nothing else. Stack traces, database errors, SQL, provider
 * errors and secrets stay on the server.
 *
 * Most of these tests fail against the previous handler, which defaulted to
 * `err.message` for anything it did not explicitly recognise. That default is
 * the defect they exist to hold closed: three SQLSTATEs were mapped to safe
 * text and every other error — including connection failures carrying the
 * database host — was relayed to the caller verbatim.
 */

import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Request, Response, NextFunction } from "express";

import { createResponse, captureConsole } from "./helpers";
import errorHandler, { AppError } from "../src/middleware/errorHandler";

/** Invokes the middleware the way Express does, returning the sent response. */
const handle = (err: unknown) => {
  const res = createResponse();
  errorHandler(
    err as AppError,
    { method: "GET", path: "/api/test" } as Request,
    res as unknown as Response,
    (() => {}) as NextFunction
  );
  return res;
};

/** Builds an error carrying the fields `pg` attaches to a driver error. */
const pgError = (code: string, message: string): AppError => {
  const err = new Error(message) as AppError;
  err.code = code;
  return err;
};

let cleanups: Array<() => void> = [];

afterEach(() => {
  cleanups.forEach((fn) => fn());
  cleanups = [];
});

describe("database internals never reach the client", () => {
  test("a connection failure does not disclose the database host or port", () => {
    // Verbatim shape of a real `pg` connection failure: name "Error", a code
    // that is not a SQLSTATE, no statusCode. It matched no branch of the old
    // handler, so this exact string was sent to the caller.
    const err = new Error("connect ECONNREFUSED 10.0.4.17:5432") as AppError;
    err.code = "ECONNREFUSED";

    const res = handle(err);
    const body = JSON.stringify(res.body);

    assert.equal(res.statusCode, 500);
    assert.ok(!body.includes("10.0.4.17"), `host leaked: ${body}`);
    assert.ok(!body.includes("5432"), `port leaked: ${body}`);
    assert.ok(!body.includes("ECONNREFUSED"), `driver code leaked: ${body}`);
    assert.equal(res.body.message, "Internal Server Error");
  });

  test("a SQL syntax error does not disclose the statement", () => {
    const res = handle(
      pgError("42601", 'syntax error at or near "SELCT" — SELCT * FROM contacts')
    );

    const body = JSON.stringify(res.body);
    assert.ok(!body.includes("SELCT"), `SQL leaked: ${body}`);
    assert.ok(!body.includes("contacts"), `table name leaked: ${body}`);
    assert.equal(res.body.message, "Internal Server Error");
  });

  test("an undefined-column error does not disclose the schema", () => {
    const res = handle(
      pgError("42703", 'column "password_hash" does not exist')
    );

    assert.ok(
      !JSON.stringify(res.body).includes("password_hash"),
      `column name leaked: ${JSON.stringify(res.body)}`
    );
  });

  test("an unmapped SQLSTATE falls back to the generic message, not the driver's", () => {
    // The guarantee is about the default, not about any particular code: a
    // code nobody has mapped must still be safe.
    const res = handle(pgError("53300", "too many connections for role accian_prod"));

    assert.ok(!JSON.stringify(res.body).includes("accian_prod"));
    assert.equal(res.body.message, "Internal Server Error");
  });
});

describe("secrets and stack traces never reach the client", () => {
  test("no response carries a stack, in any environment", () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    cleanups.push(() => {
      process.env.NODE_ENV = original;
    });

    const capture = captureConsole();
    cleanups.push(capture.restore);

    const err = new Error("boom") as AppError;
    const res = handle(err);

    // The old handler attached `stack` and `error` when NODE_ENV was
    // "development", so the response shape differed by environment and the
    // leak was invisible outside production.
    assert.equal(res.body.stack, undefined, "a stack reached the client");
    assert.equal(res.body.error, undefined, "a raw error reached the client");
    assert.deepEqual(Object.keys(res.body).sort(), ["message", "success"]);
  });

  test("a secret quoted inside an error message is not relayed", () => {
    const err = new Error(
      'authentication failed for connection postgres://accian:S3cr3tP4ss@db.internal:5432/accian'
    ) as AppError;

    const res = handle(err);
    const body = JSON.stringify(res.body);

    assert.ok(!body.includes("S3cr3tP4ss"), `credential leaked: ${body}`);
    assert.ok(!body.includes("db.internal"), `host leaked: ${body}`);
  });

  test("an email provider error is not relayed to the caller", () => {
    // §7 names provider errors specifically. The transport redacts before
    // logging; this is the second line — the response never carries it at all.
    const err = new Error(
      "Email provider rejected the message (validation_error): API key re_live_AbC123 is invalid"
    ) as AppError;

    const res = handle(err);
    const body = JSON.stringify(res.body);

    assert.ok(!body.includes("re_live_AbC123"), `API key leaked: ${body}`);
    assert.ok(!body.includes("validation_error"), `provider detail leaked: ${body}`);
  });
});

describe("deliberately authored messages still reach the client", () => {
  test("a 4xx AppError message is sent as written", () => {
    // The counterweight: safe-by-default must not mean uninformative. A
    // message written for a caller is still sent.
    const res = handle(new AppError("Not allowed by CORS", 403));

    assert.equal(res.statusCode, 403);
    assert.equal(res.body.message, "Not allowed by CORS");
  });

  test("an AppError code is included when one was set", () => {
    const res = handle(new AppError("Refresh token reused", 401, "TOKEN_REUSE"));

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.code, "TOKEN_REUSE");
  });

  test("a 5xx AppError message is withheld — it describes a server fault", () => {
    const res = handle(new AppError("Redis pool exhausted on node 3", 500));

    assert.equal(res.statusCode, 500);
    assert.ok(!JSON.stringify(res.body).includes("node 3"));
    assert.equal(res.body.message, "Internal Server Error");
  });
});

describe("recognised errors keep their existing translations", () => {
  test("the three originally-mapped SQLSTATEs are unchanged", () => {
    // Pre-existing behaviour, preserved deliberately: these were the only
    // codes the old handler mapped, and clients may depend on them.
    assert.equal(handle(pgError("23505", "duplicate key")).statusCode, 409);
    assert.equal(
      handle(pgError("23505", "duplicate key")).body.message,
      "Resource already exists."
    );
    assert.equal(handle(pgError("23503", "fk violation")).statusCode, 400);
    assert.equal(handle(pgError("22P02", "bad uuid")).statusCode, 400);
    assert.equal(handle(pgError("22P02", "bad uuid")).body.message, "Invalid data format.");
  });

  test("JWT failures are translated, not relayed", () => {
    const expired = new Error("jwt expired at 2026-01-01T00:00:00Z") as AppError;
    expired.name = "TokenExpiredError";

    const res = handle(expired);

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, "Token expired.");
  });

  test("malformed JSON is reported without quoting the body back", () => {
    // body-parser's SyntaxError message includes the offending input, which
    // for a failed login attempt is a partial credential.
    const err = new SyntaxError(
      'Unexpected token } in JSON at position 42 — {"password":"hunter2"}'
    ) as unknown as AppError;
    (err as unknown as { body: string }).body = '{"password":"hunter2"}';

    const res = handle(err);

    assert.equal(res.statusCode, 400);
    assert.ok(!JSON.stringify(res.body).includes("hunter2"), "request body echoed back");
  });
});

describe("the response is a valid ApiError, and the detail is still logged", () => {
  test("every failure matches the contract's error envelope", () => {
    for (const err of [
      new Error("raw"),
      pgError("23505", "duplicate key"),
      new AppError("Not allowed by CORS", 403),
    ]) {
      const res = handle(err);
      assert.equal(res.body.success, false);
      assert.equal(typeof res.body.message, "string");
      assert.ok(res.body.message.length > 0);
    }
  });

  test("the full detail reaches the server log, where an operator can read it", () => {
    // Safe-by-default must not mean the information is destroyed: it moves to
    // the log rather than disappearing.
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const capture = captureConsole();
    cleanups.push(capture.restore, () => {
      process.env.NODE_ENV = original;
    });

    handle(new Error("connect ECONNREFUSED 10.0.4.17:5432"));

    const logged = capture.lines.join("\n");
    assert.ok(logged.includes("10.0.4.17"), "detail was lost, not just withheld");
  });
});
