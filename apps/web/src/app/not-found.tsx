import React from 'react';
import Link from 'next/link';
import { RotateCcw, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl border border-surface-border bg-surface p-8 max-w-md shadow-neon-card">
        <h1 className="text-6xl font-black text-cyan-400">404</h1>
        <h2 className="mt-3 text-xl font-bold text-white">Page Not Found</h2>
        <p className="mt-2 text-sm text-slate-400">
          The requested page could not be located. Check your destination or return to the practice arena.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/practice"
            className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-muted px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Practice Test</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
