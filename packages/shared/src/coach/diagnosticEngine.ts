import { FingerName, HandName } from '../curriculum/types';
import { getFingerForKey, FINGER_NAMES } from '../curriculum/keyboardMap';
import {
  CoachAnalysisResult,
  CoachRecommendation,
  FingerBalanceStat,
  HandBalance,
  KeyAccuracyStat,
  RawKeySessionStat,
  WeakKeyDiagnostic,
} from './types';

export const KEY_TO_LESSON_MAP: Record<string, { lessonId: string; lessonTitle: string }> = {
  f: { lessonId: 'beginner-1', lessonTitle: 'Home Row Anchors: F & J' },
  j: { lessonId: 'beginner-1', lessonTitle: 'Home Row Anchors: F & J' },
  d: { lessonId: 'beginner-2', lessonTitle: 'Home Row Expansion: D & K' },
  k: { lessonId: 'beginner-2', lessonTitle: 'Home Row Expansion: D & K' },
  s: { lessonId: 'beginner-3', lessonTitle: 'Ring Finger Anchor: S & L' },
  l: { lessonId: 'beginner-3', lessonTitle: 'Ring Finger Anchor: S & L' },
  a: { lessonId: 'beginner-4', lessonTitle: 'Pinky Control: A & ;' },
  ';': { lessonId: 'beginner-4', lessonTitle: 'Pinky Control: A & ;' },
  g: { lessonId: 'beginner-5', lessonTitle: 'Center Keys Reach: G & H' },
  h: { lessonId: 'beginner-5', lessonTitle: 'Center Keys Reach: G & H' },
  e: { lessonId: 'elementary-1', lessonTitle: 'Top Row Vowels: E & I' },
  i: { lessonId: 'elementary-1', lessonTitle: 'Top Row Vowels: E & I' },
  r: { lessonId: 'elementary-2', lessonTitle: 'Top Row Index Reaches: R & U' },
  u: { lessonId: 'elementary-2', lessonTitle: 'Top Row Index Reaches: R & U' },
  t: { lessonId: 'elementary-3', lessonTitle: 'Top Row High Reaches: T & Y' },
  y: { lessonId: 'elementary-3', lessonTitle: 'Top Row High Reaches: T & Y' },
  w: { lessonId: 'elementary-4', lessonTitle: 'Top Row Ring Reaches: W & O' },
  o: { lessonId: 'elementary-4', lessonTitle: 'Top Row Ring Reaches: W & O' },
  q: { lessonId: 'elementary-5', lessonTitle: 'Top Row Outer Pinky: Q & P' },
  p: { lessonId: 'elementary-5', lessonTitle: 'Top Row Outer Pinky: Q & P' },
  v: { lessonId: 'intermediate-1', lessonTitle: 'Bottom Row Index: V & M' },
  m: { lessonId: 'intermediate-1', lessonTitle: 'Bottom Row Index: V & M' },
  c: { lessonId: 'intermediate-2', lessonTitle: 'Bottom Row Middle: C & ,' },
  ',': { lessonId: 'intermediate-2', lessonTitle: 'Bottom Row Middle: C & ,' },
  x: { lessonId: 'intermediate-3', lessonTitle: 'Bottom Row Ring: X & .' },
  '.': { lessonId: 'intermediate-3', lessonTitle: 'Bottom Row Ring: X & .' },
  z: { lessonId: 'intermediate-4', lessonTitle: 'Bottom Row Pinky: Z & /' },
  '/': { lessonId: 'intermediate-4', lessonTitle: 'Bottom Row Pinky: Z & /' },
  b: { lessonId: 'intermediate-5', lessonTitle: 'Extreme Center Reaches: B & N' },
  n: { lessonId: 'intermediate-5', lessonTitle: 'Extreme Center Reaches: B & N' },
};

const ALL_FINGERS: FingerName[] = [
  'left-pinky',
  'left-ring',
  'left-middle',
  'left-index',
  'thumb',
  'right-index',
  'right-middle',
  'right-ring',
  'right-pinky',
];

export interface SessionDiagnosticSummary {
  avgWpm?: number;
  avgAccuracy?: number;
  avgConsistency?: number;
  totalTests?: number;
}

/**
 * Pure analysis engine that transforms raw keystroke telemetry and test history
 * into actionable typist diagnostics, weak-key priority ranking, hand balance metrics,
 * and rule-based coaching insights.
 */
export function analyzeTypingDiagnostics(
  keyStatsMap: Record<string, RawKeySessionStat>,
  summary?: SessionDiagnosticSummary
): CoachAnalysisResult {
  const keyAccuracyMap: Record<string, KeyAccuracyStat> = {};
  let totalAnalyzedKeystrokes = 0;
  let totalAnalyzedErrors = 0;

  // Initialize finger stats containers
  const fingerStats: Record<FingerName, FingerBalanceStat> = {} as Record<
    FingerName,
    FingerBalanceStat
  >;

  for (const f of ALL_FINGERS) {
    const info = FINGER_NAMES[f];
    fingerStats[f] = {
      finger: f,
      label: info.label,
      hand: info.hand,
      totalKeystrokes: 0,
      errorCount: 0,
      errorRate: 0,
      accuracy: 100,
    };
  }

  // Iterate over raw key stats
  for (const rawChar of Object.keys(keyStatsMap)) {
    const rawStat = keyStatsMap[rawChar];
    if (!rawStat || rawStat.attempts <= 0) continue;

    const char = rawChar.toLowerCase();
    const attempts = rawStat.attempts;
    const errors = Math.min(rawStat.errors, attempts);
    const accuracy = Math.round(((attempts - errors) / attempts) * 100);

    const guide = getFingerForKey(char);
    const finger: FingerName = guide ? guide.finger : 'thumb';
    const hand: HandName = guide ? guide.hand : 'right';

    totalAnalyzedKeystrokes += attempts;
    totalAnalyzedErrors += errors;

    // Accumulate into key accuracy map
    const existing = keyAccuracyMap[char];
    if (existing) {
      existing.attempts += attempts;
      existing.errors += errors;
      existing.accuracy = Math.round(
        ((existing.attempts - existing.errors) / existing.attempts) * 100
      );
      if (rawStat.confusion) {
        for (const [confusedChar, count] of Object.entries(rawStat.confusion)) {
          existing.confusion[confusedChar] = (existing.confusion[confusedChar] || 0) + count;
        }
      }
    } else {
      keyAccuracyMap[char] = {
        char,
        display: char === ' ' ? '␣ Space' : char.toUpperCase(),
        attempts,
        errors,
        accuracy,
        finger,
        hand,
        confusion: { ...(rawStat.confusion || {}) },
      };
    }

    // Accumulate into finger stats
    if (fingerStats[finger]) {
      fingerStats[finger].totalKeystrokes += attempts;
      fingerStats[finger].errorCount += errors;
    }
  }

  // Compute rates for each finger
  let leftKeystrokes = 0;
  let rightKeystrokes = 0;
  let leftErrors = 0;
  let rightErrors = 0;

  for (const f of ALL_FINGERS) {
    const stat = fingerStats[f];
    if (stat.totalKeystrokes > 0) {
      stat.errorRate = Math.round((stat.errorCount / stat.totalKeystrokes) * 100);
      stat.accuracy = Math.max(0, 100 - stat.errorRate);
    }

    if (stat.hand === 'left') {
      leftKeystrokes += stat.totalKeystrokes;
      leftErrors += stat.errorCount;
    } else if (stat.hand === 'right') {
      rightKeystrokes += stat.totalKeystrokes;
      rightErrors += stat.errorCount;
    }
  }

  // Compute Hand Balance
  const leftAccuracy =
    leftKeystrokes > 0 ? Math.round(((leftKeystrokes - leftErrors) / leftKeystrokes) * 100) : 100;
  const rightAccuracy =
    rightKeystrokes > 0
      ? Math.round(((rightKeystrokes - rightErrors) / rightKeystrokes) * 100)
      : 100;

  let dominantHand: 'balanced' | 'left-favored' | 'right-favored' = 'balanced';
  if (Math.abs(leftAccuracy - rightAccuracy) >= 7) {
    dominantHand = leftAccuracy > rightAccuracy ? 'left-favored' : 'right-favored';
  }

  const handBalance: HandBalance = {
    leftKeystrokes,
    rightKeystrokes,
    leftErrors,
    rightErrors,
    leftAccuracy,
    rightAccuracy,
    dominantHand,
  };

  // Overall accuracy
  const overallAccuracy =
    totalAnalyzedKeystrokes > 0
      ? Math.round(
          ((totalAnalyzedKeystrokes - totalAnalyzedErrors) / totalAnalyzedKeystrokes) * 100
        )
      : summary?.avgAccuracy ?? 100;

  // Rank Weak Keys:
  // Precision filtering: only candidate keys with meaningful inaccuracy (accuracy < 85% or error rate >= 15%)
  const candidateWeakKeys: WeakKeyDiagnostic[] = [];

  for (const [char, stat] of Object.entries(keyAccuracyMap)) {
    // Only analyze alphanumeric and standard punctuation keys with actual errors
    if (stat.attempts < 1 || stat.errors <= 0) continue;

    const errorRate = Math.round((stat.errors / stat.attempts) * 100);
    // Meaningful weakness criteria:
    // A key is only a bottleneck candidate if accuracy is below 85% (or 2+ errors with accuracy < 90%)
    const isWeak = stat.accuracy < 85 || errorRate >= 15 || (stat.errors >= 2 && stat.accuracy < 90);
    if (!isWeak) continue;

    const guide = getFingerForKey(char);
    const lessonRef = KEY_TO_LESSON_MAP[char.toLowerCase()];

    // Top common mistakes
    const mistakesSorted = Object.entries(stat.confusion)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([c]) => c.toUpperCase());

    candidateWeakKeys.push({
      char,
      display: char === ' ' ? '␣ Space' : char.toUpperCase(),
      attempts: stat.attempts,
      errors: stat.errors,
      accuracy: stat.accuracy,
      errorRate,
      finger: stat.finger,
      hand: stat.hand,
      instruction: guide?.instruction || `Pressed with ${FINGER_NAMES[stat.finger].label}`,
      commonMistakes: mistakesSorted,
      suggestedLessonId: lessonRef?.lessonId,
      suggestedLessonTitle: lessonRef?.lessonTitle,
    });
  }

  // Sort candidate weak keys by impact severity: (errors * errorRate), then lowest accuracy, then highest errors
  candidateWeakKeys.sort((a, b) => {
    const severityA = a.errors * (100 - a.accuracy);
    const severityB = b.errors * (100 - b.accuracy);
    if (severityB !== severityA) {
      return severityB - severityA;
    }
    if (a.accuracy !== b.accuracy) {
      return a.accuracy - b.accuracy;
    }
    return b.errors - a.errors;
  });

  const weakKeys = candidateWeakKeys.slice(0, 5);

  // Compute Health Score (composite metric: 60% accuracy, 20% consistency, 20% hand balance)
  const consistencyScore = summary?.avgConsistency ?? 90;
  const balancePenalty = Math.abs(leftAccuracy - rightAccuracy) * 0.5;
  const healthScore = Math.max(
    10,
    Math.min(
      100,
      Math.round(overallAccuracy * 0.6 + consistencyScore * 0.2 + (100 - balancePenalty) * 0.2)
    )
  );

  // Rule-based Coaching Recommendations Engine
  const recommendations: CoachRecommendation[] = [];

  // Rule 1: Accuracy Gatekeeper (<94% accuracy)
  if (overallAccuracy < 94) {
    recommendations.push({
      id: 'rec-accuracy-gate',
      type: 'accuracy',
      priority: 'high',
      title: 'Precision Over Speed',
      message: `Your current accuracy is ${overallAccuracy}%. Slow down your typing cadence by 10-15% until you consistently maintain 97%+ accuracy. Precision builds clean muscle memory.`,
      actionLabel: 'Focus On Clean Keystrokes',
    });
  }

  // Rule 2: Speed Plateau / High Accuracy Mastery
  const avgWpm = summary?.avgWpm ?? 0;
  if (overallAccuracy >= 97 && avgWpm > 0 && avgWpm < 60) {
    recommendations.push({
      id: 'rec-speed-push',
      type: 'speed',
      priority: 'medium',
      title: 'Unlock Speed Rolling',
      message: `Excellent precision (${overallAccuracy}% accuracy). You are ready to push past your ${avgWpm} WPM comfort zone. Focus on reading words 2-3 tokens ahead and rolling multi-character n-grams.`,
      actionLabel: 'Train Speed Bursts',
    });
  }

  // Rule 3: Top Weak Key Direct Deep-Link
  if (weakKeys.length > 0) {
    const topWeak = weakKeys[0];
    const mistakeText =
      topWeak.commonMistakes.length > 0
        ? ` (often mis-pressed as [${topWeak.commonMistakes.join(', ')}])`
        : '';

    recommendations.push({
      id: `rec-weak-key-${topWeak.char}`,
      type: 'finger',
      priority: 'high',
      title: `Stabilize Key [${topWeak.display}]`,
      message: `Key [${topWeak.display}] has ${topWeak.errors} misses (${topWeak.accuracy}% accuracy)${mistakeText}. Assigned to ${FINGER_NAMES[topWeak.finger].label}. Keep your palm relaxed and return immediately to home anchor.`,
      actionLabel: topWeak.suggestedLessonTitle
        ? `Open Academy: ${topWeak.suggestedLessonTitle}`
        : 'Run Targeted Drill',
      lessonId: topWeak.suggestedLessonId,
    });
  }

  // Rule 4: Pinky Fatigue / Outer Reaches
  const leftPinkyErr = fingerStats['left-pinky'].errorRate;
  const rightPinkyErr = fingerStats['right-pinky'].errorRate;
  if (leftPinkyErr > 15 || rightPinkyErr > 15) {
    const highPinky = leftPinkyErr > rightPinkyErr ? 'Left Pinky (A, Q, Z)' : 'Right Pinky (P, ;, /)';
    recommendations.push({
      id: 'rec-pinky-dexterity',
      type: 'finger',
      priority: 'medium',
      title: 'Pinky Extension & Finger Stability',
      message: `${highPinky} has an elevated error rate. Avoid twisting your entire wrist when reaching outer keys; pivot lightly from the knuckle.`,
      actionLabel: 'Review Home Row Anchor Lessons',
      lessonId: 'beginner-4',
    });
  }

  // Rule 5: Rhythm Cadence / Jerky Keystrokes
  if (consistencyScore < 80 && (summary?.totalTests ?? 0) > 0) {
    recommendations.push({
      id: 'rec-rhythm-cadence',
      type: 'rhythm',
      priority: 'medium',
      title: 'Even-Paced Metronome Rhythm',
      message: `Your typing consistency is ${consistencyScore}%. High-speed typists maintain a steady, uniform tempo rather than bursting and pausing. Try tapping to a constant rhythm.`,
      actionLabel: 'Practice Rhythmic Cadence',
    });
  }

  // Rule 6: Asymmetric Hand Balance
  if (dominantHand !== 'balanced' && leftKeystrokes > 20 && rightKeystrokes > 20) {
    const weakerHand = dominantHand === 'left-favored' ? 'Right' : 'Left';
    const diff = Math.abs(leftAccuracy - rightAccuracy);
    recommendations.push({
      id: 'rec-hand-balance',
      type: 'balance',
      priority: 'low',
      title: `Balance Hand Coordination (+${diff}% Gap)`,
      message: `Your ${weakerHand} hand has a noticeable error disparity compared to your other hand. Perform isolated drills for the ${weakerHand.toLowerCase()} hand home row.`,
      actionLabel: 'Train Hand Dexterity',
    });
  }

  // Default recommendation if typist is in perfect form
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-mastery-form',
      type: 'accuracy',
      priority: 'low',
      title: 'Optimum Typist Form',
      message:
        'Your typing metrics show balanced hand coordination, clean finger discipline, and strong precision. Maintain daily practice sessions to preserve your peak motor reflexes.',
      actionLabel: 'Continue Practice',
    });
  }

  return {
    totalAnalyzedKeystrokes,
    totalAnalyzedErrors,
    overallAccuracy,
    healthScore,
    weakKeys,
    keyAccuracyMap,
    handBalance,
    fingerStats,
    recommendations,
  };
}
