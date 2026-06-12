import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { words } = await req.json();
  if (!Array.isArray(words) || words.length === 0) {
    return NextResponse.json({});
  }

  const targets: string[] = words.slice(0, 80);
  const meanings: Record<string, string> = {};

  // Jotoba is a proper public dictionary API (jotoba.de) — unlike Jisho it
  // doesn't block server-side requests
  const BATCH = 8;
  for (let i = 0; i < targets.length; i += BATCH) {
    const batch = targets.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (word: string) => {
        try {
          const res = await fetch('https://jotoba.de/api/search/words', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: word, language: 'English', no_english: false }),
            signal: AbortSignal.timeout(5000),
          });
          if (!res.ok) return;
          const data = await res.json();

          // Find exact kanji or kana match
          const results: JotobaWord[] = data?.words ?? [];
          const exact = results.find(w =>
            w.reading?.kanji === word || w.reading?.kana === word
          ) ?? results[0];

          const glosses = exact?.senses?.[0]?.glosses;
          if (glosses?.length) {
            meanings[word] = glosses.slice(0, 3).join(', ');
          }
        } catch {
          // timeout or network error — skip
        }
      })
    );
    if (i + BATCH < targets.length) {
      await new Promise(r => setTimeout(r, 150));
    }
  }

  return NextResponse.json(meanings);
}

interface JotobaWord {
  reading?: { kanji?: string; kana?: string };
  senses?: { glosses?: string[] }[];
}
