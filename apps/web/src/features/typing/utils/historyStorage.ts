import { PassageDifficulty, TestMode } from '@keysmasher/shared';

const STORAGE_KEY = 'keysmasher_guest_history';

let memoryStorage: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch {
    // Fallback to in-memory storage
  }
  return memoryStorage[key] || null;
}

function safeSetItem(key: string, value: string): void {
  memoryStorage[key] = value;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Storage quota or permission blocked, memoryStorage acts as fallback
  }
}

function safeRemoveItem(key: string): void {
  delete memoryStorage[key];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore
  }
}

export interface SavedTestSession {
  id: string;
  timestamp: number;
  mode: TestMode;
  rawWpm: number;
  netWpm: number;
  accuracy: number;
  cpm: number;
  consistency: number;
  elapsedSeconds: number;
  difficulty: PassageDifficulty;
  errorCount: number;
  targetDuration?: number;
  targetWords?: number;
  keyStats?: Record<string, { attempts: number; errors: number; confusion?: Record<string, number> }>;
}

const CUMULATIVE_KEY_STATS_KEY = 'keysmasher_cumulative_key_stats';

export function getCumulativeKeyStats(): Record<
  string,
  { attempts: number; errors: number; confusion: Record<string, number> }
> {
  const result: Record<
    string,
    { attempts: number; errors: number; confusion: Record<string, number> }
  > = {};

  try {
    const raw = safeGetItem(CUMULATIVE_KEY_STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        Object.assign(result, parsed);
      }
    }
  } catch {
    // Ignore
  }

  // Also merge with any per-session stats from stored sessions if not already in cumulative store
  if (Object.keys(result).length === 0) {
    const sessions = getStoredSessions();
    for (const s of sessions) {
      if (s.keyStats) {
        for (const [k, v] of Object.entries(s.keyStats)) {
          if (!result[k]) {
            result[k] = { attempts: 0, errors: 0, confusion: {} };
          }
          result[k].attempts += v.attempts || 0;
          result[k].errors += v.errors || 0;
          if (v.confusion) {
            for (const [confusedChar, count] of Object.entries(v.confusion)) {
              result[k].confusion[confusedChar] = (result[k].confusion[confusedChar] || 0) + count;
            }
          }
        }
      }
    }
  }

  return result;
}

export function mergeSessionKeyStats(
  newStats: Record<string, { attempts: number; errors: number; confusion?: Record<string, number> }>
): void {
  try {
    const current = getCumulativeKeyStats();
    for (const [char, stat] of Object.entries(newStats)) {
      if (!current[char]) {
        current[char] = { attempts: 0, errors: 0, confusion: {} };
      }
      current[char].attempts += stat.attempts || 0;
      current[char].errors += stat.errors || 0;
      if (stat.confusion) {
        for (const [confusedChar, count] of Object.entries(stat.confusion)) {
          current[char].confusion[confusedChar] =
            (current[char].confusion[confusedChar] || 0) + count;
        }
      }
    }
    safeSetItem(CUMULATIVE_KEY_STATS_KEY, JSON.stringify(current));
  } catch {
    // Ignore
  }
}

export interface SessionStats {
  totalTests: number;
  avgWpm: number;
  bestWpm: number;
  avgAccuracy: number;
  avgConsistency: number;
}

export function getStoredSessions(): SavedTestSession[] {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSessionResult(
  result: Omit<SavedTestSession, 'id' | 'timestamp'>
): SavedTestSession {
  const item: SavedTestSession = {
    ...result,
    id: `test-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  try {
    const existing = getStoredSessions();
    // Keep up to 25 recent tests in guest storage
    const updated = [item, ...existing].slice(0, 25);
    safeSetItem(STORAGE_KEY, JSON.stringify(updated));

    if (result.keyStats) {
      mergeSessionKeyStats(result.keyStats);
    }
  } catch {
    // Ignore
  }

  return item;
}

export function getSessionStats(sessions: SavedTestSession[]): SessionStats {
  if (!sessions || sessions.length === 0) {
    return {
      totalTests: 0,
      avgWpm: 0,
      bestWpm: 0,
      avgAccuracy: 100,
      avgConsistency: 100,
    };
  }

  const totalTests = sessions.length;
  const bestWpm = Math.max(...sessions.map((s) => s.netWpm));
  const avgWpm = Math.round(sessions.reduce((acc, s) => acc + s.netWpm, 0) / totalTests);
  const avgAccuracy = Math.round(sessions.reduce((acc, s) => acc + s.accuracy, 0) / totalTests);
  const avgConsistency = Math.round(
    sessions.reduce((acc, s) => acc + s.consistency, 0) / totalTests
  );

  return {
    totalTests,
    avgWpm,
    bestWpm,
    avgAccuracy,
    avgConsistency,
  };
}

export function clearStoredSessions(): void {
  safeRemoveItem(STORAGE_KEY);
}
