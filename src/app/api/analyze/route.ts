export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { parseSRT } from '@/lib/srt-parser';
import { analyzeText } from '@/lib/comprehension';
import { JLPTLevel } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const mode = formData.get('mode') as string;
    const userLevel = (formData.get('userLevel') as JLPTLevel) || 'N4';

    let text = '';

    if (mode === 'file') {
      const file = formData.get('file') as File;
      if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      const raw = await file.text();
      text = parseSRT(raw);
    } else {
      text = (formData.get('text') as string) || '';
    }

    if (!text.trim()) {
      return NextResponse.json({ error: 'No text to analyze' }, { status: 400 });
    }

    const extraKnown = JSON.parse((formData.get('extraKnownWords') as string) || '[]') as string[];
    const result = await analyzeText(text, userLevel, new Set(extraKnown));
    return NextResponse.json(result);
  } catch (err) {
    console.error('analyze error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
