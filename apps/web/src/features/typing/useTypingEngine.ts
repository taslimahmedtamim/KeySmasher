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
};

export interface UseTypingEngineProps {
  initialConfig?: Partial<TypingEngineConfig>;
  onTestComplete?: (metrics: ExtendedTypingMetrics, history: WpmHistoryPoint[]) => void;
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

  // Generate or load initial passage
  const initializePassage = useCallback(
    (cfg: TypingEngineConfig): string => {
      if (cfg.initialPassage) {
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

  // Initialize on mount or when configuration mode/difficulty changes
  useEffect(() => {
    const newPassage = initializePassage(config);
    setPassage(newPassage);
    const wordsCount = newPassage.split(/\s+/).length;
    setTypedWords(new Array(wordsCount).fill(''));
    setCurrentWordIndex(0);
    setCurrentInput('');
    setStatus('idle');
    setElapsedSeconds(0);
    setWpmHistory([]);
    startTimeRef.current = null;
    lastRecordedSecondRef.current = 0;
  }, [config, initializePassage]);

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

  // Calculate live cumulative character metrics
  const characterCounts = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let extra = 0;
    let missed = 0;
    let totalTyped = 0;

    for (let w = 0; w < expectedWords.length; w++) {
      const expWord = expectedWords[w] || '';
      const actWord = w === currentWordIndex ? currentInput : typedWords[w] || '';
      const isPastWord = w < currentWordIndex;

      const minLen = Math.min(expWord.length, actWord.length);
      for (let c = 0; c < minLen; c++) {
        totalTyped++;
        if (expWord[c] === actWord[c]) {
          correct++;
        } else {
          incorrect++;
        }
      }

      // Extra characters typed beyond word length
      if (actWord.length > expWord.length) {
        const extraCount = actWord.length - expWord.length;
        extra += extraCount;
        incorrect += extraCount;
        totalTyped += extraCount;
      }

      // Missed characters in previously completed words
      if (isPastWord && actWord.length < expWord.length) {
        missed += expWord.length - actWord.length;
      }

      // Add space for past words between words (not after the final word)
      if (isPastWord && w < expectedWords.length - 1) {
        totalTyped++; // the space key
        correct++; // word was submitted with space
      }
    }

    return { correct, incorrect, extra, missed, totalTyped };
  }, [expectedWords, typedWords, currentInput, currentWordIndex]);

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
    };
  }, [characterCounts, elapsedSeconds, config, currentWordIndex, expectedWords.length, wpmHistory]);

  // End / Complete test
  const completeTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (startTimeRef.current) {
      const finalElapsed = Math.max(0.1, (Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(finalElapsed);
      startTimeRef.current = null;
    }
    statusRef.current = 'completed';
    setStatus('completed');
    if (props.onTestComplete) {
      props.onTestComplete(metrics, wpmHistory);
    }
  }, [metrics, props, wpmHistory]);

  // Start test & timer (guaranteeing single interval)
  const startTest = useCallback(() => {
    if (statusRef.current === 'active') return;

    setStatus('active');
    const now = Date.now();
    startTimeRef.current = now;
    lastRecordedSecondRef.current = 0;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const currentNow = Date.now();
      const elapsed = (currentNow - startTimeRef.current) / 1000;

      // Update UI elapsed seconds every full second to prevent frantic jumping
      const wholeSeconds = Math.floor(elapsed);
      if (wholeSeconds !== lastRecordedSecondRef.current) {
        lastRecordedSecondRef.current = wholeSeconds;
        setElapsedSeconds(wholeSeconds);

        if (wholeSeconds > 0) {
          const snapshot = calculateTypingMetrics({
            totalTypedCharacters: characterCounts.totalTyped,
            correctCharacters: characterCounts.correct,
            incorrectCharacters: characterCounts.incorrect,
            elapsedSeconds: wholeSeconds,
          });

          setWpmHistory((prev) => [
            ...prev,
            {
              second: wholeSeconds,
              rawWpm: snapshot.rawWpm,
              netWpm: snapshot.netWpm,
              accuracy: snapshot.accuracy,
              errors: characterCounts.incorrect,
            },
          ]);
        }
      }

      // Check time expiration in time mode
      if (config.mode === 'time' && elapsed >= config.durationSeconds) {
        setElapsedSeconds(config.durationSeconds);
        completeTest();
      }
    }, 100);
  }, [characterCounts, config.durationSeconds, config.mode, completeTest]);

  // Reset / Restart test
  const restart = useCallback(
    (newPassage = false) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      startTimeRef.current = null;
      lastRecordedSecondRef.current = 0;

      const p = newPassage ? initializePassage(config) : passage;
      if (newPassage) {
        setPassage(p);
      }
      const wordsCount = p.split(/\s+/).length;
      setTypedWords(new Array(wordsCount).fill(''));
      setCurrentWordIndex(0);
      setCurrentInput('');
      setStatus('idle');
      setElapsedSeconds(0);
      setWpmHistory([]);
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

        playKeystrokeSound(config.soundTheme, false);

        const nextWords = [...typedWords];
        nextWords[currentWordIndex] = currentInput;
        setTypedWords(nextWords);

        const nextIndex = currentWordIndex + 1;

        // Check if finished in word mode
        if (
          config.mode === 'words' &&
          (nextIndex >= config.targetWordCount || nextIndex >= expectedWords.length)
        ) {
          setCurrentWordIndex(nextIndex);
          setCurrentInput('');
          completeTest();
          return;
        }

        // Check if finished in other modes when reaching end of text
        if (nextIndex >= expectedWords.length) {
          setCurrentWordIndex(nextIndex);
          setCurrentInput('');
          completeTest();
          return;
        }

        setCurrentWordIndex(nextIndex);
        setCurrentInput('');
        return;
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        playKeystrokeSound(config.soundTheme, false);
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
          const nextWords = [...typedWords];
          nextWords[currentWordIndex] = currentInput;
          setTypedWords(nextWords);
          setCurrentWordIndex(currentWordIndex + 1);
          setCurrentInput('');
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
        playKeystrokeSound(config.soundTheme, isError);

        // Prevent typing too many extra characters beyond a reasonable limit (+10 chars)
        if (currentInput.length < expectedWord.length + 12) {
          const updatedInput = currentInput + e.key;
          setCurrentInput(updatedInput);

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
