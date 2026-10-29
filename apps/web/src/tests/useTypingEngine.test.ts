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
});
