export type RankTier =
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Master'
  | 'Grandmaster';

export type LeaderboardPeriod = 'daily' | 'weekly' | 'all-time';

export type LeaderboardModeFilter = 'all' | 'words' | 'time' | 'quote';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  racesWon: number;
  totalRaces: number;
  winRate: number;
  tier: RankTier;
  isCurrentUser?: boolean;
  completedAt: string;
}

export interface RaceHistoryRecord {
  id: string;
  roomCode: string;
  placement: number;
  totalRacers: number;
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  durationSeconds: number;
  mode: string;
  difficulty: string;
  completedAt: string;
  isWin: boolean;
}

export interface CompetitionStats {
  totalRaces: number;
  wins: number;
  podiums: number;
  winRate: number;
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
  tier: RankTier;
}
