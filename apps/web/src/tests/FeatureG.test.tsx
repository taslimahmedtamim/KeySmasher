import React from 'react';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { useUserAnalytics } from '@/features/dashboard/useUserAnalytics';
import { saveSessionResult, clearStoredSessions } from '@/features/typing/utils/historyStorage';
import DashboardPage from '@/app/dashboard/page';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('Feature G: User Dashboard & Analytics', () => {
  beforeEach(() => {
    clearStoredSessions();
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

  describe('useUserAnalytics Hook & Real Data Computation', () => {
    it('computes metrics strictly from real saved sessions', async () => {
      // Save 2 real completed sessions
      saveSessionResult({
        mode: 'time',
        rawWpm: 110,
        netWpm: 105,
        accuracy: 98,
        cpm: 525,
        consistency: 92,
        elapsedSeconds: 60,
        difficulty: 'intermediate',
        errorCount: 2,
        targetDuration: 60,
      });

      saveSessionResult({
        mode: 'words',
        rawWpm: 120,
        netWpm: 118,
        accuracy: 99,
        cpm: 590,
        consistency: 95,
        elapsedSeconds: 25,
        difficulty: 'intermediate',
        errorCount: 1,
        targetWords: 50,
      });

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

      // Check real summary computation
      expect(analytics.summary.totalTests).toBe(2);
      expect(analytics.summary.peakWpm).toBe(118);
      expect(analytics.summary.avgWpm).toBe(112); // (105 + 118) / 2 = 111.5 -> 112
      expect(analytics.summary.avgAccuracy).toBe(99); // (98 + 99) / 2 = 98.5 -> 99

      // Check personal bests: time-60 should be 105, words-50 should be 118, others 0
      const time60 = analytics.personalBests.find((p) => p.preset === 'time-60');
      expect(time60?.wpm).toBe(105);

      const words50 = analytics.personalBests.find((p) => p.preset === 'words-50');
      expect(words50?.wpm).toBe(118);

      const time15 = analytics.personalBests.find((p) => p.preset === 'time-15');
      expect(time15?.wpm).toBe(0); // Not tested yet!

      // Check chronological progression
      expect(analytics.progression.length).toBe(2);
      expect(analytics.progression[0].testIndex).toBe(1);
      expect(analytics.progression[1].testIndex).toBe(2);
    });

    it('exports history JSON and CSV without throwing errors', async () => {
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

      expect(() => {
        result.current.analytics.exportHistoryCsv();
      }).not.toThrow();
    });
  });

  describe('Authenticated Dashboard Page Rendering', () => {
    it('renders all core dashboard sections with real data', async () => {
      saveSessionResult({
        mode: 'time',
        rawWpm: 95,
        netWpm: 90,
        accuracy: 97,
        cpm: 450,
        consistency: 91,
        elapsedSeconds: 60,
        difficulty: 'intermediate',
        errorCount: 3,
        targetDuration: 60,
      });

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
      expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);

      // 2. KPI Cards
      expect(screen.getByText('Peak Speed')).toBeInTheDocument();
      expect(screen.getByText('Average Speed')).toBeInTheDocument();
      expect(screen.getAllByText(/Accuracy/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Consistency/i).length).toBeGreaterThanOrEqual(1);

      // 3. Progression Chart
      expect(screen.getByText('Speed & Precision Progression')).toBeInTheDocument();

      // 4. Personal Bests & Academy
      expect(screen.getByText('Personal Bests Hall of Records')).toBeInTheDocument();
      expect(screen.getByText('Touch Typing Academy Mastery')).toBeInTheDocument();

      // 5. Historical Table
      expect(screen.getByText('Verified Speed Test Records')).toBeInTheDocument();
      expect(screen.getByText('Net Speed')).toBeInTheDocument();
      expect(screen.getByText('Raw Speed')).toBeInTheDocument();

      // 6. Certificate Download Action
      const certBtn = screen.getByRole('button', { name: /Download Certificate/i });
      expect(certBtn).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(certBtn);
      });

      // Verify certificate modal opens
      expect(screen.getByText('Official Typing Proficiency Certificate')).toBeInTheDocument();
      expect(screen.getByText('Download Certificate (PNG)')).toBeInTheDocument();
      expect(screen.getByText('Print')).toBeInTheDocument();

      // Close modal
      const closeBtn = screen.getByRole('button', { name: /Close dialog/i });
      await act(async () => {
        fireEvent.click(closeBtn);
      });
      expect(screen.queryByText('Official Typing Proficiency Certificate')).not.toBeInTheDocument();
    });
  });
});
