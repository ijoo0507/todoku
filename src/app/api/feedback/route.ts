import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: 'Too long' }, { status: 400 });
  }

  const session = await auth();
  const pool = getPool();

  await pool.query(
    `INSERT INTO feedback (user_id, message, created_at)
     VALUES ($1, $2, NOW())`,
    [session?.user?.id ?? null, message.trim()]
  );

  return NextResponse.json({ ok: true });
}
