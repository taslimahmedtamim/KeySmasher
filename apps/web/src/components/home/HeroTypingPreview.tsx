'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { calculateTypingMetrics } from '@keysmasher/shared';

const SAMPLE_TEXT = 'smash the keys with precision speed and flawless rhythm';

export const HeroTypingPreview: React.FC = () => {
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (startTime && input.length < SAMPLE_TEXT.length) {
      interval = setInterval(() => {
        setElapsedSeconds((Date.now() - startTime) / 1000);
      }, 50);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Escape or Tab + Enter to reset
    if (e.key === 'Escape') {
      e.preventDefault();
      handleReset();
    }
  };

  const handleReset = () => {
    setInput('');
    setStartTime(null);
    setElapsedSeconds(0);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleBoxClick = () => {
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
      onClick={handleBoxClick}
      className={`group relative mx-auto mt-12 w-full max-w-3xl cursor-text rounded-2xl border bg-surface/90 p-6 shadow-neon-card backdrop-blur-xl transition-all ${
        isFocused ? 'border-cyan-400 shadow-neon-cyan' : 'border-cyan-500/30 hover:border-cyan-400/50'
      }`}
    >
      {/* Top Bar with Live Preview Stats & Fully Clickable Controls (z-20) */}
      <div className="relative z-20 flex items-center justify-between border-b border-surface-border/70 pb-3">
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
            id="sandbox-reset-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-surface px-2.5 py-1 text-slate-300 hover:border-cyan-400 hover:text-white transition-all active:scale-95"
            title="Reset sandbox (or press Escape)"
          >
            <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Hidden real input - positioned transparently behind text without capturing top-bar clicks */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="opacity-0 absolute inset-0 z-0 cursor-text"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* Rendered Text with Preserved Whitespace & Character Highlighting */}
      <div className="relative z-10 mt-6 min-h-[64px] font-mono text-xl sm:text-2xl leading-relaxed tracking-wider select-none text-left whitespace-pre-wrap">
        {SAMPLE_TEXT.split('').map((char, index) => {
          const isTyped = index < input.length;
          const isCurrent = index === input.length;
          const isCorrect = isTyped && input[index] === char;
          const isError = isTyped && input[index] !== char;
          const isSpace = char === ' ';

          let charClass = 'text-slate-500';

          if (isCorrect) {
            charClass = 'text-cyan-300';
          } else if (isError) {
            charClass = isSpace
              ? 'bg-rose-500/40 text-rose-300 rounded-sm underline decoration-rose-500'
              : 'text-rose-400 bg-rose-500/20 rounded-sm';
          }

          return (
            <span key={index} className="relative inline-block">
              {/* Active Smooth Pulsing Caret */}
              {isCurrent && (
                <span className="absolute -left-[1px] top-1 bottom-1 w-[2.5px] rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              )}
              <span className={charClass}>
                {isSpace ? (isError ? '␣' : '\u00A0') : char}
              </span>
            </span>
          );
        })}
        {/* Caret at end of passage */}
        {input.length === SAMPLE_TEXT.length && (
          <span className="relative inline-block">
            <span className="absolute -left-[1px] top-1 bottom-1 w-[2.5px] rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          </span>
        )}
      </div>

      {/* Completion Banner or Active Prompt */}
      {isCompleted ? (
        <div className="relative z-20 mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2.5 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold">
              Passage Completed! Speed: {metrics.rawWpm} WPM • Accuracy: {metrics.accuracy}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="flex items-center gap-1 font-semibold text-slate-300 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Try Again</span>
            </button>
            <Link
              href="/practice"
              className="flex items-center gap-1 rounded-lg bg-cyan-500 px-3 py-1 font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
            >
              <span>Full Practice Test</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative z-10 mt-4 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>
              {isFocused
                ? 'Type smoothly using home-row fingers. Hit Space to jump between words.'
                : 'Click here or start typing to test your keyboard touch feel'}
            </span>
          </span>
          <span className="font-mono text-slate-500">
            {input.length}/{SAMPLE_TEXT.length} chars
          </span>
        </div>
      )}
    </div>
  );
};
