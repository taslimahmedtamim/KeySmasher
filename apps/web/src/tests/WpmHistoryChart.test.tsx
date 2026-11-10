import React from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WpmHistoryChart } from '@/features/typing/components/WpmHistoryChart';
import { useTypingEngine } from '@/features/typing/useTypingEngine';
import type { WpmHistoryPoint } from '@/features/typing/types';

const createKeyboardEvent = (key: string) =>
  ({
    key,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    shiftKey: false,
    preventDefault: vi.fn(),
  }) as unknown as React.KeyboardEvent<HTMLInputElement>;

describe('WpmHistoryChart (Monkeytype-style Speed Over Time)', () => {
  it('renders smooth spline curves, dual axes, red error crosses, and interactive hover telemetry', () => {
    const history: WpmHistoryPoint[] = [
      { second: 1, rawWpm: 145, netWpm: 145, burstWpm: 126, accuracy: 100, errors: 0 },
      { second: 2, rawWpm: 126, netWpm: 95, burstWpm: 120, accuracy: 88, errors: 2 },
      { second: 3, rawWpm: 120, netWpm: 100, burstWpm: 112, accuracy: 92, errors: 0 },
      { second: 4, rawWpm: 125, netWpm: 78, burstWpm: 158, accuracy: 82, errors: 8 },
      { second: 5, rawWpm: 114, netWpm: 93, burstWpm: 100, accuracy: 91, errors: 1 },
    ];

    const { container } = render(<WpmHistoryChart history={history} averageWpm={93} />);

    // Dual Monkeytype axis labels (Words per Minute + Errors axis & legend)
    expect(screen.getByText('Words per Minute')).toBeInTheDocument();
    expect(screen.getAllByText('Errors')).toHaveLength(2);

    // Left WPM ticks (0, 40, 80, 120, 160 for peak 158) and right Error ticks (0, 2, 4, 6, 8)
    expect(screen.getByText('160')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();

    // Smooth cubic Bezier spline paths ('C' commands)
    const paths = Array.from(container.querySelectorAll('svg path'));
    const splinePaths = paths.filter((p) => (p.getAttribute('d') || '').includes(' C '));
    expect(splinePaths.length).toBeGreaterThanOrEqual(3);

    // Red cross error markers only on the 3 seconds with errors > 0
    const errorMarkers = screen.getAllByTestId('error-marker');
    expect(errorMarkers).toHaveLength(3);

    // Hover over 4th vertical strip (second 4: 78 Net, 125 Raw, 158 Burst, 8 Errors)
    const hitStrips = container.querySelectorAll('svg rect');
    expect(hitStrips).toHaveLength(5);
    fireEvent.mouseEnter(hitStrips[3]);

    expect(screen.getByText('4s')).toBeInTheDocument();
    expect(screen.getByText('78')).toBeInTheDocument();
    expect(screen.getByText('125')).toBeInTheDocument();
    expect(screen.getByText('158')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
  });
});

describe('useTypingEngine live wpmHistory & completion snapshot', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('records non-zero rawWpm, netWpm, burstWpm, per-second errors, and complete metrics on timer end', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useTypingEngine({
        initialConfig: {
          mode: 'time',
          durationSeconds: 15,
          initialPassage: 'hello world typing speed test',
        },
        onTestComplete: onComplete,
      })
    );

    // Second 1: type "hellx" (4 correct + 1 error)
    for (const ch of ['h', 'e', 'l', 'l', 'x']) {
      act(() => {
        result.current.actions.handleKeyDown(createKeyboardEvent(ch));
      });
    }
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    // Second 2: backspace 'x', type 'o' + ' ' + "world" cleanly (0 errors in sec 2)
    act(() => {
      result.current.actions.handleKeyDown(createKeyboardEvent('Backspace'));
    });
    for (const ch of ['o', ' ', 'w', 'o', 'r', 'l', 'd']) {
      act(() => {
        result.current.actions.handleKeyDown(createKeyboardEvent(ch));
      });
    }
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.wpmHistory.length).toBeGreaterThanOrEqual(2);
    const sec1 = result.current.wpmHistory[0];
    const sec2 = result.current.wpmHistory[1];

    expect(sec1.second).toBe(1);
    expect(sec1.rawWpm).toBeGreaterThan(0);
    expect(sec1.netWpm).toBeGreaterThan(0);
    expect(sec1.errors).toBe(1);
    expect(sec1.burstWpm).toBeGreaterThan(0);

    expect(sec2.second).toBe(2);
    expect(sec2.rawWpm).toBeGreaterThan(0);
    expect(sec2.netWpm).toBeGreaterThan(0);
    expect(sec2.errors).toBe(0);

    // Advance remaining 13s so 15s time test completes automatically
    act(() => {
      vi.advanceTimersByTime(13200);
    });

    expect(result.current.status).toBe('completed');
    expect(onComplete).toHaveBeenCalledTimes(1);
    const [completedMetrics, completedHistory] = onComplete.mock.calls[0];
    expect(completedMetrics.rawWpm).toBeGreaterThan(0);
    expect(completedMetrics.netWpm).toBeGreaterThan(0);
    expect(completedHistory).toHaveLength(15);
  });
});
