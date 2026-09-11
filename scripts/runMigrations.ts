/**
 * Kept so `npm run migrate` keeps working from a source checkout.
 * The real implementation lives in `src/migrations/migrator.ts`, which is
 * compiled into `dist` and shared with the server's startup path.
 */

import "dotenv/config";
import { runMigrations } from "../src/migrations/migrator";

runMigrations()
  .then(() => {
    console.log("✅ All migrations completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
