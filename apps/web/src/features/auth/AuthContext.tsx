'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';
import { KeySmasherUser, AuthContextValue } from './types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'keysmasher_auth_user';

const memoryAuthStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Fallback
  }
  return memoryAuthStore[key] || null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Fallback
  }
  memoryAuthStore[key] = value;
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Fallback
  }
  delete memoryAuthStore[key];
}

export const DEMO_USER: KeySmasherUser = {
  id: '00000000-0000-4000-a000-000000000001',
  email: 'demon@keysmasher.io',
  username: 'SpeedDemon',
  displayName: 'Speed Demon',
  avatarUrl: '/logo.png',
  isDemo: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<KeySmasherUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Sync guest local storage history into account
  const syncGuestData = useCallback((authenticatedUserId: string) => {
    try {
      const guestHistory = safeGetItem('keysmasher_test_history');
      if (guestHistory) {
        safeSetItem(`keysmasher_user_history_${authenticatedUserId}`, guestHistory);
      }
      const guestProgress = safeGetItem('keysmasher_academy_progress');
      if (guestProgress) {
        safeSetItem(
          `keysmasher_user_academy_${authenticatedUserId}`,
          guestProgress
        );
      }
    } catch {
      // Ignore quota error
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const supabase = getSupabaseClient();
        if (supabase && isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            const profile = data as Database['public']['Tables']['profiles']['Row'] | null;

            const loggedInUser: KeySmasherUser = {
              id: session.user.id,
              email: session.user.email || '',
              username: profile?.username || session.user.email?.split('@')[0] || 'typist',
              displayName: profile?.display_name || profile?.username || 'Typist',
              avatarUrl: profile?.avatar_url || undefined,
            };
            setUser(loggedInUser);
            syncGuestData(loggedInUser.id);
          }

          // Listen to state changes
          supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              const profile = data as Database['public']['Tables']['profiles']['Row'] | null;

              const u: KeySmasherUser = {
                id: session.user.id,
                email: session.user.email || '',
                username: profile?.username || session.user.email?.split('@')[0] || 'typist',
                displayName: profile?.display_name || profile?.username || 'Typist',
                avatarUrl: profile?.avatar_url || undefined,
              };
              setUser(u);
              syncGuestData(u.id);
            } else {
              setUser(null);
            }
          });
        } else {
          // Check local storage for mock / demo session
          const savedUser = safeGetItem(LOCAL_STORAGE_USER_KEY);
          if (savedUser) {
            const parsed = JSON.parse(savedUser) as KeySmasherUser;
            setUser(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [syncGuestData]);

  const signInWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        return {};
      }

      // Offline / Local Mock Sign-In
      const mockUser: KeySmasherUser = {
        id: `usr_${Date.now()}`,
        email,
        username: email.split('@')[0],
        displayName: email.split('@')[0],
      };
      setUser(mockUser);
      safeSetItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockUser));
      syncGuestData(mockUser.id);
      setIsAuthModalOpen(false);
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Sign in failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    username: string,
    displayName?: string
  ): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured()) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              display_name: displayName || username,
            },
          },
        });
        if (error) return { error: error.message };
        return {};
      }

      // Offline / Local Mock Sign-Up
      const mockUser: KeySmasherUser = {
        id: `usr_${Date.now()}`,
        email,
        username,
        displayName: displayName || username,
      };
      setUser(mockUser);
      safeSetItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockUser));
      syncGuestData(mockUser.id);
      setIsAuthModalOpen(false);
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Sign up failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithDemo = async (): Promise<void> => {
    setIsLoading(true);
    try {
      setUser(DEMO_USER);
      safeSetItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(DEMO_USER));
      syncGuestData(DEMO_USER.id);
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      setUser(null);
      safeRemoveItem(LOCAL_STORAGE_USER_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isGuest: user === null,
        signInWithEmail,
        signUpWithEmail,
        signInWithDemo,
        signOut,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const defaultAuthContextValue: AuthContextValue = {
  user: null,
  isLoading: false,
  isGuest: true,
  signInWithEmail: async () => ({ error: 'Auth provider not mounted' }),
  signUpWithEmail: async () => ({ error: 'Auth provider not mounted' }),
  signInWithDemo: async () => {},
  signOut: async () => {},
  isAuthModalOpen: false,
  authModalMode: 'signin',
  openAuthModal: () => {},
  closeAuthModal: () => {},
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    return defaultAuthContextValue;
  }
  return context;
};

