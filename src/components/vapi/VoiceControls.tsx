import React from 'react';
import { Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react';

interface VoiceControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onEndCall: () => void;
}

export function VoiceControls({ isMuted, onToggleMute, onEndCall }: VoiceControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 pt-2">
      {/* Mute / Unmute Button */}
      <button
        type="button"
        onClick={onToggleMute}
        className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
          isMuted
            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
            : 'bg-canvas-soft border-hairline text-ink hover:bg-hairline'
        }`}
        title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
      >
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {/* End Voice Roast Call */}
      <button
        type="button"
        onClick={onEndCall}
        className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-colors"
      >
        <PhoneOff className="w-4 h-4" />
        End Voice Session
      </button>
    </div>
  );
}
