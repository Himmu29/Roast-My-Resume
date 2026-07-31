import React from 'react';
import { Flame, Quote, Target } from 'lucide-react';

interface RoastCardProps {
  roast: string;
  verdict: string;
  targetRole: string;
}

export function RoastCard({ roast, verdict, targetRole }: RoastCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 space-y-5 shadow-sm">
      {/* Vercel Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 text-orange-600 flex items-center justify-center shadow-xs">
            <Flame className="w-5 h-5 fill-orange-500" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-neutral-900">The Official AI Roast</h2>
            {targetRole && (
              <p className="text-xs text-neutral-500 flex items-center gap-1 font-mono mt-0.5">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                Target Role: <strong className="text-neutral-900 font-sans">{targetRole}</strong>
              </p>
            )}
          </div>
        </div>

        <span className="font-mono text-xs uppercase font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
          Verdict: {verdict}
        </span>
      </div>

      <div className="relative pl-6 py-2">
        <Quote className="absolute left-0 top-1 w-5 h-5 text-neutral-300 rotate-180" />
        <p className="text-base sm:text-lg font-medium text-neutral-900 leading-relaxed italic">
          "{roast}"
        </p>
      </div>

      <div className="text-[11px] text-neutral-400 font-mono flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
        <span>* Critique targets resume content constructively</span>
      </div>
    </div>
  );
}
