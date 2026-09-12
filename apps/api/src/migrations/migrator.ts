/**
 * The single migration runner.
 *
 * Before this existed there were four competing mechanisms — `init.ts` (run
 * from the server), `scripts/runMigrations.ts` (`.sql` files only, run from
 * `npm start` *before* `init.ts` had created the tables those files reference),
 * `src/migrations/run.ts` and an `npm run migrate:down` one-liner — and no
 * record of what had already been applied. On a fresh database the `.sql`
 * migrations ran first and failed on a foreign key to a table that did not
 * exist yet, and the TypeScript migration that adds `contacts.security_token`
 * was never executed by any of them, so `POST /api/contact` failed.
 *
 * The rules here are:
 *   1. The base schema (`initSchema`) always runs first.
 *   2. Then every registered migration, in filename order, exactly once.
 *   3. What has run is recorded in `schema_migrations`, so repeated startups
 *      are safe and an applied migration is never re-run.
 *   4. A failure aborts loudly — a half-migrated database must not serve
 *      traffic.
 *
 * Every step is written to be idempotent as well, so an existing production
 * database that predates the tracking table converges without losing data.
 */

import fs from "fs";
import path from "path";
import { query, getClient } from "../config/database";
import { initSchema } from "./init";
import { up as addSecurityFields } from "./001_add_security_fields";

interface Migration {
  /** Recorded in `schema_migrations.name`. Also the ordering key. */
  name: string;
  run: () => Promise<void>;
}

/** Resolves whether the `.sql` files sit next to this module (dist) or in src. */
const migrationsDir = __dirname;

const runSqlFile = async (file: string): Promise<void> => {
  const fullPath = path.join(migrationsDir, file);

  if (!fs.existsSync(fullPath)) {
    throw new Error(
      `Migration file missing: ${fullPath}. ` +
        `Ensure the build copies src/migrations/*.sql into dist/migrations.`
    );
  }

  const sql = fs.readFileSync(fullPath, "utf-8");
  const client = await getClient();

  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Ordered migration list. `000_init_schema` must stay first: the `.sql`
 * migrations below reference tables it creates.
 */
const MIGRATIONS: Migration[] = [
  { name: "000_init_schema", run: initSchema },
  { name: "001_add_refresh_tokens", run: () => runSqlFile("001_add_refresh_tokens.sql") },
  { name: "001_add_security_fields", run: addSecurityFields },
  { name: "002_add_audit_logs", run: () => runSqlFile("002_add_audit_logs.sql") },
  { name: "003_lock_admin_signup", run: () => runSqlFile("003_lock_admin_signup.sql") },
  {
    name: "004_normalize_contact_status",
    run: () => runSqlFile("004_normalize_contact_status.sql"),
  },
];

const ensureTrackingTable = async (): Promise<void> => {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
};

const appliedMigrations = async (): Promise<Set<string>> => {
  const result = await query("SELECT name FROM schema_migrations");
  return new Set(result.rows.map((row) => row.name as string));
};

/**
 * Bring the database up to date. Safe to call on every startup.
 */
export const runMigrations = async (): Promise<void> => {
  console.log("📦 Running migrations...");

  await ensureTrackingTable();
  const applied = await appliedMigrations();

  let ran = 0;

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.name)) {
      continue;
    }

    console.log(`➡️  Applying ${migration.name}`);

    try {
      await migration.run();
    } catch (error) {
      console.error(`❌ Migration ${migration.name} failed.`);
      throw error;
    }

    await query(
      `INSERT INTO schema_migrations (name) VALUES ($1)
       ON CONFLICT (name) DO NOTHING`,
      [migration.name]
    );

    ran += 1;
  }

  console.log(
    ran === 0
      ? "✅ Database already up to date"
      : `✅ Applied ${ran} migration${ran === 1 ? "" : "s"}`
  );
};

/** Exposed for the fresh-database test. */
export const MIGRATION_NAMES = MIGRATIONS.map((migration) => migration.name);
