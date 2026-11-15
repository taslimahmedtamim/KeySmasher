export type RankedDivision =
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Master'
  | 'Grandmaster';

export interface FriendUser {
  id: string;
  username: string;
  displayName: string;
  avatarSeed: string;
  division: RankedDivision;
  mmr: number;
  peakWpm: number;
  status: 'online' | 'racing' | 'offline';
  lastSeen?: string;
  isMutual: boolean;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderMmr: number;
  sentAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface DirectChallenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerMmr: number;
  roomCode: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface RankedProfile {
  mmr: number;
  peakMmr: number;
  division: RankedDivision;
  placementMatchesRemaining: number;
  seasonWins: number;
  seasonLosses: number;
  currentStreak: number;
  highestStreak: number;
}

export interface MatchmakingQueueState {
  isSearching: boolean;
  searchDurationSeconds: number;
  matchedOpponent: FriendUser | null;
  assignedRoomCode: string | null;
}

export interface TournamentParticipant {
  id: string;
  username: string;
  displayName: string;
  seed: number;
  mmr: number;
  avatarSeed: string;
  isUser: boolean;
  isEliminated: boolean;
}

export interface TournamentMatch {
  id: string;
  roundNumber: number; // 1 = Quarterfinals, 2 = Semifinals, 3 = Finals
  matchIndexInRound: number;
  player1: TournamentParticipant | null;
  player2: TournamentParticipant | null;
  score1?: number; // WPM scored
  score2?: number; // WPM scored
  winnerId: string | null;
  status: 'waiting' | 'in_progress' | 'completed';
  roomCode?: string;
}

export interface Tournament {
  id: string;
  title: string;
  description: string;
  entryMmrMin: number;
  status: 'registration' | 'in_progress' | 'completed';
  currentRound: number;
  totalRounds: number;
  participants: TournamentParticipant[];
  matches: TournamentMatch[];
  championId: string | null;
  prizeXp: number;
  createdAt: string;
}
