import React from 'react';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { useUserAnalytics } from '@/features/dashboard/useUserAnalytics';
import DashboardPage from '@/app/dashboard/page';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('Feature G: User Dashboard & Analytics', () => {
  beforeEach(() => {
    try {
      window.localStorage.clear();
    } catch {
      // Ignore
    }
  });

  describe('Guest Experience', () => {
    it('renders the Cyberpunk Account Unlock Gateway for unauthenticated guests', () => {
      render(
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      );

      expect(screen.getByText('Unlock Your Typist Dashboard')).toBeInTheDocument();
      expect(screen.getByText('1-Click Demo Account Login')).toBeInTheDocument();
      expect(screen.getByText('Sign In / Create Account')).toBeInTheDocument();
      expect(screen.getByText('Progression Curves')).toBeInTheDocument();
      expect(screen.getByText('Hall of Records')).toBeInTheDocument();
      expect(screen.getByText('Academy Mastery')).toBeInTheDocument();
    });

    it('allows 1-click Demo Account login directly from dashboard gateway', async () => {
      render(
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      );

      const demoBtn = screen.getByText('1-Click Demo Account Login');
      await act(async () => {
        fireEvent.click(demoBtn);
      });

      // Now dashboard should reveal authenticated interface for SpeedDemon
      expect(screen.getByText('Speed Demon')).toBeInTheDocument();
      expect(screen.getByText('@SpeedDemon')).toBeInTheDocument();
      expect(screen.getByText('Demo Account')).toBeInTheDocument();
    });
  });

  describe('useUserAnalytics Hook & Metrics Computation', () => {
    it('provides structured metrics, personal bests, and seed records for Demo user', async () => {
      const { result } = renderHook(
        () => {
          const auth = useAuth();
          const analytics = useUserAnalytics();
          return { auth, analytics };
        },
        { wrapper }
      );

      // Sign in as demo
      await act(async () => {
        await result.current.auth.signInWithDemo();
      });

      const { analytics } = result.current;

      // Check summary
      expect(analytics.summary.totalTests).toBeGreaterThanOrEqual(9);
      expect(analytics.summary.peakWpm).toBeGreaterThanOrEqual(100);
      expect(analytics.summary.avgAccuracy).toBeGreaterThanOrEqual(95);
      expect(analytics.summary.avgConsistency).toBeGreaterThanOrEqual(80);

      // Check personal bests
      expect(analytics.personalBests.length).toBeGreaterThanOrEqual(8);
      const time60 = analytics.personalBests.find((p) => p.preset === 'time-60');
      expect(time60).toBeDefined();
      expect(time60?.wpm).toBeGreaterThan(0);

      // Check academy mastery
      expect(analytics.academy.levels.length).toBe(5);
      expect(analytics.academy.totalStars).toBeGreaterThan(0);

      // Check chronological progression
      expect(analytics.progression.length).toBe(analytics.sessions.length);
      expect(analytics.progression[0].testIndex).toBe(1);
    });

    it('exports history JSON without throwing errors', async () => {
      // Mock URL.createObjectURL and revokeObjectURL
      const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
      const revokeObjectURLMock = vi.fn();
      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      const { result } = renderHook(
        () => {
          const auth = useAuth();
          const analytics = useUserAnalytics();
          return { auth, analytics };
        },
        { wrapper }
      );

      await act(async () => {
        await result.current.auth.signInWithDemo();
      });

      expect(() => {
        result.current.analytics.exportHistoryJson();
      }).not.toThrow();
    });
  });

  describe('Authenticated Dashboard Page Rendering', () => {
    it('renders all 5 core dashboard sections when authenticated', async () => {
      const TestWrapper: React.FC = () => {
        const { signInWithDemo } = useAuth();
        React.useEffect(() => {
          signInWithDemo();
        }, [signInWithDemo]);
        return <DashboardPage />;
      };

      render(
        <AuthProvider>
          <TestWrapper />
        </AuthProvider>
      );

      // 1. Banner
      expect(screen.getByText('Speed Demon')).toBeInTheDocument();
      expect(screen.getByText('Tests Taken')).toBeInTheDocument();

      // 2. KPI Cards
      expect(screen.getByText('Peak Speed')).toBeInTheDocument();
      expect(screen.getByText('Average Speed')).toBeInTheDocument();
      expect(screen.getAllByText('Accuracy').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Consistency').length).toBeGreaterThanOrEqual(1);

      // 3. Progression Chart
      expect(screen.getByText('Speed & Precision Progression')).toBeInTheDocument();

      // 4. Personal Bests & Academy
      expect(screen.getByText('Personal Bests Hall of Records')).toBeInTheDocument();
      expect(screen.getByText('Touch Typing Academy Mastery')).toBeInTheDocument();

      // 5. Historical Table
      expect(screen.getByText('Verified Speed Test Records')).toBeInTheDocument();
      expect(screen.getByText('Net Speed')).toBeInTheDocument();
      expect(screen.getByText('Raw Speed')).toBeInTheDocument();
    });
  });
});
