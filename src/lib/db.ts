import { Pool } from '@neondatabase/serverless';

// Singleton pool — reused across requests in the same serverless instance
let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return _pool;
}
