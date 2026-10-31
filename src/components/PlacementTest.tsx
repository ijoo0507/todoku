'use client';

import { useState, useEffect } from 'react';
import { PlacementWord, JLPTLevel } from '@/types';
import { track } from '@/lib/analytics';

interface Props {
  onComplete: (level: JLPTLevel) => void;
}

export default function PlacementTest({ onComplete }: Props) {
  const [words, setWords] = useState<PlacementWord[]>([]);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [readingRevealed, setReadingRevealed] = useState(false);

  useEffect(() => {
    fetch('/api/placement')
      .then(r => r.json())
      .then(data => { setWords(data); setLoading(false); });
  }, []);

  const answer = (known: boolean) => {
    const word = words[current].word;
    const newAnswers = { ...answers, [word]: known };
    setAnswers(newAnswers);
    setReadingRevealed(false); // hide reading for next word

    if (current + 1 >= words.length) {
      submitAnswers(newAnswers);
    } else {
      setCurrent(c => c + 1);
    }
  };

  const submitAnswers = async (finalAnswers: Record<string, boolean>) => {
    setSubmitting(true);
    const res = await fetch('/api/placement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: finalAnswers }),
    });
    const { level } = await res.json();
    track('placement_complete', { estimatedLevel: level });
    onComplete(level);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-slate-400 text-sm">Loading...</div>
    </div>
  );

  if (submitting) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <div className="text-4xl animate-spin">⟳</div>
      <div className="text-slate-400 text-sm">Calculating your level...</div>
    </div>
  );

  const word = words[current];
  const progress = Math.round(((current) / words.length) * 100);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Todoku" className="w-28 h-28 mx-auto mb-3 rounded-2xl" />
          <p className="text-slate-400 text-sm">Quick placement test · {words.length} words</p>
        </div>

        {/* Manual level picker */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <p className="text-slate-400 text-xs text-center mb-3">Already know your level? Skip the test:</p>
          <div className="flex gap-2 justify-center">
            {(['N5','N4','N3','N2','N1'] as JLPTLevel[]).map(l => (
              <button
                key={l}
                onClick={() => onComplete(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 ${levelColor(l)}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-1 mb-8">
          <div
            className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Word card */}
        <div className="bg-slate-800 rounded-2xl p-8 text-center mb-6 border border-slate-700">
          {/* Reading — hidden by default, tap to reveal */}
          <button
            onClick={() => setReadingRevealed(r => !r)}
            className="text-xs mb-1 h-4 transition-all"
          >
            {readingRevealed
              ? <span className="text-slate-400">{word.reading}</span>
              : <span className="text-slate-700 hover:text-slate-500">tap to reveal reading</span>
            }
          </button>
          <div className="text-5xl font-bold text-white mb-3">{word.word}</div>
          <div className="mt-3">
            <span className={`text-xs px-2 py-0.5 rounded-full ${levelColor(word.level)}`}>
              {word.level}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => answer(false)}
            className="py-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium hover:bg-slate-700 hover:border-slate-600 transition-all"
          >
            知らない
            <div className="text-xs text-slate-500 mt-0.5">don&apos;t know</div>
          </button>
          <button
            onClick={() => answer(true)}
            className="py-4 rounded-xl bg-indigo-600 border border-indigo-500 text-white font-medium hover:bg-indigo-500 transition-all"
          >
            知ってる
            <div className="text-xs text-indigo-300 mt-0.5">I know this</div>
          </button>
        </div>

        <div className="text-center mt-4 text-slate-500 text-xs">
          {current + 1} / {words.length}
        </div>
      </div>
    </div>
  );
}

function levelColor(level: string) {
  const map: Record<string, string> = {
    N5: 'bg-green-900 text-green-300',
    N4: 'bg-blue-900 text-blue-300',
    N3: 'bg-yellow-900 text-yellow-300',
    N2: 'bg-orange-900 text-orange-300',
    N1: 'bg-red-900 text-red-300',
  };
  return map[level] ?? 'bg-slate-700 text-slate-300';
}
