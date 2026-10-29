import { SavedTestSession } from '../typing/utils/historyStorage';

export interface PersonalBestRecord {
  preset: string; // e.g., 'time-15', 'time-30', 'time-60', 'time-120', 'words-10', 'words-25', 'words-50', 'words-100', 'quote'
  label: string; // e.g. '15 Seconds', '60 Seconds', '50 Words', 'Quote'
  category: 'time' | 'words' | 'quote' | 'custom';
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  timestamp: number;
}

export interface AnalyticsSummary {
  totalTests: number;
  totalTimeSeconds: number;
  totalWords: number;
  peakWpm: number;
  avgWpm: number;
  avgAccuracy: number;
  avgConsistency: number;
  dailyStreak: number;
  wpmGain: number; // Delta between recent average and first recorded average
}

export interface ProgressionPoint {
  id: string;
  testIndex: number;
  timestamp: number;
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  mode: string;
  preset: string;
}

export interface LevelMastery {
  id: string;
  title: string;
  completedLessons: number;
  totalLessons: number;
  earnedStars: number;
  maxStars: number;
}

export interface AcademyMasterySummary {
  totalCompleted: number;
  totalStars: number;
  maxStars: number;
  levels: LevelMastery[];
}

export interface UserAnalyticsData {
  summary: AnalyticsSummary;
  personalBests: PersonalBestRecord[];
  progression: ProgressionPoint[];
  sessions: SavedTestSession[];
  academy: AcademyMasterySummary;
  isLoading: boolean;
}
