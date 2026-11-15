'use client';

import React from 'react';
import { Sparkles, Trophy, Zap } from 'lucide-react';
import { UserLevelProgress } from '../types';

interface LevelProgressBarProps {
  progress: UserLevelProgress;
  onOpenAchievements?: () => void;
  compact?: boolean;
}

export function LevelProgressBar({
  progress,
  onOpenAchievements,
  compact = false,
}: LevelProgressBarProps) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onOpenAchievements}
        className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-all shadow-sm"
        title="View Level & Achievements"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500/30 font-mono text-[10px] font-black text-white">
          {progress.level}
        </div>
        <span className="font-bold text-white hidden sm:inline">{progress.title}</span>
        <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-surface/90 p-5 shadow-xl backdrop-blur-md relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Level Badge & Title */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-purple-400 bg-purple-500/20 font-mono text-2xl font-black text-white shadow-neon-purple">
              {progress.level}
            </div>
            <div className="absolute -top-1.5 -right-1.5 rounded-full bg-cyan-400 p-1 text-slate-950 shadow-md">
              <Zap className="h-3 w-3 stroke-[3]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                LEVEL {progress.level} STATUS
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-mono">{progress.totalXp} Total XP</span>
            </div>
            <h3 className="text-xl font-black text-white mt-0.5">{progress.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {progress.nextLevelRequiredXp - progress.currentLevelXp} XP to Level {progress.level + 1}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        {onOpenAchievements && (
          <button
            type="button"
            onClick={onOpenAchievements}
            className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition-all shrink-0"
          >
            <Trophy className="h-4 w-4" />
            <span>Badges & Milestones</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs font-mono mb-1.5">
          <span className="text-slate-400">
            {progress.currentLevelXp} / {progress.nextLevelRequiredXp} XP
          </span>
          <span className="font-bold text-cyan-400">{progress.progressPercent}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] transition-all duration-300 ease-out"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
