'use client';

import React from 'react';
import { VolumeX } from 'lucide-react';
import { SoundTheme } from '../types';
import {
  getNextSoundTheme,
  getSoundProfile,
  playKeystrokeSound,
} from '../utils/soundEffects';

interface SoundSwitchSelectorProps {
  value: SoundTheme;
  volume?: number;
  onChange: (theme: SoundTheme) => void;
  buttonId?: string;
}

/**
 * Direct inline button that cycles through the 5 most popular switch sounds on click:
 * Mute -> Blue (Click) -> Red -> Brown -> Black (Thock) -> Topre -> Mute.
 * Right-clicking directly mutes. Zero floating popup windows.
 */
export const SoundSwitchSelector: React.FC<SoundSwitchSelectorProps> = ({
  value,
  volume = 0.85,
  onChange,
  buttonId,
}) => {
  const currentProfile = getSoundProfile(value);
  const nextProfile = getSoundProfile(getNextSoundTheme(value));
  const isMuted = value === 'off';

  const handleCycleClick = () => {
    const nextTheme = getNextSoundTheme(value);
    onChange(nextTheme);
    if (nextTheme !== 'off') {
      playKeystrokeSound(nextTheme, false, 'char', volume);
    }
  };

  const handleRightClickMute = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isMuted) {
      e.preventDefault();
      onChange('off');
    }
  };

  return (
    <button
      type="button"
      id={buttonId}
      onClick={handleCycleClick}
      onContextMenu={handleRightClickMute}
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
        !isMuted
          ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/15'
          : 'border-slate-700 bg-surface text-slate-400 hover:border-slate-500 hover:text-white'
      }`}
      title={
        isMuted
          ? `Sound: Mute · Click to switch to ${nextProfile.name} (${nextProfile.feel})`
          : `${currentProfile.name} (${currentProfile.feel}) · Click for ${nextProfile.name}, right-click to mute`
      }
    >
      {isMuted ? (
        <VolumeX className="h-3.5 w-3.5" />
      ) : (
        <span
          aria-hidden="true"
          className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border border-slate-700 bg-slate-900"
        >
          <svg viewBox="0 0 16 16" className="h-2.5 w-2.5">
            <rect x="6" y="2" width="4" height="12" rx="1" fill={currentProfile.stemHex} />
            <rect x="2" y="6" width="12" height="4" rx="1" fill={currentProfile.stemHex} />
          </svg>
        </span>
      )}
      <span className="whitespace-nowrap">{currentProfile.shortLabel}</span>
    </button>
  );
};
