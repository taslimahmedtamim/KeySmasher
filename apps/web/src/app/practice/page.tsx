'use client';

import React, { useState } from 'react';
import {
  Clock,
  Type,
  Gauge,
  RotateCcw,
  Sparkles,
  Zap,
  Sliders,
  Keyboard,
  Info,
} from 'lucide-react';
import { TestMode, TimeDurationOption, WordCountOption, PassageDifficulty } from '@keysmasher/shared';

export default function PracticePage() {
  const [mode, setMode] = useState<TestMode>('time');
  const [duration, setDuration] = useState<TimeDurationOption>(30);
  const [wordCount, setWordCount] = useState<WordCountOption>(25);
  const [difficulty, setDifficulty] = useState<PassageDifficulty>('intermediate');

  return (
    <div className="py-8 md:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-surface-border bg-surface/80 p-3.5 backdrop-blur">
          {/* Mode selector */}
          <div className="flex items-center gap-1 rounded-xl bg-surface-muted p-1">
            <button
              type="button"
              onClick={() => setMode('time')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                mode === 'time'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Time</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('words')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                mode === 'words'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              <span>Words</span>
            </button>
          </div>

          {/* Config options (Duration or Word Count) */}
          <div className="flex items-center gap-1.5">
            {mode === 'time' ? (
              <>
                {([15, 30, 60, 120] as TimeDurationOption[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                      duration === d
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
                    onClick={() => setWordCount(w)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                      wordCount === w
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
            {(['beginner', 'intermediate', 'advanced'] as PassageDifficulty[]).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  difficulty === diff
                    ? 'border border-purple-500/40 bg-purple-500/10 text-purple-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Live Metrics Header */}
        <div className="mt-8 flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-8">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                WPM
              </div>
              <div className="text-3xl font-black text-cyan-400">0</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Accuracy
              </div>
              <div className="text-3xl font-black text-emerald-400">100%</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Time Remaining
              </div>
              <div className="text-3xl font-black text-white">
                {mode === 'time' ? `${duration}s` : '—'}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-surface px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
            title="Reset test"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Centerpiece Typing Area */}
        <div className="relative mt-8 min-h-[220px] rounded-2xl border border-surface-border bg-surface/50 p-8 shadow-neon-card">
          {/* Subtle placeholder indicator */}
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className="mb-3 inline-flex rounded-full bg-cyan-500/10 p-3 text-cyan-400">
              <Keyboard className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Typing Engine (Feature B)</h2>
            <p className="mt-2 max-w-lg text-sm text-slate-300">
              The high-performance typing engine with real-time keystroke tracking, caret rendering,
              backspace handling, and live WPM calculation is planned for implementation in{' '}
              <strong className="text-cyan-400">Feature B</strong> following Phase A approval.
            </p>

            <div className="mt-6 flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-surface-muted px-4 py-2 text-xs text-slate-300 font-mono">
              <span className="text-cyan-400 font-bold">Selected Mode:</span>
              <span>{mode.toUpperCase()}</span>
              <span>•</span>
              <span className="text-cyan-400 font-bold">Config:</span>
              <span>{mode === 'time' ? `${duration} seconds` : `${wordCount} words`}</span>
              <span>•</span>
              <span className="text-cyan-400 font-bold">Difficulty:</span>
              <span className="capitalize">{difficulty}</span>
            </div>
          </div>
        </div>

        {/* Hotkey tip */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 px-2">
          <div className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-slate-400" />
            <span>Physical keyboard recommended for touch-typing speed development.</span>
          </div>
          <div>
            <span className="rounded bg-surface-muted border border-surface-border px-1.5 py-0.5 font-mono text-[10px]">Tab</span> + <span className="rounded bg-surface-muted border border-surface-border px-1.5 py-0.5 font-mono text-[10px]">Enter</span> to restart
          </div>
        </div>
      </div>
    </div>
  );
}
