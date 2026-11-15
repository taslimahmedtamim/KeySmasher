import {
  FriendUser,
  RankedDivision,
  RankedProfile,
  Tournament,
  TournamentMatch,
  TournamentParticipant,
} from './types';

export const RANKED_STORAGE_KEY = 'keysmasher_ranked_profile';
export const FRIENDS_STORAGE_KEY = 'keysmasher_friends_list';
export const TOURNAMENTS_STORAGE_KEY = 'keysmasher_active_tournaments';

/**
 * Computes division rank tier from MMR rating.
 */
export function getDivisionFromMmr(mmr: number): RankedDivision {
  if (mmr >= 2000) return 'Grandmaster';
  if (mmr >= 1800) return 'Master';
  if (mmr >= 1600) return 'Diamond';
  if (mmr >= 1400) return 'Platinum';
  if (mmr >= 1200) return 'Gold';
  if (mmr >= 1000) return 'Silver';
  return 'Bronze';
}

/**
 * Visual styling theme for each division.
 */
export function getDivisionColor(division: RankedDivision): {
  text: string;
  bg: string;
  border: string;
  glow: string;
} {
  switch (division) {
    case 'Grandmaster':
      return {
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      };
    case 'Master':
      return {
        text: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]',
      };
    case 'Diamond':
      return {
        text: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        glow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]',
      };
    case 'Platinum':
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      };
    case 'Gold':
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      };
    case 'Silver':
      return {
        text: 'text-slate-300',
        bg: 'bg-slate-500/10',
        border: 'border-slate-400/30',
        glow: 'shadow-[0_0_15px_rgba(148,163,184,0.3)]',
      };
    case 'Bronze':
    default:
      return {
        text: 'text-amber-600',
        bg: 'bg-amber-800/10',
        border: 'border-amber-700/30',
        glow: 'shadow-[0_0_15px_rgba(180,83,9,0.3)]',
      };
  }
}

/**
 * Standard Elo MMR calculation.
 * @param playerMmr User's current rating
 * @param opponentMmr Opponent's current rating
 * @param outcome 1 = win, 0 = loss, 0.5 = draw
 * @param isPlacement Whether the user is in placement matches
 */
export function calculateEloDelta(
  playerMmr: number,
  opponentMmr: number,
  outcome: 1 | 0 | 0.5,
  isPlacement = false
): number {
  const kFactor = isPlacement ? 50 : 32;
  const expected = 1 / (1 + Math.pow(10, (opponentMmr - playerMmr) / 400));
  const delta = Math.round(kFactor * (outcome - expected));
  return delta;
}

export const INITIAL_RANKED_PROFILE: RankedProfile = {
  mmr: 1250,
  peakMmr: 1250,
  division: 'Gold',
  placementMatchesRemaining: 5,
  seasonWins: 0,
  seasonLosses: 0,
  currentStreak: 0,
  highestStreak: 0,
};

export const INITIAL_FRIENDS_LIST: FriendUser[] = [
  {
    id: 'friend-1',
    username: 'CyberGhost',
    displayName: 'Cyber Ghost',
    avatarSeed: 'CG',
    division: 'Master',
    mmr: 1840,
    peakWpm: 128,
    status: 'online',
    isMutual: true,
  },
  {
    id: 'friend-2',
    username: 'NeonStriker',
    displayName: 'Neon Striker',
    avatarSeed: 'NS',
    division: 'Diamond',
    mmr: 1675,
    peakWpm: 112,
    status: 'racing',
    isMutual: true,
  },
  {
    id: 'friend-3',
    username: 'CadenceKing',
    displayName: 'Cadence King',
    avatarSeed: 'CK',
    division: 'Platinum',
    mmr: 1490,
    peakWpm: 94,
    status: 'online',
    isMutual: true,
  },
  {
    id: 'friend-4',
    username: 'VelocityQueen',
    displayName: 'Velocity Queen',
    avatarSeed: 'VQ',
    division: 'Gold',
    mmr: 1320,
    peakWpm: 86,
    status: 'offline',
    lastSeen: '2 hours ago',
    isMutual: true,
  },
  {
    id: 'friend-5',
    username: 'KeyBlazer',
    displayName: 'Key Blazer',
    avatarSeed: 'KB',
    division: 'Silver',
    mmr: 1150,
    peakWpm: 68,
    status: 'offline',
    lastSeen: '1 day ago',
    isMutual: true,
  },
];

export function getStoredRankedProfile(): RankedProfile {
  if (typeof window === 'undefined') return INITIAL_RANKED_PROFILE;
  try {
    const raw = localStorage.getItem(RANKED_STORAGE_KEY);
    if (!raw) return INITIAL_RANKED_PROFILE;
    return JSON.parse(raw);
  } catch {
    return INITIAL_RANKED_PROFILE;
  }
}

export function saveRankedProfile(profile: RankedProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RANKED_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function getStoredFriends(): FriendUser[] {
  if (typeof window === 'undefined') return INITIAL_FRIENDS_LIST;
  try {
    const raw = localStorage.getItem(FRIENDS_STORAGE_KEY);
    if (!raw) return INITIAL_FRIENDS_LIST;
    return JSON.parse(raw);
  } catch {
    return INITIAL_FRIENDS_LIST;
  }
}

export function saveFriends(friends: FriendUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
  } catch {
    // ignore
  }
}

/**
 * Creates an 8-player knockout bracket tournament seeded by MMR.
 */
export function createStandard8PlayerTournament(
  user: {
    id: string;
    username: string;
    displayName: string;
    mmr: number;
    avatarSeed: string;
  },
  tournamentTitle = 'KeySmasher Blitz Cup'
): Tournament {
  const aiContenders = [
    { username: 'QuantumTyper', displayName: 'Quantum Typer', mmr: 1420 },
    { username: 'ApexCadence', displayName: 'Apex Cadence', mmr: 1530 },
    { username: 'ShadowKeystroke', displayName: 'Shadow Keystroke', mmr: 1380 },
    { username: 'PulseRacer', displayName: 'Pulse Racer', mmr: 1290 },
    { username: 'TurboSwitch', displayName: 'Turbo Switch', mmr: 1475 },
    { username: 'MatrixSprinter', displayName: 'Matrix Sprinter', mmr: 1610 },
    { username: 'EchoTypist', displayName: 'Echo Typist', mmr: 1350 },
  ];

  const allPlayers: TournamentParticipant[] = [
    {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      seed: 0,
      mmr: user.mmr,
      avatarSeed: user.avatarSeed,
      isUser: true,
      isEliminated: false,
    },
    ...aiContenders.map((ai, idx) => ({
      id: `ai-contender-${idx + 1}`,
      username: ai.username,
      displayName: ai.displayName,
      seed: 0,
      mmr: ai.mmr,
      avatarSeed: ai.username.slice(0, 2).toUpperCase(),
      isUser: false,
      isEliminated: false,
    })),
  ];

  // Sort descending by MMR to assign standard tournament seeds 1 through 8
  allPlayers.sort((a, b) => b.mmr - a.mmr);
  allPlayers.forEach((p, idx) => {
    p.seed = idx + 1;
  });

  const getBySeed = (seedNum: number) => allPlayers.find((p) => p.seed === seedNum) || allPlayers[0];

  // Round 1 (Quarterfinals) matchups: 1v8, 4v5, 2v7, 3v6
  const matches: TournamentMatch[] = [
    {
      id: 'm-r1-1',
      roundNumber: 1,
      matchIndexInRound: 0,
      player1: getBySeed(1),
      player2: getBySeed(8),
      winnerId: null,
      status: 'waiting',
      roomCode: 'TOUR-Q1',
    },
    {
      id: 'm-r1-2',
      roundNumber: 1,
      matchIndexInRound: 1,
      player1: getBySeed(4),
      player2: getBySeed(5),
      winnerId: null,
      status: 'waiting',
      roomCode: 'TOUR-Q2',
    },
    {
      id: 'm-r1-3',
      roundNumber: 1,
      matchIndexInRound: 2,
      player1: getBySeed(2),
      player2: getBySeed(7),
      winnerId: null,
      status: 'waiting',
      roomCode: 'TOUR-Q3',
    },
    {
      id: 'm-r1-4',
      roundNumber: 1,
      matchIndexInRound: 3,
      player1: getBySeed(3),
      player2: getBySeed(6),
      winnerId: null,
      status: 'waiting',
      roomCode: 'TOUR-Q4',
    },
    // Round 2 (Semifinals)
    {
      id: 'm-r2-1',
      roundNumber: 2,
      matchIndexInRound: 0,
      player1: null,
      player2: null,
      winnerId: null,
      status: 'waiting',
      roomCode: 'TOUR-S1',
    },
    {
      id: 'm-r2-2',
      roundNumber: 2,
      matchIndexInRound: 1,
      player1: null,
      player2: null,
      winnerId: null,
      status: 'waiting',
      roomCode: 'TOUR-S2',
    },
    // Round 3 (Grand Finals)
    {
      id: 'm-r3-1',
      roundNumber: 3,
      matchIndexInRound: 0,
      player1: null,
      player2: null,
      winnerId: null,
      status: 'waiting',
      roomCode: 'TOUR-GF',
    },
  ];

  return {
    id: `tour-${Date.now()}`,
    title: tournamentTitle,
    description: '8-Player Single-Elimination Speed Knockout Championship',
    entryMmrMin: 1000,
    status: 'in_progress',
    currentRound: 1,
    totalRounds: 3,
    participants: allPlayers,
    matches,
    championId: null,
    prizeXp: 1000,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Simulates an AI match between two participants and assigns realistic WPM.
 */
export function simulateAiMatch(match: TournamentMatch): { score1: number; score2: number; winnerId: string } {
  if (!match.player1 || !match.player2) {
    throw new Error('Cannot simulate match without both players');
  }

  // Base WPM correlated with MMR: 1200 MMR ~ 70 WPM, 1800 MMR ~ 110 WPM
  const baseWpm1 = 70 + ((match.player1.mmr - 1200) / 600) * 40;
  const baseWpm2 = 70 + ((match.player2.mmr - 1200) / 600) * 40;

  // Add random variance (-8 to +8 WPM)
  const randVariance1 = (Math.random() - 0.5) * 16;
  const randVariance2 = (Math.random() - 0.5) * 16;

  let score1 = Math.round(baseWpm1 + randVariance1);
  let score2 = Math.round(baseWpm2 + randVariance2);

  // Guarantee no draw
  if (score1 === score2) {
    score1 += 1;
  }

  const winnerId = score1 > score2 ? match.player1.id : match.player2.id;
  return { score1, score2, winnerId };
}

/**
 * Resolves a tournament match with scores, updates bracket status,
 * and advances the winner into the corresponding slot for the next round.
 */
export function advanceTournamentMatch(
  tournament: Tournament,
  matchId: string,
  score1: number,
  score2: number
): Tournament {
  const updatedTournament: Tournament = JSON.parse(JSON.stringify(tournament));
  const targetMatch = updatedTournament.matches.find((m) => m.id === matchId);

  if (!targetMatch || !targetMatch.player1 || !targetMatch.player2) {
    return tournament;
  }

  targetMatch.score1 = score1;
  targetMatch.score2 = score2;
  const winner = score1 >= score2 ? targetMatch.player1 : targetMatch.player2;
  const loser = score1 >= score2 ? targetMatch.player2 : targetMatch.player1;

  targetMatch.winnerId = winner.id;
  targetMatch.status = 'completed';

  // Mark loser as eliminated
  const participantLoser = updatedTournament.participants.find((p) => p.id === loser.id);
  if (participantLoser) {
    participantLoser.isEliminated = true;
  }

  // Round progression logic:
  // Round 1 (Q1, Q2, Q3, Q4) -> Round 2 (S1 = winner(Q1) vs winner(Q2), S2 = winner(Q3) vs winner(Q4))
  // Round 2 (S1, S2) -> Round 3 (GF = winner(S1) vs winner(S2))
  if (targetMatch.roundNumber === 1) {
    const nextMatchId = targetMatch.matchIndexInRound < 2 ? 'm-r2-1' : 'm-r2-2';
    const nextMatch = updatedTournament.matches.find((m) => m.id === nextMatchId);
    if (nextMatch) {
      if (targetMatch.matchIndexInRound % 2 === 0) {
        nextMatch.player1 = winner;
      } else {
        nextMatch.player2 = winner;
      }
    }
  } else if (targetMatch.roundNumber === 2) {
    const finalsMatch = updatedTournament.matches.find((m) => m.id === 'm-r3-1');
    if (finalsMatch) {
      if (targetMatch.matchIndexInRound === 0) {
        finalsMatch.player1 = winner;
      } else {
        finalsMatch.player2 = winner;
      }
    }
  } else if (targetMatch.roundNumber === 3) {
    // Finals complete!
    updatedTournament.championId = winner.id;
    updatedTournament.status = 'completed';
  }

  // Check if current round has completed
  const currentRoundMatches = updatedTournament.matches.filter(
    (m) => m.roundNumber === updatedTournament.currentRound
  );
  const allCurrentRoundDone = currentRoundMatches.every((m) => m.status === 'completed');

  if (allCurrentRoundDone && updatedTournament.currentRound < updatedTournament.totalRounds) {
    updatedTournament.currentRound += 1;
  }

  return updatedTournament;
}
