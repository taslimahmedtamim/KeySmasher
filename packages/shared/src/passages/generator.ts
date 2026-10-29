import { PassageDifficulty, TestMode, TimeDurationOption, WordCountOption } from '../types';
import {
  WORD_LIST_BEGINNER,
  WORD_LIST_INTERMEDIATE,
  WORD_LIST_ADVANCED,
  WORD_LIST_EXPERT,
} from './words';

export interface PassageGenerationOptions {
  mode: TestMode;
  difficulty?: PassageDifficulty;
  targetWordCount?: WordCountOption;
  durationSeconds?: TimeDurationOption;
  includePunctuation?: boolean;
  includeNumbers?: boolean;
}

/**
 * Estimates words needed for time duration (assuming average 120-150 WPM upper bound + safety buffer)
 */
function getWordCountForDuration(durationSeconds: TimeDurationOption = 30): number {
  switch (durationSeconds) {
    case 15:
      return 50;
    case 30:
      return 90;
    case 60:
      return 180;
    case 120:
      return 360;
    default:
      return 100;
  }
}

/**
 * Generates a randomized typing passage based on difficulty and test configuration.
 */
export function generatePassage(options: PassageGenerationOptions): string {
  const difficulty = options.difficulty || 'beginner';

  // For expert difficulty, select syntax/code snippets
  if (difficulty === 'expert') {
    const pool = [...WORD_LIST_EXPERT];
    const count = options.mode === 'words' ? Math.max(1, Math.floor((options.targetWordCount || 25) / 8)) : 4;
    const selected: string[] = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      selected.push(pool[idx]);
    }
    return selected.join(' ');
  }

  let wordPool: string[];
  switch (difficulty) {
    case 'advanced':
      wordPool = [...WORD_LIST_ADVANCED, ...WORD_LIST_INTERMEDIATE];
      break;
    case 'intermediate':
      wordPool = [...WORD_LIST_INTERMEDIATE, ...WORD_LIST_BEGINNER];
      break;
    case 'beginner':
    default:
      wordPool = [...WORD_LIST_BEGINNER];
      break;
  }

  const targetCount =
    options.mode === 'words'
      ? options.targetWordCount || 25
      : getWordCountForDuration(options.durationSeconds || 30);

  const words: string[] = [];
  let prevWord = '';

  for (let i = 0; i < targetCount; i++) {
    let candidate = '';
    // Avoid immediate duplicate word
    let attempts = 0;
    do {
      const idx = Math.floor(Math.random() * wordPool.length);
      candidate = wordPool[idx];
      attempts++;
    } while (candidate === prevWord && attempts < 10);

    // Optional punctuation enrichment for intermediate/advanced
    if (options.includePunctuation && i > 0 && i % 6 === 0) {
      const puncs = [',', '.', ';', '!'];
      const punc = puncs[Math.floor(Math.random() * puncs.length)];
      candidate += punc;
    }

    // Optional numbers
    if (options.includeNumbers && i > 0 && i % 9 === 0) {
      const num = Math.floor(Math.random() * 99) + 1;
      words.push(num.toString());
    }

    words.push(candidate);
    prevWord = candidate;
  }

  return words.join(' ');
}
