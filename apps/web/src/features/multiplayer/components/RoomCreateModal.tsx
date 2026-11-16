'use client';

import React, { useState } from 'react';
import { X, Swords, Sparkles, Check } from 'lucide-react';
import { PassageDifficulty, RoomConfig, TestMode } from '@keysmasher/shared';

interface RoomCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: Partial<RoomConfig>) => Promise<boolean>;
}

export function RoomCreateModal({ isOpen, onClose, onCreate }: RoomCreateModalProps) {
  const [mode, setMode] = useState<TestMode>('words');
  const [targetWords, setTargetWords] = useState<number>(25);
  const [targetDuration, setTargetDuration] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<PassageDifficulty>('intermediate');
  const [punctuation, setPunctuation] = useState<boolean>(false);
  const [numbers, setNumbers] = useState<boolean>(false);
  const [maxPlayers, setMaxPlayers] = useState<number>(8);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const success = await onCreate({
        mode,
        targetWords,
        targetDuration,
        difficulty,
        punctuation,
        numbers,
        maxPlayers,
        isPrivate: true,
      });
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto rounded-2xl border border-surface-border bg-surface p-5 sm:p-6 shadow-2xl max-h-[calc(100vh-1.5rem)] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-surface-muted hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-surface-border pb-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 shrink-0">
            <Swords className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Create Private Battle Arena</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize room rules, length, and invite your friends.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
          {/* Test Mode */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Passage Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['words', 'time', 'quote'] as TestMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-xl py-1.5 px-3 text-xs font-bold capitalize transition-all border ${
                    mode === m
                      ? 'border-purple-500 bg-purple-600/20 text-purple-300 shadow-neon-purple'
                      : 'border-surface-border bg-surface-muted/50 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Mode-Specific Length */}
          {mode === 'words' && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Word Count
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setTargetWords(w)}
                    className={`rounded-xl py-1.5 text-xs font-bold transition-all border ${
                      targetWords === w
                        ? 'border-cyan-500 bg-cyan-600/20 text-cyan-300'
                        : 'border-surface-border bg-surface-muted/50 text-slate-400 hover:text-white'
                    }`}
                  >
                    {w} Words
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'time' && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Time Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 60, 120].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTargetDuration(s)}
                    className={`rounded-xl py-1.5 text-xs font-bold transition-all border ${
                      targetDuration === s
                        ? 'border-cyan-500 bg-cyan-600/20 text-cyan-300'
                        : 'border-surface-border bg-surface-muted/50 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Vocabulary Difficulty
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['beginner', 'intermediate', 'advanced', 'expert'] as PassageDifficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`rounded-xl py-1.5 text-xs font-bold capitalize transition-all border ${
                    difficulty === d
                      ? 'border-purple-500 bg-purple-600/20 text-purple-300'
                      : 'border-surface-border bg-surface-muted/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Modifiers (Punctuation & Numbers) */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPunctuation(!punctuation)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 border text-xs font-semibold transition-all ${
                punctuation
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                  : 'border-surface-border bg-surface-muted/40 text-slate-400 hover:text-white'
              }`}
            >
              <div
                className={`h-3.5 w-3.5 rounded flex items-center justify-center border ${
                  punctuation ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-600'
                }`}
              >
                {punctuation && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <span>@#$ Punctuation</span>
            </button>

            <button
              type="button"
              onClick={() => setNumbers(!numbers)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 border text-xs font-semibold transition-all ${
                numbers
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                  : 'border-surface-border bg-surface-muted/40 text-slate-400 hover:text-white'
              }`}
            >
              <div
                className={`h-3.5 w-3.5 rounded flex items-center justify-center border ${
                  numbers ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-600'
                }`}
              >
                {numbers && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <span>123 Numbers</span>
            </button>
          </div>

          {/* Max Players */}
          <div>
            <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              <span>Racer Capacity</span>
              <span className="text-purple-400 font-bold">{maxPlayers} Racers</span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              step={1}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10))}
              className="w-full accent-purple-500 bg-surface-muted rounded-lg h-1.5 cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-surface-border py-2 text-xs font-semibold text-slate-400 hover:bg-surface-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-2 text-xs font-bold text-white shadow-neon-purple hover:bg-purple-500 transition-all disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Creating Arena...' : 'Create Arena'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
