import {
  Achievement,
  DailyGoal,
  GamificationState,
  UserLevelProgress,
} from './types';

const GAMIFICATION_STORAGE_KEY = 'keysmasher_gamification_state';

/**
 * Level titles mapped to player milestones.
 */
export function getLevelTitle(level: number): string {
  if (level >= 75) return 'Legendary KeySmasher';
  if (level >= 50) return 'Grandmaster Smasher';
  if (level >= 35) return 'Apex Speed Demon';
  if (level >= 20) return 'Keyboard Virtuoso';
  if (level >= 10) return 'Velocity Typist';
  if (level >= 5) return 'Cadence Striker';
  return 'Home Row Trainee';
}

/**
 * Returns the cumulative XP required to reach a specific level.
 * Formula: Progressive curve where early levels are fast and higher levels scale smoothly.
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += Math.floor(150 * Math.pow(l, 1.25));
  }
  return total;
}

/**
 * Computes the user's level, progress percentage, and title from total accumulated XP.
 */
export function computeLevelProgress(totalXp: number): UserLevelProgress {
  const safeXp = Math.max(0, Math.floor(totalXp));

  let level = 1;
  while (getXpRequiredForLevel(level + 1) <= safeXp) {
    level += 1;
  }

  const currentLevelBaseXp = getXpRequiredForLevel(level);
  const nextLevelTotalXp = getXpRequiredForLevel(level + 1);
  const xpNeededForThisLevel = nextLevelTotalXp - currentLevelBaseXp;
  const xpEarnedInThisLevel = safeXp - currentLevelBaseXp;

  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpEarnedInThisLevel / xpNeededForThisLevel) * 100))
  );

  return {
    level,
    totalXp: safeXp,
    currentLevelXp: xpEarnedInThisLevel,
    nextLevelRequiredXp: xpNeededForThisLevel,
    progressPercent,
    title: getLevelTitle(level),
  };
}

/**
 * Calculates XP earned from a completed practice speed test.
 */
export function calculateSessionXp(session: {
  netWpm: number;
  accuracy: number;
  totalCharacters: number;
}): number {
  const baseWords = Math.floor(session.totalCharacters / 5);
  const speedBonus = Math.floor(session.netWpm * 0.4);

  let accuracyMultiplier = 1.0;
  if (session.accuracy >= 100) accuracyMultiplier = 1.5;
  else if (session.accuracy >= 98) accuracyMultiplier = 1.25;
  else if (session.accuracy >= 95) accuracyMultiplier = 1.1;
  else if (session.accuracy < 90) accuracyMultiplier = 0.8;

  const total = Math.floor((baseWords + speedBonus) * accuracyMultiplier);
  return Math.max(10, total);
}

/**
 * Calculates XP earned from an Arena multiplayer battle.
 */
export function calculateRaceXp(
  placement: number,
  netWpm: number,
  accuracy: number
): number {
  let placementBonus = 25;
  if (placement === 1) placementBonus = 120;
  else if (placement === 2) placementBonus = 80;
  else if (placement === 3) placementBonus = 50;

  const speedBonus = Math.floor(netWpm * 0.5);
  const accuracyBonus = Math.floor(accuracy * 0.5);

  return placementBonus + speedBonus + accuracyBonus;
}

/**
 * Calculates XP earned from completing an Academy lesson.
 */
export function calculateLessonXp(stars: number, accuracy: number): number {
  let starBonus = 30;
  if (stars === 3) starBonus = 100;
  else if (stars === 2) starBonus = 60;

  const accuracyBonus = Math.floor(accuracy * 0.3);
  return starBonus + accuracyBonus;
}

export const INITIAL_DAILY_GOALS: DailyGoal[] = [
  {
    id: 'daily-cadence',
    title: 'Daily Cadence',
    description: 'Complete 3 typing tests or academy lessons',
    target: 3,
    current: 0,
    isCompleted: false,
    xpReward: 100,
  },
  {
    id: 'daily-accuracy',
    title: 'Flawless Precision',
    description: 'Score ≥ 97% accuracy in any test',
    target: 1,
    current: 0,
    isCompleted: false,
    xpReward: 150,
  },
  {
    id: 'daily-arena',
    title: 'Arena Gladiator',
    description: 'Finish 1 multiplayer battle or bot race',
    target: 1,
    current: 0,
    isCompleted: false,
    xpReward: 200,
  },
];

export const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'progress' | 'unlockedAt'>[] = [
  {
    id: 'first-strike',
    title: 'First Strike',
    description: 'Complete your first verified typing test',
    category: 'volume',
    xpReward: 50,
    iconName: 'Zap',
  },
  {
    id: 'speed-60',
    title: 'The 60 Barrier',
    description: 'Achieve 60+ Net WPM in a practice test',
    category: 'speed',
    xpReward: 100,
    iconName: 'Flame',
  },
  {
    id: 'century-club',
    title: 'Century Club',
    description: 'Break 100+ Net WPM touch-typing speed',
    category: 'speed',
    xpReward: 250,
    iconName: 'Trophy',
  },
  {
    id: 'supersonic',
    title: 'Supersonic',
    description: 'Reach 140+ Net WPM (Grandmaster speed)',
    category: 'speed',
    xpReward: 500,
    iconName: 'Sparkles',
  },
  {
    id: 'dead-eye',
    title: 'Dead-Eye Precision',
    description: 'Complete a test with 100% flawless accuracy',
    category: 'accuracy',
    xpReward: 150,
    iconName: 'Target',
  },
  {
    id: 'streak-3',
    title: 'Triple Threat',
    description: 'Maintain a 3-day daily typing streak',
    category: 'streak',
    xpReward: 100,
    iconName: 'Flame',
  },
  {
    id: 'streak-7',
    title: 'Unstoppable Rhythm',
    description: 'Maintain a 7-day daily typing streak',
    category: 'streak',
    xpReward: 300,
    iconName: 'Crown',
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Complete 25 total typing sessions',
    category: 'volume',
    xpReward: 200,
    iconName: 'Award',
  },
  {
    id: 'academy-scholar',
    title: 'Academy Scholar',
    description: 'Earn 10 stars across Academy curriculum lessons',
    category: 'volume',
    xpReward: 200,
    iconName: 'BookOpen',
  },
  {
    id: 'first-blood',
    title: 'First Blood',
    description: 'Win 1st place in an Arena Battle',
    category: 'competition',
    xpReward: 200,
    iconName: 'Swords',
  },
  {
    id: 'podium-master',
    title: 'Podium Regular',
    description: 'Earn 5 podium finishes in Arena Battles',
    category: 'competition',
    xpReward: 300,
    iconName: 'Medal',
  },
  {
    id: 'cadence-virtuoso',
    title: 'Cadence Virtuoso',
    description: 'Achieve 95%+ consistency score in any test',
    category: 'accuracy',
    xpReward: 150,
    iconName: 'Activity',
  },
];

/**
 * Loads stored gamification state from localStorage with safe fallback.
 */
export function getStoredGamificationState(): GamificationState {
  const today = new Date().toISOString().split('T')[0];
  const defaultState: GamificationState = {
    totalXp: 150, // Starting bonus
    streakDays: 1,
    lastActiveDate: today,
    dailyGoals: INITIAL_DAILY_GOALS,
    dailyGoalsDate: today,
    unlockedAchievementIds: [],
    achievementUnlockDates: {},
  };

  if (typeof window === 'undefined') return defaultState;

  try {
    const raw = localStorage.getItem(GAMIFICATION_STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed: GamificationState = JSON.parse(raw);

    // If day changed, refresh daily goals while preserving streaks
    if (parsed.dailyGoalsDate !== today) {
      parsed.dailyGoals = INITIAL_DAILY_GOALS;
      parsed.dailyGoalsDate = today;

      // Update streak
      const lastDate = new Date(parsed.lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.round(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)
      );

      if (diffDays === 1) {
        parsed.streakDays += 1;
      } else if (diffDays > 1) {
        parsed.streakDays = 1;
      }
      parsed.lastActiveDate = today;
      localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(parsed));
    }

    return parsed;
  } catch {
    return defaultState;
  }
}

/**
 * Saves gamification state into persistent localStorage.
 */
export function saveGamificationState(state: GamificationState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Graceful fallback
  }
}

/**
 * Evaluates achievements given the typist's historical performance metrics.
 */
export function evaluateAllAchievements(
  state: GamificationState,
  stats: {
    peakWpm: number;
    totalSessions: number;
    highestAccuracy: number;
    academyStars: number;
    arenaWins: number;
    arenaPodiums: number;
    peakConsistency?: number;
  }
): { achievements: Achievement[]; newUnlocks: Achievement[] } {
  const newUnlocks: Achievement[] = [];
  const achievements: Achievement[] = ALL_ACHIEVEMENTS.map((def) => {
    const isUnlocked = state.unlockedAchievementIds.includes(def.id);
    let progress = isUnlocked ? 100 : 0;
    let shouldUnlock = isUnlocked;

    switch (def.id) {
      case 'first-strike':
        progress = stats.totalSessions > 0 ? 100 : 0;
        shouldUnlock = stats.totalSessions >= 1;
        break;
      case 'speed-60':
        progress = Math.min(100, Math.round((stats.peakWpm / 60) * 100));
        shouldUnlock = stats.peakWpm >= 60;
        break;
      case 'century-club':
        progress = Math.min(100, Math.round((stats.peakWpm / 100) * 100));
        shouldUnlock = stats.peakWpm >= 100;
        break;
      case 'supersonic':
        progress = Math.min(100, Math.round((stats.peakWpm / 140) * 100));
        shouldUnlock = stats.peakWpm >= 140;
        break;
      case 'dead-eye':
        progress = stats.highestAccuracy >= 100 ? 100 : Math.round(stats.highestAccuracy);
        shouldUnlock = stats.highestAccuracy >= 100;
        break;
      case 'streak-3':
        progress = Math.min(100, Math.round((state.streakDays / 3) * 100));
        shouldUnlock = state.streakDays >= 3;
        break;
      case 'streak-7':
        progress = Math.min(100, Math.round((state.streakDays / 7) * 100));
        shouldUnlock = state.streakDays >= 7;
        break;
      case 'centurion':
        progress = Math.min(100, Math.round((stats.totalSessions / 25) * 100));
        shouldUnlock = stats.totalSessions >= 25;
        break;
      case 'academy-scholar':
        progress = Math.min(100, Math.round((stats.academyStars / 10) * 100));
        shouldUnlock = stats.academyStars >= 10;
        break;
      case 'first-blood':
        progress = stats.arenaWins > 0 ? 100 : 0;
        shouldUnlock = stats.arenaWins >= 1;
        break;
      case 'podium-master':
        progress = Math.min(100, Math.round((stats.arenaPodiums / 5) * 100));
        shouldUnlock = stats.arenaPodiums >= 5;
        break;
      case 'cadence-virtuoso':
        progress = Math.min(100, Math.round(((stats.peakConsistency || 0) / 95) * 100));
        shouldUnlock = (stats.peakConsistency || 0) >= 95;
        break;
      default:
        break;
    }

    const item: Achievement = {
      ...def,
      unlocked: shouldUnlock,
      progress,
      unlockedAt: state.achievementUnlockDates[def.id] || (shouldUnlock ? new Date().toISOString() : undefined),
    };

    if (!isUnlocked && shouldUnlock) {
      newUnlocks.push(item);
    }

    return item;
  });

  return { achievements, newUnlocks };
}
