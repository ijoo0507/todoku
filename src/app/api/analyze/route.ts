export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { parseSRT } from '@/lib/srt-parser';
import { analyzeText } from '@/lib/comprehension';
import { JLPTLevel } from '@/types';

export async function POST(req: NextRequest) {
  try {
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

    const extraKnown = (JSON.parse((formData.get('extraKnownWords') as string) || '[]') as string[]).slice(0, 5000);
    const result = await analyzeText(text, userLevel, new Set(extraKnown));
    return NextResponse.json(result);
  } catch (err) {
    console.error('analyze error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
