import React, { useEffect, useState } from 'react';
import { ScoreGauge } from './ScoreGauge';
import { RoastCard } from './RoastCard';
import { AnalysisTabs } from './AnalysisTabs';
import { VoiceRoastWidget } from '../vapi/VoiceRoastWidget';
import { Upload, ArrowLeft, RefreshCw } from 'lucide-react';
import type { ResumeAnalysis } from '../../types';

export function ResultDashboard() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('resume_roast_data');
      if (stored) {
        setAnalysis(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load roast analysis from sessionStorage:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-neutral-500 font-mono">Loading your resume roast dashboard...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-neutral-50 border border-neutral-200 mx-auto flex items-center justify-center text-neutral-900 shadow-xs">
          <Upload className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-neutral-900">No Resume Analysis Found</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            You haven't uploaded a resume yet or your session has expired. Please upload a resume to view your roast.
          </p>
        </div>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white font-medium text-xs hover:bg-neutral-800 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Upload & Roast Resume
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button & Header Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200/80 pb-4">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Upload
        </a>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-neutral-700 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-full">
            Target Role: <strong className="text-neutral-900 font-sans">{analysis.targetRole || 'General Role'}</strong>
          </span>
          <button
            type="button"
            onClick={() => (window.location.href = '/')}
            className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 font-mono"
          >
            <RefreshCw className="w-3 h-3" />
            New Roast
          </button>
        </div>
      </div>

      {/* 1. TOP FEATURED: Interactive VAPI Voice & Chat Lounge */}
      <section className="w-full">
        <VoiceRoastWidget analysis={analysis} />
      </section>

      {/* 2. Overall & ATS Score Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ScoreGauge
          score={analysis.resumeScore}
          label="Overall Resume Impact"
          sublabel="Based on metrics, STAR structure & role alignment"
        />
        <ScoreGauge
          score={analysis.atsScore}
          label="Estimated ATS Score"
          sublabel="Structural formatting & keyword compatibility"
          isAts={true}
        />
      </div>

      {/* 3. The Official Roast Card */}
      <RoastCard
        roast={analysis.roast}
        verdict={analysis.verdict}
        targetRole={analysis.targetRole}
      />

      {/* 4. Structured Analysis Tabs */}
      <AnalysisTabs analysis={analysis} />
    </div>
  );
}
