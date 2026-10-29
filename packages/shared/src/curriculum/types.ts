import { CourseLevel } from '../types';

export type FingerName =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'thumb'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky';

export type HandName = 'left' | 'right';

export type ReachMotion =
  | 'home'
  | 'reach-up'
  | 'reach-down'
  | 'reach-left'
  | 'reach-right'
  | 'reach-up-left'
  | 'reach-up-right'
  | 'reach-down-left'
  | 'reach-down-right'
  | 'thumb-press';

export interface KeyFingerGuide {
  char: string;
  display: string;
  finger: FingerName;
  hand: HandName;
  row: 'number' | 'top' | 'home' | 'bottom' | 'space';
  colorClass: string;
  homeKey: string;
  motion: ReachMotion;
  instruction: string;
}

export type LessonCategory = 'intro' | 'words' | 'sentences' | 'milestone';

export interface LessonExercise {
  id: string;
  level: CourseLevel;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  targetKeys: string[];
  passage: string;
  minAccuracy: number; // e.g. 95%
  minWpm: number; // 1-star threshold
  twoStarWpm: number;
  threeStarWpm: number;
  category: LessonCategory;
}

export interface CourseLevelDefinition {
  id: CourseLevel;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  lessons: LessonExercise[];
}

export interface UserLessonProgress {
  lessonId: string;
  completed: boolean;
  stars: 0 | 1 | 2 | 3;
  bestWpm: number;
  bestAccuracy: number;
  completedAt?: number;
}
