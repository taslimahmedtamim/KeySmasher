import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, Github, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-surface-border bg-surface/50 py-8 text-sm text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-300">Core Services Operational</span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-400">KeySmasher v0.1.0</span>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <Link href="/practice" className="hover:text-cyan-400 transition-colors">
            Practice Engine
          </Link>
          <Link href="/learn" className="hover:text-cyan-400 transition-colors">
            Academy
          </Link>
          <Link href="/compete" className="hover:text-cyan-400 transition-colors">
            Competitions
          </Link>
          <a
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
          >
            <Activity className="h-3 w-3" />
            <span>Health Check API</span>
          </a>
        </div>

        <div className="text-xs text-slate-500">
          Built with Next.js, TypeScript & Tailwind CSS. Keyboard-first design.
        </div>
      </div>
    </footer>
  );
};
