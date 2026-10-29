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

  const timeRecords = records.filter((r) => r.category === 'time');
  const wordRecords = records.filter((r) => r.category === 'words');
  const quoteRecord = records.find((r) => r.category === 'quote');

  const renderPresetCard = (record: PersonalBestRecord) => {
    const hasRecord = record.wpm > 0;

    return (
      <div
        key={record.preset}
        className={`relative overflow-hidden rounded-2xl border p-4 transition-all flex flex-col justify-between ${
          hasRecord
            ? 'border-surface-border bg-surface-muted/40 hover:border-amber-500/50 hover:shadow-neon-card'
            : 'border-surface-border/60 bg-surface-muted/20 hover:border-slate-700'
        }`}
      >
        {/* Card Header: Icon, Label, and Trophy */}
        <div className="flex items-center justify-between gap-1.5">
          <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-300 whitespace-nowrap">
            {record.category === 'time' && <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
            {record.category === 'words' && <FileText className="h-3.5 w-3.5 text-purple-400 shrink-0" />}
            {record.category === 'quote' && <Quote className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
            <span className="whitespace-nowrap">{record.label}</span>
          </span>

          {hasRecord ? (
            <Trophy className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
          ) : (
            <span className="text-xs text-slate-600 font-mono">—</span>
          )}
        </div>

        {/* Main Body: Large WPM readout */}
        <div className="mt-3 flex items-baseline gap-1 font-mono">
          <span
            className={`text-2xl sm:text-3xl font-black ${
              hasRecord ? 'text-white' : 'text-slate-600'
            }`}
          >
            {hasRecord ? record.wpm : '—'}
          </span>
          <span
            className={`text-xs font-semibold ${
              hasRecord ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            WPM
          </span>
        </div>

        {/* Bottom Footer: Stats or No Record Yet */}
        <div className="mt-3 border-t border-surface-border/50 pt-2 text-[11px] font-mono">
          {hasRecord ? (
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-semibold">{record.accuracy}% acc</span>
              <span className="text-purple-400 font-semibold">{record.consistency}% con</span>
            </div>
          ) : (
            <div className="text-center text-xs font-semibold text-slate-500">
              No Record Yet
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderQuoteShowcase = () => {
    const hasRecord = (quoteRecord?.wpm || 0) > 0;

    return (
      <div className="rounded-2xl border border-surface-border bg-gradient-to-r from-surface-muted/60 via-surface-muted/30 to-amber-500/5 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-amber-400 shrink-0">
            <Quote className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Quote Mode Record</h4>
              {hasRecord && (
                <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  <Trophy className="h-3 w-3 fill-amber-400/30 text-amber-400" />
                  <span>Verified Record</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Full literary passages testing authentic punctuation, capitalization, and typing rhythm.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-surface-border/60 pt-3 md:pt-0">
          {hasRecord ? (
            <div className="flex items-center gap-4 sm:gap-6">
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase font-mono">Speed</div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-2xl sm:text-3xl font-black text-white">{quoteRecord?.wpm}</span>
                  <span className="text-xs font-semibold text-slate-400">WPM</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase font-mono">Accuracy</div>
                <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                  {quoteRecord?.accuracy}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase font-mono">Consistency</div>
                <div className="text-lg sm:text-xl font-black text-purple-400 font-mono">
                  {quoteRecord?.consistency}%
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-medium">No quote record verified yet</div>
          )}

          <Link
            href="/practice?mode=quote"
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 transition-all active:scale-95 shrink-0"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Play Quote Mode</span>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-3xl border border-surface-border bg-surface p-5 sm:p-6 shadow-neon-card">
      {/* Header & Tabs */}
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

      {/* Content Rendering based on Tab */}
      <div className="mt-5 space-y-6">
        {/* TIME TRIALS */}
        {(activeCategory === 'all' || activeCategory === 'time') && (
          <div>
            {activeCategory === 'all' && (
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Time Trials
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {timeRecords.map(renderPresetCard)}
            </div>
          </div>
        )}

        {/* WORD SPRINTS */}
        {(activeCategory === 'all' || activeCategory === 'words') && (
          <div>
            {activeCategory === 'all' && (
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Word Sprints
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {wordRecords.map(renderPresetCard)}
            </div>
          </div>
        )}

        {/* QUOTE MODE SHOWCASE */}
        {(activeCategory === 'all' || activeCategory === 'quote') && (
          <div>
            {activeCategory === 'all' && (
              <div className="flex items-center gap-2 mb-3">
                <Quote className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Specialty Prose
                </span>
              </div>
            )}
            {renderQuoteShowcase()}
          </div>
        )}
      </div>
    </div>
  );
};

