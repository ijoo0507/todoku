export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { generateAnkiTSV } from '@/lib/anki';
import { VocabWord } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { words }: { words: VocabWord[] } = await req.json();
    if (!words?.length) {
      return NextResponse.json({ error: 'No words provided' }, { status: 400 });
    }

    const tsv = generateAnkiTSV(words);

    return new NextResponse(tsv, {
      headers: {
        'Content-Type': 'text/tab-separated-values; charset=utf-8',
        'Content-Disposition': 'attachment; filename="todoku-anki.txt"',
      },
    });
  } catch (err) {
    console.error('export error:', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
