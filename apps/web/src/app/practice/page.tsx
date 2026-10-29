'use client';

import React, { useState } from 'react';
import {
  Clock,
  Type,
  Gauge,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  RefreshCw,
  Info,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  PassageDifficulty,
  TestMode,
  TimeDurationOption,
  WordCountOption,
} from '@keysmasher/shared';
import { useTypingEngine } from '@/features/typing/useTypingEngine';
import { TypingArea } from '@/features/typing/components/TypingArea';

export default function PracticePage() {
  const [zenMode, setZenMode] = useState(false);
  const {
    status,
    config,
    renderedWords,
    currentWordIndex,
    activeCharIndex,
    metrics,
    wpmHistory,
    inputRef,
    actions: { restart, handleKeyDown, handleInputChange, handlePaste, setConfig },
  } = useTypingEngine();

  const handleModeChange = (newMode: TestMode) => {
    setConfig((prev) => ({ ...prev, mode: newMode }));
  };

  const handleDurationChange = (d: TimeDurationOption) => {
    setConfig((prev) => ({ ...prev, durationSeconds: d }));
  };

  const handleWordCountChange = (w: WordCountOption) => {
    setConfig((prev) => ({ ...prev, targetWordCount: w }));
  };

  const handleDifficultyChange = (diff: PassageDifficulty) => {
    setConfig((prev) => ({ ...prev, difficulty: diff }));
  };

  const isCompleted = status === 'completed';

  return (
    <div className="py-8 md:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-surface-border bg-surface/80 p-3.5 backdrop-blur">
          {/* Mode Selector (Time vs Words) */}
          <div className="flex items-center gap-1 rounded-xl bg-surface-muted p-1">
            <button
              type="button"
              id="practice-mode-time"
              onClick={() => handleModeChange('time')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                config.mode === 'time'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Time</span>
            </button>
            <button
              type="button"
              id="practice-mode-words"
              onClick={() => handleModeChange('words')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                config.mode === 'words'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              <span>Words</span>
            </button>
          </div>

          {/* Config Option: Durations or Word counts */}
          <div className="flex items-center gap-1.5">
            {config.mode === 'time' ? (
              <>
                {([15, 30, 60, 120] as TimeDurationOption[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDurationChange(d)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      config.durationSeconds === d
                        ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </>
            ) : (
              <>
                {([10, 25, 50, 100] as WordCountOption[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleWordCountChange(w)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      config.targetWordCount === w
                        ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {w}w
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Difficulty selector */}
          <div className="flex items-center gap-1.5">
            {(['beginner', 'intermediate', 'advanced', 'expert'] as PassageDifficulty[]).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => handleDifficultyChange(diff)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                  config.difficulty === diff
                    ? 'border border-purple-500/40 bg-purple-500/10 text-purple-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Live Metrics Header (Fixed width columns & tabular numbers to prevent layout shifts) */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="w-24 shrink-0 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Raw WPM
              </div>
              <div className="text-3xl font-black text-cyan-400 font-mono tabular-nums">
                {zenMode && status === 'active' ? '—' : Math.round(metrics.rawWpm)}
              </div>
            </div>

            <div className="w-24 shrink-0 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Net WPM
              </div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {zenMode && status === 'active' ? '—' : Math.round(metrics.netWpm)}
              </div>
            </div>

            <div className="w-24 shrink-0 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Accuracy
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono tabular-nums">
                {zenMode && status === 'active' ? '—' : `${Math.round(metrics.accuracy)}%`}
              </div>
            </div>

            <div className="w-28 shrink-0 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {config.mode === 'time' ? 'Time Left' : 'Progress'}
              </div>
              <div className="text-3xl font-black text-slate-200 font-mono tabular-nums">
                {config.mode === 'time'
                  ? `${Math.max(0, Math.ceil(metrics.timeRemaining))}s`
                  : `${metrics.completedWordsCount} / ${config.targetWordCount}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="practice-zen-toggle"
              onClick={() => setZenMode(!zenMode)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                zenMode
                  ? 'border-purple-500/40 bg-purple-950/30 text-purple-300'
                  : 'border-slate-700 bg-surface text-slate-400 hover:text-white'
              }`}
              title="Zen Mode: Hide live WPM during typing to focus purely on the text"
            >
              {zenMode ? <EyeOff className="h-3.5 w-3.5 text-purple-400" /> : <Eye className="h-3.5 w-3.5" />}
              <span>{zenMode ? 'Zen: On' : 'Zen: Off'}</span>
            </button>

            <button
              type="button"
              id="practice-restart-btn"
              onClick={() => restart(false)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-surface px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white active:scale-95"
              title="Restart current passage (Tab + Enter or Escape)"
            >
              <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
              <span>Retry</span>
            </button>

            <button
              type="button"
              id="practice-new-passage-btn"
              onClick={() => restart(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-surface px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white active:scale-95"
              title="Generate new passage"
            >
              <RefreshCw className="h-3.5 w-3.5 text-purple-400" />
              <span>New Passage</span>
            </button>
          </div>
        </div>

        {/* Centerpiece Typing Area */}
        <div className="relative mt-8 min-h-[220px] rounded-2xl border border-surface-border bg-surface/50 p-8 shadow-neon-card">
          {isCompleted ? (
            /* Results Screen */
            <div className="py-6 text-center animate-fade-in">
              <div className="mb-4 inline-flex rounded-full bg-emerald-500/10 p-3 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h2 className="text-2xl font-black text-white sm:text-3xl">
                Test Completed!
              </h2>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-2xl mx-auto">
                <div className="rounded-xl border border-surface-border bg-surface p-4">
                  <div className="text-xs uppercase font-bold text-slate-400">Net Speed</div>
                  <div className="mt-1 text-3xl font-black text-cyan-400">{metrics.netWpm}</div>
                  <div className="text-[10px] text-slate-500">WPM</div>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface p-4">
                  <div className="text-xs uppercase font-bold text-slate-400">Raw Speed</div>
                  <div className="mt-1 text-3xl font-black text-white">{metrics.rawWpm}</div>
                  <div className="text-[10px] text-slate-500">WPM</div>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface p-4">
                  <div className="text-xs uppercase font-bold text-slate-400">Accuracy</div>
                  <div className="mt-1 text-3xl font-black text-emerald-400">{metrics.accuracy}%</div>
                  <div className="text-[10px] text-slate-500">Correct Ratio</div>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface p-4">
                  <div className="text-xs uppercase font-bold text-slate-400">Characters</div>
                  <div className="mt-1 text-lg font-bold text-slate-200">
                    <span className="text-emerald-400">{metrics.correctCharacters}</span>
                    <span className="text-slate-500"> / </span>
                    <span className="text-rose-400">{metrics.incorrectCharacters}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Correct / Errors</div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => restart(false)}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-neon-cyan active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retry Same Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => restart(true)}
                  className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-muted px-5 py-2.5 text-sm font-semibold text-slate-200 hover:text-white transition-all active:scale-95"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>New Passage</span>
                </button>
              </div>
            </div>
          ) : (
            /* Live Typing Area */
            <div>
              <TypingArea
                renderedWords={renderedWords}
                currentWordIndex={currentWordIndex}
                activeCharIndex={activeCharIndex}
                status={status}
                inputRef={inputRef}
                onKeyDown={handleKeyDown}
                onInputChange={handleInputChange}
                onPaste={handlePaste}
              />
            </div>
          )}
        </div>

        {/* Hotkey tip & Guest Notice */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 px-2">
          <div className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-slate-400" />
            <span>Click inside the box or start typing immediately. Space advances to next word.</span>
          </div>
          <div>
            <span className="rounded bg-surface-muted border border-surface-border px-1.5 py-0.5 font-mono text-[10px]">
              Tab
            </span>{' '}
            or{' '}
            <span className="rounded bg-surface-muted border border-surface-border px-1.5 py-0.5 font-mono text-[10px]">
              Esc
            </span>{' '}
            to restart
          </div>
        </div>
      </div>
    </div>
  );
}
