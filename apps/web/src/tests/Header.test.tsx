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

  it('renders KeySmasher brand logo and Quick Test option on navbar without signin', () => {
    render(<TestShell />);

    // Brand name
    expect(screen.getByText(/KEY/i)).toBeInTheDocument();
    expect(screen.getByText(/SMASHER/i)).toBeInTheDocument();

    // Without login, Quick Test is visible on the navbar near sign in
    expect(screen.getAllByRole('link', { name: /Quick Test/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole('link', { name: /Learn/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Compete/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Dashboard/i })).not.toBeInTheDocument();

    // Sign in button is visible
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('opens AuthModal and reveals user profile with full navbar options when signed in', async () => {
    render(<TestShell />);

    const signInBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(signInBtn);

    // AuthModal is now opened
    expect(screen.getByText(/KeySmasher Account/i)).toBeInTheDocument();
    const demoLoginBtn = screen.getByRole('button', { name: /Quick Demo Account/i });

    await act(async () => {
      fireEvent.click(demoLoginBtn);
    });

    // Profile and DEMO badge are now visible
    expect(screen.getByText(/Speed Demon/i)).toBeInTheDocument();
    expect(screen.getAllByText(/DEMO/i).length).toBeGreaterThanOrEqual(1);

    // Full navigation items are now revealed after login
    expect(screen.getByRole('link', { name: /Learn/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Practice/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Compete/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Dashboard/i }).length).toBeGreaterThanOrEqual(1);

    // Sign Out button is accessible
    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    expect(signOutBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(signOutBtn);
    });

    // Reverts to guest mode, Quick Test remains on navbar near sign in, others hidden
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Quick Test/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole('link', { name: /Learn/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Compete/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Dashboard/i })).not.toBeInTheDocument();
  });
});
