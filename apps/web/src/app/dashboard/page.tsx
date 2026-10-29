'use client';

import React from 'react';
import { LayoutDashboard, Flame, Target, Trophy, Clock, Zap, BookOpen, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-surface-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Personal Analytics & Training Hub</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              User Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Track typing speed progression, accuracy metrics, weak keys, and daily streaks.
            </p>
          </div>
        </div>

        {/* Guest Onboarding Notice */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4">
          <AlertCircle className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300">
            <span className="font-semibold text-white">Guest Session Active:</span> Your practice test
            records will be saved locally. Account synchronization, personal bests, and weak-key analytics
            will be activated in <strong className="text-cyan-400">Feature F & G (Authentication & Database)</strong>.
          </div>
        </div>

        {/* Summary Stat Cards Preview */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-surface-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Personal Best</span>
              <Trophy className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">— <span className="text-xs text-slate-400 font-normal">WPM</span></div>
            <div className="mt-1 text-xs text-slate-500">Record waiting</div>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Average WPM</span>
              <Zap className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">—</div>
            <div className="mt-1 text-xs text-slate-500">Across completed tests</div>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Accuracy</span>
              <Target className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">— <span className="text-xs text-slate-400 font-normal">%</span></div>
            <div className="mt-1 text-xs text-slate-500">Lifetime average</div>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Daily Streak</span>
              <Flame className="h-4 w-4 text-orange-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">0 <span className="text-xs text-slate-400 font-normal">days</span></div>
            <div className="mt-1 text-xs text-slate-500">Start practicing today</div>
          </div>
        </div>
      </div>
    </div>
  );
}
