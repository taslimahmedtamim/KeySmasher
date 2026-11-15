'use client';

import React from 'react';

interface RaceCountdownOverlayProps {
  secondsRemaining: number;
}

export function RaceCountdownOverlay({ secondsRemaining }: RaceCountdownOverlayProps) {
  if (secondsRemaining <= 0) return null;

  // Number of illuminated red starting lights (1 to 5 as countdown progresses)
  const activeLights = Math.min(5, Math.max(1, 6 - secondsRemaining));

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md animate-fade-in pointer-events-none select-none">
      <div className="text-center flex flex-col items-center">
        {/* F1 / Drag Strip Starting Lights Gantry */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="flex items-center gap-3.5 px-6 py-2.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-[0_0_30px_rgba(0,0,0,0.9)] backdrop-blur-md">
            {[1, 2, 3, 4, 5].map((lightIdx) => {
              const isLit = lightIdx <= activeLights;
              return (
                <div key={lightIdx} className="relative flex items-center justify-center">
                  <div
                    className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 transition-all duration-300 ${
                      isLit
                        ? 'bg-rose-500 border-rose-300 shadow-[0_0_18px_rgba(244,63,94,1)]'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  />
                  {isLit && (
                    <div className="absolute inset-0 rounded-full bg-rose-400/50 blur-[2px] animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-[11px] font-mono font-bold tracking-[0.28em] uppercase text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
            {secondsRemaining === 1 ? 'READY FOR LAUNCH' : 'RACE STARTING GRID'}
          </div>
        </div>

        {/* Big Neon Countdown Number */}
        <div className="relative flex items-center justify-center my-1">
          <div
            className={`absolute h-56 w-56 rounded-full blur-3xl transition-all duration-500 ${
              secondsRemaining <= 1
                ? 'bg-rose-600/35'
                : secondsRemaining <= 3
                ? 'bg-amber-600/30'
                : 'bg-cyan-600/25'
            }`}
          />
          <div
            key={secondsRemaining}
            className={`relative text-8xl sm:text-9xl font-black font-mono tracking-tight text-transparent bg-clip-text animate-pulse ${
              secondsRemaining <= 1
                ? 'bg-gradient-to-b from-white via-rose-200 to-rose-500 drop-shadow-[0_0_45px_rgba(244,63,94,0.9)]'
                : secondsRemaining <= 3
                ? 'bg-gradient-to-b from-white via-amber-200 to-amber-500 drop-shadow-[0_0_40px_rgba(245,158,11,0.8)]'
                : 'bg-gradient-to-b from-white via-cyan-200 to-purple-400 drop-shadow-[0_0_35px_rgba(168,85,247,0.7)]'
            }`}
          >
            {secondsRemaining}
          </div>
        </div>

        {/* Subtle Guidance Hint */}
        <div className="mt-8 text-xs sm:text-sm font-semibold tracking-widest text-slate-400 uppercase">
          Hands on home row • Race starts on zero!
        </div>
      </div>
    </div>
  );
}
