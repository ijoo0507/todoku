'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { JLPTLevel } from '@/types';
import { useVocab } from '@/hooks/useVocab';

interface VocabEntry {
  word: string;
  reading: string;
  level: JLPTLevel;
}

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function VocabPage() {
  const [words, setWords] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<JLPTLevel | 'all'>('all');
  const [search, setSearch] = useState('');
  const [studyMode, setStudyMode] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const { knownSet, toggle } = useVocab();

  useEffect(() => {
    fetch('/api/vocab')
      .then(r => r.json())
      .then(data => { setWords(data); setLoading(false); });
  }, []);

  const filtered = words.filter(w => {
    if (activeLevel !== 'all' && w.level !== activeLevel) return false;
    if (search && !w.word.includes(search) && !w.reading.includes(search)) return false;
    return true;
  });

  const knownCount = words.filter(w => knownSet.has(w.word)).length;

  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Vocab Database</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {knownCount} / {words.length} words marked known
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setStudyMode(s => !s); setRevealed(new Set()); }}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                studyMode
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {studyMode ? '📖 study mode on' : '📖 study mode'}
            </button>
            <Link href="/" className="text-slate-500 hover:text-indigo-400 text-sm transition-colors">
              ← back
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6">
          <div
            className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: words.length ? `${(knownCount / words.length) * 100}%` : '0%' }}
          />
        </div>

        {/* Level tabs */}
        <div className="flex gap-1 bg-slate-800 p-1 rounded-xl mb-4 border border-slate-700 overflow-x-auto">
          {(['all', ...LEVELS] as const).map(l => (
            <button
              key={l}
              onClick={() => setActiveLevel(l)}
              className={`flex-1 min-w-[48px] py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeLevel === l
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {l === 'all' ? 'All' : l}
              {l !== 'all' && (
                <span className="ml-1 text-slate-500">
                  {words.filter(w => w.level === l && knownSet.has(w.word)).length}/
                  {words.filter(w => w.level === l).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search words or readings..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 mb-4"
        />

        {/* Word grid */}
        {loading ? (
          <div className="text-center text-slate-500 py-16 text-sm animate-pulse">Loading vocabulary...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filtered.map(w => {
              const known = knownSet.has(w.word);
              const isRevealed = revealed.has(w.word);
              const showReading = !studyMode || isRevealed;

              return (
                <button
                  key={w.word}
                  onClick={() => {
                    if (studyMode && !isRevealed) {
                      // first tap reveals reading
                      setRevealed(prev => new Set([...prev, w.word]));
                    } else {
                      toggle(w.word);
                    }
                  }}
                  className={`rounded-xl p-3 text-left transition-all border ${
                    known
                      ? 'bg-green-900/30 border-green-700/50 hover:bg-green-900/50'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <div className={`text-lg font-medium mb-0.5 ${known ? 'text-green-300' : 'text-white'}`}>
                    {w.word}
                  </div>
                  <div className="text-xs h-4">
                    {showReading
                      ? <span className="text-slate-500">{w.reading}</span>
                      : <span className="text-slate-700">tap to reveal</span>
                    }
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${levelColor(w.level)}`}>{w.level}</span>
                    {known && <span className="text-green-400 text-xs">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center text-slate-500 py-16 text-sm">No words match</div>
        )}
      </div>
    </main>
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
