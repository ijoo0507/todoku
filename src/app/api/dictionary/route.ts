import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Fetch English meanings from Jisho for a list of Japanese words
// Called async after analysis so it doesn't block the main result
export async function POST(req: NextRequest) {
  const { words } = await req.json();
  if (!Array.isArray(words) || words.length === 0) {
    return NextResponse.json({});
  }

  // Cap at 60 words to avoid overloading Jisho
  const targets: string[] = words.slice(0, 60);

  const meanings: Record<string, string> = {};

  await Promise.all(
    targets.map(async (word: string) => {
      try {
        const res = await fetch(
          `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`,
          { signal: AbortSignal.timeout(3000) }
        );
        if (!res.ok) return;
        const data = await res.json();
        const entry = data?.data?.[0];
        if (!entry) return;

        // Find the entry whose Japanese form matches our word exactly
        const exactMatch = data.data.find((e: JishoEntry) =>
          e.japanese?.some((j: JishoJapanese) => j.word === word || j.reading === word)
        ) ?? entry;

        const defs = exactMatch?.senses?.[0]?.english_definitions;
        if (defs?.length) {
          meanings[word] = defs.slice(0, 3).join(', ');
        }
      } catch {
        // timeout or network error — just skip this word
      }
    })
  );

  return NextResponse.json(meanings);
}

interface JishoJapanese { word?: string; reading?: string; }
interface JishoEntry { japanese?: JishoJapanese[]; senses?: { english_definitions?: string[] }[]; }
