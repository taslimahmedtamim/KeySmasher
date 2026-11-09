'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../AuthContext';
import { X, Lock, Mail, User, Sparkles, ArrowRight, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

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
        username.trim()
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity"
        onClick={closeAuthModal}
        aria-hidden="true"
      />

      {/* Centering wrapper with min-h-full to ensure smooth natural scrolling without cut-off */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        {/* Modal Dialog Card */}
        <div
          className="relative w-full max-w-sm sm:max-w-md rounded-2xl border border-surface-border bg-surface p-4 sm:p-5 text-left shadow-neon-card animate-scale-in my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-surface-muted hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Modal Header */}
          <div className="text-center pr-6 pl-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300">
              <Lock className="h-3 w-3" />
              <span>KeySmasher Account</span>
            </div>

            <h2 className="mt-1.5 text-lg sm:text-xl font-bold text-white">
              {mode === 'signin' ? 'Welcome Back, Typist' : 'Join the Arena'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400 max-w-xs mx-auto">
              {mode === 'signin'
                ? 'Sign in to access your dashboard analytics & records.'
                : 'Create an account to save test history and academy progress.'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl border border-surface-border bg-surface-muted p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
              }}
              className={`rounded-lg py-1.5 transition-colors duration-150 ${
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
              className={`rounded-lg py-1.5 transition-colors duration-150 ${
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
            <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-2 text-xs text-rose-300">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2 text-xs text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-3 space-y-2">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300">Username</label>
                <div className="relative mt-1">
                  <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. speeddemon"
                    required
                    className="w-full rounded-lg border border-surface-border bg-surface-muted py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-300">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="typist@example.com"
                  required
                  className="w-full rounded-lg border border-surface-border bg-surface-muted py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-surface-border bg-surface-muted py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full !mt-3 flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2 text-xs font-bold text-slate-950 transition-colors duration-150 hover:bg-cyan-400 hover:shadow-neon-cyan disabled:opacity-50 active:scale-95"
            >
              <span>{mode === 'signin' ? 'Sign In to Account' : 'Create Account'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-2.5 flex items-center justify-center">
            <div className="w-full border-t border-surface-border" />
            <span className="absolute bg-surface px-2 font-mono text-[9px] uppercase text-slate-500">
              or instant test
            </span>
          </div>

          {/* 1-Click Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-500/10 py-2 text-xs font-bold text-purple-300 transition-colors duration-150 hover:bg-purple-500/20 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Quick Demo Account (1-Click Login)</span>
          </button>

          {/* Quick Test Without Sign In */}
          <Link
            href="/practice"
            prefetch={true}
            onClick={closeAuthModal}
            className="w-full !mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-surface-border bg-surface-muted py-2 text-xs font-semibold text-slate-300 transition-colors duration-150 hover:bg-surface hover:text-white active:scale-95"
          >
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>Quick Test (No Account Needed)</span>
          </Link>
        </div>
      </div>
    </div>
  );
};