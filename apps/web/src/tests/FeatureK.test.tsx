import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CompetePage from '../app/compete/page';
import {
  calculateRankTier,
  computeCompetitionStats,
  getGlobalLeaderboard,
  RaceHistoryRecord,
} from '../features/leaderboard';
import { UserCompetitionStatsCard } from '../features/leaderboard/components/UserCompetitionStatsCard';
import { LeaderboardTable } from '../features/leaderboard/components/LeaderboardTable';
import { RecentBattlesList } from '../features/leaderboard/components/RecentBattlesList';

// Mock navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

// Mock AuthContext
vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-champion-1',
      username: 'ApexRacer',
      displayName: 'Apex Racer',
      email: 'apex@keysmasher.io',
    },
    isLoading: false,
    isGuest: false,
  }),
}));

describe('Feature K: Competition History & Leaderboards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  describe('calculateRankTier benchmarks', () => {
    it('accurately maps touch-typing WPM to international rank tiers', () => {
      expect(calculateRankTier(25)).toBe('Bronze');
      expect(calculateRankTier(45)).toBe('Silver');
      expect(calculateRankTier(68)).toBe('Gold');
      expect(calculateRankTier(85)).toBe('Platinum');
      expect(calculateRankTier(105)).toBe('Diamond');
      expect(calculateRankTier(125)).toBe('Master');
      expect(calculateRankTier(160)).toBe('Grandmaster');
    });
  });

  describe('computeCompetitionStats', () => {
    it('returns clean fallback stats for zero race history', () => {
      const stats = computeCompetitionStats([]);
      expect(stats.totalRaces).toBe(0);
      expect(stats.wins).toBe(0);
      expect(stats.winRate).toBe(0);
      expect(stats.tier).toBe('Bronze');
    });

    it('accurately computes win rate, podiums, peak speed, and averages', () => {
      const history: RaceHistoryRecord[] = [
        {
          id: '1',
          roomCode: 'KS-101',
          placement: 1,
          totalRacers: 4,
          netWpm: 110,
          rawWpm: 115,
          accuracy: 98,
          durationSeconds: 15,
          mode: 'words',
          difficulty: 'intermediate',
          completedAt: '2026-11-15T12:00:00Z',
          isWin: true,
        },
        {
          id: '2',
          roomCode: 'KS-102',
          placement: 2,
          totalRacers: 4,
          netWpm: 90,
          rawWpm: 95,
          accuracy: 96,
          durationSeconds: 18,
          mode: 'words',
          difficulty: 'intermediate',
          completedAt: '2026-11-15T12:10:00Z',
          isWin: false,
        },
        {
          id: '3',
          roomCode: 'KS-103',
          placement: 1,
          totalRacers: 3,
          netWpm: 100,
          rawWpm: 105,
          accuracy: 97,
          durationSeconds: 16,
          mode: 'words',
          difficulty: 'intermediate',
          completedAt: '2026-11-15T12:20:00Z',
          isWin: true,
        },
      ];

      const stats = computeCompetitionStats(history);
      expect(stats.totalRaces).toBe(3);
      expect(stats.wins).toBe(2);
      expect(stats.podiums).toBe(3);
      expect(stats.winRate).toBe(66.7);
      expect(stats.bestWpm).toBe(110);
      expect(stats.avgWpm).toBe(100);
      expect(stats.avgAccuracy).toBe(97);
      expect(stats.tier).toBe('Diamond');
    });
  });

  describe('getGlobalLeaderboard', () => {
    it('sorts racers descending by Net WPM and formats 1-indexed ranks', () => {
      const leaderboard = getGlobalLeaderboard('all-time');
      expect(leaderboard.length).toBeGreaterThanOrEqual(10);
      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[0].netWpm).toBeGreaterThanOrEqual(leaderboard[1].netWpm);
      expect(leaderboard[1].rank).toBe(2);
    });

    it('injects current user into rankings when provided', () => {
      const leaderboard = getGlobalLeaderboard('all-time', 'all', {
        id: 'apex-99',
        username: 'ApexRacer',
        displayName: 'Apex Racer',
        bestWpm: 135,
        accuracy: 98,
      });

      const userRow = leaderboard.find((e) => e.isCurrentUser);
      expect(userRow).toBeDefined();
      expect(userRow?.username).toBe('ApexRacer');
      expect(userRow?.netWpm).toBe(135);
      expect(userRow?.tier).toBe('Master');
    });
  });

  describe('UserCompetitionStatsCard Component', () => {
    it('renders division tier badge, peak speed, and win rate', () => {
      const stats = {
        totalRaces: 10,
        wins: 6,
        podiums: 9,
        winRate: 60,
        bestWpm: 112,
        avgWpm: 98,
        avgAccuracy: 97.5,
        tier: 'Diamond' as const,
      };

      render(<UserCompetitionStatsCard stats={stats} username="ApexRacer" />);

      expect(screen.getByText(/DIAMOND DIVISION/i)).toBeInTheDocument();
      expect(screen.getByText('ApexRacer')).toBeInTheDocument();
      expect(screen.getByText('112')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('9')).toBeInTheDocument();
      expect(screen.getByText(/6 Wins in 10 Races/i)).toBeInTheDocument();
    });
  });

  describe('LeaderboardTable Component', () => {
    it('renders period pills, ranks, usernames, and metrics', () => {
      const entries = getGlobalLeaderboard('all-time');
      const onPeriodChangeMock = vi.fn();

      render(
        <LeaderboardTable
          entries={entries}
          period="all-time"
          onPeriodChange={onPeriodChangeMock}
        />
      );

      expect(screen.getByText(/Global Competitive Leaderboard/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Daily/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Weekly/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /All-Time/i })).toBeInTheDocument();

      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('Vortex Speed')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Daily/i }));
      expect(onPeriodChangeMock).toHaveBeenCalledWith('daily');
    });
  });

  describe('RecentBattlesList Component', () => {
    it('renders empty placeholder when no battles have occurred', () => {
      const onStartMock = vi.fn();
      render(<RecentBattlesList history={[]} onStartRace={onStartMock} />);

      expect(screen.getByText(/No Arena Battles Yet/i)).toBeInTheDocument();
      const startBtn = screen.getByRole('button', { name: /Jump Into Arena Race/i });
      fireEvent.click(startBtn);
      expect(onStartMock).toHaveBeenCalled();
    });

    it('renders battle history cards with placement and telemetry', () => {
      const history: RaceHistoryRecord[] = [
        {
          id: 'b1',
          roomCode: 'KS-8821',
          placement: 1,
          totalRacers: 4,
          netWpm: 104,
          rawWpm: 108,
          accuracy: 99,
          durationSeconds: 14.5,
          mode: 'words',
          difficulty: 'expert',
          completedAt: '2026-11-15T15:00:00Z',
          isWin: true,
        },
      ];

      render(<RecentBattlesList history={history} />);
      expect(screen.getByText(/ROOM KS-8821/i)).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('104 WPM')).toBeInTheDocument();
      expect(screen.getByText('99%')).toBeInTheDocument();
    });
  });

  describe('CompetePage Tabs Integration', () => {
    it('allows toggling between Battle Arena, Global Leaderboards, and My Battle History', () => {
      render(<CompetePage />);

      // Default: Arena Hub
      expect(screen.getByRole('button', { name: /Create Private Room/i })).toBeInTheDocument();

      // Switch to Global Leaderboards tab
      const leaderboardTab = screen.getByRole('button', { name: /Global Leaderboards/i });
      fireEvent.click(leaderboardTab);

      expect(screen.getByText(/Global Competitive Leaderboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Vortex Speed/i)).toBeInTheDocument();

      // Switch to My Battle History tab
      const historyTab = screen.getByRole('button', { name: /My Battle History/i });
      fireEvent.click(historyTab);

      expect(screen.getByText(/No Arena Battles Yet/i)).toBeInTheDocument();
    });
  });
});
