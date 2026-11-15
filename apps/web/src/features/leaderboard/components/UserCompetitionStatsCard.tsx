'use client';

import React from 'react';
import { Trophy, Award, Target, Zap, Shield, Flame } from 'lucide-react';
import { CompetitionStats } from '../types';
import { getRankTierColor } from '../leaderboardService';

interface UserCompetitionStatsCardProps {
  stats: CompetitionStats;
  username: string;
}

export function UserCompetitionStatsCard({ stats, username }: UserCompetitionStatsCardProps) {
  const tierStyle = getRankTierColor(stats.tier);

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-xl relative overflow-hidden">
      {/* Background neon ambient accent */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Tier Identity Badge */}
        <div className="flex items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${tierStyle.border} ${tierStyle.bg} ${tierStyle.glow}`}
          >
            <Shield className={`h-8 w-8 ${tierStyle.text}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase tracking-widest ${tierStyle.text}`}>
                {stats.tier} DIVISION
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Competitive Arena</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-0.5">{username}</h2>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>
                {stats.wins} Wins in {stats.totalRaces} Races ({stats.winRate}% Win Rate)
              </span>
            </div>
          </div>
        </div>

        {/* 4 KPI Pill Readouts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-surface-border bg-surface-muted/50 p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Peak Race WPM
            </div>
            <div className="mt-1 font-mono text-xl font-black text-cyan-400">
              {stats.bestWpm > 0 ? stats.bestWpm : '—'}
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-muted/50 p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Win Rate
            </div>
            <div className="mt-1 font-mono text-xl font-black text-purple-400">
              {stats.winRate}%
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-muted/50 p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Podium Finishes
            </div>
            <div className="mt-1 font-mono text-xl font-black text-amber-400">
              {stats.podiums}
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-muted/50 p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Avg Speed
            </div>
            <div className="mt-1 font-mono text-xl font-black text-emerald-400">
              {stats.avgWpm > 0 ? stats.avgWpm : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
