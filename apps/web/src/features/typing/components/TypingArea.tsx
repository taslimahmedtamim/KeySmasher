'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  const contentRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLDivElement>(null);
  const lastRowTopRef = useRef<number>(0);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [caretPos, setCaretPos] = useState<{
    left: number;
    top: number;
    height: number;
    visible: boolean;
  }>({
    left: 0,
    top: 4,
    height: 28,
    visible: false,
  });

  const [isTyping, setIsTyping] = useState(false);

  // Measure and update exact subpixel caret coordinates without altering word layout
  const updateCaretPosition = useCallback(() => {
    if (!contentRef.current || status === 'completed') {
      setCaretPos((prev) => ({ ...prev, visible: false }));
      return;
    }

    const currentWord = renderedWords[currentWordIndex];
    if (!currentWord) return;

    const contentRect = contentRef.current.getBoundingClientRect();

    // 1. If actively typing within the word bounds
    if (activeCharIndex < currentWord.characters.length) {
      const charEl = contentRef.current.querySelector<HTMLElement>(
        `[data-char-id="${currentWordIndex}-${activeCharIndex}"]`
      );
      if (charEl) {
        const charRect = charEl.getBoundingClientRect();
        const height = charRect.height > 0 ? Math.max(18, charRect.height - 8) : 28;
        const top = charRect.height > 0 ? charRect.top - contentRect.top + 4 : 4;
        setCaretPos({
          left: charRect.left - contentRect.left,
          top,
          height,
          visible: true,
        });
        return;
      }
    }

    // 2. If at the end of the word (typed all letters or extra characters)
    if (currentWord.characters.length > 0) {
      const lastCharEl = contentRef.current.querySelector<HTMLElement>(
        `[data-char-id="${currentWordIndex}-${currentWord.characters.length - 1}"]`
      );
      if (lastCharEl) {
        const charRect = lastCharEl.getBoundingClientRect();
        const height = charRect.height > 0 ? Math.max(18, charRect.height - 8) : 28;
        const top = charRect.height > 0 ? charRect.top - contentRect.top + 4 : 4;
        setCaretPos({
          left: charRect.right - contentRect.left,
          top,
          height,
          visible: true,
        });
        return;
      }
    }

    // 3. Fallback to start of active word
    const wordEl = contentRef.current.querySelector<HTMLElement>(
      `[data-word-id="${currentWordIndex}"]`
    );
    if (wordEl) {
      const wordRect = wordEl.getBoundingClientRect();
      const height = wordRect.height > 0 ? Math.max(18, wordRect.height - 8) : 28;
      const top = wordRect.height > 0 ? wordRect.top - contentRect.top + 4 : 4;
      setCaretPos({
        left: wordRect.left - contentRect.left,
        top,
        height,
        visible: true,
      });
    }
  }, [currentWordIndex, activeCharIndex, renderedWords, status]);

  // Sync caret coordinates whenever state updates
  useEffect(() => {
    updateCaretPosition();
    const frameId = requestAnimationFrame(updateCaretPosition);
    return () => cancelAnimationFrame(frameId);
  }, [updateCaretPosition]);

  // Window resize and font loading listener
  useEffect(() => {
    window.addEventListener('resize', updateCaretPosition);
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(updateCaretPosition);
    }
    return () => {
      window.removeEventListener('resize', updateCaretPosition);
    };
  }, [updateCaretPosition]);

  // Auto-scroll only when active word moves to a new line (>25px height difference)
  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      const container = containerRef.current;
      const word = activeWordRef.current;
      const wordTop = word.offsetTop;

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

  // Keystroke handler wrapper to pause caret pulse during active typing
  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsTyping(true);
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 450);

    onKeyDown(e);
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

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
        onKeyDown={handleKeyDownInternal}
        onChange={onInputChange}
        onPaste={onPaste}
        className="opacity-0 absolute inset-0 -z-10 w-full h-full cursor-text"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        aria-hidden="true"
      />

      {/* Inner relative container for smooth caret tracking */}
      <div ref={contentRef} className="relative min-w-full">
        {/* Smooth gliding caret bar */}
        {status !== 'completed' && caretPos.visible && (
          <div
            id="typing-caret"
            className={`absolute w-[2.5px] rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] pointer-events-none z-10 transition-transform duration-75 ease-out ${
              isTyping ? 'opacity-100' : 'animate-pulse'
            }`}
            style={{
              transform: `translate3d(${caretPos.left}px, ${caretPos.top}px, 0)`,
              height: `${caretPos.height}px`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Rendered Words & Characters - completely stable layout */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {renderedWords.map((word, wIdx) => {
            const isCurrentWord = wIdx === currentWordIndex;

            return (
              <div
                key={wIdx}
                ref={isCurrentWord ? activeWordRef : null}
                data-word-id={wIdx}
                className="relative flex items-center border-b-2 border-transparent transition-colors"
                style={{
                  borderBottomColor:
                    word.isCompleted && word.hasErrors ? 'rgba(244, 63, 94, 0.45)' : 'transparent',
                }}
              >
                {word.characters.map((charObj, cIdx) => {
                  let charStyle = 'text-slate-500';
                  if (charObj.state === 'correct') {
                    charStyle = 'text-cyan-300';
                  } else if (charObj.state === 'incorrect') {
                    charStyle = 'text-rose-400 bg-rose-500/20 rounded-[2px]';
                  } else if (charObj.state === 'extra') {
                    charStyle =
                      'text-rose-300 bg-rose-900/60 rounded-[2px] underline decoration-rose-500';
                  }

                  return (
                    <span
                      key={cIdx}
                      data-char-id={`${wIdx}-${cIdx}`}
                      className={`inline-block ${charStyle}`}
                    >
                      {charObj.char}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
