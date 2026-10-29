'use client';

import React from 'react';
import { AuthProvider } from '@/features/auth/AuthContext';
import { AuthModal } from '@/features/auth/components/AuthModal';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
      <AuthModal />
    </AuthProvider>
  );
};
