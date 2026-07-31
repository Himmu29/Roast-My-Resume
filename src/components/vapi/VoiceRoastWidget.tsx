import React, { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { Mic, Radio, Sparkles, AlertCircle, HelpCircle, PhoneCall, MessageSquareText } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { VoiceControls } from './VoiceControls';
import { buildVapiAssistantConfig } from '../../lib/prompts';
import type { ResumeAnalysis } from '../../types';

interface VoiceRoastWidgetProps {
  analysis: ResumeAnalysis;
}

export function VoiceRoastWidget({ analysis }: VoiceRoastWidgetProps) {
  const [vapi, setVapi] = useState<any | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended'>('idle');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string>('d7be711a-6328-45f3-85a5-dfb07c856a67');
  const [assistantId, setAssistantId] = useState<string>('2ca26d7b-2466-433f-8201-8a9d2df26d1d');
  const [showKeyPrompt, setShowKeyPrompt] = useState<boolean>(false);
  const [transcripts, setTranscripts] = useState<Array<{ role: string; text: string }>>([]);

  useEffect(() => {
    // Check for VAPI Public Key & Assistant ID in env or localStorage with defaults
    const envKey =
      (import.meta as any).env?.PUBLIC_VAPI_API_KEY ||
      (typeof window !== 'undefined' ? localStorage.getItem('vapi_public_key') : '') ||
      'd7be711a-6328-45f3-85a5-dfb07c856a67';

    const envAssistantId =
      (import.meta as any).env?.PUBLIC_VAPI_ASSISTANT_ID ||
      (typeof window !== 'undefined' ? localStorage.getItem('vapi_assistant_id') : '') ||
      '2ca26d7b-2466-433f-8201-8a9d2df26d1d';

    if (envKey) {
      setPublicKey(envKey);
    }
    if (envAssistantId) {
      setAssistantId(envAssistantId);
    }
  }, []);

  const initAndStartCall = async (apiKeyToUse: string, assistantIdToUse?: string) => {
    try {
      setCallStatus('connecting');
      setErrorMessage(null);

      // Safe module constructor resolution for CJS / ESM bundlers
      const VapiConstructor = typeof Vapi === 'function' ? Vapi : (Vapi as any)?.default || Vapi;
      if (typeof VapiConstructor !== 'function') {
        throw new Error('VAPI Web SDK could not be initialized as a constructor.');
      }

      const activeApiKey = apiKeyToUse || 'd7be711a-6328-45f3-85a5-dfb07c856a67';
      const vapiInstance = new VapiConstructor(activeApiKey);
      setVapi(vapiInstance);

      vapiInstance.on('call-start', () => {
        setCallStatus('connected');
      });

      vapiInstance.on('call-end', () => {
        setCallStatus('ended');
        setIsSpeaking(false);
      });

      vapiInstance.on('speech-start', () => {
        setIsSpeaking(true);
      });

      vapiInstance.on('speech-end', () => {
        setIsSpeaking(false);
      });

      vapiInstance.on('message', (msg: any) => {
        if (msg?.type === 'transcript' && msg?.transcript) {
          setTranscripts((prev) => [
            ...prev,
            { role: msg.role || 'assistant', text: msg.transcript },
          ]);
        }
      });

      vapiInstance.on('error', (e: any) => {
        console.error('VAPI Detailed Error:', e);
        const detailedMsg = typeof e === 'string' ? e : e?.message || e?.error?.message || JSON.stringify(e);
        setErrorMessage(`VAPI Voice Error: ${detailedMsg}. Make sure your browser has microphone permission enabled.`);
        setCallStatus('idle');
      });

      const activeAssistantId = assistantIdToUse || assistantId || '2ca26d7b-2466-433f-8201-8a9d2df26d1d';
      const assistantConfig = buildVapiAssistantConfig(
        analysis.vapiVoiceSummary || analysis.roast,
        analysis.targetRole
      );

      // Connect to VAPI Assistant
      if (activeAssistantId) {
        try {
          const overrides = {
            variableValues: {
              targetRole: analysis.targetRole || 'General Tech Role',
              voiceSummary: analysis.vapiVoiceSummary || analysis.roast,
              roast: analysis.roast,
            },
          };
          await vapiInstance.start(activeAssistantId, overrides as any);
        } catch (firstErr) {
          console.warn('Start with assistantId failed, falling back to transient assistant...', firstErr);
          await vapiInstance.start(assistantConfig as any);
        }
      } else {
        await vapiInstance.start(assistantConfig as any);
      }
    } catch (err: any) {
      console.error('Failed to initialize VAPI:', err);
      setErrorMessage(err?.message || 'Initialization error starting VAPI voice call.');
      setCallStatus('idle');
    }
  };

  const handleStartCall = () => {
    initAndStartCall(publicKey || 'd7be711a-6328-45f3-85a5-dfb07c856a67', assistantId || '2ca26d7b-2466-433f-8201-8a9d2df26d1d');
  };

  const handleSaveKeyAndStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (publicKey.trim()) {
      localStorage.setItem('vapi_public_key', publicKey.trim());
      if (assistantId.trim()) {
        localStorage.setItem('vapi_assistant_id', assistantId.trim());
      }
      setShowKeyPrompt(false);
      initAndStartCall(publicKey.trim(), assistantId.trim());
    }
  };

  const handleToggleMute = () => {
    if (vapi) {
      const newMutedState = !isMuted;
      vapi.setMuted(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const handleEndCall = () => {
    if (vapi) {
      vapi.stop();
      setCallStatus('ended');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-neutral-900 bg-white p-6 sm:p-8 space-y-6 shadow-lg">
      {/* Vercel Top Accent Glow */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-sm">
            <Radio className={`w-6 h-6 ${callStatus === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
              Interactive AI Voice Lounge
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Live WebRTC Voice
              </span>
            </h2>
            <p className="text-xs text-neutral-500 font-mono">
              Pre-loaded with Gemini analysis for "{analysis.targetRole || 'Target Role'}"
            </p>
          </div>
        </div>

        {callStatus === 'connected' ? (
          <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Voice Session Active
          </span>
        ) : (
          <span className="font-mono text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Ready to Connect
          </span>
        )}
      </div>

      {/* Main Call View */}
      {callStatus === 'idle' || callStatus === 'ended' ? (
        <div className="text-center py-6 space-y-6 max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-neutral-900 text-white mx-auto flex items-center justify-center shadow-md border-4 border-neutral-100 animate-bounce">
            <PhoneCall className="w-10 h-10 text-amber-300" />
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-xl text-neutral-900">
              Start Live Voice Roast & Discussion
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Click below to start talking live with your AI Recruiter. Ask follow-up questions, brainstorm STAR bullet points, or practice your interview answers.
            </p>
          </div>

          {!showKeyPrompt ? (
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleStartCall}
                className="w-full py-4 px-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-base transition-all flex items-center justify-center gap-3 shadow-md hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
                Start Live Voice Roast Now
              </button>

              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-2 pt-1">
                <span>Assistant ID: {assistantId.slice(0, 8)}...</span>
                <button
                  type="button"
                  onClick={() => setShowKeyPrompt(true)}
                  className="underline text-blue-600 hover:text-blue-700 cursor-pointer font-sans font-medium"
                >
                  Change VAPI Settings
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveKeyAndStart} className="vercel-card p-5 text-left space-y-4 bg-neutral-50 shadow-sm">
              <label className="block text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                VAPI Credentials Setup:
              </label>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-neutral-700">VAPI Public API Key:</span>
                <input
                  type="text"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="e.g. d7be711a-..."
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-neutral-200 bg-white font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-neutral-700">VAPI Assistant ID (Optional):</span>
                <input
                  type="text"
                  value={assistantId}
                  onChange={(e) => setAssistantId(e.target.value)}
                  placeholder="e.g. 2ca26d7b-..."
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-neutral-200 bg-white font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyPrompt(false)}
                  className="px-4 py-2 text-xs text-neutral-500 hover:text-neutral-900 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-neutral-900 text-white rounded-full font-semibold hover:bg-neutral-800 shadow-xs"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-start gap-2.5 text-left">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-red-800">Connection Failed</p>
                <p>{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => setShowKeyPrompt(true)}
                  className="text-xs underline text-red-900 font-semibold pt-1 block"
                >
                  Click here to verify/update your VAPI credentials
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 space-y-6 max-w-lg mx-auto">
          {/* Animated Visualizer Waveform */}
          <AudioVisualizer isActive={callStatus === 'connected'} isSpeaking={isSpeaking} />

          <div className="space-y-1">
            <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest font-bold">
              {callStatus === 'connecting'
                ? 'Connecting Voice Stream...'
                : isSpeaking
                ? 'AI Recruiter Speaking...'
                : 'Listening to your Voice...'}
            </p>
            <p className="text-xs text-neutral-900 font-medium">
              Speak into your microphone to chat live with your AI coach!
            </p>
          </div>

          {/* Controls */}
          <VoiceControls
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onEndCall={handleEndCall}
          />

          {/* Real-Time Live Transcript Preview */}
          {transcripts.length > 0 && (
            <div className="mt-6 text-left border-t border-neutral-100 pt-4 space-y-2">
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                <MessageSquareText className="w-3.5 h-3.5" />
                Live Conversation Transcript
              </span>
              <div className="max-h-36 overflow-y-auto space-y-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs">
                {transcripts.slice(-4).map((t, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-neutral-900 capitalize shrink-0 font-mono text-[10px]">
                      {t.role}:
                    </span>
                    <span className="text-neutral-700 leading-snug">{t.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
