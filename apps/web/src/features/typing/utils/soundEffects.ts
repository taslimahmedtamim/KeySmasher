import { SoundTheme } from '../types';

let audioCtx: AudioContext | null = null;

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

/**
 * Plays synthetic mechanical switch keystroke sound using Web Audio API.
 * High performance, zero latency, no external mp3 assets required.
 */
export function playKeystrokeSound(theme: SoundTheme = 'off', isError = false) {
  if (theme === 'off' && !isError) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (isError) {
    // Subtle low buzz for incorrect keypress
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.06);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
    return;
  }

  if (theme === 'off') return;

  if (theme === 'click') {
    // Crisp click (Blue switch style: sharp high-frequency chirp)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    // Subtle frequency variance for authentic typing feel (+/- 40Hz)
    const variance = (Math.random() - 0.5) * 80;
    osc.frequency.setValueAtTime(2400 + variance, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.025);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  } else if (theme === 'clack') {
    // Tactile clack (Brown switch style: medium pop)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const variance = (Math.random() - 0.5) * 60;
    osc.frequency.setValueAtTime(1100 + variance, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.035);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  } else if (theme === 'thock') {
    // Deep thock (Lubed linear / Red / Black switch: deep bassy wooden tap)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const variance = (Math.random() - 0.5) * 40;
    osc.frequency.setValueAtTime(320 + variance, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.045);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}
