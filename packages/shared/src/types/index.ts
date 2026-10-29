export type TestMode = 'time' | 'words' | 'quote' | 'custom';

export type TimeDurationOption = 15 | 30 | 60 | 120;
export type WordCountOption = 10 | 25 | 50 | 100;
export type PassageDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type CourseLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'expert';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  level: number;
  xp: number;
}

export interface TypingSession {
  id: string;
  userId?: string;
  mode: TestMode;
  targetDuration?: number;
  targetWordCount?: number;
  difficulty: PassageDifficulty;
  passageId?: string;
  rawWpm: number;
  netWpm: number;
  accuracy: number;
  cpm: number;
  durationSeconds: number;
  completedAt: string;
}

export type RaceStatus = 'WAITING' | 'COUNTDOWN' | 'RACING' | 'FINISHED' | 'CANCELLED';

export interface RaceParticipant {
  odId: string;
  userId?: string;
  username: string;
  progressPercentage: number;
  currentWpm: number;
  accuracy: number;
  isFinished: boolean;
  finishTimeSeconds?: number;
  placement?: number;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  service: string;
  version: string;
  uptimeSeconds: number;
}
