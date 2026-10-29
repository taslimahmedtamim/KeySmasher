import React from 'react';
import { render, screen } from '@testing-library/react';
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
  it('renders KeySmasher brand logo and navigation links', () => {
    render(<Header />);

    // Brand name
    expect(screen.getByText(/KEY/i)).toBeInTheDocument();
    expect(screen.getByText(/SMASHER/i)).toBeInTheDocument();

    // Primary navigation items
    expect(screen.getByRole('link', { name: /Learn/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Practice/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Compete/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();

    // Auth controls
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });
});
