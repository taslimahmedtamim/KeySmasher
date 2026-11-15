import { describe, it, expect } from 'vitest';
import {
  generateRoomCode,
  validateRaceSubmission,
  calculateBotProgress,
  DEFAULT_ROOM_CONFIG,
  BOT_PRESETS,
} from './utils';
import { RaceSubmission } from './types';

describe('Multiplayer Utilities (@keysmasher/shared)', () => {
  describe('generateRoomCode', () => {
    it('generates a 6-character uppercase alphanumeric code', () => {
      const code = generateRoomCode();
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[A-Z2-9]{6}$/);
      // Ensure ambiguous characters (0, O, 1, I) are omitted
      expect(code).not.toMatch(/[01OI]/);
    });

    it('supports prefix formatting', () => {
      const code = generateRoomCode('KS-');
      expect(code.startsWith('KS-')).toBe(true);
      expect(code).toHaveLength(9);
    });

    it('generates unique codes across successive calls', () => {
      const set = new Set<string>();
      for (let i = 0; i < 50; i++) {
        set.add(generateRoomCode());
      }
      expect(set.size).toBe(50);
    });
  });

  describe('DEFAULT_ROOM_CONFIG & BOT_PRESETS', () => {
    it('provides sensible default room configuration', () => {
      expect(DEFAULT_ROOM_CONFIG.mode).toBe('words');
      expect(DEFAULT_ROOM_CONFIG.targetWords).toBe(25);
      expect(DEFAULT_ROOM_CONFIG.maxPlayers).toBe(8);
      expect(DEFAULT_ROOM_CONFIG.isPrivate).toBe(true);
    });

    it('includes a varied ladder of bot presets', () => {
      expect(BOT_PRESETS).toHaveLength(4);
      expect(BOT_PRESETS.map((b) => b.difficulty)).toEqual([
        'easy',
        'medium',
        'hard',
        'demon',
      ]);
      expect(BOT_PRESETS[0].targetWpm).toBeLessThan(BOT_PRESETS[1].targetWpm);
      expect(BOT_PRESETS[1].targetWpm).toBeLessThan(BOT_PRESETS[2].targetWpm);
      expect(BOT_PRESETS[2].targetWpm).toBeLessThan(BOT_PRESETS[3].targetWpm);
    });
  });

  describe('validateRaceSubmission (Anti-Cheat)', () => {
    const passage = 'The quick brown fox jumps over the lazy dog and runs away.';

    it('accepts legitimate human submissions', () => {
      const submission: RaceSubmission = {
        roomCode: 'AB3K9P',
        participantId: 'p1',
        finalWpm: 92,
        accuracy: 98,
        durationSeconds: 15.2,
        totalCharacters: passage.length,
        correctCharacters: passage.length - 2,
        incorrectCharacters: 2,
      };

      const result = validateRaceSubmission(submission, passage);
      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('rejects submissions with impossibly short duration', () => {
      const submission: RaceSubmission = {
        roomCode: 'AB3K9P',
        participantId: 'p1',
        finalWpm: 120,
        accuracy: 100,
        durationSeconds: 0.2, // Impossible
        totalCharacters: passage.length,
        correctCharacters: passage.length,
        incorrectCharacters: 0,
      };

      const result = validateRaceSubmission(submission, passage);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('impossibly short');
    });

    it('rejects superhuman speed > 320 WPM', () => {
      const submission: RaceSubmission = {
        roomCode: 'AB3K9P',
        participantId: 'p1',
        finalWpm: 450, // Macro/bot
        accuracy: 100,
        durationSeconds: 3,
        totalCharacters: passage.length,
        correctCharacters: passage.length,
        incorrectCharacters: 0,
      };

      const result = validateRaceSubmission(submission, passage);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('maximum human threshold');
    });

    it('rejects negative WPM or invalid accuracy', () => {
      const invalidWpm: RaceSubmission = {
        roomCode: 'AB3K9P',
        participantId: 'p1',
        finalWpm: -10,
        accuracy: 90,
        durationSeconds: 10,
        totalCharacters: passage.length,
        correctCharacters: passage.length,
        incorrectCharacters: 0,
      };

      expect(validateRaceSubmission(invalidWpm, passage).isValid).toBe(false);

      const invalidAcc: RaceSubmission = {
        roomCode: 'AB3K9P',
        participantId: 'p1',
        finalWpm: 80,
        accuracy: 110,
        durationSeconds: 10,
        totalCharacters: passage.length,
        correctCharacters: passage.length,
        incorrectCharacters: 0,
      };

      expect(validateRaceSubmission(invalidAcc, passage).isValid).toBe(false);
    });

    it('rejects submissions with insufficient typed characters for the passage', () => {
      const submission: RaceSubmission = {
        roomCode: 'AB3K9P',
        participantId: 'p1',
        finalWpm: 90,
        accuracy: 95,
        durationSeconds: 12,
        totalCharacters: 10, // Too few for a 58-character passage
        correctCharacters: 10,
        incorrectCharacters: 0,
      };

      const result = validateRaceSubmission(submission, passage);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Typed characters');
    });
  });

  describe('calculateBotProgress', () => {
    const passageLength = 150; // chars (~30 words)

    it('returns 0 progress at 0 seconds', () => {
      const tick = calculateBotProgress(0, 60, passageLength);
      expect(tick.progress).toBe(0);
      expect(tick.isFinished).toBe(false);
    });

    it('advances progress smoothly over time based on target WPM', () => {
      const tick5s = calculateBotProgress(5, 60, passageLength); // 60 WPM = 5 chars/sec = ~25 chars / 150 = ~16%
      expect(tick5s.progress).toBeGreaterThan(10);
      expect(tick5s.progress).toBeLessThan(30);
      expect(tick5s.currentWpm).toBeGreaterThan(40);
      expect(tick5s.isFinished).toBe(false);

      const tick15s = calculateBotProgress(15, 60, passageLength); // ~75 chars / 150 = ~50%
      expect(tick15s.progress).toBeGreaterThan(tick5s.progress);
    });

    it('caps progress at 100% and flags isFinished when target reached', () => {
      const tickLong = calculateBotProgress(100, 60, passageLength);
      expect(tickLong.progress).toBe(100);
      expect(tickLong.isFinished).toBe(true);
    });
  });
});
