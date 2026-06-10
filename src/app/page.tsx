'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { JLPTLevel, AnalysisResult, VocabWord } from '@/types';
import { useVocab } from '@/hooks/useVocab';
import PlacementTest from '@/components/PlacementTest';
import InputSection from '@/components/InputSection';
import ComprehensionScore from '@/components/ComprehensionScore';
import VocabTable from '@/components/VocabTable';
import AuthButton from '@/components/AuthButton';

type Screen = 'placement' | 'input' | 'results';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('placement');
  const [userLevel, setUserLevel] = useState<JLPTLevel>('N4');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sessionKnown, setSessionKnown] = useState<Set<string>>(new Set()); // words marked known this session
  const [exporting, setExporting] = useState(false);
  const { knownSet, markKnown } = useVocab();

  useEffect(() => {
    const saved = localStorage.getItem('todoku-level') as JLPTLevel | null;
    if (saved) {
      setUserLevel(saved);
      setScreen('input');
    }
  }, []);

  const handlePlacementComplete = (level: JLPTLevel) => {
    setUserLevel(level);
    localStorage.setItem('todoku-level', level);
    setScreen('input');
  };

  const handleResult = (res: AnalysisResult) => {
    setResult(res);
    setSessionKnown(new Set());
    // Pre-select unknown words that aren't already in personal vocab
    setSelected(new Set(res.unknownWords.filter(w => !knownSet.has(w.word)).map(w => w.word)));
    setScreen('results');
  };

  const handleLevelChange = (level: JLPTLevel) => {
    setUserLevel(level);
    localStorage.setItem('todoku-level', level);
  };

  const toggleWord = (word: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  };

  const handleMarkKnown = (word: string) => {
    markKnown(word); // persist to localStorage
    setSessionKnown(prev => new Set([...prev, word]));
    setSelected(prev => { const n = new Set(prev); n.delete(word); return n; });
  };

  const handleExport = async () => {
    if (!result || selected.size === 0) return;
    setExporting(true);
    const words: VocabWord[] = result.unknownWords.filter(w => selected.has(w.word) && !sessionKnown.has(w.word));
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todoku-anki.txt';
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  // Send personal known words with each analysis request
  const handleAnalyze = (res: AnalysisResult) => handleResult(res);

  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4">
      {/* Nav */}
      {screen !== 'placement' && (
        <div className="flex justify-between items-center max-w-2xl mx-auto mb-6">
          <Link href="/vocab" className="text-slate-500 hover:text-indigo-400 text-sm transition-colors">
            vocab database →
          </Link>
          <AuthButton />
        </div>
      )}

      {screen === 'placement' && (
        <PlacementTest onComplete={handlePlacementComplete} />
      )}

      {screen === 'input' && (
        <div className="flex flex-col items-center">
          <InputSection
            userLevel={userLevel}
            onResult={handleAnalyze}
            onLevelChange={handleLevelChange}
            extraKnownWords={knownSet}
          />
          <button
            onClick={() => { localStorage.removeItem('todoku-level'); setScreen('placement'); }}
            className="mt-6 text-slate-600 hover:text-slate-400 text-xs"
          >
            Retake placement test
          </button>
        </div>
      )}

      {screen === 'results' && result && (
        <div className="flex flex-col items-center gap-4">
          <ComprehensionScore result={result} extraKnownCount={sessionKnown.size} />
          <VocabTable
            words={result.unknownWords}
            selected={selected}
            onToggle={toggleWord}
            onSelectAll={() => setSelected(new Set(result.unknownWords.filter(w => !sessionKnown.has(w.word)).map(w => w.word)))}
            onDeselectAll={() => setSelected(new Set())}
            onMarkKnown={handleMarkKnown}
            markedKnown={sessionKnown}
          />
          <div className="w-full max-w-2xl flex gap-3">
            <button
              onClick={() => setScreen('input')}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-all"
            >
              ← Try another
            </button>
            <button
              onClick={handleExport}
              disabled={selected.size === 0 || exporting}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {exporting ? 'Exporting...' : `Export ${selected.size} cards to Anki`}
            </button>
          </div>
          <div className="text-slate-600 text-xs">
            In Anki: File → Import → select the .txt file · fields separated by Tab
          </div>
        </div>
      )}
    </main>
  );
}
