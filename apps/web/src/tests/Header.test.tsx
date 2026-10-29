import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from '@/components/layout/Header';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { AuthModal } from '@/features/auth/components/AuthModal';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock next/image
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: ({ priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => <img {...props} />,
}));

const TestShell: React.FC = () => {
  return (
    <AuthProvider>
      <Header />
      <AuthModal />
    </AuthProvider>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    // Clear mock storage
    try {
      window.localStorage.clear();
    } catch {
      // Ignore
    }
  });

  it('renders KeySmasher brand logo and primary public navigation links (without Dashboard)', () => {
    render(<TestShell />);

    // Brand name
    expect(screen.getByText(/KEY/i)).toBeInTheDocument();
    expect(screen.getByText(/SMASHER/i)).toBeInTheDocument();

    // Primary navigation items for guests
    expect(screen.getByRole('link', { name: /Learn/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Practice/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Compete/i })).toBeInTheDocument();

    // Dashboard must NOT be in public guest navigation
    expect(screen.queryByRole('link', { name: /Dashboard/i })).not.toBeInTheDocument();

    // Sign in button is visible
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('opens AuthModal and reveals Dashboard and user profile when signed in via Demo account', async () => {
    render(<TestShell />);

    const signInBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(signInBtn);

    // AuthModal is now opened
    expect(screen.getByText(/KeySmasher Account/i)).toBeInTheDocument();
    const demoLoginBtn = screen.getByRole('button', { name: /Quick Demo Account/i });

    await act(async () => {
      fireEvent.click(demoLoginBtn);
    });

    // Dashboard is now accessible
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/Speed Demon/i)).toBeInTheDocument();

    // Sign Out button is accessible
    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    expect(signOutBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(signOutBtn);
    });

    // Reverts to guest mode
    expect(screen.queryByRole('link', { name: /Dashboard/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });
});
