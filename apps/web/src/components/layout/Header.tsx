'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BookOpen, Zap, Swords, LayoutDashboard, Menu, X, Keyboard } from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Learn', href: '/learn', icon: BookOpen },
    { name: 'Practice', href: '/practice', icon: Zap },
    { name: 'Compete', href: '/compete', icon: Swords },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-opacity hover:opacity-90"
          id="nav-brand-logo"
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-cyan-500/30 bg-surface shadow-neon-cyan transition-transform group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="KeySmasher Logo"
              width={40}
              height={40}
              priority
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wider text-slate-100">
              KEY<span className="text-cyan-400">SMASHER</span>
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              Typing Academy & Arena
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                id={`nav-link-${item.name.toLowerCase()}`}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'border border-cyan-500/30 bg-surface-muted text-cyan-400 shadow-sm'
                    : 'text-slate-300 hover:bg-surface hover:text-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Auth controls */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/practice"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-surface px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
            title="Quick Practice (Ctrl + Enter)"
          >
            <Keyboard className="h-3.5 w-3.5 text-cyan-400" />
            <span>Quick Test</span>
          </Link>
          <button
            type="button"
            id="auth-sign-in-btn"
            onClick={() => alert('Authentication will be connected in Phase F (Supabase Integration).')}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-neon-cyan active:scale-95"
          >
            Sign In
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-300 hover:bg-surface hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-surface-border bg-surface px-4 py-3 md:hidden">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-slate-300 hover:bg-surface-muted hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  alert('Authentication will be connected in Phase F (Supabase Integration).');
                }}
                className="w-full rounded-lg bg-cyan-500 py-2 text-center text-sm font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
