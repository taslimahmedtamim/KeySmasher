'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Achievement,
  DailyGoal,
  GamificationState,
  UserLevelProgress,
} from './types';
import {
  calculateLessonXp,
  calculateRaceXp,
  calculateSessionXp,
  computeLevelProgress,
  evaluateAllAchievements,
  getStoredGamificationState,
  saveGamificationState,
  ALL_ACHIEVEMENTS,
  INITIAL_DAILY_GOALS,
} from './gamificationEngine';
import { getStoredSessions } from '@/features/typing/utils/historyStorage';
import { getAllLessonProgress } from '@/features/academy/utils/academyStorage';
import { getStoredRaceHistory } from '@/features/leaderboard';

interface GamificationContextValue {
  state: GamificationState;
  levelProgress: UserLevelProgress;
  achievements: Achievement[];
  dailyGoals: DailyGoal[];
  awardXp: (amount: number, reason: string) => void;
  recordSessionCompletion: (session: {
    netWpm: number;
    accuracy: number;
    totalCharacters: number;
    consistency?: number;
  }) => void;
  recordRaceCompletion: (race: {
    placement: number;
    netWpm: number;
    accuracy: number;
  }) => void;
  recordLessonCompletion: (lesson: { stars: number; accuracy: number }) => void;
  isAchievementsModalOpen: boolean;
  openAchievementsModal: () => void;
  closeAchievementsModal: () => void;
  recentXpGain: { amount: number; reason: string } | null;
  recentUnlock: Achievement | null;
  dismissToast: () => void;
}

const GamificationContext = createContext<GamificationContextValue | undefined>(undefined);

const DEFAULT_GAMIFICATION_STATE: GamificationState = {
  totalXp: 150,
  streakDays: 1,
  lastActiveDate: '2026-11-16',
  dailyGoals: INITIAL_DAILY_GOALS,
  dailyGoalsDate: '2026-11-16',
  unlockedAchievementIds: [],
  achievementUnlockDates: {},
};

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GamificationState>(DEFAULT_GAMIFICATION_STATE);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [recentXpGain, setRecentXpGain] = useState<{ amount: number; reason: string } | null>(null);
  const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null);

  // Sync with persistent localStorage on mount
  useEffect(() => {
    setState(getStoredGamificationState());
  }, []);

  const dismissToast = useCallback(() => {
    setRecentXpGain(null);
    setRecentUnlock(null);
  }, []);

  // Compute live achievements based on all local history
  const evaluateCurrentAchievements = useCallback(
    (currentState: GamificationState) => {
      const sessions = getStoredSessions();
      const lessons = Object.values(getAllLessonProgress());
      const races = getStoredRaceHistory();

      let peakWpm = 0;
      let highestAccuracy = 0;
      let peakConsistency = 0;

      sessions.forEach((s) => {
        if (s.netWpm > peakWpm) peakWpm = s.netWpm;
        if (s.accuracy > highestAccuracy) highestAccuracy = s.accuracy;
        if (s.consistency && s.consistency > peakConsistency) {
          peakConsistency = s.consistency;
        }
      });

      races.forEach((r) => {
        if (r.netWpm > peakWpm) peakWpm = r.netWpm;
      });

      const academyStars = lessons.reduce((acc, l) => acc + (l.stars || 0), 0);
      const arenaWins = races.filter((r) => r.placement === 1).length;
      const arenaPodiums = races.filter((r) => r.placement <= 3).length;

      return evaluateAllAchievements(currentState, {
        peakWpm,
        totalSessions: sessions.length,
        highestAccuracy,
        academyStars,
        arenaWins,
        arenaPodiums,
        peakConsistency,
      });
    },
    []
  );

  const awardXp = useCallback((amount: number, reason: string) => {
    setState((prev) => {
      const updatedXp = prev.totalXp + amount;
      const updatedState = { ...prev, totalXp: updatedXp };
      saveGamificationState(updatedState);
      return updatedState;
    });

    setRecentXpGain({ amount, reason });
    setTimeout(() => {
      setRecentXpGain(null);
    }, 3500);
  }, []);

  // Record practice test completion
  const recordSessionCompletion = useCallback(
    (session: {
      netWpm: number;
      accuracy: number;
      totalCharacters: number;
      consistency?: number;
    }) => {
      const earnedXp = calculateSessionXp(session);

      setState((prev) => {
        let additionalXp = earnedXp;

        // Tick Daily Goals
        const updatedGoals = prev.dailyGoals.map((goal) => {
          if (goal.isCompleted) return goal;

          let newCurrent = goal.current;
          let nowCompleted = false;

          if (goal.id === 'daily-cadence') {
            newCurrent = Math.min(goal.target, goal.current + 1);
            nowCompleted = newCurrent >= goal.target;
          } else if (goal.id === 'daily-accuracy' && session.accuracy >= 97) {
            newCurrent = 1;
            nowCompleted = true;
          }

          if (nowCompleted) {
            additionalXp += goal.xpReward;
          }

          return {
            ...goal,
            current: newCurrent,
            isCompleted: nowCompleted || goal.isCompleted,
          };
        });

        const nextState: GamificationState = {
          ...prev,
          totalXp: prev.totalXp + additionalXp,
          dailyGoals: updatedGoals,
        };

        // Check achievement unlocks
        const { newUnlocks } = evaluateCurrentAchievements(nextState);
        if (newUnlocks.length > 0) {
          const newlyUnlockedIds = newUnlocks.map((u) => u.id);
          nextState.unlockedAchievementIds = [
            ...prev.unlockedAchievementIds,
            ...newlyUnlockedIds,
          ];
          const newDates = { ...prev.achievementUnlockDates };
          const nowStr = new Date().toISOString();
          newlyUnlockedIds.forEach((id) => {
            newDates[id] = nowStr;
            const reward = newUnlocks.find((x) => x.id === id)?.xpReward || 0;
            nextState.totalXp += reward;
          });
          nextState.achievementUnlockDates = newDates;

          setRecentUnlock(newUnlocks[0]);
          setTimeout(() => setRecentUnlock(null), 4000);
        }

        saveGamificationState(nextState);
        return nextState;
      });

      setRecentXpGain({ amount: earnedXp, reason: 'Speed Test Completed' });
      setTimeout(() => setRecentXpGain(null), 3500);
    },
    [evaluateCurrentAchievements]
  );

  // Record Arena race completion
  const recordRaceCompletion = useCallback(
    (race: { placement: number; netWpm: number; accuracy: number }) => {
      const earnedXp = calculateRaceXp(race.placement, race.netWpm, race.accuracy);

      setState((prev) => {
        let additionalXp = earnedXp;

        // Tick Daily Goals
        const updatedGoals = prev.dailyGoals.map((goal) => {
          if (goal.isCompleted) return goal;

          let newCurrent = goal.current;
          let nowCompleted = false;

          if (goal.id === 'daily-cadence' || goal.id === 'daily-arena') {
            newCurrent = Math.min(goal.target, goal.current + 1);
            nowCompleted = newCurrent >= goal.target;
          } else if (goal.id === 'daily-accuracy' && race.accuracy >= 97) {
            newCurrent = 1;
            nowCompleted = true;
          }

          if (nowCompleted) {
            additionalXp += goal.xpReward;
          }

          return {
            ...goal,
            current: newCurrent,
            isCompleted: nowCompleted || goal.isCompleted,
          };
        });

        const nextState: GamificationState = {
          ...prev,
          totalXp: prev.totalXp + additionalXp,
          dailyGoals: updatedGoals,
        };

        const { newUnlocks } = evaluateCurrentAchievements(nextState);
        if (newUnlocks.length > 0) {
          const newlyUnlockedIds = newUnlocks.map((u) => u.id);
          nextState.unlockedAchievementIds = [
            ...prev.unlockedAchievementIds,
            ...newlyUnlockedIds,
          ];
          const newDates = { ...prev.achievementUnlockDates };
          const nowStr = new Date().toISOString();
          newlyUnlockedIds.forEach((id) => {
            newDates[id] = nowStr;
            const reward = newUnlocks.find((x) => x.id === id)?.xpReward || 0;
            nextState.totalXp += reward;
          });
          nextState.achievementUnlockDates = newDates;

          setRecentUnlock(newUnlocks[0]);
          setTimeout(() => setRecentUnlock(null), 4000);
        }

        saveGamificationState(nextState);
        return nextState;
      });

      setRecentXpGain({ amount: earnedXp, reason: `Arena Race P${race.placement} Finish` });
      setTimeout(() => setRecentXpGain(null), 3500);
    },
    [evaluateCurrentAchievements]
  );

  // Record Academy lesson completion
  const recordLessonCompletion = useCallback((lesson: { stars: number; accuracy: number }) => {
    const earnedXp = calculateLessonXp(lesson.stars, lesson.accuracy);
    awardXp(earnedXp, 'Academy Lesson Cleared');
  }, [awardXp]);

  const levelProgress = computeLevelProgress(state.totalXp);
  const { achievements } = evaluateCurrentAchievements(state);

  return (
    <GamificationContext.Provider
      value={{
        state,
        levelProgress,
        achievements,
        dailyGoals: state.dailyGoals,
        awardXp,
        recordSessionCompletion,
        recordRaceCompletion,
        recordLessonCompletion,
        isAchievementsModalOpen,
        openAchievementsModal: () => setIsAchievementsModalOpen(true),
        closeAchievementsModal: () => setIsAchievementsModalOpen(false),
        recentXpGain,
        recentUnlock,
        dismissToast,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

const fallbackState: GamificationState = {
  totalXp: 0,
  streakDays: 1,
  lastActiveDate: '',
  dailyGoals: INITIAL_DAILY_GOALS,
  dailyGoalsDate: '',
  unlockedAchievementIds: [],
  achievementUnlockDates: {},
};

const DEFAULT_FALLBACK_GAMIFICATION: GamificationContextValue = {
  state: fallbackState,
  levelProgress: computeLevelProgress(0),
  achievements: evaluateAllAchievements(fallbackState, {
    peakWpm: 0,
    totalSessions: 0,
    highestAccuracy: 0,
    academyStars: 0,
    arenaWins: 0,
    arenaPodiums: 0,
  }).achievements,
  dailyGoals: INITIAL_DAILY_GOALS,
  awardXp: () => {},
  recordSessionCompletion: () => {},
  recordRaceCompletion: () => {},
  recordLessonCompletion: () => {},
  isAchievementsModalOpen: false,
  openAchievementsModal: () => {},
  closeAchievementsModal: () => {},
  recentXpGain: null,
  recentUnlock: null,
  dismissToast: () => {},
};

export const useGamification = (): GamificationContextValue => {
  const context = useContext(GamificationContext);
  if (!context) {
    return DEFAULT_FALLBACK_GAMIFICATION;
  }
  return context;
};
