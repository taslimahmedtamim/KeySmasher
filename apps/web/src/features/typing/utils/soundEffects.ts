import { SoundCategory, SoundTheme } from '../types';

export type KeyStrokeKind = 'char' | 'space' | 'backspace' | 'enter';

export interface SoundProfile {
  id: SoundTheme;
  name: string;
  shortLabel: string;
  category: SoundCategory;
  feel: string;
  stemHex: string;
  accentColor: string;
}

export const SOUND_PROFILES: SoundProfile[] = [
  {
    id: 'off',
    name: 'Mute',
    shortLabel: 'Mute',
    category: 'mute',
    feel: 'Off',
    stemHex: '#64748b',
    accentColor: 'text-slate-400',
  },
  {
    id: 'click',
    name: 'Blue Switch',
    shortLabel: 'Blue · Click',
    category: 'clicky',
    feel: 'Clicky · 50g',
    stemHex: '#38bdf8',
    accentColor: 'text-cyan-300',
  },
  {
    id: 'mx-red',
    name: 'Red Switch',
    shortLabel: 'Red',
    category: 'linear',
    feel: 'Linear · 45g',
    stemHex: '#ef4444',
    accentColor: 'text-rose-300',
  },
  {
    id: 'clack',
    name: 'Brown Switch',
    shortLabel: 'Brown',
    category: 'tactile',
    feel: 'Tactile · 55g',
    stemHex: '#b45309',
    accentColor: 'text-amber-300',
  },
  {
    id: 'thock',
    name: 'Black Switch',
    shortLabel: 'Black · Thock',
    category: 'linear',
    feel: 'Heavy Linear · 60g',
    stemHex: '#475569',
    accentColor: 'text-slate-200',
  },
  {
    id: 'topre',
    name: 'Topre 45g',
    shortLabel: 'Topre',
    category: 'vintage',
    feel: 'Capacitive · 45g',
    stemHex: '#a855f7',
    accentColor: 'text-purple-300',
  },
];

const PROFILE_MAP = new Map<SoundTheme, SoundProfile>(SOUND_PROFILES.map((p) => [p.id, p]));

export function getSoundProfile(theme: SoundTheme = 'off'): SoundProfile {
  return PROFILE_MAP.get(theme) || SOUND_PROFILES[0];
}

export function getNextSoundTheme(current: SoundTheme = 'off'): SoundTheme {
  const index = SOUND_PROFILES.findIndex((p) => p.id === current);
  if (index === -1) return 'click';
  return SOUND_PROFILES[(index + 1) % SOUND_PROFILES.length].id;
}

interface ClickTransientSpec {
  delay: number;
  startHz: number;
  endHz: number;
  duration: number;
  gain: number;
  wave: OscillatorType;
}

interface SwitchAcousticSpec {
  bodyWave: OscillatorType;
  bodyStartHz: number;
  bodyEndHz: number;
  bodyDuration: number;
  bodyGain: number;
  noiseFilterType: BiquadFilterType;
  noiseFreqHz: number;
  noiseQ: number;
  noiseDuration: number;
  noiseGain: number;
  clickTransient?: ClickTransientSpec;
  secondaryRing?: {
    delay: number;
    startHz: number;
    endHz: number;
    duration: number;
    gain: number;
    wave: OscillatorType;
  };
}

const SWITCH_SPECS: Record<Exclude<SoundTheme, 'off'>, SwitchAcousticSpec> = {
  click: {
    bodyWave: 'triangle',
    bodyStartHz: 420,
    bodyEndHz: 140,
    bodyDuration: 0.026,
    bodyGain: 0.11,
    noiseFilterType: 'bandpass',
    noiseFreqHz: 3400,
    noiseQ: 2.6,
    noiseDuration: 0.018,
    noiseGain: 0.16,
    clickTransient: {
      delay: 0,
      startHz: 4200,
      endHz: 1850,
      duration: 0.014,
      gain: 0.085,
      wave: 'triangle',
    },
  },
  'mx-red': {
    bodyWave: 'sine',
    bodyStartHz: 520,
    bodyEndHz: 180,
    bodyDuration: 0.024,
    bodyGain: 0.11,
    noiseFilterType: 'bandpass',
    noiseFreqHz: 2050,
    noiseQ: 1.5,
    noiseDuration: 0.016,
    noiseGain: 0.12,
  },
  clack: {
    bodyWave: 'sine',
    bodyStartHz: 780,
    bodyEndHz: 240,
    bodyDuration: 0.032,
    bodyGain: 0.13,
    noiseFilterType: 'bandpass',
    noiseFreqHz: 2200,
    noiseQ: 2.4,
    noiseDuration: 0.02,
    noiseGain: 0.15,
  },
  thock: {
    bodyWave: 'sine',
    bodyStartHz: 265,
    bodyEndHz: 78,
    bodyDuration: 0.048,
    bodyGain: 0.2,
    noiseFilterType: 'lowpass',
    noiseFreqHz: 740,
    noiseQ: 1.4,
    noiseDuration: 0.028,
    noiseGain: 0.16,
  },
  topre: {
    bodyWave: 'sine',
    bodyStartHz: 335,
    bodyEndHz: 88,
    bodyDuration: 0.052,
    bodyGain: 0.2,
    noiseFilterType: 'bandpass',
    noiseFreqHz: 960,
    noiseQ: 3.8,
    noiseDuration: 0.028,
    noiseGain: 0.17,
    secondaryRing: {
      delay: 0.012,
      startHz: 620,
      endHz: 260,
      duration: 0.024,
      gain: 0.06,
      wave: 'sine',
    },
  },
};

let audioCtx: AudioContext | null = null;
const noiseBufferCache = new WeakMap<AudioContext, AudioBuffer>();

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer | null {
  if (typeof ctx.createBuffer !== 'function') return null;
  const cached = noiseBufferCache.get(ctx);
  if (cached) return cached;

  const length = Math.max(1, Math.floor(ctx.sampleRate * 0.12));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    channelData[i] = Math.random() * 2 - 1;
  }
  noiseBufferCache.set(ctx, buffer);
  return buffer;
}

function scheduleToneBurst(
  ctx: AudioContext,
  startAt: number,
  wave: OscillatorType,
  startHz: number,
  endHz: number,
  duration: number,
  peakGain: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(Math.max(20, startHz), startAt);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, endHz), startAt + duration);

  gain.gain.setValueAtTime(Math.max(0.0001, peakGain), startAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.01);
}

function scheduleNoiseTransient(
  ctx: AudioContext,
  startAt: number,
  filterType: BiquadFilterType,
  freqHz: number,
  q: number,
  duration: number,
  peakGain: number
) {
  const buffer = getNoiseBuffer(ctx);
  if (
    !buffer ||
    typeof ctx.createBufferSource !== 'function' ||
    typeof ctx.createBiquadFilter !== 'function'
  ) {
    return;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.setValueAtTime(Math.max(60, freqHz), startAt);
  filter.Q.setValueAtTime(q, startAt);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(Math.max(0.0001, peakGain), startAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(startAt);
  source.stop(startAt + duration + 0.01);
}

/**
 * Plays realistic multi-layered synthetic mechanical switch audio via Web Audio API
 * for the 5 most popular switch types (Blue, Red, Brown, Black, Topre) with
 * spacebar and modifier key cavity variation.
 */
export function playKeystrokeSound(
  theme: SoundTheme = 'off',
  isError = false,
  keyKind: KeyStrokeKind = 'char',
  volume = 0.85
) {
  if (theme === 'off' && !isError) return;

  const masterVol = Math.min(1, Math.max(0, volume));
  if (masterVol <= 0.001) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (isError) {
    scheduleToneBurst(ctx, now, 'sawtooth', 140, 70, 0.06, 0.08 * masterVol);
    return;
  }

  if (theme === 'off') return;

  const spec = SWITCH_SPECS[theme] || SWITCH_SPECS.click;

  const pitchJitter = 1 + (Math.random() - 0.5) * 0.09;
  const gainJitter = 1 + (Math.random() - 0.5) * 0.12;

  const keyPitchFactor =
    keyKind === 'space' ? 0.62 : keyKind === 'backspace' || keyKind === 'enter' ? 0.78 : 1.0;
  const keyDecayFactor =
    keyKind === 'space' ? 1.45 : keyKind === 'backspace' || keyKind === 'enter' ? 1.22 : 1.0;
  const keyNoiseFreqFactor = keyKind === 'space' ? 0.68 : keyKind === 'enter' ? 0.85 : 1.0;

  scheduleToneBurst(
    ctx,
    now,
    spec.bodyWave,
    spec.bodyStartHz * pitchJitter * keyPitchFactor,
    spec.bodyEndHz * pitchJitter * keyPitchFactor,
    spec.bodyDuration * keyDecayFactor,
    spec.bodyGain * gainJitter * masterVol
  );

  scheduleNoiseTransient(
    ctx,
    now,
    spec.noiseFilterType,
    spec.noiseFreqHz * pitchJitter * keyNoiseFreqFactor,
    spec.noiseQ,
    spec.noiseDuration * keyDecayFactor,
    spec.noiseGain * gainJitter * masterVol
  );

  if (spec.clickTransient) {
    scheduleToneBurst(
      ctx,
      now + spec.clickTransient.delay,
      spec.clickTransient.wave,
      spec.clickTransient.startHz * pitchJitter,
      spec.clickTransient.endHz * pitchJitter,
      spec.clickTransient.duration,
      spec.clickTransient.gain * gainJitter * masterVol
    );
  }

  if (spec.secondaryRing) {
    scheduleToneBurst(
      ctx,
      now + spec.secondaryRing.delay,
      spec.secondaryRing.wave,
      spec.secondaryRing.startHz * pitchJitter * keyPitchFactor,
      spec.secondaryRing.endHz * pitchJitter * keyPitchFactor,
      spec.secondaryRing.duration,
      spec.secondaryRing.gain * masterVol
    );
  }
}

const SOUND_THEME_STORAGE_KEY = 'keysmasher_sound_theme';
const SOUND_VOLUME_STORAGE_KEY = 'keysmasher_sound_volume';

export function loadStoredSoundSettings(): { theme: SoundTheme | null; volume: number } {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { theme: null, volume: 0.85 };
    }
    const rawTheme = window.localStorage.getItem(SOUND_THEME_STORAGE_KEY) as SoundTheme | null;
    const rawVol = window.localStorage.getItem(SOUND_VOLUME_STORAGE_KEY);
    const validTheme = rawTheme && PROFILE_MAP.has(rawTheme) ? rawTheme : null;
    const parsedVol = rawVol !== null ? Number(rawVol) : 0.85;
    const volume = Number.isFinite(parsedVol) ? Math.min(1, Math.max(0, parsedVol)) : 0.85;
    return { theme: validTheme, volume };
  } catch {
    return { theme: null, volume: 0.85 };
  }
}

export function saveSoundSettings(theme: SoundTheme, volume?: number): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(SOUND_THEME_STORAGE_KEY, theme);
    if (typeof volume === 'number') {
      window.localStorage.setItem(SOUND_VOLUME_STORAGE_KEY, String(Math.min(1, Math.max(0, volume))));
    }
  } catch {
    // Ignore storage quota errors
  }
}
