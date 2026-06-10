'use client';

import { AnalysisResult } from '@/types';

interface Props {
  result: AnalysisResult;
  extraKnownCount?: number; // words user marked known after analysis
}

export default function ComprehensionScore({ result, extraKnownCount = 0 }: Props) {
  const { totalUniqueWords, unknownWords } = result;
  const knownWords = result.knownWords + extraKnownCount;
  const comprehensionScore = totalUniqueWords === 0 ? 0 : Math.min(100, Math.round((knownWords / totalUniqueWords) * 100));

  const color =
    comprehensionScore >= 90 ? '#22c55e' :
    comprehensionScore >= 75 ? '#3b82f6' :
    comprehensionScore >= 60 ? '#f59e0b' :
    '#ef4444';

  const label =
    comprehensionScore >= 90 ? 'Almost fluent 🎉' :
    comprehensionScore >= 75 ? 'Good! Getting there' :
    comprehensionScore >= 60 ? 'Intermediate — keep studying' :
    'Challenging — lots to learn';

  // SVG donut chart
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (comprehensionScore / 100) * circ;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-4">
        <div className="flex items-center gap-6">
          {/* Donut */}
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="12" />
            <circle
              cx="60" cy="60" r={r}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={circ / 4}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
            <text x="60" y="56" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
              {comprehensionScore}%
            </text>
            <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="9">
              comprehension
            </text>
          </svg>

          {/* Stats */}
          <div className="flex-1">
            <div className="text-white font-semibold text-lg mb-1">{label}</div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <Stat value={totalUniqueWords} label="unique words" />
              <Stat value={knownWords} label="you know" color="text-green-400" />
              <Stat value={unknownWords.length} label="to study" color="text-amber-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, color = 'text-white' }: { value: number; label: string; color?: string }) {
  return (
    <div className="bg-slate-900 rounded-lg p-2 text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-slate-500 text-xs">{label}</div>
    </div>
  );
}
