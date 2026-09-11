"use strict";
/**
 * CLI entry point: `node dist/migrations/cli.js`.
 *
 * Compiled into `dist` so production never needs `ts-node` (a devDependency)
 * on the `npm start` path.
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const migrator_1 = require("./migrator");
(0, migrator_1.runMigrations)()
    .then(() => {
    console.log("✅ All migrations completed");
    process.exit(0);
})
    .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
});
