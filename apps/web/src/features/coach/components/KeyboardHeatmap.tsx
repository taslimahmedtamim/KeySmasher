'use client';

import React, { useState, useMemo } from 'react';
import {
  KeyAccuracyStat,
  WeakKeyDiagnostic,
  getFingerForKey,
  FINGER_NAMES,
  FingerName,
} from '@keysmasher/shared';
import { Sparkles, AlertTriangle, CheckCircle2, Info, Compass } from 'lucide-react';

export interface KeyboardHeatmapProps {
  keyAccuracyMap?: Record<string, KeyAccuracyStat>;
  weakKeys?: WeakKeyDiagnostic[];
  className?: string;
}

interface KeyDefinition {
  char: string;
  label: string;
  finger: FingerName;
  width?: string;
}

const HEATMAP_ROWS: KeyDefinition[][] = [
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
  // Spacebar
  [{ char: ' ', label: 'Space', finger: 'thumb', width: 'w-60 sm:w-72' }],
];

type FilterType = 'all' | 'weak' | 'developing' | 'mastered';

export const KeyboardHeatmap: React.FC<KeyboardHeatmapProps> = ({
  keyAccuracyMap = {},
  weakKeys = [],
  className = '',
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  // Find inspected key details
  const inspectedKey = useMemo(() => {
    if (!selectedKey) return null;
    const stat = keyAccuracyMap[selectedKey];
    const guide = getFingerForKey(selectedKey);
    const weakInfo = weakKeys.find((w) => w.char === selectedKey);
    return {
      char: selectedKey,
      display: selectedKey === ' ' ? '␣ Space' : selectedKey.toUpperCase(),
      stat,
      guide,
      weakInfo,
    };
  }, [selectedKey, keyAccuracyMap, weakKeys]);

  const getKeyHeatmapStyle = (char: string) => {
    const stat = keyAccuracyMap[char.toLowerCase()];
    if (!stat || stat.attempts === 0) {
      return {
        tier: 'untested',
        badge: 'Untested',
        classes:
          'border-surface-border/70 bg-surface-muted/30 text-slate-400 hover:border-slate-500 hover:bg-surface-muted/60',
      };
    }

    if (stat.accuracy >= 97) {
      return {
        tier: 'mastered',
        badge: `${stat.accuracy}%`,
        classes:
          'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:border-emerald-400 hover:bg-emerald-500/25',
      };
    }

    if (stat.accuracy >= 90) {
      return {
        tier: 'developing',
        badge: `${stat.accuracy}%`,
        classes:
          'border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:border-amber-400 hover:bg-amber-500/25',
      };
    }

    return {
      tier: 'weak',
      badge: `${stat.accuracy}%`,
      classes:
        'border-rose-500/60 bg-rose-500/20 text-rose-300 shadow-[0_0_14px_rgba(244,63,94,0.3)] animate-pulse hover:border-rose-400 hover:bg-rose-500/30',
    };
  };

  return (
    <div
      className={`rounded-3xl border border-surface-border bg-gradient-to-b from-surface via-surface/95 to-surface-muted/40 p-5 sm:p-7 shadow-neon-card ${className}`}
    >
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
              QWERTY Keystroke Precision Heatmap
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time character accuracy matrix derived from your verified typing test sessions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center bg-surface-muted/60 p-1 rounded-xl border border-surface-border">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Keys
          </button>
          <button
            type="button"
            onClick={() => setFilter('weak')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              filter === 'weak'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Weak (&lt;90%)</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('developing')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              filter === 'developing'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Developing (90-96%)</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('mastered')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              filter === 'mastered'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Mastered (97%+)</span>
          </button>
        </div>
      </div>

      {/* Heatmap Keyboard Matrix */}
      <div className="mt-6 flex flex-col items-center gap-1.5 sm:gap-2 overflow-x-auto py-2">
        {HEATMAP_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex items-center gap-1 sm:gap-1.5">
            {row.map((key) => {
              const heat = getKeyHeatmapStyle(key.char);
              const isSelected = selectedKey === key.char;
              const isDimmed = filter !== 'all' && heat.tier !== filter && heat.tier !== 'untested';
              const isHomingKey = key.char === 'f' || key.char === 'j';

              const widthClass =
                key.width || 'w-8 sm:w-11 h-9 sm:h-12 text-xs sm:text-sm';

              return (
                <button
                  key={key.char}
                  type="button"
                  onClick={() => setSelectedKey(isSelected ? null : key.char)}
                  className={`relative flex flex-col items-center justify-between rounded-xl border p-1 sm:p-1.5 font-mono font-bold transition-all duration-150 select-none ${widthClass} ${
                    heat.classes
                  } ${isSelected ? 'ring-2 ring-cyan-400 scale-105 z-10' : ''} ${
                    isDimmed ? 'opacity-25 grayscale' : 'opacity-100'
                  }`}
                  title={`Key ${key.label}: ${heat.badge}`}
                >
                  {/* Key Label */}
                  <span className="text-[11px] sm:text-xs font-black">{key.label}</span>

                  {/* Tactile Bumps on F and J */}
                  {isHomingKey && (
                    <span className="h-0.5 w-2 sm:w-3 rounded-full bg-current opacity-70" />
                  )}

                  {/* Accuracy micro badge */}
                  <span className="text-[8px] sm:text-[9px] font-mono leading-none opacity-80">
                    {heat.tier === 'untested' ? '—' : heat.badge}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Inspected Key Telemetry Drawer */}
      {inspectedKey && (
        <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4 sm:p-5 backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 min-w-[48px] px-3 items-center justify-center rounded-xl border border-cyan-400/50 bg-cyan-500/20 font-mono text-lg font-black text-cyan-300 shadow-neon-cyan whitespace-nowrap">
                {inspectedKey.char === ' ' ? '␣ Space' : inspectedKey.display}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">
                    Key Telemetry: [{inspectedKey.display}]
                  </h4>
                  {inspectedKey.weakInfo && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      Weak Key Diagnostic
                    </span>
                  )}
                  {inspectedKey.stat && inspectedKey.stat.accuracy >= 97 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Mastered
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-300">
                  Assigned Finger:{' '}
                  <span className="font-semibold text-cyan-300">
                    {inspectedKey.guide ? FINGER_NAMES[inspectedKey.guide.finger].label : 'Thumb'}
                  </span>
                  {' • '}
                  Hand: <span className="capitalize font-semibold text-cyan-300">{inspectedKey.guide?.hand || 'Right'}</span>
                </p>
              </div>
            </div>

            {/* Metrics Chips */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-surface-border bg-surface-muted/60 px-3 py-2 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Attempts</div>
                <div className="text-sm font-black text-white">
                  {inspectedKey.stat ? inspectedKey.stat.attempts : 0}
                </div>
              </div>
              <div className="rounded-xl border border-surface-border bg-surface-muted/60 px-3 py-2 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Misses</div>
                <div className="text-sm font-black text-rose-400">
                  {inspectedKey.stat ? inspectedKey.stat.errors : 0}
                </div>
              </div>
              <div className="rounded-xl border border-surface-border bg-surface-muted/60 px-3 py-2 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Accuracy</div>
                <div className="text-sm font-black text-cyan-400">
                  {inspectedKey.stat ? `${inspectedKey.stat.accuracy}%` : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Guidance cue and confusion info */}
          <div className="mt-3.5 flex flex-wrap items-center gap-4 border-t border-surface-border/60 pt-3 text-xs text-slate-300">
            {inspectedKey.guide && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <Compass className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>{inspectedKey.guide.instruction}</span>
              </div>
            )}

            {inspectedKey.stat && Object.keys(inspectedKey.stat.confusion).length > 0 && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-400">Frequent Mis-presses:</span>
                <div className="flex items-center gap-1 font-mono">
                  {Object.entries(inspectedKey.stat.confusion)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([confusedChar, count]) => (
                      <span
                        key={confusedChar}
                        className="rounded border border-surface-border bg-surface-muted px-1.5 py-0.5 text-[11px] text-amber-300"
                      >
                        [{confusedChar.toUpperCase()}] ({count}x)
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Heatmap Footer Helper */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 border-t border-surface-border/40 pt-3">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-cyan-400" />
          <span>Click any key above to inspect assigned finger mechanics and error frequency.</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>&ge; 97% Mastered</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>90–96% Developing</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span>&lt; 90% Weak</span>
          </span>
        </div>
      </div>
    </div>
  );
};
