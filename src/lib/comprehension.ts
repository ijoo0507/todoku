import { tokenizeText } from './tokenizer';
import { getKnownWords, JLPT_WORDS } from './jlpt-data';
import { JLPTLevel, VocabWord, AnalysisResult } from '@/types';

export async function analyzeText(
  text: string,
  userLevel: JLPTLevel,
  extraKnown: Set<string> = new Set()
): Promise<AnalysisResult> {
  const tokens = await tokenizeText(text);
  const baseKnown = getKnownWords(userLevel);
  // Merge JLPT level words with personally known words
  const knownWords = new Set([...baseKnown, ...extraKnown]);

  // Count frequency of each unique dictionary form
  const freq = new Map<string, { count: number; reading: string; pos: string }>();
  for (const token of tokens) {
    const key = token.basicForm;
    if (!freq.has(key)) {
      freq.set(key, { count: 0, reading: token.reading, pos: token.pos });
    }
    freq.get(key)!.count++;
  }

  const totalUniqueWords = freq.size;
  let knownCount = 0;
  const unknownWords: VocabWord[] = [];

  for (const [word, { count, reading, pos }] of freq) {
    const isKnown = knownWords.has(word);
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

function getWordLevel(word: string): JLPTLevel | undefined {
  const levels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
  for (const level of levels) {
    if (JLPT_WORDS[level].has(word)) return level;
  }
  return undefined;
}
