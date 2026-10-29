export interface KeySmasherUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isDemo?: boolean;
}

export interface AuthContextValue {
  user: KeySmasherUser | null;
  isLoading: boolean;
  isGuest: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    username: string,
    displayName?: string
  ) => Promise<{ error?: string }>;
  signInWithDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
}
