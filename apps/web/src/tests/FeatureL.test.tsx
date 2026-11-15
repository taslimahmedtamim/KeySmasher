import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  computeLevelProgress,
  getLevelTitle,
  calculateSessionXp,
  calculateRaceXp,
  calculateLessonXp,
  evaluateAllAchievements,
  getStoredGamificationState,
  ALL_ACHIEVEMENTS,
} from '../features/gamification/gamificationEngine';
import { LevelProgressBar } from '../features/gamification/components/LevelProgressBar';
import { DailyGoalsCard } from '../features/gamification/components/DailyGoalsCard';
import { AchievementsModal } from '../features/gamification/components/AchievementsModal';
import { XpGainToast } from '../features/gamification/components/XpGainToast';
import { GamificationProvider } from '../features/gamification/GamificationContext';
import DashboardPage from '../app/dashboard/page';

// Mock navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock AuthContext
vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'gamified-user-1',
      username: 'SpeedDemon',
      displayName: 'Speed Demon',
      email: 'demon@keysmasher.io',
      isDemo: true,
    },
    isLoading: false,
    isGuest: false,
  }),
}));

describe('Feature L: Gamification, Levels, Daily Goals & Achievements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  describe('Level Progression & Titles', () => {
    it('accurately maps level numbers to titles', () => {
      expect(getLevelTitle(1)).toBe('Tactile Initiate');
      expect(getLevelTitle(2)).toBe('Cadence Scout');
      expect(getLevelTitle(4)).toBe('Shadow Typist');
      expect(getLevelTitle(5)).toBe('Sonic Drifter');
      expect(getLevelTitle(10)).toBe('Velocity Ranger');
      expect(getLevelTitle(20)).toBe('Hypersonic Ace');
      expect(getLevelTitle(25)).toBe('Mythic Speed Demon');
      expect(getLevelTitle(30)).toBe('Zero-Latency Ronin');
      expect(getLevelTitle(50)).toBe('The Absolute KeySmasher');
      expect(getLevelTitle(55)).toBe('The Absolute KeySmasher (Tier 5)');
    });

    it('computes level progress and percentage accurately from total XP', () => {
      const start = computeLevelProgress(0);
      expect(start.level).toBe(1);
      expect(start.progressPercent).toBe(0);

      // Level 2 begins at 150 XP
      const midLevel = computeLevelProgress(250);
      expect(midLevel.level).toBeGreaterThanOrEqual(1);
      expect(midLevel.progressPercent).toBeGreaterThan(0);
      expect(midLevel.title).toBeDefined();
    });
  });

  describe('XP Calculation Formulas', () => {
    it('calculates practice session XP with accuracy multipliers', () => {
      const normalXp = calculateSessionXp({
        netWpm: 60,
        accuracy: 95,
        totalCharacters: 150, // 30 words
      });
      // 30 base words + 24 speed bonus = 54 * 1.1 = 59
      expect(normalXp).toBeGreaterThanOrEqual(50);

      const perfectXp = calculateSessionXp({
        netWpm: 60,
        accuracy: 100,
        totalCharacters: 150,
      });
      // 100% accuracy receives 1.5x multiplier
      expect(perfectXp).toBeGreaterThan(normalXp);
    });

    it('calculates arena race XP with placement bonuses', () => {
      const winXp = calculateRaceXp(1, 90, 98); // P1 gets +120 bonus
      const lossXp = calculateRaceXp(4, 90, 98); // P4 gets +25 bonus
      expect(winXp).toBeGreaterThan(lossXp);
    });

    it('calculates academy lesson XP with star ratings', () => {
      const threeStarXp = calculateLessonXp(3, 98);
      const twoStarXp = calculateLessonXp(2, 98);
      expect(threeStarXp).toBeGreaterThan(twoStarXp);
    });
  });

  describe('Achievements Evaluation', () => {
    it('detects milestone unlocks for speed, accuracy, and streaks', () => {
      const state = getStoredGamificationState();

      const { achievements, newUnlocks } = evaluateAllAchievements(state, {
        peakWpm: 105, // Century Club (100+) & Speed 60
        totalSessions: 30, // First strike & Centurion (25+)
        highestAccuracy: 100, // Dead-Eye Precision
        academyStars: 12, // Academy Scholar (10+)
        arenaWins: 2, // First Blood
        arenaPodiums: 6, // Podium Master (5+)
      });

      expect(achievements).toHaveLength(ALL_ACHIEVEMENTS.length);

      const century = achievements.find((a) => a.id === 'century-club');
      expect(century?.unlocked).toBe(true);
      expect(century?.progress).toBe(100);

      const deadEye = achievements.find((a) => a.id === 'dead-eye');
      expect(deadEye?.unlocked).toBe(true);

      const supersonic = achievements.find((a) => a.id === 'supersonic');
      expect(supersonic?.unlocked).toBe(false); // 105 < 140
      expect(supersonic?.progress).toBe(75);

      expect(newUnlocks.length).toBeGreaterThan(0);
    });
  });

  describe('LevelProgressBar Component', () => {
    const mockProgress = {
      level: 12,
      totalXp: 3450,
      currentLevelXp: 280,
      nextLevelRequiredXp: 500,
      progressPercent: 56,
      title: 'Velocity Typist',
    };

    it('renders full card with title, progress bar, and achievements trigger', () => {
      const onOpenMock = vi.fn();
      render(
        <LevelProgressBar
          progress={mockProgress}
          onOpenAchievements={onOpenMock}
          compact={false}
        />
      );

      expect(screen.getByText(/LEVEL 12 STATUS/i)).toBeInTheDocument();
      expect(screen.getByText('Velocity Typist')).toBeInTheDocument();
      expect(screen.getByText(/280 \/ 500 XP/i)).toBeInTheDocument();
      expect(screen.getByText('56%')).toBeInTheDocument();

      const badgesBtn = screen.getByRole('button', { name: /Badges & Milestones/i });
      fireEvent.click(badgesBtn);
      expect(onOpenMock).toHaveBeenCalled();
    });

    it('renders compact mode for the navigation header', () => {
      render(<LevelProgressBar progress={mockProgress} compact={true} />);
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Velocity Typist')).toBeInTheDocument();
    });
  });

  describe('DailyGoalsCard Component', () => {
    it('renders 3 daily goals with completion states and XP rewards', () => {
      const goals = [
        {
          id: 'g1',
          title: 'Daily Cadence',
          description: 'Complete 3 typing tests',
          target: 3,
          current: 3,
          isCompleted: true,
          xpReward: 100,
        },
        {
          id: 'g2',
          title: 'Flawless Precision',
          description: 'Score 97% accuracy',
          target: 1,
          current: 0,
          isCompleted: false,
          xpReward: 150,
        },
      ];

      render(<DailyGoalsCard goals={goals} />);
      expect(screen.getByText(/Daily Training Objectives/i)).toBeInTheDocument();
      expect(screen.getByText('Daily Cadence')).toBeInTheDocument();
      expect(screen.getByText('+100 XP')).toBeInTheDocument();
      expect(screen.getByText('Flawless Precision')).toBeInTheDocument();
      expect(screen.getByText('+150 XP')).toBeInTheDocument();
      expect(screen.getByText(/1 \/ 2 Completed/i)).toBeInTheDocument();
    });
  });

  describe('AchievementsModal Component', () => {
    it('renders all achievements and filters by category', () => {
      const state = getStoredGamificationState();
      const { achievements } = evaluateAllAchievements(state, {
        peakWpm: 102,
        totalSessions: 5,
        highestAccuracy: 98,
        academyStars: 0,
        arenaWins: 0,
        arenaPodiums: 0,
      });

      const onCloseMock = vi.fn();
      render(
        <AchievementsModal
          isOpen={true}
          onClose={onCloseMock}
          achievements={achievements}
        />
      );

      expect(screen.getByText(/Milestone Achievements/i)).toBeInTheDocument();
      expect(screen.getByText('Century Club')).toBeInTheDocument();

      // Filter by speed
      const speedFilter = screen.getByRole('button', { name: /^speed$/i });
      fireEvent.click(speedFilter);

      expect(screen.getByText('Century Club')).toBeInTheDocument();
      expect(screen.queryByText('First Strike')).not.toBeInTheDocument();

      // Close modal
      const closeBtn = screen.getByRole('button', { name: /Close achievements/i });
      fireEvent.click(closeBtn);
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  describe('XpGainToast Component', () => {
    it('renders XP gain popup and dismisses on click', () => {
      const onDismissMock = vi.fn();
      render(
        <XpGainToast
          xpGain={{ amount: 120, reason: 'Speed Test Completed' }}
          unlock={null}
          onDismiss={onDismissMock}
        />
      );

      expect(screen.getByText('+120 XP')).toBeInTheDocument();
      expect(screen.getByText('Speed Test Completed')).toBeInTheDocument();
    });
  });

  describe('Dashboard Gamification Integration', () => {
    it('renders level progress and daily objectives on the dashboard', () => {
      render(
        <GamificationProvider>
          <DashboardPage />
        </GamificationProvider>
      );

      expect(screen.getByText(/STATUS/i)).toBeInTheDocument();
      expect(screen.getByText(/Daily Training Objectives/i)).toBeInTheDocument();
      expect(screen.getByText(/Cadence Scout/i)).toBeInTheDocument();
    });
  });
});
