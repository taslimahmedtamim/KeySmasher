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

/**
 * Calculates typing consistency score percentage (0 - 100%).
 * Consistency is calculated as 100 * (1 - Coefficient of Variation).
 * Higher score means the typing pace was steady throughout the session.
 */
export function calculateConsistency(wpmSamples: number[]): number {
  if (!wpmSamples || wpmSamples.length < 2) {
    return 100;
  }

  const validSamples = wpmSamples.filter((w) => w > 0);
  if (validSamples.length < 2) {
    return 100;
  }

  const mean = validSamples.reduce((a, b) => a + b, 0) / validSamples.length;
  if (mean === 0) return 0;

  const variance =
    validSamples.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / validSamples.length;
  const stdDev = Math.sqrt(variance);

  const cv = stdDev / mean;
  const consistency = Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
  return consistency;
}

