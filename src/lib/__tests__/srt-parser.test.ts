import { describe, it, expect } from 'vitest';
import { parseSRT } from '../srt-parser';

describe('parseSRT', () => {
  it('strips SRT indices and timestamps', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\nこんにちは\n\n2\n00:00:03,000 --> 00:00:04,000\n元気ですか\n';
    expect(parseSRT(srt)).toBe('こんにちは\n元気ですか');
  });

  it('keeps multi-line cues and strips HTML tags', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\n<i>行こう</i>\n<font color="red">早く</font>\n';
    expect(parseSRT(srt)).toBe('行こう\n早く');
  });

  it('removes a leading BOM', () => {
    const srt = '﻿1\n00:00:01,000 --> 00:00:02,000\n猫\n';
    expect(parseSRT(srt)).toBe('猫');
  });

  it('extracts ASS dialogue text, keeping commas and dropping override tags', () => {
    const ass = [
      '[Script Info]',
      'Title: test',
      '[Events]',
      'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
      'Dialogue: 0,0:00:01.00,0:00:02.00,Default,,0,0,0,,{\\an8}はい、そうです',
      'Dialogue: 0,0:00:03.00,0:00:04.00,Default,,0,0,0,,一行目\\N二行目',
      'Comment: 0,0:00:05.00,0:00:06.00,Default,,0,0,0,,無視',
    ].join('\n');
    expect(parseSRT(ass)).toBe('はい、そうです\n一行目 二行目');
  });

  it('skips malformed ASS dialogue lines', () => {
    expect(parseSRT('Dialogue: 0,short')).toBe('');
  });

  it('parses VTT, dropping the header, timestamps and cue numbers', () => {
    const vtt = 'WEBVTT\n\n1\n00:00:01.000 --> 00:00:02.000\n<v Speaker>おはよう</v>\n\n00:00:03.000 --> 00:00:04.000\nありがとう\n';
    expect(parseSRT(vtt)).toBe('おはよう\nありがとう');
  });

  it('returns an empty string for empty input', () => {
    expect(parseSRT('')).toBe('');
  });
});
