import { describe, it, expect } from 'vitest';
import {
  calculateTypingMetrics,
  calculateConsistency,
  calculateRaceScore,
  compareRacerRank,
  STANDARD_WORD_LENGTH,
} from './scoring';

describe('calculateTypingMetrics', () => {
  it('should verify standard word length is 5', () => {
    expect(STANDARD_WORD_LENGTH).toBe(5);
  });

  it('should return 0 wpm and 100% accuracy when elapsed time is 0', () => {
    const metrics = calculateTypingMetrics({
      totalTypedCharacters: 0,
      correctCharacters: 0,
      incorrectCharacters: 0,
      elapsedSeconds: 0,
    });

    expect(metrics.rawWpm).toBe(0);
    expect(metrics.netWpm).toBe(0);
    expect(metrics.accuracy).toBe(100);
    expect(metrics.cpm).toBe(0);
  });

  it('should calculate raw WPM and 100% accuracy correctly for 1 minute typing', () => {
    // 300 characters = 60 words in 60 seconds -> 60 Raw WPM
    const metrics = calculateTypingMetrics({
      totalTypedCharacters: 300,
      correctCharacters: 300,
      incorrectCharacters: 0,
      elapsedSeconds: 60,
    });

    expect(metrics.rawWpm).toBe(60);
    expect(metrics.netWpm).toBe(60);
    expect(metrics.accuracy).toBe(100);
    expect(metrics.cpm).toBe(300);
  });

  it('should compute Net WPM based on correct characters and compute accurate accuracy percentage', () => {
    // 300 characters, 270 correct, 30 incorrect, 60 seconds
    // Raw WPM: 300 / 5 / 1 = 60 WPM
    // Net WPM: (270 / 5) / 1 = 54 Net WPM
    // Accuracy: (270 / 300) * 100 = 90%
    const metrics = calculateTypingMetrics({
      totalTypedCharacters: 300,
      correctCharacters: 270,
      incorrectCharacters: 30,
      elapsedSeconds: 60,
    });

    expect(metrics.rawWpm).toBe(60);
    expect(metrics.netWpm).toBe(54);
    expect(metrics.accuracy).toBe(90);
    expect(metrics.cpm).toBe(300);
  });

  it('should correctly calculate Net WPM for partial errors without zero-clamping valid correct characters', () => {
    const metrics = calculateTypingMetrics({
      totalTypedCharacters: 50, // 10 words
      correctCharacters: 10,    // 2 words
      incorrectCharacters: 40,
      elapsedSeconds: 30,       // 0.5 min -> 2 / 0.5 = 4 Net WPM
    });

    expect(metrics.netWpm).toBe(4);
    expect(metrics.rawWpm).toBe(20);
    expect(metrics.accuracy).toBe(20);
  });

  it('should return 0 Net WPM and 0% accuracy when typing only wrong characters', () => {
    const metrics = calculateTypingMetrics({
      totalTypedCharacters: 50,
      correctCharacters: 0,
      incorrectCharacters: 50,
      elapsedSeconds: 30,
    });

    expect(metrics.netWpm).toBe(0);
    expect(metrics.accuracy).toBe(0);
    expect(metrics.rawWpm).toBe(20); // (50/5) / 0.5 min = 20 Raw WPM
  });
});

describe('calculateConsistency', () => {
  it('returns 100% when there are fewer than 2 samples', () => {
    expect(calculateConsistency([])).toBe(100);
    expect(calculateConsistency([60])).toBe(100);
  });

  it('returns 100% when all samples are identical', () => {
    expect(calculateConsistency([80, 80, 80, 80])).toBe(100);
  });

  it('returns a high consistency score for steady pace with minor fluctuations', () => {
    const consistency = calculateConsistency([70, 72, 71, 69, 70]);
    expect(consistency).toBeGreaterThanOrEqual(95);
  });

  it('returns a lower consistency score for erratic speeds', () => {
    const steady = calculateConsistency([60, 62, 61, 59, 60]);
    const erratic = calculateConsistency([20, 90, 30, 100, 15]);
    expect(erratic).toBeLessThan(steady);
  });

  describe('calculateRaceScore & compareRacerRank', () => {
    it('computes composite race score combining speed and accuracy', () => {
      // 66 WPM with 97% accuracy = 64.0 pts
      expect(calculateRaceScore(66, 97)).toBe(64);
      // 67 WPM with 88.1% accuracy = 59.0 pts
      expect(calculateRaceScore(67, 88.1)).toBe(59);
      // 100 WPM with 100% accuracy = 100 pts
      expect(calculateRaceScore(100, 100)).toBe(100);
      // 0 WPM
      expect(calculateRaceScore(0, 95)).toBe(0);
    });

    it('ranks higher accuracy over slightly higher speed when composite score is greater', () => {
      const userRacer = {
        isFinished: true,
        currentWpm: 67,
        accuracy: 88.1,
        finishTimeSeconds: 21.1,
      };
      const botRacer = {
        isFinished: true,
        currentWpm: 66,
        accuracy: 97.0,
        finishTimeSeconds: 24.0,
      };

      // botRacer (64.0 pts) beats userRacer (59.0 pts)
      const racers = [userRacer, botRacer].sort(compareRacerRank);
      expect(racers[0]).toBe(botRacer);
      expect(racers[1]).toBe(userRacer);
    });
  });
});

