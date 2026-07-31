import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle, Sparkles, CheckCircle2, ArrowRight, Target, UserCheck, Flame, Skull, HeartHandshake } from 'lucide-react';
import { PERSONALITIES } from '../../lib/prompts';
import type { RoastApiResponse } from '../../types';

const POPULAR_ROLES = [
  'Senior Frontend Engineer',
  'Full-Stack Developer',
  'Product Manager',
  'Data Scientist',
  'DevOps Engineer',
  'UX/UI Designer',
];

export function FileDropzone() {
  const [targetRole, setTargetRole] = useState<string>('');
  const [personalityId, setPersonalityId] = useState<string>('tech-recruiter');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (selectedFile: File): boolean => {
    setError(null);
    const validExtensions = ['.pdf', '.docx'];
    const fileName = selectedFile.name.toLowerCase();
    const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExtension) {
      setError('Please select a valid PDF (.pdf) or Word document (.docx).');
      return false;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit. Please upload a smaller document.');
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload your resume file first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setLoadingStep('Extracting resume text & checking structure...');
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', targetRole);
      formData.append('personalityId', personalityId);

      setTimeout(() => {
        setLoadingStep('Evaluating experience against target role...');
      }, 1500);

      setTimeout(() => {
        setLoadingStep('Calculating estimated ATS compatibility score...');
      }, 3500);

      setTimeout(() => {
        setLoadingStep('Writing witty & constructive roast analysis...');
      }, 5500);

      const res = await fetch('/api/roast', {
        method: 'POST',
        body: formData,
      });

      const data: RoastApiResponse = await res.json();

      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.error || 'Failed to analyze resume. Please try again.');
      }

      // Save to sessionStorage and navigate to result page
      sessionStorage.setItem('resume_roast_data', JSON.stringify(data.data));
      window.location.href = '/result';
    } catch (err: any) {
      setError(err?.message || 'An error occurred during roast generation.');
      setLoading(false);
    }
  };

  const getPersonalityIcon = (id: string) => {
    switch (id) {
      case 'tech-recruiter':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'brutal-tech-lead':
        return <Skull className="w-4 h-4 text-purple-500" />;
      case 'friendly-mentor':
        return <HeartHandshake className="w-4 h-4 text-emerald-500" />;
      default:
        return <UserCheck className="w-4 h-4 text-neutral-700" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* 1. Target Job Role Input Card */}
      <div className="vercel-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-sm text-neutral-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            Target Job Role
          </label>
          <span className="text-xs text-neutral-400 font-mono">Recommended</span>
        </div>

        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Senior Frontend Engineer, Product Manager..."
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
          disabled={loading}
        />

        {/* Quick Suggestion Pills */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-neutral-400 font-mono">Quick select:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {POPULAR_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setTargetRole(role)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  targetRole === role
                    ? 'border-neutral-900 bg-neutral-900 text-white font-medium shadow-xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100'
                }`}
                disabled={loading}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Recruiter Persona Selector Card */}
      <div className="vercel-card p-6 space-y-4 shadow-sm">
        <label className="font-semibold text-sm text-neutral-900 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-purple-600" />
          Select AI Recruiter Personality
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PERSONALITIES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPersonalityId(p.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                personalityId === p.id
                  ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10 shadow-xs'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
              }`}
              disabled={loading}
            >
              <div className="flex items-center gap-2 font-semibold text-xs text-neutral-900">
                {getPersonalityIcon(p.id)}
                {p.name}
              </div>
              <div className="text-[11px] text-neutral-500 leading-normal mt-1.5">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Drag & Drop File Upload Area */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`relative vercel-card p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 border-2 border-dashed ${
            dragActive
              ? 'border-neutral-900 bg-neutral-50 shadow-md scale-[1.01]'
              : file
              ? 'border-emerald-500/60 bg-emerald-50/20'
              : 'border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />

          {!file ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-200 mx-auto flex items-center justify-center text-neutral-900 shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-sm text-neutral-900">
                  Click to upload or drag & drop your resume
                </p>
                <p className="text-xs text-neutral-500 font-mono">Supports PDF & DOCX (Max 5MB)</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-sm text-neutral-900 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {file.name}
                </p>
                <p className="text-xs text-neutral-500 font-mono">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="text-xs text-red-600 underline font-medium hover:text-red-700 pt-1"
                disabled={loading}
              >
                Change File
              </button>
            </div>
          )}
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-start gap-2.5 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Upload Issue</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Action Button / Loading State */}
        {!loading ? (
          <button
            type="submit"
            disabled={!file}
            className={`w-full py-4 px-6 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
              file
                ? 'bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer hover:scale-[1.01]'
                : 'bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Roast My Resume Now
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="vercel-card p-8 text-center space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-full border-3 border-neutral-900 border-t-transparent animate-spin mx-auto"></div>
            <div className="space-y-1">
              <p className="font-bold text-sm text-neutral-900">{loadingStep}</p>
              <p className="text-xs text-neutral-500 font-mono">
                AI engine is evaluating ATS structure & generating roasts...
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
