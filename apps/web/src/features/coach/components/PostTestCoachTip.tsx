'use client';

import React, { useMemo } from 'react';
import {
  ExtendedTypingMetrics,
} from '@/features/typing/types';
import {
  analyzeTypingDiagnostics,
  generateWeakKeyDrillPassage,
  FINGER_NAMES,
} from '@keysmasher/shared';
import { Brain, Target, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export interface PostTestCoachTipProps {
  metrics: ExtendedTypingMetrics;
  onApplyDrill?: (drillPassage: string) => void;
  className?: string;
}

export const PostTestCoachTip: React.FC<PostTestCoachTipProps> = ({
  metrics,
  onApplyDrill,
  className = '',
}) => {
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

  const handleStartDrill = () => {
    if (onApplyDrill) {
      const keys = analysis.weakKeys.map((w) => w.char);
      const drillText = generateWeakKeyDrillPassage(keys, 25);
      onApplyDrill(drillText);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-surface/80 to-purple-950/30 p-4 sm:p-5 backdrop-blur shadow-neon-card ${className}`}
    >
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
              {topWeakKey ? (
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
                  Relax your hand and anchor to home row.
                </>
              ) : primaryRecommendation ? (
                primaryRecommendation.message
              ) : (
                'Clean execution with zero keystroke anomalies. Keep up your rhythmic cadence!'
              )}
            </p>
          </div>
        </div>

        {/* Drill CTA Button */}
        {onApplyDrill && (
          <div className="shrink-0 self-end sm:self-center">
            <button
              type="button"
              id="drill-missed-keys-btn"
              onClick={handleStartDrill}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-3.5 py-2 text-xs font-black text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-300 hover:shadow-neon-cyan transition-all active:scale-95"
            >
              <Target className="h-3.5 w-3.5" />
              <span>Drill Missed Keys</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
