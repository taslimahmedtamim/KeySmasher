'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  SavedTestSession,
  getStoredSessions,
  getCumulativeKeyStats,
} from '../typing/utils/historyStorage';
import { getAllLessonProgress } from '../academy/utils/academyStorage';
import { COURSES, analyzeTypingDiagnostics, CoachAnalysisResult } from '@keysmasher/shared';
import {
  UserAnalyticsData,
  PersonalBestRecord,
  ProgressionPoint,
  AnalyticsSummary,
  AcademyMasterySummary,
} from './types';

const PRESET_DEFINITIONS: {
  preset: string;
  label: string;
  category: 'time' | 'words' | 'quote';
  targetValue?: number;
}[] = [
  { preset: 'time-15', label: '15s', category: 'time', targetValue: 15 },
  { preset: 'time-30', label: '30s', category: 'time', targetValue: 30 },
  { preset: 'time-60', label: '60s', category: 'time', targetValue: 60 },
  { preset: 'time-120', label: '120s', category: 'time', targetValue: 120 },
  { preset: 'words-10', label: '10 Words', category: 'words', targetValue: 10 },
  { preset: 'words-25', label: '25 Words', category: 'words', targetValue: 25 },
  { preset: 'words-50', label: '50 Words', category: 'words', targetValue: 50 },
  { preset: 'words-100', label: '100 Words', category: 'words', targetValue: 100 },
  { preset: 'quote', label: 'Quote Mode', category: 'quote' },
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

  const pointer = new Date(checkDate);
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
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshAnalytics = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // ONLY real sessions completed by the user in storage
  const sessions = useMemo(() => {
    if (refreshKey < 0) return [];
    return getStoredSessions();
  }, [refreshKey]);

  // Compute Headline Summary KPIs from real data ONLY
  const summary: AnalyticsSummary = useMemo(() => {
    if (sessions.length === 0) {
      return {
        totalTests: 0,
        totalTimeSeconds: 0,
        totalWords: 0,
        peakWpm: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        avgConsistency: 0,
        dailyStreak: 0,
        wpmGain: 0,
      };
    }

    const totalTests = sessions.length;
    const totalTimeSeconds = sessions.reduce((acc, s) => acc + (s.elapsedSeconds || 0), 0);
    const totalWords = Math.round(
      sessions.reduce((acc, s) => acc + (s.netWpm * (s.elapsedSeconds || 30)) / 60, 0)
    );
    const peakWpm = Math.round(Math.max(...sessions.map((s) => s.netWpm)));
    const avgWpm = Math.round(sessions.reduce((acc, s) => acc + s.netWpm, 0) / totalTests);
    const avgAccuracy = Math.round(
      sessions.reduce((acc, s) => acc + s.accuracy, 0) / totalTests
    );
    const avgConsistency = Math.round(
      sessions.reduce((acc, s) => acc + (s.consistency || 90), 0) / totalTests
    );

    const timestamps = sessions.map((s) => s.timestamp);
    const dailyStreak = calculateDailyStreak(timestamps);

    // Progression gain between recent tests and initial tests
    let wpmGain = 0;
    if (sessions.length >= 2) {
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
      dailyStreak,
      wpmGain,
    };
  }, [sessions]);

  // Compute Personal Bests across Presets from real data ONLY
  const personalBests: PersonalBestRecord[] = useMemo(() => {
    return PRESET_DEFINITIONS.map((def) => {
      const matching = sessions.filter((s) => {
        if (def.category === 'quote') {
          return s.mode === 'quote';
        }
        if (def.category === 'time') {
          return (
            s.mode === 'time' &&
            (s.targetDuration === def.targetValue ||
              (!s.targetDuration && s.elapsedSeconds === def.targetValue))
          );
        }
        if (def.category === 'words') {
          return s.mode === 'words' && s.targetWords === def.targetValue;
        }
        return false;
      });

      if (matching.length > 0) {
        const best = matching.reduce((max, s) => (s.netWpm > max.netWpm ? s : max), matching[0]);
        return {
          preset: def.preset,
          label: def.label,
          category: def.category,
          wpm: Math.round(best.netWpm),
          rawWpm: Math.round(best.rawWpm),
          accuracy: Math.round(best.accuracy),
          consistency: Math.round(best.consistency || 90),
          timestamp: best.timestamp,
        };
      }

      // No record exists yet for this preset
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
  }, [sessions]);

  // Chronological progression points from real data ONLY
  const progression: ProgressionPoint[] = useMemo(() => {
    const chronological = [...sessions].sort((a, b) => a.timestamp - b.timestamp);

    return chronological.map((s, idx) => ({
      id: s.id,
      testIndex: idx + 1,
      timestamp: s.timestamp,
      netWpm: Math.round(s.netWpm),
      rawWpm: Math.round(s.rawWpm),
      accuracy: Math.round(s.accuracy),
      consistency: Math.round(s.consistency || 90),
      mode: s.mode,
      preset:
        s.mode === 'time'
          ? `${s.targetDuration || s.elapsedSeconds}s`
          : s.mode === 'words'
          ? `${s.targetWords || 25}w`
          : s.mode === 'quote'
          ? 'Quote'
          : 'Custom',
    }));
  }, [sessions]);

  // Real Academy Mastery Breakdown from actual completed lessons ONLY
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
          levelStars += prog.stars || 0;
          if (prog.completed && prog.stars > 0) {
            levelCompleted++;
          }
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
  }, [refreshKey]);

  // JSON Export Trigger
  const exportHistoryJson = useCallback(() => {
    const exportData = {
      user: user?.username || 'guest',
      exportDate: new Date().toISOString(),
      summary,
      personalBests: personalBests.filter((pb) => pb.wpm > 0),
      sessions,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keysmasher-analytics-${user?.username || 'user'}-${Date.now()}.json`;
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
      'Preset',
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
      s.targetDuration ? `${s.targetDuration}s` : s.targetWords ? `${s.targetWords}w` : s.mode,
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
      `keysmasher-sessions-${user?.username || 'user'}-${Date.now()}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [user, sessions]);

  // Coach Telemetry and Diagnostics
  const coach: CoachAnalysisResult = useMemo(() => {
    const cumulativeKeyStats = getCumulativeKeyStats();
    return analyzeTypingDiagnostics(cumulativeKeyStats, {
      avgWpm: summary.avgWpm,
      avgAccuracy: summary.avgAccuracy,
      avgConsistency: summary.avgConsistency,
      totalTests: summary.totalTests,
    });
  }, [summary]);

  return {
    summary,
    personalBests,
    progression,
    sessions,
    academy,
    coach,
    isLoading: false,
    exportHistoryJson,
    exportHistoryCsv,
    refreshAnalytics,
  };
}
