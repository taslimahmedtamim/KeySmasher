'use client';

import React from 'react';
import { Trophy, Medal, Award, User, Flame, Clock, Calendar, Globe } from 'lucide-react';
import { LeaderboardEntry, LeaderboardPeriod } from '../types';
import { getRankTierColor } from '../leaderboardService';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  period: LeaderboardPeriod;
  onPeriodChange: (p: LeaderboardPeriod) => void;
  currentUserId?: string;
}

export function LeaderboardTable({
  entries,
  period,
  onPeriodChange,
  currentUserId,
}: LeaderboardTableProps) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface overflow-hidden shadow-2xl">
      {/* Table Toolbar & Period Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 border-b border-surface-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Global Competitive Leaderboard
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified speeds sorted by Net WPM under server-authoritative anti-cheat validation.
          </p>
        </div>

        {/* Period Pills */}
        <div className="flex items-center rounded-xl bg-surface-muted/60 p-1 border border-surface-border text-xs">
          <button
            type="button"
            onClick={() => onPeriodChange('daily')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all ${
              period === 'daily'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="h-3 w-3" />
            <span>Daily</span>
          </button>

          <button
            type="button"
            onClick={() => onPeriodChange('weekly')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all ${
              period === 'weekly'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="h-3 w-3" />
            <span>Weekly</span>
          </button>

          <button
            type="button"
            onClick={() => onPeriodChange('all-time')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all ${
              period === 'all-time'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="h-3 w-3" />
            <span>All-Time</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-border/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-surface-muted/30">
              <th className="py-3 px-6">Rank</th>
              <th className="py-3 px-6">Typist</th>
              <th className="py-3 px-6">Tier</th>
              <th className="py-3 px-6 text-right">Net WPM</th>
              <th className="py-3 px-6 text-right">Accuracy</th>
              <th className="py-3 px-6 text-right">Win Rate</th>
              <th className="py-3 px-6 text-right">Races</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/40 text-xs font-mono">
            {entries.map((entry) => {
              const tierStyle = getRankTierColor(entry.tier);
              const isMe = entry.isCurrentUser || (currentUserId && entry.userId === currentUserId);

              return (
                <tr
                  key={entry.userId}
                  className={`transition-colors ${
                    isMe
                      ? 'bg-cyan-950/25 border-l-4 border-l-cyan-400 shadow-[inset_0_0_12px_rgba(6,182,212,0.15)]'
                      : 'hover:bg-surface-muted/30'
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3.5 px-6 font-bold">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs ${
                        entry.rank === 1
                          ? 'bg-amber-400 text-slate-950 font-black shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                          : entry.rank === 2
                          ? 'bg-slate-300 text-slate-950 font-black'
                          : entry.rank === 3
                          ? 'bg-amber-700 text-white font-black'
                          : 'bg-surface-muted text-slate-400'
                      }`}
                    >
                      #{entry.rank}
                    </span>
                  </td>

                  {/* Typist Info */}
                  <td className="py-3.5 px-6 font-sans">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-slate-300 font-bold border border-surface-border">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{entry.displayName || entry.username}</span>
                          {isMe && (
                            <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.2 text-[9px] font-black text-cyan-400 uppercase">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">@{entry.username}</div>
                      </div>
                    </div>
                  </td>

                  {/* Tier Badge */}
                  <td className="py-3.5 px-6 font-sans">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${tierStyle.border} ${tierStyle.bg} ${tierStyle.text}`}
                    >
                      {entry.tier}
                    </span>
                  </td>

                  {/* Net WPM */}
                  <td className="py-3.5 px-6 text-right font-bold text-cyan-400 text-sm">
                    {entry.netWpm}
                  </td>

                  {/* Accuracy */}
                  <td className="py-3.5 px-6 text-right text-emerald-400 font-bold">
                    {entry.accuracy}%
                  </td>

                  {/* Win Rate */}
                  <td className="py-3.5 px-6 text-right text-purple-400">
                    {entry.winRate}%
                  </td>

                  {/* Races */}
                  <td className="py-3.5 px-6 text-right text-slate-400">
                    {entry.totalRaces}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
