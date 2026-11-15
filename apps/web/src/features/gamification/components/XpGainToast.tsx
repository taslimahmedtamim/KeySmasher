'use client';

import React from 'react';
import { Zap, Trophy, X } from 'lucide-react';
import { Achievement } from '../types';

interface XpGainToastProps {
  xpGain: { amount: number; reason: string } | null;
  unlock: Achievement | null;
  onDismiss: () => void;
}

export function XpGainToast({ xpGain, unlock, onDismiss }: XpGainToastProps) {
  if (!xpGain && !unlock) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-auto animate-slide-up">
      {/* Achievement Unlock Toast */}
      {unlock && (
        <div className="flex items-center justify-between rounded-2xl border-2 border-amber-400/80 bg-slate-900/95 p-4 shadow-[0_0_25px_rgba(251,191,36,0.5)] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                ACHIEVEMENT UNLOCKED!
              </div>
              <div className="text-sm font-bold text-white">{unlock.title}</div>
              <div className="text-xs font-mono text-purple-300">+{unlock.xpReward} Bonus XP</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded p-1 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* XP Gain Toast */}
      {xpGain && !unlock && (
        <div className="flex items-center justify-between rounded-2xl border border-purple-500/50 bg-slate-900/95 p-3.5 shadow-neon-purple backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-cyan-400">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="font-mono text-cyan-400 font-black">+{xpGain.amount} XP</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">{xpGain.reason}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded p-1 text-slate-500 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
