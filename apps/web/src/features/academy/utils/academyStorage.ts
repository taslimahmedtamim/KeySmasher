import { COURSES, UserLessonProgress } from '@keysmasher/shared';

const STORAGE_KEY = 'keysmasher_academy_progress';

let memoryProgress: Record<string, UserLessonProgress> = {};

function getRawStorage(): Record<string, UserLessonProgress> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = window.localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    }
  } catch {
    // Fallback to in-memory
  }
  return memoryProgress;
}

function setRawStorage(data: Record<string, UserLessonProgress>): void {
  memoryProgress = data;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    // Ignore quota/permission
  }
}

export function getAllLessonProgress(): Record<string, UserLessonProgress> {
  return getRawStorage();
}

export function getLessonProgress(lessonId: string): UserLessonProgress | null {
  const all = getRawStorage();
  return all[lessonId] || null;
}

export function saveLessonProgress(
  lessonId: string,
  stats: { wpm: number; accuracy: number; stars: 0 | 1 | 2 | 3 }
): UserLessonProgress {
  const all = getRawStorage();
  const existing = all[lessonId];

  const updated: UserLessonProgress = {
    lessonId,
    completed: stats.stars > 0,
    stars: Math.max(existing?.stars || 0, stats.stars) as 0 | 1 | 2 | 3,
    bestWpm: Math.max(existing?.bestWpm || 0, stats.wpm),
    bestAccuracy: Math.max(existing?.bestAccuracy || 0, stats.accuracy),
    completedAt: Date.now(),
  };

  all[lessonId] = updated;
  setRawStorage(all);
  return updated;
}

/**
 * Determines whether a specific lesson is unlocked for the user.
 * Rule: Lesson 1 (l1-1) is always unlocked. Each next lesson unlocks once the previous is completed.
 */
export function isLessonUnlocked(lessonId: string): boolean {
  // First lesson of Level 1 is always unlocked
  if (lessonId === 'l1-1') return true;

  // Find all lessons in order
  const allLessons = COURSES.flatMap((c) => c.lessons);
  const targetIndex = allLessons.findIndex((l) => l.id === lessonId);
  if (targetIndex <= 0) return true;

  // Check previous lesson status
  const prevLesson = allLessons[targetIndex - 1];
  const progress = getLessonProgress(prevLesson.id);
  return Boolean(progress && progress.completed && progress.stars > 0);
}

export function getLevelProgressStats(levelId: string): {
  earnedStars: number;
  totalStars: number;
  completedCount: number;
  totalLessons: number;
} {
  const course = COURSES.find((c) => c.id === levelId);
  if (!course) {
    return { earnedStars: 0, totalStars: 0, completedCount: 0, totalLessons: 0 };
  }

  const allProgress = getRawStorage();
  let earnedStars = 0;
  let completedCount = 0;

  course.lessons.forEach((lesson) => {
    const prog = allProgress[lesson.id];
    if (prog) {
      earnedStars += prog.stars;
      if (prog.completed) {
        completedCount++;
      }
    }
  });

  return {
    earnedStars,
    totalStars: course.lessons.length * 3,
    completedCount,
    totalLessons: course.lessons.length,
  };
}
