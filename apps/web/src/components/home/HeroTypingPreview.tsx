'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { calculateTypingMetrics } from '@keysmasher/shared';
import { playKeystrokeSound } from '@/features/typing/utils/soundEffects';

const SAMPLE_TEXT = 'smash the keys with precision speed and flawless rhythm';

// Precompute word structures to guarantee whole-word wrapping (no word is broken across lines)
const WORDS_WITH_INDICES = (() => {
  const words = SAMPLE_TEXT.split(' ');
  let currentIndex = 0;
  return words.map((word, wIdx) => {
    const chars = word.split('').map((char, cIdx) => ({
      char,
      globalIndex: currentIndex + cIdx,
    }));
    const wordStartIndex = currentIndex;
    currentIndex += word.length;
    const spaceIndex = wIdx < words.length - 1 ? currentIndex : null;
    if (spaceIndex !== null) {
      currentIndex += 1;
    }
    return {
      word,
      chars,
      wordStartIndex,
      spaceIndex,
    };
  });
})();

export const HeroTypingPreview: React.FC = () => {
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [caretPos, setCaretPos] = useState<{
    left: number;
    top: number;
    height: number;
    visible: boolean;
  }>({
    left: 0,
    top: 4,
    height: 28,
    visible: true,
  });

  // Calculate smooth caret coordinates relative to content box
  const updateCaretPosition = useCallback(() => {
    if (!contentRef.current) return;
    const contentRect = contentRef.current.getBoundingClientRect();

    if (input.length < SAMPLE_TEXT.length) {
      const charEl = contentRef.current.querySelector<HTMLElement>(
        `[data-char-idx="${input.length}"]`
      );
      if (charEl) {
        const charRect = charEl.getBoundingClientRect();
        setCaretPos({
          left: Math.round(charRect.left - contentRect.left),
          top: Math.round(charRect.top - contentRect.top + 4),
          height: Math.max(20, Math.round(charRect.height - 8)),
          visible: true,
        });
        return;
      }
    } else {
      // Completed - place caret at end of final character
      const lastCharEl = contentRef.current.querySelector<HTMLElement>(
        `[data-char-idx="${SAMPLE_TEXT.length - 1}"]`
      );
      if (lastCharEl) {
        const charRect = lastCharEl.getBoundingClientRect();
        setCaretPos({
          left: Math.round(charRect.right - contentRect.left + 1),
          top: Math.round(charRect.top - contentRect.top + 4),
          height: Math.max(20, Math.round(charRect.height - 8)),
          visible: true,
        });
        return;
      }
    }
  }, [input.length]);

  // Update caret on input change, window resize, and font load
  useEffect(() => {
    updateCaretPosition();
    const frame = requestAnimationFrame(updateCaretPosition);
    const timer = setTimeout(updateCaretPosition, 60);

    window.addEventListener('resize', updateCaretPosition);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      window.removeEventListener('resize', updateCaretPosition);
    };
  }, [updateCaretPosition]);

  // Global key listener and autofocus so typing starts immediately without clicking
  useEffect(() => {
    inputRef.current?.focus();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') &&
        active !== inputRef.current
      ) {
        return;
      }

      if (e.key === 'Escape') {
        handleReset();
        return;
      }

      if (document.activeElement !== inputRef.current) {
        if (
          (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.altKey
        ) {
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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
      if (val.length > input.length) {
        const lastChar = val[val.length - 1];
        const isError = SAMPLE_TEXT[val.length - 1] !== lastChar;
        playKeystrokeSound('click', isError, lastChar === ' ' ? 'space' : 'char');
      }
      setInput(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  // Calculate live preview metrics with word-level accuracy
  const sampleWords = SAMPLE_TEXT.split(' ');
  const inputWords = input.split(' ');
  let correctCount = 0;
  let incorrectCount = 0;

  for (let w = 0; w < inputWords.length; w++) {
    const isCurrentWord = w === inputWords.length - 1 && input.length < SAMPLE_TEXT.length;
    const typedWord = inputWords[w];
    const targetWord = sampleWords[w] || '';

    if (isCurrentWord) {
      let hasError = false;
      for (let c = 0; c < typedWord.length; c++) {
        if (c < targetWord.length && typedWord[c] === targetWord[c] && !hasError) {
          correctCount++;
        } else {
          hasError = true;
          incorrectCount++;
        }
      }
    } else {
      // Completed word
      if (typedWord === targetWord) {
        correctCount += targetWord.length;
        if (w < sampleWords.length - 1) {
          correctCount += 1; // space
        }
      } else {
        // Wrong word: characters do not award speed
        incorrectCount += typedWord.length;
        if (w < sampleWords.length - 1) {
          incorrectCount += 1; // space
        }
      }
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
      className={`group relative mx-auto mt-12 w-full max-w-3xl cursor-text rounded-2xl border bg-surface/90 p-6 shadow-neon-card backdrop-blur-xl transition-colors duration-150 ${
        isFocused ? 'border-cyan-400 shadow-neon-cyan' : 'border-cyan-500/30 hover:border-cyan-400/50'
      }`}
    >
      {/* Top Bar with Live Preview Stats & Clickable Controls */}
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
            <span className="font-bold text-cyan-400">{Math.round(metrics.netWpm)}</span>
          </div>
          <div>
            <span className="text-slate-500">ACC: </span>
            <span className="font-bold text-emerald-400">{Math.round(metrics.accuracy)}%</span>
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

      {/* Hidden real input - transparently layered to capture keystrokes */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="opacity-0 absolute inset-0 z-0 cursor-text pointer-events-none"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        aria-label="Interactive typing sandbox input"
      />

      {/* Rendered Text with Whole-Word Wrapping & Smooth Gliding Caret */}
      <div
        ref={contentRef}
        className="relative z-10 mt-6 min-h-[72px] font-mono text-xl sm:text-2xl leading-relaxed tracking-wider select-none text-left flex flex-wrap items-baseline gap-y-2"
      >
        {/* Hardware-accelerated gliding caret */}
        {caretPos.visible && (
          <div
            id="hero-caret"
            className={`absolute w-[2.5px] rounded-full shadow-[0_0_10px_#22d3ee] pointer-events-none z-10 transition-transform duration-75 ease-out ${
              isCompleted ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-cyan-400'
            } ${isFocused ? 'opacity-100' : 'animate-pulse'}`}
            style={{
              transform: `translate3d(${caretPos.left}px, ${caretPos.top}px, 0)`,
              height: `${caretPos.height}px`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Guaranteed Whole-Word Rendering (Words never break in half) */}
        {WORDS_WITH_INDICES.map((wordObj, wIdx) => (
          <React.Fragment key={wIdx}>
            <span className="inline-flex items-baseline whitespace-nowrap">
              {wordObj.chars.map(({ char, globalIndex }) => {
                const isTyped = globalIndex < input.length;
                const isCorrect = isTyped && input[globalIndex] === char;
                const isError = isTyped && input[globalIndex] !== char;

                let charClass = 'text-slate-500';
                if (isCorrect) {
                  charClass = 'text-cyan-300';
                } else if (isError) {
                  charClass = 'text-rose-400 bg-rose-500/20 rounded-[2px]';
                }

                return (
                  <span
                    key={globalIndex}
                    data-char-idx={globalIndex}
                    className={`inline-block ${charClass} transition-colors duration-75`}
                  >
                    {char}
                  </span>
                );
              })}
            </span>

            {/* Space separator */}
            {wordObj.spaceIndex !== null && (() => {
              const spaceIdx = wordObj.spaceIndex;
              const isTyped = spaceIdx < input.length;
              const isCorrect = isTyped && input[spaceIdx] === ' ';
              const isError = isTyped && input[spaceIdx] !== ' ';

              return (
                <span
                  key={`space-${spaceIdx}`}
                  data-char-idx={spaceIdx}
                  className={`inline-block w-2.5 sm:w-3 text-center transition-colors duration-75 ${
                    isError
                      ? 'bg-rose-500/40 text-rose-300 rounded-[2px] underline decoration-rose-500'
                      : 'text-slate-600'
                  }`}
                >
                  {isError ? '␣' : '\u00A0'}
                </span>
              );
            })()}
          </React.Fragment>
        ))}
      </div>

      {/* Completion Banner or Active Prompt */}
      {isCompleted ? (
        <div className="relative z-20 mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2.5 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold">
              Passage Completed! Speed: {Math.round(metrics.netWpm)} WPM • Accuracy:{' '}
              {Math.round(metrics.accuracy)}%
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
