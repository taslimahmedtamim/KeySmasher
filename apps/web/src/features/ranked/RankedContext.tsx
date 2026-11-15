'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  DirectChallenge,
  FriendUser,
  MatchmakingQueueState,
  RankedProfile,
  Tournament,
} from './types';
import {
  advanceTournamentMatch,
  calculateEloDelta,
  createStandard8PlayerTournament,
  getDivisionFromMmr,
  getStoredFriends,
  getStoredRankedProfile,
  INITIAL_FRIENDS_LIST,
  INITIAL_RANKED_PROFILE,
  saveFriends,
  saveRankedProfile,
  simulateAiMatch,
  TOURNAMENTS_STORAGE_KEY,
} from './rankedEngine';
import { useAuth } from '@/features/auth/AuthContext';
import { useGamification } from '@/features/gamification';

interface RankedContextValue {
  rankedProfile: RankedProfile;
  friends: FriendUser[];
  activeTournament: Tournament | null;
  queueState: MatchmakingQueueState;
  activeChallenge: DirectChallenge | null;
  startMatchmaking: () => void;
  cancelMatchmaking: () => void;
  recordRankedMatchResult: (opponentMmr: number, isWin: boolean) => { mmrDelta: number; newMmr: number };
  addFriend: (username: string) => boolean;
  removeFriend: (friendId: string) => void;
  sendDirectChallenge: (friend: FriendUser) => string;
  clearChallenge: () => void;
  startNewTournament: (title?: string) => Tournament;
  playUserTournamentMatch: (matchId: string, userWpm: number) => Tournament;
  simulateCurrentTournamentRound: () => Tournament | null;
  resetTournament: () => void;
}

const RankedContext = createContext<RankedContextValue | undefined>(undefined);

export const RankedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { awardXp } = useGamification();

  const [rankedProfile, setRankedProfile] = useState<RankedProfile>(() => getStoredRankedProfile());
  const [friends, setFriends] = useState<FriendUser[]>(() => getStoredFriends());
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(TOURNAMENTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [queueState, setQueueState] = useState<MatchmakingQueueState>({
    isSearching: false,
    searchDurationSeconds: 0,
    matchedOpponent: null,
    assignedRoomCode: null,
  });

  const [activeChallenge, setActiveChallenge] = useState<DirectChallenge | null>(null);

  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state on mount
  useEffect(() => {
    setRankedProfile(getStoredRankedProfile());
    setFriends(getStoredFriends());
  }, []);

  // Save tournament updates
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (activeTournament) {
        localStorage.setItem(TOURNAMENTS_STORAGE_KEY, JSON.stringify(activeTournament));
      } else {
        localStorage.removeItem(TOURNAMENTS_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [activeTournament]);

  // Handle Matchmaking Search Tick & Simulated Match Found
  const cancelMatchmaking = useCallback(() => {
    if (searchTimerRef.current) {
      clearInterval(searchTimerRef.current);
      searchTimerRef.current = null;
    }
    setQueueState({
      isSearching: false,
      searchDurationSeconds: 0,
      matchedOpponent: null,
      assignedRoomCode: null,
    });
  }, []);

  const startMatchmaking = useCallback(() => {
    if (queueState.isSearching) return;

    setQueueState({
      isSearching: true,
      searchDurationSeconds: 0,
      matchedOpponent: null,
      assignedRoomCode: null,
    });

    let elapsed = 0;
    searchTimerRef.current = setInterval(() => {
      elapsed += 1;
      setQueueState((prev) => ({
        ...prev,
        searchDurationSeconds: elapsed,
      }));

      // Simulate match found between 2s and 4s
      if (elapsed >= 3) {
        if (searchTimerRef.current) {
          clearInterval(searchTimerRef.current);
          searchTimerRef.current = null;
        }

        // Match with a suitable opponent near user MMR
        const randomOpponent: FriendUser = {
          id: `match-opp-${Date.now()}`,
          username: 'VortexStriker',
          displayName: 'Vortex Striker',
          avatarSeed: 'VS',
          division: getDivisionFromMmr(rankedProfile.mmr + 35),
          mmr: rankedProfile.mmr + 35,
          peakWpm: Math.round(75 + ((rankedProfile.mmr - 1200) / 600) * 40),
          status: 'racing',
          isMutual: false,
        };

        const randomRoom = `RNK-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        setQueueState({
          isSearching: false,
          searchDurationSeconds: elapsed,
          matchedOpponent: randomOpponent,
          assignedRoomCode: randomRoom,
        });
      }
    }, 1000);
  }, [queueState.isSearching, rankedProfile.mmr]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearInterval(searchTimerRef.current);
    };
  }, []);

  // Record Ranked Match Result (MMR Delta, Streaks, Divisions)
  const recordRankedMatchResult = useCallback(
    (opponentMmr: number, isWin: boolean) => {
      const outcome = isWin ? 1 : 0;
      const isPlacement = rankedProfile.placementMatchesRemaining > 0;
      const mmrDelta = calculateEloDelta(rankedProfile.mmr, opponentMmr, outcome, isPlacement);
      const newMmr = Math.max(100, rankedProfile.mmr + mmrDelta);
      const newDivision = getDivisionFromMmr(newMmr);

      const nextStreak = isWin ? rankedProfile.currentStreak + 1 : 0;
      const highestStreak = Math.max(rankedProfile.highestStreak, nextStreak);

      const updated: RankedProfile = {
        mmr: newMmr,
        peakMmr: Math.max(rankedProfile.peakMmr, newMmr),
        division: newDivision,
        placementMatchesRemaining: Math.max(0, rankedProfile.placementMatchesRemaining - 1),
        seasonWins: isWin ? rankedProfile.seasonWins + 1 : rankedProfile.seasonWins,
        seasonLosses: !isWin ? rankedProfile.seasonLosses + 1 : rankedProfile.seasonLosses,
        currentStreak: nextStreak,
        highestStreak,
      };

      setRankedProfile(updated);
      saveRankedProfile(updated);

      // Award XP
      const xpEarned = isWin ? 250 : 80;
      awardXp(xpEarned, isWin ? 'Ranked Match Victory' : 'Ranked Match Participation');

      return { mmrDelta, newMmr };
    },
    [rankedProfile, awardXp]
  );

  // Friend actions
  const addFriend = useCallback(
    (username: string): boolean => {
      const trimmed = username.trim();
      if (!trimmed) return false;
      if (friends.some((f) => f.username.toLowerCase() === trimmed.toLowerCase())) {
        return false;
      }

      const newFriend: FriendUser = {
        id: `friend-${Date.now()}`,
        username: trimmed,
        displayName: trimmed,
        avatarSeed: trimmed.slice(0, 2).toUpperCase(),
        division: 'Gold',
        mmr: 1250,
        peakWpm: 75,
        status: 'online',
        isMutual: true,
      };

      const updated = [newFriend, ...friends];
      setFriends(updated);
      saveFriends(updated);
      return true;
    },
    [friends]
  );

  const removeFriend = useCallback(
    (friendId: string) => {
      const updated = friends.filter((f) => f.id !== friendId);
      setFriends(updated);
      saveFriends(updated);
    },
    [friends]
  );

  const sendDirectChallenge = useCallback(
    (friend: FriendUser): string => {
      const roomCode = `1V1-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setActiveChallenge({
        id: `chal-${Date.now()}`,
        challengerId: user?.id || 'demo-user',
        challengerName: user?.displayName || 'Speed Demon',
        challengerMmr: rankedProfile.mmr,
        roomCode,
        createdAt: new Date().toISOString(),
        status: 'pending',
      });
      return roomCode;
    },
    [user, rankedProfile.mmr]
  );

  const clearChallenge = useCallback(() => {
    setActiveChallenge(null);
  }, []);

  // Tournament actions
  const startNewTournament = useCallback(
    (title = 'KeySmasher Blitz Cup'): Tournament => {
      const currentUser = {
        id: user?.id || 'demo-user',
        username: user?.username || 'SpeedDemon',
        displayName: user?.displayName || 'Speed Demon',
        mmr: rankedProfile.mmr,
        avatarSeed: (user?.displayName || 'SD').slice(0, 2).toUpperCase(),
      };

      const tournament = createStandard8PlayerTournament(currentUser, title);
      setActiveTournament(tournament);
      return tournament;
    },
    [user, rankedProfile.mmr]
  );

  const simulateCurrentTournamentRound = useCallback((): Tournament | null => {
    if (!activeTournament || activeTournament.status === 'completed') return null;

    let updated = { ...activeTournament };
    const currentRoundMatches = updated.matches.filter(
      (m) => m.roundNumber === updated.currentRound && m.status === 'waiting'
    );

    currentRoundMatches.forEach((match) => {
      // Don't auto-simulate user match if user is still in it
      const hasUser = match.player1?.isUser || match.player2?.isUser;
      if (!hasUser && match.player1 && match.player2) {
        const { score1, score2 } = simulateAiMatch(match);
        updated = advanceTournamentMatch(updated, match.id, score1, score2);
      }
    });

    setActiveTournament(updated);
    return updated;
  }, [activeTournament]);

  const playUserTournamentMatch = useCallback(
    (matchId: string, userWpm: number): Tournament => {
      if (!activeTournament) throw new Error('No active tournament');

      const match = activeTournament.matches.find((m) => m.id === matchId);
      if (!match || !match.player1 || !match.player2) {
        throw new Error('Invalid match');
      }

      const isPlayer1User = match.player1.isUser;
      const opponent = isPlayer1User ? match.player2 : match.player1;

      // Calculate opponent score based on MMR
      const opponentBase = 70 + ((opponent.mmr - 1200) / 600) * 40;
      const opponentScore = Math.round(opponentBase + (Math.random() - 0.5) * 12);

      const score1 = isPlayer1User ? userWpm : opponentScore;
      const score2 = isPlayer1User ? opponentScore : userWpm;

      let updated = advanceTournamentMatch(activeTournament, matchId, score1, score2);

      // Auto-simulate other matches in this round that don't involve the user
      const otherMatchesInRound = updated.matches.filter(
        (m) =>
          m.roundNumber === match.roundNumber &&
          m.status === 'waiting' &&
          m.player1 &&
          m.player2 &&
          !m.player1.isUser &&
          !m.player2.isUser
      );

      otherMatchesInRound.forEach((m) => {
        const { score1: s1, score2: s2 } = simulateAiMatch(m);
        updated = advanceTournamentMatch(updated, m.id, s1, s2);
      });

      // If user won the whole tournament!
      if (updated.championId === (user?.id || 'demo-user')) {
        awardXp(updated.prizeXp, `Tournament Championship Victory! (${updated.title})`);
      }

      setActiveTournament(updated);
      return updated;
    },
    [activeTournament, user, awardXp]
  );

  const resetTournament = useCallback(() => {
    setActiveTournament(null);
  }, []);

  return (
    <RankedContext.Provider
      value={{
        rankedProfile,
        friends,
        activeTournament,
        queueState,
        activeChallenge,
        startMatchmaking,
        cancelMatchmaking,
        recordRankedMatchResult,
        addFriend,
        removeFriend,
        sendDirectChallenge,
        clearChallenge,
        startNewTournament,
        playUserTournamentMatch,
        simulateCurrentTournamentRound,
        resetTournament,
      }}
    >
      {children}
    </RankedContext.Provider>
  );
};

const DEFAULT_FALLBACK_RANKED: RankedContextValue = {
  rankedProfile: INITIAL_RANKED_PROFILE,
  friends: INITIAL_FRIENDS_LIST,
  activeTournament: null,
  queueState: {
    isSearching: false,
    searchDurationSeconds: 0,
    matchedOpponent: null,
    assignedRoomCode: null,
  },
  activeChallenge: null,
  startMatchmaking: () => {},
  cancelMatchmaking: () => {},
  recordRankedMatchResult: () => ({ mmrDelta: 0, newMmr: 1250 }),
  addFriend: () => false,
  removeFriend: () => {},
  sendDirectChallenge: () => '1V1-DEMO',
  clearChallenge: () => {},
  startNewTournament: () => createStandard8PlayerTournament({
    id: 'demo-user',
    username: 'SpeedDemon',
    displayName: 'Speed Demon',
    mmr: 1250,
    avatarSeed: 'SD',
  }),
  playUserTournamentMatch: () => ({
    id: 'demo-tour',
    title: 'Demo Tour',
    description: '',
    entryMmrMin: 0,
    status: 'completed',
    currentRound: 1,
    totalRounds: 3,
    participants: [],
    matches: [],
    championId: null,
    prizeXp: 0,
    createdAt: '',
  }),
  simulateCurrentTournamentRound: () => null,
  resetTournament: () => {},
};

export const useRankedSystem = (): RankedContextValue => {
  const context = useContext(RankedContext);
  if (!context) {
    return DEFAULT_FALLBACK_RANKED;
  }
  return context;
};
