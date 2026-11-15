import React from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PracticePage from '@/app/practice/page';
import { useTypingEngine } from '@/features/typing/useTypingEngine';
import {
  calculateSymbolDensity,
  calculateSymbolAccuracy,
  getRandomCodeSnippet,
  CODE_LANGUAGES,
} from '@keysmasher/shared';

describe('Feature N: Coding Mode & Developer Syntax Practice', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the Code mode button in the practice controls bar', () => {
    render(<PracticePage />);
    const codeBtn = screen.getByRole('button', { name: /Code/i });
    expect(codeBtn).toBeInTheDocument();
  });

  it('activates Code mode, displaying language badges and category toggles', () => {
    render(<PracticePage />);
    const codeBtn = screen.getByRole('button', { name: /Code/i });
    fireEvent.click(codeBtn);

    // Verify language buttons are rendered
    expect(screen.getByRole('button', { name: /TypeScript/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Python/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rust/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go/i })).toBeInTheDocument();

    // Verify Snippet and Symbol Drill categories exist
    expect(screen.getByRole('button', { name: /Snippets/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Symbol Drill/i })).toBeInTheDocument();

    // Verify Code metadata banner is displayed
    const region = screen.getByRole('region', { name: /Typing passage input area/i });
    expect(region).toBeInTheDocument();
  });

  it('switches between programming languages smoothly', () => {
    render(<PracticePage />);
    const codeBtn = screen.getByRole('button', { name: /Code/i });
    fireEvent.click(codeBtn);

    // Click Python
    const pyBtn = screen.getByRole('button', { name: /Python/i });
    fireEvent.click(pyBtn);

    // Banner should reflect Python
    expect(screen.getAllByText(/Python/i).length).toBeGreaterThanOrEqual(1);

    // Click Rust
    const rustBtn = screen.getByRole('button', { name: /Rust/i });
    fireEvent.click(rustBtn);
    expect(screen.getAllByText(/Rust/i).length).toBeGreaterThanOrEqual(1);
  });

  it('switches to Symbol Sprint category', () => {
    render(<PracticePage />);
    const codeBtn = screen.getByRole('button', { name: /Code/i });
    fireEvent.click(codeBtn);

    const symbolDrillBtn = screen.getByRole('button', { name: /Symbol Drill/i });
    fireEvent.click(symbolDrillBtn);

    // Banner should indicate drill
    expect(screen.getAllByText(/Drill/i).length).toBeGreaterThanOrEqual(1);
  });

  it('verifies calculateSymbolDensity and calculateSymbolAccuracy work reliably', () => {
    const tsCode = 'const map = new Map<string, number>();';
    const density = calculateSymbolDensity(tsCode);
    expect(density).toBeGreaterThan(0.2); // Contains =, <, >, ;, (, ), ,

    // Accurate typing on symbols
    const res1 = calculateSymbolAccuracy(tsCode, tsCode);
    expect(res1.accuracy).toBe(100);
    expect(res1.totalSymbols).toBeGreaterThan(0);

    // Missed symbols
    const flawedTyped = 'const map = new Map(string  number);';
    const res2 = calculateSymbolAccuracy(flawedTyped, tsCode);
    expect(res2.accuracy).toBeLessThan(100);
  });

  it('advances tokens with Enter key when in Code mode', () => {
    const { result } = renderHook(() =>
      useTypingEngine({
        initialConfig: {
          mode: 'code',
          initialPassage: 'const x = 10;',
        },
      })
    );

    expect(result.current.currentWordIndex).toBe(0);

    // Type 'c', 'o', 'n', 's', 't'
    for (const char of 'const') {
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
    }

    expect(result.current.currentInput).toBe('const');

    // Press Enter to advance token in code mode
    act(() => {
      result.current.actions.handleKeyDown({
        key: 'Enter',
        ctrlKey: false,
        altKey: false,
        metaKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });

    expect(result.current.currentWordIndex).toBe(1);
    expect(result.current.currentInput).toBe('');
  });

  it('returns valid random code snippets across all supported languages', () => {
    for (const lang of CODE_LANGUAGES) {
      const snippet = getRandomCodeSnippet(lang.id, 'snippet');
      expect(snippet).toBeDefined();
      expect(snippet.language).toBe(lang.id);
      expect(snippet.code.length).toBeGreaterThan(10);
    }
  });
});
