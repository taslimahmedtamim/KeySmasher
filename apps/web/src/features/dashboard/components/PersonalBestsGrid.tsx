'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trophy, Clock, FileText, Quote, Play } from 'lucide-react';
import { PersonalBestRecord } from '../types';

interface PersonalBestsGridProps {
  records: PersonalBestRecord[];
}

export const PersonalBestsGrid: React.FC<PersonalBestsGridProps> = ({ records }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'time' | 'words' | 'quote'>('all');

  const filtered = records.filter(
    (r) => activeCategory === 'all' || r.category === activeCategory
  );

  return (
    <div className="rounded-3xl border border-surface-border bg-surface p-5 sm:p-6 shadow-neon-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">Personal Bests Hall of Records</h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Highest verified speed records categorized by duration and target count.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-surface-border bg-surface-muted p-1 text-[11px] font-semibold">
          {[
            { id: 'all', label: 'All' },
            { id: 'time', label: 'Time' },
            { id: 'words', label: 'Words' },
            { id: 'quote', label: 'Quote' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as any)}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Presets */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filtered.map((record) => {
          const hasRecord = record.wpm > 0;

          return (
            <div
              key={record.preset}
              className={`relative overflow-hidden rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                hasRecord
                  ? 'border-surface-border bg-surface-muted/40 hover:border-amber-500/50 hover:shadow-neon-card'
                  : 'border-dashed border-slate-800 bg-surface-muted/10 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-300">
                  {record.category === 'time' && <Clock className="h-3.5 w-3.5 text-cyan-400" />}
                  {record.category === 'words' && <FileText className="h-3.5 w-3.5 text-purple-400" />}
                  {record.category === 'quote' && <Quote className="h-3.5 w-3.5 text-amber-400" />}
                  <span>{record.label}</span>
                </span>

                {hasRecord ? (
                  <Trophy className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">—</span>
                )}
              </div>

              {hasRecord ? (
                <div>
                  <div className="mt-3 flex items-baseline gap-1 font-mono">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {record.wpm}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">WPM</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono border-t border-surface-border/50 pt-2">
                    <span className="text-emerald-400 font-semibold">{record.accuracy}% acc</span>
                    <span className="text-purple-400 font-semibold">{record.consistency}% con</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-center py-1">
                  <div className="text-xs font-semibold text-slate-500">No Record Yet</div>
                  <Link
                    href="/practice"
                    className="mt-2 inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all active:scale-95"
                  >
                    <Play className="h-2.5 w-2.5 fill-current" />
                    <span>Play Preset</span>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
