'use client';

import { useState } from 'react';
import { VocabWord, JLPTLevel } from '@/types';

interface Props {
  words: VocabWord[];
  selected: Set<string>;
  onToggle: (word: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMarkKnown?: (word: string) => void;
  markedKnown?: Set<string>;
  userLevel?: JLPTLevel;
}

const LEVELS: (JLPTLevel | 'all' | 'other')[] = ['all', 'N5', 'N4', 'N3', 'N2', 'N1', 'other'];

export default function VocabTable({
  words, selected, onToggle, onSelectAll, onDeselectAll,
  onMarkKnown, markedKnown, userLevel,
}: Props) {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<JLPTLevel | 'all' | 'other'>('all');
  const [showMeanings, setShowMeanings] = useState(true);
  const [showReadings, setShowReadings] = useState(true);

  const filtered = words.filter(w => {
    if (markedKnown?.has(w.word)) return false; // hide known words from list
    if (search && !w.word.includes(search) && !w.reading.includes(search) &&
        !(w.meaning?.toLowerCase().includes(search.toLowerCase()))) return false;
    if (levelFilter === 'all') return true;
    if (levelFilter === 'other') return !w.jlpt;
    return w.jlpt === levelFilter;
  });

  // Count per level for pill badges
  const counts = words.reduce<Record<string, number>>((acc, w) => {
    if (markedKnown?.has(w.word)) return acc;
    const key = w.jlpt ?? 'other';
    acc[key] = (acc[key] ?? 0) + 1;
    acc.all = (acc.all ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Level filter pills */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {LEVELS.map(l => {
          const count = counts[l === 'all' ? 'all' : l] ?? 0;
          if (l !== 'all' && count === 0) return null;
          return (
            <button
              key={l}
              onClick={() => setLevelFilter(l as typeof levelFilter)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                levelFilter === l
                  ? pillActiveColor(l)
                  : 'bg-slate-700/50 text-slate-400 hover:text-white border border-slate-600'
              }`}
            >
              {l === 'all' ? `All (${count})` : l === 'other' ? `Other (${count})` : `${l} (${count})`}
            </button>
          );
        })}
        <div className="flex-1" />
        <button onClick={onSelectAll} className="text-xs text-indigo-400 hover:text-indigo-300">select all</button>
        <span className="text-slate-600">·</span>
        <button onClick={onDeselectAll} className="text-xs text-slate-400 hover:text-white">none</button>
      </div>

      {/* Search + toggles */}
      <div className="flex gap-2 mb-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => setShowReadings(p => !p)}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${showReadings ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
          title="Toggle readings"
        >
          reading
        </button>
        <button
          onClick={() => setShowMeanings(p => !p)}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${showMeanings ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
          title="Toggle meanings"
        >
          meaning
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[20px_1fr_48px_32px] gap-3 px-4 py-2 text-xs text-slate-500 border-b border-slate-700 font-medium">
          <span></span>
          <span>word{showReadings ? ' · reading' : ''}{showMeanings ? ' · meaning' : ''}</span>
          <span>level</span>
          <span></span>
        </div>

        {/* Rows */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-700/50">
          {filtered.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-8">
              {levelFilter !== 'all' ? `No ${levelFilter} words` : 'No words match'}
            </div>
          ) : (
            filtered.map(w => (
              <div
                key={w.word}
                className="grid grid-cols-[20px_1fr_48px_32px] gap-3 px-4 py-3 items-center hover:bg-slate-700/30 transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={selected.has(w.word)}
                  onChange={() => onToggle(w.word)}
                  className="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-white text-sm font-medium">{w.word}</span>
                  {showReadings && w.reading !== w.word && (
                    <span className="text-slate-500 text-xs ml-1.5">{w.reading}</span>
                  )}
                  <span className="text-slate-600 text-xs ml-1.5">{w.frequency}×</span>
                  {showMeanings && w.meaning && (
                    <span className="text-slate-400 text-xs ml-2 italic">{w.meaning}</span>
                  )}
                  {showMeanings && !w.meaning && (
                    <span className="text-slate-700 text-xs ml-2">—</span>
                  )}
                </div>
                <div>
                  {w.jlpt ? (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${levelColor(w.jlpt)}`}>{w.jlpt}</span>
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
                </div>
                <div>
                  {onMarkKnown && (
                    <button
                      onClick={() => onMarkKnown(w.word)}
                      title="I know this word"
                      className="text-slate-600 hover:text-green-400 transition-colors text-xs opacity-0 group-hover:opacity-100"
                    >
                      ✓
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="text-slate-500 text-xs mt-2 flex items-center justify-between">
        <span>{selected.size} word{selected.size !== 1 ? 's' : ''} selected for Anki export</span>
        {(markedKnown?.size ?? 0) > 0 && (
          <span className="text-green-600">{markedKnown!.size} marked known this session</span>
        )}
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

function pillActiveColor(level: string) {
  const map: Record<string, string> = {
    all:   'bg-slate-600 text-white border border-slate-500',
    N5:    'bg-green-800 text-green-200 border border-green-700',
    N4:    'bg-blue-800 text-blue-200 border border-blue-700',
    N3:    'bg-yellow-800 text-yellow-200 border border-yellow-700',
    N2:    'bg-orange-800 text-orange-200 border border-orange-700',
    N1:    'bg-red-800 text-red-200 border border-red-700',
    other: 'bg-slate-600 text-white border border-slate-500',
  };
  return map[level] ?? 'bg-slate-600 text-white border border-slate-500';
}
