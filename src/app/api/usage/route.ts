export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPool } from '@/lib/db';

const FREE_DAILY_LIMIT = 5;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ guest: true, used: 0, limit: 2 });
  }

  const pool = getPool();
  const [usageRes, userRes] = await Promise.all([
    pool.query(
      'SELECT count FROM usage WHERE user_id = $1 AND date = CURRENT_DATE',
      [session.user.id]
    ),
    pool.query('SELECT plan FROM users WHERE id = $1', [session.user.id]),
  ]);

  const plan = userRes.rows[0]?.plan ?? 'free';
  const used = usageRes.rows[0]?.count ?? 0;

  return NextResponse.json({
    guest: false,
    plan,
    used,
    limit: plan === 'pro' ? null : FREE_DAILY_LIMIT,
  });
}
