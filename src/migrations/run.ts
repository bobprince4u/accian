/**
 * Legacy entry point. It used to run only `001_add_security_fields`, which
 * meant the database could end up partially migrated depending on which
 * command an operator happened to run. It now delegates to the single
 * migrator so every entry point produces the same result.
 */

import "dotenv/config";
import { runMigrations } from "./migrator";

const runMigration = async () => {
  try {
    console.log("Starting database migration...");

    if (!process.env.DATABASE_URL && !process.env.DB_PASSWORD) {
      console.error(
        "❌ Database credentials not found in environment variables!"
      );
      process.exit(1);
    }

    await runMigrations();
    console.log("All migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

runMigration();
