import React from 'react';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { AuthProvider, useAuth, DEMO_USER } from '@/features/auth/AuthContext';
import { AuthModal } from '@/features/auth/components/AuthModal';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    {children}
    <AuthModal />
  </AuthProvider>
);

describe('Feature F: Authentication & Database Foundation', () => {
  beforeEach(() => {
    try {
      window.localStorage.clear();
    } catch {
      // Ignore
    }
  });

  describe('Database Schema & RLS Migration Integrity', () => {
    it('PostgreSQL migration script exists and enforces RLS on all 5 tables', () => {
      const migrationPath = path.resolve(
        process.cwd(),
        '../../supabase/migrations/20261029000000_init_auth_and_records.sql'
      );
      // If run from workspace apps/web, check relative path
      const resolvedPath = fs.existsSync(migrationPath)
        ? migrationPath
        : path.resolve(process.cwd(), 'supabase/migrations/20261029000000_init_auth_and_records.sql');

      expect(fs.existsSync(resolvedPath)).toBe(true);
      const sqlContent = fs.readFileSync(resolvedPath, 'utf8');

      // Table definitions
      expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.profiles');
      expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.user_preferences');
      expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.typing_sessions');
      expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.personal_bests');
      expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.lesson_progress');

      // RLS enabled
      expect(sqlContent).toContain('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;');
      expect(sqlContent).toContain('ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;');
      expect(sqlContent).toContain('ALTER TABLE public.typing_sessions ENABLE ROW LEVEL SECURITY;');
      expect(sqlContent).toContain('ALTER TABLE public.personal_bests ENABLE ROW LEVEL SECURITY;');
      expect(sqlContent).toContain('ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;');

      // Trigger for new user
      expect(sqlContent).toContain('CREATE OR REPLACE FUNCTION public.handle_new_user');
      expect(sqlContent).toContain('CREATE OR REPLACE TRIGGER on_auth_user_created');
    });
  });

  describe('AuthProvider & useAuth Hook', () => {
    it('initializes in guest mode by default', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isGuest).toBe(true);
    });

    it('signs in with demo user and resets on signOut', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signInWithDemo();
      });

      expect(result.current.isGuest).toBe(false);
      expect(result.current.user).not.toBeNull();
      expect(result.current.user?.username).toBe(DEMO_USER.username);
      expect(result.current.user?.isDemo).toBe(true);

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.isGuest).toBe(true);
      expect(result.current.user).toBeNull();
    });

    it('supports mock sign in and sign up with email', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const res = await result.current.signUpWithEmail(
          'alice@example.com',
          'secret123',
          'alice_runner',
          'Alice Runner'
        );
        expect(res.error).toBeUndefined();
      });

      expect(result.current.isGuest).toBe(false);
      expect(result.current.user?.email).toBe('alice@example.com');
      expect(result.current.user?.username).toBe('alice_runner');
    });
  });

  describe('AuthModal Component', () => {
    it('opens and closes via AuthContext controls', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthModalOpen).toBe(false);

      act(() => {
        result.current.openAuthModal('signin');
      });

      expect(result.current.isAuthModalOpen).toBe(true);
      expect(result.current.authModalMode).toBe('signin');

      act(() => {
        result.current.closeAuthModal();
      });

      expect(result.current.isAuthModalOpen).toBe(false);
    });

    it('validates password minimum length in form', async () => {
      const TestComponent: React.FC = () => {
        const { openAuthModal } = useAuth();
        return (
          <button type="button" onClick={() => openAuthModal('signin')}>
            Open
          </button>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
          <AuthModal />
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Open'));
      expect(screen.getByText('Welcome Back, Typist')).toBeInTheDocument();

      const emailInput = screen.getByPlaceholderText('typist@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitBtn = screen.getByRole('button', { name: /Sign In to Account/i });

      // Enter short password
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '123' } });

      await act(async () => {
        fireEvent.click(submitBtn);
      });

      expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });
});
