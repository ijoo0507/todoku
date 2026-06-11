/**
 * Run once to add Stripe columns:
 *   npx tsx scripts/migrate-stripe.ts
 */
import { Pool } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
try {
  const env = readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
} catch { /* file may not exist in CI */ }

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
        ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

      CREATE UNIQUE INDEX IF NOT EXISTS users_stripe_customer_id_idx
        ON users(stripe_customer_id)
        WHERE stripe_customer_id IS NOT NULL;
    `);
    console.log('✅ Stripe migration complete');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => { console.error(err); process.exit(1); });
