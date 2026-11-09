'use client';

import React, { useState, useMemo } from 'react';
import { ExtendedTypingMetrics } from '@/features/typing/types';
import {
  analyzeTypingDiagnostics,
  generateWeakKeyDrillPassage,
  FINGER_NAMES,
  getFingerForKey,
  getKeysForFinger,
  FingerName,
} from '@keysmasher/shared';
import {
  Brain,
  Target,
  ArrowRight,
  Sparkles,
  Keyboard,
  ChevronDown,
  ChevronUp,
  Compass,
  AlertCircle,
  HelpCircle,
  Activity,
} from 'lucide-react';
import { KeyboardHeatmap } from './KeyboardHeatmap';

export interface PostTestCoachTipProps {
  metrics: ExtendedTypingMetrics;
  onApplyDrill?: (drillPassage: string) => void;
  className?: string;
}

const ALL_FINGERS_ORDER: FingerName[] = [
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

export const PostTestCoachTip: React.FC<PostTestCoachTipProps> = ({
  metrics,
  onApplyDrill,
  className = '',
}) => {
  const [showHeatmap, setShowHeatmap] = useState(false);

  const analysis = useMemo(() => {
    return analyzeTypingDiagnostics(metrics.keyStats || {}, {
      avgWpm: metrics.netWpm,
      avgAccuracy: metrics.accuracy,
      avgConsistency: metrics.consistency,
      totalTests: 1,
    });
  }, [metrics]);

  const topWeakKey = analysis.weakKeys[0];
  const primaryRecommendation = analysis.recommendations[0];

  // Look up detailed finger mapping for the bottleneck key
  const weakKeyGuide = useMemo(() => {
    if (!topWeakKey) return null;
    return getFingerForKey(topWeakKey.char);
  }, [topWeakKey]);

  // All keys assigned to this specific finger
  const fingerAssignedKeys = useMemo(() => {
    if (!topWeakKey) return [];
    return getKeysForFinger(topWeakKey.finger);
  }, [topWeakKey]);

  // Confusion analysis with finger information for mis-pressed keys
  const confusionDetails = useMemo(() => {
    if (!topWeakKey || topWeakKey.commonMistakes.length === 0) return [];
    return topWeakKey.commonMistakes.map((mistakeChar) => {
      const guide = getFingerForKey(mistakeChar);
      return {
        char: mistakeChar,
        display: mistakeChar.toUpperCase(),
        guide,
        fingerLabel: guide ? FINGER_NAMES[guide.finger].label : '',
        isOppositeHand: guide ? guide.hand !== topWeakKey.hand : false,
      };
    });
  }, [topWeakKey]);

  const handleStartDrill = () => {
    if (onApplyDrill) {
      const keys = analysis.weakKeys.length > 0 ? analysis.weakKeys.map((w) => w.char) : ['e', 't', 'a'];
      const drillText = generateWeakKeyDrillPassage(keys, 25);
      onApplyDrill(drillText);
    }
  };

  const isTrueBottleneck = Boolean(topWeakKey && topWeakKey.accuracy < 85);

  return (
    <div
      className={`rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-surface/80 to-purple-950/30 p-4 sm:p-5 backdrop-blur shadow-neon-card ${className}`}
    >
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/15 text-cyan-300 shadow-neon-cyan shrink-0">
            <Brain className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Coach Immediate Takeaway
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
                <Sparkles className="h-2.5 w-2.5" />
                Live Analysis
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-200 leading-normal max-w-xl">
              {isTrueBottleneck ? (
                <>
                  Bottleneck key <span className="font-bold text-rose-300">[{topWeakKey.display}]</span>{' '}
                  had {topWeakKey.errors} misses ({topWeakKey.accuracy}% accuracy). Assigned to{' '}
                  <span className="font-semibold text-cyan-300">
                    {FINGER_NAMES[topWeakKey.finger].label}
                  </span>
                  .{' '}
                  {topWeakKey.commonMistakes.length > 0 && (
                    <>Often mis-pressed as [{topWeakKey.commonMistakes.join(', ')}]. </>
                  )}
                  Focus on anchoring fingers cleanly to home row.
                </>
              ) : primaryRecommendation ? (
                primaryRecommendation.message
              ) : (
                'Clean execution with consistent cadence across all keys. Keep up your rhythmic pace!'
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons: Heatmap Toggle & Drill Missed Keys */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            id="toggle-heatmap-btn"
            onClick={() => setShowHeatmap((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors duration-150 ${
              showHeatmap
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-neon-cyan'
                : 'border-surface-border bg-surface text-slate-300 hover:border-slate-500 hover:text-white'
            }`}
            title="Inspect interactive QWERTY finger heatmap"
          >
            <Keyboard className="h-3.5 w-3.5 text-cyan-400" />
            <span>{showHeatmap ? 'Hide Finger Map' : 'Finger & Key Map'}</span>
            {showHeatmap ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {onApplyDrill && (
            <button
              type="button"
              id="drill-missed-keys-btn"
              onClick={handleStartDrill}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-3.5 py-2 text-xs font-black text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-300 hover:shadow-neon-cyan transition-colors duration-150 active:scale-95"
            >
              <Target className="h-3.5 w-3.5" />
              <span>Drill Missed Keys</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Detailed Pointing Finger & Key Reach Breakdown */}
      {isTrueBottleneck && weakKeyGuide && (
        <div className="mt-4 rounded-xl border border-cyan-500/25 bg-surface/90 p-3.5 text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-surface-border/60 pb-3">
            {/* Target keycap and reach trajectory */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-rose-500/60 bg-rose-500/20 font-mono text-base font-black text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                  {topWeakKey.display}
                </span>
                <span className="text-slate-500">◄──</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/10 font-mono text-xs font-bold text-cyan-300" title={`Home key [${weakKeyGuide.homeKey.toUpperCase()}]`}>
                  {weakKeyGuide.homeKey.toUpperCase()}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white capitalize">{FINGER_NAMES[topWeakKey.finger].label}</span>
                  <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                    {weakKeyGuide.hand.toUpperCase()} HAND
                  </span>
                  <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                    Home: [{weakKeyGuide.homeKey.toUpperCase()}]
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-300 flex items-center gap-1.5">
                  <Compass className="h-3 w-3 text-cyan-400 shrink-0" />
                  <span>{weakKeyGuide.instruction}</span>
                </p>
              </div>
            </div>

            {/* Keys assigned to this finger */}
            <div className="flex items-center gap-1.5 bg-surface-muted/60 px-3 py-1.5 rounded-lg border border-surface-border">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Finger Column:</span>
              <div className="flex items-center gap-1">
                {fingerAssignedKeys.map((k) => {
                  const isTarget = k.char.toLowerCase() === topWeakKey.char.toLowerCase();
                  const isHome = k.char.toLowerCase() === weakKeyGuide.homeKey.toLowerCase();
                  return (
                    <span
                      key={k.char}
                      className={`h-6 w-6 flex items-center justify-center rounded text-xs font-mono font-bold transition-all ${
                        isTarget
                          ? 'bg-rose-500/30 text-rose-300 border border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                          : isHome
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-surface text-slate-400 border border-slate-700'
                      }`}
                      title={`${k.display} (${k.row} row)`}
                    >
                      {k.display}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Deep Mis-press Diagnostic */}
          {confusionDetails.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-amber-400" />
                Mis-press Anatomy:
              </span>
              {confusionDetails.map((conf) => (
                <span
                  key={conf.char}
                  className="inline-flex items-center gap-1 rounded bg-surface-muted px-2 py-0.5 border border-surface-border text-slate-200"
                >
                  <span className="font-mono font-bold text-amber-300">[{conf.display}]</span>
                  <span className="text-slate-400">({conf.fingerLabel})</span>
                  {conf.isOppositeHand && (
                    <span className="text-[10px] text-purple-300 font-semibold ml-1">
                      • Mirror hand symmetry slip
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8-Finger + Thumb Balance Bar */}
      <div className="mt-4 border-t border-surface-border/50 pt-3">
        <div className="flex items-center justify-between mb-1.5 text-[10px] uppercase font-bold text-slate-400">
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-cyan-400" />
            <span>Finger Precision Spectrum</span>
          </span>
          <span>Left Hand ◄── Home Row ──► Right Hand</span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5 text-[11px] font-mono">
          {ALL_FINGERS_ORDER.map((finger) => {
            const stat = analysis.fingerStats[finger];
            const info = FINGER_NAMES[finger];
            const isWeakFinger = topWeakKey && topWeakKey.finger === finger && topWeakKey.accuracy < 85;

            let badgeClass = 'border-slate-800 bg-surface/60 text-slate-400';
            if (stat && stat.totalKeystrokes > 0) {
              if (isWeakFinger) {
                badgeClass = 'border-rose-500/50 bg-rose-500/20 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.25)]';
              } else if (stat.accuracy >= 95) {
                badgeClass = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
              } else if (stat.accuracy >= 85) {
                badgeClass = 'border-amber-500/40 bg-amber-500/10 text-amber-300';
              } else {
                badgeClass = 'border-rose-500/40 bg-rose-500/15 text-rose-300';
              }
            }

            return (
              <div
                key={finger}
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all ${badgeClass}`}
                title={`${info.label} (Home [${info.homeKey.toUpperCase()}]): ${stat ? `${stat.accuracy}% precision (${stat.errorCount} misses)` : 'Untested'}`}
              >
                <span className="text-[9px] text-slate-400 truncate max-w-full">
                  {info.shortLabel}
                </span>
                <span className="font-bold text-xs mt-0.5">
                  [{info.homeKey === ' ' ? 'Space' : info.homeKey.toUpperCase()}]
                </span>
                <span className="text-[10px] mt-0.5 tabular-nums">
                  {stat && stat.totalKeystrokes > 0 ? `${stat.accuracy}%` : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Interactive QWERTY Keyboard Heatmap */}
      {showHeatmap && (
        <div className="mt-4 border-t border-surface-border/60 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <KeyboardHeatmap
            keyAccuracyMap={analysis.keyAccuracyMap}
            weakKeys={analysis.weakKeys}
          />
        </div>
      )}
    </div>
  );
};
