'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home, Sparkles } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error telemetry for diagnostics
    console.error('KeySmasher Engine Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-full max-w-lg rounded-3xl border border-rose-500/30 bg-surface/90 p-8 shadow-neon-card backdrop-blur-md">
        <div className="mx-auto mb-4 inline-flex rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-rose-400">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-black text-white sm:text-3xl">Engine Interrupted</h1>

        <p className="mt-2 text-sm text-slate-300">
          An unexpected interruption occurred during test execution. Your saved profile and history remain safe.
        </p>

        {error?.digest && (
          <div className="mt-4 rounded-xl border border-surface-border bg-surface-muted/60 px-3 py-2 text-xs font-mono text-slate-400">
            Error Digest: <span className="text-rose-300">{error.digest}</span>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            id="error-reset-btn"
            onClick={() => reset()}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-neon-cyan active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/practice"
            className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-muted px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>Practice Arena</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors active:scale-95"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
