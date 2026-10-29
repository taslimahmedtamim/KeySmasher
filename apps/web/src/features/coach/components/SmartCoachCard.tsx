'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CoachAnalysisResult,
  generateWeakKeyDrillPassage,
  FINGER_NAMES,
} from '@keysmasher/shared';
import {
  Brain,
  Sparkles,
  Target,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Activity,
  CheckCircle2,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { KeyboardHeatmap } from './KeyboardHeatmap';

export interface SmartCoachCardProps {
  coach: CoachAnalysisResult;
  className?: string;
}

export const SmartCoachCard: React.FC<SmartCoachCardProps> = ({ coach, className = '' }) => {
  const router = useRouter();
  const [showHeatmap, setShowHeatmap] = useState(true);

  const {
    healthScore,
    overallAccuracy,
    totalAnalyzedKeystrokes,
    weakKeys,
    keyAccuracyMap,
    handBalance,
    recommendations,
  } = coach;

  // Launch targeted weak-key drill
  const handleLaunchDrill = () => {
    const targetKeys = weakKeys.map((w) => w.char);
    const drillPassage = generateWeakKeyDrillPassage(targetKeys, 25);

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('keysmasher_drill_passage', drillPassage);
        window.sessionStorage.setItem('keysmasher_drill_keys', JSON.stringify(targetKeys));
      }
    } catch {
      // Ignore
    }

    router.push('/practice?drill=weak-keys');
  };

  // Get health score styling
  const getHealthBadge = (score: number) => {
    if (score >= 95) {
      return {
        label: 'Peak Motor Form',
        color: 'text-emerald-400',
        badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
      };
    }
    if (score >= 85) {
      return {
        label: 'Balanced Cadence',
        color: 'text-cyan-400',
        badge: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
      };
    }
    if (score >= 75) {
      return {
        label: 'Developing Rhythm',
        color: 'text-amber-400',
        badge: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      };
    }
    return {
      label: 'Precision Tuning Needed',
      color: 'text-rose-400',
      badge: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
    };
  };

  const health = getHealthBadge(healthScore);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-surface-border bg-gradient-to-b from-surface via-surface/95 to-surface-muted/40 p-5 sm:p-8 shadow-neon-card ${className}`}
    >
      {/* Background ambient glow */}
      <div className="absolute -top-24 right-0 h-64 w-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-neon-cyan">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  Smart Typist Coach & Weak-Key Diagnostics
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                  <Sparkles className="h-3 w-3" />
                  Telemetry Engine Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic telemetry analysis across {totalAnalyzedKeystrokes} logged keystrokes with
                anatomical finger discipline tracking.
              </p>
            </div>
          </div>
        </div>

        {/* 1-Click Weak-Key Drill CTA */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="start-weak-key-drill-btn"
            onClick={handleLaunchDrill}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 px-4 text-xs font-black text-slate-950 hover:bg-cyan-400 hover:shadow-neon-cyan transition-all active:scale-95 shrink-0"
          >
            <Target className="h-4 w-4" />
            <span>Start Weak-Key Drill</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Top 3 Diagnostic Cards */}
      <div className="relative mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Typist Form & Health Score */}
        <div className="rounded-2xl border border-surface-border bg-surface-muted/30 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Overall Typist Form</span>
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] ${health.badge}`}>
                {health.label}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white">{healthScore}</span>
              <span className="text-xs text-slate-400">/ 100 Health</span>
            </div>
            <div className="mt-2 text-xs text-slate-300">
              Lifetime accuracy:{' '}
              <span className="font-bold text-cyan-300">{overallAccuracy}%</span> across{' '}
              <span className="font-bold text-white">{totalAnalyzedKeystrokes}</span> keystrokes.
            </div>
          </div>

          {/* Form Progress Bar */}
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-border/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.max(5, healthScore)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Hand Balance & Load Disparity */}
        <div className="rounded-2xl border border-surface-border bg-surface-muted/30 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Hand Precision Balance</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400">
                <Activity className="h-3 w-3" />
                {handBalance.dominantHand === 'balanced'
                  ? 'Symmetrical'
                  : handBalance.dominantHand === 'left-favored'
                  ? 'Left Favored'
                  : 'Right Favored'}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-surface-border/60 bg-surface/60 p-2.5">
                <div className="text-[10px] font-bold uppercase text-slate-400">Left Hand</div>
                <div className="mt-1 text-base font-black text-white">
                  {handBalance.leftAccuracy}%
                </div>
                <div className="text-[10px] text-slate-400">
                  {handBalance.leftKeystrokes} strokes
                </div>
              </div>

              <div className="rounded-xl border border-surface-border/60 bg-surface/60 p-2.5">
                <div className="text-[10px] font-bold uppercase text-slate-400">Right Hand</div>
                <div className="mt-1 text-base font-black text-white">
                  {handBalance.rightAccuracy}%
                </div>
                <div className="text-[10px] text-slate-400">
                  {handBalance.rightKeystrokes} strokes
                </div>
              </div>
            </div>
          </div>

          {/* Dual Hand Accuracy Bar */}
          <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
            <span>L</span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-border/60 flex">
              <div
                className="h-full bg-purple-500"
                style={{
                  width: `${
                    handBalance.leftKeystrokes + handBalance.rightKeystrokes > 0
                      ? Math.round(
                          (handBalance.leftKeystrokes /
                            (handBalance.leftKeystrokes + handBalance.rightKeystrokes)) *
                            100
                        )
                      : 50
                  }%`,
                }}
              />
              <div
                className="h-full bg-cyan-500"
                style={{
                  width: `${
                    handBalance.leftKeystrokes + handBalance.rightKeystrokes > 0
                      ? Math.round(
                          (handBalance.rightKeystrokes /
                            (handBalance.leftKeystrokes + handBalance.rightKeystrokes)) *
                            100
                        )
                      : 50
                  }%`,
                }}
              />
            </div>
            <span>R</span>
          </div>
        </div>

        {/* Card 3: Top Weak Keys Summary */}
        <div className="rounded-2xl border border-surface-border bg-surface-muted/30 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Weak-Key Bottlenecks</span>
              <span className="text-[10px] text-rose-400 font-bold">
                {weakKeys.length > 0 ? `${weakKeys.length} Identified` : 'Clean'}
              </span>
            </div>

            <div className="mt-3">
              {weakKeys.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {weakKeys.slice(0, 4).map((wk) => (
                    <div
                      key={wk.char}
                      className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 font-mono text-xs font-black text-rose-300">
                        {wk.display}
                      </span>
                      <div className="text-left">
                        <div className="text-[10px] font-bold text-rose-300">
                          {wk.accuracy}% acc
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {wk.errors} misses
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold">Zero Critical Weak Keys!</span>
                    <p className="text-[10px] text-emerald-400/80">
                      All tested keys are executing with above 96% precision.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-[11px] text-slate-400">
            {weakKeys.length > 0
              ? `Target weak key: [${weakKeys[0].display}] (${FINGER_NAMES[weakKeys[0].finger].label})`
              : 'Maintain consistent 30s drills to keep motor reflexes sharp.'}
          </div>
        </div>
      </div>

      {/* Rule-Based Coaching Recommendations Feed */}
      <div className="relative mt-6 border-t border-surface-border/60 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Coach Recommendations & Training Plan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {recommendations.slice(0, 4).map((rec) => {
            let iconColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
            if (rec.type === 'accuracy') iconColor = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
            else if (rec.type === 'speed') iconColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
            else if (rec.type === 'rhythm') iconColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';

            return (
              <div
                key={rec.id}
                className="flex flex-col justify-between rounded-2xl border border-surface-border bg-surface-muted/20 p-4 transition-all hover:border-surface-border/90 hover:bg-surface-muted/40"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg border ${iconColor}`}
                      >
                        <TrendingUp className="h-3 w-3" />
                      </div>
                      <span className="text-xs font-bold text-white">{rec.title}</span>
                    </div>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        rec.priority === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : rec.priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">{rec.message}</p>
                </div>

                {rec.lessonId && (
                  <div className="mt-3 border-t border-surface-border/40 pt-2.5">
                    <Link
                      href={`/academy/${rec.lessonId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span>{rec.actionLabel || 'Start Academy Lesson'}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap Toggle & Container */}
      <div className="relative mt-8 border-t border-surface-border/60 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Interactive Keyboard Telemetry Heatmap
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowHeatmap((prev) => !prev)}
            className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
          >
            <span>{showHeatmap ? 'Collapse Heatmap' : 'Expand Heatmap'}</span>
            {showHeatmap ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {showHeatmap && (
          <KeyboardHeatmap keyAccuracyMap={keyAccuracyMap} weakKeys={weakKeys} />
        )}
      </div>
    </div>
  );
};
