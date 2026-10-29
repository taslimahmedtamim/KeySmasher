import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  COURSES,
  getFingerForKey,
  getCourseById,
  getLessonById,
} from '@keysmasher/shared';
import { VisualKeyboard } from '@/features/academy/components/VisualKeyboard';
import {
  saveLessonProgress,
  getLessonProgress,
  isLessonUnlocked,
  getLevelProgressStats,
} from '@/features/academy/utils/academyStorage';
import LearnPage from '@/app/learn/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/learn',
}));

describe('Feature D & E: Learning Academy & Keyboard Finger Guidance', () => {
  describe('Curriculum Data Integrity', () => {
    it('contains all 5 tiered courses with ordered lessons', () => {
      expect(COURSES).toHaveLength(5);
      const levelIds = COURSES.map((c) => c.id);
      expect(levelIds).toEqual(['beginner', 'elementary', 'intermediate', 'advanced', 'expert']);

      const totalLessons = COURSES.reduce((acc, c) => acc + c.lessons.length, 0);
      expect(totalLessons).toBeGreaterThanOrEqual(24);
    });

    it('each lesson specifies minAccuracy, minWpm, and threeStarWpm targets', () => {
      COURSES.forEach((course) => {
        course.lessons.forEach((lesson) => {
          expect(lesson.minAccuracy).toBeGreaterThanOrEqual(90);
          expect(lesson.minWpm).toBeGreaterThan(0);
          expect(lesson.threeStarWpm).toBeGreaterThan(lesson.minWpm);
          expect(lesson.passage.length).toBeGreaterThan(0);
        });
      });
    });

    it('getCourseById and getLessonById return correct objects', () => {
      const beginnerCourse = getCourseById('beginner');
      expect(beginnerCourse).toBeDefined();
      expect(beginnerCourse?.title).toContain('Beginner');

      const lesson1 = getLessonById('l1-1');
      expect(lesson1).toBeDefined();
      expect(lesson1?.lesson.title).toContain('Home Row Index');
      expect(lesson1?.course.id).toBe('beginner');
    });
  });

  describe('Keyboard Finger Guidance & VisualKeyboard', () => {
    it('correctly assigns fingers to standard QWERTY keys', () => {
      expect(getFingerForKey('f')?.finger).toBe('left-index');
      expect(getFingerForKey('j')?.finger).toBe('right-index');
      expect(getFingerForKey('d')?.finger).toBe('left-middle');
      expect(getFingerForKey('k')?.finger).toBe('right-middle');
      expect(getFingerForKey('s')?.finger).toBe('left-ring');
      expect(getFingerForKey('l')?.finger).toBe('right-ring');
      expect(getFingerForKey('a')?.finger).toBe('left-pinky');
      expect(getFingerForKey(';')?.finger).toBe('right-pinky');
      expect(getFingerForKey(' ')?.finger).toBe('thumb');
    });

    it('renders VisualKeyboard with illuminated target key and finger name', () => {
      const { rerender } = render(<VisualKeyboard activeChar="f" />);

      expect(screen.getByText(/Target Key:/i)).toBeInTheDocument();
      expect(screen.getByText('Left Index')).toBeInTheDocument();

      // Check spacebar rendering
      rerender(<VisualKeyboard activeChar=" " />);
      expect(screen.getAllByText('Thumb').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('␣ Space')).toBeInTheDocument();
    });
  });

  describe('Progressive Unlocking & Academy Storage', () => {
    it('always unlocks lesson l1-1 first', () => {
      expect(isLessonUnlocked('l1-1')).toBe(true);
    });

    it('locks subsequent lessons until previous lesson is passed with at least 1 star', () => {
      // Prior to completion, l1-2 is locked
      expect(isLessonUnlocked('l1-2')).toBe(false);

      // Save a failed attempt (0 stars)
      saveLessonProgress('l1-1', { wpm: 10, accuracy: 80, stars: 0 });
      expect(isLessonUnlocked('l1-2')).toBe(false);

      // Save a passed attempt (2 stars)
      saveLessonProgress('l1-1', { wpm: 22, accuracy: 96, stars: 2 });
      const record = getLessonProgress('l1-1');
      expect(record?.completed).toBe(true);
      expect(record?.stars).toBe(2);

      // l1-2 is now unlocked!
      expect(isLessonUnlocked('l1-2')).toBe(true);
    });

    it('calculates level progress stats correctly', () => {
      const stats = getLevelProgressStats('beginner');
      expect(stats.totalLessons).toBe(6);
      expect(stats.totalStars).toBe(18);
      expect(stats.earnedStars).toBeGreaterThanOrEqual(2);
      expect(stats.completedCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Learn Catalog Page', () => {
    it('renders the academy catalog and level headers', () => {
      render(<LearnPage />);

      expect(screen.getByText('Learning Academy')).toBeInTheDocument();
      expect(screen.getByText(/Structured Touch Typing Curriculum/i)).toBeInTheDocument();
      expect(screen.getByText(/Academy Mastery/i)).toBeInTheDocument();
      expect(screen.getByText(/Stars Collected/i)).toBeInTheDocument();

      // Check for level titles
      expect(screen.getByText('Level 1: Beginner')).toBeInTheDocument();
      expect(screen.getByText('Level 2: Elementary')).toBeInTheDocument();
      expect(screen.getByText('Level 3: Intermediate')).toBeInTheDocument();
    });
  });
});
