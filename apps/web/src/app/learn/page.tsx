'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  Award,
  Star,
  Sparkles,
  Zap,
  Target,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { COURSES, CourseLevelDefinition, LessonExercise, UserLessonProgress } from '@keysmasher/shared';
import {
  getAllLessonProgress,
  isLessonUnlocked,
  getLevelProgressStats,
} from '@/features/academy/utils/academyStorage';

export default function LearnPage() {
  const [progressMap, setProgressMap] = useState<Record<string, UserLessonProgress>>({});
  const [mounted, setMounted] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({
    beginner: true,
    elementary: true,
    intermediate: false,
    advanced: false,
    expert: false,
  });

  useEffect(() => {
    setMounted(true);
    setProgressMap(getAllLessonProgress());
  }, []);

  const toggleLevel = (levelId: string) => {
    setExpandedLevels((prev) => ({
      ...prev,
      [levelId]: !prev[levelId],
    }));
  };

  // Aggregate stats across all courses
  const allLessons = COURSES.flatMap((c) => c.lessons);
  const totalLessonsCount = allLessons.length;
  const maxPossibleStars = totalLessonsCount * 3;

  let totalEarnedStars = 0;
  let totalCompletedLessons = 0;

  allLessons.forEach((lesson) => {
    const prog = progressMap[lesson.id];
    if (prog) {
      totalEarnedStars += prog.stars;
      if (prog.completed) {
        totalCompletedLessons += 1;
      }
    }
  });

  const overallPercent = Math.round((totalCompletedLessons / totalLessonsCount) * 100);

  // Find the next recommended lesson (first unlocked lesson that has < 3 stars)
  const nextRecommendedLesson = allLessons.find((l) => {
    const unlocked = mounted ? isLessonUnlocked(l.id) : l.id === 'l1-1';
    const prog = progressMap[l.id];
    return unlocked && (!prog || prog.stars < 3);
  }) || allLessons[0];

  return (
    <div className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-surface-border pb-8 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Structured Touch Typing Curriculum</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Learning Academy
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Progressive mastery from single keystroke muscle memory to lightning-fast 100+ WPM typing.
              Real-time finger guidance, accuracy gates, and progressive unlocking.
            </p>
          </div>

          {/* Quick Continue Card */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 rounded-2xl border border-surface-border bg-surface p-4 sm:p-5 shadow-neon-card">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Up Next</span>
              </div>
              <div className="font-bold text-white text-sm line-clamp-1">
                {nextRecommendedLesson.title}
              </div>
              <div className="text-xs text-slate-400">
                Target: {nextRecommendedLesson.minAccuracy}% acc • {nextRecommendedLesson.minWpm} WPM
              </div>
            </div>

            <Link
              href={`/learn/${nextRecommendedLesson.level}/${nextRecommendedLesson.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-neon-cyan active:scale-95 whitespace-nowrap"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Continue Lesson</span>
            </Link>
          </div>
        </div>

        {/* Global Progress Metrics Bar */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-surface-border bg-surface/70 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Academy Mastery
              </span>
              <Target className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{overallPercent}%</span>
              <span className="text-xs text-slate-400">
                ({totalCompletedLessons}/{totalLessonsCount} Lessons)
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface/70 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Stars Collected
              </span>
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400">{totalEarnedStars}</span>
              <span className="text-xs text-slate-400">/ {maxPossibleStars} Stars</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-amber-400 transition-all duration-500"
                style={{
                  width: `${Math.round((totalEarnedStars / maxPossibleStars) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface/70 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Guest Mode
              </span>
              <Zap className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2">
              <span className="text-sm font-bold text-slate-200">Local Progress Saved</span>
              <p className="mt-1 text-xs text-slate-400">
                All academy lessons are fully playable without signing in. Progress persists in browser storage.
              </p>
            </div>
          </div>
        </div>

        {/* Level Tiers with Expandable Lessons */}
        <div className="mt-10 space-y-8">
          {COURSES.map((course, cIdx) => {
            const isExpanded = expandedLevels[course.id] ?? true;
            const stats = mounted
              ? getLevelProgressStats(course.id)
              : { earnedStars: 0, totalStars: course.lessons.length * 3, completedCount: 0, totalLessons: course.lessons.length };

            // Determine if the level is unlocked (level 1 is always unlocked, otherwise check if first lesson is unlocked)
            const isLevelUnlocked = mounted ? isLessonUnlocked(course.lessons[0].id) : cIdx === 0;
            const isLevelMastered = stats.completedCount === course.lessons.length;

            return (
              <div
                key={course.id}
                className={`overflow-hidden rounded-2xl border transition-all ${
                  isLevelUnlocked
                    ? 'border-surface-border bg-surface/50 shadow-neon-card'
                    : 'border-slate-800/80 bg-surface/20 opacity-75'
                }`}
              >
                {/* Level Tier Header */}
                <div
                  onClick={() => toggleLevel(course.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 cursor-pointer hover:bg-surface/80 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono text-lg font-black border ${
                        isLevelMastered
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                          : isLevelUnlocked
                          ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                          : 'border-slate-700 bg-slate-800/40 text-slate-500'
                      }`}
                    >
                      {isLevelMastered ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : !isLevelUnlocked ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        `0${course.order}`
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-white">{course.title}</h2>
                        <span className="text-xs font-semibold text-cyan-400">— {course.subtitle}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 max-w-2xl">{course.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 sm:self-center">
                    {/* Stars Badge */}
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-white">{stats.earnedStars}</span>
                      <span className="text-slate-500">/{stats.totalStars}</span>
                    </div>

                    {/* Progress Badge */}
                    <div className="rounded-lg border border-surface-border bg-surface px-3 py-1 font-mono text-xs text-slate-300">
                      {stats.completedCount}/{stats.totalLessons} Done
                    </div>

                    {/* Expand/Collapse Chevron */}
                    <button
                      type="button"
                      aria-label="Toggle level"
                      className="text-slate-400 hover:text-white"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Lesson Cards Grid */}
                {isExpanded && (
                  <div className="border-t border-surface-border/60 bg-surface-muted/30 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {course.lessons.map((lesson) => {
                        const unlocked = mounted ? isLessonUnlocked(lesson.id) : lesson.id === 'l1-1';
                        const prog = progressMap[lesson.id];
                        const completed = Boolean(prog && prog.completed);
                        const stars = prog ? prog.stars : 0;

                        return (
                          <div
                            key={lesson.id}
                            className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                              unlocked
                                ? 'border-surface-border bg-surface hover:border-cyan-500/40 hover:shadow-neon-cyan/20'
                                : 'border-slate-800 bg-surface/20 opacity-60'
                            }`}
                          >
                            <div>
                              {/* Card Top Row: Lesson order & Tag */}
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[11px] font-bold text-slate-500">
                                  Lesson {lesson.order}
                                </span>

                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                    lesson.category === 'milestone'
                                      ? 'border border-amber-500/40 bg-amber-500/10 text-amber-300'
                                      : lesson.category === 'words'
                                      ? 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                                      : 'border border-slate-700 bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {lesson.category}
                                </span>
                              </div>

                              {/* Title & Subtitle */}
                              <h3 className="mt-2 font-bold text-white text-sm line-clamp-1">
                                {lesson.title}
                              </h3>
                              <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                                {lesson.description}
                              </p>

                              {/* Target Keys Pills */}
                              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] text-slate-500 font-medium">Keys:</span>
                                {lesson.targetKeys.map((k) => (
                                  <span
                                    key={k}
                                    className="rounded border border-surface-border bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300"
                                  >
                                    {k === ' ' ? 'Space' : k}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Card Footer: Metrics & Action */}
                            <div className="mt-4 pt-3 border-t border-surface-border/50 flex items-center justify-between">
                              {/* Star Ratings or Targets */}
                              <div>
                                {completed ? (
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3].map((s) => (
                                      <Star
                                        key={s}
                                        className={`h-3.5 w-3.5 ${
                                          s <= stars
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-slate-700'
                                        }`}
                                      />
                                    ))}
                                    <span className="ml-1.5 font-mono text-xs font-bold text-slate-300">
                                      {prog?.bestWpm} WPM
                                    </span>
                                  </div>
                                ) : (
                                  <div className="font-mono text-[10px] text-slate-500">
                                    Goal: {lesson.minAccuracy}% acc • {lesson.minWpm} WPM
                                  </div>
                                )}
                              </div>

                              {/* Action Link or Lock */}
                              {unlocked ? (
                                <Link
                                  href={`/learn/${course.id}/${lesson.id}`}
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                                    completed
                                      ? 'border border-surface-border bg-surface-muted text-slate-300 hover:text-white hover:border-slate-600'
                                      : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:shadow-neon-cyan'
                                  }`}
                                >
                                  {completed ? (
                                    <>
                                      <RotateCcw className="h-3 w-3" />
                                      <span>Practice</span>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-3 w-3 fill-current" />
                                      <span>Start</span>
                                    </>
                                  )}
                                </Link>
                              ) : (
                                <div className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/40 px-2.5 py-1 text-[11px] text-slate-500">
                                  <Lock className="h-3 w-3" />
                                  <span>Locked</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
