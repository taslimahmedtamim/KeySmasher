'use client';

import React from 'react';
import {
  FingerName,
  FINGER_NAMES,
  getFingerForKey,
  KeyFingerGuide,
} from '@keysmasher/shared';
import { ArrowRight, Compass } from 'lucide-react';

interface UnifiedGuidanceConsoleProps {
  activeChar?: string;
  className?: string;
}

interface KeyConfig {
  char: string;
  label: string;
  finger: FingerName;
  width?: string;
}

interface FingerModel {
  id: FingerName;
  name: string;
  shortName: string;
  homeKey: string;
  hand: 'left' | 'right';
  height: string;
  color: string;
  hex: string;
  isTactile?: boolean;
}

const LEFT_FINGERS: FingerModel[] = [
  { id: 'left-pinky', name: 'Pinky', shortName: 'P', homeKey: 'A', hand: 'left', height: 'h-12 sm:h-14', color: 'rose', hex: '#f43f5e' },
  { id: 'left-ring', name: 'Ring', shortName: 'R', homeKey: 'S', hand: 'left', height: 'h-16 sm:h-20', color: 'amber', hex: '#f59e0b' },
  { id: 'left-middle', name: 'Middle', shortName: 'M', homeKey: 'D', hand: 'left', height: 'h-18 sm:h-22', color: 'emerald', hex: '#10b981' },
  { id: 'left-index', name: 'Index', shortName: 'I', homeKey: 'F', hand: 'left', height: 'h-16 sm:h-18', color: 'cyan', hex: '#22d3ee', isTactile: true },
  { id: 'thumb', name: 'Thumb', shortName: 'T', homeKey: '␣', hand: 'left', height: 'h-10 sm:h-12', color: 'blue', hex: '#3b82f6' },
];

const RIGHT_FINGERS: FingerModel[] = [
  { id: 'thumb', name: 'Thumb', shortName: 'T', homeKey: '␣', hand: 'right', height: 'h-10 sm:h-12', color: 'blue', hex: '#3b82f6' },
  { id: 'right-index', name: 'Index', shortName: 'I', homeKey: 'J', hand: 'right', height: 'h-16 sm:h-18', color: 'cyan', hex: '#22d3ee', isTactile: true },
  { id: 'right-middle', name: 'Middle', shortName: 'M', homeKey: 'K', hand: 'right', height: 'h-18 sm:h-22', color: 'emerald', hex: '#10b981' },
  { id: 'right-ring', name: 'Ring', shortName: 'R', homeKey: 'L', hand: 'right', height: 'h-16 sm:h-20', color: 'amber', hex: '#f59e0b' },
  { id: 'right-pinky', name: 'Pinky', shortName: 'P', homeKey: ';', hand: 'right', height: 'h-12 sm:h-14', color: 'rose', hex: '#f43f5e' },
];

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
  [{ char: ' ', label: 'Space', finger: 'thumb', width: 'w-48 sm:w-64 md:w-72' }],
];

export const UnifiedGuidanceConsole: React.FC<UnifiedGuidanceConsoleProps> = ({
  activeChar = '',
  className = '',
}) => {
  const normalizedActive = activeChar.toLowerCase();
  const guide: KeyFingerGuide | null = getFingerForKey(activeChar);
  const activeFingerId = guide?.finger;
  const activeHand = guide?.hand;
  const isReach = Boolean(
    guide && guide.homeKey.toLowerCase() !== normalizedActive && normalizedActive !== ' '
  );
  const homeAnchorChar = guide ? guide.homeKey.toLowerCase() : '';

  return (
    <div
      className={`rounded-2xl border border-surface-border bg-surface/85 p-3.5 sm:p-4 backdrop-blur shadow-neon-card select-none ${className}`}
    >
      {/* 3-Column Unified Layout: Left Hand | Keyboard Matrix | Right Hand */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-4">
        {/* LEFT HAND PANEL */}
        <div
          className={`flex flex-col items-center justify-end rounded-xl border p-2.5 transition-all duration-200 shrink-0 ${
            activeHand === 'left'
              ? 'border-cyan-500/50 bg-cyan-500/5 shadow-neon-card'
              : 'border-surface-border/50 bg-surface-muted/30 opacity-70'
          }`}
        >
          <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Left Hand</span>
            {activeHand === 'left' && (
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>

          <div className="flex items-end gap-1.5 sm:gap-2">
            {LEFT_FINGERS.map((finger) => {
              const isActive = activeHand === 'left' && activeFingerId === finger.id;

              return (
                <div key={finger.id} className="flex flex-col items-center">
                  {/* Active target popover */}
                  <div className="h-5 flex items-center justify-center">
                    {isActive ? (
                      <span className="rounded bg-cyan-400 text-slate-950 px-1 font-mono text-[10px] font-black shadow-[0_0_8px_#22d3ee]">
                        {activeChar === ' ' ? '␣' : activeChar.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-[9px] text-transparent">—</span>
                    )}
                  </div>

                  {/* Finger Capsule */}
                  <div
                    className={`relative w-5 sm:w-6 rounded-t-xl border transition-all duration-150 flex flex-col justify-between items-center py-1 ${
                      finger.height
                    } ${
                      isActive
                        ? 'border-cyan-300 bg-cyan-500/30 scale-105 z-10 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                        : 'border-slate-800 bg-surface-muted'
                    }`}
                  >
                    <div
                      className={`h-2 w-3.5 sm:w-4 rounded-t-sm ${
                        isActive ? 'bg-cyan-300' : 'bg-slate-700/50'
                      }`}
                    />

                    {/* Home Key letter */}
                    <span
                      className={`font-mono text-[9px] sm:text-[10px] font-bold ${
                        isActive ? 'text-cyan-200 font-black' : 'text-slate-400'
                      }`}
                    >
                      {finger.homeKey}
                    </span>
                  </div>

                  <span
                    className={`mt-1 font-mono text-[9px] ${
                      isActive ? 'text-cyan-300 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {finger.shortName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER KEYBOARD MATRIX */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-x-auto py-1">
          <div className="flex flex-col items-center gap-1 sm:gap-1.5">
            {KEYBOARD_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="flex items-center gap-1 sm:gap-1.5">
                {row.map((key) => {
                  const isTarget = normalizedActive === key.char;
                  const isHomeAnchor = isReach && key.char === homeAnchorChar;
                  const isSpace = key.char === ' ';
                  const isHomingKey = key.char === 'f' || key.char === 'j';

                  let fingerBorder = 'border-slate-800';
                  if (key.finger.includes('pinky')) fingerBorder = 'border-rose-900/30 hover:border-rose-500/50';
                  else if (key.finger.includes('ring')) fingerBorder = 'border-amber-900/30 hover:border-amber-500/50';
                  else if (key.finger.includes('middle')) fingerBorder = 'border-emerald-900/30 hover:border-emerald-500/50';
                  else if (key.finger.includes('index')) fingerBorder = 'border-cyan-900/30 hover:border-cyan-500/50';
                  else if (key.finger === 'thumb') fingerBorder = 'border-blue-900/30 hover:border-blue-500/50';

                  const keyWidth = key.width || 'w-6 sm:w-8 md:w-9 h-7 sm:h-8 md:h-9 text-[11px] sm:text-xs';

                  return (
                    <div
                      key={key.char}
                      className={`relative flex items-center justify-center rounded-md border font-mono font-semibold transition-all duration-100 ${keyWidth} ${
                        isTarget
                          ? 'scale-110 z-20 border-cyan-300 bg-cyan-400 text-slate-950 font-black shadow-[0_0_16px_#22d3ee]'
                          : isHomeAnchor
                          ? 'z-10 border-2 border-dashed border-amber-400 bg-amber-400/20 text-amber-200'
                          : `bg-surface-muted/90 text-slate-300 ${fingerBorder}`
                      }`}
                    >
                      <span>{isSpace ? '— Space —' : key.label}</span>

                      {/* Tactile bump marker */}
                      {isHomingKey && !isTarget && (
                        <span className="absolute bottom-0.5 h-0.5 w-2 sm:w-2.5 rounded-full bg-slate-500 opacity-60" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT HAND PANEL */}
        <div
          className={`flex flex-col items-center justify-end rounded-xl border p-2.5 transition-all duration-200 shrink-0 ${
            activeHand === 'right'
              ? 'border-cyan-500/50 bg-cyan-500/5 shadow-neon-card'
              : 'border-surface-border/50 bg-surface-muted/30 opacity-70'
          }`}
        >
          <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Right Hand</span>
            {activeHand === 'right' && (
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>

          <div className="flex items-end gap-1.5 sm:gap-2">
            {RIGHT_FINGERS.map((finger) => {
              const isActive = activeHand === 'right' && activeFingerId === finger.id;

              return (
                <div key={`${finger.id}-${finger.homeKey}`} className="flex flex-col items-center">
                  {/* Active target popover */}
                  <div className="h-5 flex items-center justify-center">
                    {isActive ? (
                      <span className="rounded bg-cyan-400 text-slate-950 px-1 font-mono text-[10px] font-black shadow-[0_0_8px_#22d3ee]">
                        {activeChar === ' ' ? '␣' : activeChar.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-[9px] text-transparent">—</span>
                    )}
                  </div>

                  {/* Finger Capsule */}
                  <div
                    className={`relative w-5 sm:w-6 rounded-t-xl border transition-all duration-150 flex flex-col justify-between items-center py-1 ${
                      finger.height
                    } ${
                      isActive
                        ? 'border-cyan-300 bg-cyan-500/30 scale-105 z-10 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                        : 'border-slate-800 bg-surface-muted'
                    }`}
                  >
                    <div
                      className={`h-2 w-3.5 sm:w-4 rounded-t-sm ${
                        isActive ? 'bg-cyan-300' : 'bg-slate-700/50'
                      }`}
                    />

                    {/* Home Key letter */}
                    <span
                      className={`font-mono text-[9px] sm:text-[10px] font-bold ${
                        isActive ? 'text-cyan-200 font-black' : 'text-slate-400'
                      }`}
                    >
                      {finger.homeKey}
                    </span>
                  </div>

                  <span
                    className={`mt-1 font-mono text-[9px] ${
                      isActive ? 'text-cyan-300 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {finger.shortName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Movement & Placement Coach Strip */}
      {guide && (
        <div className="mt-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-3 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-200">{guide.instruction}</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px] shrink-0">
            <span className="text-slate-400">Finger:</span>
            <span className="font-bold text-cyan-300">{FINGER_NAMES[guide.finger]?.label}</span>
            {isReach && (
              <>
                <span className="text-slate-500">|</span>
                <span className="text-amber-300 font-bold">[{guide.homeKey.toUpperCase()}]</span>
                <ArrowRight className="h-3 w-3 text-cyan-400" />
                <span className="text-cyan-300 font-black">[{activeChar.toUpperCase()}]</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
