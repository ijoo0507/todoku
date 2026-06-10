import { VocabWord } from '@/types';

/**
 * Generates an Anki-importable TSV string.
 * Format: front\tback\ttags
 * Import settings: Fields separated by Tab, allow HTML in fields.
 */
const sanitize = (s: string) => s.replace(/[\t\n\r]/g, '').trim();

export function generateAnkiTSV(words: VocabWord[]): string {
  // Cap at 500 words to prevent abuse
  const capped = words.slice(0, 500);
  const rows = capped.map(w => {
    const front = sanitize(w.word);
    const back = [
      w.reading,
      posLabel(w.pos),
      w.jlpt ? `[${w.jlpt}]` : '',
    ]
      .filter(Boolean)
      .join(' · ');
    const tags = sanitize(['todoku', w.jlpt ?? 'unknown'].join(' '));
    return [front, back, tags].join('\t');
  });

  return rows.join('\n');
}

function posLabel(pos: string): string {
  const map: Record<string, string> = {
    '名詞': 'noun',
    '動詞': 'verb',
    '形容詞': 'adj',
    '副詞': 'adv',
    '形容動詞': 'na-adj',
  };
  return map[pos] ?? pos;
}
