import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WpmHistoryChart } from '@/features/typing/components/WpmHistoryChart';
import { CustomTextModal } from '@/features/typing/components/CustomTextModal';
import {
  saveSessionResult,
  getStoredSessions,
  getSessionStats,
  clearStoredSessions,
} from '@/features/typing/utils/historyStorage';
import PracticePage from '@/app/practice/page';

describe('Feature C: History Storage', () => {
  beforeEach(() => {
    clearStoredSessions();
  });

  it('saves session results and calculates correct session summary stats', () => {
    saveSessionResult({
      mode: 'time',
      rawWpm: 75,
      netWpm: 70,
      accuracy: 95,
      cpm: 350,
      consistency: 90,
      elapsedSeconds: 30,
      difficulty: 'intermediate',
      errorCount: 3,
    });

    saveSessionResult({
      mode: 'words',
      rawWpm: 85,
      netWpm: 80,
      accuracy: 98,
      cpm: 400,
      consistency: 94,
      elapsedSeconds: 20,
      difficulty: 'advanced',
      errorCount: 1,
    });

    const sessions = getStoredSessions();
    expect(sessions.length).toBe(2);

    const stats = getSessionStats(sessions);
    expect(stats.totalTests).toBe(2);
    expect(stats.bestWpm).toBe(80);
    expect(stats.avgWpm).toBe(75); // (70 + 80) / 2
  });

  it('clears stored sessions cleanly', () => {
    saveSessionResult({
      mode: 'time',
      rawWpm: 60,
      netWpm: 60,
      accuracy: 100,
      cpm: 300,
      consistency: 100,
      elapsedSeconds: 15,
      difficulty: 'beginner',
      errorCount: 0,
    });

    expect(getStoredSessions().length).toBe(1);
    clearStoredSessions();
    expect(getStoredSessions().length).toBe(0);
  });
});

describe('Feature C: WpmHistoryChart Component', () => {
  it('renders SVG lines and average speed indicator when history is provided', () => {
    const mockHistory = [
      { second: 1, rawWpm: 40, netWpm: 35, accuracy: 90, errors: 1 },
      { second: 2, rawWpm: 60, netWpm: 55, accuracy: 95, errors: 0 },
      { second: 3, rawWpm: 70, netWpm: 68, accuracy: 98, errors: 0 },
    ];

    render(<WpmHistoryChart history={mockHistory} averageWpm={52} />);

    expect(screen.getByText('Speed Over Time')).toBeInTheDocument();
    expect(screen.getByText('Raw WPM')).toBeInTheDocument();
    expect(screen.getByText('Net WPM')).toBeInTheDocument();
    expect(screen.getByText(/Avg 52/i)).toBeInTheDocument();
  });

  it('renders fallback prompt when history has fewer than 2 points', () => {
    render(<WpmHistoryChart history={[{ second: 1, rawWpm: 50, netWpm: 50, accuracy: 100, errors: 0 }]} averageWpm={50} />);
    expect(screen.getByText(/longer than 2 seconds/i)).toBeInTheDocument();
  });
});

describe('Feature C: CustomTextModal Component', () => {
  it('opens and triggers onApply with custom text', () => {
    const handleApply = vi.fn();
    const handleClose = vi.fn();

    render(
      <CustomTextModal
        isOpen={true}
        onClose={handleClose}
        onApply={handleApply}
        initialText="Custom passage test text"
      />
    );

    expect(screen.getByText('Custom Practice Text')).toBeInTheDocument();

    const startBtn = screen.getByRole('button', { name: /Start Practice/i });
    fireEvent.click(startBtn);

    expect(handleApply).toHaveBeenCalledWith('Custom passage test text');
    expect(handleClose).toHaveBeenCalled();
  });
});

describe('Feature C: PracticePage Mode and Toggles', () => {
  it('renders Quote and Custom buttons and toggles Punctuation and Numbers', () => {
    render(<PracticePage />);

    // Mode buttons
    expect(screen.getByRole('button', { name: /Quote/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Custom/i })).toBeInTheDocument();

    // Punctuation and Numbers toggles
    const puncBtn = screen.getByRole('button', { name: /@#\$/i });
    expect(puncBtn).toBeInTheDocument();

    const numBtn = screen.getByRole('button', { name: /123/i });
    expect(numBtn).toBeInTheDocument();

    // Sound toggle
    const soundBtn = screen.getByRole('button', { name: /Mute/i });
    expect(soundBtn).toBeInTheDocument();
    fireEvent.click(soundBtn);
    expect(screen.getByRole('button', { name: /Click/i })).toBeInTheDocument();
  });
});
