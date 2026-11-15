export type AchievementCategory =
  | 'speed'
  | 'accuracy'
  | 'volume'
  | 'streak'
  | 'competition';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 100 percentage
  iconName: string;
}

export interface DailyGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  isCompleted: boolean;
  xpReward: number;
}

export interface UserLevelProgress {
  level: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelRequiredXp: number;
  progressPercent: number;
  title: string;
}

export interface GamificationState {
  totalXp: number;
  streakDays: number;
  lastActiveDate: string;
  dailyGoals: DailyGoal[];
  dailyGoalsDate: string;
  unlockedAchievementIds: string[];
  achievementUnlockDates: Record<string, string>;
}
