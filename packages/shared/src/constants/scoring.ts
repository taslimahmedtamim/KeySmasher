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
 * - Net WPM: (correctCharacters / 5) / elapsedMinutes
 * - Accuracy: (correctCharacters / totalTypedCharacters) * 100
 * - CPM (Characters Per Minute): totalTypedCharacters / elapsedMinutes
 */
export function calculateTypingMetrics(input: TypingMetricsInput): TypingMetricsResult {
  const { totalTypedCharacters, correctCharacters, incorrectCharacters, elapsedSeconds } = input;

  if (elapsedSeconds <= 0 || totalTypedCharacters <= 0 || correctCharacters <= 0) {
    const elapsedMinutes = elapsedSeconds > 0 ? elapsedSeconds / 60 : 0;
    const rawWpm = elapsedMinutes > 0 && totalTypedCharacters > 0
      ? Math.round(((totalTypedCharacters / STANDARD_WORD_LENGTH) / elapsedMinutes) * 100) / 100
      : 0;
    const accuracy = totalTypedCharacters > 0
      ? Math.round(((correctCharacters / totalTypedCharacters) * 100) * 100) / 100
      : (elapsedSeconds <= 0 ? 100 : 0);
    const cpm = elapsedMinutes > 0
      ? Math.round((totalTypedCharacters / elapsedMinutes) * 100) / 100
      : 0;

    return {
      rawWpm,
      netWpm: 0,
      accuracy: Math.min(100, Math.max(0, accuracy)),
      cpm,
      elapsedSeconds: Math.round(Math.max(0, elapsedSeconds) * 100) / 100,
      correctCharacters: Math.max(0, correctCharacters),
      incorrectCharacters: Math.max(0, incorrectCharacters),
      totalTypedCharacters: Math.max(0, totalTypedCharacters),
    };
  }

  const elapsedMinutes = elapsedSeconds / 60;

  // Raw WPM: all typed characters divided by 5 per standard word, normalized by elapsed minutes
  const rawWpm = Math.round(((totalTypedCharacters / STANDARD_WORD_LENGTH) / elapsedMinutes) * 100) / 100;

  // Net WPM: standard touch-typing & Monkeytype specification: (correct characters / 5) / elapsed minutes
  const netWords = correctCharacters / STANDARD_WORD_LENGTH;
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

/**
 * Calculates competitive racing score combining speed (Net WPM) and accuracy (%).
 * Formula: Math.round(netWpm * (accuracy / 100) * 10) / 10
 * For example:
 * - 66 WPM at 97% accuracy = 64.0 pts
 * - 67 WPM at 88.1% accuracy = 59.0 pts
 * High accuracy is essential to win competitive races.
 */
export function calculateRaceScore(netWpm: number, accuracy: number): number {
  if (netWpm <= 0 || accuracy <= 0) return 0;
  const accFraction = Math.max(0, Math.min(100, accuracy)) / 100;
  return Math.round(netWpm * accFraction * 10) / 10;
}

export interface RacerRankable {
  isFinished?: boolean;
  currentWpm: number;
  accuracy: number;
  finishTimeSeconds?: number;
  progress?: number;
  placement?: number;
}

/**
 * Deterministic rank comparator prioritizing Speed + Accuracy composite score.
 * 1. Finished racers take precedence over DNF/unfinished racers.
 * 2. Ranked by composite Race Score (Net WPM * (Accuracy / 100)).
 * 3. Tie-breaker 1: Higher accuracy.
 * 4. Tie-breaker 2: Higher Net WPM.
 * 5. Tie-breaker 3: Faster finish time.
 * 6. Tie-breaker 4: Higher progress.
 */
export function compareRacerRank(a: RacerRankable, b: RacerRankable): number {
  // 1. Finished racers come first
  if (a.isFinished && !b.isFinished) return -1;
  if (!a.isFinished && b.isFinished) return 1;

  // 2. Compare Speed + Accuracy score
  const scoreA = calculateRaceScore(a.currentWpm, a.accuracy);
  const scoreB = calculateRaceScore(b.currentWpm, b.accuracy);
  if (scoreB !== scoreA) {
    return scoreB - scoreA;
  }

  // 3. Higher accuracy wins
  if (b.accuracy !== a.accuracy) {
    return b.accuracy - a.accuracy;
  }

  // 4. Higher Net WPM wins
  if (b.currentWpm !== a.currentWpm) {
    return b.currentWpm - a.currentWpm;
  }

  // 5. Faster finish time wins
  if (a.finishTimeSeconds && b.finishTimeSeconds && a.finishTimeSeconds !== b.finishTimeSeconds) {
    return a.finishTimeSeconds - b.finishTimeSeconds;
  }

  // 6. Higher progress wins
  return (b.progress || 0) - (a.progress || 0);
}


