'use client';

import React from 'react';
import { AuthProvider } from '@/features/auth/AuthContext';
import { AuthModal } from '@/features/auth/components/AuthModal';
import {
  GamificationProvider,
  useGamification,
  AchievementsModal,
  XpGainToast,
} from '@/features/gamification';
import { RankedProvider } from '@/features/ranked';

const GamificationModals: React.FC = () => {
  const {
    isAchievementsModalOpen,
    closeAchievementsModal,
    achievements,
    recentXpGain,
    recentUnlock,
    dismissToast,
  } = useGamification();

  return (
    <>
      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={closeAchievementsModal}
        achievements={achievements}
      />
      <XpGainToast
        xpGain={recentXpGain}
        unlock={recentUnlock}
        onDismiss={dismissToast}
      />
    </>
  );
};

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <GamificationProvider>
        <RankedProvider>
          {children}
          <AuthModal />
          <GamificationModals />
        </RankedProvider>
      </GamificationProvider>
    </AuthProvider>
  );
};
