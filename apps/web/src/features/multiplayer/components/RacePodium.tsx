'use client';

import React, { useEffect, useRef } from 'react';
import { Trophy, Medal, RotateCcw, LogOut, Bot, User, Award } from 'lucide-react';
import { MultiplayerRoom, RoomParticipant } from '@keysmasher/shared';
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

  // Automatically record verified race match to local competition history
  useEffect(() => {
    if (savedRef.current) return;
    const me = room.participants.find((p) => p.id === currentParticipantId);
    if (me && me.isFinished) {
      savedRef.current = true;
      const record: RaceHistoryRecord = {
        id: `race-${room.code}-${Date.now()}`,
        roomCode: room.code,
        placement: me.placement || 1,
        totalRacers: room.participants.length,
        netWpm: me.currentWpm,
        rawWpm: Math.round(me.currentWpm * 1.05),
        accuracy: me.accuracy,
        durationSeconds: me.finishTimeSeconds || 30,
        mode: room.config.mode,
        difficulty: room.config.difficulty,
        completedAt: new Date().toISOString(),
        isWin: (me.placement || 1) === 1,
      };
      saveRaceRecord(record);
      recordRaceCompletion({
        placement: me.placement || 1,
        netWpm: me.currentWpm,
        accuracy: me.accuracy,
      });
    }
  }, [room, currentParticipantId, recordRaceCompletion]);

  // Sort participants by placement (1, 2, 3...) or finish time / WPM
  const sorted = [...room.participants].sort((a, b) => {
    if (a.placement && b.placement) return a.placement - b.placement;
    if (a.isFinished && !b.isFinished) return -1;
    if (!a.isFinished && b.isFinished) return 1;
    return b.currentWpm - a.currentWpm;
  });

  const firstPlace = sorted[0];
  const secondPlace = sorted[1];
  const thirdPlace = sorted[2];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 mb-3">
          <Trophy className="h-4 w-4" />
          <span>BATTLE COMPLETE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Victory Podium & Rankings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Room {room.code} • {room.config.mode === 'words' ? `${room.config.targetWords} Words` : `${room.config.targetDuration}s Time`} ({room.config.difficulty})
        </p>
      </div>

      {/* 3-Column Podium Graphic */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto items-end pt-12 pb-4">
        {/* 2nd Place */}
        {secondPlace ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-slate-400/40 bg-slate-800/80 text-slate-200 shadow-lg">
                {secondPlace.isBot ? <Bot className="h-7 w-7" /> : <User className="h-7 w-7" />}
              </div>
              <div className="absolute -top-2 -right-2 rounded-full bg-slate-300 p-1 text-slate-950 shadow-md">
                <Medal className="h-4 w-4" />
              </div>
            </div>
            <div className="font-bold text-xs sm:text-sm text-white text-center truncate max-w-[100px] sm:max-w-[140px]">
              {secondPlace.username}
            </div>
            <div className="font-mono text-xs text-slate-400">
              <span className="font-bold text-white">{secondPlace.currentWpm}</span> WPM
            </div>

            {/* Podium Pillar */}
            <div className="mt-3 w-full h-24 sm:h-32 rounded-t-2xl border-t border-x border-slate-500/30 bg-gradient-to-b from-slate-700/50 to-slate-900/60 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-300">2</span>
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* 1st Place (Champion) */}
        {firstPlace ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border-2 border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.5)]">
                {firstPlace.isBot ? <Bot className="h-9 w-9" /> : <User className="h-9 w-9" />}
              </div>
              <div className="absolute -top-3 -right-2 rounded-full bg-amber-400 p-1.5 text-slate-950 shadow-lg animate-bounce">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <div className="font-extrabold text-sm sm:text-base text-amber-300 text-center truncate max-w-[120px] sm:max-w-[160px]">
              {firstPlace.username}
            </div>
            <div className="font-mono text-xs sm:text-sm text-amber-200">
              <span className="font-black text-amber-300">{firstPlace.currentWpm}</span> WPM • {firstPlace.accuracy}%
            </div>

            {/* Podium Pillar */}
            <div className="mt-3 w-full h-36 sm:h-44 rounded-t-2xl border-t-2 border-x-2 border-amber-400/50 bg-gradient-to-b from-amber-500/20 via-amber-600/10 to-slate-900/80 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.2)]">
              <span className="text-4xl sm:text-5xl font-black font-mono text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
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
            <div className="relative mb-2">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-amber-700/50 bg-amber-950/40 text-amber-500 shadow-md">
                {thirdPlace.isBot ? <Bot className="h-6 w-6" /> : <User className="h-6 w-6" />}
              </div>
              <div className="absolute -top-2 -right-2 rounded-full bg-amber-700 p-1 text-white shadow-md">
                <Award className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="font-bold text-xs sm:text-sm text-white text-center truncate max-w-[100px] sm:max-w-[140px]">
              {thirdPlace.username}
            </div>
            <div className="font-mono text-xs text-slate-400">
              <span className="font-bold text-white">{thirdPlace.currentWpm}</span> WPM
            </div>

            {/* Podium Pillar */}
            <div className="mt-3 w-full h-18 sm:h-24 rounded-t-2xl border-t border-x border-amber-800/30 bg-gradient-to-b from-amber-900/30 to-slate-900/60 flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-600">3</span>
            </div>
          </div>
        ) : (
          <div />
        )}
      </div>

      {/* Complete Rankings Scoreboard Table */}
      <div className="rounded-2xl border border-surface-border bg-surface overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Full Arena Scoreboard
          </h2>
          <span className="text-xs text-slate-500">{sorted.length} Competitors</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-surface-muted/30">
                <th className="py-3 px-6">Rank</th>
                <th className="py-3 px-6">Racer</th>
                <th className="py-3 px-6 text-right">Net WPM</th>
                <th className="py-3 px-6 text-right">Accuracy</th>
                <th className="py-3 px-6 text-right">Time</th>
                <th className="py-3 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/40 text-xs font-mono">
              {sorted.map((racer, index) => {
                const rank = racer.placement || index + 1;
                const isMe = racer.id === currentParticipantId;

                return (
                  <tr
                    key={racer.id}
                    className={`transition-colors ${
                      isMe
                        ? 'bg-purple-500/10 hover:bg-purple-500/20'
                        : 'hover:bg-surface-muted/30'
                    }`}
                  >
                    <td className="py-3.5 px-6 font-bold">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs ${
                          rank === 1
                            ? 'bg-amber-500 text-slate-950 font-black'
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
                    <td className="py-3.5 px-6 font-sans">
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
                    <td className="py-3.5 px-6 text-right font-bold text-cyan-400 text-sm">
                      {racer.currentWpm}
                    </td>
                    <td className="py-3.5 px-6 text-right text-emerald-400">
                      {racer.accuracy}%
                    </td>
                    <td className="py-3.5 px-6 text-right text-slate-300">
                      {racer.finishTimeSeconds ? `${racer.finishTimeSeconds}s` : '—'}
                    </td>
                    <td className="py-3.5 px-6 text-right font-sans">
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
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
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
