'use client';

import React, { useRef, useEffect } from 'react';
import { RenderedWord } from '../types';

export interface TypingAreaProps {
  renderedWords: RenderedWord[];
  currentWordIndex: number;
  activeCharIndex: number;
  status: 'idle' | 'active' | 'completed' | 'cancelled';
  inputRef: React.RefObject<HTMLInputElement | null>;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  className?: string;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  renderedWords,
  currentWordIndex,
  activeCharIndex,
  status,
  inputRef,
  onKeyDown,
  onInputChange,
  onPaste,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLDivElement>(null);
  const lastRowTopRef = useRef<number>(0);

  // Auto-scroll only when active word moves to a new line
  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      const container = containerRef.current;
      const word = activeWordRef.current;
      const wordTop = word.offsetTop;

      // Only scroll when transitioning to a distinctly different line (> 25px height difference)
      if (Math.abs(wordTop - lastRowTopRef.current) > 25) {
        lastRowTopRef.current = wordTop;
        const containerTop = container.offsetTop;
        const relativeTop = wordTop - containerTop;

        if (relativeTop > 65) {
          container.scrollTo({
            top: wordTop - containerTop - 45,
            behavior: 'smooth',
          });
        } else if (relativeTop <= 35) {
          container.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [currentWordIndex]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={`relative max-h-[170px] overflow-hidden cursor-text font-mono text-xl sm:text-2xl leading-[2.2] tracking-wider select-none text-left focus:outline-none ${className}`}
      tabIndex={0}
      role="region"
      aria-label="Typing passage input area"
    >
      {/* Hidden real input capturing keystrokes */}
      <input
        ref={inputRef}
        type="text"
        onKeyDown={onKeyDown}
        onChange={onInputChange}
        onPaste={onPaste}
        className="opacity-0 absolute inset-0 -z-10 w-full h-full cursor-text"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        aria-hidden="true"
      />

      {/* Rendered Words & Characters */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {renderedWords.map((word, wIdx) => {
          const isCurrentWord = wIdx === currentWordIndex;

          return (
            <div
              key={wIdx}
              ref={isCurrentWord ? activeWordRef : null}
              className={`relative flex items-center transition-colors ${
                word.isCompleted && word.hasErrors ? 'border-b border-rose-500/40' : ''
              }`}
            >
              {word.characters.map((charObj, cIdx) => {
                const isCurrentChar = isCurrentWord && cIdx === activeCharIndex;

                let charStyle = 'text-slate-500';
                if (charObj.state === 'correct') {
                  charStyle = 'text-cyan-300 font-medium';
                } else if (charObj.state === 'incorrect') {
                  charStyle = 'text-rose-400 bg-rose-500/20 rounded-[2px]';
                } else if (charObj.state === 'extra') {
                  charStyle = 'text-rose-300 bg-rose-900/60 rounded-[2px] underline decoration-rose-500';
                }

                return (
                  <span key={cIdx} className="relative inline-block">
                    {/* Active Caret */}
                    {isCurrentChar && status !== 'completed' && (
                      <span
                        className="absolute -left-[1.5px] top-1 bottom-1 w-[2.5px] rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse pointer-events-none"
                        aria-hidden="true"
                      />
                    )}
                    <span className={charStyle}>{charObj.char}</span>
                  </span>
                );
              })}

              {/* Caret at end of word if user typed all characters or extra */}
              {isCurrentWord && activeCharIndex >= word.characters.length && status !== 'completed' && (
                <span className="relative inline-block">
                  <span
                    className="absolute -left-[1.5px] top-1 bottom-1 w-[2.5px] rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse pointer-events-none"
                    aria-hidden="true"
                  />
                  <span className="opacity-0">_</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
