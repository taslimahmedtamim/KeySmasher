'use client';

import React from 'react';
import { Target, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { DailyGoal } from '../types';

interface DailyGoalsCardProps {
  goals: DailyGoal[];
}

export function DailyGoalsCard({ goals }: DailyGoalsCardProps) {
  const completedCount = goals.filter((g) => g.isCompleted).length;

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Daily Training Objectives</h3>
            <p className="text-xs text-slate-400">
              Complete goals daily to boost your streak and earn bonus XP.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
          <span>{completedCount} / {goals.length} Completed</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {goals.map((goal) => {
          const progressPercent = Math.min(
            100,
            Math.round((goal.current / goal.target) * 100)
          );

          return (
            <div
              key={goal.id}
              className={`rounded-xl border p-3.5 transition-all ${
                goal.isCompleted
                  ? 'border-emerald-500/40 bg-emerald-950/20 shadow-sm'
                  : 'border-surface-border bg-surface-muted/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {goal.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-slate-600" />
                  )}
                  <span
                    className={`text-xs font-bold ${
                      goal.isCompleted ? 'text-white' : 'text-slate-200'
                    }`}
                  >
                    {goal.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-400">
                    {goal.current} / {goal.target}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                      goal.isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                    }`}
                  >
                    +{goal.xpReward} XP
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 mb-2">{goal.description}</div>

              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    goal.isCompleted
                      ? 'bg-emerald-400'
                      : 'bg-gradient-to-r from-purple-500 to-cyan-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
