'use client';

import React, { useEffect, useRef } from 'react';
import { Trophy, Medal, RotateCcw, LogOut, Bot, User, Award, Sparkles } from 'lucide-react';
import { MultiplayerRoom, RoomParticipant, compareRacerRank, calculateRaceScore } from '@keysmasher/shared';
import { saveRaceRecord, RaceHistoryRecord } from '@/features/leaderboard';
import { useGamification } from '@/features/gamification';

interface RacePodiumProps {
  room: MultiplayerRoom;
  currentParticipantId: string;
  isHost: boolean;
  onRematch: () => void;
  onLeaveRoom: () => void;
}

export function RacePodium({
  room,
  currentParticipantId,
  isHost,
  onRematch,
  onLeaveRoom,
}: RacePodiumProps) {
  const savedRef = useRef(false);
  const { recordRaceCompletion } = useGamification();

  // Scroll to top upon mounting so the entire victory podium and champion are visible
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        window.scrollTo(0, 0);
      }
    }
  }, []);

  // Deterministically rank all participants strictly by Speed + Accuracy composite score
  const sorted = [...room.participants].sort(compareRacerRank);

  const firstPlace = sorted[0];
  const secondPlace = sorted[1];
  const thirdPlace = sorted[2];

  // Automatically record verified race match to local competition history
  useEffect(() => {
    if (savedRef.current) return;
    const meIndex = sorted.findIndex((p) => p.id === currentParticipantId);
    const me = sorted[meIndex];
    if (me && me.isFinished) {
      savedRef.current = true;
      const myRank = meIndex + 1;
      const record: RaceHistoryRecord = {
        id: `race-${room.code}-${Date.now()}`,
        roomCode: room.code,
        placement: myRank,
        totalRacers: room.participants.length,
        netWpm: me.currentWpm,
        rawWpm: Math.round(me.currentWpm * 1.05),
        accuracy: me.accuracy,
        durationSeconds: me.finishTimeSeconds || 30,
        mode: room.config.mode,
        difficulty: room.config.difficulty,
        completedAt: new Date().toISOString(),
        isWin: myRank === 1,
      };
      saveRaceRecord(record);
      recordRaceCompletion({
        placement: myRank,
        netWpm: me.currentWpm,
        accuracy: me.accuracy,
      });
    }
  }, [room, currentParticipantId, sorted, recordRaceCompletion]);

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      {/* Title */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
          <Trophy className="h-4 w-4" />
          <span>BATTLE COMPLETE</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          Victory Podium & Rankings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Ranked by Speed + Accuracy (Net WPM &times; Accuracy) • Room {room.code}
        </p>
      </div>

      {/* 3-Column Podium Graphic */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-6 max-w-2xl mx-auto items-end pt-4 pb-2">
        {/* 2nd Place */}
        {secondPlace ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-1.5">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-slate-400/40 bg-slate-800/80 text-slate-200 shadow-lg">
                {secondPlace.isBot ? <Bot className="h-6 w-6 sm:h-7 sm:w-7" /> : <User className="h-6 w-6 sm:h-7 sm:w-7" />}
              </div>
              <div className="absolute -top-2 -right-2 rounded-full bg-slate-300 p-1 text-slate-950 shadow-md">
                <Medal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="font-bold text-xs sm:text-sm text-white text-center truncate max-w-[90px] sm:max-w-[140px]">
              {secondPlace.username}
            </div>
            <div className="font-mono text-[11px] sm:text-xs text-slate-300">
              <span className="font-bold text-white">{secondPlace.currentWpm} WPM</span> • {secondPlace.accuracy}%
            </div>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-700/50 border border-slate-600 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-300">
              {calculateRaceScore(secondPlace.currentWpm, secondPlace.accuracy)} pts
            </div>

            {/* Podium Pillar */}
            <div className="mt-2.5 w-full h-20 sm:h-28 rounded-t-2xl border-t border-x border-slate-500/30 bg-gradient-to-b from-slate-700/50 to-slate-900/60 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-300">2</span>
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* 1st Place (Champion) */}
        {firstPlace ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-1.5">
              <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border-2 border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.5)]">
                {firstPlace.isBot ? <Bot className="h-8 w-8 sm:h-9 sm:w-9" /> : <User className="h-8 w-8 sm:h-9 sm:w-9" />}
              </div>
              <div className="absolute -top-3 -right-2 rounded-full bg-amber-400 p-1 sm:p-1.5 text-slate-950 shadow-lg animate-bounce">
                <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="font-extrabold text-xs sm:text-base text-amber-300 text-center truncate max-w-[110px] sm:max-w-[160px]">
              {firstPlace.username}
            </div>
            <div className="font-mono text-[11px] sm:text-sm text-amber-200">
              <span className="font-black text-amber-300">{firstPlace.currentWpm} WPM</span> • {firstPlace.accuracy}%
            </div>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/50 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
              <Sparkles className="h-2.5 w-2.5" />
              <span>{calculateRaceScore(firstPlace.currentWpm, firstPlace.accuracy)} pts</span>
            </div>

            {/* Podium Pillar */}
            <div className="mt-2.5 w-full h-28 sm:h-36 rounded-t-2xl border-t-2 border-x-2 border-amber-400/50 bg-gradient-to-b from-amber-500/20 via-amber-600/10 to-slate-900/80 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)]">
              <span className="text-3xl sm:text-5xl font-black font-mono text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                1
              </span>
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* 3rd Place */}
        {thirdPlace ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-1.5">
              <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-amber-700/50 bg-amber-950/40 text-amber-500 shadow-md">
                {thirdPlace.isBot ? <Bot className="h-5 w-5 sm:h-6 sm:w-6" /> : <User className="h-5 w-5 sm:h-6 sm:w-6" />}
              </div>
              <div className="absolute -top-2 -right-2 rounded-full bg-amber-700 p-1 text-white shadow-md">
                <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
            </div>
            <div className="font-bold text-xs sm:text-sm text-white text-center truncate max-w-[90px] sm:max-w-[140px]">
              {thirdPlace.username}
            </div>
            <div className="font-mono text-[11px] sm:text-xs text-slate-300">
              <span className="font-bold text-white">{thirdPlace.currentWpm} WPM</span> • {thirdPlace.accuracy}%
            </div>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-900/40 border border-amber-800 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-500">
              {calculateRaceScore(thirdPlace.currentWpm, thirdPlace.accuracy)} pts
            </div>

            {/* Podium Pillar */}
            <div className="mt-2.5 w-full h-14 sm:h-20 rounded-t-2xl border-t border-x border-amber-800/30 bg-gradient-to-b from-amber-900/30 to-slate-900/60 flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-600">3</span>
            </div>
          </div>
        ) : (
          <div />
        )}
      </div>

      {/* Complete Rankings Scoreboard Table */}
      <div className="rounded-2xl border border-surface-border bg-surface overflow-hidden shadow-2xl">
        <div className="px-5 py-3.5 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Full Arena Scoreboard
            </h2>
            <p className="text-[11px] text-slate-500">
              Ranked by Speed + Accuracy Score (Net WPM &times; Accuracy)
            </p>
          </div>
          <span className="text-xs text-slate-500">{sorted.length} Competitors</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-surface-muted/30">
                <th className="py-3 px-5">Rank</th>
                <th className="py-3 px-5">Racer</th>
                <th className="py-3 px-5 text-right">Race Score</th>
                <th className="py-3 px-5 text-right">Net WPM</th>
                <th className="py-3 px-5 text-right">Accuracy</th>
                <th className="py-3 px-5 text-right">Time</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/40 text-xs font-mono">
              {sorted.map((racer, index) => {
                const rank = index + 1;
                const isMe = racer.id === currentParticipantId;
                const raceScore = calculateRaceScore(racer.currentWpm, racer.accuracy);

                return (
                  <tr
                    key={racer.id}
                    className={`transition-colors ${
                      isMe
                        ? 'bg-purple-500/10 hover:bg-purple-500/20'
                        : 'hover:bg-surface-muted/30'
                    }`}
                  >
                    <td className="py-3.5 px-5 font-bold">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs ${
                          rank === 1
                            ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-950 font-black'
                            : rank === 3
                            ? 'bg-amber-700 text-white font-black'
                            : 'bg-surface-muted text-slate-400'
                        }`}
                      >
                        #{rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-sans">
                      <div className="flex items-center gap-2">
                        {racer.isBot ? (
                          <Bot className="h-4 w-4 text-cyan-400" />
                        ) : (
                          <User className="h-4 w-4 text-purple-400" />
                        )}
                        <span className="font-bold text-white">{racer.username}</span>
                        {isMe && (
                          <span className="text-[10px] font-bold text-purple-400 uppercase">
                            (You)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right font-black text-amber-400 font-mono text-sm">
                      {raceScore} pts
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-cyan-400 text-sm">
                      {racer.currentWpm}
                    </td>
                    <td className="py-3.5 px-5 text-right text-emerald-400 font-bold">
                      {racer.accuracy}%
                    </td>
                    <td className="py-3.5 px-5 text-right text-slate-300">
                      {racer.finishTimeSeconds ? `${racer.finishTimeSeconds}s` : '—'}
                    </td>
                    <td className="py-3.5 px-5 text-right font-sans">
                      {racer.isFinished ? (
                        <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                          Finished
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-slate-700/30 border border-slate-700 px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
                          DNF
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
        {isHost ? (
          <button
            type="button"
            onClick={onRematch}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-neon-purple hover:bg-purple-500 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Rematch • Return to Lobby</span>
          </button>
        ) : (
          <div className="text-xs text-slate-400 italic">
            Waiting for battle host to initiate rematch...
          </div>
        )}

        <button
          type="button"
          onClick={onLeaveRoom}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-surface-border px-6 py-3.5 text-sm font-semibold text-slate-400 hover:bg-surface-muted hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Exit Arena</span>
        </button>
      </div>
    </div>
  );
}
