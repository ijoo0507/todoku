export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { parseSRT } from '@/lib/srt-parser';
import { analyzeText } from '@/lib/comprehension';
import { JLPTLevel } from '@/types';
import { auth } from '@/auth';
import { getPool } from '@/lib/db';

const FREE_DAILY_LIMIT = 5;

async function checkAndIncrementUsage(userId: string): Promise<boolean> {
  const pool = getPool();
  const res = await pool.query(
    `INSERT INTO usage (user_id, date, count)
     VALUES ($1, CURRENT_DATE, 1)
     ON CONFLICT (user_id, date) DO UPDATE
       SET count = usage.count + 1
     RETURNING count`,
    [userId]
  );
  return res.rows[0].count <= FREE_DAILY_LIMIT;
}

export async function POST(req: NextRequest) {
  try {
    // Auth check — guests allowed but limited via middleware rate limiter
    const session = await auth();
    if (session?.user?.id) {
      // Check plan
      const pool = getPool();
      const userRes = await pool.query('SELECT plan FROM users WHERE id = $1', [session.user.id]);
      const plan = userRes.rows[0]?.plan ?? 'free';

      if (plan !== 'pro') {
        const withinLimit = await checkAndIncrementUsage(session.user.id);
        if (!withinLimit) {
          return NextResponse.json(
            { error: 'Daily limit reached (5/day). Upgrade to Pro for unlimited analyses.' },
            { status: 429 }
          );
        }
      }
    }

    const formData = await req.formData();
    const mode = formData.get('mode') as string;
    const rawLevel = formData.get('userLevel') as string;
    const validLevels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
    const userLevel: JLPTLevel = validLevels.includes(rawLevel as JLPTLevel) ? (rawLevel as JLPTLevel) : 'N4';

    let text = '';

    if (mode === 'file') {
      const file = formData.get('file') as File;
      if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 2MB)' }, { status: 413 });
      const raw = await file.text();
      text = parseSRT(raw);
    } else {
      text = (formData.get('text') as string) || '';
      if (text.length > 100_000) return NextResponse.json({ error: 'Text too large (max 100k chars)' }, { status: 413 });
    }

    if (!text.trim()) {
      return NextResponse.json({ error: 'No text to analyze' }, { status: 400 });
    }

    const extraKnown = (JSON.parse((formData.get('extraKnownWords') as string) || '[]') as string[])
      .slice(0, 5000)
      .filter((w): w is string => typeof w === 'string' && w.length <= 20);
    const result = await analyzeText(text, userLevel, new Set(extraKnown));
    return NextResponse.json(result);
  } catch (err) {
    console.error('analyze error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
