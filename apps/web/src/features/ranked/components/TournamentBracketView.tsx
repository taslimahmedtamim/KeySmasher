'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Swords,
  Crown,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useRankedSystem } from '../RankedContext';
import { TournamentMatch, TournamentParticipant } from '../types';

export const TournamentBracketView: React.FC = () => {
  const {
    activeTournament,
    startNewTournament,
    playUserTournamentMatch,
    simulateCurrentTournamentRound,
    resetTournament,
  } = useRankedSystem();

  const [customUserWpm, setCustomUserWpm] = useState<number>(85);
  const [activeMatchForUser, setActiveMatchForUser] = useState<TournamentMatch | null>(null);

  if (!activeTournament) {
    return (
      <div className="rounded-3xl border border-surface-border bg-surface p-8 sm:p-12 text-center shadow-neon-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Trophy className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">No Active Tournament Bracket</h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Compete in an 8-player single-elimination knockout cup. Climb through the Quarterfinals,
          Semifinals, and Grand Finals to claim the championship trophy and +1,000 XP!
        </p>
        <button
          onClick={() => startNewTournament('KeySmasher Blitz Cup')}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all active:scale-95"
        >
          <Crown className="h-4 w-4" />
          <span>Generate 8-Player Blitz Bracket</span>
        </button>
      </div>
    );
  }

  const qfMatches = activeTournament.matches.filter((m) => m.roundNumber === 1);
  const sfMatches = activeTournament.matches.filter((m) => m.roundNumber === 2);
  const gfMatches = activeTournament.matches.filter((m) => m.roundNumber === 3);

  const champion = activeTournament.championId
    ? activeTournament.participants.find((p) => p.id === activeTournament.championId)
    : null;

  const userParticipant = activeTournament.participants.find((p) => p.isUser);
  const isUserEliminated = userParticipant?.isEliminated;

  const renderPlayerSlot = (
    player: TournamentParticipant | null,
    score: number | undefined,
    isWinner: boolean,
    isOtherWinner: boolean
  ) => {
    if (!player) {
      return (
        <div className="flex items-center justify-between rounded-lg bg-surface-muted/30 px-3 py-2 text-xs text-slate-500 font-mono">
          <span>TBD</span>
          <span>—</span>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-all ${
          isWinner
            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200 font-bold'
            : isOtherWinner
            ? 'bg-surface-muted/20 text-slate-500 line-through'
            : player.isUser
            ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-200 font-semibold'
            : 'bg-surface-muted/50 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="font-mono text-[10px] text-slate-400">#{player.seed}</span>
          <span className="truncate">{player.displayName}</span>
          {player.isUser && (
            <span className="rounded bg-cyan-500/30 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">
              YOU
            </span>
          )}
          {isWinner && <Crown className="h-3 w-3 text-amber-400 fill-current flex-shrink-0" />}
        </div>
        <div className="font-mono text-xs font-bold ml-2">
          {score !== undefined ? `${score} WPM` : `${player.mmr}`}
        </div>
      </div>
    );
  };

  const renderMatchCard = (match: TournamentMatch, matchLabel: string) => {
    const isPlayer1Winner = match.winnerId && match.player1 && match.winnerId === match.player1.id;
    const isPlayer2Winner = match.winnerId && match.player2 && match.winnerId === match.player2.id;
    const hasUser = match.player1?.isUser || match.player2?.isUser;
    const isReadyToPlay =
      match.status === 'waiting' && match.player1 !== null && match.player2 !== null;

    return (
      <div
        key={match.id}
        className={`rounded-2xl border p-3.5 sm:p-4 transition-all ${
          hasUser && match.status === 'waiting'
            ? 'border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
            : 'border-surface-border bg-surface shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between pb-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          <span>{matchLabel}</span>
          <span
            className={
              match.status === 'completed'
                ? 'text-emerald-400 font-bold'
                : isReadyToPlay
                ? 'text-amber-400 font-bold'
                : 'text-slate-500'
            }
          >
            {match.status === 'completed' ? 'Final' : isReadyToPlay ? 'Ready' : 'Pending'}
          </span>
        </div>

        <div className="space-y-1.5">
          {renderPlayerSlot(
            match.player1,
            match.score1,
            !!isPlayer1Winner,
            !!isPlayer2Winner
          )}
          {renderPlayerSlot(
            match.player2,
            match.score2,
            !!isPlayer2Winner,
            !!isPlayer1Winner
          )}
        </div>

        {/* User Play Action */}
        {hasUser && isReadyToPlay && (
          <div className="mt-3 pt-2.5 border-t border-surface-border">
            <button
              onClick={() => setActiveMatchForUser(match)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-neon-cyan transition-all active:scale-95"
            >
              <Swords className="h-3.5 w-3.5" />
              <span>Play Your Match</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tournament Top Bar */}
      <div className="rounded-3xl border border-surface-border bg-surface p-6 shadow-neon-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" />
              <span>Championship Bracket</span>
            </span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
              Round {activeTournament.currentRound} of {activeTournament.totalRounds}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{activeTournament.title}</h2>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <span>Prize Pool: <strong className="text-amber-400 font-mono">+{activeTournament.prizeXp} XP</strong></span>
            <span>•</span>
            <span className={isUserEliminated ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
              {champion?.isUser
                ? '🏆 You are the Champion!'
                : isUserEliminated
                ? 'Eliminated from Cup'
                : 'Active in Bracket'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeTournament.status !== 'completed' && (
            <button
              onClick={simulateCurrentTournamentRound}
              className="flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-muted px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-600 transition-all active:scale-95"
            >
              <Play className="h-3.5 w-3.5 text-cyan-400" />
              <span>Simulate AI Matches</span>
            </button>
          )}

          <button
            onClick={resetTournament}
            className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Bracket</span>
          </button>
        </div>
      </div>

      {/* Champion Podium Announcement Banner */}
      {champion && (
        <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-surface to-amber-500/20 p-6 sm:p-8 text-center shadow-[0_0_30px_rgba(245,158,11,0.25)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Crown className="h-7 w-7" />
          </div>
          <div className="mt-3 text-xs font-bold uppercase tracking-wider text-amber-400">
            Tournament Champion Crowned!
          </div>
          <h3 className="text-2xl font-black text-white mt-1">{champion.displayName}</h3>
          <p className="mt-1 text-xs text-slate-400">
            {champion.isUser
              ? `Congratulations! You smashed through all 3 rounds and earned +${activeTournament.prizeXp} XP!`
              : `Champion took 1st place with flawless cadence.`}
          </p>
        </div>
      )}

      {/* 3-Column Knockout Bracket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Quarterfinals */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-surface-border flex items-center justify-between">
            <span>Quarterfinals</span>
            <span className="font-mono text-[10px]">Round 1</span>
          </div>
          <div className="space-y-3">
            {qfMatches.map((m, idx) => renderMatchCard(m, `Match Q${idx + 1}`))}
          </div>
        </div>

        {/* Semifinals */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-surface-border flex items-center justify-between">
            <span>Semifinals</span>
            <span className="font-mono text-[10px]">Round 2</span>
          </div>
          <div className="space-y-6 pt-4">
            {sfMatches.map((m, idx) => renderMatchCard(m, `Semifinal S${idx + 1}`))}
          </div>
        </div>

        {/* Grand Finals */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 pb-2 border-b border-surface-border flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Crown className="h-3.5 w-3.5" />
              <span>Grand Finals</span>
            </span>
            <span className="font-mono text-[10px]">Round 3</span>
          </div>
          <div className="pt-12">
            {gfMatches.map((m) => renderMatchCard(m, 'Championship Duel'))}
          </div>
        </div>
      </div>

      {/* User Match Resolution Modal */}
      {activeMatchForUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-surface-border bg-surface p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Swords className="h-4 w-4" />
                <span>Round {activeMatchForUser.roundNumber} Duel</span>
              </div>
              <button
                onClick={() => setActiveMatchForUser(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Submit Verified Race Speed</h3>
              <p className="mt-1 text-xs text-slate-400">
                Enter your test result WPM to resolve this tournament knockout duel against your opponent.
              </p>
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-muted p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Opponent:</span>
                <span className="font-bold text-white">
                  {activeMatchForUser.player1?.isUser
                    ? activeMatchForUser.player2?.displayName
                    : activeMatchForUser.player1?.displayName}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Your Typing Speed (WPM):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="40"
                    max="160"
                    value={customUserWpm}
                    onChange={(e) => setCustomUserWpm(Number(e.target.value))}
                    className="flex-1 accent-cyan-400 cursor-pointer"
                  />
                  <span className="font-mono text-lg font-black text-cyan-400 w-16 text-right">
                    {customUserWpm}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playUserTournamentMatch(activeMatchForUser.id, customUserWpm);
                setActiveMatchForUser(null);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-neon-cyan transition-all active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Submit & Resolve Match</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
