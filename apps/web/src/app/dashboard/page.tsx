'use client';

import React from 'react';
import { useUserAnalytics } from '@/features/dashboard/useUserAnalytics';
import { DashboardProfileBanner } from '@/features/dashboard/components/DashboardProfileBanner';
import { KpiMetricsGrid } from '@/features/dashboard/components/KpiMetricsGrid';
import { ProgressionChart } from '@/features/dashboard/components/ProgressionChart';
import { AcademyMasteryCard } from '@/features/dashboard/components/AcademyMasteryCard';
import { SessionHistoryTable } from '@/features/dashboard/components/SessionHistoryTable';
import { SmartCoachCard } from '@/features/coach';
import { useGamification, LevelProgressBar, DailyGoalsCard } from '@/features/gamification';

export default function DashboardPage() {
  const {
    summary,
    personalBests,
    progression,
    sessions,
    academy,
    coach,
  } = useUserAnalytics();

  const { levelProgress, dailyGoals, openAchievementsModal } = useGamification();

  return (
    <div className="pt-6 pb-28 sm:pt-8 sm:pb-36 page-enter">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 1. Profile & Quick Actions Banner */}
        <DashboardProfileBanner summary={summary} academy={academy} />

        {/* 2. Gamification: Level & XP Progression */}
        <LevelProgressBar
          progress={levelProgress}
          onOpenAchievements={openAchievementsModal}
        />

        {/* 3. Top Headline KPIs (Peak WPM, Avg WPM, Accuracy, Consistency, Streak) */}
        <KpiMetricsGrid summary={summary} />

        {/* 4. Gamification: Daily Objectives */}
        <DailyGoalsCard goals={dailyGoals} />

        {/* 5. Speed & Precision Progression Curve */}
        <ProgressionChart points={progression} />

        {/* 6. Smart Typing Coach & Weak-Key Diagnostics */}
        <SmartCoachCard coach={coach} />

        {/* 7. Touch Typing Academy Mastery */}
        <AcademyMasteryCard academy={academy} />

        {/* 8. Detailed Session History Audit Table with Star Highlights */}
        <SessionHistoryTable sessions={sessions} />
      </div>
    </div>
  );
}
