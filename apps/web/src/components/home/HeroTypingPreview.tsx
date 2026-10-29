'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowRight, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { calculateTypingMetrics } from '@keysmasher/shared';

const SAMPLE_TEXT = 'smash the keys with precision speed and flawless rhythm';

export const HeroTypingPreview: React.FC = () => {
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (startTime && input.length < SAMPLE_TEXT.length) {
      interval = setInterval(() => {
        setElapsedSeconds((Date.now() - startTime) / 1000);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, input.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }
    if (val.length <= SAMPLE_TEXT.length) {
      setInput(val);
    }
  };

  const handleReset = () => {
    setInput('');
    setStartTime(null);
    setElapsedSeconds(0);
    inputRef.current?.focus();
  };

  // Calculate live preview metrics
  let correctCount = 0;
  let incorrectCount = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === SAMPLE_TEXT[i]) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  }

  const metrics = calculateTypingMetrics({
    totalTypedCharacters: input.length,
    correctCharacters: correctCount,
    incorrectCharacters: incorrectCount,
    elapsedSeconds,
  });

  const isCompleted = input.length >= SAMPLE_TEXT.length;

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="group relative mx-auto mt-12 w-full max-w-3xl cursor-text rounded-2xl border border-cyan-500/30 bg-surface/90 p-6 shadow-neon-card backdrop-blur-xl transition-all hover:border-cyan-400/60"
    >
      {/* Top Bar with Live Preview Stats */}
      <div className="flex items-center justify-between border-b border-surface-border/70 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">
            Interactive Speed Sandbox
          </span>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs">
          <div>
            <span className="text-slate-500">WPM: </span>
            <span className="font-bold text-cyan-400">{metrics.rawWpm}</span>
          </div>
          <div>
            <span className="text-slate-500">ACC: </span>
            <span className="font-bold text-emerald-400">{metrics.accuracy}%</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            title="Reset sandbox"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Hidden real input for mobile & desktop typing focus */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        className="absolute inset-0 opacity-0 cursor-text"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* Rendered Text with Live Character Highlighting & Smooth Caret */}
      <div className="relative mt-6 min-h-[50px] font-mono text-xl sm:text-2xl leading-relaxed tracking-wider select-none text-left">
        {SAMPLE_TEXT.split('').map((char, index) => {
          let charColor = 'text-slate-500';
          let isCurrent = index === input.length;

          if (index < input.length) {
            charColor =
              input[index] === char
                ? 'text-cyan-300 font-semibold'
                : 'text-rose-400 bg-rose-500/20 rounded-sm';
          }

          return (
            <span key={index} className="relative inline-block">
              {isCurrent && (
                <span className="absolute -left-[2px] top-1 bottom-1 w-[2.5px] rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              )}
              <span className={charColor}>{char}</span>
            </span>
          );
        })}
        {input.length === SAMPLE_TEXT.length && (
          <span className="relative inline-block">
            <span className="absolute -left-[2px] top-1 bottom-1 w-[2.5px] rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          </span>
        )}
      </div>

      {/* Completion Banner */}
      {isCompleted ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-2.5 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold">
              Passage Smashed! Final Speed: {metrics.rawWpm} WPM ({metrics.accuracy}% Accuracy)
            </span>
          </div>
          <Link
            href="/practice"
            className="flex items-center gap-1 font-bold text-white hover:text-cyan-300 transition-colors"
          >
            <span>Launch Full Test</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Click anywhere inside the box to test your typing feel</span>
          </span>
          <span className="font-mono text-slate-500">
            {input.length}/{SAMPLE_TEXT.length} characters
          </span>
        </div>
      )}
    </div>
  );
};
