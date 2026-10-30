'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { JLPTLevel, AnalysisResult, VocabWord } from '@/types';
import { useVocab } from '@/hooks/useVocab';
import PlacementTest from '@/components/PlacementTest';
import InputSection from '@/components/InputSection';
import ComprehensionScore from '@/components/ComprehensionScore';
import VocabTable from '@/components/VocabTable';
import AuthButton from '@/components/AuthButton';
import { track } from '@/lib/analytics';

type Screen = 'placement' | 'input' | 'results';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('placement');
  const [userLevel, setUserLevel] = useState<JLPTLevel>('N4');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sessionKnown, setSessionKnown] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [sharing, setSharing] = useState(false);
  const [toast, setToast] = useState('');
  const { knownSet, markKnown } = useVocab();

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('todoku-level') as JLPTLevel | null;
    if (saved) {
      // localStorage is only readable after hydration, so this runs in an effect
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserLevel(saved);
      setScreen('input');
    }
  }, []);

  const handlePlacementComplete = (level: JLPTLevel) => {
    setUserLevel(level);
    localStorage.setItem('todoku-level', level);
    setScreen('input');
  };

  const handleResult = (res: AnalysisResult, fileName?: string) => {
    setResult(res);
    // Prefill the share title from the subtitle file name, minus the extension
    setShareTitle(fileName ? fileName.replace(/\.[^.]+$/, '').slice(0, 100) : '');
    setSessionKnown(new Set());
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
    markKnown(word);
    setSessionKnown(prev => new Set([...prev, word]));
    setSelected(prev => { const n = new Set(prev); n.delete(word); return n; });
  };

  const handleExport = async () => {
    if (!result || selected.size === 0) return;
    setExporting(true);
    const words: VocabWord[] = result.unknownWords.filter(w => selected.has(w.word) && !sessionKnown.has(w.word));
    track('export_deck', { wordCount: words.length });
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

  const handleShare = async () => {
    if (!result || sharing) return;
    setSharing(true);
    try {
      // Share the score as displayed, including words marked known this session
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalUnique: result.totalUniqueWords,
          known: Math.min(result.totalUniqueWords, result.knownWords + sessionKnown.size),
          title: shareTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) throw new Error(data.error || 'Could not create share link');
      const url = `${window.location.origin}/s/${data.id}`;
      try {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard');
      } catch {
        showToast(url);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not create share link');
    } finally {
      setSharing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* Nav */}
      {screen !== 'placement' && (
        <div className="flex justify-between items-center max-w-2xl mx-auto mb-6">
          <div className="flex items-center gap-3">
            <img src="/icon.svg" alt="Todoku" className="w-10 h-10 rounded-xl" />
            <Link href="/vocab" className="text-slate-500 hover:text-indigo-400 text-sm transition-colors">vocab database</Link>
            <Link href="/about" className="text-slate-500 hover:text-indigo-400 text-sm transition-colors">about</Link>
            <Link href="/settings" className="text-slate-500 hover:text-indigo-400 text-sm transition-colors">settings</Link>
          </div>
          <div className="flex items-center gap-3">
            <AuthButton />
          </div>
        </div>
      )}

      {screen === 'placement' && (
        <PlacementTest onComplete={handlePlacementComplete} />
      )}

      {screen === 'input' && (
        <div className="flex flex-col items-center">
          <InputSection
            userLevel={userLevel}
            onResult={handleResult}
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
            userLevel={userLevel}
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
          <div className="w-full max-w-2xl flex gap-3">
            <input
              value={shareTitle}
              onChange={e => setShareTitle(e.target.value)}
              maxLength={100}
              placeholder="Title (optional), e.g. Frieren ep 1"
              className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleShare}
              disabled={sharing}
              className="shrink-0 px-5 py-3 rounded-xl border border-indigo-500 text-indigo-300 text-sm font-medium hover:bg-indigo-900/30 disabled:opacity-40 transition-all"
            >
              {sharing ? 'Sharing...' : 'Share result'}
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
