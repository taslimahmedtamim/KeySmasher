'use client';

import React from 'react';
import { useUserAnalytics } from '@/features/dashboard/useUserAnalytics';
import { DashboardProfileBanner } from '@/features/dashboard/components/DashboardProfileBanner';
import { KpiMetricsGrid } from '@/features/dashboard/components/KpiMetricsGrid';
import { ProgressionChart } from '@/features/dashboard/components/ProgressionChart';
import { AcademyMasteryCard } from '@/features/dashboard/components/AcademyMasteryCard';
import { SessionHistoryTable } from '@/features/dashboard/components/SessionHistoryTable';
import { SmartCoachCard } from '@/features/coach';

export default function DashboardPage() {
  const {
    summary,
    personalBests,
    progression,
    sessions,
    academy,
    coach,
  } = useUserAnalytics();

  return (
    <div className="py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 1. Profile & Quick Actions Banner */}
        <DashboardProfileBanner summary={summary} academy={academy} />

        {/* 2. Top Headline KPIs (Peak WPM, Avg WPM, Accuracy, Consistency, Streak) */}
        <KpiMetricsGrid summary={summary} />

        {/* 3. Speed & Precision Progression Curve */}
        <ProgressionChart points={progression} />

        {/* 4. Smart Typing Coach & Weak-Key Diagnostics */}
        <SmartCoachCard coach={coach} />

        {/* 5. Touch Typing Academy Mastery */}
        <AcademyMasteryCard academy={academy} />

        {/* 6. Detailed Session History Audit Table with Star Highlights */}
        <SessionHistoryTable sessions={sessions} />
      </div>
    </div>
  );
}
