'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  SavedTestSession,
  getStoredSessions,
} from '../typing/utils/historyStorage';
import { getAllLessonProgress } from '../academy/utils/academyStorage';
import { COURSES } from '@keysmasher/shared';
import {
  UserAnalyticsData,
  PersonalBestRecord,
  ProgressionPoint,
  AnalyticsSummary,
  AcademyMasterySummary,
} from './types';

// Realistic pre-seeded demo records for the Demo Typist ("SpeedDemon")
const DEMO_SEEDED_SESSIONS: SavedTestSession[] = [
  {
    id: 'demo-1',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 6, // 6 days ago
    mode: 'time',
    rawWpm: 92,
    netWpm: 88,
    accuracy: 96,
    cpm: 460,
    consistency: 84,
    elapsedSeconds: 60,
    difficulty: 'intermediate',
    errorCount: 3,
  },
  {
    id: 'demo-2',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    mode: 'time',
    rawWpm: 97,
    netWpm: 94,
    accuracy: 97,
    cpm: 485,
    consistency: 88,
    elapsedSeconds: 60,
    difficulty: 'intermediate',
    errorCount: 2,
  },
  {
    id: 'demo-3',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 4,
    mode: 'words',
    rawWpm: 104,
    netWpm: 101,
    accuracy: 98,
    cpm: 520,
    consistency: 91,
    elapsedSeconds: 28,
    difficulty: 'intermediate',
    errorCount: 1,
  },
  {
    id: 'demo-4',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
    mode: 'time',
    rawWpm: 108,
    netWpm: 105,
    accuracy: 97,
    cpm: 540,
    consistency: 89,
    elapsedSeconds: 30,
    difficulty: 'intermediate',
    errorCount: 2,
  },
  {
    id: 'demo-5',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
    mode: 'quote',
    rawWpm: 102,
    netWpm: 99,
    accuracy: 98,
    cpm: 510,
    consistency: 93,
    elapsedSeconds: 34,
    difficulty: 'intermediate',
    errorCount: 1,
  },
  {
    id: 'demo-6',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 45,
    mode: 'time',
    rawWpm: 114,
    netWpm: 110,
    accuracy: 98,
    cpm: 570,
    consistency: 92,
    elapsedSeconds: 60,
    difficulty: 'intermediate',
    errorCount: 2,
  },
  {
    id: 'demo-7',
    timestamp: Date.now() - 1000 * 60 * 60 * 18, // 18 hours ago
    mode: 'words',
    rawWpm: 118,
    netWpm: 115,
    accuracy: 98,
    cpm: 590,
    consistency: 94,
    elapsedSeconds: 24,
    difficulty: 'intermediate',
    errorCount: 1,
  },
  {
    id: 'demo-8',
    timestamp: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
    mode: 'time',
    rawWpm: 122,
    netWpm: 119,
    accuracy: 99,
    cpm: 610,
    consistency: 96,
    elapsedSeconds: 30,
    difficulty: 'intermediate',
    errorCount: 1,
  },
  {
    id: 'demo-9',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    mode: 'time',
    rawWpm: 125,
    netWpm: 122,
    accuracy: 99,
    cpm: 625,
    consistency: 95,
    elapsedSeconds: 15,
    difficulty: 'intermediate',
    errorCount: 0,
  },
];

const PRESET_DEFINITIONS: {
  preset: string;
  label: string;
  category: 'time' | 'words' | 'quote' | 'custom';
  defaultBest: { wpm: number; accuracy: number; consistency: number };
}[] = [
  { preset: 'time-15', label: '15 Seconds', category: 'time', defaultBest: { wpm: 122, accuracy: 99, consistency: 95 } },
  { preset: 'time-30', label: '30 Seconds', category: 'time', defaultBest: { wpm: 119, accuracy: 99, consistency: 96 } },
  { preset: 'time-60', label: '60 Seconds', category: 'time', defaultBest: { wpm: 110, accuracy: 98, consistency: 92 } },
  { preset: 'time-120', label: '120 Seconds', category: 'time', defaultBest: { wpm: 104, accuracy: 97, consistency: 90 } },
  { preset: 'words-10', label: '10 Words', category: 'words', defaultBest: { wpm: 128, accuracy: 100, consistency: 97 } },
  { preset: 'words-25', label: '25 Words', category: 'words', defaultBest: { wpm: 118, accuracy: 99, consistency: 94 } },
  { preset: 'words-50', label: '50 Words', category: 'words', defaultBest: { wpm: 115, accuracy: 98, consistency: 94 } },
  { preset: 'words-100', label: '100 Words', category: 'words', defaultBest: { wpm: 108, accuracy: 98, consistency: 91 } },
  { preset: 'quote', label: 'Quote Mode', category: 'quote', defaultBest: { wpm: 99, accuracy: 98, consistency: 93 } },
];

function calculateDailyStreak(timestamps: number[]): number {
  if (timestamps.length === 0) return 0;

  const dateSet = new Set<string>();
  timestamps.forEach((ts) => {
    const d = new Date(ts);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    dateSet.add(dateStr);
  });

  const sortedDates = Array.from(dateSet).sort().reverse();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let currentStreak = 0;
  let checkDate = sortedDates.includes(todayStr)
    ? today
    : sortedDates.includes(yesterdayStr)
    ? yesterday
    : null;

  if (!checkDate) return 0;

  let pointer = new Date(checkDate);
  while (true) {
    const key = `${pointer.getFullYear()}-${String(pointer.getMonth() + 1).padStart(2, '0')}-${String(
      pointer.getDate()
    ).padStart(2, '0')}`;
    if (dateSet.has(key)) {
      currentStreak++;
      pointer.setDate(pointer.getDate() - 1);
    } else {
      break;
    }
  }

  return currentStreak;
}

export function useUserAnalytics(): UserAnalyticsData & {
  exportHistoryJson: () => void;
  exportHistoryCsv: () => void;
  refreshAnalytics: () => void;
} {
  const { user, isGuest } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshAnalytics = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Compute active sessions based on user state
  const sessions = useMemo(() => {
    // Explicitly reference refreshKey so manual refresh triggers re-evaluation
    if (refreshKey < 0) return [];
    const local = getStoredSessions();

    if (user?.isDemo) {
      // Merge demo seeded history with any fresh local tests
      return [...local, ...DEMO_SEEDED_SESSIONS].sort((a, b) => b.timestamp - a.timestamp);
    }

    return local;
  }, [user, refreshKey]);

  // Compute Headline Summary KPIs
  const summary: AnalyticsSummary = useMemo(() => {
    if (sessions.length === 0) {
      return {
        totalTests: 0,
        totalTimeSeconds: 0,
        totalWords: 0,
        peakWpm: 0,
        avgWpm: 0,
        avgAccuracy: 100,
        avgConsistency: 100,
        dailyStreak: 0,
        wpmGain: 0,
      };
    }

    const totalTests = sessions.length;
    const totalTimeSeconds = sessions.reduce((acc, s) => acc + (s.elapsedSeconds || 30), 0);
    const totalWords = Math.round(
      sessions.reduce((acc, s) => acc + (s.netWpm * (s.elapsedSeconds || 30)) / 60, 0)
    );
    const peakWpm = Math.max(...sessions.map((s) => s.netWpm));
    const avgWpm = Math.round(sessions.reduce((acc, s) => acc + s.netWpm, 0) / totalTests);
    const avgAccuracy = Math.round(
      sessions.reduce((acc, s) => acc + s.accuracy, 0) / totalTests
    );
    const avgConsistency = Math.round(
      sessions.reduce((acc, s) => acc + (s.consistency || 90), 0) / totalTests
    );

    const timestamps = sessions.map((s) => s.timestamp);
    const dailyStreak = calculateDailyStreak(timestamps);

    // Calculate progression gain (recent 5 vs oldest 5)
    let wpmGain = 0;
    if (sessions.length >= 3) {
      const recent = sessions.slice(0, Math.min(5, sessions.length));
      const oldest = sessions.slice(-Math.min(5, sessions.length));
      const recentAvg = recent.reduce((a, s) => a + s.netWpm, 0) / recent.length;
      const oldestAvg = oldest.reduce((a, s) => a + s.netWpm, 0) / oldest.length;
      wpmGain = Math.round(recentAvg - oldestAvg);
    }

    return {
      totalTests,
      totalTimeSeconds,
      totalWords,
      peakWpm,
      avgWpm,
      avgAccuracy,
      avgConsistency,
      dailyStreak: dailyStreak > 0 ? dailyStreak : user?.isDemo ? 3 : 0,
      wpmGain,
    };
  }, [sessions, user]);

  // Compute Personal Bests across Presets
  const personalBests: PersonalBestRecord[] = useMemo(() => {
    return PRESET_DEFINITIONS.map((def) => {
      // Find matching session in user records
      const matching = sessions.filter((s) => {
        if (def.category === 'quote') return s.mode === 'quote';
        if (def.category === 'time') {
          const targetSec = parseInt(def.preset.replace('time-', ''), 10);
          return s.mode === 'time' && s.elapsedSeconds === targetSec;
        }
        return s.mode === def.category;
      });

      if (matching.length > 0) {
        const best = matching.reduce((max, s) => (s.netWpm > max.netWpm ? s : max), matching[0]);
        return {
          preset: def.preset,
          label: def.label,
          category: def.category,
          wpm: best.netWpm,
          rawWpm: best.rawWpm,
          accuracy: best.accuracy,
          consistency: best.consistency || 90,
          timestamp: best.timestamp,
        };
      }

      // If Demo user and no custom match, use realistic demo benchmark
      if (user?.isDemo) {
        return {
          preset: def.preset,
          label: def.label,
          category: def.category,
          wpm: def.defaultBest.wpm,
          rawWpm: def.defaultBest.wpm + 5,
          accuracy: def.defaultBest.accuracy,
          consistency: def.defaultBest.consistency,
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
        };
      }

      // Empty benchmark
      return {
        preset: def.preset,
        label: def.label,
        category: def.category,
        wpm: 0,
        rawWpm: 0,
        accuracy: 0,
        consistency: 0,
        timestamp: 0,
      };
    });
  }, [sessions, user]);

  // Compute chronological progression points for interactive charts
  const progression: ProgressionPoint[] = useMemo(() => {
    // Reverse sessions so they are chronological (oldest to newest)
    const chronological = [...sessions].sort((a, b) => a.timestamp - b.timestamp);

    return chronological.map((s, idx) => ({
      id: s.id,
      testIndex: idx + 1,
      timestamp: s.timestamp,
      netWpm: s.netWpm,
      rawWpm: s.rawWpm,
      accuracy: s.accuracy,
      consistency: s.consistency || 90,
      mode: s.mode,
      preset:
        s.mode === 'time'
          ? `${s.elapsedSeconds}s`
          : s.mode === 'words'
          ? 'words'
          : s.mode === 'quote'
          ? 'quote'
          : 'custom',
    }));
  }, [sessions]);

  // Compute Academy Mastery Breakdown
  const academy: AcademyMasterySummary = useMemo(() => {
    if (refreshKey < 0) return { totalCompleted: 0, totalStars: 0, maxStars: 0, levels: [] };
    const rawProgress = getAllLessonProgress();
    let totalCompleted = 0;
    let totalStars = 0;
    let maxStars = 0;

    const levels = COURSES.map((course) => {
      let levelCompleted = 0;
      let levelStars = 0;
      const levelMaxStars = course.lessons.length * 3;

      course.lessons.forEach((lesson) => {
        const prog = rawProgress[lesson.id];
        if (prog) {
          levelStars += prog.stars;
          if (prog.completed) levelCompleted++;
        } else if (user?.isDemo && course.id === 'beginner') {
          // Demo user has level 1 mastered
          levelStars += 3;
          levelCompleted++;
        }
      });

      totalCompleted += levelCompleted;
      totalStars += levelStars;
      maxStars += levelMaxStars;

      return {
        id: course.id,
        title: course.title,
        completedLessons: levelCompleted,
        totalLessons: course.lessons.length,
        earnedStars: levelStars,
        maxStars: levelMaxStars,
      };
    });

    return {
      totalCompleted,
      totalStars,
      maxStars,
      levels,
    };
  }, [user, refreshKey]);

  // JSON Export Trigger
  const exportHistoryJson = useCallback(() => {
    const exportData = {
      user: user?.username || 'guest',
      exportDate: new Date().toISOString(),
      summary,
      personalBests,
      sessions,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keysmasher-analytics-${user?.username || 'guest'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [user, summary, personalBests, sessions]);

  // CSV Export Trigger
  const exportHistoryCsv = useCallback(() => {
    const headers = [
      'ID',
      'Date',
      'Mode',
      'Net WPM',
      'Raw WPM',
      'Accuracy %',
      'Consistency %',
      'Duration (sec)',
      'Mistakes',
    ];

    const rows = sessions.map((s) => [
      s.id,
      new Date(s.timestamp).toISOString(),
      s.mode,
      s.netWpm,
      s.rawWpm,
      s.accuracy,
      s.consistency || 90,
      s.elapsedSeconds,
      s.errorCount || 0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.setAttribute('href', encodedUri);
    a.setAttribute(
      'download',
      `keysmasher-sessions-${user?.username || 'guest'}-${Date.now()}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [user, sessions]);

  return {
    summary,
    personalBests,
    progression,
    sessions,
    academy,
    isLoading: false,
    exportHistoryJson,
    exportHistoryCsv,
    refreshAnalytics,
  };
}
