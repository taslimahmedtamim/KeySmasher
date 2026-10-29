'use client';

import React, { useState, useMemo } from 'react';
import { History, ChevronLeft, ChevronRight, Star, Trophy } from 'lucide-react';
import { SavedTestSession } from '../../typing/utils/historyStorage';

interface SessionHistoryTableProps {
  sessions: SavedTestSession[];
}

const ITEMS_PER_PAGE = 8;

export const SessionHistoryTable: React.FC<SessionHistoryTableProps> = ({ sessions }) => {
  const [filterMode, setFilterMode] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Identify all-time peak WPM session
  const peakWpm = useMemo(() => {
    if (sessions.length === 0) return 0;
    return Math.max(...sessions.map((s) => s.netWpm));
  }, [sessions]);

  // Identify best session ID for each preset mode
  const presetBestIds = useMemo(() => {
    const scoreMap = new Map<string, { id: string; wpm: number }>();
    sessions.forEach((s) => {
      const presetKey =
        s.mode === 'time'
          ? `time-${s.targetDuration || s.elapsedSeconds}`
          : s.mode === 'words'
          ? `words-${s.targetWords || 25}`
          : s.mode;

      const existing = scoreMap.get(presetKey);
      if (!existing || s.netWpm > existing.wpm) {
        scoreMap.set(presetKey, { id: s.id, wpm: s.netWpm });
      }
    });

    return new Set(Array.from(scoreMap.values()).map((v) => v.id));
  }, [sessions]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    if (filterMode === 'all') return sessions;
    return sessions.filter((s) => s.mode === filterMode);
  }, [sessions, filterMode]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / ITEMS_PER_PAGE));
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSessions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSessions, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (ts: number): string => {
    const d = new Date(ts);
    return d.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="rounded-3xl border border-surface-border bg-surface p-5 sm:p-6 shadow-neon-card">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Verified Speed Test Records</h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Comprehensive audit log of recent keystroke performance sessions.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mode Tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-surface-border bg-surface-muted p-1 text-[11px] font-semibold">
            {[
              { id: 'all', label: 'All' },
              { id: 'time', label: 'Time' },
              { id: 'words', label: 'Words' },
              { id: 'quote', label: 'Quote' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilterMode(tab.id);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  filterMode === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-neon-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        {paginatedSessions.length > 0 ? (
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-surface-border/70 text-[10px] uppercase tracking-wider text-slate-500">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Mode Preset</th>
                <th className="pb-3 font-semibold">Net Speed</th>
                <th className="pb-3 font-semibold">Raw Speed</th>
                <th className="pb-3 font-semibold">Accuracy</th>
                <th className="pb-3 font-semibold">Consistency</th>
                <th className="pb-3 font-semibold">Mistakes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/30">
              {paginatedSessions.map((session) => {
                const isPeak = session.netWpm === peakWpm && peakWpm > 0;
                const isBest = presetBestIds.has(session.id);
                const roundedNetWpm = Math.round(session.netWpm);
                const roundedRawWpm = Math.round(session.rawWpm);
                const roundedAccuracy = Math.round(session.accuracy);
                const roundedConsistency = Math.round(session.consistency || 100);

                return (
                  <tr
                    key={session.id}
                    className={`transition-colors group ${
                      isPeak
                        ? 'bg-amber-500/[0.08] hover:bg-amber-500/[0.13]'
                        : isBest
                        ? 'bg-cyan-500/[0.04] hover:bg-cyan-500/[0.08]'
                        : 'hover:bg-surface-muted/30'
                    }`}
                  >
                    <td className="py-3 text-slate-400 text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isPeak ? (
                          <span
                            title="All-Time Peak Speed Record"
                            className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse"
                          >
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span>PEAK</span>
                          </span>
                        ) : isBest ? (
                          <span
                            title="Personal Best for this mode preset"
                            className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.25)]"
                          >
                            <Star className="h-2.5 w-2.5 fill-cyan-400 text-cyan-400" />
                            <span>BEST</span>
                          </span>
                        ) : null}
                        <span>{formatDate(session.timestamp)}</span>
                      </div>
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${
                          session.mode === 'time'
                            ? 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                            : session.mode === 'words'
                            ? 'border border-purple-500/30 bg-purple-500/10 text-purple-300'
                            : session.mode === 'quote'
                            ? 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
                            : 'border border-slate-700 bg-surface-muted text-slate-300'
                        }`}
                      >
                        {session.mode === 'time'
                          ? `Time ${session.targetDuration || session.elapsedSeconds}s`
                          : session.mode === 'words'
                          ? `${session.targetWords || 25} Words`
                          : session.mode === 'quote'
                          ? 'Quote Mode'
                          : 'Custom'}
                      </span>
                    </td>
                    <td
                      className={`py-3 font-bold whitespace-nowrap ${
                        isPeak ? 'text-amber-300' : 'text-cyan-300'
                      }`}
                    >
                      <span className="text-sm font-black">{roundedNetWpm}</span>{' '}
                      <span className="text-[10px] text-slate-500 font-normal">WPM</span>
                    </td>
                    <td className="py-3 text-slate-400 whitespace-nowrap">
                      {roundedRawWpm} <span className="text-[10px] text-slate-500">WPM</span>
                    </td>
                    <td className="py-3 font-bold text-emerald-400 whitespace-nowrap">
                      {roundedAccuracy}%
                    </td>
                    <td className="py-3 text-purple-300 whitespace-nowrap">
                      {roundedConsistency}%
                    </td>
                    <td className="py-3 text-slate-400 whitespace-nowrap">
                      {session.errorCount || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No session records match this filter.
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-surface-border pt-4 text-xs">
          <span className="text-slate-400">
            Page <span className="font-bold text-white">{currentPage}</span> of{' '}
            <span className="font-bold text-white">{totalPages}</span> ({filteredSessions.length} total)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex items-center gap-1 rounded-lg border border-surface-border bg-surface px-2.5 py-1 text-slate-300 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:hover:border-surface-border transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex items-center gap-1 rounded-lg border border-surface-border bg-surface px-2.5 py-1 text-slate-300 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:hover:border-surface-border transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
