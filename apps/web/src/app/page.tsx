import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  BookOpen,
  Swords,
  ChevronRight,
  Gauge,
  Target,
  Users,
  Shield,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden py-12 md:py-20">
      {/* Background ambient neon glow effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 right-10 -z-10 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>KeySmasher v0.1.0 • Foundation Initialized</span>
          </div>

          <div className="relative mb-6">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-cyan-400/50 bg-surface shadow-neon-cyan">
              <Image
                src="/logo.png"
                alt="KeySmasher Logo"
                width={112}
                height={112}
                priority
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight">
            Master the Keyboard.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dominate the Arena.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
            A production-minded touch typing ecosystem combining a structured learning academy,
            a customizable Monkeytype-inspired practice engine, and real-time multiplayer competitions.
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/practice"
              id="hero-cta-practice"
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-neon-cyan transition-all hover:bg-cyan-400 hover:scale-105 active:scale-95"
            >
              <Zap className="h-4 w-4" />
              <span>Start Typing Test</span>
              <ChevronRight className="h-4 w-4" />
            </Link>

            <Link
              href="/learn"
              id="hero-cta-learn"
              className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-6 py-3.5 text-sm font-semibold text-slate-200 transition-all hover:border-slate-500 hover:bg-surface-muted"
            >
              <BookOpen className="h-4 w-4 text-cyan-400" />
              <span>Academy Curriculum</span>
            </Link>

            <Link
              href="/compete"
              id="hero-cta-compete"
              className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-950/20 px-6 py-3.5 text-sm font-semibold text-purple-300 transition-all hover:border-purple-400/50 hover:bg-purple-900/30"
            >
              <Swords className="h-4 w-4 text-purple-400" />
              <span>Multiplayer Arena</span>
            </Link>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Pillar 1: Practice Engine */}
          <div className="group relative rounded-2xl border border-surface-border bg-surface/70 p-7 backdrop-blur transition-all hover:border-cyan-500/50 hover:shadow-neon-card">
            <div className="mb-4 inline-flex rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
              <Gauge className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Customizable Engine</h2>
            <p className="mt-2 text-sm text-slate-400">
              Time (15s, 30s, 60s, 120s) and word count (10, 25, 50, 100) modes. Deterministic WPM &
              accuracy metrics based on the 5-character touch typing standard.
            </p>
            <div className="mt-5">
              <Link
                href="/practice"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                <span>Launch Practice</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Pillar 2: Structured Academy */}
          <div className="group relative rounded-2xl border border-surface-border bg-surface/70 p-7 backdrop-blur transition-all hover:border-blue-500/50 hover:shadow-neon-card">
            <div className="mb-4 inline-flex rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Touch Typing Academy</h2>
            <p className="mt-2 text-sm text-slate-400">
              Step-by-step curriculum across 5 levels from Beginner to Expert. Visual keyboard, finger guidance,
              accuracy thresholds, and progressive unlocking.
            </p>
            <div className="mt-5">
              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                <span>Explore Lessons</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Pillar 3: Real-Time Competitions */}
          <div className="group relative rounded-2xl border border-surface-border bg-surface/70 p-7 backdrop-blur transition-all hover:border-purple-500/50 hover:shadow-neon-card">
            <div className="mb-4 inline-flex rounded-xl bg-purple-500/10 p-3 text-purple-400">
              <Swords className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Real-Time Arena</h2>
            <p className="mt-2 text-sm text-slate-400">
              Live multiplayer typing races powered by an independent Socket.IO service. Synchronized countdowns,
              server-authoritative scoring, and room management.
            </p>
            <div className="mt-5">
              <Link
                href="/compete"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300"
              >
                <span>Join Arena</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Engineering Highlights Banner */}
        <div className="mt-16 rounded-2xl border border-surface-border bg-surface/40 p-6 backdrop-blur">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div className="border-r border-surface-border/50 p-2">
              <div className="text-2xl font-black text-cyan-400">5 Chars</div>
              <div className="text-xs text-slate-400">Standard Word Length</div>
            </div>
            <div className="border-r border-surface-border/50 p-2">
              <div className="text-2xl font-black text-emerald-400">Deterministic</div>
              <div className="text-xs text-slate-400">Scoring Engine</div>
            </div>
            <div className="border-r border-surface-border/50 p-2">
              <div className="text-2xl font-black text-purple-400">App Router</div>
              <div className="text-xs text-slate-400">Next.js & React 19</div>
            </div>
            <div className="p-2">
              <div className="text-2xl font-black text-amber-400">Strict TS</div>
              <div className="text-xs text-slate-400">Zero Silent Errors</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
