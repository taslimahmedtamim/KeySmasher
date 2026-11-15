'use client';

import React, { useState } from 'react';
import { ArrowRight, KeyRound } from 'lucide-react';

interface RoomJoinCardProps {
  onJoin: (code: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function RoomJoinCard({ onJoin, isLoading = false }: RoomJoinCardProps) {
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (cleanCode) {
      await onJoin(cleanCode);
    }
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface/60 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400 border border-purple-500/20">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Join with Room Code</h2>
          <p className="text-xs text-slate-400">
            Enter an invite code provided by a battle host.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. KS-9421 or B4X9Q1"
          maxLength={10}
          className="flex-1 rounded-xl border border-surface-border bg-surface-muted px-4 py-2.5 text-sm uppercase tracking-wider font-mono text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!code.trim() || isLoading}
          className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-neon-purple hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isLoading ? 'Joining...' : 'Join Arena'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
