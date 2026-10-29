'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BookOpen, Zap, Swords, LayoutDashboard, Menu, X, User, LogIn, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isGuest, openAuthModal, signOut } = useAuth();

  // Primary navigation items (accessible with or without signin)
  const navItems = [
    { name: 'Learn', href: '/learn', icon: BookOpen },
    { name: 'Practice', href: '/practice', icon: Zap },
    { name: 'Compete', href: '/compete', icon: Swords },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-opacity hover:opacity-90"
          id="nav-brand-logo"
        >
          <div className="relative h-11 w-11 sm:h-12 sm:w-12 transition-transform group-hover:scale-105 flex items-center justify-center shrink-0">
            <Image
              src="/logo.png"
              alt="KeySmasher Logo"
              width={48}
              height={48}
              priority
              className="h-full w-full object-contain filter drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]"
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
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-surface px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-400 hover:text-white transition-all shadow-sm"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-bold font-mono text-[11px]">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span>{user.displayName || user.username}</span>
                {user.isDemo && (
                  <span className="rounded bg-purple-500/20 px-1 py-0.2 font-mono text-[9px] font-bold text-purple-300">
                    DEMO
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="auth-sign-in-btn"
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-neon-cyan active:scale-95"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}
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
            <div className="pt-2 border-t border-surface-border">
              {user ? (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">{user.username}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1 text-xs text-rose-400"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signin');
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2 text-xs font-bold text-slate-950"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
