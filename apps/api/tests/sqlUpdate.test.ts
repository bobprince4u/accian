/**
 * Item 3 — SQL identifier injection.
 *
 * Proves that an arbitrary field name can never become a SQL identifier, for
 * the shared builder used by all three previously-vulnerable update handlers.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  buildUpdate,
  buildInsert,
  UnknownUpdateFieldError,
  NoUpdateFieldsError,
} from "../src/utils/sqlUpdate";
import {
  PROJECT_FIELDS,
  SERVICE_FIELDS,
  TESTIMONIAL_FIELDS,
} from "../src/utils/requestFields";

describe("buildUpdate — SQL identifier safety", () => {
  test("maps allowlisted API fields onto fixed columns", () => {
    const built = buildUpdate(
      { client: "Acme Ltd", image: "https://example.com/a.png" },
      PROJECT_FIELDS
    );

    assert.equal(built.setClause, "client_name = $1, image_url = $2");
    assert.deepEqual(built.values, ["Acme Ltd", "https://example.com/a.png"]);
    assert.equal(built.nextIndex, 3);
  });

  test("rejects an arbitrary field name instead of interpolating it", () => {
    assert.throws(
      () => buildUpdate({ is_superuser: true }, PROJECT_FIELDS),
      (error: unknown) => {
        assert.ok(error instanceof UnknownUpdateFieldError);
        assert.deepEqual(error.fields, ["is_superuser"]);
        assert.equal(error.statusCode, 400);
        return true;
      }
    );
  });

  test("rejects a field name carrying SQL punctuation", () => {
    const hostile = [
      "title = 'x', published",
      "published = false WHERE 1=1 --",
      "id) VALUES (1); DROP TABLE projects; --",
      '"; DELETE FROM projects; --',
    ];

    for (const field of hostile) {
      assert.throws(
        () => buildUpdate({ [field]: "x" }, PROJECT_FIELDS),
        UnknownUpdateFieldError,
        `expected rejection of: ${field}`
      );
    }
  });

  test("a hostile field mixed with a valid one fails the whole request", () => {
    // The hostile key must not be silently dropped while the rest succeeds:
    // that would let an attacker probe which names are accepted.
    assert.throws(
      () => buildUpdate({ title: "Legit", "; DROP TABLE x": 1 }, PROJECT_FIELDS),
      UnknownUpdateFieldError
    );
  });

  test("every emitted identifier comes from the allowlist", () => {
    const allColumns = new Set(
      Object.values(PROJECT_FIELDS).map((spec) => spec.column)
    );

    const built = buildUpdate(
      { title: "t", client: "c", technologies: ["a"], status: "Draft" },
      PROJECT_FIELDS
    );

    for (const column of built.columns) {
      assert.ok(allColumns.has(column), `${column} is not an allowlisted column`);
      assert.match(column, /^[a-z_][a-z0-9_]*$/);
    }
  });

  test("placeholders stay aligned with values when startIndex is shifted", () => {
    const built = buildUpdate({ title: "t", client: "c" }, PROJECT_FIELDS, 5);
    assert.equal(built.setClause, "title = $5, client_name = $6");
    assert.equal(built.nextIndex, 7);
  });

  test("an empty payload is rejected, not turned into empty SQL", () => {
    assert.throws(() => buildUpdate({}, PROJECT_FIELDS), NoUpdateFieldsError);
    assert.throws(() => buildUpdate(null, PROJECT_FIELDS), NoUpdateFieldsError);
    assert.throws(
      () => buildUpdate("not an object", PROJECT_FIELDS),
      NoUpdateFieldsError
    );
  });

  test("undefined values are skipped rather than rejected", () => {
    const built = buildUpdate(
      { title: "t", client: undefined },
      PROJECT_FIELDS
    );
    assert.equal(built.setClause, "title = $1");
  });

  test("service and testimonial allowlists reject arbitrary fields too", () => {
    assert.throws(
      () => buildUpdate({ role: "admin" }, SERVICE_FIELDS),
      UnknownUpdateFieldError
    );
    assert.throws(
      () => buildUpdate({ password_hash: "x" }, TESTIMONIAL_FIELDS),
      UnknownUpdateFieldError
    );
  });
});

describe("buildInsert — same contract as update", () => {
  test("rejects arbitrary fields on create as well", () => {
    assert.throws(
      () => buildInsert({ title: "t", evil_column: 1 }, PROJECT_FIELDS),
      UnknownUpdateFieldError
    );
  });

  test("create and update accept exactly the same field names", () => {
    const payload = {
      title: "T",
      client: "C",
      technologies: ["ts"],
      status: "Published",
    };

    const inserted = buildInsert(payload, PROJECT_FIELDS);
    const updated = buildUpdate(payload, PROJECT_FIELDS);

    assert.deepEqual(inserted.columns, updated.columns);
    assert.deepEqual(inserted.values, updated.values);
  });
});
