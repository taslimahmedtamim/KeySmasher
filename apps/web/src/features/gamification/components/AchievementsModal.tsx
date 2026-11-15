'use client';

import React, { useState } from 'react';
import {
  X,
  Trophy,
  Zap,
  Flame,
  Target,
  Crown,
  Award,
  BookOpen,
  Swords,
  Medal,
  Activity,
  Sparkles,
  Lock,
  CheckCircle,
} from 'lucide-react';
import { Achievement, AchievementCategory } from '../types';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export function AchievementsModal({
  isOpen,
  onClose,
  achievements,
}: AchievementsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filtered =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const getIcon = (name: string, unlocked: boolean) => {
    const className = `h-5 w-5 ${unlocked ? 'text-amber-400' : 'text-slate-500'}`;
    switch (name) {
      case 'Zap':
        return <Zap className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Trophy':
        return <Trophy className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Target':
        return <Target className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Swords':
        return <Swords className={className} />;
      case 'Medal':
        return <Medal className={className} />;
      case 'Activity':
        return <Activity className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl border border-surface-border bg-surface p-6 sm:p-8 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-lg p-2 text-slate-400 hover:bg-surface-muted hover:text-white transition-colors"
          aria-label="Close achievements"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Milestone Achievements</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Earn badges and unlock bonus XP across training and competitive arenas.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
            <span>
              {unlockedCount} / {achievements.length} Unlocked
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-4 pb-2">
          {['all', 'speed', 'accuracy', 'volume', 'streak', 'competition'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all border ${
                selectedCategory === cat
                  ? 'border-purple-500 bg-purple-600/20 text-purple-300 shadow-sm'
                  : 'border-surface-border bg-surface-muted/40 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3.5 rounded-xl border p-4 transition-all ${
                  item.unlocked
                    ? 'border-amber-500/40 bg-amber-950/15 shadow-sm'
                    : 'border-surface-border bg-surface-muted/20 opacity-80'
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                    item.unlocked
                      ? 'border-amber-400/40 bg-amber-500/20 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                      : 'border-slate-700 bg-slate-900/60'
                  }`}
                >
                  {getIcon(item.iconName, item.unlocked)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-bold truncate ${
                        item.unlocked ? 'text-amber-300' : 'text-slate-300'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-purple-400 shrink-0">
                      +{item.xpReward} XP
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                    {item.description}
                  </p>

                  <div className="mt-2.5">
                    {item.unlocked ? (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                        <CheckCircle className="h-3 w-3 stroke-[3]" />
                        <span>
                          Unlocked{' '}
                          {item.unlockedAt
                            ? new Date(item.unlockedAt).toLocaleDateString()
                            : ''}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                          <span>In Progress</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-slate-600 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
