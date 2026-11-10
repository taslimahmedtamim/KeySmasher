'use client';

import React, { useState, useMemo } from 'react';
import { ExtendedTypingMetrics } from '@/features/typing/types';
import {
  analyzeTypingDiagnostics,
  generateWeakKeyDrillPassage,
  getFingerForKey,
  FINGER_NAMES,
} from '@keysmasher/shared';
import {
  Brain,
  Target,
  ArrowRight,
  Sparkles,
  Keyboard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { KeyboardHeatmap } from './KeyboardHeatmap';

export interface PostTestCoachTipProps {
  metrics: ExtendedTypingMetrics;
  onApplyDrill?: (drillPassage: string, targetKeys?: string[]) => void;
  className?: string;
}

export const PostTestCoachTip: React.FC<PostTestCoachTipProps> = ({
  metrics,
  onApplyDrill,
  className = '',
}) => {
  const [showHeatmap, setShowHeatmap] = useState(true);

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

  // Collect all keys needing drill (all <90% error keys, then any remaining keys with misses)
  const drillTargetKeys = useMemo(() => {
    const ordered: string[] = [];
    const seen = new Set<string>();

    for (const wk of analysis.weakKeys) {
      if (!seen.has(wk.char)) {
        seen.add(wk.char);
        ordered.push(wk.char);
      }
    }

    const extraWeak = Object.values(analysis.keyAccuracyMap)
      .filter((s) => s.attempts > 0 && s.errors > 0 && s.accuracy < 90 && !seen.has(s.char))
      .sort((a, b) => a.accuracy - b.accuracy || b.errors - a.errors);

    for (const item of extraWeak) {
      seen.add(item.char);
      ordered.push(item.char);
    }

    if (ordered.length === 0) {
      const anyErrored = Object.values(analysis.keyAccuracyMap)
        .filter((s) => s.attempts > 0 && s.errors > 0)
        .sort((a, b) => a.accuracy - b.accuracy || b.errors - a.errors);
      for (const item of anyErrored) {
        ordered.push(item.char);
      }
    }

    return ordered;
  }, [analysis]);

  // Unique fingers needing work based on weak (<90%) keys
  const fingersToWorkOn = useMemo(() => {
    const labels: string[] = [];
    const seen = new Set<string>();
    const redKeys = Object.values(analysis.keyAccuracyMap)
      .filter((s) => s.attempts > 0 && s.errors > 0 && s.accuracy < 90)
      .sort((a, b) => a.accuracy - b.accuracy || b.errors - a.errors);

    for (const st of redKeys) {
      const guide = getFingerForKey(st.char);
      const label = guide ? FINGER_NAMES[guide.finger].label : FINGER_NAMES[st.finger].label;
      if (!seen.has(label)) {
        seen.add(label);
        labels.push(label);
      }
    }
    return labels;
  }, [analysis]);

  const handleStartDrill = () => {
    if (onApplyDrill) {
      const keys = drillTargetKeys.length > 0 ? drillTargetKeys : ['e', 't', 'a'];
      const drillText = generateWeakKeyDrillPassage(keys, 25);
      onApplyDrill(drillText, keys);
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
                  had {topWeakKey.errors} {topWeakKey.errors === 1 ? 'miss' : 'misses'} ({topWeakKey.accuracy}% accuracy). Assigned to{' '}
                  <span className="font-semibold text-cyan-300">
                    {FINGER_NAMES[topWeakKey.finger].label}
                  </span>
                  .{' '}
                  {topWeakKey.commonMistakes.length > 0 && (
                    <>Often mis-pressed as [{topWeakKey.commonMistakes.join(', ')}]. </>
                  )}
                  {fingersToWorkOn.length > 1 ? (
                    <>
                      Fingers needing work:{' '}
                      <span className="font-semibold text-rose-200">
                        {fingersToWorkOn.join(', ')}
                      </span>
                      .
                    </>
                  ) : (
                    <>Focus on anchoring your {FINGER_NAMES[topWeakKey.finger].label.toLowerCase()} cleanly to home row.</>
                  )}
                </>
              ) : fingersToWorkOn.length > 0 ? (
                <>
                  Work on{' '}
                  <span className="font-semibold text-rose-200">
                    {fingersToWorkOn.join(', ')}
                  </span>{' '}
                  to tighten precision on weak keys ({drillTargetKeys.map((k) => k.toUpperCase()).join(', ')}).
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

      {/* Interactive QWERTY Keyboard Heatmap */}
      {showHeatmap && (
        <div className="mt-4 border-t border-surface-border/60 pt-4 animate-fade-in">
          <KeyboardHeatmap
            keyAccuracyMap={analysis.keyAccuracyMap}
            weakKeys={analysis.weakKeys}
            className="!rounded-2xl !p-4 sm:!p-5"
          />
        </div>
      )}
    </div>
  );
};
