import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroTypingPreview } from '@/components/home/HeroTypingPreview';

describe('HeroTypingPreview', () => {
  it('renders interactive speed sandbox with initial stats', () => {
    render(<HeroTypingPreview />);

    expect(screen.getByText(/Interactive Speed Sandbox/i)).toBeInTheDocument();
    expect(screen.getByText(/WPM:/i)).toBeInTheDocument();
    expect(screen.getByText(/ACC:/i)).toBeInTheDocument();
  });

  it('updates input and character tracking when user types', () => {
    const { container } = render(<HeroTypingPreview />);

    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();

    if (input) {
      fireEvent.change(input, { target: { value: 'smash' } });
      expect(screen.getByText(/5\/55 chars/i)).toBeInTheDocument();
    }
  });

  it('resets input when reset button is clicked', () => {
    const { container } = render(<HeroTypingPreview />);

    const input = container.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'smash' } });
      const resetBtn = screen.getByRole('button', { name: /Reset/i });
      fireEvent.click(resetBtn);
      expect(screen.getByText(/0\/55 chars/i)).toBeInTheDocument();
    }
  });
});
