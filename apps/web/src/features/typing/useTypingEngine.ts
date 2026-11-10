'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  calculateTypingMetrics,
  calculateConsistency,
  generatePassage,
  PassageDifficulty,
  TestMode,
  TimeDurationOption,
  WordCountOption,
} from '@keysmasher/shared';
import {
  CharacterState,
  EngineStatus,
  ExtendedTypingMetrics,
  RenderedChar,
  RenderedWord,
  TypingEngineConfig,
  WpmHistoryPoint,
} from './types';
import { playKeystrokeSound } from './utils/soundEffects';

export const DEFAULT_CONFIG: TypingEngineConfig = {
  mode: 'time',
  durationSeconds: 30,
  targetWordCount: 25,
  difficulty: 'intermediate',
  allowPaste: false,
  includePunctuation: false,
  includeNumbers: false,
  soundTheme: 'off',
  soundVolume: 0.85,
};

export interface UseTypingEngineProps {
  initialConfig?: Partial<TypingEngineConfig>;
  onTestComplete?: (metrics: ExtendedTypingMetrics, history: WpmHistoryPoint[]) => void;
}

interface CharacterCounts {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
  totalTyped: number;
}

/**
 * Compute live cumulative character accuracy counts across typed words and the active word buffer.
 */
function computeCharacterCounts(
  expectedWords: string[],
  typedWords: string[],
  currentInput: string,
  currentWordIndex: number
): CharacterCounts {
  let correct = 0;
  let incorrect = 0;
  let extra = 0;
  let missed = 0;
  let totalTyped = 0;

  for (let w = 0; w < expectedWords.length; w++) {
    const expWord = expectedWords[w] || '';
    const actWord = w === currentWordIndex ? currentInput : typedWords[w] || '';
    const isPastWord = w < currentWordIndex;
    const isCurrentWord = w === currentWordIndex;

    if (!isPastWord && !isCurrentWord) continue;

    if (isPastWord) {
      const isWordFullyCorrect = actWord === expWord;
      if (isWordFullyCorrect) {
        correct += expWord.length;
        totalTyped += expWord.length;
        // Add space between words (not after the final word)
        if (w < expectedWords.length - 1) {
          totalTyped++; // the space key
          correct++; // word was submitted with space
        }
      } else {
        // Word was submitted with errors or incomplete: characters do not award speed
        totalTyped += actWord.length;
        if (w < expectedWords.length - 1) {
          totalTyped++; // the space key
        }

        const minLen = Math.min(expWord.length, actWord.length);
        for (let c = 0; c < minLen; c++) {
          if (expWord[c] !== actWord[c]) {
            incorrect++;
          }
        }

        if (actWord.length > expWord.length) {
          const extraCount = actWord.length - expWord.length;
          extra += extraCount;
          incorrect += extraCount;
        }

        if (actWord.length < expWord.length) {
          const missedCount = expWord.length - actWord.length;
          missed += missedCount;
          incorrect += missedCount;
        }

        // Space key submitted after an erroneous word is an uncorrected error
        incorrect++;
      }
    } else if (isCurrentWord) {
      // Actively typing current word
      const minLen = Math.min(expWord.length, actWord.length);
      let hasErrorSoFar = false;
      for (let c = 0; c < minLen; c++) {
        totalTyped++;
        if (expWord[c] === actWord[c] && !hasErrorSoFar) {
          correct++;
        } else {
          hasErrorSoFar = true;
          incorrect++;
        }
      }

      if (actWord.length > expWord.length) {
        const extraCount = actWord.length - expWord.length;
        extra += extraCount;
        incorrect += extraCount;
        totalTyped += extraCount;
      }
    }
  }

  return { correct, incorrect, extra, missed, totalTyped };
}

export function useTypingEngine(props: UseTypingEngineProps = {}) {
  const [config, setConfig] = useState<TypingEngineConfig>({
    ...DEFAULT_CONFIG,
    ...props.initialConfig,
  });

  const [status, setStatus] = useState<EngineStatus>('idle');
  const [passage, setPassage] = useState<string>('');
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [wpmHistory, setWpmHistory] = useState<WpmHistoryPoint[]>([]);

  // Refs for timer and synchronization
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastRecordedSecondRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<EngineStatus>('idle');
  statusRef.current = status;
  const keyStatsRef = useRef<
    Record<string, { attempts: number; errors: number; confusion: Record<string, number> }>
  >({});
  const errorsInSecondRef = useRef<number>(0);
  const keystrokesInSecondRef = useRef<number>(0);
  const elapsedSecondsRef = useRef<number>(elapsedSeconds);
  elapsedSecondsRef.current = elapsedSeconds;
  const wpmHistoryRef = useRef<WpmHistoryPoint[]>([]);
  wpmHistoryRef.current = wpmHistory;
  const configRef = useRef<TypingEngineConfig>(config);
  configRef.current = config;
  const onTestCompleteRef = useRef(props.onTestComplete);
  onTestCompleteRef.current = props.onTestComplete;
  const typedWordsRef = useRef<string[]>(typedWords);
  typedWordsRef.current = typedWords;
  const currentInputRef = useRef<string>(currentInput);
  currentInputRef.current = currentInput;
  const currentWordIndexRef = useRef<number>(currentWordIndex);
  currentWordIndexRef.current = currentWordIndex;

  const lastAppliedInitialPassageRef = useRef<string | undefined>(undefined);

  // Generate or load initial passage (consumes initialPassage once so subsequent restarts/mode switches aren't locked)
  const initializePassage = useCallback(
    (cfg: TypingEngineConfig, forceGenerate: boolean = false): string => {
      if (
        !forceGenerate &&
        cfg.initialPassage &&
        cfg.initialPassage !== lastAppliedInitialPassageRef.current
      ) {
        lastAppliedInitialPassageRef.current = cfg.initialPassage;
        return cfg.initialPassage;
      }
      return generatePassage({
        mode: cfg.mode,
        durationSeconds: cfg.durationSeconds,
        targetWordCount: cfg.targetWordCount,
        difficulty: cfg.difficulty,
        includePunctuation: cfg.includePunctuation,
        includeNumbers: cfg.includeNumbers,
        customText: cfg.customText,
        quoteLength: cfg.quoteLength,
      });
    },
    []
  );

  // Passage-defining parameters key: only regenerate passage when test mode or content settings change
  // Sound theme, volume, or paste toggles must NEVER alter or wipe the passage text!
  const passageDepsKey = `${config.mode}-${config.difficulty}-${config.durationSeconds}-${config.targetWordCount}-${config.quoteLength || ''}-${config.includePunctuation}-${config.includeNumbers}-${config.customText || ''}-${config.initialPassage || ''}`;

  // Initialize on mount or when passage configuration changes
  useEffect(() => {
    const newPassage = initializePassage(config, false);
    setPassage(newPassage);
    const wordsCount = newPassage.split(/\s+/).length;
    setTypedWords(new Array(wordsCount).fill(''));
    setCurrentWordIndex(0);
    setCurrentInput('');
    setStatus('idle');
    setElapsedSeconds(0);
    setWpmHistory([]);
    wpmHistoryRef.current = [];
    startTimeRef.current = null;
    lastRecordedSecondRef.current = 0;
    keyStatsRef.current = {};
    errorsInSecondRef.current = 0;
    keystrokesInSecondRef.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passageDepsKey, initializePassage]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Target expected words list
  const expectedWords = useMemo(() => {
    return passage.length > 0 ? passage.trim().split(/\s+/) : [];
  }, [passage]);
  const expectedWordsRef = useRef<string[]>(expectedWords);
  expectedWordsRef.current = expectedWords;

  // Calculate live cumulative character metrics
  const characterCounts = useMemo(
    () => computeCharacterCounts(expectedWords, typedWords, currentInput, currentWordIndex),
    [expectedWords, typedWords, currentInput, currentWordIndex]
  );

  // Deterministic metrics
  const metrics: ExtendedTypingMetrics = useMemo(() => {
    const baseMetrics = calculateTypingMetrics({
      totalTypedCharacters: characterCounts.totalTyped,
      correctCharacters: characterCounts.correct,
      incorrectCharacters: characterCounts.incorrect,
      elapsedSeconds: elapsedSeconds,
    });

    const timeRemaining =
      config.mode === 'time'
        ? Math.max(0, config.durationSeconds - elapsedSeconds)
        : 0;

    const consistency = calculateConsistency(wpmHistory.map((p) => p.rawWpm));

    return {
      ...baseMetrics,
      timeRemaining: Math.ceil(timeRemaining),
      completedWordsCount: currentWordIndex,
      totalWordsCount: expectedWords.length,
      missedCharacters: characterCounts.missed,
      extraCharacters: characterCounts.extra,
      consistency,
      keyStats: { ...keyStatsRef.current },
    };
  }, [characterCounts, elapsedSeconds, config, currentWordIndex, expectedWords.length, wpmHistory]);

  // End / Complete test (reads latest refs so timer callbacks never capture stale metrics/history)
  const completeTest = useCallback((overrideElapsed?: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    let finalElapsed = overrideElapsed ?? elapsedSecondsRef.current;
    if (overrideElapsed === undefined && startTimeRef.current) {
      finalElapsed = Math.max(0.1, (Date.now() - startTimeRef.current) / 1000);
    }
    setElapsedSeconds(finalElapsed);
    startTimeRef.current = null;

    statusRef.current = 'completed';
    setStatus('completed');

    if (onTestCompleteRef.current) {
      const latestCounts = computeCharacterCounts(
        expectedWordsRef.current,
        typedWordsRef.current,
        currentInputRef.current,
        currentWordIndexRef.current
      );
      const latestHistory = wpmHistoryRef.current;
      const latestConfig = configRef.current;
      const baseMetrics = calculateTypingMetrics({
        totalTypedCharacters: latestCounts.totalTyped,
        correctCharacters: latestCounts.correct,
        incorrectCharacters: latestCounts.incorrect,
        elapsedSeconds: finalElapsed,
      });

      const finalMetrics: ExtendedTypingMetrics = {
        ...baseMetrics,
        timeRemaining:
          latestConfig.mode === 'time'
            ? Math.max(0, Math.ceil(latestConfig.durationSeconds - finalElapsed))
            : 0,
        completedWordsCount: currentWordIndexRef.current,
        totalWordsCount: expectedWordsRef.current.length,
        missedCharacters: latestCounts.missed,
        extraCharacters: latestCounts.extra,
        consistency: calculateConsistency(latestHistory.map((p) => p.rawWpm)),
        keyStats: { ...keyStatsRef.current },
      };

      onTestCompleteRef.current(finalMetrics, latestHistory);
    }
  }, []);

  // Start test & timer (guaranteeing single interval)
  const startTest = useCallback(() => {
    if (statusRef.current === 'active') return;

    statusRef.current = 'active';
    setStatus('active');
    const now = Date.now();
    startTimeRef.current = now;
    lastRecordedSecondRef.current = 0;
    errorsInSecondRef.current = 0;
    keystrokesInSecondRef.current = 0;
    wpmHistoryRef.current = [];

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const currentNow = Date.now();
      const elapsed = (currentNow - startTimeRef.current) / 1000;

      // Record per-second snapshots using live refs so closures never go stale
      const wholeSeconds = Math.floor(elapsed);
      if (wholeSeconds > lastRecordedSecondRef.current) {
        const prevSecond = lastRecordedSecondRef.current;
        const deltaSeconds = Math.max(1, wholeSeconds - prevSecond);
        lastRecordedSecondRef.current = wholeSeconds;
        setElapsedSeconds(wholeSeconds);

        if (wholeSeconds > 0) {
          const liveCounts = computeCharacterCounts(
            expectedWordsRef.current,
            typedWordsRef.current,
            currentInputRef.current,
            currentWordIndexRef.current
          );
          const snapshot = calculateTypingMetrics({
            totalTypedCharacters: liveCounts.totalTyped,
            correctCharacters: liveCounts.correct,
            incorrectCharacters: liveCounts.incorrect,
            elapsedSeconds: wholeSeconds,
          });

          const errorsThisSecond = errorsInSecondRef.current;
          errorsInSecondRef.current = 0;
          const keystrokesThisSecond = keystrokesInSecondRef.current;
          keystrokesInSecondRef.current = 0;
          const burstWpm = Math.round(((keystrokesThisSecond / 5) / deltaSeconds) * 60);

          const nextPoint: WpmHistoryPoint = {
            second: wholeSeconds,
            rawWpm: snapshot.rawWpm,
            netWpm: snapshot.netWpm,
            accuracy: snapshot.accuracy,
            errors: errorsThisSecond,
            burstWpm,
          };

          const updatedHistory = [...wpmHistoryRef.current, nextPoint];
          wpmHistoryRef.current = updatedHistory;
          setWpmHistory(updatedHistory);
        }
      }

      // Check time expiration in time mode
      const currentConfig = configRef.current;
      if (currentConfig.mode === 'time' && elapsed >= currentConfig.durationSeconds) {
        completeTest(currentConfig.durationSeconds);
      }
    }, 100);
  }, [completeTest]);

  // Reset / Restart test
  const restart = useCallback(
    (newPassage = false) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      startTimeRef.current = null;
      lastRecordedSecondRef.current = 0;

      const p = newPassage ? initializePassage(config, true) : passage;
      if (newPassage) {
        setPassage(p);
      }
      const wordsCount = p.split(/\s+/).length;
      const resetWords = new Array(wordsCount).fill('');
      setTypedWords(resetWords);
      setCurrentWordIndex(0);
      setCurrentInput('');
      setStatus('idle');
      setElapsedSeconds(0);
      setWpmHistory([]);
      wpmHistoryRef.current = [];
      typedWordsRef.current = resetWords;
      currentWordIndexRef.current = 0;
      currentInputRef.current = '';
      keyStatsRef.current = {};
      errorsInSecondRef.current = 0;
      keystrokesInSecondRef.current = 0;
      inputRef.current?.focus();
    },
    [config, initializePassage, passage]
  );

  // Keystroke handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Ignore Meta/Control combinations other than Backspace (e.g. Ctrl+C, Ctrl+A)
      if (e.ctrlKey || e.altKey || e.metaKey) {
        if (e.key === 'Backspace') {
          // Ctrl + Backspace -> delete entire current word
          e.preventDefault();
          setCurrentInput('');
          return;
        }
        return;
      }

      // Tab or Escape to restart
      if (e.key === 'Escape' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        restart(false);
        return;
      }

      // If test is completed, ignore further input
      if (statusRef.current === 'completed') {
        return;
      }

      // Start test on first valid keystroke if idle
      if (statusRef.current === 'idle') {
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
          startTest();
        }
      }

      // Handle Space: advance word
      if (e.key === ' ') {
        e.preventDefault();
        if (currentInput.length === 0) return; // Don't advance on empty space

        playKeystrokeSound(config.soundTheme, false, 'space', config.soundVolume);
        keystrokesInSecondRef.current += 1;

        // Record space attempt
        const spaceChar = ' ';
        if (!keyStatsRef.current[spaceChar]) {
          keyStatsRef.current[spaceChar] = { attempts: 0, errors: 0, confusion: {} };
        }
        keyStatsRef.current[spaceChar].attempts++;

        const nextWords = [...typedWords];
        nextWords[currentWordIndex] = currentInput;
        setTypedWords(nextWords);
        typedWordsRef.current = nextWords;

        const nextIndex = currentWordIndex + 1;

        // Check if finished in word mode
        if (
          config.mode === 'words' &&
          (nextIndex >= config.targetWordCount || nextIndex >= expectedWords.length)
        ) {
          setCurrentWordIndex(nextIndex);
          setCurrentInput('');
          currentWordIndexRef.current = nextIndex;
          currentInputRef.current = '';
          completeTest();
          return;
        }

        // Check if finished in other modes when reaching end of text
        if (nextIndex >= expectedWords.length) {
          setCurrentWordIndex(nextIndex);
          setCurrentInput('');
          currentWordIndexRef.current = nextIndex;
          currentInputRef.current = '';
          completeTest();
          return;
        }

        setCurrentWordIndex(nextIndex);
        setCurrentInput('');
        currentWordIndexRef.current = nextIndex;
        currentInputRef.current = '';
        return;
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        playKeystrokeSound(config.soundTheme, false, 'backspace', config.soundVolume);
        if (currentInput.length > 0) {
          // Delete character in current word
          setCurrentInput((prev) => prev.slice(0, -1));
        } else if (currentWordIndex > 0) {
          // Return to previous word
          const prevIndex = currentWordIndex - 1;
          const prevWordTyped = typedWords[prevIndex] || '';
          setCurrentWordIndex(prevIndex);
          setCurrentInput(prevWordTyped);
        }
        return;
      }

      // Handle Enter
      if (e.key === 'Enter') {
        const isFinalWord =
          currentWordIndex >= expectedWords.length - 1 ||
          (config.mode === 'words' && currentWordIndex >= config.targetWordCount - 1);

        if (isFinalWord && currentInput.length > 0) {
          e.preventDefault();
          playKeystrokeSound(config.soundTheme, false, 'enter', config.soundVolume);
          const nextWords = [...typedWords];
          nextWords[currentWordIndex] = currentInput;
          setTypedWords(nextWords);
          setCurrentWordIndex(currentWordIndex + 1);
          setCurrentInput('');
          typedWordsRef.current = nextWords;
          currentWordIndexRef.current = currentWordIndex + 1;
          currentInputRef.current = '';
          completeTest();
          return;
        }
      }

      // Ordinary single character input
      if (e.key.length === 1) {
        e.preventDefault();
        const expectedWord = expectedWords[currentWordIndex] || '';
        const expectedChar = expectedWord[currentInput.length];
        const isError = expectedChar !== undefined ? expectedChar !== e.key : true;
        playKeystrokeSound(config.soundTheme, isError, 'char', config.soundVolume);
        keystrokesInSecondRef.current += 1;
        if (isError) {
          errorsInSecondRef.current += 1;
        }

        // Record keystroke telemetry
        if (expectedChar) {
          const normKey = expectedChar.toLowerCase();
          if (!keyStatsRef.current[normKey]) {
            keyStatsRef.current[normKey] = { attempts: 0, errors: 0, confusion: {} };
          }
          keyStatsRef.current[normKey].attempts++;
          if (isError) {
            keyStatsRef.current[normKey].errors++;
            const typedKey = e.key.toLowerCase();
            keyStatsRef.current[normKey].confusion[typedKey] =
              (keyStatsRef.current[normKey].confusion[typedKey] || 0) + 1;
          }
        }

        // Prevent typing too many extra characters beyond a reasonable limit (+10 chars)
        if (currentInput.length < expectedWord.length + 12) {
          const updatedInput = currentInput + e.key;
          setCurrentInput(updatedInput);
          currentInputRef.current = updatedInput;

          // Check if on final word of passage (or reached words target)
          const isFinalWord =
            currentWordIndex >= expectedWords.length - 1 ||
            (config.mode === 'words' && currentWordIndex >= config.targetWordCount - 1);

          // If on final word and matches expected word, complete test immediately
          if (isFinalWord && updatedInput === expectedWord) {
            const nextWords = [...typedWords];
            nextWords[currentWordIndex] = updatedInput;
            setTypedWords(nextWords);
            setCurrentWordIndex(currentWordIndex + 1);
            setCurrentInput('');
            typedWordsRef.current = nextWords;
            currentWordIndexRef.current = currentWordIndex + 1;
            currentInputRef.current = '';
            completeTest();
            return;
          }
        }
      }
    },
    [currentInput, currentWordIndex, typedWords, expectedWords, config, restart, startTest, completeTest]
  );

  // Handle direct input change (fallback for mobile virtual keyboards)
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Input is controlled through handleKeyDown for precision, but change event provides fallback
      if (statusRef.current === 'idle' && e.target.value.length > 0) {
        startTest();
      }
    },
    [startTest]
  );

  // Handle paste protection
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (!config.allowPaste) {
        e.preventDefault();
      }
    },
    [config.allowPaste]
  );

  // Rendered words with explicit character states for UI
  const renderedWords: RenderedWord[] = useMemo(() => {
    return expectedWords.map((expWord, wIndex) => {
      const actWord = wIndex === currentWordIndex ? currentInput : typedWords[wIndex] || '';
      const isPastWord = wIndex < currentWordIndex;
      const isCurrent = wIndex === currentWordIndex;
      const isCompleted = isPastWord;

      const characters: RenderedChar[] = [];
      let hasErrors = false;

      // Render expected characters with their state
      for (let c = 0; c < expWord.length; c++) {
        const expectedChar = expWord[c];
        let state: CharacterState = 'pending';

        if (c < actWord.length) {
          if (actWord[c] === expectedChar) {
            state = 'correct';
          } else {
            state = 'incorrect';
            hasErrors = true;
          }
        } else if (isPastWord) {
          // Missed character
          state = 'incorrect';
          hasErrors = true;
        }

        characters.push({ char: expectedChar, state });
      }

      // Render extra characters typed beyond word length
      if (actWord.length > expWord.length) {
        hasErrors = true;
        for (let e = expWord.length; e < actWord.length; e++) {
          characters.push({
            char: actWord[e],
            state: 'extra',
            isExtra: true,
          });
        }
      }

      return {
        index: wIndex,
        expected: expWord,
        typed: actWord,
        characters,
        isCompleted,
        isCurrent,
        hasErrors,
      };
    });
  }, [expectedWords, typedWords, currentInput, currentWordIndex]);

  // Active character index within the current word
  const activeCharIndex = currentInput.length;

  return {
    status,
    config,
    passage,
    renderedWords,
    currentWordIndex,
    currentInput,
    activeCharIndex,
    metrics,
    wpmHistory,
    inputRef,
    actions: {
      startTest,
      completeTest,
      restart,
      handleKeyDown,
      handleInputChange,
      handlePaste,
      setConfig,
    },
  };
}
