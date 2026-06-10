'use client';

import { useState } from 'react';
import { VocabWord } from '@/types';

interface Props {
  words: VocabWord[];
  selected: Set<string>;
  onToggle: (word: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMarkKnown?: (word: string) => void;
  markedKnown?: Set<string>;
}

export default function VocabTable({ words, selected, onToggle, onSelectAll, onDeselectAll, onMarkKnown, markedKnown }: Props) {
  const [filter, setFilter] = useState('');

  const filtered = words.filter(w =>
    !filter ||
    w.word.includes(filter) ||
    w.reading.includes(filter) ||
    (w.jlpt && w.jlpt.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3 gap-3">
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter words..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <div className="flex gap-2 shrink-0">
          <button onClick={onSelectAll} className="text-xs text-indigo-400 hover:text-indigo-300">all</button>
          <span className="text-slate-600">·</span>
          <button onClick={onDeselectAll} className="text-xs text-slate-400 hover:text-white">none</button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[24px_1fr_1fr_60px_48px_80px] gap-3 px-4 py-2 text-xs text-slate-500 border-b border-slate-700 font-medium">
          <span></span>
          <span>word</span>
          <span>reading</span>
          <span>freq</span>
          <span>level</span>
          <span></span>
        </div>

        {/* Rows */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/50">
          {filtered.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-8">No words match</div>
          ) : (
            filtered.map(w => {
              const isMarkedKnown = markedKnown?.has(w.word);
              return (
                <div
                  key={w.word}
                  className={`grid grid-cols-[24px_1fr_1fr_60px_48px_80px] gap-3 px-4 py-2.5 items-center hover:bg-slate-700/40 ${isMarkedKnown ? 'opacity-40' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(w.word) && !isMarkedKnown}
                    onChange={() => onToggle(w.word)}
                    disabled={isMarkedKnown}
                    className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className="text-white text-sm font-medium">{w.word}</span>
                  <span className="text-slate-400 text-sm">{w.reading}</span>
                  <span className="text-slate-500 text-xs">{w.frequency}×</span>
                  <span>
                    {w.jlpt ? (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${levelColor(w.jlpt)}`}>{w.jlpt}</span>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </span>
                  <span>
                    {isMarkedKnown ? (
                      <span className="text-green-400 text-xs">✓ known</span>
                    ) : onMarkKnown ? (
                      <button
                        onClick={() => onMarkKnown(w.word)}
                        className="text-xs text-slate-500 hover:text-green-400 transition-colors"
                      >
                        + know it
                      </button>
                    ) : null}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="text-slate-500 text-xs mt-2">
        {selected.size} word{selected.size !== 1 ? 's' : ''} selected for export
      </div>
    </div>
  );
}

function levelColor(level: string) {
  const map: Record<string, string> = {
    N5: 'bg-green-900/60 text-green-300',
    N4: 'bg-blue-900/60 text-blue-300',
    N3: 'bg-yellow-900/60 text-yellow-300',
    N2: 'bg-orange-900/60 text-orange-300',
    N1: 'bg-red-900/60 text-red-300',
  };
  return map[level] ?? 'bg-slate-700 text-slate-300';
}
