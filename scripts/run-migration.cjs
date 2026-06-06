// Run SQL migrations against Supabase PostgreSQL via pooler
// Usage: DB_PASSWORD=xxx node scripts/run-migration.cjs supabase/migrations/001_initial_schema.sql

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_PASSWORD = process.env.DB_PASSWORD;
if (!DB_PASSWORD) {
  console.error('Set DB_PASSWORD environment variable');
  process.exit(1);
}

async function runMigration(filePath) {
  const client = new Client({
    host: 'aws-1-us-west-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.qvhkomiyzgbhxwfzbtmn',
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    family: 4,
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');

    const sql = fs.readFileSync(filePath, 'utf8');
    await client.query(sql);
    console.log(`Executed: ${path.basename(filePath)}`);

    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    console.log('Tables:', rows.map(r => r.table_name).join(', '));

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

const file = process.argv[2];
if (!file) {
  console.log('Usage: DB_PASSWORD=xxx node scripts/run-migration.cjs <file.sql>');
  process.exit(1);
}
runMigration(path.resolve(file));
