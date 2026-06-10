export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { PLACEMENT_WORDS, inferLevel } from '@/lib/jlpt-data';
import { NextRequest } from 'next/server';

export async function GET() {
  return NextResponse.json(PLACEMENT_WORDS);
}

export async function POST(req: NextRequest) {
  try {
    const { answers }: { answers: Record<string, boolean> } = await req.json();
    const level = inferLevel(answers);
    return NextResponse.json({ level });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
