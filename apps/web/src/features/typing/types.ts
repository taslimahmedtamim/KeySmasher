import {
  PassageDifficulty,
  TestMode,
  TimeDurationOption,
  WordCountOption,
  TypingMetricsResult,
} from '@keysmasher/shared';

export type EngineStatus = 'idle' | 'active' | 'completed' | 'cancelled';

export type CharacterState = 'pending' | 'correct' | 'incorrect' | 'extra';

export type SoundCategory = 'mute' | 'clicky' | 'linear' | 'tactile' | 'vintage';

export type SoundTheme =
  | 'off'
  | 'click'
  | 'mx-red'
  | 'clack'
  | 'thock'
  | 'topre';

export interface RenderedChar {
  char: string;
  state: CharacterState;
  isExtra?: boolean;
}

export interface RenderedWord {
  index: number;
  expected: string;
  typed: string;
  characters: RenderedChar[];
  isCompleted: boolean;
  isCurrent: boolean;
  hasErrors: boolean;
}

export interface TypingEngineConfig {
  mode: TestMode;
  durationSeconds: TimeDurationOption;
  targetWordCount: WordCountOption;
  difficulty: PassageDifficulty;
  allowPaste: boolean;
  includePunctuation: boolean;
  includeNumbers: boolean;
  initialPassage?: string;
  customText?: string;
  quoteLength?: 'short' | 'medium' | 'long';
  soundTheme?: SoundTheme;
  soundVolume?: number;
}

export interface WpmHistoryPoint {
  second: number;
  rawWpm: number;
  netWpm: number;
  accuracy: number;
  errors: number;
  burstWpm?: number;
}

export interface ExtendedTypingMetrics extends TypingMetricsResult {
  timeRemaining: number;
  completedWordsCount: number;
  totalWordsCount: number;
  missedCharacters: number;
  extraCharacters: number;
  consistency: number;
  keyStats?: Record<string, { attempts: number; errors: number; confusion: Record<string, number> }>;
}
