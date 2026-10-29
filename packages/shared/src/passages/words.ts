import { PassageDifficulty } from '../types';

/**
 * Standard touch-typing word lists categorized by difficulty.
 */
export const WORD_LIST_BEGINNER = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it',
  'that', 'for', 'they', 'with', 'as', 'not', 'on', 'she', 'at', 'by',
  'this', 'we', 'you', 'do', 'but', 'his', 'from', 'they', 'say', 'her',
  'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
  'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
  'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see',
  'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
  'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well',
  'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most',
  'us', 'is', 'are', 'was', 'were', 'has', 'had', 'been', 'fast', 'type',
  'hand', 'key', 'home', 'row', 'left', 'right', 'learn', 'speed', 'test', 'line'
];

export const WORD_LIST_INTERMEDIATE = [
  'accuracy', 'practice', 'keyboard', 'finger', 'position', 'technique',
  'exercise', 'progress', 'develop', 'muscle', 'memory', 'cadence',
  'steady', 'rhythm', 'standard', 'sentence', 'paragraph', 'number',
  'letter', 'symbol', 'capital', 'shift', 'control', 'button',
  'screen', 'display', 'monitor', 'laptop', 'desktop', 'hardware',
  'software', 'program', 'function', 'system', 'network', 'protocol',
  'interface', 'component', 'element', 'measure', 'minute', 'second',
  'result', 'average', 'personal', 'record', 'improve', 'challenge',
  'focus', 'concentrate', 'patience', 'effort', 'mastery', 'efficient',
  'smooth', 'balance', 'flexible', 'natural', 'fluent', 'dynamic'
];

export const WORD_LIST_ADVANCED = [
  'rhythmically', 'synchronization', 'extraordinary', 'infrastructure',
  'deterministic', 'architecture', 'authentication', 'authorization',
  'multiplayer', 'concurrency', 'asynchronous', 'cryptography',
  'configuration', 'implementation', 'sophisticated', 'unprecedented',
  'distraction-free', 'ergonomically', 'comprehensive', 'characteristic',
  'fluctuation', 'benchmarking', 'standardization', 'compatibility',
  'sub-millisecond', 'vulnerability', 'transformation', 'revolutionary',
  'countermeasure', 'unidirectional', 'acknowledgment', 'differentiation'
];

export const WORD_LIST_EXPERT = [
  'const { wpm, accuracy } = useTypingEngine();',
  'function calculateScore(total: number, errors: number): number;',
  'export async function POST(req: Request): Promise<Response>',
  'import { useState, useEffect, useRef, useCallback } from "react";',
  'SELECT id, username, raw_wpm, net_wpm FROM typing_sessions;',
  'git commit -m "feat(engine): deterministic keystroke tracking";',
  'chmod +x ./scripts/run-benchmarks.sh && ./scripts/run-benchmarks.sh;',
  'const [state, dispatch] = useReducer(typingEngineReducer, initialState);',
  'if (elapsedSeconds <= 0 || totalChars === 0) return { wpm: 0 };',
  'npm run test --workspaces --if-present && npm run build'
];
