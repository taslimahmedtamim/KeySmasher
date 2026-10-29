'use client';

import React from 'react';
import { Trophy, Zap, Target, Activity, Flame, TrendingUp } from 'lucide-react';
import { AnalyticsSummary } from '../types';

interface KpiMetricsGridProps {
  summary: AnalyticsSummary;
}

export const KpiMetricsGrid: React.FC<KpiMetricsGridProps> = ({ summary }) => {
  const hasTests = summary.totalTests > 0;

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-5">
      {/* 1. Peak Speed */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-surface/80 p-4 sm:p-5 shadow-sm transition-all hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Peak Speed
          </span>
          <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
            <Trophy className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1 font-mono">
          <span className="text-3xl font-black text-white">
            {hasTests ? summary.peakWpm : '—'}
          </span>
          {hasTests && <span className="text-xs font-semibold text-slate-400">WPM</span>}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">All-time speed record</p>
      </div>

      {/* 2. Lifetime Average */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-surface/80 p-4 sm:p-5 shadow-sm transition-all hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
            Average Speed
          </span>
          <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
            <Zap className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1 font-mono">
          <span className="text-3xl font-black text-cyan-300">
            {hasTests ? summary.avgWpm : '—'}
          </span>
          {hasTests && <span className="text-xs font-semibold text-slate-400">WPM</span>}
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-cyan-400/90 font-medium">
          {summary.wpmGain > 0 ? (
            <>
              <TrendingUp className="h-3 w-3" />
              <span>+{summary.wpmGain} WPM gain</span>
            </>
          ) : (
            <span>Across verified tests</span>
          )}
        </div>
      </div>

      {/* 3. Accuracy Ratio */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-surface/80 p-4 sm:p-5 shadow-sm transition-all hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Accuracy
          </span>
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <Target className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline font-mono">
          <span className="text-3xl font-black text-emerald-300">
            {hasTests ? `${summary.avgAccuracy}%` : '—'}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Precision keystroke ratio</p>
      </div>

      {/* 4. Consistency */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-surface/80 p-4 sm:p-5 shadow-sm transition-all hover:border-purple-500/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
            Consistency
          </span>
          <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline font-mono">
          <span className="text-3xl font-black text-purple-300">
            {hasTests ? `${summary.avgConsistency}%` : '—'}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Rhythm smoothness</p>
      </div>

      {/* 5. Daily Streak */}
      <div className="col-span-2 lg:col-span-1 relative overflow-hidden rounded-2xl border border-orange-500/30 bg-surface/80 p-4 sm:p-5 shadow-sm transition-all hover:border-orange-500/60 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
            Streak
          </span>
          <div className="rounded-xl bg-orange-500/10 p-2 text-orange-400 border border-orange-500/20 group-hover:scale-110 transition-transform">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-1 font-mono">
          <span className="text-3xl font-black text-orange-300">{summary.dailyStreak}</span>
          <span className="text-xs font-semibold text-slate-400">
            {summary.dailyStreak === 1 ? 'day' : 'days'}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Consecutive days active</p>
      </div>
    </div>
  );
};
