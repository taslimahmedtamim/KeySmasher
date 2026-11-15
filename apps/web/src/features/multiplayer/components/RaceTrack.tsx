'use client';

import React from 'react';
import { Bot, User, Trophy, Flag, Zap, Car } from 'lucide-react';
import { RoomParticipant, compareRacerRank } from '@keysmasher/shared';

interface RaceTrackProps {
  participants: RoomParticipant[];
  currentParticipantId: string;
}

export function RaceTrack({ participants, currentParticipantId }: RaceTrackProps) {
  // Sort for rank determination based on Speed + Accuracy composite score
  const sortedByRank = [...participants].sort(compareRacerRank);

  const getRank = (id: string): number => {
    const idx = sortedByRank.findIndex((p) => p.id === id);
    return idx >= 0 ? idx + 1 : participants.length;
  };

  const isMultiColumn = participants.length > 4;

  return (
    <div className="rounded-2xl border border-surface-border bg-surface/95 p-3 sm:p-4 shadow-2xl backdrop-blur-md">
      {/* Track Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-surface-border mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400">
            <Zap className="h-3 w-3 fill-current" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live Arena Race Track
          </h2>
          <span className="rounded-full bg-slate-800 px-2 py-0.2 text-[10px] font-mono text-slate-400">
            {participants.length} Racers
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <Flag className="h-3 w-3 text-purple-400" />
          <span>Finish Line</span>
        </div>
      </div>

      {/* Lanes: 2-column grid when > 4 racers to preserve typing area visibility */}
      <div
        className={`grid gap-2 ${
          isMultiColumn ? 'grid-cols-1 md:grid-cols-2 max-h-56 overflow-y-auto pr-1' : 'grid-cols-1'
        }`}
      >
        {participants.map((racer) => {
          const isMe = racer.id === currentParticipantId;
          const rank = racer.placement || getRank(racer.id);
          const progressClamped = Math.min(100, Math.max(0, racer.progress));

          return (
            <div
              key={racer.id}
              className={`relative flex items-center gap-2.5 rounded-xl border px-3 py-1.5 transition-all ${
                isMe
                  ? 'border-cyan-500/70 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/40'
                  : 'border-surface-border bg-surface-muted/30 hover:border-slate-700'
              }`}
            >
              {/* Left: Rank & Racer Identity */}
              <div className="flex items-center gap-1.5 w-36 sm:w-48 md:w-52 shrink-0 min-w-0">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded font-mono text-[9px] font-black ${
                    rank === 1
                      ? 'bg-amber-400 text-slate-950 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                      : rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-surface-muted text-slate-400'
                  }`}
                >
                  #{rank}
                </span>

                <div className="flex items-center gap-1 min-w-0">
                  {racer.isBot ? (
                    <Bot className="h-3 w-3 text-cyan-400 shrink-0" />
                  ) : (
                    <User className="h-3 w-3 text-purple-400 shrink-0" />
                  )}
                  <span className="font-bold text-white text-xs truncate">
                    {racer.username}
                  </span>
                  {isMe && (
                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-wider shrink-0">
                      (You)
                    </span>
                  )}
                </div>
              </div>

              {/* Center: Race Asphalt Track with Moving Car & Glowing Speed Trail */}
              <div className="relative flex-1 h-6 rounded-lg bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center">
                {/* Starting Line Strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-500/50 via-purple-500/40 to-cyan-500/50 border-r border-slate-700/60 z-[1]"
                  title="Start Line"
                />

                {/* Dashed Road Divider Line */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-dashed border-slate-800/70 pointer-events-none" />

                {/* Checkered Finish Line Strip */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-3.5 border-l border-slate-700/70 z-[1]"
                  style={{
                    backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 3px, #fff 3px, #fff 6px)`,
                    opacity: 0.4,
                  }}
                  title="Finish Line"
                />

                {/* Speed Trail Glow Bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 rounded-l-md transition-all duration-300 ease-out ${
                    isMe
                      ? 'bg-gradient-to-r from-purple-600/30 via-cyan-500/50 to-cyan-400/90 shadow-[0_0_12px_rgba(6,182,212,0.9)]'
                      : racer.isBot
                      ? 'bg-gradient-to-r from-slate-800/40 via-cyan-900/40 to-cyan-600/60'
                      : 'bg-gradient-to-r from-purple-950/40 via-purple-700/40 to-purple-500/70'
                  }`}
                  style={{ width: `${progressClamped}%` }}
                />

                {/* Vehicle Runner Area: Padded between start line and finish line so the vehicle never clips at 0% or 100% */}
                <div className="absolute inset-y-0 left-2 right-4 pointer-events-none">
                  <div
                    className="absolute top-1/2 transition-all duration-300 ease-out pointer-events-none z-10"
                    style={{
                      left: `${progressClamped}%`,
                      transform: `translate(-${progressClamped}%, -50%)`,
                    }}
                  >
                    <div
                      className={`flex h-4 w-4 sm:h-4.5 sm:w-4.5 items-center justify-center rounded-full transition-transform ${
                        isMe
                          ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,1)] ring-2 ring-cyan-200'
                          : racer.isBot
                          ? 'bg-slate-700 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                          : 'bg-purple-600 text-white border border-purple-400/40 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                      }`}
                    >
                      <Car className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Telemetry (WPM & Percentage or Trophy Placement) */}
              <div className="font-mono text-right min-w-[75px] sm:min-w-[85px] shrink-0">
                {racer.isFinished ? (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                    <Trophy className="h-2.5 w-2.5 text-amber-400" />
                    <span>P{racer.placement} • {racer.currentWpm} WPM</span>
                  </span>
                ) : (
                  <div className="text-[11px] leading-none">
                    <span className="font-bold text-white">{racer.currentWpm}</span>
                    <span className="text-[9px] text-slate-400"> WPM </span>
                    <span className="text-cyan-400 font-bold">{Math.round(progressClamped)}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
