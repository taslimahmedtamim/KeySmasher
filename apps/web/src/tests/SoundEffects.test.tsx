import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SoundSwitchSelector } from '@/features/typing/components/SoundSwitchSelector';
import {
  SOUND_PROFILES,
  getNextSoundTheme,
  getSoundProfile,
  playKeystrokeSound,
} from '@/features/typing/utils/soundEffects';
import type { SoundTheme } from '@/features/typing/types';

function createMockAudioContext() {
  const oscCalls: Array<{ startFreq: number; type: OscillatorType }> = [];
  const filterCalls: Array<{ type: BiquadFilterType; freq: number }> = [];

  class MockAudioContext {
    sampleRate = 44100;
    currentTime = 0;
    state = 'running';
    destination = {};

    resume = vi.fn();

    createBuffer = vi.fn((_channels: number, length: number) => ({
      getChannelData: () => new Float32Array(length),
    }));

    createBufferSource = vi.fn(() => ({
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }));

    createBiquadFilter = vi.fn(() => {
      const node = {
        type: 'bandpass' as BiquadFilterType,
        frequency: {
          setValueAtTime: vi.fn((freq: number) => {
            filterCalls.push({ type: node.type, freq });
          }),
        },
        Q: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
      };
      return node;
    });

    createOscillator = vi.fn(() => {
      const node = {
        type: 'sine' as OscillatorType,
        frequency: {
          setValueAtTime: vi.fn((startFreq: number) => {
            oscCalls.push({ startFreq, type: node.type });
          }),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
      return node;
    });

    createGain = vi.fn(() => ({
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }));
  }

  return { MockAudioContext, oscCalls, filterCalls };
}

describe('Mechanical Keyboard Sound Engine', () => {
  const originalAudioContext = (window as unknown as { AudioContext?: unknown }).AudioContext;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    (window as unknown as { AudioContext?: unknown }).AudioContext = originalAudioContext;
  });

  it('provides the 5 most popular switch sounds (Blue, Red, Brown, Black, Topre) plus Mute', () => {
    const activeProfiles = SOUND_PROFILES.filter((p) => p.id !== 'off');
    expect(activeProfiles).toHaveLength(5);

    expect(getSoundProfile('click').name).toBe('Blue Switch');
    expect(getSoundProfile('mx-red').name).toBe('Red Switch');
    expect(getSoundProfile('clack').name).toBe('Brown Switch');
    expect(getSoundProfile('thock').name).toBe('Black Switch');
    expect(getSoundProfile('topre').name).toBe('Topre 45g');
    expect(getSoundProfile('off').shortLabel).toBe('Mute');

    expect(getNextSoundTheme('off')).toBe('click');
    expect(getNextSoundTheme('click')).toBe('mx-red');
    expect(getNextSoundTheme('mx-red')).toBe('clack');
    expect(getNextSoundTheme('clack')).toBe('thock');
    expect(getNextSoundTheme('thock')).toBe('topre');
    expect(getNextSoundTheme('topre')).toBe('off');
  });

  it('synthesizes multi-layer Web Audio for each switch and lowers pitch for spacebar hits', () => {
    const { MockAudioContext, oscCalls, filterCalls } = createMockAudioContext();
    (window as unknown as { AudioContext: unknown }).AudioContext = MockAudioContext;

    const themes = SOUND_PROFILES.map((p) => p.id).filter(
      (id): id is Exclude<SoundTheme, 'off'> => id !== 'off'
    );

    for (const theme of themes) {
      const beforeOsc = oscCalls.length;
      const beforeFilter = filterCalls.length;
      playKeystrokeSound(theme, false, 'char', 0.9);
      expect(oscCalls.length).toBeGreaterThan(beforeOsc);
      expect(filterCalls.length).toBeGreaterThan(beforeFilter);
    }

    // Spacebar lowers housing cavity frequency relative to regular char keystrokes
    oscCalls.length = 0;
    playKeystrokeSound('thock', false, 'char', 1);
    const charFreq = oscCalls[0].startFreq;
    oscCalls.length = 0;
    playKeystrokeSound('thock', false, 'space', 1);
    const spaceFreq = oscCalls[0].startFreq;
    expect(spaceFreq).toBeLessThan(charFreq * 0.75);

    // Muted theme with no error emits nothing; error plays sawtooth buzz; volume=0 emits nothing
    oscCalls.length = 0;
    playKeystrokeSound('off', false, 'char', 1);
    expect(oscCalls).toHaveLength(0);

    playKeystrokeSound('mx-red', false, 'char', 0);
    expect(oscCalls).toHaveLength(0);

    playKeystrokeSound('off', true, 'char', 0.8);
    expect(oscCalls).toHaveLength(1);
  });
});

describe('SoundSwitchSelector Inline Cycler', () => {
  it('cycles directly through Mute -> Blue -> Red -> Brown -> Black -> Topre -> Mute with no floating dialog', () => {
    const onChange = vi.fn();

    const { rerender } = render(
      <SoundSwitchSelector buttonId="test-sound-btn" value="off" onChange={onChange} />
    );

    const btn = screen.getByRole('button', { name: /Mute/i });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(btn);
    expect(onChange).toHaveBeenLastCalledWith('click');

    rerender(<SoundSwitchSelector buttonId="test-sound-btn" value="click" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Blue/i }));
    expect(onChange).toHaveBeenLastCalledWith('mx-red');

    rerender(<SoundSwitchSelector buttonId="test-sound-btn" value="mx-red" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Red/i }));
    expect(onChange).toHaveBeenLastCalledWith('clack');

    rerender(<SoundSwitchSelector buttonId="test-sound-btn" value="clack" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Brown/i }));
    expect(onChange).toHaveBeenLastCalledWith('thock');

    rerender(<SoundSwitchSelector buttonId="test-sound-btn" value="thock" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Black/i }));
    expect(onChange).toHaveBeenLastCalledWith('topre');

    // Right-click directly mutes from any active switch
    fireEvent.contextMenu(screen.getByRole('button', { name: /Black/i }));
    expect(onChange).toHaveBeenLastCalledWith('off');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
