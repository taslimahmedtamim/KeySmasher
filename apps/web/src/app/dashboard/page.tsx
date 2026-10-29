'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Lock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useUserAnalytics } from '@/features/dashboard/useUserAnalytics';
import { DashboardProfileBanner } from '@/features/dashboard/components/DashboardProfileBanner';
import { KpiMetricsGrid } from '@/features/dashboard/components/KpiMetricsGrid';
import { ProgressionChart } from '@/features/dashboard/components/ProgressionChart';
import { PersonalBestsGrid } from '@/features/dashboard/components/PersonalBestsGrid';
import { AcademyMasteryCard } from '@/features/dashboard/components/AcademyMasteryCard';
import { SessionHistoryTable } from '@/features/dashboard/components/SessionHistoryTable';

export default function DashboardPage() {
  const { user, isGuest, openAuthModal, signInWithDemo, isLoading } = useAuth();
  const {
    summary,
    personalBests,
    progression,
    sessions,
    academy,
    exportHistoryJson,
    exportHistoryCsv,
    refreshAnalytics,
  } = useUserAnalytics();

  // If user is not authenticated, render the Cyberpunk Account Unlock Gateway
  if (isGuest || !user) {
    return (
      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-surface-border bg-gradient-to-b from-surface via-surface/95 to-surface-muted/40 p-6 sm:p-10 text-center shadow-neon-card">
            {/* Ambient background glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="mx-auto inline-flex rounded-2xl bg-cyan-500/10 p-3.5 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                <Lock className="h-7 w-7" />
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                <LayoutDashboard className="h-3 w-3" />
                <span>Personal Performance & Analytics Hub</span>
              </div>

              <h1 className="mt-4 text-2xl sm:text-4xl font-black text-white">
                Unlock Your Typist Dashboard
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Sign in to view your lifetime WPM trends, personal best records across all presets,
                touch typing academy star mastery, and weak key performance diagnostics.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <button
                  type="button"
                  id="dashboard-demo-login-btn"
                  onClick={() => signInWithDemo()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/15 py-3 px-5 text-xs font-bold text-purple-300 hover:bg-purple-500/25 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all active:scale-95"
                >
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span>1-Click Demo Account Login</span>
                </button>

                <button
                  type="button"
                  id="dashboard-signin-btn"
                  onClick={() => openAuthModal('signin')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 px-5 text-xs font-bold text-slate-950 hover:bg-cyan-400 hover:shadow-neon-cyan transition-all active:scale-95"
                >
                  <span>Sign In / Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Guest Practice Shortcut */}
              <div className="mt-4">
                <Link
                  href="/practice"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Or continue typing as guest</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Feature Highlights Grid */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left border-t border-surface-border/60 pt-8">
                <div className="rounded-2xl border border-surface-border bg-surface-muted/30 p-4">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-xs font-bold text-white">Progression Curves</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 leading-normal">
                    Interactive SVG charts plotting your raw & net speed, accuracy ratio, and
                    consistency score over time.
                  </p>
                </div>

                <div className="rounded-2xl border border-surface-border bg-surface-muted/30 p-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Award className="h-4 w-4" />
                    <span className="text-xs font-bold text-white">Hall of Records</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 leading-normal">
                    Verified personal best badges across 15s, 30s, 60s, 120s time modes and 10, 25,
                    50, 100 word presets.
                  </p>
                </div>

                <div className="rounded-2xl border border-surface-border bg-surface-muted/30 p-4">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-bold text-white">Academy Mastery</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 leading-normal">
                    Full curriculum tracking across 24 structured lessons with 3-star accuracy
                    ratings and finger discipline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard Layout
  return (
    <div className="py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 1. Profile & Quick Actions Banner */}
        <DashboardProfileBanner
          summary={summary}
          academy={academy}
          onExportJson={exportHistoryJson}
          onExportCsv={exportHistoryCsv}
        />

        {/* 2. Top Headline KPIs (Peak WPM, Avg WPM, Accuracy, Consistency, Streak) */}
        <KpiMetricsGrid summary={summary} />

        {/* 3. Speed & Precision Progression Curve */}
        <ProgressionChart points={progression} />

        {/* 4. Personal Bests Records Matrix & Academy Mastery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PersonalBestsGrid records={personalBests} />
          <AcademyMasteryCard academy={academy} />
        </div>

        {/* 5. Detailed Session History Audit Table */}
        <SessionHistoryTable
          sessions={sessions}
          onExportCsv={exportHistoryCsv}
          onExportJson={exportHistoryJson}
        />
      </div>
    </div>
  );
}
