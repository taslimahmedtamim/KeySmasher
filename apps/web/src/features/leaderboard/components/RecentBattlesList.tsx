'use client';

import React from 'react';
import { History, Trophy, Swords, Calendar } from 'lucide-react';
import { RaceHistoryRecord } from '../types';

interface RecentBattlesListProps {
  history: RaceHistoryRecord[];
  onStartRace?: () => void;
}

export function RecentBattlesList({ history, onStartRace }: RecentBattlesListProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface p-12 text-center shadow-xl">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
          <Swords className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-white">No Arena Battles Yet</h3>
        <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
          Complete multiplayer battles in private rooms or against AI ghost racers to start recording your competitive match history.
        </p>
        {onStartRace && (
          <button
            type="button"
            onClick={onStartRace}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-neon-purple hover:bg-purple-500 transition-all"
          >
            <Swords className="h-4 w-4" />
            <span>Jump Into Arena Race</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface overflow-hidden shadow-xl">
      <div className="p-5 border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Recent Arena Battles ({history.length})
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">Latest records</span>
      </div>

      <div className="divide-y divide-surface-border/40 overflow-x-auto">
        {history.map((record) => (
          <div
            key={record.id}
            className="p-4 flex items-center justify-between gap-4 hover:bg-surface-muted/30 transition-colors"
          >
            {/* Left: Placement & Room info */}
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl font-mono text-xs font-black border ${
                  record.placement === 1
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                    : record.placement === 2
                    ? 'bg-slate-400/20 border-slate-400/50 text-slate-300'
                    : record.placement === 3
                    ? 'bg-amber-800/20 border-amber-800/50 text-amber-500'
                    : 'bg-surface-muted border-surface-border text-slate-400'
                }`}
              >
                #{record.placement}
              </span>

              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span>ROOM {record.roomCode}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs font-normal text-slate-400 capitalize">
                    {record.mode} ({record.difficulty})
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(record.completedAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>{record.totalRacers} Racers</span>
                </div>
              </div>
            </div>

            {/* Right: Metrics readout */}
            <div className="flex items-center gap-6 font-mono text-xs">
              <div className="text-right">
                <div className="text-sm font-black text-cyan-400">{record.netWpm} WPM</div>
                <div className="text-[10px] text-slate-500">{record.rawWpm} raw</div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="font-bold text-emerald-400">{record.accuracy}%</div>
                <div className="text-[10px] text-slate-500">{record.durationSeconds}s</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
