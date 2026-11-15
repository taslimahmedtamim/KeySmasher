import {
  CompetitionStats,
  LeaderboardEntry,
  LeaderboardModeFilter,
  LeaderboardPeriod,
  RaceHistoryRecord,
  RankTier,
} from './types';

const RACE_HISTORY_STORAGE_KEY = 'keysmasher_race_history';

/**
 * Calculates a competitive rank tier based on international touch-typing speed benchmarks.
 */
export function calculateRankTier(netWpm: number): RankTier {
  if (netWpm >= 140) return 'Grandmaster';
  if (netWpm >= 120) return 'Master';
  if (netWpm >= 100) return 'Diamond';
  if (netWpm >= 80) return 'Platinum';
  if (netWpm >= 60) return 'Gold';
  if (netWpm >= 40) return 'Silver';
  return 'Bronze';
}

export function getRankTierColor(tier: RankTier): {
  text: string;
  bg: string;
  border: string;
  glow: string;
} {
  switch (tier) {
    case 'Grandmaster':
      return {
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        glow: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]',
      };
    case 'Master':
      return {
        text: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        glow: 'shadow-[0_0_12px_rgba(168,85,247,0.4)]',
      };
    case 'Diamond':
      return {
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        glow: 'shadow-[0_0_12px_rgba(96,165,250,0.4)]',
      };
    case 'Platinum':
      return {
        text: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        glow: 'shadow-[0_0_12px_rgba(6,182,212,0.4)]',
      };
    case 'Gold':
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        glow: 'shadow-[0_0_12px_rgba(251,191,36,0.4)]',
      };
    case 'Silver':
      return {
        text: 'text-slate-300',
        bg: 'bg-slate-400/10',
        border: 'border-slate-400/30',
        glow: '',
      };
    case 'Bronze':
    default:
      return {
        text: 'text-amber-700',
        bg: 'bg-amber-800/10',
        border: 'border-amber-800/30',
        glow: '',
      };
  }
}

// Curated global benchmark typists for leaderboard rankings
const GLOBAL_BENCHMARK_TYPISTS: Omit<LeaderboardEntry, 'rank' | 'isCurrentUser'>[] = [
  {
    userId: 'global-1',
    username: 'VortexSpeed',
    displayName: 'Vortex Speed',
    netWpm: 172,
    rawWpm: 178,
    accuracy: 99.1,
    racesWon: 1420,
    totalRaces: 1580,
    winRate: 89.9,
    tier: 'Grandmaster',
    completedAt: '2026-11-15T18:30:00Z',
  },
  {
    userId: 'global-2',
    username: 'ApexChronos',
    displayName: 'Apex Chronos',
    netWpm: 154,
    rawWpm: 160,
    accuracy: 98.6,
    racesWon: 980,
    totalRaces: 1150,
    winRate: 85.2,
    tier: 'Grandmaster',
    completedAt: '2026-11-15T17:15:00Z',
  },
  {
    userId: 'global-3',
    username: 'CadenceGhost',
    displayName: 'Cadence Ghost',
    netWpm: 141,
    rawWpm: 146,
    accuracy: 98.9,
    racesWon: 740,
    totalRaces: 910,
    winRate: 81.3,
    tier: 'Grandmaster',
    completedAt: '2026-11-15T16:45:00Z',
  },
  {
    userId: 'global-4',
    username: 'NeonStrike',
    displayName: 'Neon Strike',
    netWpm: 132,
    rawWpm: 138,
    accuracy: 97.8,
    racesWon: 620,
    totalRaces: 840,
    winRate: 73.8,
    tier: 'Master',
    completedAt: '2026-11-15T15:20:00Z',
  },
  {
    userId: 'global-5',
    username: 'CyberTypist',
    displayName: 'Cyber Typist',
    netWpm: 124,
    rawWpm: 129,
    accuracy: 97.4,
    racesWon: 510,
    totalRaces: 730,
    winRate: 69.9,
    tier: 'Master',
    completedAt: '2026-11-15T14:10:00Z',
  },
  {
    userId: 'global-6',
    username: 'QuantumKey',
    displayName: 'Quantum Key',
    netWpm: 115,
    rawWpm: 120,
    accuracy: 98.2,
    racesWon: 430,
    totalRaces: 650,
    winRate: 66.2,
    tier: 'Diamond',
    completedAt: '2026-11-15T13:00:00Z',
  },
  {
    userId: 'global-7',
    username: 'SwiftBlade',
    displayName: 'Swift Blade',
    netWpm: 104,
    rawWpm: 109,
    accuracy: 96.9,
    racesWon: 360,
    totalRaces: 590,
    winRate: 61.0,
    tier: 'Diamond',
    completedAt: '2026-11-15T12:00:00Z',
  },
  {
    userId: 'global-8',
    username: 'EchoPulse',
    displayName: 'Echo Pulse',
    netWpm: 96,
    rawWpm: 101,
    accuracy: 97.1,
    racesWon: 290,
    totalRaces: 520,
    winRate: 55.8,
    tier: 'Platinum',
    completedAt: '2026-11-15T10:30:00Z',
  },
  {
    userId: 'global-9',
    username: 'ShadowType',
    displayName: 'Shadow Type',
    netWpm: 88,
    rawWpm: 93,
    accuracy: 96.5,
    racesWon: 210,
    totalRaces: 440,
    winRate: 47.7,
    tier: 'Platinum',
    completedAt: '2026-11-15T09:15:00Z',
  },
  {
    userId: 'global-10',
    username: 'ZenMaster',
    displayName: 'Zen Master',
    netWpm: 78,
    rawWpm: 82,
    accuracy: 98.5,
    racesWon: 180,
    totalRaces: 410,
    winRate: 43.9,
    tier: 'Gold',
    completedAt: '2026-11-15T08:00:00Z',
  },
];

/**
 * Retrieves persisted race records from localStorage.
 */
export function getStoredRaceHistory(): RaceHistoryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RACE_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Persists a new finished race result.
 */
export function saveRaceRecord(record: RaceHistoryRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredRaceHistory();
    const updated = [record, ...existing.slice(0, 99)]; // Keep latest 100
    localStorage.setItem(RACE_HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Fail gracefully
  }
}

/**
 * Computes user competition stats from match history.
 */
export function computeCompetitionStats(
  history: RaceHistoryRecord[],
  currentNetWpm?: number
): CompetitionStats {
  if (history.length === 0) {
    const fallbackSpeed = currentNetWpm || 0;
    return {
      totalRaces: 0,
      wins: 0,
      podiums: 0,
      winRate: 0,
      bestWpm: fallbackSpeed,
      avgWpm: fallbackSpeed,
      avgAccuracy: 100,
      tier: calculateRankTier(fallbackSpeed),
    };
  }

  const totalRaces = history.length;
  const wins = history.filter((r) => r.placement === 1).length;
  const podiums = history.filter((r) => r.placement <= 3).length;
  const winRate = Math.round((wins / totalRaces) * 1000) / 10;

  let bestWpm = 0;
  let sumWpm = 0;
  let sumAcc = 0;

  history.forEach((r) => {
    if (r.netWpm > bestWpm) bestWpm = r.netWpm;
    sumWpm += r.netWpm;
    sumAcc += r.accuracy;
  });

  const avgWpm = Math.round((sumWpm / totalRaces) * 10) / 10;
  const avgAccuracy = Math.round((sumAcc / totalRaces) * 10) / 10;
  const tier = calculateRankTier(bestWpm);

  return {
    totalRaces,
    wins,
    podiums,
    winRate,
    bestWpm,
    avgWpm,
    avgAccuracy,
    tier,
  };
}

/**
 * Returns merged global leaderboards with the current user ranked dynamically.
 */
export function getGlobalLeaderboard(
  period: LeaderboardPeriod = 'all-time',
  modeFilter: LeaderboardModeFilter = 'all',
  currentUser?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    bestWpm?: number;
    accuracy?: number;
  }
): LeaderboardEntry[] {
  let entries = [...GLOBAL_BENCHMARK_TYPISTS];

  // Adjust speeds slightly depending on period for realism
  if (period === 'daily') {
    entries = entries.map((e) => ({
      ...e,
      netWpm: Math.max(40, e.netWpm - Math.floor(Math.random() * 8)),
    }));
  } else if (period === 'weekly') {
    entries = entries.map((e) => ({
      ...e,
      netWpm: Math.max(40, e.netWpm - Math.floor(Math.random() * 4)),
    }));
  }

  // If current user is provided, insert them into the competition
  if (currentUser && currentUser.bestWpm && currentUser.bestWpm > 0) {
    const history = getStoredRaceHistory();
    const stats = computeCompetitionStats(history, currentUser.bestWpm);

    const userEntry: Omit<LeaderboardEntry, 'rank'> = {
      userId: currentUser.id,
      username: currentUser.username,
      displayName: currentUser.displayName,
      avatarUrl: currentUser.avatarUrl,
      netWpm: stats.bestWpm,
      rawWpm: Math.round(stats.bestWpm * 1.05),
      accuracy: stats.avgAccuracy,
      racesWon: stats.wins,
      totalRaces: stats.totalRaces,
      winRate: stats.winRate,
      tier: stats.tier,
      isCurrentUser: true,
      completedAt: new Date().toISOString(),
    };

    entries.push(userEntry);
  }

  // Sort descending by Net WPM, then accuracy
  entries.sort((a, b) => {
    if (b.netWpm !== a.netWpm) return b.netWpm - a.netWpm;
    return b.accuracy - a.accuracy;
  });

  // Assign 1-indexed ranks
  return entries.map((e, index) => ({
    ...e,
    rank: index + 1,
  }));
}
