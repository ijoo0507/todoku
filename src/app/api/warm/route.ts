export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getTokenizer, isTokenizerReady } from '@/lib/tokenizer';

// Hit by cron and by the client on page load so the kuromoji dictionary is
// loaded before the first analyze.
export async function GET() {
  const start = Date.now();
  const alreadyWarm = isTokenizerReady();
  try {
    await getTokenizer();
  } catch (err) {
    console.error('warm error:', err);
    return NextResponse.json({ warm: false }, { status: 500 });
  }
  return NextResponse.json(
    { warm: alreadyWarm, ms: Date.now() - start },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
