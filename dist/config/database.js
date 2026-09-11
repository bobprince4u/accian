"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.getClient = exports.query = exports.connectionDatabase = void 0;
const pg_1 = require("pg");
/**
 * `DATABASE_URL` is read once, here, at module load.
 *
 * The fresh-database migration test needs to point the pool at a throwaway
 * database. It cannot simply assign `DATABASE_URL`, because `dotenv/config`
 * runs during the test file's imports and would overwrite it before the test
 * body executes. `TEST_DATABASE_URL` is therefore its own variable, honoured
 * only when `NODE_ENV=test` so it can never redirect a running server.
 */
const connectionString = process.env.NODE_ENV === "test" && process.env.TEST_DATABASE_URL
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;
const pool = new pg_1.Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
});
exports.pool = pool;
const connectionDatabase = async () => {
    try {
        const client = await pool.connect();
        console.log("PostgresSQL Database connected successfully");
        client.release();
        return pool;
    }
    catch (error) {
        console.error("Error connecting to the PostgreSQL database:", error.message);
        throw new Error("Failed to connect to the database");
    }
};
exports.connectionDatabase = connectionDatabase;
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log("Executed query", {
            text: text.substring(0, 50) + "...",
            duration: `${duration}ms`,
            rows: res.rowCount,
        });
        return res;
    }
    catch (error) {
        console.error("Database query error:", error.message);
        throw error;
    }
};
exports.query = query;
/**
 * Check out a client for work that must run in a single transaction.
 * The caller is responsible for releasing it.
 */
const getClient = async () => pool.connect();
exports.getClient = getClient;
