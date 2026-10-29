import { describe, it, expect } from 'vitest';
import { calculateTypingMetrics, STANDARD_WORD_LENGTH } from './scoring';

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

  it('should deduct errors from Net WPM and compute accurate accuracy percentage', () => {
    // 300 characters, 270 correct, 30 incorrect, 60 seconds
    // Raw WPM: 300 / 5 / 1 = 60 WPM
    // Net words: (300/5) - 30 = 60 - 30 = 30 words in 1 min -> 30 Net WPM
    // Accuracy: (270 / 300) * 100 = 90%
    const metrics = calculateTypingMetrics({
      totalTypedCharacters: 300,
      correctCharacters: 270,
      incorrectCharacters: 30,
      elapsedSeconds: 60,
    });

    expect(metrics.rawWpm).toBe(60);
    expect(metrics.netWpm).toBe(30);
    expect(metrics.accuracy).toBe(90);
    expect(metrics.cpm).toBe(300);
  });

  it('should clamp Net WPM to 0 when errors exceed word count', () => {
    const metrics = calculateTypingMetrics({
      totalTypedCharacters: 50, // 10 words
      correctCharacters: 10,
      incorrectCharacters: 40, // 40 errors > 10 words
      elapsedSeconds: 30,
    });

    expect(metrics.netWpm).toBe(0);
    expect(metrics.accuracy).toBe(20);
  });
});
