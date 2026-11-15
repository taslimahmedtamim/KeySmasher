import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  getDivisionFromMmr,
  calculateEloDelta,
  createStandard8PlayerTournament,
  advanceTournamentMatch,
  simulateAiMatch,
  INITIAL_RANKED_PROFILE,
} from '../features/ranked/rankedEngine';
import { RankedQueueCard } from '../features/ranked/components/RankedQueueCard';
import { TournamentBracketView } from '../features/ranked/components/TournamentBracketView';
import { FriendsManagerCard } from '../features/ranked/components/FriendsManagerCard';
import { RankedProvider } from '../features/ranked/RankedContext';
import CompetePage from '../app/compete/page';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/compete',
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock AuthContext
vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'ranked-user-1',
      username: 'SpeedDemon',
      displayName: 'Speed Demon',
      email: 'demon@keysmasher.io',
      isDemo: true,
    },
    isLoading: false,
    isGuest: false,
  }),
}));

// Mock Gamification
vi.mock('@/features/gamification', () => ({
  useGamification: () => ({
    awardXp: vi.fn(),
  }),
}));

describe('Feature M: Friends, Ranked Matches & Tournaments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  describe('Ranked Division & MMR Calculations', () => {
    it('correctly maps MMR tiers to standard competitive divisions', () => {
      expect(getDivisionFromMmr(800)).toBe('Bronze');
      expect(getDivisionFromMmr(1100)).toBe('Silver');
      expect(getDivisionFromMmr(1250)).toBe('Gold');
      expect(getDivisionFromMmr(1450)).toBe('Platinum');
      expect(getDivisionFromMmr(1650)).toBe('Diamond');
      expect(getDivisionFromMmr(1850)).toBe('Master');
      expect(getDivisionFromMmr(2100)).toBe('Grandmaster');
    });

    it('calculates Elo rating deltas based on relative skill and placement factor', () => {
      // Equal MMR win: baseline +16
      const equalWin = calculateEloDelta(1500, 1500, 1, false);
      expect(equalWin).toBe(16);

      // Win against higher MMR opponent awards more points
      const underdogWin = calculateEloDelta(1400, 1600, 1, false);
      expect(underdogWin).toBeGreaterThan(16);

      // Loss against higher MMR opponent loses fewer points
      const underdogLoss = calculateEloDelta(1400, 1600, 0, false);
      expect(underdogLoss).toBeGreaterThan(-16);

      // Placement match with higher K-factor (50) awards significantly more
      const placementWin = calculateEloDelta(1500, 1500, 1, true);
      expect(placementWin).toBe(25);
    });
  });

  describe('8-Player Knockout Tournament Engine', () => {
    it('initializes a seeded 8-player bracket with standard matchups', () => {
      const tournament = createStandard8PlayerTournament({
        id: 'user-1',
        username: 'SpeedDemon',
        displayName: 'Speed Demon',
        mmr: 1550,
        avatarSeed: 'SD',
      });

      expect(tournament.participants).toHaveLength(8);
      expect(tournament.totalRounds).toBe(3);
      expect(tournament.matches).toHaveLength(7); // 4 QF + 2 SF + 1 GF

      // Quarterfinals must pair 1v8, 4v5, 2v7, 3v6
      const q1 = tournament.matches[0];
      expect(q1.player1?.seed).toBe(1);
      expect(q1.player2?.seed).toBe(8);

      const q2 = tournament.matches[1];
      expect(q2.player1?.seed).toBe(4);
      expect(q2.player2?.seed).toBe(5);
    });

    it('advances match winners dynamically into Semifinals and Grand Finals', () => {
      let tournament = createStandard8PlayerTournament({
        id: 'user-1',
        username: 'SpeedDemon',
        displayName: 'Speed Demon',
        mmr: 1550,
        avatarSeed: 'SD',
      });

      // Play Quarterfinal Match 1 (winner: player 1)
      const q1 = tournament.matches[0];
      tournament = advanceTournamentMatch(tournament, q1.id, 95, 80);

      const updatedQ1 = tournament.matches.find((m) => m.id === q1.id);
      expect(updatedQ1?.status).toBe('completed');
      expect(updatedQ1?.winnerId).toBe(q1.player1?.id);

      // Verify winner advanced to Semifinal 1 (m-r2-1) as player 1
      const sf1 = tournament.matches.find((m) => m.id === 'm-r2-1');
      expect(sf1?.player1?.id).toBe(q1.player1?.id);
    });

    it('crowns the tournament champion when Grand Finals resolves', () => {
      let tournament = createStandard8PlayerTournament({
        id: 'user-1',
        username: 'SpeedDemon',
        displayName: 'Speed Demon',
        mmr: 1550,
        avatarSeed: 'SD',
      });

      // Advance Q1 and Q2 to fill SF1
      tournament = advanceTournamentMatch(tournament, 'm-r1-1', 100, 70);
      tournament = advanceTournamentMatch(tournament, 'm-r1-2', 90, 75);

      // Advance Q3 and Q4 to fill SF2
      tournament = advanceTournamentMatch(tournament, 'm-r1-3', 105, 80);
      tournament = advanceTournamentMatch(tournament, 'm-r1-4', 92, 78);

      // Advance Semifinals
      tournament = advanceTournamentMatch(tournament, 'm-r2-1', 110, 85);
      tournament = advanceTournamentMatch(tournament, 'm-r2-2', 115, 90);

      const gf = tournament.matches.find((m) => m.id === 'm-r3-1');
      expect(gf?.player1).not.toBeNull();
      expect(gf?.player2).not.toBeNull();

      // Resolve Grand Finals
      tournament = advanceTournamentMatch(tournament, 'm-r3-1', 120, 100);

      expect(tournament.status).toBe('completed');
      expect(tournament.championId).toBe(gf?.player1?.id);
    });
  });

  describe('RankedQueueCard Component', () => {
    it('renders division rank, MMR rating, and matchmaking trigger', () => {
      render(
        <RankedProvider>
          <RankedQueueCard />
        </RankedProvider>
      );

      expect(screen.getByText(/Gold Division/i)).toBeInTheDocument();
      expect(screen.getAllByText(/1250 MMR/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Find Ranked Duel/i)).toBeInTheDocument();
    });

    it('enters search mode when Find Ranked Duel is clicked', () => {
      render(
        <RankedProvider>
          <RankedQueueCard />
        </RankedProvider>
      );

      const findButton = screen.getByText(/Find Ranked Duel/i);
      fireEvent.click(findButton);

      expect(screen.getByText(/Searching for Worthy Opponent/i)).toBeInTheDocument();
      expect(screen.getByText(/Cancel Search/i)).toBeInTheDocument();
    });
  });

  describe('TournamentBracketView Component', () => {
    it('renders empty tournament state and allows generating new bracket', () => {
      render(
        <RankedProvider>
          <TournamentBracketView />
        </RankedProvider>
      );

      expect(screen.getByText(/No Active Tournament Bracket/i)).toBeInTheDocument();
      const generateBtn = screen.getByText(/Generate 8-Player Blitz Bracket/i);
      fireEvent.click(generateBtn);

      expect(screen.getByText(/Quarterfinals/i)).toBeInTheDocument();
      expect(screen.getByText(/Semifinals/i)).toBeInTheDocument();
      expect(screen.getByText(/Grand Finals/i)).toBeInTheDocument();
    });
  });

  describe('FriendsManagerCard Component', () => {
    it('renders friend list with status and allows adding new friend', () => {
      render(
        <RankedProvider>
          <FriendsManagerCard />
        </RankedProvider>
      );

      expect(screen.getByText(/Cyber Ghost/i)).toBeInTheDocument();
      expect(screen.getByText(/Neon Striker/i)).toBeInTheDocument();

      const input = screen.getByPlaceholderText(/Username.../i);
      const addBtn = screen.getByText(/Add/i);

      fireEvent.change(input, { target: { value: 'NewRivalTypist' } });
      fireEvent.click(addBtn);

      expect(screen.getByText(/Added @NewRivalTypist/i)).toBeInTheDocument();
      expect(screen.getAllByText(/NewRivalTypist/i).length).toBeGreaterThanOrEqual(2);
    });

    it('opens 1v1 direct duel room modal when challenge button is clicked', () => {
      render(
        <RankedProvider>
          <FriendsManagerCard />
        </RankedProvider>
      );

      const challengeButtons = screen.getAllByText(/Challenge 1v1/i);
      fireEvent.click(challengeButtons[0]);

      expect(screen.getByText(/1v1 Direct Duel Created/i)).toBeInTheDocument();
      expect(screen.getByText(/Enter Duel Room/i)).toBeInTheDocument();
    });
  });

  describe('CompetePage Sub-Tab Integration', () => {
    it('switches between Battle Arena, Ranked Duel, Tournaments, and Friends tabs', () => {
      render(
        <RankedProvider>
          <CompetePage />
        </RankedProvider>
      );

      expect(screen.getByText(/Competitive Typing Arena & Rankings/i)).toBeInTheDocument();

      // Switch to Ranked Duel
      const rankedTab = screen.getByRole('button', { name: /Ranked Duel/i });
      fireEvent.click(rankedTab);
      expect(screen.getByText(/Division Tier/i)).toBeInTheDocument();

      // Switch to Tournaments
      const tourTab = screen.getByRole('button', { name: /Tournaments/i });
      fireEvent.click(tourTab);
      expect(screen.getByText(/Championship/i)).toBeInTheDocument();

      // Switch to Friends
      const friendsTab = screen.getByRole('button', { name: /Friends & Rivals/i });
      fireEvent.click(friendsTab);
      expect(screen.getByText(/Friends Network/i)).toBeInTheDocument();
    });
  });
});
