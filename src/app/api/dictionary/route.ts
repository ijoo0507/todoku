import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { words } = await req.json();
  if (!Array.isArray(words) || words.length === 0) {
    return NextResponse.json({});
  }

  const targets: string[] = words.slice(0, 80);
  const meanings: Record<string, string> = {};

  // Process in batches of 10 to avoid hammering Jisho
  const BATCH = 10;
  for (let i = 0; i < targets.length; i += BATCH) {
    const batch = targets.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (word: string) => {
        try {
          const res = await fetch(
            `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`,
            { signal: AbortSignal.timeout(5000) }
          );
          if (!res.ok) return;
          const data = await res.json();

          // Try exact match first, fall back to first result
          const exactMatch = (data?.data ?? []).find((e: JishoEntry) =>
            e.japanese?.some((j: JishoJapanese) => j.word === word || j.reading === word)
          );
          const entry = exactMatch ?? data?.data?.[0];
          const defs = entry?.senses?.[0]?.english_definitions;
          if (defs?.length) {
            meanings[word] = defs.slice(0, 3).join(', ');
          }
        } catch {
          // timeout or network error — skip
        }
      })
    );
    // Small pause between batches
    if (i + BATCH < targets.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  return NextResponse.json(meanings);
}

interface JishoJapanese { word?: string; reading?: string; }
interface JishoEntry { japanese?: JishoJapanese[]; senses?: { english_definitions?: string[] }[]; }
