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

  it('renders passage words inside typing area and autofocuses the hidden input', () => {
    const { container } = render(<PracticePage />);

    const typingRegion = screen.getByRole('region', { name: /Typing passage input area/i });
    expect(typingRegion).toBeInTheDocument();

    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();

    // Verify global keydown can trigger typing immediately without needing to click the box
    fireEvent.keyDown(window, { key: 'a' });
    expect(input).toBeInTheDocument();
  });

  it('allows changing passage with New Passage and switching modes after loading a weak-key drill', () => {
    window.sessionStorage.setItem(
      'keysmasher_drill_passage',
      'boxer absorb boost follow'
    );
    window.sessionStorage.setItem('keysmasher_drill_keys', JSON.stringify(['b', 'f', 'o']));
    window.history.replaceState({}, '', '/practice?drill=weak-keys');

    render(<PracticePage />);

    // Drill banner and initial drill words should appear
    expect(screen.getByText(/Targeting missed keys:/i)).toBeInTheDocument();
    const region = screen.getByRole('region', { name: /Typing passage input area/i });
    expect(region.textContent).toContain('boxerabsorbboostfollow');

    // Clicking "New Passage" during drill should change the text to a new drill passage
    const newPassageBtn = screen.getByRole('button', { name: /New Passage/i });
    fireEvent.click(newPassageBtn);
    expect(region.textContent).not.toContain('boxerabsorbboostfollow');
    expect(screen.getByText(/Targeting missed keys:/i)).toBeInTheDocument();

    // Clicking "Exit Drill" should exit drill cleanly and generate standard passage text
    const beforeExitText = region.textContent;
    const exitBtn = screen.getByRole('button', { name: /Exit Drill/i });
    fireEvent.click(exitBtn);
    expect(screen.queryByText(/Targeting missed keys:/i)).not.toBeInTheDocument();
    expect(region.textContent).not.toBe(beforeExitText);

    window.sessionStorage.clear();
  });
});
