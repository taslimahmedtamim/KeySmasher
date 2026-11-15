'use client';

import React from 'react';
import { Flame } from 'lucide-react';

interface RaceCountdownOverlayProps {
  secondsRemaining: number;
}

export function RaceCountdownOverlay({ secondsRemaining }: RaceCountdownOverlayProps) {
  if (secondsRemaining <= 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-none select-none">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-purple-300 mb-6">
          <Flame className="h-4 w-4 text-amber-400 animate-bounce" />
          <span>SYNCHRONIZING RACE ENGINE</span>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute h-48 w-48 rounded-full bg-purple-600/20 blur-3xl animate-pulse" />
          <div
            key={secondsRemaining}
            className="text-8xl sm:text-9xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-purple-400 drop-shadow-[0_0_35px_rgba(168,85,247,0.6)] animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]"
          >
            {secondsRemaining}
          </div>
        </div>

        <div className="mt-8 text-sm font-semibold tracking-wider text-slate-400 uppercase">
          Place your fingers on home row • Race starts at 0!
        </div>
      </div>
    </div>
  );
}
