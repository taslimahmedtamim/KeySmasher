'use client';

import React from 'react';
import { Swords, Plus, Key, Trophy, Users, ShieldAlert, Radio } from 'lucide-react';

export default function CompetePage() {
  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-surface-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
              <Swords className="h-3.5 w-3.5" />
              <span>Real-Time Multiplayer Arena</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Competitive Typing Battles
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Compete live against friends, classmates, or global typists in private and public rooms.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 md:mt-0">
            <button
              type="button"
              onClick={() => alert('Multiplayer room creation will be active in Feature I & J.')}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-neon-purple transition-all hover:bg-purple-500"
            >
              <Plus className="h-4 w-4" />
              <span>Create Private Room</span>
            </button>
          </div>
        </div>

        {/* Feature roadmap cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-surface-border bg-surface p-6">
            <div className="mb-4 inline-flex rounded-xl bg-purple-500/10 p-3 text-purple-400">
              <Key className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Private Rooms</h2>
            <p className="mt-2 text-sm text-slate-400">
              Generate 6-character room codes, invite friends, and customize passage length and difficulty.
            </p>
            <div className="mt-4 text-xs font-semibold text-slate-500">Scheduled: Feature I</div>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface p-6">
            <div className="mb-4 inline-flex rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
              <Radio className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Synchronized Races</h2>
            <p className="mt-2 text-sm text-slate-400">
              Server-authoritative synchronized countdowns, live player progress bars, and instant finish rankings.
            </p>
            <div className="mt-4 text-xs font-semibold text-slate-500">Scheduled: Feature J</div>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface p-6">
            <div className="mb-4 inline-flex rounded-xl bg-amber-500/10 p-3 text-amber-400">
              <Trophy className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Global Leaderboards</h2>
            <p className="mt-2 text-sm text-slate-400">
              Persistent race records, Elo-based competitive matchmaking, and weekly division tournaments.
            </p>
            <div className="mt-4 text-xs font-semibold text-slate-500">Scheduled: Feature K & M</div>
          </div>
        </div>

        {/* Join room placeholder */}
        <div className="mt-8 rounded-2xl border border-surface-border bg-surface/50 p-6">
          <h2 className="text-base font-bold text-white">Join with Room Code</h2>
          <div className="mt-3 flex max-w-md gap-3">
            <input
              type="text"
              placeholder="e.g. KS-9421"
              maxLength={8}
              className="flex-1 rounded-xl border border-surface-border bg-surface-muted px-4 py-2.5 text-sm uppercase tracking-wider text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => alert('Multiplayer socket service will connect in Feature I.')}
              className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-500"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
