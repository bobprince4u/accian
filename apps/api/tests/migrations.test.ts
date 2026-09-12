/**
 * Item 12 — database migrations.
 *
 * Runs the real migrator against a real, genuinely empty PostgreSQL database.
 * A stub could not prove what this needs to prove: that the ordering is
 * correct (the `.sql` migrations reference tables the base schema creates),
 * that re-running is safe, and that nothing is applied twice.
 *
 * Requires TEST_DATABASE_URL pointing at a database that may be dropped and
 * recreated. Skipped when it is unset, so the suite stays runnable anywhere.
 */

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";

import { captureConsole } from "./helpers";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

/** Tables the full migration set must produce. */
const EXPECTED_TABLES = [
  "admin_users",
  "audit_logs",
  "contacts",
  "email_logs",
  "projects",
  "refresh_tokens",
  "schema_migrations",
  "services",
  "testimonials",
];

describe("migrations against a fresh database", { skip: !TEST_DATABASE_URL && "TEST_DATABASE_URL is not set" }, () => {
  let migrator: typeof import("../src/migrations/migrator");
  let database: typeof import("../src/config/database");
  let consoleSilencer: ReturnType<typeof captureConsole> | undefined;

  const connect = async () => {
    const client = new Client({ connectionString: TEST_DATABASE_URL });
    await client.connect();
    return client;
  };

  before(async () => {
    // `query()` logs every statement it runs. Across a full migration set that
    // is a firehose, and it interleaves with the test runner's own serialized
    // messages on stdout — which corrupts them, so *other* test files fail
    // with "Unable to deserialize cloned data". Silence it for this file.
    consoleSilencer = captureConsole();

    // Drop everything first: "fresh" has to actually mean fresh.
    const client = await connect();
    try {
      await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    } finally {
      await client.end();
    }

    // The pool reads its connection string at module load, and `dotenv/config`
    // runs during this file's imports — so assigning `DATABASE_URL` here would
    // be too late. `database.ts` prefers `TEST_DATABASE_URL` when
    // `NODE_ENV=test`, which the test script sets.
    database = await import("../src/config/database");
    migrator = await import("../src/migrations/migrator");
  });

  after(async () => {
    await database?.pool.end();
    consoleSilencer?.restore();
  });

  test("a fresh database migrates from empty without error", async () => {
    await migrator.runMigrations();
  });

  test("every expected table exists afterwards", async () => {
    const client = await connect();
    try {
      const result = await client.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_schema = 'public' ORDER BY table_name`
      );
      const tables = result.rows.map((row) => row.table_name);

      for (const expected of EXPECTED_TABLES) {
        assert.ok(tables.includes(expected), `missing table: ${expected}`);
      }
    } finally {
      await client.end();
    }
  });

  test("the security-fields migration actually ran", async () => {
    // This one was registered by no runner before the repair, so
    // POST /api/contact failed on a missing column.
    const client = await connect();
    try {
      const result = await client.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_name = 'contacts'`
      );
      const columns = result.rows.map((row) => row.column_name);

      assert.ok(columns.includes("security_token"), "contacts.security_token missing");
      assert.ok(
        columns.includes("submission_timestamp"),
        "contacts.submission_timestamp missing"
      );
    } finally {
      await client.end();
    }
  });

  test("every migration is recorded in schema_migrations", async () => {
    const client = await connect();
    try {
      const result = await client.query("SELECT name FROM schema_migrations");
      const recorded = result.rows.map((row) => row.name);

      for (const name of migrator.MIGRATION_NAMES) {
        assert.ok(recorded.includes(name), `not recorded: ${name}`);
      }
      assert.equal(recorded.length, migrator.MIGRATION_NAMES.length);
    } finally {
      await client.end();
    }
  });

  test("the base schema is recorded first", () => {
    assert.equal(migrator.MIGRATION_NAMES[0], "000_init_schema");
  });

  test("re-running applies nothing and does not throw", async () => {
    const client = await connect();
    try {
      const before = await client.query(
        "SELECT name, applied_at FROM schema_migrations ORDER BY name"
      );

      await migrator.runMigrations();

      const after = await client.query(
        "SELECT name, applied_at FROM schema_migrations ORDER BY name"
      );

      assert.equal(after.rows.length, before.rows.length);
      // Identical timestamps prove nothing was re-applied.
      assert.deepEqual(
        after.rows.map((r) => r.applied_at.toISOString()),
        before.rows.map((r) => r.applied_at.toISOString())
      );
    } finally {
      await client.end();
    }
  });

  test("a third run is still safe (repeated startup)", async () => {
    await migrator.runMigrations();
    await migrator.runMigrations();

    const client = await connect();
    try {
      const result = await client.query("SELECT COUNT(*)::int AS n FROM schema_migrations");
      assert.equal(result.rows[0].n, migrator.MIGRATION_NAMES.length);
    } finally {
      await client.end();
    }
  });

  test("existing data survives a re-run", async () => {
    const client = await connect();
    try {
      await client.query(
        `INSERT INTO contacts (full_name, email, service_interest, message, status)
         VALUES ('Persist Test', 'persist@example.com', 'Consulting', 'Hello', 'in-progress')`
      );

      await migrator.runMigrations();

      const result = await client.query(
        "SELECT status FROM contacts WHERE email = 'persist@example.com'"
      );
      assert.equal(result.rows.length, 1, "the row was destroyed by a re-run");
      assert.equal(result.rows[0].status, "in-progress");
    } finally {
      await client.query("DELETE FROM contacts WHERE email = 'persist@example.com'");
      await client.end();
    }
  });

  test("the status normalisation migration converts legacy spellings", async () => {
    const client = await connect();
    try {
      // Write a legacy row, then replay just that migration by clearing its
      // tracking entry — the same path an existing production database takes.
      await client.query(
        `INSERT INTO contacts (full_name, email, service_interest, message, status)
         VALUES ('Legacy Row', 'legacy@example.com', 'Consulting', 'Hello', 'in_progress')`
      );
      await client.query(
        "DELETE FROM schema_migrations WHERE name = '004_normalize_contact_status'"
      );

      await migrator.runMigrations();

      const result = await client.query(
        "SELECT status FROM contacts WHERE email = 'legacy@example.com'"
      );
      assert.equal(result.rows[0].status, "in-progress");
    } finally {
      await client.query("DELETE FROM contacts WHERE email = 'legacy@example.com'");
      await client.end();
    }
  });
});
