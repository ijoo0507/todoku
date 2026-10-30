import { describe, it, expect } from 'vitest';
import { generateAnkiTSV } from '../anki';
import { VocabWord } from '@/types';

const word = (overrides: Partial<VocabWord> = {}): VocabWord => ({
  word: '食べる',
  reading: 'たべる',
  pos: '動詞',
  frequency: 1,
  jlpt: 'N5',
  known: false,
  ...overrides,
});

describe('generateAnkiTSV', () => {
  it('emits one row per word with front, back and tags columns', () => {
    const tsv = generateAnkiTSV([word(), word({ word: '猫', reading: 'ねこ', pos: '名詞' })]);
    const rows = tsv.split('\n');
    expect(rows).toHaveLength(2);
    for (const row of rows) expect(row.split('\t')).toHaveLength(3);
  });

  it('formats the back with reading, English POS label and JLPT level', () => {
    const [front, back, tags] = generateAnkiTSV([word({ jlpt: 'N3' })]).split('\t');
    expect(front).toBe('食べる');
    expect(back).toBe('たべる · verb · [N3]');
    expect(tags).toBe('todoku N3');
  });

  it('maps known POS tags and passes unknown ones through', () => {
    const labels = ['名詞', '形容詞', '副詞', '形容動詞', '連体詞'].map(
      pos => generateAnkiTSV([word({ pos, jlpt: undefined })]).split('\t')[1]
    );
    expect(labels).toEqual(['たべる · noun', 'たべる · adj', 'たべる · adv', 'たべる · na-adj', 'たべる · 連体詞']);
  });

  it('tags words without a level as unknown', () => {
    expect(generateAnkiTSV([word({ jlpt: undefined })]).split('\t')[2]).toBe('todoku unknown');
  });

  it('strips tabs and newlines so a row cannot be split', () => {
    const tsv = generateAnkiTSV([word({ word: '食\tべ\nる', reading: 'た\tべ\r\nる' })]);
    expect(tsv.split('\n')).toHaveLength(1);
    expect(tsv.split('\t')).toHaveLength(3);
    expect(tsv.startsWith('食べる\tたべる')).toBe(true);
  });

  it('caps the deck at 500 cards', () => {
    const many = Array.from({ length: 600 }, (_, i) => word({ word: `語${i}` }));
    expect(generateAnkiTSV(many).split('\n')).toHaveLength(500);
  });

  it('returns an empty string for no words', () => {
    expect(generateAnkiTSV([])).toBe('');
  });
});
