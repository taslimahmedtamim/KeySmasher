import {
  AntiCheatValidationResult,
  BotRosterPreset,
  RaceSubmission,
  RoomConfig,
} from './types';

// Unambiguous character set omitting 0/O and 1/I
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generates an uppercase 6-character room code (e.g. "KS74B2" or "A9FK28").
 */
export function generateRoomCode(prefix: string = ''): string {
  let result = prefix;
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * ROOM_CODE_CHARS.length);
    result += ROOM_CODE_CHARS[randomIndex];
  }
  return result;
}

export const DEFAULT_ROOM_CONFIG: RoomConfig = {
  mode: 'words',
  targetDuration: 30,
  targetWords: 25,
  difficulty: 'intermediate',
  punctuation: false,
  numbers: false,
  maxPlayers: 8,
  isPrivate: true,
};

export const BOT_PRESETS: BotRosterPreset[] = [
  {
    id: 'bot-turtle',
    name: 'Slowpoke Bot',
    difficulty: 'easy',
    targetWpm: 35,
    accuracy: 94,
    avatarColor: '#10b981', // emerald
  },
  {
    id: 'bot-cadence',
    name: 'Cadence Bot',
    difficulty: 'medium',
    targetWpm: 65,
    accuracy: 97,
    avatarColor: '#06b6d4', // cyan
  },
  {
    id: 'bot-cyclone',
    name: 'Cyclone Bot',
    difficulty: 'hard',
    targetWpm: 95,
    accuracy: 98,
    avatarColor: '#a855f7', // purple
  },
  {
    id: 'bot-demon',
    name: 'Apex Demon Bot',
    difficulty: 'demon',
    targetWpm: 130,
    accuracy: 99,
    avatarColor: '#f43f5e', // rose
  },
];

/**
 * Server-authoritative sanity check on race results to prevent manipulation,
 * macros, impossible speeds, or arbitrary payload tampering.
 */
export function validateRaceSubmission(
  submission: RaceSubmission,
  passageText: string
): AntiCheatValidationResult {
  if (!submission) {
    return { isValid: false, reason: 'Missing submission payload.' };
  }

  if (submission.durationSeconds <= 0.5) {
    return { isValid: false, reason: 'Race duration is impossibly short.' };
  }

  // Plausible human speed ceiling (Guinness world record is ~216 WPM; 320 WPM cap accommodates burst speed)
  if (submission.finalWpm > 320) {
    return {
      isValid: false,
      reason: `WPM (${Math.round(submission.finalWpm)}) exceeds maximum human threshold (320 WPM).`,
    };
  }

  if (submission.finalWpm < 0) {
    return { isValid: false, reason: 'WPM cannot be negative.' };
  }

  if (submission.accuracy < 0 || submission.accuracy > 100) {
    return { isValid: false, reason: 'Accuracy must be between 0 and 100%.' };
  }

  const expectedMinCharacters = Math.floor(passageText.length * 0.75);
  if (submission.totalCharacters < expectedMinCharacters) {
    return {
      isValid: false,
      reason: `Typed characters (${submission.totalCharacters}) is below expected minimum for passage (${expectedMinCharacters}).`,
    };
  }

  return { isValid: true };
}

/**
 * Simulates human-like typing progress for AI bot participants in a race room.
 * Includes natural speed modulation and cadence variance.
 */
export function calculateBotProgress(
  elapsedSeconds: number,
  targetWpm: number,
  totalPassageCharacters: number,
  botSeed: number = 1
): { progress: number; currentWpm: number; isFinished: boolean } {
  if (elapsedSeconds <= 0 || totalPassageCharacters <= 0) {
    return { progress: 0, currentWpm: 0, isFinished: false };
  }

  // Characters per second for standard 5 chars/word: (targetWpm * 5) / 60
  const baseCharsPerSecond = (targetWpm * 5) / 60;

  // Add subtle sinusoidal cadence modulation to mimic human burst typing
  const varianceFactor = 1 + 0.12 * Math.sin(elapsedSeconds * 1.5 + botSeed);
  const charactersTyped = Math.min(
    totalPassageCharacters,
    baseCharsPerSecond * varianceFactor * elapsedSeconds
  );

  const rawProgress = (charactersTyped / totalPassageCharacters) * 100;
  const progress = Math.min(100, Math.max(0, Math.round(rawProgress * 10) / 10));

  const currentWpm = Math.round(
    Math.max(0, (charactersTyped / 5) / (elapsedSeconds / 60))
  );

  return {
    progress,
    currentWpm,
    isFinished: progress >= 100,
  };
}
