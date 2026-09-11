/**
 * CLI entry point: `node dist/migrations/cli.js`.
 *
 * Compiled into `dist` so production never needs `ts-node` (a devDependency)
 * on the `npm start` path.
 */

import "dotenv/config";
import { runMigrations } from "./migrator";

runMigrations()
  .then(() => {
    console.log("✅ All migrations completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });
