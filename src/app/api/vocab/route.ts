export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getTokenizer } from '@/lib/tokenizer';
import { JLPT_WORDS } from '@/lib/jlpt-data';
import { JLPTLevel } from '@/types';

function katakanaToHiragana(str: string): string {
  return str.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

export async function GET() {
  const tokenizer = await getTokenizer();

  // Iterate N5→N1 so each word is stored at its lowest (easiest) level
  const seen = new Map<string, { reading: string; level: JLPTLevel }>();
  const levels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

  for (const level of levels) {
    for (const word of JLPT_WORDS[level]) {
      if (seen.has(word)) continue; // keep lowest level only
      const tokens = tokenizer.tokenize(word);
      const reading = tokens[0]?.reading
        ? katakanaToHiragana(tokens[0].reading)
        : word;
      seen.set(word, { reading, level });
    }
  }

  const result = [...seen.entries()].map(([word, { reading, level }]) => ({ word, reading, level }));
  return NextResponse.json(result);
}
