import { tokenizeText, Token } from './tokenizer';
import { getKnownWords, JLPT_WORDS } from './jlpt-data';
import MEANINGS from '@/data/meanings.json';
import { JLPTLevel, VocabWord, AnalysisResult } from '@/types';

// Frequency of each unique dictionary form. Contains no per-user data, so it is
// safe to share across users in the analysis cache.
export type FrequencyMap = Record<string, { count: number; reading: string; pos: string }>;

export async function analyzeText(
  text: string,
  userLevel: JLPTLevel,
  extraKnown: Set<string> = new Set()
): Promise<AnalysisResult> {
  const tokens = await tokenizeText(text);
  return scoreFrequency(buildFrequency(tokens), userLevel, extraKnown);
}

export function buildFrequency(tokens: Token[]): FrequencyMap {
  const freq: FrequencyMap = {};
  for (const token of tokens) {
    const key = token.basicForm;
    if (!freq[key]) {
      freq[key] = { count: 0, reading: token.reading, pos: token.pos };
    }
    freq[key].count++;
  }
  return freq;
}

export function scoreFrequency(
  freq: FrequencyMap,
  userLevel: JLPTLevel,
  extraKnown: Set<string> = new Set()
): AnalysisResult {
  const baseKnown = getKnownWords(userLevel);

  const entries = Object.entries(freq);
  const totalUniqueWords = entries.length;
  let knownCount = 0;
  const unknownWords: VocabWord[] = [];

  for (const [word, { count, reading, pos }] of entries) {
    // Merge JLPT level words with personally known words
    const isKnown = baseKnown.has(word) || extraKnown.has(word);
    if (isKnown) {
      knownCount++;
    } else {
      unknownWords.push({
        word,
        reading,
        pos,
        frequency: count,
        jlpt: getWordLevel(word),
        known: false,
        meaning: (MEANINGS as Record<string, string>)[word],
      });
    }
  }

  // Sort unknown words by frequency desc (most useful to learn first)
  unknownWords.sort((a, b) => b.frequency - a.frequency);

  const comprehensionScore = totalUniqueWords === 0
    ? 0
    : Math.round((knownCount / totalUniqueWords) * 100);

  return {
    comprehensionScore,
    totalUniqueWords,
    knownWords: knownCount,
    unknownWords,
    userLevel,
  };
}

// Built once at module load. Iterate hardest to easiest so a word listed at
// several levels resolves to the easiest one, matching the old N5-first loop.
const WORD_LEVEL = new Map<string, JLPTLevel>();
for (const level of ['N1', 'N2', 'N3', 'N4', 'N5'] as JLPTLevel[]) {
  for (const word of JLPT_WORDS[level]) WORD_LEVEL.set(word, level);
}

export function getWordLevel(word: string): JLPTLevel | undefined {
  return WORD_LEVEL.get(word);
}
