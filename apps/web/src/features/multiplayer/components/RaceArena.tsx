'use client';

import React, { useEffect, useRef } from 'react';
import { RaceTrack } from './RaceTrack';
import { MultiplayerRoom, RaceSubmission } from '@keysmasher/shared';
import { useTypingEngine } from '@/features/typing/useTypingEngine';
import { TypingArea } from '@/features/typing/components/TypingArea';

interface RaceArenaProps {
  room: MultiplayerRoom;
  currentParticipantId: string;
  onSendProgress: (progress: number, currentWpm: number, accuracy: number) => void;
  onSendFinish: (submission: RaceSubmission) => void;
  onLeaveRoom: () => void;
}

export function RaceArena({
  room,
  currentParticipantId,
  onSendProgress,
  onSendFinish,
  onLeaveRoom,
}: RaceArenaProps) {
  const finishSentRef = useRef<boolean>(false);

  // Initialize unified typing engine with the room's synchronized passage
  const {
    status,
    renderedWords,
    currentWordIndex,
    activeCharIndex,
    metrics,
    inputRef,
    actions,
  } = useTypingEngine({
    initialConfig: {
      mode: 'custom',
      customText: room.passage,
      difficulty: room.config.difficulty,
      soundTheme: 'click',
      soundVolume: 0.85,
      allowPaste: false,
    },
    onTestComplete: (finalMetrics) => {
      if (finishSentRef.current) return;
      finishSentRef.current = true;

      const submission: RaceSubmission = {
        roomCode: room.code,
        participantId: currentParticipantId,
        finalWpm: finalMetrics.netWpm,
        accuracy: finalMetrics.accuracy,
        durationSeconds: Math.max(1, finalMetrics.elapsedSeconds),
        totalCharacters: finalMetrics.totalTypedCharacters,
        correctCharacters: finalMetrics.correctCharacters,
        incorrectCharacters: finalMetrics.incorrectCharacters,
      };
      onSendFinish(submission);
    },
  });

  // Automatically focus hidden input when RACING begins
  useEffect(() => {
    if (room.status === 'RACING') {
      finishSentRef.current = false;
      const timer = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [room.status, inputRef]);

  // Emit progress updates whenever character counts or WPM changes
  useEffect(() => {
    if (room.status !== 'RACING') return;

    const totalCharsInPassage = room.passage.length;
    const progress = totalCharsInPassage > 0
      ? Math.min(100, Math.max(0, (metrics.totalTypedCharacters / totalCharsInPassage) * 100))
      : 0;

    onSendProgress(progress, metrics.netWpm, metrics.accuracy);
  }, [
    metrics.totalTypedCharacters,
    metrics.netWpm,
    metrics.accuracy,
    room.passage.length,
    room.status,
    onSendProgress,
  ]);

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Top: Multi-lane Race Track */}
      <RaceTrack
        participants={room.participants}
        currentParticipantId={currentParticipantId}
      />

      {/* Live Telemetry Bar */}
      <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-4 sm:px-6 py-2 text-xs">
        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">Net Speed: </span>
            <span className="font-mono text-base font-black text-cyan-400">{metrics.netWpm}</span>
            <span className="text-slate-500 text-[10px]"> WPM</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">Raw: </span>
            <span className="font-mono text-base font-bold text-slate-300">{metrics.rawWpm}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">Accuracy: </span>
            <span className="font-mono text-base font-bold text-emerald-400">{metrics.accuracy}%</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="font-mono text-slate-400 text-xs">
            Time: <span className="font-bold text-white">{Math.round(metrics.elapsedSeconds)}s</span>
          </div>
          <button
            type="button"
            onClick={onLeaveRoom}
            className="rounded-lg border border-slate-700 px-3 py-1 text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-surface-muted transition-colors"
          >
            Leave Arena
          </button>
        </div>
      </div>

      {/* Active Passage Typing Box */}
      <div
        onClick={() => inputRef.current?.focus({ preventScroll: true })}
        className="relative rounded-2xl border-2 border-purple-500/30 bg-surface/80 p-5 sm:p-6 shadow-2xl backdrop-blur-md focus-within:border-cyan-400 focus-within:shadow-neon-cyan transition-all cursor-text min-h-[190px]"
      >
        <TypingArea
          renderedWords={renderedWords}
          currentWordIndex={currentWordIndex}
          activeCharIndex={activeCharIndex}
          status={status}
          inputRef={inputRef}
          onKeyDown={actions.handleKeyDown}
          onInputChange={actions.handleInputChange}
          onPaste={actions.handlePaste}
        />

        <div className="mt-4 text-center text-xs text-slate-500">
          Battle arena is live • Space advances words • Focus on cadence!
        </div>
      </div>
    </div>
  );
}
