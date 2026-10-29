import { WORD_LIST_BEGINNER, WORD_LIST_INTERMEDIATE } from '../passages/words';

const CONNECTOR_WORDS = ['the', 'and', 'for', 'with', 'that', 'from', 'this', 'have', 'were'];

/**
 * Generates an adaptive typing drill passage specifically weighted to exercise
 * the user's identified weak keys while maintaining natural English word rhythm.
 */
export function generateWeakKeyDrillPassage(
  weakKeys: string[],
  targetWordCount: number = 25
): string {
  const normalizedWeak = weakKeys
    .map((k) => k.toLowerCase().trim())
    .filter((k) => k.length === 1 && k !== ' ');

  // If no weak keys specified, return a diverse pangram-focused balanced drill
  if (normalizedWeak.length === 0) {
    return 'the quick brown fox jumps over the lazy dog while five boxing wizards jump quickly across twenty five pack of red foxes';
  }

  const allWords = Array.from(new Set([...WORD_LIST_BEGINNER, ...WORD_LIST_INTERMEDIATE]));

  // Find candidate words containing at least one weak key
  const targetedWords = allWords.filter((word) => {
    return normalizedWeak.some((weakKey) => word.includes(weakKey));
  });

  // If very few words matched, fallback to all words
  const pool = targetedWords.length >= 10 ? targetedWords : allWords;

  // Shuffle candidate pool
  const shuffled = [...pool].sort(() => 0.5 - Math.random());

  const selectedWords: string[] = [];
  let weakKeyIndex = 0;

  for (let i = 0; i < targetWordCount; i++) {
    // Every 4th word, insert a natural connector word to preserve cadence
    if (i > 0 && i % 4 === 0) {
      const conn = CONNECTOR_WORDS[Math.floor(Math.random() * CONNECTOR_WORDS.length)];
      selectedWords.push(conn);
      continue;
    }

    // Try to find a word featuring the current target weak key
    const currentTargetKey = normalizedWeak[weakKeyIndex % normalizedWeak.length];
    weakKeyIndex++;

    const matchingWord = shuffled.find(
      (w) => w.includes(currentTargetKey) && !selectedWords.slice(-3).includes(w)
    );

    if (matchingWord) {
      selectedWords.push(matchingWord);
    } else {
      const fallbackWord = shuffled[i % shuffled.length];
      selectedWords.push(fallbackWord);
    }
  }

  return selectedWords.slice(0, targetWordCount).join(' ');
}
