'use client';

import React, { useState, useMemo } from 'react';
import {
  KeyAccuracyStat,
  WeakKeyDiagnostic,
  getFingerForKey,
  getKeysForFinger,
  FINGER_NAMES,
  FingerName,
} from '@keysmasher/shared';
import { Sparkles, AlertTriangle, CheckCircle2, Info, Compass, Hand } from 'lucide-react';

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
  [{ char: ' ', label: 'Space', finger: 'thumb', width: 'w-44 sm:w-56 h-8 sm:h-9' }],
];

type FilterType = 'all' | 'weak' | 'developing' | 'mastered';

function formatStrokeCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
}

interface HandFingerVisual {
  id: FingerName;
  shortTag: string;
  homeKey: string;
  height: string;
  isTactile?: boolean;
}

const HAND_LEFT_FINGERS: HandFingerVisual[] = [
  { id: 'left-pinky', shortTag: 'P', homeKey: 'A', height: 'h-11 sm:h-12' },
  { id: 'left-ring', shortTag: 'R', homeKey: 'S', height: 'h-14 sm:h-16' },
  { id: 'left-middle', shortTag: 'M', homeKey: 'D', height: 'h-16 sm:h-20' },
  { id: 'left-index', shortTag: 'I', homeKey: 'F', height: 'h-12 sm:h-14', isTactile: true },
  { id: 'thumb', shortTag: 'T', homeKey: '␣', height: 'h-8 sm:h-10' },
];

const HAND_RIGHT_FINGERS: HandFingerVisual[] = [
  { id: 'thumb', shortTag: 'T', homeKey: '␣', height: 'h-8 sm:h-10' },
  { id: 'right-index', shortTag: 'I', homeKey: 'J', height: 'h-12 sm:h-14', isTactile: true },
  { id: 'right-middle', shortTag: 'M', homeKey: 'K', height: 'h-16 sm:h-20' },
  { id: 'right-ring', shortTag: 'R', homeKey: 'L', height: 'h-14 sm:h-16' },
  { id: 'right-pinky', shortTag: 'P', homeKey: ';', height: 'h-11 sm:h-12' },
];

interface FingerTelemetryStat {
  finger: FingerName;
  label: string;
  homeKey: string;
  attempts: number;
  errors: number;
  correct: number;
  accuracy: number;
  errorRate: number;
  weakKeys: Array<{ char: string; display: string; accuracy: number; errors: number; attempts: number }>;
  needsWork: boolean;
}

const FINGER_ZONE_STYLE: Record<FingerName, string> = {
  'left-pinky': 'border-rose-500/60 bg-rose-500/15 text-rose-200',
  'left-ring': 'border-amber-500/60 bg-amber-500/15 text-amber-200',
  'left-middle': 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200',
  'left-index': 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200',
  thumb: 'border-blue-500/60 bg-blue-500/15 text-blue-200',
  'right-index': 'border-purple-500/60 bg-purple-500/15 text-purple-200',
  'right-middle': 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200',
  'right-ring': 'border-amber-500/60 bg-amber-500/15 text-amber-200',
  'right-pinky': 'border-rose-500/60 bg-rose-500/15 text-rose-200',
};

export const KeyboardHeatmap: React.FC<KeyboardHeatmapProps> = ({
  keyAccuracyMap = {},
  weakKeys = [],
  className = '',
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedFinger, setSelectedFinger] = useState<FingerName | null>(null);
  const [showFingerZones, setShowFingerZones] = useState<boolean>(false);
  const [filter, setFilter] = useState<FilterType>('all');

  // Complete per-finger telemetry (keystrokes, misses, accuracy, and weak keys)
  const fingerTelemetryMap = useMemo(() => {
    const map = {} as Record<FingerName, FingerTelemetryStat>;
    const allFingerIds: FingerName[] = [
      'left-pinky',
      'left-ring',
      'left-middle',
      'left-index',
      'thumb',
      'right-index',
      'right-middle',
      'right-ring',
      'right-pinky',
    ];

    for (const f of allFingerIds) {
      const info = FINGER_NAMES[f];
      map[f] = {
        finger: f,
        label: info.label,
        homeKey: info.homeKey === ' ' ? 'Space' : info.homeKey.toUpperCase(),
        attempts: 0,
        errors: 0,
        correct: 0,
        accuracy: 100,
        errorRate: 0,
        weakKeys: [],
        needsWork: false,
      };
    }

    for (const stat of Object.values(keyAccuracyMap)) {
      if (!stat || stat.attempts <= 0) continue;
      const guide = getFingerForKey(stat.char);
      const finger = guide ? guide.finger : stat.finger;
      const entry = map[finger];
      if (!entry) continue;

      entry.attempts += stat.attempts;
      entry.errors += stat.errors;
      if (stat.errors > 0 && stat.accuracy < 90) {
        entry.weakKeys.push({
          char: stat.char,
          display: stat.char === ' ' ? 'Space' : stat.char.toUpperCase(),
          accuracy: stat.accuracy,
          errors: stat.errors,
          attempts: stat.attempts,
        });
      }
    }

    for (const entry of Object.values(map)) {
      entry.correct = Math.max(0, entry.attempts - entry.errors);
      if (entry.attempts > 0) {
        entry.accuracy = Math.round((entry.correct / entry.attempts) * 100);
        entry.errorRate = 100 - entry.accuracy;
        entry.weakKeys.sort((a, b) => a.accuracy - b.accuracy || b.errors - a.errors);
        entry.needsWork = entry.accuracy < 90 || entry.weakKeys.length > 0;
      }
    }

    return map;
  }, [keyAccuracyMap]);

  const hasAnyTelemetry = useMemo(
    () => Object.values(fingerTelemetryMap).some((s) => s.attempts > 0),
    [fingerTelemetryMap]
  );

  // Ordered weak fingers for breakdown list
  const weakFingerGroups = useMemo(() => {
    return Object.values(fingerTelemetryMap)
      .filter((s) => s.needsWork)
      .map((s) => ({
        finger: s.finger,
        label: s.label,
        homeKey: s.homeKey,
        accuracy: s.accuracy,
        errorRate: s.errorRate,
        attempts: s.attempts,
        correct: s.correct,
        totalErrors: s.errors,
        worstAccuracy:
          s.weakKeys.length > 0
            ? Math.min(s.accuracy, ...s.weakKeys.map((w) => w.accuracy))
            : s.accuracy,
        keys: s.weakKeys,
      }))
      .sort((a, b) => a.worstAccuracy - b.worstAccuracy || b.totalErrors - a.totalErrors);
  }, [fingerTelemetryMap]);

  // Selected finger assigned keys & telemetry summary
  const selectedFingerSummary = useMemo(() => {
    if (!selectedFinger) return null;
    const info = FINGER_NAMES[selectedFinger];
    const stat = fingerTelemetryMap[selectedFinger];
    const assigned = getKeysForFinger(selectedFinger).map((k) => k.display);
    return {
      finger: selectedFinger,
      label: info.label,
      homeKey: info.homeKey === ' ' ? 'Space' : info.homeKey.toUpperCase(),
      assignedKeys: assigned,
      stat,
    };
  }, [selectedFinger, fingerTelemetryMap]);

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

  const getKeyHeatmapStyle = (char: string, finger: FingerName) => {
    if (showFingerZones) {
      const stat = keyAccuracyMap[char.toLowerCase()];
      const isWeak = Boolean(stat && stat.attempts > 0 && stat.accuracy < 90);
      return {
        tier: isWeak ? 'weak' : stat && stat.attempts > 0 ? 'tested' : 'untested',
        badge: !stat || stat.attempts === 0 ? FINGER_NAMES[finger].shortLabel : `${stat.accuracy}%`,
        classes: `${FINGER_ZONE_STYLE[finger]} ${isWeak ? 'ring-1 ring-rose-400/80' : ''}`,
      };
    }

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
        'border-rose-500/70 bg-rose-500/20 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.28)] hover:border-rose-400 hover:bg-rose-500/30',
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
            onClick={() => {
              setShowFingerZones(false);
              setFilter('all');
              setSelectedFinger(null);
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              filter === 'all' && !selectedFinger && !showFingerZones
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Keys
          </button>
          <button
            type="button"
            onClick={() => {
              setShowFingerZones(false);
              setSelectedFinger(null);
              setFilter('weak');
            }}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              filter === 'weak' && !showFingerZones
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Weak (&lt;90%)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowFingerZones(false);
              setSelectedFinger(null);
              setFilter('developing');
            }}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              filter === 'developing' && !showFingerZones
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Developing (90-96%)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowFingerZones(false);
              setSelectedFinger(null);
              setFilter('mastered');
            }}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              filter === 'mastered' && !showFingerZones
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Mastered (97%+)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowFingerZones((prev) => !prev);
              setFilter('all');
            }}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              showFingerZones
                ? 'bg-purple-500/20 text-purple-200 border border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.28)]'
                : 'text-slate-300 hover:text-purple-300'
            }`}
            title="Color every key by which finger presses it"
          >
            <Hand className="h-3 w-3" />
            <span>Finger Zones</span>
          </button>
        </div>
      </div>

      {/* Unified 3-Column Console: Left Hand | QWERTY Keyboard | Right Hand */}
      <div className="mt-5 flex flex-col lg:flex-row items-center justify-between gap-3">
        {(
          [
            { side: 'left' as const, title: 'Left Hand', fingers: HAND_LEFT_FINGERS },
            { side: 'right' as const, title: 'Right Hand', fingers: HAND_RIGHT_FINGERS },
          ] as const
        ).map((handPanel, idx) => {
          const handHasWeak =
            handPanel.fingers.some(
              (f) => f.id !== 'thumb' && fingerTelemetryMap[f.id]?.needsWork
            ) ||
            (handPanel.side === 'left' && fingerTelemetryMap.thumb?.needsWork);

          const handElement = (
            <div
              key={handPanel.side}
              className={`flex flex-col items-center justify-end rounded-xl border px-2.5 py-3 transition-all shrink-0 ${
                handHasWeak
                  ? 'border-rose-500/40 bg-rose-950/15'
                  : 'border-surface-border/60 bg-surface-muted/30'
              }`}
            >
              <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{handPanel.title}</span>
                {handHasWeak && (
                  <span
                    className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]"
                    title="Finger needing practice on this hand"
                  />
                )}
              </div>

              <div className="flex items-end gap-1.5">
                {handPanel.fingers.map((finger) => {
                  const fStat = fingerTelemetryMap[finger.id];
                  const isSelected =
                    selectedFinger === finger.id || inspectedKey?.guide?.finger === finger.id;
                  const isWeak = Boolean(fStat && fStat.needsWork);
                  const isTested = Boolean(fStat && fStat.attempts > 0);
                  const isDeveloping = isTested && !isWeak && fStat.accuracy < 97;

                  const topWeakBadge =
                    isWeak && (finger.id !== 'thumb' || handPanel.side === 'left')
                      ? fStat.weakKeys[0]?.display || `${fStat.accuracy}%`
                      : null;

                  let capsuleClasses =
                    'border-slate-800 bg-surface-muted text-slate-400 hover:border-slate-600';
                  let tipClasses = 'bg-slate-700/50';
                  let statTextClasses = 'text-slate-500';

                  if (isSelected) {
                    capsuleClasses =
                      'border-cyan-300 bg-cyan-500/25 text-cyan-200 scale-105 z-10 shadow-[0_0_14px_rgba(34,211,238,0.45)]';
                    tipClasses = 'bg-cyan-300 shadow-[0_0_6px_#22d3ee]';
                    statTextClasses = 'text-cyan-300 font-bold';
                  } else if (isWeak) {
                    capsuleClasses =
                      'border-rose-400 bg-rose-500/25 text-rose-100 shadow-[0_0_14px_rgba(244,63,94,0.38)] hover:border-rose-300';
                    tipClasses = 'bg-rose-300 shadow-[0_0_6px_#f43f5e]';
                    statTextClasses = 'text-rose-300 font-bold';
                  } else if (isDeveloping) {
                    capsuleClasses =
                      'border-amber-500/60 bg-amber-500/15 text-amber-200 hover:border-amber-400';
                    tipClasses = 'bg-amber-400/80';
                    statTextClasses = 'text-amber-300';
                  } else if (isTested) {
                    capsuleClasses =
                      'border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400';
                    tipClasses = 'bg-emerald-400/70';
                    statTextClasses = 'text-emerald-300';
                  }

                  return (
                    <button
                      key={`${handPanel.side}-${finger.id}`}
                      type="button"
                      onClick={() =>
                        setSelectedFinger((prev) => (prev === finger.id ? null : finger.id))
                      }
                      aria-label={`${handPanel.title} ${finger.shortTag} finger (${finger.homeKey}): ${
                        isTested
                          ? `${fStat.accuracy}% accuracy, ${fStat.attempts} keystrokes`
                          : 'Untested'
                      }`}
                      title={`${fStat.label} (Home [${fStat.homeKey}]): ${
                        isTested
                          ? `${fStat.accuracy}% accuracy • ${fStat.attempts} keystrokes (${fStat.errors} misses)`
                          : 'Untested'
                      }`}
                      className="flex flex-col items-center cursor-pointer focus:outline-none"
                    >
                      {/* Weak Key Badge */}
                      <div className="h-4 mb-1 flex items-center justify-center">
                        {topWeakBadge ? (
                          <span className="rounded border border-rose-300 bg-rose-500 px-1 py-0.5 font-mono text-[9px] font-black leading-none text-white shadow-[0_0_8px_rgba(244,63,94,0.65)]">
                            {topWeakBadge}
                          </span>
                        ) : (
                          <span className="text-[9px] text-transparent">—</span>
                        )}
                      </div>

                      {/* Finger Capsule */}
                      <div
                        className={`relative w-6 sm:w-7 rounded-t-xl border-2 transition-all duration-150 flex flex-col justify-between items-center py-1 ${finger.height} ${capsuleClasses}`}
                      >
                        <div className={`h-1.5 w-3.5 sm:w-4 rounded-t-sm ${tipClasses}`} />
                        <span className="font-mono text-[10px] font-black leading-none">
                          {finger.homeKey}
                        </span>
                        {finger.isTactile && (
                          <span className="absolute -bottom-1 h-0.5 w-2.5 rounded-full bg-cyan-400/80" />
                        )}
                      </div>

                      {/* Finger Accuracy % & Keystrokes */}
                      <span className={`mt-1 font-mono text-[9px] leading-tight tabular-nums ${statTextClasses}`}>
                        {isTested ? `${fStat.accuracy}%` : finger.shortTag}
                      </span>
                      <span
                        className="font-mono text-[8px] text-slate-400 tabular-nums leading-tight"
                        title={isTested ? `${fStat.attempts} keystrokes` : undefined}
                      >
                        {isTested ? formatStrokeCount(fStat.attempts) : '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );

          if (idx === 0) {
            return (
              <React.Fragment key="left-and-keyboard">
                {handElement}

                {/* Center Heatmap Keyboard Matrix */}
                <div className="flex-1 flex flex-col items-center justify-center overflow-x-auto py-1 max-w-full">
                  <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                    {HEATMAP_ROWS.map((row, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-1">
                        {row.map((key) => {
                          const heat = getKeyHeatmapStyle(key.char, key.finger);
                          const isSelected = selectedKey === key.char;
                          const isFingerMatch = selectedFinger === key.finger;
                          const isDimmedByFilter =
                            !showFingerZones &&
                            filter !== 'all' &&
                            heat.tier !== filter &&
                            heat.tier !== 'untested';
                          const isDimmedByFinger = selectedFinger !== null && !isFingerMatch;
                          const isDimmed = isDimmedByFinger || (!selectedFinger && isDimmedByFilter);
                          const isHomingKey = key.char === 'f' || key.char === 'j';

                          const widthClass =
                            key.width || 'w-6 sm:w-7 md:w-8 h-8 sm:h-9 md:h-10 text-xs';

                          return (
                            <button
                              key={key.char}
                              type="button"
                              onClick={() => setSelectedKey(isSelected ? null : key.char)}
                              className={`relative flex flex-col items-center justify-between rounded-lg border p-0.5 sm:p-1 font-mono font-bold transition-all duration-150 select-none ${widthClass} ${
                                heat.classes
                              } ${
                                isSelected || isFingerMatch ? 'ring-2 ring-cyan-400 scale-105 z-10' : ''
                              } ${isDimmed ? 'opacity-20 grayscale' : 'opacity-100'}`}
                              title={`Key ${key.label}: ${heat.badge}`}
                              aria-label={`Key ${key.label} (${FINGER_NAMES[key.finger].label}): ${heat.badge}`}
                            >
                              <span className="text-[11px] sm:text-xs font-black leading-none">
                                {key.label}
                              </span>
                              {isHomingKey && (
                                <span className="h-0.5 w-2 rounded-full bg-current opacity-80" />
                              )}
                              <span className="text-[8px] sm:text-[9px] font-mono font-bold leading-none opacity-95">
                                {showFingerZones
                                  ? FINGER_NAMES[key.finger].shortLabel.replace('. ', '.')
                                  : heat.tier === 'untested'
                                  ? '—'
                                  : heat.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </React.Fragment>
            );
          }

          return handElement;
        })}
      </div>

      {/* Compact Weak Finger Pills (Clean, non-clumsy summary; click any finger for details) */}
      {hasAnyTelemetry && (weakFingerGroups.length > 0 || selectedFingerSummary) && (
        <div className="mt-4 rounded-xl border border-surface-border/70 bg-surface/60 p-3 text-left">
          {weakFingerGroups.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 mr-1 shrink-0">
                <Hand className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-200">
                  Fingers to Work On
                </span>
              </div>

              {weakFingerGroups.map((group) => {
                const isActive = selectedFinger === group.finger;
                return (
                  <button
                    key={group.finger}
                    type="button"
                    onClick={() =>
                      setSelectedFinger((prev) => (prev === group.finger ? null : group.finger))
                    }
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] transition-all ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-500/15 text-white ring-1 ring-cyan-400 shadow-neon-cyan'
                        : 'border-rose-500/35 bg-surface/90 text-slate-200 hover:border-rose-400'
                    }`}
                  >
                    <span className="font-bold text-white">{group.label}</span>
                    <span className="font-mono text-[10px] text-cyan-300">Rest [{group.homeKey}]</span>
                    <span className="font-mono font-bold text-rose-300">{group.accuracy}%</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      ({group.attempts} keystrokes, {group.totalErrors}{' '}
                      {group.totalErrors === 1 ? 'miss' : 'misses'})
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected Finger Details (Shown cleanly only for the clicked finger) */}
          {selectedFingerSummary && (
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-surface-border/50 pt-2.5 text-xs text-cyan-200">
              <div className="flex flex-wrap items-center gap-2">
                <Compass className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>
                  Anchor your <strong>{selectedFingerSummary.label}</strong> on{' '}
                  <strong className="font-mono">[{selectedFingerSummary.homeKey}]</strong>. Keys owned by this finger:{' '}
                  <strong className="font-mono text-white">
                    {selectedFingerSummary.assignedKeys.join(', ')}
                  </strong>
                  .
                </span>
              </div>
              {selectedFingerSummary.stat && selectedFingerSummary.stat.weakKeys.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[11px] text-slate-400 mr-1">Weak:</span>
                  {selectedFingerSummary.stat.weakKeys.map((wk) => (
                    <span
                      key={wk.char}
                      className="inline-flex items-center rounded bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-200"
                    >
                      [{wk.display}] {wk.accuracy}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
        <div className="flex flex-wrap items-center gap-3">
          {showFingerZones ? (
            <>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span>Pinky</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>Ring</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Middle</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span>L. Index</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span>R. Index</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span>Thumb</span>
              </span>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
