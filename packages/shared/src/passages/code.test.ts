import { describe, it, expect } from 'vitest';
import {
  CODE_LANGUAGES,
  CODE_SNIPPETS,
  getCodeSnippets,
  getRandomCodeSnippet,
  calculateSymbolDensity,
  calculateSymbolAccuracy,
} from './code';
import { generatePassage } from './generator';

describe('Feature N: Code Snippets & Language Definitions', () => {
  it('defines 8 programming languages with metadata', () => {
    expect(CODE_LANGUAGES.length).toBe(8);
    const ts = CODE_LANGUAGES.find((l) => l.id === 'typescript');
    expect(ts).toBeDefined();
    expect(ts?.name).toBe('TypeScript');
    expect(ts?.ext).toBe('.ts');
  });

  it('contains curated idiomatic code snippets across languages', () => {
    expect(CODE_SNIPPETS.length).toBeGreaterThanOrEqual(10);

    const tsSnippets = getCodeSnippets('typescript');
    expect(tsSnippets.length).toBeGreaterThanOrEqual(2);

    const pySnippets = getCodeSnippets('python');
    expect(pySnippets.length).toBeGreaterThanOrEqual(2);

    const rustSnippets = getCodeSnippets('rust');
    expect(rustSnippets.length).toBeGreaterThanOrEqual(2);

    const sqlSnippets = getCodeSnippets('sql');
    expect(sqlSnippets.length).toBeGreaterThanOrEqual(1);
  });

  it('contains dedicated symbol and bracket sprint drills', () => {
    const symbolDrills = getCodeSnippets(undefined, 'symbols');
    expect(symbolDrills.length).toBeGreaterThanOrEqual(3);
    expect(symbolDrills.some((s) => s.id === 'sym-brackets-all')).toBe(true);
    expect(symbolDrills.some((s) => s.id === 'sym-operators-logic')).toBe(true);
  });

  it('returns a random snippet matching language filter', () => {
    const snippet = getRandomCodeSnippet('python');
    expect(snippet.language).toBe('python');
    expect(snippet.code).toContain('def ');
  });

  it('calculates symbol density percentage in code', () => {
    const highSymbol = '{ [ ( a !== b && c >= d ) ] };';
    const density = calculateSymbolDensity(highSymbol);
    expect(density).toBeGreaterThan(40);

    const lowSymbol = 'plain text without code';
    expect(calculateSymbolDensity(lowSymbol)).toBe(0);
  });

  it('calculates symbol-specific accuracy metrics', () => {
    const target = 'if (x === 42) { return true; }';
    // Typed with mistakes in symbols: used '=' instead of '===' and missed ';'
    const typed = 'if (x =   42) { return true  }';

    const result = calculateSymbolAccuracy(typed, target);
    expect(result.totalSymbols).toBeGreaterThan(5);
    expect(result.correctSymbols).toBeLessThan(result.totalSymbols);
    expect(result.accuracy).toBeLessThan(100);
    expect(result.accuracy).toBeGreaterThan(0);
  });

  it('integrates with generatePassage for mode="code"', () => {
    const passage = generatePassage({
      mode: 'code',
      codeLanguage: 'typescript',
      codeSnippetId: 'ts-async-fetch',
    });

    expect(passage).toContain('async function fetchJson');
    expect(passage).toContain('Promise<T>');
  });
});
