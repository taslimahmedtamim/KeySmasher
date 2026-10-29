import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '@/components/layout/Header';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock next/image
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: ({ priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => <img {...props} />,
}));

describe('Header Component', () => {
  it('renders KeySmasher brand logo and primary public navigation links (without Dashboard)', () => {
    render(<Header />);

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

  it('reveals Dashboard and user profile when signed in', () => {
    render(<Header />);

    const signInBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(signInBtn);

    // Dashboard is now accessible
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /My Profile/i })).toBeInTheDocument();
  });
});
