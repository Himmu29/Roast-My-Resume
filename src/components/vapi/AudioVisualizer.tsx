import React from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  isSpeaking: boolean;
}

export function AudioVisualizer({ isActive, isSpeaking }: AudioVisualizerProps) {
  const bars = [16, 28, 42, 24, 38, 50, 32, 20, 44, 28, 18];

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 py-2">
      {bars.map((height, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-300 ${
            isActive && isSpeaking
              ? 'bg-gradient-to-t from-vercel-blue via-vercel-violet to-vercel-pink animate-pulse'
              : isActive
              ? 'bg-ink/40'
              : 'bg-hairline'
          }`}
          style={{
            height: isActive && isSpeaking ? `${Math.max(12, (height * (i % 3 + 1)) % 48)}px` : '10px',
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}
