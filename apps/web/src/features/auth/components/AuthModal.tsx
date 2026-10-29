'use client';

import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { X, Lock, Mail, User, Sparkles, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithDemo,
    isLoading,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync mode with context
  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMsg('');
    setSuccessMsg('');
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup' && !username.trim()) {
      setErrorMsg('Please choose a username.');
      return;
    }

    if (mode === 'signin') {
      const res = await signInWithEmail(email.trim(), password);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        closeAuthModal();
      }
    } else {
      const res = await signUpWithEmail(
        email.trim(),
        password,
        username.trim(),
        displayName.trim() || undefined
      );
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Account created successfully! Welcome to KeySmasher.');
        setTimeout(() => closeAuthModal(), 1200);
      }
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg('');
    await signInWithDemo();
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-surface-border bg-surface p-6 sm:p-8 shadow-neon-card animate-scale-in">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-surface-muted hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Lock className="h-3 w-3" />
            <span>KeySmasher Account</span>
          </div>

          <h2 className="mt-3 text-2xl font-black text-white">
            {mode === 'signin' ? 'Welcome Back, Typist' : 'Join the Arena'}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to permanently save your speed test history, unlock dashboard analytics, and compete in multiplayer races.
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-surface-border bg-surface-muted p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
            }}
            className={`rounded-lg py-2 transition-all ${
              mode === 'signin'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-neon-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`rounded-lg py-2 transition-all ${
              mode === 'signup'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-neon-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Messages */}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300">Username</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. speeddemon"
                  required
                  className="w-full rounded-xl border border-surface-border bg-surface-muted py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="typist@example.com"
                required
                className="w-full rounded-xl border border-surface-border bg-surface-muted py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full rounded-xl border border-surface-border bg-surface-muted py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Display Name <span className="text-slate-500 text-[10px]">(optional)</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Speed Demon"
                className="mt-1 w-full rounded-xl border border-surface-border bg-surface-muted px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 text-xs font-bold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-neon-cyan disabled:opacity-50"
          >
            <span>{mode === 'signin' ? 'Sign In to Account' : 'Create Account'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="w-full border-t border-surface-border" />
          <span className="absolute bg-surface px-3 font-mono text-[10px] uppercase text-slate-500">
            or test instantly
          </span>
        </div>

        {/* 1-Click Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/10 py-2.5 text-xs font-bold text-purple-300 transition-all hover:bg-purple-500/20 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span>Quick Demo Account (1-Click Login)</span>
        </button>
      </div>
    </div>
  );
};
