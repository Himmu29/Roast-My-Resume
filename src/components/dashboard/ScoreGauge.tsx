import React from 'react';
import { Info } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  label: string;
  sublabel: string;
  isAts?: boolean;
}

export function ScoreGauge({ score, label, sublabel, isAts = false }: ScoreGaugeProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 80) return 'stroke-emerald-500 text-emerald-600';
    if (val >= 60) return 'stroke-amber-500 text-amber-600';
    return 'stroke-red-500 text-red-600';
  };

  return (
    <div className="vercel-card p-6 flex flex-col items-center text-center space-y-4 relative group shadow-sm">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-neutral-100 fill-none"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`fill-none transition-all duration-1000 ease-out ${getScoreColor(score)}`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-mono tracking-tight text-neutral-900">{score}</span>
          <span className="text-[10px] text-neutral-400 font-mono uppercase font-semibold">/ 100</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="font-semibold text-sm text-neutral-900 flex items-center justify-center gap-1.5">
          {label}
          {isAts && (
            <div className="relative inline-block group/tooltip">
              <Info className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-900 cursor-pointer" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tooltip:block w-64 p-3 bg-neutral-900 text-white text-xs rounded-xl shadow-xl font-sans z-50 pointer-events-none text-left leading-normal">
                Estimated ATS compatibility score calculated from layout parsing readability, section headers, STAR bullet metrics, and role keywords.
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-neutral-500 max-w-xs">{sublabel}</p>
      </div>

      {isAts && (
        <span className="font-mono text-[10px] uppercase font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
          * Estimate based on best practices
        </span>
      )}
    </div>
  );
}
