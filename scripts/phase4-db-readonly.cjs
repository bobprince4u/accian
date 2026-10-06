// Explicitly invoked audit only. Never migrate, write records, or send email.
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { Client } = require('pg');

async function main() {
  const local = path.resolve(__dirname, '../apps/api/.env');
  const config = fs.existsSync(local) ? dotenv.parse(fs.readFileSync(local)) : {};
  const connectionString = process.env.DATABASE_URL || config.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is unavailable');
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  try {
    await client.connect();
    await client.query('BEGIN READ ONLY');
    await client.query("SET LOCAL statement_timeout = '10s'");
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    const columns = await client.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position");
    const names = new Set(tables.rows.map(row => row.table_name));
    const migrations = names.has('schema_migrations') ? (await client.query('SELECT name FROM schema_migrations ORDER BY name')).rows : [];
    const counts = {};
    for (const table of ['projects', 'services', 'testimonials', 'contacts', 'email_logs', 'admin_users']) {
      if (names.has(table)) counts[table] = Number((await client.query(`SELECT count(*) AS count FROM ${table}`)).rows[0].count);
    }
    await client.query('ROLLBACK');
    console.log(JSON.stringify({ connection: 'PASS', identity: 'Locally configured database; production identity requires host confirmation', tables: [...names], columns: columns.rows, migrations, counts, backup: 'NOT CONFIRMED', writes: 'NOT RUN — SAFETY' }, null, 2));
  } finally { await client.end(); }
}
main().catch(() => { console.error('Read-only database verification failed; connection details suppressed.'); process.exitCode = 1; });
