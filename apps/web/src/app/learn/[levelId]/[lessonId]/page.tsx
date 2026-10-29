'use client';

import React, { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Star,
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  getLessonById,
  COURSES,
  LessonExercise,
  CourseLevelDefinition,
} from '@keysmasher/shared';
import { useTypingEngine } from '@/features/typing/useTypingEngine';
import { TypingArea } from '@/features/typing/components/TypingArea';
import { VisualKeyboard } from '@/features/academy/components/VisualKeyboard';
import { HandsVisualizer } from '@/features/academy/components/HandsVisualizer';
import {
  saveLessonProgress,
  getLessonProgress,
} from '@/features/academy/utils/academyStorage';
import { SoundTheme } from '@/features/typing/types';
import { playKeystrokeSound } from '@/features/typing/utils/soundEffects';
import { Hand, Keyboard, Layers } from 'lucide-react';

interface LessonPageProps {
  params: Promise<{ levelId: string; lessonId: string }>;
}

export default function LessonRunnerPage({ params }: LessonPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { levelId, lessonId } = resolvedParams;

  const data = getLessonById(lessonId);
  const lesson = data?.lesson;
  const course = data?.course;

  const previousRecord = lesson ? getLessonProgress(lesson.id) : null;
  const savedRef = useRef(false);
  const [guidanceMode, setGuidanceMode] = useState<'both' | 'hands' | 'keyboard'>('both');

  const {
    status,
    config,
    renderedWords,
    currentWordIndex,
    activeCharIndex,
    metrics,
    inputRef,
    actions: { restart, handleKeyDown, handleInputChange, handlePaste, setConfig },
  } = useTypingEngine({
    initialConfig: {
      mode: 'custom',
      initialPassage: lesson?.passage || 'touch typing practice',
      soundTheme: 'click',
    },
  });

  // Determine active character in real-time for Visual Keyboard finger illumination
  const currentWord = renderedWords[currentWordIndex];
  const activeChar =
    currentWord && activeCharIndex < currentWord.characters.length
      ? currentWord.characters[activeCharIndex].char
      : activeCharIndex >= (currentWord?.characters.length || 0)
      ? ' '
      : '';

  // Calculate stars earned on completion
  const calculateStars = (wpm: number, acc: number): 0 | 1 | 2 | 3 => {
    if (!lesson) return 0;
    if (acc < lesson.minAccuracy) return 0;
    if (wpm >= lesson.threeStarWpm) return 3;
    if (wpm >= lesson.twoStarWpm) return 2;
    if (wpm >= lesson.minWpm) return 1;
    return 0;
  };

  const isCompleted = status === 'completed';
  const earnedStars = isCompleted ? calculateStars(metrics.netWpm, metrics.accuracy) : 0;
  const passed = isCompleted && earnedStars > 0;

  // Save progress on completion once
  useEffect(() => {
    if (isCompleted && lesson && !savedRef.current) {
      savedRef.current = true;
      saveLessonProgress(lesson.id, {
        wpm: metrics.netWpm,
        accuracy: metrics.accuracy,
        stars: earnedStars,
      });
    }
  }, [isCompleted, lesson, metrics.netWpm, metrics.accuracy, earnedStars]);

  // Find next lesson
  const allLessons = COURSES.flatMap((c) => c.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (!lesson || !course) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-white">Lesson not found</h2>
        <Link href="/learn" className="mt-4 inline-block text-cyan-400 hover:underline">
          Return to Learning Academy
        </Link>
      </div>
    );
  }

  const cycleSoundTheme = () => {
    const themes: SoundTheme[] = ['off', 'click', 'clack', 'thock'];
    const currentIdx = themes.indexOf(config.soundTheme || 'off');
    const nextTheme = themes[(currentIdx + 1) % themes.length];
    setConfig((prev) => ({ ...prev, soundTheme: nextTheme }));
    if (nextTheme !== 'off') {
      playKeystrokeSound(nextTheme, false);
    }
  };

  return (
    <div className="py-8 md:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-4">
          <Link
            href="/learn"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Academy Catalog</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={cycleSoundTheme}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
                config.soundTheme && config.soundTheme !== 'off'
                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                  : 'border-slate-800 text-slate-500'
              }`}
              title="Keystroke Audio Feedback"
            >
              {config.soundTheme && config.soundTheme !== 'off' ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
              <span className="capitalize">{config.soundTheme || 'Mute'}</span>
            </button>

            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
              {course.title}
            </span>
          </div>
        </div>

        {/* Lesson Header */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">{lesson.title}</h1>
            <p className="mt-1 text-sm text-slate-400">{lesson.description}</p>
          </div>

          {/* Targets Badge */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="rounded-xl border border-surface-border bg-surface px-3 py-2 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Min Accuracy</div>
              <div className="font-bold text-emerald-400">{lesson.minAccuracy}%</div>
            </div>
            <div className="rounded-xl border border-surface-border bg-surface px-3 py-2 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">3-Star Goal</div>
              <div className="font-bold text-amber-400">{lesson.threeStarWpm} WPM</div>
            </div>
          </div>
        </div>

        {/* Typing Box */}
        <div className="relative mt-8 min-h-[190px] rounded-2xl border border-surface-border bg-surface/50 p-6 sm:p-8 shadow-neon-card">
          {isCompleted ? (
            /* Lesson Result Card */
            <div className="py-6 text-center animate-fade-in">
              <div
                className={`mb-3 inline-flex rounded-full p-3.5 border ${
                  passed
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                }`}
              >
                {passed ? <CheckCircle2 className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
              </div>

              <h2 className="text-2xl font-black text-white">
                {passed ? 'Lesson Mastered!' : 'Accuracy Target Not Reached'}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {passed
                  ? `Congratulations! You unlocked the next exercise with ${earnedStars} star${
                      earnedStars > 1 ? 's' : ''
                    }.`
                  : `You needed at least ${lesson.minAccuracy}% accuracy to pass. You achieved ${Math.round(
                      metrics.accuracy
                    )}%. Try again!`}
              </p>

              {/* Stars display */}
              <div className="mt-5 flex items-center justify-center gap-2">
                {[1, 2, 3].map((starNum) => (
                  <Star
                    key={starNum}
                    className={`h-7 w-7 transition-all ${
                      starNum <= earnedStars
                        ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_10px_#f59e0b]'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Metrics */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto font-mono text-xs">
                <div className="rounded-xl border border-surface-border bg-surface p-3 text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Speed</div>
                  <div className="mt-1 text-2xl font-black text-cyan-400">{Math.round(metrics.netWpm)}</div>
                  <div className="text-[10px] text-slate-500">WPM</div>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface p-3 text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Accuracy</div>
                  <div className="mt-1 text-2xl font-black text-emerald-400">{Math.round(metrics.accuracy)}%</div>
                  <div className="text-[10px] text-slate-500">Ratio</div>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface p-3 text-center col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-slate-500 uppercase">Errors</div>
                  <div className="mt-1 text-2xl font-black text-rose-400">{metrics.incorrectCharacters}</div>
                  <div className="text-[10px] text-slate-500">mistakes</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    savedRef.current = false;
                    restart(false);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-5 py-2.5 text-xs font-semibold text-slate-200 hover:text-white transition-all active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>

                {passed && nextLesson && (
                  <Link
                    href={`/learn/${nextLesson.level}/${nextLesson.id}`}
                    onClick={() => {
                      savedRef.current = false;
                    }}
                    className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-neon-cyan active:scale-95"
                  >
                    <span>Next Lesson</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div>
              <TypingArea
                renderedWords={renderedWords}
                currentWordIndex={currentWordIndex}
                activeCharIndex={activeCharIndex}
                status={status}
                inputRef={inputRef}
                onKeyDown={handleKeyDown}
                onInputChange={handleInputChange}
                onPaste={handlePaste}
              />
            </div>
          )}
        </div>

        {/* Live Visual Interactive Finger & Keyboard Guidance */}
        {!isCompleted && (
          <div className="mt-8 space-y-4 animate-fade-in">
            {/* Guidance Mode Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Visual Placement Guidance:
              </span>

              <div className="flex items-center gap-1 rounded-xl border border-surface-border bg-surface p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setGuidanceMode('both')}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                    guidanceMode === 'both'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Hands & Keys</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGuidanceMode('hands')}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                    guidanceMode === 'hands'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Hand className="h-3.5 w-3.5" />
                  <span>Hands Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGuidanceMode('keyboard')}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                    guidanceMode === 'keyboard'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Keyboard className="h-3.5 w-3.5" />
                  <span>Keyboard Only</span>
                </button>
              </div>
            </div>

            {/* Anatomical Hands Visualizer */}
            {(guidanceMode === 'both' || guidanceMode === 'hands') && (
              <HandsVisualizer activeChar={activeChar} />
            )}

            {/* Physical Matrix Keyboard with Reach and Anchor Cues */}
            {(guidanceMode === 'both' || guidanceMode === 'keyboard') && (
              <VisualKeyboard activeChar={activeChar} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
