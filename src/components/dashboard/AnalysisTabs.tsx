import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Tag,
  FileCheck2,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import type { ResumeAnalysis } from '../../types';

interface AnalysisTabsProps {
  analysis: ResumeAnalysis;
}

export function AnalysisTabs({ analysis }: AnalysisTabsProps) {
  const [activeTab, setActiveTab] = useState<'strengths' | 'improvements' | 'keywords' | 'rewrite'>(
    'strengths'
  );
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(analysis.betterSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  return (
    <div className="vercel-card overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="flex border-b border-hairline bg-canvas-soft overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('strengths')}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'strengths'
              ? 'border-ink text-ink bg-canvas font-semibold'
              : 'border-transparent text-mute hover:text-ink'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Strengths & Weaknesses
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('improvements')}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'improvements'
              ? 'border-ink text-ink bg-canvas font-semibold'
              : 'border-transparent text-mute hover:text-ink'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Action Plan ({analysis.actionableImprovements.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('keywords')}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'keywords'
              ? 'border-ink text-ink bg-canvas font-semibold'
              : 'border-transparent text-mute hover:text-ink'
          }`}
        >
          <Tag className="w-4 h-4 text-vercel-blue" />
          Missing Keywords ({analysis.missingKeywords.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rewrite')}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'rewrite'
              ? 'border-ink text-ink bg-canvas font-semibold'
              : 'border-transparent text-mute hover:text-ink'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-vercel-violet" />
          Rewritten Summary & Bullets
        </button>
      </div>

      {/* Tab Content Panel */}
      <div className="p-6">
        {/* Tab 1: Strengths & Weaknesses */}
        {activeTab === 'strengths' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-ink flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Resume Strengths (Keep These)
              </h3>
              <div className="space-y-2">
                {analysis.strengths.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/30 text-xs text-ink flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-ink flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Areas to Fix
              </h3>
              <div className="space-y-2">
                {analysis.weaknesses.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-amber-100 bg-amber-50/30 text-xs text-ink flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Actionable Improvements */}
        {activeTab === 'improvements' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-ink flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Prioritized Action Steps
            </h3>
            <div className="space-y-3">
              {analysis.actionableImprovements.map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-hairline bg-canvas-soft text-xs text-ink flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-ink text-white font-mono flex items-center justify-center font-bold text-[11px] shrink-0">
                    {i + 1}
                  </span>
                  <div className="pt-0.5">
                    <p className="font-medium leading-relaxed">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Missing Keywords */}
        {activeTab === 'keywords' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-ink flex items-center gap-2">
                <Tag className="w-4 h-4 text-vercel-blue" />
                Keywords Missing for "{analysis.targetRole || 'Target Role'}"
              </h3>
              <span className="text-xs text-mute font-mono">Include these naturally in your skills section</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {analysis.missingKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="badge-mono bg-canvas-soft border border-hairline hover:border-hairline-strong text-ink text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-vercel-blue"></span>
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Rewritten Summary & Bullets */}
        {activeTab === 'rewrite' && (
          <div className="space-y-6">
            {/* Rewritten Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-ink">Optimized Resume Summary</h3>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1 text-xs font-mono text-mute hover:text-ink transition-colors"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Text
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 rounded-xl border border-hairline bg-canvas-soft text-xs text-ink leading-relaxed font-sans">
                {analysis.betterSummary}
              </div>
            </div>

            {/* Bullet Point Rewrites */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-ink">Bullet Point Improvements (STAR Format)</h3>
              <div className="space-y-4">
                {analysis.betterBulletPoints.map((bp, i) => (
                  <div key={i} className="p-4 rounded-xl border border-hairline space-y-3 bg-canvas">
                    <div className="space-y-1">
                      <span className="text-[10px] text-red-600 font-mono font-semibold uppercase">
                        Before (Weak phrasing):
                      </span>
                      <p className="text-xs text-mute line-through">{bp.original}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-hairline">
                      <div className="space-y-1">
                        <span className="text-[10px] text-emerald-600 font-mono font-semibold uppercase flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          After (High impact):
                        </span>
                        <p className="text-xs font-medium text-ink">{bp.improved}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyBullet(bp.improved, i)}
                        className="shrink-0 p-2 rounded-lg border border-hairline hover:bg-canvas-soft text-mute hover:text-ink transition-colors"
                        title="Copy bullet point"
                      >
                        {copiedBulletIdx === i ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
