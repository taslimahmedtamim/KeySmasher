import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  analyzeTypingDiagnostics,
  generateWeakKeyDrillPassage,
  RawKeySessionStat,
} from '@keysmasher/shared';
import { KeyboardHeatmap } from '../features/coach/components/KeyboardHeatmap';
import { SmartCoachCard } from '../features/coach/components/SmartCoachCard';
import { PostTestCoachTip } from '../features/coach/components/PostTestCoachTip';
import { ExtendedTypingMetrics } from '../features/typing/types';

describe('Feature H: Smart Typing Coach & Weak-Key Diagnostics', () => {
  describe('Diagnostic Engine Unit Tests', () => {
    it('accurately computes per-key accuracy, confusion matrix, and ranks weakest keys', () => {
      const mockKeyStats: Record<string, RawKeySessionStat> = {
        e: { attempts: 50, errors: 2, confusion: { w: 2 } },
        p: { attempts: 20, errors: 6, confusion: { o: 4, '[': 2 } }, // 70% acc
        r: { attempts: 30, errors: 9, confusion: { t: 5, e: 4 } }, // 70% acc, 9 errors
        a: { attempts: 40, errors: 0, confusion: {} }, // 100% acc
      };

      const result = analyzeTypingDiagnostics(mockKeyStats, {
        avgWpm: 65,
        avgAccuracy: 88,
        avgConsistency: 85,
        totalTests: 5,
      });

      expect(result.totalAnalyzedKeystrokes).toBe(140);
      expect(result.totalAnalyzedErrors).toBe(17);
      expect(result.overallAccuracy).toBe(88);

      // Weak keys should be sorted by highest errors then lowest accuracy
      expect(result.weakKeys.length).toBeGreaterThanOrEqual(2);
      expect(result.weakKeys[0].char).toBe('r'); // 9 errors
      expect(result.weakKeys[0].accuracy).toBe(70);
      expect(result.weakKeys[0].commonMistakes).toContain('T');
      expect(result.weakKeys[0].suggestedLessonId).toBe('elementary-2');

      expect(result.weakKeys[1].char).toBe('p'); // 6 errors
      expect(result.weakKeys[1].suggestedLessonId).toBe('elementary-5');
    });

    it('calculates Left vs Right hand balance and identifies hand asymmetry', () => {
      const mockKeyStats: Record<string, RawKeySessionStat> = {
        // Left hand keys (a, s, d, f)
        a: { attempts: 50, errors: 10 }, // 80%
        s: { attempts: 50, errors: 10 }, // 80%
        // Right hand keys (j, k, l, ;)
        j: { attempts: 50, errors: 0 }, // 100%
        k: { attempts: 50, errors: 0 }, // 100%
      };

      const result = analyzeTypingDiagnostics(mockKeyStats);

      expect(result.handBalance.leftKeystrokes).toBe(100);
      expect(result.handBalance.leftErrors).toBe(20);
      expect(result.handBalance.leftAccuracy).toBe(80);

      expect(result.handBalance.rightKeystrokes).toBe(100);
      expect(result.handBalance.rightErrors).toBe(0);
      expect(result.handBalance.rightAccuracy).toBe(100);

      expect(result.handBalance.dominantHand).toBe('right-favored');
    });

    it('generates high-priority coaching recommendations for low accuracy (<94%)', () => {
      const mockKeyStats: Record<string, RawKeySessionStat> = {
        x: { attempts: 20, errors: 8 }, // 60%
      };

      const result = analyzeTypingDiagnostics(mockKeyStats, {
        avgWpm: 75,
        avgAccuracy: 60,
        avgConsistency: 70,
        totalTests: 3,
      });

      const accuracyRec = result.recommendations.find((r) => r.type === 'accuracy');
      expect(accuracyRec).toBeDefined();
      expect(accuracyRec?.priority).toBe('high');
      expect(accuracyRec?.title).toContain('Precision Over Speed');
    });
  });

  describe('Targeted Weak-Key Drill Generator', () => {
    it('synthesizes a targeted drill passage containing words with weak keys', () => {
      const passage = generateWeakKeyDrillPassage(['p', 'q', 'z'], 15);
      const words = passage.split(' ');

      expect(words.length).toBe(15);
      // At least several words should contain the weak letters
      const containsWeakKey = words.some((w) =>
        w.includes('p') || w.includes('q') || w.includes('z')
      );
      expect(containsWeakKey).toBe(true);
    });

    it('falls back to a balanced pangram drill if no weak keys are provided', () => {
      const passage = generateWeakKeyDrillPassage([]);
      expect(passage).toContain('quick brown fox');
    });
  });

  describe('KeyboardHeatmap Component', () => {
    it('renders keyboard keys and highlights accuracy tiers', () => {
      const mockKeyAccuracyMap = {
        e: {
          char: 'e',
          display: 'E',
          attempts: 100,
          errors: 1,
          accuracy: 99,
          finger: 'left-middle' as const,
          hand: 'left' as const,
          confusion: {},
        },
        z: {
          char: 'z',
          display: 'Z',
          attempts: 25,
          errors: 5,
          accuracy: 80,
          finger: 'left-pinky' as const,
          hand: 'left' as const,
          confusion: { x: 3 },
        },
      };

      render(
        <KeyboardHeatmap
          keyAccuracyMap={mockKeyAccuracyMap}
          weakKeys={[
            {
              char: 'z',
              display: 'Z',
              attempts: 25,
              errors: 5,
              accuracy: 80,
              errorRate: 20,
              finger: 'left-pinky',
              hand: 'left',
              instruction: 'Left pinky reaches to Z',
              commonMistakes: ['X'],
            },
          ]}
        />
      );

      expect(screen.getByText('QWERTY Keystroke Precision Heatmap')).toBeInTheDocument();

      // Click key 'Z' to inspect telemetry drawer
      const zKeyButton = screen.getByTitle('Key Z: 80%');
      fireEvent.click(zKeyButton);

      expect(screen.getByText('Key Telemetry: [Z]')).toBeInTheDocument();
      expect(screen.getByText('Weak Key Diagnostic')).toBeInTheDocument();
      expect(screen.getAllByText(/Left pinky/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/\[X\] \(3x\)/i)).toBeInTheDocument();
    });
  });

  describe('SmartCoachCard Component', () => {
    it('renders typist health score, hand balance, and weak keys on dashboard', () => {
      const analysis = analyzeTypingDiagnostics(
        {
          p: { attempts: 30, errors: 8, confusion: { o: 5 } },
          t: { attempts: 40, errors: 1 },
        },
        { avgWpm: 70, avgAccuracy: 92, avgConsistency: 88, totalTests: 4 }
      );

      render(<SmartCoachCard coach={analysis} />);

      expect(screen.getByText('Smart Typist Coach & Weak-Key Diagnostics')).toBeInTheDocument();
      expect(screen.getByText('Overall Typist Form')).toBeInTheDocument();
      expect(screen.getByText('Hand Precision Balance')).toBeInTheDocument();
      expect(screen.getByText('Weak-Key Bottlenecks')).toBeInTheDocument();
      expect(screen.getByText('Start Weak-Key Drill')).toBeInTheDocument();

      // Weak key P should be visible
      expect(screen.getAllByText('P').length).toBeGreaterThanOrEqual(1);
    });

    it('launches weak key drill when Start Weak-Key Drill button is clicked', () => {
      const analysis = analyzeTypingDiagnostics({
        r: { attempts: 20, errors: 6 },
      });

      render(<SmartCoachCard coach={analysis} />);

      const drillBtn = screen.getByRole('button', { name: /start weak-key drill/i });
      fireEvent.click(drillBtn);

      const storedPassage = window.sessionStorage.getItem('keysmasher_drill_passage');
      expect(storedPassage).toBeTruthy();
    });
  });

  describe('PostTestCoachTip Component', () => {
    it('renders immediate micro-coaching advice on practice results screen', () => {
      const mockMetrics: ExtendedTypingMetrics = {
        totalTypedCharacters: 120,
        correctCharacters: 110,
        incorrectCharacters: 10,
        elapsedSeconds: 30,
        rawWpm: 75,
        netWpm: 70,
        accuracy: 92,
        cpm: 350,
        timeRemaining: 0,
        completedWordsCount: 25,
        totalWordsCount: 25,
        missedCharacters: 0,
        extraCharacters: 0,
        consistency: 84,
        keyStats: {
          p: { attempts: 15, errors: 5, confusion: { o: 3 } },
        },
      };

      const handleApplyDrill = vi.fn();

      render(<PostTestCoachTip metrics={mockMetrics} onApplyDrill={handleApplyDrill} />);

      expect(screen.getByText('Coach Immediate Takeaway')).toBeInTheDocument();
      expect(screen.getByText(/Bottleneck key/i)).toBeInTheDocument();
      expect(screen.getByText(/\[P\]/i)).toBeInTheDocument();

      const drillBtn = screen.getByRole('button', { name: /drill missed keys/i });
      fireEvent.click(drillBtn);

      expect(handleApplyDrill).toHaveBeenCalledTimes(1);
    });
  });
});
