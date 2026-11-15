'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Swords, Zap, Flame, Loader2, Trophy, ArrowRight, X } from 'lucide-react';
import { useRankedSystem } from '../RankedContext';
import { getDivisionColor } from '../rankedEngine';

export const RankedQueueCard: React.FC = () => {
  const router = useRouter();
  const {
    rankedProfile,
    queueState,
    startMatchmaking,
    cancelMatchmaking,
  } = useRankedSystem();

  const divisionStyle = getDivisionColor(rankedProfile.division);

  return (
    <div className="rounded-3xl border border-surface-border bg-surface p-6 sm:p-8 shadow-neon-card relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header & Division Profile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-surface-border">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${divisionStyle.border} ${divisionStyle.bg} ${divisionStyle.glow} transition-all`}
            >
              <Shield className={`h-8 w-8 ${divisionStyle.text}`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${divisionStyle.text}`}>
                  Division Tier
                </span>
                {rankedProfile.placementMatchesRemaining > 0 && (
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                    {rankedProfile.placementMatchesRemaining} Placements Left
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-white">{rankedProfile.division} Division</h2>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span>Rating: <strong className="text-white font-mono">{rankedProfile.mmr} MMR</strong></span>
                <span>•</span>
                <span>Peak: <strong className="text-slate-300 font-mono">{rankedProfile.peakMmr} MMR</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-surface-border bg-surface-muted/50 px-4 py-2.5 text-center">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Win Rate</div>
              <div className="text-base font-black text-white font-mono">
                {rankedProfile.seasonWins + rankedProfile.seasonLosses > 0
                  ? `${Math.round(
                      (rankedProfile.seasonWins /
                        (rankedProfile.seasonWins + rankedProfile.seasonLosses)) *
                        100
                    )}%`
                  : '—'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {rankedProfile.seasonWins}W - {rankedProfile.seasonLosses}L
              </div>
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-muted/50 px-4 py-2.5 text-center">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <Flame className="h-3 w-3 text-amber-400" />
                <span>Streak</span>
              </div>
              <div className="text-base font-black text-amber-400 font-mono">
                {rankedProfile.currentStreak}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Best: {rankedProfile.highestStreak}
              </div>
            </div>
          </div>
        </div>

        {/* Matchmaking Queue Actions */}
        <div className="mt-6">
          {queueState.matchedOpponent ? (
            /* Matched State */
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 animate-pulse-glow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-black text-lg">
                    {queueState.matchedOpponent.avatarSeed}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        MATCH FOUND!
                      </span>
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                        Room: {queueState.assignedRoomCode}
                      </span>
                    </div>
                    <div className="text-base font-bold text-white">
                      Versus: {queueState.matchedOpponent.displayName}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {queueState.matchedOpponent.division} ({queueState.matchedOpponent.mmr} MMR) • Peak {queueState.matchedOpponent.peakWpm} WPM
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (queueState.assignedRoomCode) {
                        router.push(`/compete?room=${queueState.assignedRoomCode}`);
                      }
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95"
                  >
                    <Swords className="h-4 w-4" />
                    <span>Enter 1v1 Arena</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={cancelMatchmaking}
                    className="rounded-xl border border-surface-border bg-surface px-3 py-2.5 text-xs text-slate-400 hover:text-white hover:bg-surface-muted transition-all"
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : queueState.isSearching ? (
            /* Searching State */
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                      Searching for Worthy Opponent...
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Target Range: {rankedProfile.mmr - 100} - {rankedProfile.mmr + 100} MMR
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      Elapsed: {queueState.searchDurationSeconds}s (Avg wait ~3s)
                    </div>
                  </div>
                </div>

                <button
                  onClick={cancelMatchmaking}
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all active:scale-95"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancel Search</span>
                </button>
              </div>
            </div>
          ) : (
            /* Idle State */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-surface-border bg-surface-muted/30 p-5">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Swords className="h-4 w-4 text-cyan-400" />
                  <span>Competitive 1v1 Ranked Matchmaking</span>
                </div>
                <p className="mt-1 text-xs text-slate-400 max-w-xl">
                  Queue up for a 60-second real-time duel against an opponent near your skill tier.
                  Win to earn rating points (MMR), climb division ranks, and unlock prestige rewards.
                </p>
              </div>

              <button
                onClick={startMatchmaking}
                className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-neon-cyan transition-all active:scale-95 flex-shrink-0"
              >
                <Zap className="h-4 w-4 fill-current" />
                <span>Find Ranked Duel</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
