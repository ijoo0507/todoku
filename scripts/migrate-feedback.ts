/**
 * npx tsx scripts/migrate-feedback.ts
 */
import { Pool } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
try {
  const env = readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
} catch {}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Feedback migration complete');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => { console.error(err); process.exit(1); });
