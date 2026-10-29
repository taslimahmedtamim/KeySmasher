'use client';

import React from 'react';
import { getFingerForKey, FINGER_NAMES, FingerName } from '@keysmasher/shared';

interface VisualKeyboardProps {
  activeChar?: string;
  className?: string;
  compact?: boolean;
}

interface KeyConfig {
  char: string;
  label: string;
  finger: FingerName;
  width?: string;
}

const KEYBOARD_ROWS: KeyConfig[][] = [
  // Number row
  [
    { char: '`', label: '`', finger: 'left-pinky' },
    { char: '1', label: '1', finger: 'left-pinky' },
    { char: '2', label: '2', finger: 'left-ring' },
    { char: '3', label: '3', finger: 'left-middle' },
    { char: '4', label: '4', finger: 'left-index' },
    { char: '5', label: '5', finger: 'left-index' },
    { char: '6', label: '6', finger: 'right-index' },
    { char: '7', label: '7', finger: 'right-index' },
    { char: '8', label: '8', finger: 'right-middle' },
    { char: '9', label: '9', finger: 'right-ring' },
    { char: '0', label: '0', finger: 'right-pinky' },
    { char: '-', label: '-', finger: 'right-pinky' },
    { char: '=', label: '=', finger: 'right-pinky' },
  ],
  // Top row
  [
    { char: 'q', label: 'Q', finger: 'left-pinky' },
    { char: 'w', label: 'W', finger: 'left-ring' },
    { char: 'e', label: 'E', finger: 'left-middle' },
    { char: 'r', label: 'R', finger: 'left-index' },
    { char: 't', label: 'T', finger: 'left-index' },
    { char: 'y', label: 'Y', finger: 'right-index' },
    { char: 'u', label: 'U', finger: 'right-index' },
    { char: 'i', label: 'I', finger: 'right-middle' },
    { char: 'o', label: 'O', finger: 'right-ring' },
    { char: 'p', label: 'P', finger: 'right-pinky' },
    { char: '[', label: '[', finger: 'right-pinky' },
    { char: ']', label: ']', finger: 'right-pinky' },
  ],
  // Home row (anchor row)
  [
    { char: 'a', label: 'A', finger: 'left-pinky' },
    { char: 's', label: 'S', finger: 'left-ring' },
    { char: 'd', label: 'D', finger: 'left-middle' },
    { char: 'f', label: 'F', finger: 'left-index' },
    { char: 'g', label: 'G', finger: 'left-index' },
    { char: 'h', label: 'H', finger: 'right-index' },
    { char: 'j', label: 'J', finger: 'right-index' },
    { char: 'k', label: 'K', finger: 'right-middle' },
    { char: 'l', label: 'L', finger: 'right-ring' },
    { char: ';', label: ';', finger: 'right-pinky' },
    { char: "'", label: "'", finger: 'right-pinky' },
  ],
  // Bottom row
  [
    { char: 'z', label: 'Z', finger: 'left-pinky' },
    { char: 'x', label: 'X', finger: 'left-ring' },
    { char: 'c', label: 'C', finger: 'left-middle' },
    { char: 'v', label: 'V', finger: 'left-index' },
    { char: 'b', label: 'B', finger: 'left-index' },
    { char: 'n', label: 'N', finger: 'right-index' },
    { char: 'm', label: 'M', finger: 'right-index' },
    { char: ',', label: ',', finger: 'right-middle' },
    { char: '.', label: '.', finger: 'right-ring' },
    { char: '/', label: '/', finger: 'right-pinky' },
  ],
  // Spacebar row
  [{ char: ' ', label: 'Space', finger: 'thumb', width: 'w-64 sm:w-80' }],
];

export const VisualKeyboard: React.FC<VisualKeyboardProps> = ({
  activeChar = '',
  className = '',
  compact = false,
}) => {
  const normalizedActive = activeChar.toLowerCase();
  const activeGuide = getFingerForKey(activeChar);
  const activeFingerInfo = activeGuide ? FINGER_NAMES[activeGuide.finger] : null;

  return (
    <div
      className={`rounded-2xl border border-surface-border bg-surface/70 p-4 sm:p-6 backdrop-blur select-none ${className}`}
    >
      {/* Active Finger Hint Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-surface-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Key:</span>
          <span className="flex h-7 min-w-7 items-center justify-center rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-2 font-mono text-sm font-bold text-cyan-300 shadow-neon-cyan">
            {activeChar === ' ' ? '␣ Space' : activeChar || '—'}
          </span>
        </div>

        {activeFingerInfo && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Assigned Finger:</span>
            <span
              className={`rounded-lg border px-2.5 py-1 text-xs font-bold font-mono ${activeFingerInfo.colorClass}`}
            >
              {activeFingerInfo.label}
            </span>
          </div>
        )}
      </div>

      {/* Keyboard Matrix */}
      <div className="flex flex-col items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex items-center gap-1 sm:gap-1.5">
            {row.map((key) => {
              const isTarget = normalizedActive === key.char;
              const isSpace = key.char === ' ';
              const isHomingKey = key.char === 'f' || key.char === 'j';

              // Finger color accent
              let fingerBorder = 'border-slate-800';
              if (key.finger.includes('pinky')) fingerBorder = 'border-rose-900/40 hover:border-rose-500/60';
              else if (key.finger.includes('ring')) fingerBorder = 'border-amber-900/40 hover:border-amber-500/60';
              else if (key.finger.includes('middle')) fingerBorder = 'border-emerald-900/40 hover:border-emerald-500/60';
              else if (key.finger.includes('index')) fingerBorder = 'border-cyan-900/40 hover:border-cyan-500/60';
              else if (key.finger === 'thumb') fingerBorder = 'border-blue-900/40 hover:border-blue-500/60';

              const keyWidth = key.width || (compact ? 'w-7 sm:w-8 h-8 sm:h-9 text-xs' : 'w-8 sm:w-11 h-9 sm:h-12 text-xs sm:text-sm');

              return (
                <div
                  key={key.char}
                  className={`relative flex items-center justify-center rounded-lg border font-mono font-semibold transition-all duration-150 ${keyWidth} ${
                    isTarget
                      ? 'scale-110 z-10 border-cyan-400 bg-cyan-400 text-slate-950 font-black shadow-[0_0_18px_#22d3ee] animate-bounce-subtle'
                      : `bg-surface-muted/90 text-slate-300 ${fingerBorder}`
                  }`}
                >
                  <span>{isSpace ? '— Space —' : key.label}</span>

                  {/* Physical tactile bump bar for F and J */}
                  {isHomingKey && !isTarget && (
                    <span className="absolute bottom-1 h-0.5 w-3 rounded-full bg-slate-500 opacity-60" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Finger Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-surface-border/50 text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <span className="text-slate-400">Pinky</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-400">Ring</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-400">Middle</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
          <span className="text-slate-400">Index</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-400">Thumb</span>
        </div>
      </div>
    </div>
  );
};
