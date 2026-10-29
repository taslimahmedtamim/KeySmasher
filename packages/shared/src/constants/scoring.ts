/**
 * KeySmasher Deterministic Scoring Constants and Rules
 * Standard touch-typing industry convention: 5 keystrokes/characters = 1 word.
 */

export const STANDARD_WORD_LENGTH = 5;

export interface TypingMetricsInput {
  totalTypedCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
  elapsedSeconds: number;
}

export interface TypingMetricsResult {
  rawWpm: number;
  netWpm: number;
  accuracy: number;
  cpm: number;
  elapsedSeconds: number;
  correctCharacters: number;
  incorrectCharacters: number;
  totalTypedCharacters: number;
}

/**
 * Calculates deterministic typing metrics according to standard touch-typing specifications.
 * 
 * Formulas:
 * - Elapsed Minutes: elapsedSeconds / 60
 * - Raw WPM: (totalTypedCharacters / 5) / elapsedMinutes
 * - Net WPM: Math.max(0, ((totalTypedCharacters / 5) - incorrectCharacters) / elapsedMinutes)
 * - Accuracy: (correctCharacters / totalTypedCharacters) * 100
 * - CPM (Characters Per Minute): totalTypedCharacters / elapsedMinutes
 */
export function calculateTypingMetrics(input: TypingMetricsInput): TypingMetricsResult {
  const { totalTypedCharacters, correctCharacters, incorrectCharacters, elapsedSeconds } = input;

  if (elapsedSeconds <= 0 || totalTypedCharacters <= 0) {
    return {
      rawWpm: 0,
      netWpm: 0,
      accuracy: 100,
      cpm: 0,
      elapsedSeconds: Math.max(0, elapsedSeconds),
      correctCharacters: 0,
      incorrectCharacters: 0,
      totalTypedCharacters: 0,
    };
  }

  const elapsedMinutes = elapsedSeconds / 60;

  // Raw WPM: all typed characters divided by 5 per standard word, normalized by elapsed minutes
  const rawWpm = Math.round(((totalTypedCharacters / STANDARD_WORD_LENGTH) / elapsedMinutes) * 100) / 100;

  // Net WPM: subtract uncorrected/incorrect characters from words count
  const netWords = (totalTypedCharacters / STANDARD_WORD_LENGTH) - incorrectCharacters;
  const netWpm = Math.max(0, Math.round((netWords / elapsedMinutes) * 100) / 100);

  // Accuracy: ratio of correct characters to all typed characters
  const accuracy = Math.round(((correctCharacters / totalTypedCharacters) * 100) * 100) / 100;

  // CPM
  const cpm = Math.round((totalTypedCharacters / elapsedMinutes) * 100) / 100;

  return {
    rawWpm,
    netWpm,
    accuracy: Math.min(100, Math.max(0, accuracy)),
    cpm,
    elapsedSeconds: Math.round(elapsedSeconds * 100) / 100,
    correctCharacters,
    incorrectCharacters,
    totalTypedCharacters,
  };
}
