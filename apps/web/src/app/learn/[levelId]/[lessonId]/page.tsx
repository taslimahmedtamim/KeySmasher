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
  Layers,
  Hand,
  Keyboard,
} from 'lucide-react';
import {
  getLessonById,
  COURSES,
  LessonExercise,
  CourseLevelDefinition,
} from '@keysmasher/shared';
import { useTypingEngine } from '@/features/typing/useTypingEngine';
import { TypingArea } from '@/features/typing/components/TypingArea';
import { UnifiedGuidanceConsole } from '@/features/academy/components/UnifiedGuidanceConsole';
import { HandsVisualizer } from '@/features/academy/components/HandsVisualizer';
import { VisualKeyboard } from '@/features/academy/components/VisualKeyboard';
import {
  saveLessonProgress,
  getLessonProgress,
} from '@/features/academy/utils/academyStorage';
import { SoundTheme } from '@/features/typing/types';
import { playKeystrokeSound } from '@/features/typing/utils/soundEffects';

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
  const [guidanceMode, setGuidanceMode] = useState<'unified' | 'hands' | 'keyboard'>('unified');
  const [isFocused, setIsFocused] = useState(true);

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

  // Guarantee instant auto-focus on page load & refocus on click/keypress
  useEffect(() => {
    const focusHiddenInput = () => {
      if (status !== 'completed' && inputRef.current) {
        inputRef.current.focus();
        setIsFocused(true);
      }
    };

    // Auto focus immediately on mount
    focusHiddenInput();
    const timer = setTimeout(focusHiddenInput, 100);

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Do not refocus if clicking a link or interactive button
      if (
        !target.closest('button') &&
        !target.closest('a') &&
        !target.closest('input') &&
        status !== 'completed'
      ) {
        focusHiddenInput();
      }
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (status === 'completed') return;
      if (
        document.activeElement !== inputRef.current &&
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        focusHiddenInput();
      }
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [status, inputRef]);

  // Track real-time focus
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const onFocus = () => setIsFocused(true);
    const onBlur = () => setIsFocused(false);

    input.addEventListener('focus', onFocus);
    input.addEventListener('blur', onBlur);

    return () => {
      input.removeEventListener('focus', onFocus);
      input.removeEventListener('blur', onBlur);
    };
  }, [inputRef]);

  // Determine active character in real-time for finger and keyboard illumination
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
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

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
    <div className="py-4 md:py-6">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-3">
          <div className="flex items-center gap-3">
            <Link
              href="/learn"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Academy</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-bold text-white">{lesson.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cycleSoundTheme}
              className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold transition-all ${
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

            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
              {course.title}
            </span>

            <div className="hidden sm:flex items-center gap-2 font-mono text-[11px]">
              <span className="rounded-md border border-surface-border bg-surface px-2 py-0.5 text-emerald-400">
                {lesson.minAccuracy}% acc
              </span>
              <span className="rounded-md border border-surface-border bg-surface px-2 py-0.5 text-amber-400">
                {lesson.threeStarWpm} WPM
              </span>
            </div>
          </div>
        </div>

        {/* Typing Box */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="relative mt-4 min-h-[110px] rounded-2xl border border-surface-border bg-surface/60 p-4 sm:p-5 shadow-neon-card cursor-text"
        >
          {isCompleted ? (
            /* Lesson Result Card */
            <div className="py-4 text-center animate-fade-in">
              <div
                className={`mb-2 inline-flex rounded-full p-2.5 border ${
                  passed
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                }`}
              >
                {passed ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              </div>

              <h2 className="text-xl font-black text-white">
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
              <div className="mt-3 flex items-center justify-center gap-2">
                {[1, 2, 3].map((starNum) => (
                  <Star
                    key={starNum}
                    className={`h-6 w-6 transition-all ${
                      starNum <= earnedStars
                        ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_10px_#f59e0b]'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Metrics */}
              <div className="mt-4 grid grid-cols-3 gap-3 max-w-sm mx-auto font-mono text-xs">
                <div className="rounded-xl border border-surface-border bg-surface p-2 text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Speed</div>
                  <div className="mt-0.5 text-xl font-black text-cyan-400">
                    {Math.round(metrics.netWpm)}
                  </div>
                  <div className="text-[9px] text-slate-500">WPM</div>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface p-2 text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Accuracy</div>
                  <div className="mt-0.5 text-xl font-black text-emerald-400">
                    {Math.round(metrics.accuracy)}%
                  </div>
                  <div className="text-[9px] text-slate-500">Ratio</div>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface p-2 text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Errors</div>
                  <div className="mt-0.5 text-xl font-black text-rose-400">
                    {metrics.incorrectCharacters}
                  </div>
                  <div className="text-[9px] text-slate-500">mistakes</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    savedRef.current = false;
                    restart(false);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-all active:scale-95"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Try Again</span>
                </button>

                {passed && nextLesson && (
                  <Link
                    href={`/learn/${nextLesson.level}/${nextLesson.id}`}
                    onClick={() => {
                      savedRef.current = false;
                    }}
                    className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-neon-cyan active:scale-95"
                  >
                    <span>Next Lesson</span>
                    <ArrowRight className="h-3.5 w-3.5" />
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

              {/* Click to type banner if focus is lost */}
              {!isFocused && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-2xl cursor-pointer">
                  <div className="rounded-xl border border-cyan-500/50 bg-cyan-500/20 px-4 py-2 text-xs font-bold text-cyan-300 shadow-neon-cyan animate-pulse">
                    Click anywhere or press any key to focus & type
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Visual Interactive Guidance */}
        {!isCompleted && (
          <div className="mt-3 space-y-2 animate-fade-in">
            {/* View Mode Bar */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Placement & Keyboard Guidance:
              </span>

              <div className="flex items-center gap-1 rounded-xl border border-surface-border bg-surface p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setGuidanceMode('unified')}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                    guidanceMode === 'unified'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Side-by-side Hands & Keyboard on one screen"
                >
                  <Layers className="h-3 w-3" />
                  <span>Side-by-Side</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGuidanceMode('hands')}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                    guidanceMode === 'hands'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Hand className="h-3 w-3" />
                  <span>Hands Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGuidanceMode('keyboard')}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                    guidanceMode === 'keyboard'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Keyboard className="h-3 w-3" />
                  <span>Keys Only</span>
                </button>
              </div>
            </div>

            {/* UNIFIED SIDE-BY-SIDE CONSOLE (Default: Left Hand | Keyboard | Right Hand on ONE screen) */}
            {guidanceMode === 'unified' && (
              <UnifiedGuidanceConsole activeChar={activeChar} />
            )}

            {/* Standalone Hands */}
            {guidanceMode === 'hands' && (
              <HandsVisualizer activeChar={activeChar} />
            )}

            {/* Standalone Keyboard */}
            {guidanceMode === 'keyboard' && (
              <VisualKeyboard activeChar={activeChar} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
