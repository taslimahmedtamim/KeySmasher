'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Lock, ArrowRight, Award, Compass, Sparkles } from 'lucide-react';
import { CourseLevel } from '@keysmasher/shared';

interface CourseTier {
  id: CourseLevel;
  title: string;
  subtitle: string;
  description: string;
  lessonsCount: number;
  unlocked: boolean;
  topics: string[];
}

const COURSE_TIERS: CourseTier[] = [
  {
    id: 'beginner',
    title: 'Level 1: Beginner',
    subtitle: 'Posture & Home-Row Foundations',
    description: 'Introduction to touch typing ergonomics, finger placement, and home-row keys (A, S, D, F, J, K, L, ;).',
    lessonsCount: 12,
    unlocked: true,
    topics: ['Touch typing principles', 'Home-row finger positioning', 'Space bar mechanics', 'Muscle memory drills'],
  },
  {
    id: 'elementary',
    title: 'Level 2: Elementary',
    subtitle: 'Top & Bottom Rows Integration',
    description: 'Expand your reach to the top row (Q-W-E-R-T-Y-U-I-O-P) and bottom row (Z-X-C-V-B-N-M).',
    lessonsCount: 16,
    unlocked: false,
    topics: ['Top row vertical reaches', 'Bottom row diagonal reaches', 'Common 3-letter combinations', 'Full alphabet mastery'],
  },
  {
    id: 'intermediate',
    title: 'Level 3: Intermediate',
    subtitle: 'Punctuation, Numbers & Rhythm',
    description: 'Introduce capital letters via Shift keys, standard punctuation, numeric keys, and cadence stability.',
    lessonsCount: 18,
    unlocked: false,
    topics: ['Left & right Shift execution', 'Commas, periods, quotes', 'Top-row number reach', 'Rhythm & consistency drills'],
  },
  {
    id: 'advanced',
    title: 'Level 4: Advanced',
    subtitle: 'Speed Sustenance & Complex Text',
    description: 'High-density literary passages, difficult letter pairings, and sustaining speed without accuracy degradation.',
    lessonsCount: 20,
    unlocked: false,
    topics: ['Difficult digraphs & trigraphs', 'Long-form endurance tests', 'Error recovery strategies', 'Burst typing speed'],
  },
  {
    id: 'expert',
    title: 'Level 5: Expert & Developer',
    subtitle: 'Code Syntax & Competitive Drills',
    description: 'Brackets, braces, operators, programming language keywords, and high-cadence competitive drills.',
    lessonsCount: 24,
    unlocked: false,
    topics: ['Curly braces & brackets', 'Code syntax patterns', 'Linux commands & CLI flags', 'Speed pacing over 100+ WPM'],
  },
];

export default function LearnPage() {
  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-surface-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Structured Touch Typing Curriculum</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Learning Academy
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Progressive mastery from single keystroke muscle memory to lightning-fast 100+ WPM typing.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 md:mt-0">
            <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-2.5">
              <Award className="h-5 w-5 text-amber-400" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400">Academy Status</div>
                <div className="text-xs font-bold text-white">Feature D Roadmap</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Grid */}
        <div className="mt-8 space-y-6">
          {COURSE_TIERS.map((tier, index) => (
            <div
              key={tier.id}
              className={`relative overflow-hidden rounded-2xl border p-6 transition-all ${
                tier.unlocked
                  ? 'border-cyan-500/40 bg-surface shadow-neon-card'
                  : 'border-surface-border bg-surface/40 opacity-80'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        tier.unlocked
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tier.unlocked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      <span>{tier.unlocked ? 'Unlocked' : 'Prerequisite Required'}</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      {tier.lessonsCount} Interactive Lessons
                    </span>
                  </div>

                  <h2 className="mt-2 text-xl font-bold text-white">
                    {tier.title} — <span className="text-cyan-400">{tier.subtitle}</span>
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">{tier.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {tier.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-md border border-surface-border bg-surface-muted px-2.5 py-1 text-xs text-slate-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-start lg:items-end justify-center">
                  {tier.unlocked ? (
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          'The interactive lesson engine will be connected in Feature D (Learning Academy) after Feature B (Typing Engine) and Feature C (Practice UI) are approved.'
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-neon-cyan"
                    >
                      <span>Start Lesson 1</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-xs font-medium text-slate-400">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Complete Level {index} to Unlock</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
