'use client';

import React from 'react';
import { Bot, User, Trophy, Flag, Zap } from 'lucide-react';
import { RoomParticipant } from '@keysmasher/shared';

interface RaceTrackProps {
  participants: RoomParticipant[];
  currentParticipantId: string;
}

export function RaceTrack({ participants, currentParticipantId }: RaceTrackProps) {
  // Sort for rank determination
  const sortedByProgress = [...participants].sort((a, b) => {
    if (a.isFinished && b.isFinished) {
      return (a.placement || 99) - (b.placement || 99);
    }
    if (a.isFinished) return -1;
    if (b.isFinished) return 1;
    return b.progress - a.progress;
  });

  const getRank = (id: string): number => {
    const idx = sortedByProgress.findIndex((p) => p.id === id);
    return idx >= 0 ? idx + 1 : participants.length;
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface/90 p-5 shadow-2xl backdrop-blur-md">
      {/* Track Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Live Arena Race Track
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Flag className="h-3.5 w-3.5 text-purple-400" />
          <span>100% Finish Line</span>
        </div>
      </div>

      {/* Lanes */}
      <div className="space-y-3">
        {participants.map((racer) => {
          const isMe = racer.id === currentParticipantId;
          const rank = racer.placement || getRank(racer.id);
          const progressClamped = Math.min(100, Math.max(0, racer.progress));

          return (
            <div
              key={racer.id}
              className={`relative rounded-xl border p-2.5 transition-all ${
                isMe
                  ? 'border-cyan-500/50 bg-cyan-950/20 shadow-neon-cyan'
                  : 'border-surface-border bg-surface-muted/40'
              }`}
            >
              {/* Racer Info & Telemetry */}
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <div className="flex items-center gap-2">
                  {/* Rank Badge */}
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md font-mono text-[10px] font-black ${
                      rank === 1
                        ? 'bg-amber-500 text-slate-950'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-surface-muted text-slate-400'
                    }`}
                  >
                    #{rank}
                  </span>

                  {/* Racer Name & Tags */}
                  <div className="flex items-center gap-1.5">
                    {racer.isBot ? (
                      <Bot className="h-3.5 w-3.5 text-cyan-400" />
                    ) : (
                      <User className="h-3.5 w-3.5 text-purple-400" />
                    )}
                    <span className="font-bold text-white max-w-[140px] truncate sm:max-w-xs">
                      {racer.username}
                    </span>
                    {isMe && (
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">
                        (You)
                      </span>
                    )}
                  </div>
                </div>

                {/* Speed & Finish Status */}
                <div className="flex items-center gap-2 font-mono">
                  {racer.isFinished ? (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 text-[11px] font-bold text-emerald-400">
                      <Trophy className="h-3 w-3" />
                      <span>
                        P{racer.placement} • {racer.currentWpm} WPM ({racer.finishTimeSeconds}s)
                      </span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">
                      <span className="font-bold text-white">{racer.currentWpm}</span> WPM •{' '}
                      <span className="text-cyan-400">{Math.round(progressClamped)}%</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Lane Track */}
              <div className="relative h-3 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                {/* Chequered flag goal marker */}
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent to-purple-500/30" />

                {/* Progress Fill */}
                <div
                  className={`h-full rounded-full transition-all duration-200 ease-out ${
                    isMe
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                      : racer.isBot
                      ? 'bg-gradient-to-r from-slate-700 to-cyan-600'
                      : 'bg-gradient-to-r from-purple-800 to-purple-500'
                  }`}
                  style={{ width: `${progressClamped}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
