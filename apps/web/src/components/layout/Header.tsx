'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BookOpen, Zap, Swords, LayoutDashboard, Menu, X, User, LogIn, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const { user, isGuest, openAuthModal, signOut } = useAuth();

  // Reset optimistic pending state whenever Next.js finishes navigating to the new route
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const activeHref = pendingHref || pathname;

  // Primary navigation items (shown in main center nav after signin)
  const navItems = user
    ? [
        { name: 'Learn', href: '/learn', icon: BookOpen },
        { name: 'Practice', href: '/practice', icon: Zap },
        { name: 'Compete', href: '/compete', icon: Swords },
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ]
    : [];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/80 backdrop-blur-md relative">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-opacity hover:opacity-90 outline-none focus:outline-none"
          id="nav-brand-logo"
          onClick={() => {
            if (pathname !== '/') {
              setPendingHref('/');
            }
          }}
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

        {/* Desktop Navigation (Center: only shown when signed in) */}
        {user && (
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeHref === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  id={`nav-link-${item.name.toLowerCase()}`}
                  onClick={(e) => {
                    if (pathname === item.href) {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      setPendingHref(item.href);
                    }
                  }}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 outline-none focus:outline-none select-none ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.15)]'
                      : 'text-slate-400 hover:text-white hover:bg-surface/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-colors duration-200 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute bottom-1 left-3 right-3 h-[2px] rounded-full bg-cyan-400/90 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right CTA / Auth controls */}
        <div className="hidden items-center gap-3 md:flex">
          {!user && (
            <Link
              href="/practice"
              prefetch={true}
              id="nav-link-practice"
              onClick={(e) => {
                if (pathname === '/practice') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setPendingHref('/practice');
                }
              }}
              className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 outline-none focus:outline-none select-none ${
                activeHref === '/practice'
                  ? 'bg-cyan-500/15 text-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-surface/50'
              }`}
            >
              <Zap className={`h-4 w-4 transition-colors duration-200 ${activeHref === '/practice' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>Quick Test</span>
              {activeHref === '/practice' && (
                <span className="absolute bottom-1 left-3 right-3 h-[2px] rounded-full bg-cyan-400/90 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                prefetch={true}
                onClick={() => {
                  if (pathname !== '/dashboard') {
                    setPendingHref('/dashboard');
                  }
                }}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-surface px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-400 hover:text-white transition-colors duration-150 shadow-sm outline-none focus:outline-none"
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
                className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-colors duration-150"
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
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors duration-150 hover:bg-cyan-400 hover:shadow-neon-cyan active:scale-95"
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
            {(user ? navItems : [{ name: 'Quick Test', href: '/practice', icon: Zap }]).map((item) => {
              const Icon = item.icon;
              const isActive = activeHref === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    if (pathname === item.href) {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      setPendingHref(item.href);
                    }
                  }}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium outline-none focus:outline-none transition-colors duration-150 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 font-semibold'
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
