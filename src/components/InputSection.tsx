'use client';

import { useState, useRef } from 'react';
import { JLPTLevel, AnalysisResult } from '@/types';

interface Props {
  userLevel: JLPTLevel;
  onResult: (result: AnalysisResult) => void;
  onLevelChange: (level: JLPTLevel) => void;
  extraKnownWords?: Set<string>;
  onLimitReached?: () => void;
}

export default function InputSection({ userLevel, onResult, onLevelChange, extraKnownWords, onLimitReached }: Props) {
  const [tab, setTab] = useState<'anime' | 'lyrics'>('anime');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyze = async (formData: FormData) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      if (res.status === 429) {
        onLimitReached?.();
        return;
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file: File) => {
    const fd = new FormData();
    fd.append('mode', 'file');
    fd.append('file', file);
    fd.append('userLevel', userLevel);
    fd.append('extraKnownWords', JSON.stringify([...(extraKnownWords ?? [])]));
    analyze(fd);
  };

  const handleText = () => {
    if (!text.trim()) return;
    const fd = new FormData();
    fd.append('mode', 'text');
    fd.append('text', text);
    fd.append('userLevel', userLevel);
    fd.append('extraKnownWords', JSON.stringify([...(extraKnownWords ?? [])]));
    analyze(fd);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Level badge */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">届く</h1>
          <p className="text-slate-400 text-sm mt-0.5">How much can you understand?</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">your level:</span>
          <select
            value={userLevel}
            onChange={e => onLevelChange(e.target.value as JLPTLevel)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
          >
            {(['N5','N4','N3','N2','N1'] as JLPTLevel[]).map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 p-1 rounded-xl mb-4 border border-slate-700">
        {(['anime', 'lyrics'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t === 'anime' ? '📺  Anime (.srt / .ass)' : '🎵  J-Pop (paste lyrics)'}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'anime' ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-indigo-500 bg-indigo-900/20'
              : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".srt,.ass,.ssa,.vtt"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="text-3xl mb-3">📂</div>
          <div className="text-white font-medium mb-1">Drop subtitle file or click to upload</div>
          <div className="text-slate-400 text-sm">.srt · .ass · .vtt</div>
          <div className="mt-4 text-slate-500 text-xs">
            Find anime subtitles at{' '}
            <a
              href="https://kitsunekko.net"
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              kitsunekko.net
            </a>
          </div>
        </div>
      ) : (
        <div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste Japanese lyrics here..."
            rows={10}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500 font-[Noto_Sans_JP,sans-serif]"
          />
          <div className="text-slate-500 text-xs mt-1 mb-3">
            Find lyrics at{' '}
            <a href="https://genius.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">genius.com</a>
            {' '}or{' '}
            <a href="https://www.uta-net.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">uta-net.com</a>
          </div>
          <button
            onClick={handleText}
            disabled={!text.trim() || loading}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Analyze
          </button>
        </div>
      )}

      {loading && (
        <div className="mt-4 text-center text-slate-400 text-sm animate-pulse">
          Tokenizing Japanese... this takes a moment
        </div>
      )}
      {error && (
        <div className="mt-4 text-center text-red-400 text-sm">{error}</div>
      )}
    </div>
  );
}
