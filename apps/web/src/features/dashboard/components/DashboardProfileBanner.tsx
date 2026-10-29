'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Flame,
  Clock,
  Keyboard,
  Award,
  Play,
  BookOpen,
  FileText,
  FileCode,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { AnalyticsSummary, AcademyMasterySummary } from '../types';

interface DashboardProfileBannerProps {
  summary: AnalyticsSummary;
  academy: AcademyMasterySummary;
  onExportJson: () => void;
  onExportCsv: () => void;
}

export const DashboardProfileBanner: React.FC<DashboardProfileBannerProps> = ({
  summary,
  academy,
  onExportJson,
  onExportCsv,
}) => {
  const { user } = useAuth();

  // Format total seconds into human readable duration
  const formatTime = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0m';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  };

  const displayName = user?.displayName || user?.username || 'KeySmasher Typist';
  const username = user?.username || 'typist';
  const initial = (displayName.charAt(0) || 'K').toUpperCase();

  return (
    <div className="relative rounded-3xl border border-surface-border bg-gradient-to-r from-surface via-surface/90 to-surface-muted/50 p-6 sm:p-7 shadow-neon-card">
      <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* User Identity Column */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar with cyber glow */}
          <div className="relative">
            <div className="flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-2xl border-2 border-cyan-400 bg-gradient-to-br from-cyan-950 to-slate-900 text-2xl sm:text-3xl font-black text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.35)]">
              {initial}
            </div>
            {user?.isDemo && (
              <div
                className="absolute -bottom-1 -right-1 rounded-full border border-purple-500 bg-purple-600 p-1 text-white shadow-neon-card"
                title="Demo Typist"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{displayName}</h1>
              {user?.isDemo ? (
                <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-purple-300">
                  Demo Account
                </span>
              ) : (
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                  Verified Typist
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>@{username}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full lg:w-auto">
          <div className="rounded-xl border border-surface-border bg-surface-muted/60 p-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-slate-400 uppercase font-semibold">
              <Keyboard className="h-3 w-3 text-cyan-400" />
              <span>Tests Taken</span>
            </div>
            <div className="mt-1 text-lg font-black text-white">{summary.totalTests}</div>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-muted/60 p-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-slate-400 uppercase font-semibold">
              <Clock className="h-3 w-3 text-emerald-400" />
              <span>Practice Time</span>
            </div>
            <div className="mt-1 text-lg font-black text-white">
              {formatTime(summary.totalTimeSeconds)}
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-muted/60 p-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-slate-400 uppercase font-semibold">
              <Award className="h-3 w-3 text-amber-400" />
              <span>Stars Earned</span>
            </div>
            <div className="mt-1 text-lg font-black text-amber-300">
              {academy.totalStars}{' '}
              <span className="text-xs text-slate-500 font-normal">/ {academy.maxStars}</span>
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-muted/60 p-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-slate-400 uppercase font-semibold">
              <Flame className="h-3 w-3 text-orange-400" />
              <span>Day Streak</span>
            </div>
            <div className="mt-1 text-lg font-black text-orange-400">
              {summary.dailyStreak}{' '}
              <span className="text-xs font-normal">
                {summary.dailyStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls with direct non-clipping export buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Link
            href="/practice"
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-neon-cyan active:scale-95"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Speed Test</span>
          </Link>

          <Link
            href="/learn"
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-600 transition-all active:scale-95"
          >
            <BookOpen className="h-3.5 w-3.5 text-purple-400" />
            <span>Academy</span>
          </Link>

          {/* Clean Export Actions */}
          <button
            type="button"
            onClick={onExportCsv}
            disabled={summary.totalTests === 0}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-all active:scale-95 disabled:opacity-40"
            title="Download CSV"
          >
            <FileText className="h-3.5 w-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={onExportJson}
            disabled={summary.totalTests === 0}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-all active:scale-95 disabled:opacity-40"
            title="Download JSON"
          >
            <FileCode className="h-3.5 w-3.5 text-cyan-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
