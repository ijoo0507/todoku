import { NextRequest, NextResponse } from 'next/server';
import MEANINGS from '@/data/meanings.json';

export const runtime = 'nodejs';

const MAX_WORDS = 80;
const CONCURRENCY = 8;
// Overall budget for the remote phase. Whatever Jotoba hasn't answered by
// then is dropped and the local meanings are returned.
const REMOTE_DEADLINE_MS = 2000;

const LOCAL = MEANINGS as Record<string, string>;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({});
  }
  const words = (body as { words?: unknown })?.words;
  if (!Array.isArray(words) || words.length === 0) {
    return NextResponse.json({});
  }

  // Dedupe and drop junk before doing any work
  const targets = [...new Set(
    words.filter((w): w is string => typeof w === 'string' && w.length > 0 && w.length <= 20)
  )].slice(0, MAX_WORDS);

  const meanings: Record<string, string> = {};
  const missing: string[] = [];
  for (const word of targets) {
    if (LOCAL[word]) meanings[word] = LOCAL[word];
    else missing.push(word);
  }

  if (missing.length > 0) {
    Object.assign(meanings, await fetchRemoteMeanings(missing, REMOTE_DEADLINE_MS));
  }

  return NextResponse.json(meanings);
}

// Jotoba is a proper public dictionary API (jotoba.de). Unlike Jisho it
// doesn't block server-side requests.
async function fetchRemoteMeanings(words: string[], deadlineMs: number): Promise<Record<string, string>> {
  const found: Record<string, string> = {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), deadlineMs);

  let next = 0;
  const worker = async () => {
    while (next < words.length && !controller.signal.aborted) {
      const word = words[next++];
      const meaning = await lookupJotoba(word, controller.signal);
      if (meaning && !controller.signal.aborted) found[word] = meaning;
    }
  };

  // The deadline promise guarantees we return on time even if fetch ignores the abort
  const deadline = new Promise<void>(resolve => controller.signal.addEventListener('abort', () => resolve()));
  await Promise.race([
    Promise.all(Array.from({ length: Math.min(CONCURRENCY, words.length) }, worker)),
    deadline,
  ]);
  clearTimeout(timer);
  controller.abort();
  return { ...found };
}

async function lookupJotoba(word: string, signal: AbortSignal): Promise<string | undefined> {
  try {
    const res = await fetch('https://jotoba.de/api/search/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: word, language: 'English', no_english: false }),
      signal,
    });
    if (!res.ok) return undefined;
    const data = await res.json();

    // Find exact kanji or kana match
    const results: JotobaWord[] = data?.words ?? [];
    const exact = results.find(w =>
      w.reading?.kanji === word || w.reading?.kana === word
    ) ?? results[0];

    const glosses = exact?.senses?.[0]?.glosses;
    return glosses?.length ? glosses.slice(0, 3).join(', ') : undefined;
  } catch {
    // timeout, abort, or network error: skip
    return undefined;
  }
}

interface JotobaWord {
  reading?: { kanji?: string; kana?: string };
  senses?: { glosses?: string[] }[];
}
