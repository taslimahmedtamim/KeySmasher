import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PracticePage from '@/app/practice/page';

describe('PracticePage Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders mode selectors and default duration buttons', () => {
    render(<PracticePage />);

    expect(screen.getByRole('button', { name: /Time/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Words/i })).toBeInTheDocument();

    // Default duration buttons (15s, 30s, 60s, 120s)
    expect(screen.getByRole('button', { name: '15s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '60s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '120s' })).toBeInTheDocument();

    // Metrics headers
    expect(screen.getByText('Raw WPM')).toBeInTheDocument();
    expect(screen.getByText('Net WPM')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
  });

  it('switches between time mode and words mode when clicked', () => {
    render(<PracticePage />);

    const wordsModeBtn = screen.getByRole('button', { name: /Words/i });
    fireEvent.click(wordsModeBtn);

    // Should now display word count buttons (10w, 25w, 50w, 100w)
    expect(screen.getByText('10w')).toBeInTheDocument();
    expect(screen.getByText('25w')).toBeInTheDocument();
    expect(screen.getByText('50w')).toBeInTheDocument();
    expect(screen.getByText('100w')).toBeInTheDocument();
  });

  it('renders passage words inside typing area', () => {
    const { container } = render(<PracticePage />);

    const typingRegion = screen.getByRole('region', { name: /Typing passage input area/i });
    expect(typingRegion).toBeInTheDocument();

    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();
  });
});
