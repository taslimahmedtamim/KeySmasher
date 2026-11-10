'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Clock,
  Type,
  Quote,
  FileText,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  Flame,
  Zap,
  Sparkles,
  Info,
  Eye,
  EyeOff,
  TrendingUp,
  History,
  Trash2,
  Award,
  Target,
  X,
} from 'lucide-react';
import {
  PassageDifficulty,
  TestMode,
  TimeDurationOption,
  WordCountOption,
  generateWeakKeyDrillPassage,
} from '@keysmasher/shared';
import { useAuth } from '@/features/auth/AuthContext';
import { useTypingEngine } from '@/features/typing/useTypingEngine';
import { TypingArea } from '@/features/typing/components/TypingArea';
import { WpmHistoryChart } from '@/features/typing/components/WpmHistoryChart';
import { CustomTextModal } from '@/features/typing/components/CustomTextModal';
import { SoundSwitchSelector } from '@/features/typing/components/SoundSwitchSelector';
import { TypingCertificateModal } from '@/components/certificate/TypingCertificateModal';
import {
  getStoredSessions,
  saveSessionResult,
  getSessionStats,
  clearStoredSessions,
  SavedTestSession,
} from '@/features/typing/utils/historyStorage';
import { SoundTheme } from '@/features/typing/types';
import {
  loadStoredSoundSettings,
  saveSoundSettings,
} from '@/features/typing/utils/soundEffects';
import { PostTestCoachTip } from '@/features/coach';

export default function PracticePage() {
  const { user } = useAuth();
  const [zenMode, setZenMode] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<SavedTestSession[]>([]);
  const [activeDrillKeys, setActiveDrillKeys] = useState<string[] | null>(null);
  const preDrillModeRef = useRef<TestMode>('time');
  const savedTestRef = useRef<string | null>(null);

  const {
    status,
    config,
    passage,
    renderedWords,
    currentWordIndex,
    activeCharIndex,
    metrics,
    wpmHistory,
    inputRef,
    actions: { restart, handleKeyDown, handleInputChange, handlePaste, setConfig },
  } = useTypingEngine();

  // Load guest session history & stored switch audio preference on mount, and handle drill deep-linking
  useEffect(() => {
    setSessionHistory(getStoredSessions());
    const storedAudio = loadStoredSoundSettings();
    if (storedAudio.theme !== null) {
      setConfig((prev) => ({
        ...prev,
        soundTheme: storedAudio.theme ?? prev.soundTheme,
        soundVolume: storedAudio.volume,
      }));
    }
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('drill') === 'weak-keys') {
          const stored = window.sessionStorage.getItem('keysmasher_drill_passage');
          const storedKeysRaw = window.sessionStorage.getItem('keysmasher_drill_keys');
          let parsedKeys: string[] = [];
          if (storedKeysRaw) {
            try {
              const p = JSON.parse(storedKeysRaw);
              if (Array.isArray(p)) parsedKeys = p.filter((k) => typeof k === 'string');
            } catch {
              // Ignore
            }
          }
          if (stored) {
            setActiveDrillKeys(parsedKeys.length > 0 ? parsedKeys : ['e', 't', 'a']);
            setConfig((prev) => ({
              ...prev,
              mode: 'custom',
              customText: stored,
              initialPassage: undefined,
            }));
          }
        }
      }
    } catch {
      // Ignore
    }
  }, [setConfig]);

  // Guarantee instant auto-focus on load, mode switch, and global keydown (no need to click box)
  useEffect(() => {
    const focusHiddenInput = () => {
      if (
        status !== 'completed' &&
        !isCustomModalOpen &&
        !isCertificateOpen &&
        inputRef.current
      ) {
        inputRef.current.focus({ preventScroll: true });
      }
    };

    // Auto-focus immediately on mount and after render tick
    focusHiddenInput();
    const timer = setTimeout(focusHiddenInput, 60);

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Do not steal focus if clicking buttons, links, or inputs in modals
      if (
        !target.closest('button') &&
        !target.closest('a') &&
        !target.closest('input') &&
        !target.closest('textarea') &&
        !target.closest('[data-sound-picker="true"]') &&
        status !== 'completed' &&
        !isCustomModalOpen &&
        !isCertificateOpen
      ) {
        focusHiddenInput();
      }
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (status === 'completed' || isCustomModalOpen || isCertificateOpen) return;

      const active = document.activeElement;
      if (
        active &&
        (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') &&
        active !== inputRef.current
      ) {
        return; // user is typing in another input field
      }

      // If hidden input is not focused and user presses any typing key, focus and forward it
      if (document.activeElement !== inputRef.current) {
        focusHiddenInput();
        if (
          (e.key.length === 1 || e.key === ' ' || e.key === 'Backspace') &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.altKey
        ) {
          handleKeyDown(e as unknown as React.KeyboardEvent<HTMLInputElement>);
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [status, isCustomModalOpen, isCertificateOpen, inputRef, handleKeyDown]);

  // Auto-scroll to top when test finishes so headline results and coach takeaway are immediately visible
  useEffect(() => {
    if (status === 'completed') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status]);

  // Save completed session to local history
  useEffect(() => {
    if (status === 'completed' && metrics.elapsedSeconds > 0) {
      const testKey = `${Date.now()}-${metrics.netWpm}-${metrics.totalTypedCharacters}`;
      if (savedTestRef.current !== testKey) {
        savedTestRef.current = testKey;
        const saved = saveSessionResult({
          mode: config.mode,
          rawWpm: metrics.rawWpm,
          netWpm: metrics.netWpm,
          accuracy: metrics.accuracy,
          cpm: metrics.cpm,
          consistency: metrics.consistency,
          elapsedSeconds: metrics.elapsedSeconds,
          difficulty: config.difficulty,
          errorCount: metrics.incorrectCharacters,
          targetDuration: config.mode === 'time' ? config.durationSeconds : undefined,
          targetWords: config.mode === 'words' ? config.targetWordCount : undefined,
          keyStats: metrics.keyStats,
        });
        setSessionHistory((prev) => [saved, ...prev].slice(0, 25));
      }
    }
  }, [
    status,
    metrics,
    config.mode,
    config.difficulty,
    config.durationSeconds,
    config.targetWordCount,
  ]);

  const clearDrillUrlAndStorage = () => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage?.removeItem('keysmasher_drill_passage');
        window.sessionStorage?.removeItem('keysmasher_drill_keys');
        const params = new URLSearchParams(window.location.search);
        if (params.has('drill')) {
          params.delete('drill');
          const nextQuery = params.toString();
          const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`;
          window.history.replaceState({}, '', nextUrl);
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleModeChange = (newMode: TestMode) => {
    if (newMode === 'custom') {
      setIsCustomModalOpen(true);
    } else {
      setActiveDrillKeys(null);
      clearDrillUrlAndStorage();
      setConfig((prev) => ({
        ...prev,
        mode: newMode,
        customText: undefined,
        initialPassage: undefined,
      }));
    }
  };

  const handleCustomTextApply = (customText: string) => {
    if (config.mode !== 'custom') {
      preDrillModeRef.current = config.mode;
    }
    setActiveDrillKeys(null);
    clearDrillUrlAndStorage();
    if (config.mode === 'custom' && customText.trim() === passage.trim()) {
      restart(false);
    } else {
      setConfig((prev) => ({
        ...prev,
        mode: 'custom',
        customText,
        initialPassage: undefined,
      }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 40);
  };

  const handleApplyCoachDrill = (drillPassage: string, targetKeys?: string[]) => {
    if (config.mode !== 'custom') {
      preDrillModeRef.current = config.mode;
    }
    const keysToSet = targetKeys && targetKeys.length > 0 ? targetKeys : null;
    setActiveDrillKeys(keysToSet);
    clearDrillUrlAndStorage();

    if (config.mode === 'custom' && drillPassage.trim() === passage.trim()) {
      restart(false);
    } else {
      setConfig((prev) => ({
        ...prev,
        mode: 'custom',
        customText: drillPassage,
        initialPassage: undefined,
      }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 40);
  };

  const handleExitDrill = () => {
    const restoreMode =
      preDrillModeRef.current && preDrillModeRef.current !== 'custom'
        ? preDrillModeRef.current
        : 'time';
    setActiveDrillKeys(null);
    clearDrillUrlAndStorage();
    setConfig((prev) => ({
      ...prev,
      mode: restoreMode,
      customText: undefined,
      initialPassage: undefined,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 40);
  };

  const handleDurationChange = (d: TimeDurationOption) => {
    setConfig((prev) => ({ ...prev, durationSeconds: d, initialPassage: undefined }));
  };

  const handleWordCountChange = (w: WordCountOption) => {
    setConfig((prev) => ({ ...prev, targetWordCount: w, initialPassage: undefined }));
  };

  const handleQuoteLengthChange = (len: 'short' | 'medium' | 'long') => {
    setConfig((prev) => ({ ...prev, quoteLength: len, initialPassage: undefined }));
  };

  const handleDifficultyChange = (diff: PassageDifficulty) => {
    setConfig((prev) => ({ ...prev, difficulty: diff, initialPassage: undefined }));
  };

  const togglePunctuation = () => {
    setConfig((prev) => ({
      ...prev,
      includePunctuation: !prev.includePunctuation,
      initialPassage: undefined,
    }));
  };

  const toggleNumbers = () => {
    setConfig((prev) => ({
      ...prev,
      includeNumbers: !prev.includeNumbers,
      initialPassage: undefined,
    }));
  };

  const handleSoundThemeChange = (nextTheme: SoundTheme) => {
    setConfig((prev) => {
      saveSoundSettings(nextTheme, prev.soundVolume ?? 0.85);
      return { ...prev, soundTheme: nextTheme };
    });
  };

  const handleCopySummary = () => {
    const modeLabel =
      config.mode === 'time'
        ? `${config.durationSeconds}s Time`
        : config.mode === 'words'
        ? `${config.targetWordCount} Words`
        : config.mode === 'quote'
        ? 'Quote'
        : activeDrillKeys
        ? 'Weak-Key Drill'
        : 'Custom';

    const text = `⚡ KeySmasher Speed Test: ${Math.round(metrics.netWpm)} WPM (${Math.round(
      metrics.rawWpm
    )} Raw) | ${Math.round(metrics.accuracy)}% Acc | ${metrics.consistency}% Consistency | ${modeLabel}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClearHistory = () => {
    clearStoredSessions();
    setSessionHistory([]);
  };

  const handleRestart = (newPassage: boolean) => {
    if (newPassage && activeDrillKeys && activeDrillKeys.length > 0) {
      let nextDrill = generateWeakKeyDrillPassage(activeDrillKeys, 25);
      for (let attempt = 0; attempt < 3 && nextDrill === passage; attempt++) {
        nextDrill = generateWeakKeyDrillPassage(activeDrillKeys, 25);
      }
      if (nextDrill === passage) {
        restart(false);
      } else {
        setConfig((prev) => ({
          ...prev,
          mode: 'custom',
          customText: nextDrill,
          initialPassage: undefined,
        }));
      }
    } else if (newPassage && config.mode === 'custom') {
      handleExitDrill();
      return;
    } else {
      restart(newPassage);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 20);
  };

  const isCompleted = status === 'completed';
  const sessionStats = getSessionStats(sessionHistory);

  return (
    <div className="pt-6 pb-28 sm:pt-8 sm:pb-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Controls Bar */}
        <div className="relative z-40 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface/80 p-3.5 backdrop-blur shadow-sm">
          {/* Mode Selector */}
          <div className="flex items-center gap-1 rounded-xl bg-surface-muted p-1">
            <button
              type="button"
              id="practice-mode-time"
              onClick={() => handleModeChange('time')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                config.mode === 'time'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Time</span>
            </button>
            <button
              type="button"
              id="practice-mode-words"
              onClick={() => handleModeChange('words')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                config.mode === 'words'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              <span>Words</span>
            </button>
            <button
              type="button"
              id="practice-mode-quote"
              onClick={() => handleModeChange('quote')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                config.mode === 'quote'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Quote className="h-3.5 w-3.5" />
              <span>Quote</span>
            </button>
            <button
              type="button"
              id="practice-mode-custom"
              onClick={() => handleModeChange('custom')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                config.mode === 'custom'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Custom</span>
            </button>
          </div>

          {/* Sub-options based on mode */}
          <div className="flex items-center gap-1.5">
            {config.mode === 'time' && (
              <>
                {([15, 30, 60, 120] as TimeDurationOption[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDurationChange(d)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors duration-150 ${
                      config.durationSeconds === d
                        ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </>
            )}

            {config.mode === 'words' && (
              <>
                {([10, 25, 50, 100] as WordCountOption[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleWordCountChange(w)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors duration-150 ${
                      config.targetWordCount === w
                        ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {w}w
                  </button>
                ))}
              </>
            )}

            {config.mode === 'quote' && (
              <>
                {(['short', 'medium', 'long'] as const).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => handleQuoteLengthChange(len)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors duration-150 ${
                      (config.quoteLength || 'medium') === len
                        ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </>
            )}

            {config.mode === 'custom' && (
              <div className="flex flex-wrap items-center gap-1.5">
                {activeDrillKeys && activeDrillKeys.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 text-xs font-bold text-rose-200">
                    <Target className="h-3 w-3 text-rose-400" />
                    <span>Drill: {activeDrillKeys.map((k) => k.toUpperCase()).join(', ')}</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(true)}
                  className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors duration-150"
                >
                  Edit Text
                </button>
                {activeDrillKeys && activeDrillKeys.length > 0 && (
                  <button
                    type="button"
                    id="practice-exit-drill-btn"
                    onClick={handleExitDrill}
                    className="inline-flex items-center gap-1 rounded-lg border border-surface-border bg-surface px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-colors duration-150"
                    title="Exit weak-key drill and return to standard practice mode"
                  >
                    <X className="h-3 w-3" />
                    <span>Exit Drill</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content Modifiers (Punctuation, Numbers) & Difficulty */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-xl bg-surface-muted/70 p-1">
              <button
                type="button"
                id="practice-toggle-punctuation"
                onClick={togglePunctuation}
                className={`rounded-lg px-2.5 py-1 font-mono text-xs font-semibold transition-colors duration-150 ${
                  config.includePunctuation
                    ? 'border border-amber-500/40 bg-amber-500/15 text-amber-300'
                    : 'border border-transparent text-slate-400 hover:text-white'
                }`}
                title="Include Punctuation symbols"
              >
                @#$
              </button>

              <button
                type="button"
                id="practice-toggle-numbers"
                onClick={toggleNumbers}
                className={`rounded-lg px-2.5 py-1 font-mono text-xs font-semibold transition-colors duration-150 ${
                  config.includeNumbers
                    ? 'border border-amber-500/40 bg-amber-500/15 text-amber-300'
                    : 'border border-transparent text-slate-400 hover:text-white'
                }`}
                title="Include Numeric characters"
              >
                123
              </button>
            </div>

            {/* Difficulty selector (when in time/words mode) */}
            {(config.mode === 'time' || config.mode === 'words') && (
              <div className="hidden sm:flex items-center gap-1 border-l border-surface-border pl-2">
                {(['beginner', 'intermediate', 'advanced', 'expert'] as PassageDifficulty[]).map(
                  (diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => handleDifficultyChange(diff)}
                      className={`rounded-lg px-2 py-0.5 text-[11px] font-medium capitalize transition-colors duration-150 ${
                        config.difficulty === diff
                          ? 'border border-purple-500/40 bg-purple-500/10 text-purple-300'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {diff}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live Metrics Header (Fixed width columns & tabular numbers to prevent layout shifts) */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="w-24 shrink-0 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Net WPM
              </div>
              <div className="text-3xl font-black text-cyan-400 font-mono tabular-nums">
                {zenMode && status === 'active' ? '—' : Math.round(metrics.netWpm)}
              </div>
            </div>

            <div className="w-24 shrink-0 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Raw WPM
              </div>
              <div className="text-3xl font-black text-slate-400 font-mono tabular-nums">
                {zenMode && status === 'active' ? '—' : Math.round(metrics.rawWpm)}
              </div>
            </div>

            <div className="w-24 shrink-0 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Accuracy
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono tabular-nums">
                {zenMode && status === 'active' ? '—' : `${Math.round(metrics.accuracy)}%`}
              </div>
            </div>

            <div className="w-28 shrink-0 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {config.mode === 'time' ? 'Time Left' : 'Progress'}
              </div>
              <div className="text-3xl font-black text-slate-200 font-mono tabular-nums">
                {config.mode === 'time'
                  ? `${Math.max(0, Math.ceil(metrics.timeRemaining))}s`
                  : `${metrics.completedWordsCount} / ${metrics.totalWordsCount}`}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mechanical Keyboard Switch Sound Cycler */}
            <SoundSwitchSelector
              buttonId="practice-toggle-sound"
              value={config.soundTheme || 'off'}
              volume={config.soundVolume ?? 0.85}
              onChange={handleSoundThemeChange}
            />

            <button
              type="button"
              id="practice-zen-toggle"
              onClick={() => setZenMode(!zenMode)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                zenMode
                  ? 'border-purple-500/40 bg-purple-950/30 text-purple-300'
                  : 'border-slate-700 bg-surface text-slate-400 hover:text-white'
              }`}
              title="Zen Mode: Hide live numbers while typing to focus solely on the text"
            >
              {zenMode ? <EyeOff className="h-3.5 w-3.5 text-purple-400" /> : <Eye className="h-3.5 w-3.5" />}
              <span>{zenMode ? 'Zen: On' : 'Zen: Off'}</span>
            </button>

            <button
              type="button"
              id="practice-restart-btn"
              onClick={() => handleRestart(false)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-surface px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors duration-150 hover:border-slate-500 hover:text-white active:scale-95"
              title="Restart current passage (Tab + Enter or Escape)"
            >
              <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
              <span>Retry</span>
            </button>

            <button
              type="button"
              id="practice-new-passage-btn"
              onClick={() => handleRestart(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-surface px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors duration-150 hover:border-slate-500 hover:text-white active:scale-95"
              title="Generate new passage"
            >
              <RefreshCw className="h-3.5 w-3.5 text-purple-400" />
              <span>New Passage</span>
            </button>
          </div>
        </div>

        {/* Centerpiece Typing Area */}
        <div className="relative mt-8 min-h-[220px] rounded-2xl border border-surface-border bg-surface/50 p-8 shadow-neon-card">
          {isCompleted ? (
            /* Results Screen */
            <div className="py-6 text-center animate-fade-in">
              <div className="mb-3 inline-flex rounded-full bg-emerald-500/10 p-3 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h2 className="text-2xl font-black text-white sm:text-3xl">
                Test Completed!
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {config.mode === 'time'
                  ? `${config.durationSeconds}s Time Test`
                  : config.mode === 'words'
                  ? `${config.targetWordCount} Words Test`
                  : config.mode === 'quote'
                  ? 'Quote Test'
                  : activeDrillKeys && activeDrillKeys.length > 0
                  ? `Weak-Key Drill (${activeDrillKeys.map((k) => k.toUpperCase()).join(', ')})`
                  : 'Custom Test'}{' '}
                • {config.difficulty} difficulty
              </p>

              {/* Invalid test indicator when typing only wrong words (Monkeytype style) */}
              {metrics.netWpm === 0 && metrics.totalTypedCharacters > 0 && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                  <span>invalid (accuracy) • 0 WPM</span>
                </div>
              )}

              {/* Primary 4 Key Metrics */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto">
                <div className="rounded-xl border border-surface-border bg-surface p-4">
                  <div className="text-xs uppercase font-bold text-slate-400">Net Speed</div>
                  <div className="mt-1 text-3xl font-black text-cyan-400 font-mono">
                    {Math.round(metrics.netWpm)}
                  </div>
                  <div className="text-[10px] text-slate-500">WPM</div>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface p-4">
                  <div className="text-xs uppercase font-bold text-slate-400">Accuracy</div>
                  <div className="mt-1 text-3xl font-black text-emerald-400 font-mono">
                    {Math.round(metrics.accuracy)}%
                  </div>
                  <div className="text-[10px] text-slate-500">Correct Ratio</div>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface p-4">
                  <div className="text-xs uppercase font-bold text-slate-400">Raw Speed</div>
                  <div className="mt-1 text-3xl font-black text-white font-mono">
                    {Math.round(metrics.rawWpm)}
                  </div>
                  <div className="text-[10px] text-slate-500">WPM</div>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface p-4">
                  <div className="text-xs uppercase font-bold text-slate-400">Consistency</div>
                  <div className="mt-1 text-3xl font-black text-purple-400 font-mono">
                    {metrics.consistency}%
                  </div>
                  <div className="text-[10px] text-slate-500">Rhythm Score</div>
                </div>
              </div>

              {/* Sub-stats Grid */}
              <div className="mt-4 grid grid-cols-3 gap-3 max-w-xl mx-auto text-xs font-mono">
                <div className="rounded-lg border border-surface-border bg-surface/60 p-2.5">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Characters</div>
                  <div className="mt-1 text-slate-200">
                    <span className="text-emerald-400 font-bold">{metrics.correctCharacters}</span>
                    <span className="text-slate-600"> / </span>
                    <span className="text-rose-400 font-bold">{metrics.incorrectCharacters}</span>
                    <span className="text-slate-600"> / </span>
                    <span className="text-amber-400">{metrics.extraCharacters}</span>
                    <span className="text-slate-600"> / </span>
                    <span className="text-purple-400">{metrics.missedCharacters}</span>
                  </div>
                  <div className="text-[9px] text-slate-500">ok / err / extra / missed</div>
                </div>

                <div className="rounded-lg border border-surface-border bg-surface/60 p-2.5">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Time Elapsed</div>
                  <div className="mt-1 font-bold text-slate-200">
                    {metrics.elapsedSeconds.toFixed(1)}s
                  </div>
                  <div className="text-[9px] text-slate-500">seconds</div>
                </div>

                <div className="rounded-lg border border-surface-border bg-surface/60 p-2.5">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Cadence (CPM)</div>
                  <div className="mt-1 font-bold text-cyan-300">
                    {Math.round(metrics.cpm)}
                  </div>
                  <div className="text-[9px] text-slate-500">chars / min</div>
                </div>
              </div>

              {/* Immediate Post-Test Smart Coach Feedback */}
              <PostTestCoachTip
                metrics={metrics}
                onApplyDrill={handleApplyCoachDrill}
                className="mt-6 max-w-5xl mx-auto text-left"
              />

              {/* Speed Graph (WpmHistoryChart) */}
              {wpmHistory.length >= 2 && (
                <div className="mt-6 max-w-5xl mx-auto">
                  <WpmHistoryChart history={wpmHistory} averageWpm={metrics.netWpm} />
                </div>
              )}

              {/* Primary Actions & Copy Summary */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  id="results-next-btn"
                  onClick={() => handleRestart(true)}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition-colors duration-150 shadow-neon-cyan active:scale-95"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Next Test</span>
                </button>

                <button
                  type="button"
                  id="results-retry-btn"
                  onClick={() => handleRestart(false)}
                  className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-5 py-2.5 text-sm font-semibold text-slate-200 hover:text-white transition-colors duration-150 active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retry Same</span>
                </button>

                <button
                  type="button"
                  id="results-copy-btn"
                  onClick={handleCopySummary}
                  className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-muted px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-150 active:scale-95"
                  title="Copy formatted result summary to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-cyan-400" />
                      <span>Copy Summary</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="results-certificate-btn"
                  onClick={() => setIsCertificateOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm font-bold text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-colors duration-150 active:scale-95"
                  title="Generate & Download Verified Speed Certificate"
                >
                  <Award className="h-4 w-4 text-amber-400" />
                  <span>Download Certificate</span>
                </button>
              </div>

              {/* Guest Local Storage Notice & Sign in CTA */}
              <div className="mt-6 max-w-md mx-auto rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs text-cyan-300">
                <span>Result saved to guest local history. </span>
                <Link
                  href="/dashboard"
                  className="underline font-bold text-white hover:text-cyan-300 transition-colors ml-1"
                >
                  Sign in to save permanent records & compete on global leaderboards
                </Link>
              </div>
            </div>
          ) : (
            /* Live Typing Area */
            <div>
              {activeDrillKeys && activeDrillKeys.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-200">
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    <span>
                      Targeting missed keys:{' '}
                      <strong className="font-mono text-white">
                        {activeDrillKeys.map((k) => k.toUpperCase()).join(', ')}
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleExitDrill}
                    className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 underline"
                  >
                    Switch to normal passage
                  </button>
                </div>
              )}
              <TypingArea
                renderedWords={renderedWords}
                currentWordIndex={currentWordIndex}
                activeCharIndex={activeCharIndex}
                status={status}
                inputRef={inputRef}
                onKeyDown={handleKeyDown}
                onInputChange={handleInputChange}
                onPaste={handlePaste}
              />
            </div>
          )}
        </div>

        {/* Hotkey tip */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 px-2">
          <div className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-slate-400" />
            <span>Click inside the box or start typing immediately. Space advances to next word.</span>
          </div>
          <div>
            <span className="rounded bg-surface-muted border border-surface-border px-1.5 py-0.5 font-mono text-[10px]">
              Tab
            </span>{' '}
            or{' '}
            <span className="rounded bg-surface-muted border border-surface-border px-1.5 py-0.5 font-mono text-[10px]">
              Esc
            </span>{' '}
            to restart
          </div>
        </div>

        {/* Guest Session History Section */}
        {sessionHistory.length > 0 && (
          <div className="mt-12 rounded-2xl border border-surface-border bg-surface/40 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Current Session History</h3>
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-500/20">
                  {sessionStats.totalTests} tests
                </span>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-slate-500">Best: </span>
                  <span className="font-bold text-cyan-400">{sessionStats.bestWpm} WPM</span>
                </div>
                <div>
                  <span className="text-slate-500">Avg: </span>
                  <span className="font-bold text-white">{sessionStats.avgWpm} WPM</span>
                </div>
                <div>
                  <span className="text-slate-500">Acc: </span>
                  <span className="font-bold text-emerald-400">{sessionStats.avgAccuracy}%</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="flex items-center gap-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Clear guest session history"
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="text-[11px]">Clear</span>
                </button>
              </div>
            </div>

            {/* Recent tests table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-surface-border/60 text-[10px] uppercase text-slate-500">
                    <th className="pb-2 font-semibold">Mode</th>
                    <th className="pb-2 font-semibold">Net Speed</th>
                    <th className="pb-2 font-semibold">Raw Speed</th>
                    <th className="pb-2 font-semibold">Accuracy</th>
                    <th className="pb-2 font-semibold">Consistency</th>
                    <th className="pb-2 font-semibold">Errors</th>
                    <th className="pb-2 font-semibold text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/30">
                  {sessionHistory.slice(0, 5).map((session) => (
                    <tr key={session.id} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="py-2 capitalize text-slate-300">{session.mode}</td>
                      <td className="py-2 font-bold text-cyan-400">{session.netWpm} WPM</td>
                      <td className="py-2 text-slate-300">{session.rawWpm} WPM</td>
                      <td className="py-2 text-emerald-400">{session.accuracy}%</td>
                      <td className="py-2 text-purple-300">{session.consistency}%</td>
                      <td className="py-2 text-rose-400">{session.errorCount}</td>
                      <td className="py-2 text-right text-slate-500">
                        {session.elapsedSeconds.toFixed(1)}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Custom Text Modal */}
      <CustomTextModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onApply={handleCustomTextApply}
        initialText={config.customText}
      />

      {/* Typing Certificate Modal */}
      <TypingCertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        data={{
          recipientName: user?.displayName || user?.username || 'KeySmasher Typist',
          wpm: metrics.netWpm,
          accuracy: metrics.accuracy,
          consistency: metrics.consistency,
          presetLabel:
            config.mode === 'time'
              ? `${config.durationSeconds}s Speed Test`
              : config.mode === 'words'
              ? `${config.targetWordCount} Words Speed Test`
              : config.mode === 'quote'
              ? 'Quote Mode Test'
              : 'Custom Speed Test',
        }}
      />
    </div>
  );
}
