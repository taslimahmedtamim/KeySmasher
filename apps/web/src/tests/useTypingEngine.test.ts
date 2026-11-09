import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTypingEngine } from '@/features/typing/useTypingEngine';

describe('useTypingEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes in idle state with 0 elapsed seconds and 100% accuracy', () => {
    const { result } = renderHook(() =>
      useTypingEngine({
        initialConfig: {
          mode: 'words',
          targetWordCount: 10,
          initialPassage: 'the quick brown fox jumps',
        },
      })
    );

    expect(result.current.status).toBe('idle');
    expect(result.current.metrics.rawWpm).toBe(0);
    expect(result.current.metrics.netWpm).toBe(0);
    expect(result.current.metrics.accuracy).toBe(100);
    expect(result.current.currentWordIndex).toBe(0);
    expect(result.current.currentInput).toBe('');
  });

  it('transitions from idle to active on first character keypress', () => {
    const { result } = renderHook(() =>
      useTypingEngine({
        initialConfig: {
          initialPassage: 'hello world',
        },
      })
    );

    expect(result.current.status).toBe('idle');

    act(() => {
      result.current.actions.handleKeyDown({
        key: 'h',
        ctrlKey: false,
        altKey: false,
        metaKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });

    expect(result.current.status).toBe('active');
    expect(result.current.currentInput).toBe('h');
  });

  it('tracks correct and incorrect characters accurately', () => {
    const { result } = renderHook(() =>
      useTypingEngine({
        initialConfig: {
          initialPassage: 'cat dog',
        },
      })
    );

    // Type 'c' (correct)
    act(() => {
      result.current.actions.handleKeyDown({
        key: 'c',
        ctrlKey: false,
        altKey: false,
        metaKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });

    // Type 'x' (incorrect, expected 'a')
    act(() => {
      result.current.actions.handleKeyDown({
        key: 'x',
        ctrlKey: false,
        altKey: false,
        metaKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });

    const currentWord = result.current.renderedWords[0];
    expect(currentWord.characters[0].state).toBe('correct');
    expect(currentWord.characters[1].state).toBe('incorrect');
    expect(currentWord.characters[2].state).toBe('pending');
  });

  it('handles Backspace and Ctrl+Backspace correctly', () => {
    const { result } = renderHook(() =>
      useTypingEngine({
        initialConfig: {
          initialPassage: 'typing engine',
        },
      })
    );

    // Type 't', 'y', 'p'
    ['t', 'y', 'p'].forEach((char) => {
      act(() => {
        result.current.actions.handleKeyDown({
          key: char,
          ctrlKey: false,
          altKey: false,
          metaKey: false,
          shiftKey: false,
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
    });

    expect(result.current.currentInput).toBe('typ');

    // Single backspace
    act(() => {
      result.current.actions.handleKeyDown({
        key: 'Backspace',
        ctrlKey: false,
        altKey: false,
        metaKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });

    expect(result.current.currentInput).toBe('ty');

    // Ctrl + Backspace -> deletes whole word input
    act(() => {
      result.current.actions.handleKeyDown({
        key: 'Backspace',
        ctrlKey: true,
        altKey: false,
        metaKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });

    expect(result.current.currentInput).toBe('');
  });

  it('advances word on Space and completes test when target words reached', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useTypingEngine({
        initialConfig: {
          mode: 'words',
          targetWordCount: 25,
          initialPassage: 'one two',
        },
        onTestComplete: onComplete,
      })
    );

    // Type 'one'
    ['o', 'n', 'e'].forEach((char) => {
      act(() => {
        result.current.actions.handleKeyDown({
          key: char,
          ctrlKey: false,
          altKey: false,
          metaKey: false,
          shiftKey: false,
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
    });

    // Hit Space to submit 'one'
    act(() => {
      result.current.actions.handleKeyDown({
        key: ' ',
        ctrlKey: false,
        altKey: false,
        metaKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });

    expect(result.current.currentWordIndex).toBe(1);
    expect(result.current.currentInput).toBe('');

    // Type 'two'
    ['t', 'w', 'o'].forEach((char) => {
      act(() => {
        result.current.actions.handleKeyDown({
          key: char,
          ctrlKey: false,
          altKey: false,
          metaKey: false,
          shiftKey: false,
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
    });

    // Test should complete when last word is typed
    expect(result.current.status).toBe('completed');
  });

  it('resets all state cleanly on restart', () => {
    const { result } = renderHook(() =>
      useTypingEngine({
        initialConfig: {
          initialPassage: 'sample passage',
        },
      })
    );

    act(() => {
      result.current.actions.handleKeyDown({
        key: 's',
        ctrlKey: false,
        altKey: false,
        metaKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });

    expect(result.current.status).toBe('active');
    expect(result.current.currentInput).toBe('s');

    act(() => {
      result.current.actions.restart(false);
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.currentInput).toBe('');
    expect(result.current.currentWordIndex).toBe(0);
    expect(result.current.metrics.rawWpm).toBe(0);
  });

  it('immediately completes and locks timer when final character of sentence is typed in custom or quote mode, preventing WPM decay', () => {
    const { result } = renderHook(() =>
      useTypingEngine({
        initialConfig: {
          mode: 'custom',
          initialPassage: 'flawless accuracy',
        },
      })
    );

    // Type 'flawless'
    'flawless'.split('').forEach((char) => {
      act(() => {
        result.current.actions.handleKeyDown({
          key: char,
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
    });

    // Space to advance
    act(() => {
      result.current.actions.handleKeyDown({
        key: ' ',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });

    expect(result.current.currentWordIndex).toBe(1);

    // Type 'accuracy'
    'accuracy'.split('').forEach((char) => {
      act(() => {
        result.current.actions.handleKeyDown({
          key: char,
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
    });

    // Should immediately complete upon typing 'y'
    expect(result.current.status).toBe('completed');
    expect(result.current.metrics.completedWordsCount).toBe(2);

    const completedWpm = result.current.metrics.netWpm;

    // Fast-forward time by 10 seconds: WPM should NOT reduce because timer was cleared
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.status).toBe('completed');
    expect(result.current.metrics.netWpm).toBe(completedWpm);
  });

  it('reports 0 Net WPM and 0% accuracy when typing only wrong words', () => {
    const { result } = renderHook(() =>
      useTypingEngine({
        initialConfig: {
          initialPassage: 'the quick brown fox',
        },
      })
    );

    // Type completely wrong word 'xyz' and space
    ['x', 'y', 'z', ' '].forEach((char) => {
      act(() => {
        result.current.actions.handleKeyDown({
          key: char,
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
    });

    // Type another wrong word 'abc' and space
    ['a', 'b', 'c', ' '].forEach((char) => {
      act(() => {
        result.current.actions.handleKeyDown({
          key: char,
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
    });

    // Advance 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Net WPM and accuracy must be 0 when only wrong words are typed
    expect(result.current.metrics.netWpm).toBe(0);
    expect(result.current.metrics.accuracy).toBe(0);
    expect(result.current.metrics.correctCharacters).toBe(0);
    expect(result.current.metrics.incorrectCharacters).toBeGreaterThan(0);
  });

  it('should immediately award positive Net WPM when typing correct words even after typing wrong words', () => {
    const { result } = renderHook(() =>
      useTypingEngine({
        initialConfig: {
          initialPassage: 'first second third fourth fifth',
          mode: 'time',
          durationSeconds: 30,
        },
      })
    );

    // Type first word completely wrong: 'wrong '
    'wrong '.split('').forEach((char) => {
      act(() => {
        result.current.actions.handleKeyDown({
          key: char,
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
    });

    // Advance 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Still 0 WPM after only wrong word
    expect(result.current.metrics.netWpm).toBe(0);

    // Now type second word completely correctly: 'second '
    'second '.split('').forEach((char) => {
      act(() => {
        result.current.actions.handleKeyDown({
          key: char,
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });
    });

    // Advance another 2 seconds (total 4 seconds)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Net WPM must now be positive because 'second ' was typed correctly
    expect(result.current.metrics.correctCharacters).toBe(7); // 'second' (6) + ' ' (1)
    expect(result.current.metrics.netWpm).toBeGreaterThan(0);
  });
});

