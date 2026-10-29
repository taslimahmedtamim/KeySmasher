'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Star, ChevronRight, Award } from 'lucide-react';
import { AcademyMasterySummary } from '../types';

interface AcademyMasteryCardProps {
  academy: AcademyMasterySummary;
}

export const AcademyMasteryCard: React.FC<AcademyMasteryCardProps> = ({ academy }) => {
  const overallPercent =
    academy.maxStars > 0 ? Math.round((academy.totalStars / academy.maxStars) * 100) : 0;

  return (
    <div className="rounded-3xl border border-surface-border bg-surface p-5 sm:p-6 shadow-neon-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">Touch Typing Academy Mastery</h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Structured 5-level curriculum tracking your finger discipline and accuracy mastery.
          </p>
        </div>

        <Link
          href="/learn"
          className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 hover:border-purple-500 transition-all active:scale-95"
        >
          <span>Open Academy</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Overall Progress Meter */}
      <div className="mt-4 rounded-2xl border border-surface-border bg-surface-muted/30 p-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-300">
            <Award className="h-4 w-4 text-amber-400" />
            <span>Curriculum Completion</span>
          </div>
          <div className="font-mono text-slate-300">
            <span className="font-bold text-amber-300">{academy.totalStars}</span> /{' '}
            {academy.maxStars} Stars ({overallPercent}%)
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-surface-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
            style={{ width: `${Math.max(4, overallPercent)}%` }}
          />
        </div>
      </div>

      {/* Course Level Breakdown */}
      <div className="mt-4 space-y-3">
        {academy.levels.map((level) => {
          const levelPercent =
            level.maxStars > 0 ? Math.round((level.earnedStars / level.maxStars) * 100) : 0;
          const isMastered = level.completedLessons === level.totalLessons && level.totalLessons > 0;

          return (
            <div
              key={level.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-surface-border/60 bg-surface-muted/20 p-3 hover:bg-surface-muted/40 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{level.title}</span>
                  {isMastered && (
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-bold text-emerald-300 uppercase">
                      Mastered
                    </span>
                  )}
                </div>

                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span>
                    {level.completedLessons} / {level.totalLessons} lessons
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>
                      {level.earnedStars} / {level.maxStars}
                    </span>
                  </span>
                </div>
              </div>

              {/* Level mini progress bar */}
              <div className="flex items-center gap-3 sm:w-48">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-border">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all"
                    style={{ width: `${levelPercent}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-400 w-9 text-right">
                  {levelPercent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
