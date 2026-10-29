'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Flame,
  Target,
  Trophy,
  Zap,
  Lock,
  LogIn,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function DashboardPage() {
  // Guest by default. Connected to Supabase session in Phase F.
  const [isSignedIn, setIsSignedIn] = useState(false);

  if (!isSignedIn) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-surface-border bg-surface p-8 text-center shadow-neon-card">
          <div className="mx-auto mb-4 inline-flex rounded-2xl bg-cyan-500/10 p-4 text-cyan-400 border border-cyan-500/20">
            <Lock className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Sign In Required
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            The Personal Dashboard, lifetime statistics, streak tracking, and weak-key analytics
            are exclusive to registered accounts. Practice tests and public competitions remain 100% open for guests.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              id="dashboard-signin-btn"
              onClick={() => setIsSignedIn(true)}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 hover:shadow-neon-cyan transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In (Demo Account)</span>
            </button>
            <Link
              href="/practice"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-muted px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-all"
            >
              <span>Practice as Guest</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Full Supabase Database & Auth will be integrated in Feature F</span>
          </div>
        </div>
      </div>
    );
  }

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

          <div className="mt-4 md:mt-0">
            <button
              type="button"
              onClick={() => setIsSignedIn(false)}
              className="text-xs text-slate-400 hover:text-rose-400 underline"
            >
              Sign out of dashboard
            </button>
          </div>
        </div>

        {/* Summary Stat Cards Preview */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-surface-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Personal Best</span>
              <Trophy className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              — <span className="text-xs text-slate-400 font-normal">WPM</span>
            </div>
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
            <div className="mt-2 text-2xl font-black text-white">
              — <span className="text-xs text-slate-400 font-normal">%</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">Lifetime average</div>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Daily Streak</span>
              <Flame className="h-4 w-4 text-orange-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              0 <span className="text-xs text-slate-400 font-normal">days</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">Start practicing today</div>
          </div>
        </div>
      </div>
    </div>
  );
}
