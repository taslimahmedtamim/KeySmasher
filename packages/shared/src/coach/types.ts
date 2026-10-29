import { FingerName, HandName } from '../curriculum/types';

export interface KeyAccuracyStat {
  char: string;
  display: string;
  attempts: number;
  errors: number;
  accuracy: number; // 0 to 100
  finger: FingerName;
  hand: HandName;
  confusion: Record<string, number>; // typed char -> count of mistakes
}

export interface WeakKeyDiagnostic {
  char: string;
  display: string;
  attempts: number;
  errors: number;
  accuracy: number; // 0 to 100
  errorRate: number; // 0 to 100
  finger: FingerName;
  hand: HandName;
  instruction: string;
  commonMistakes: string[]; // e.g. ["r", "w"]
  suggestedLessonId?: string;
  suggestedLessonTitle?: string;
}

export interface FingerBalanceStat {
  finger: FingerName;
  label: string;
  hand: HandName;
  totalKeystrokes: number;
  errorCount: number;
  errorRate: number; // 0 to 100
  accuracy: number; // 0 to 100
}

export interface HandBalance {
  leftKeystrokes: number;
  rightKeystrokes: number;
  leftErrors: number;
  rightErrors: number;
  leftAccuracy: number; // 0 to 100
  rightAccuracy: number; // 0 to 100
  dominantHand: 'balanced' | 'left-favored' | 'right-favored';
}

export type CoachRecommendationType = 'speed' | 'accuracy' | 'rhythm' | 'finger' | 'balance';

export interface CoachRecommendation {
  id: string;
  type: CoachRecommendationType;
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionLabel?: string;
  lessonId?: string;
}

export interface CoachAnalysisResult {
  totalAnalyzedKeystrokes: number;
  totalAnalyzedErrors: number;
  overallAccuracy: number;
  healthScore: number; // 0 to 100
  weakKeys: WeakKeyDiagnostic[];
  keyAccuracyMap: Record<string, KeyAccuracyStat>;
  handBalance: HandBalance;
  fingerStats: Record<FingerName, FingerBalanceStat>;
  recommendations: CoachRecommendation[];
}

export interface RawKeySessionStat {
  attempts: number;
  errors: number;
  confusion?: Record<string, number>;
}
