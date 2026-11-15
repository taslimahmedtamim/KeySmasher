export type CodeLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'rust'
  | 'go'
  | 'sql'
  | 'html_css'
  | 'cpp';

export type CodeCategory = 'snippet' | 'symbols';

export interface CodeSnippet {
  id: string;
  language: CodeLanguage;
  category: CodeCategory;
  title: string;
  description: string;
  code: string;
  difficulty: 'intermediate' | 'advanced' | 'expert';
}

export const CODE_LANGUAGES: { id: CodeLanguage; name: string; ext: string; icon: string }[] = [
  { id: 'typescript', name: 'TypeScript', ext: '.ts', icon: 'TS' },
  { id: 'javascript', name: 'JavaScript', ext: '.js', icon: 'JS' },
  { id: 'python', name: 'Python', ext: '.py', icon: 'PY' },
  { id: 'rust', name: 'Rust', ext: '.rs', icon: 'RS' },
  { id: 'go', name: 'Go', ext: '.go', icon: 'GO' },
  { id: 'sql', name: 'SQL', ext: '.sql', icon: 'SQL' },
  { id: 'html_css', name: 'HTML & CSS', ext: '.html', icon: 'UI' },
  { id: 'cpp', name: 'C++', ext: '.cpp', icon: 'C++' },
];

export const CODE_SNIPPETS: CodeSnippet[] = [
  // --- TypeScript ---
  {
    id: 'ts-async-fetch',
    language: 'typescript',
    category: 'snippet',
    title: 'Generic Async Fetcher',
    description: 'Type-safe HTTP fetch with generics and error handling',
    difficulty: 'intermediate',
    code: 'async function fetchJson<T>(url: string): Promise<T> {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);\n  return (await res.json()) as T;\n}',
  },
  {
    id: 'ts-discriminated-union',
    language: 'typescript',
    category: 'snippet',
    title: 'Discriminated Union & Matcher',
    description: 'Pattern matching across typed state variants',
    difficulty: 'advanced',
    code: 'type Result<T, E = Error> =\n  | { status: "success"; data: T }\n  | { status: "failure"; error: E };\n\nconst unwrap = <T>(res: Result<T>): T => {\n  if (res.status === "failure") throw res.error;\n  return res.data;\n};',
  },
  {
    id: 'ts-debounce-hook',
    language: 'typescript',
    category: 'snippet',
    title: 'Debounce Callback Hook',
    description: 'Higher-order debounce function with typed arguments',
    difficulty: 'advanced',
    code: 'export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {\n  let timer: ReturnType<typeof setTimeout> | null = null;\n  return (...args: Parameters<T>) => {\n    if (timer) clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}',
  },

  // --- JavaScript ---
  {
    id: 'js-promise-pipeline',
    language: 'javascript',
    category: 'snippet',
    title: 'Async Promise Pipeline',
    description: 'Parallel mapped promise resolution with error fallback',
    difficulty: 'intermediate',
    code: 'const processQueue = async (items, handler) => {\n  const results = await Promise.allSettled(\n    items.map(async (item) => handler(item))\n  );\n  return results.filter((r) => r.status === "fulfilled").map((r) => r.value);\n};',
  },
  {
    id: 'js-event-emitter',
    language: 'javascript',
    category: 'snippet',
    title: 'Lightweight Event Hub',
    description: 'Simple pub/sub event dispatcher class',
    difficulty: 'intermediate',
    code: 'class EventEmitter {\n  events = new Map();\n  on(event, listener) {\n    if (!this.events.has(event)) this.events.set(event, new Set());\n    this.events.get(event).add(listener);\n  }\n  emit(event, ...payload) {\n    this.events.get(event)?.forEach((fn) => fn(...payload));\n  }\n}',
  },

  // --- Python ---
  {
    id: 'py-list-comprehension',
    language: 'python',
    category: 'snippet',
    title: 'Comprehensions & Filtering',
    description: 'Dictionary and list comprehensions with lambda sort',
    difficulty: 'intermediate',
    code: 'def filter_top_performers(records: list[dict], threshold: float = 85.0) -> list[str]:\n    valid = [r for r in records if r.get("accuracy", 0) >= threshold]\n    sorted_records = sorted(valid, key=lambda x: x.get("net_wpm", 0), reverse=True)\n    return [r["username"] for r in sorted_records[:10]]',
  },
  {
    id: 'py-dataclass-cache',
    language: 'python',
    category: 'snippet',
    title: 'Dataclass & In-Memory Cache',
    description: 'Decorated dataclass with expiry checking',
    difficulty: 'advanced',
    code: 'from dataclasses import dataclass, field\nimport time\n\n@dataclass\nclass CachedItem:\n    key: str\n    value: any\n    ttl_seconds: int = 60\n    created_at: float = field(default_factory=time.time)\n\n    def is_expired(self) -> bool:\n        return (time.time() - self.created_at) > self.ttl_seconds',
  },

  // --- Rust ---
  {
    id: 'rs-result-match',
    language: 'rust',
    category: 'snippet',
    title: 'Option & Result Unwrapping',
    description: 'Idiomatic pattern matching and vector transformations in Rust',
    difficulty: 'advanced',
    code: 'pub fn parse_scores(raw_data: &[&str]) -> Result<Vec<u32>, String> {\n    raw_data\n        .iter()\n        .map(|entry| entry.trim().parse::<u32>().map_err(|e| e.to_string()))\n        .collect()\n}',
  },
  {
    id: 'rs-struct-impl',
    language: 'rust',
    category: 'snippet',
    title: 'Struct with Impl & Traits',
    description: 'Safe memory, ownership, and immutable references',
    difficulty: 'expert',
    code: '#[derive(Debug, Clone, PartialEq)]\npub struct RacerProfile {\n    pub username: String,\n    pub mmr: u32,\n    pub division: String,\n}\n\nimpl RacerProfile {\n    pub fn new(name: &str, initial_rating: u32) -> Self {\n        Self {\n            username: name.to_string(),\n            mmr: initial_rating,\n            division: String::from("Silver"),\n        }\n    }\n}',
  },

  // --- Go ---
  {
    id: 'go-goroutine-channel',
    language: 'go',
    category: 'snippet',
    title: 'Goroutines & Channels',
    description: 'Concurrent worker pool pattern with select and channels',
    difficulty: 'intermediate',
    code: 'func WorkerPool(jobs <-chan int, results chan<- int, workerID int) {\n\tfor j := range jobs {\n\t\tfmt.Printf("Worker %d started job %d\\n", workerID, j)\n\t\ttime.Sleep(time.Millisecond * 100)\n\t\tresults <- j * 2\n\t}\n}',
  },
  {
    id: 'go-http-handler',
    language: 'go',
    category: 'snippet',
    title: 'Standard HTTP JSON Handler',
    description: 'Go net/http handler with struct encoding and status response',
    difficulty: 'intermediate',
    code: 'func HealthHandler(w http.ResponseWriter, r *http.Request) {\n\tw.Header().Set("Content-Type", "application/json")\n\tw.WriteHeader(http.StatusOK)\n\tresp := map[string]string{"status": "healthy", "service": "keysmasher"}\n\t_ = json.NewEncoder(w).Encode(resp)\n}',
  },

  // --- SQL ---
  {
    id: 'sql-window-ranking',
    language: 'sql',
    category: 'snippet',
    title: 'Window Function & Leaderboards',
    description: 'DENSE_RANK with partition, joins, and aggregates',
    difficulty: 'intermediate',
    code: 'SELECT\n  p.username,\n  r.room_code,\n  r.net_wpm,\n  r.accuracy,\n  DENSE_RANK() OVER (PARTITION BY r.room_code ORDER BY (r.net_wpm * r.accuracy / 100.0) DESC) AS rank\nFROM race_results r\nJOIN profiles p ON p.id = r.user_id\nWHERE r.created_at >= NOW() - INTERVAL "7 days"\nORDER BY rank ASC\nLIMIT 50;',
  },

  // --- HTML & CSS ---
  {
    id: 'html-css-flex-card',
    language: 'html_css',
    category: 'snippet',
    title: 'Flexbox Badge & Card Layout',
    description: 'Semantic markup paired with responsive utility CSS',
    difficulty: 'intermediate',
    code: '<div class="race-card flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg">\n  <span class="badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300">\n    #1 Grandmaster\n  </span>\n  <button type="button" class="btn-sm hover:scale-105 transition-transform font-bold text-white">Join Duel</button>\n</div>',
  },

  // --- C++ ---
  {
    id: 'cpp-lambda-sort',
    language: 'cpp',
    category: 'snippet',
    title: 'Modern STL Vector & Lambda Sort',
    description: 'C++20 algorithm with move semantics and structured bindings',
    difficulty: 'advanced',
    code: '#include <vector>\n#include <algorithm>\n#include <iostream>\n\nstruct Player {\n    std::string name;\n    int wpm;\n    double accuracy;\n};\n\nvoid rankPlayers(std::vector<Player>& players) {\n    std::sort(players.begin(), players.end(), [](const Player& a, const Player& b) {\n        return (a.wpm * a.accuracy) > (b.wpm * b.accuracy);\n    });\n}',
  },

  // --- SYMBOL SPRINTS ---
  {
    id: 'sym-brackets-all',
    language: 'typescript',
    category: 'symbols',
    title: 'Bracket & Enclosure Sprint',
    description: 'Curved, square, and curly bracket agility drill',
    difficulty: 'intermediate',
    code: '{ [ ( "keysmasher" ) ] } && { [ ( a[0] ) ] } === { [ ( fn() ) ] };\nconst matrix = [ { id: [1, 2, 3] }, { refs: (a, b) => [a[b]] } ];',
  },
  {
    id: 'sym-operators-logic',
    language: 'typescript',
    category: 'symbols',
    title: 'Operator & Equality Gauntlet',
    description: 'Strict equality, logical operators, arrows, and nullish coalescing',
    difficulty: 'advanced',
    code: '(x !== null && y === undefined) || (z ?? 42) >= (a <= b ? a : b);\nconst lambda = (a: number, b: number): boolean => a % 2 === 0 && b != 0;',
  },
  {
    id: 'sym-delimiters-punct',
    language: 'typescript',
    category: 'symbols',
    title: 'Semicolons, Colons & Path Sprint',
    description: 'Punctuation mastery: `::`, `->`, `;`, `:`, `@`, `#`, `$`',
    difficulty: 'advanced',
    code: 'std::vector<std::string>::iterator it = map.find("key");\n$elem.on("click", (evt) => { target.style.color = "#06b6d4"; });\n@Decorator({ name: "UserRecord", id: 0xDEADBEEF });',
  },
];

/**
 * Returns snippets filtered by language and category.
 */
export function getCodeSnippets(
  language?: CodeLanguage,
  category?: CodeCategory
): CodeSnippet[] {
  return CODE_SNIPPETS.filter((s) => {
    if (language && s.language !== language) return false;
    if (category && s.category !== category) return false;
    return true;
  });
}

/**
 * Returns a random code snippet matching optional language and category filters.
 */
export function getRandomCodeSnippet(
  language?: CodeLanguage,
  category?: CodeCategory
): CodeSnippet {
  const matches = getCodeSnippets(language, category);
  if (matches.length === 0) {
    return CODE_SNIPPETS[0];
  }
  const randomIndex = Math.floor(Math.random() * matches.length);
  return matches[randomIndex];
}

const PROGRAMMING_SYMBOLS = new Set([
  '{', '}', '[', ']', '(', ')', '<', '>', '=', '+', '-', '*', '/', '%',
  '&', '|', '!', '?', ';', ':', '.', ',', '\'', '"', '`', '~', '^', '@',
  '#', '$', '_', '\\',
]);

/**
 * Calculates the percentage of programming symbols in a code string.
 */
export function calculateSymbolDensity(code: string): number {
  if (!code || code.length === 0) return 0;
  let symbolCount = 0;
  for (let i = 0; i < code.length; i++) {
    if (PROGRAMMING_SYMBOLS.has(code[i])) {
      symbolCount++;
    }
  }
  return Math.round((symbolCount / code.length) * 100);
}

export interface SymbolAccuracyResult {
  totalSymbols: number;
  correctSymbols: number;
  incorrectSymbols: number;
  accuracy: number;
}

/**
 * Computes accuracy strictly on programming symbols (brackets, operators, punctuation).
 */
export function calculateSymbolAccuracy(
  typed: string,
  target: string
): SymbolAccuracyResult {
  if (!target || target.length === 0) {
    return { totalSymbols: 0, correctSymbols: 0, incorrectSymbols: 0, accuracy: 100 };
  }

  let totalSymbols = 0;
  let correctSymbols = 0;
  let incorrectSymbols = 0;

  const compareLength = Math.min(typed.length, target.length);

  for (let i = 0; i < compareLength; i++) {
    const targetChar = target[i];
    if (PROGRAMMING_SYMBOLS.has(targetChar)) {
      totalSymbols++;
      if (typed[i] === targetChar) {
        correctSymbols++;
      } else {
        incorrectSymbols++;
      }
    }
  }

  // Count missed symbols if target is longer
  for (let i = compareLength; i < target.length; i++) {
    if (PROGRAMMING_SYMBOLS.has(target[i])) {
      totalSymbols++;
    }
  }

  const accuracy = totalSymbols > 0
    ? Math.round((correctSymbols / totalSymbols) * 1000) / 10
    : 100;

  return {
    totalSymbols,
    correctSymbols,
    incorrectSymbols,
    accuracy,
  };
}
