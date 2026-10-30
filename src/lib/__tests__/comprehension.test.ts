import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Token } from '../tokenizer';

// No kuromoji in unit tests: the tokenizer is mocked per test
const tokenizeText = vi.fn<(text: string) => Promise<Token[]>>();
vi.mock('../tokenizer', () => ({ tokenizeText: (text: string) => tokenizeText(text) }));
vi.mock('@/data/meanings.json', () => ({ default: { '概括': 'summary, generalization' } }));

const { analyzeText, buildFrequency, scoreFrequency, getWordLevel } = await import('../comprehension');

const tok = (basicForm: string, pos = '名詞'): Token => ({
  surface: basicForm,
  reading: `${basicForm}-reading`,
  basicForm,
  pos,
  posDetail: '',
});

describe('buildFrequency', () => {
  it('counts each dictionary form once per occurrence', () => {
    const freq = buildFrequency([tok('食べる', '動詞'), tok('猫'), tok('食べる', '動詞')]);
    expect(Object.keys(freq)).toHaveLength(2);
    expect(freq['食べる']).toEqual({ count: 2, reading: '食べる-reading', pos: '動詞' });
    expect(freq['猫'].count).toBe(1);
  });

  it('returns an empty map for no tokens', () => {
    expect(buildFrequency([])).toEqual({});
  });
});

describe('scoreFrequency', () => {
  const freq = buildFrequency([
    tok('食べる'), // N5
    tok('影響する'), tok('影響する'), // N3
    tok('概括'), tok('概括'), tok('概括'), // N1
  ]);

  it('scores known / unique as a rounded percentage', () => {
    const r = scoreFrequency(freq, 'N5');
    expect(r.totalUniqueWords).toBe(3);
    expect(r.knownWords).toBe(1);
    expect(r.comprehensionScore).toBe(33);
  });

  it('knows more words at a higher level (cumulative levels)', () => {
    const r = scoreFrequency(freq, 'N3');
    expect(r.knownWords).toBe(2);
    expect(r.comprehensionScore).toBe(67);
    expect(r.userLevel).toBe('N3');
  });

  it('merges personally known words on top of the level', () => {
    const r = scoreFrequency(freq, 'N5', new Set(['概括']));
    expect(r.knownWords).toBe(2);
    expect(r.unknownWords.map(w => w.word)).toEqual(['影響する']);
  });

  it('sorts unknown words by frequency, most frequent first', () => {
    const r = scoreFrequency(freq, 'N5');
    expect(r.unknownWords.map(w => w.word)).toEqual(['概括', '影響する']);
    expect(r.unknownWords[0].frequency).toBe(3);
  });

  it('annotates unknown words with JLPT level and local meaning', () => {
    const [first, second] = scoreFrequency(freq, 'N5').unknownWords;
    expect(first).toMatchObject({ jlpt: 'N1', known: false, meaning: 'summary, generalization' });
    expect(second.jlpt).toBe('N3');
    expect(second.meaning).toBeUndefined();
  });

  it('scores empty input as 0 without dividing by zero', () => {
    const r = scoreFrequency({}, 'N1');
    expect(r).toMatchObject({ comprehensionScore: 0, totalUniqueWords: 0, knownWords: 0, unknownWords: [] });
  });

  it('does not mutate the shared frequency map (safe for the cache)', () => {
    const before = JSON.stringify(freq);
    scoreFrequency(freq, 'N1', new Set(['食べる']));
    expect(JSON.stringify(freq)).toBe(before);
  });
});

describe('analyzeText', () => {
  beforeEach(() => tokenizeText.mockReset());

  it('tokenizes then scores', async () => {
    tokenizeText.mockResolvedValue([tok('食べる'), tok('概括')]);
    const r = await analyzeText('食べる概括', 'N5');
    expect(tokenizeText).toHaveBeenCalledWith('食べる概括');
    expect(r.comprehensionScore).toBe(50);
  });
});

describe('getWordLevel', () => {
  it.each([
    ['食べる', 'N5'],
    ['運動する', 'N4'],
    ['影響する', 'N3'],
    ['概念化する', 'N2'],
    ['演繹', 'N1'],
  ])('%s is %s', (word, level) => {
    expect(getWordLevel(word)).toBe(level);
  });

  it('resolves words listed at several levels to the easiest one', () => {
    // 複雑 appears in N4, N3 and N2
    expect(getWordLevel('複雑')).toBe('N4');
  });

  it('returns undefined for words outside the lists', () => {
    expect(getWordLevel('ホゲホゲ')).toBeUndefined();
  });
});
