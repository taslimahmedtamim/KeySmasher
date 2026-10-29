import { describe, it, expect } from 'vitest';
import { generatePassage } from './generator';
import { FAMOUS_QUOTES } from './quotes';

describe('generatePassage', () => {
  it('generates the specified word count in words mode', () => {
    const passage = generatePassage({
      mode: 'words',
      targetWordCount: 10,
      difficulty: 'beginner',
    });

    const words = passage.trim().split(/\s+/);
    expect(words.length).toBe(10);
    expect(words.every((w) => w.length > 0)).toBe(true);
  });

  it('generates 25 words by default for words mode', () => {
    const passage = generatePassage({
      mode: 'words',
      difficulty: 'intermediate',
    });

    const words = passage.trim().split(/\s+/);
    expect(words.length).toBe(25);
  });

  it('generates adequate word pool for time-based tests', () => {
    const passage15 = generatePassage({
      mode: 'time',
      durationSeconds: 15,
      difficulty: 'beginner',
    });
    const words15 = passage15.trim().split(/\s+/);
    expect(words15.length).toBeGreaterThanOrEqual(50);

    const passage60 = generatePassage({
      mode: 'time',
      durationSeconds: 60,
      difficulty: 'advanced',
    });
    const words60 = passage60.trim().split(/\s+/);
    expect(words60.length).toBeGreaterThanOrEqual(180);
  });

  it('generates code syntax snippets for expert difficulty', () => {
    const passage = generatePassage({
      mode: 'words',
      difficulty: 'expert',
    });

    expect(typeof passage).toBe('string');
    expect(passage.length).toBeGreaterThan(10);
  });

  it('generates a curated quote in quote mode', () => {
    const passage = generatePassage({
      mode: 'quote',
    });

    expect(typeof passage).toBe('string');
    expect(FAMOUS_QUOTES.some((q) => q.text === passage)).toBe(true);
  });

  it('uses custom text in custom mode', () => {
    const custom = 'My custom practice sentence for touch typing.';
    const passage = generatePassage({
      mode: 'custom',
      customText: custom,
    });

    expect(passage).toBe(custom);
  });
});
