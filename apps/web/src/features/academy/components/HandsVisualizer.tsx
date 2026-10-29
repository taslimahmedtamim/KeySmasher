'use client';

import React from 'react';
import {
  FingerName,
  FINGER_NAMES,
  getFingerForKey,
  KeyFingerGuide,
} from '@keysmasher/shared';
import { ArrowRight, Compass, Hand, Sparkles } from 'lucide-react';

interface HandsVisualizerProps {
  activeChar?: string;
  className?: string;
}

interface FingerModel {
  id: FingerName;
  name: string;
  shortName: string;
  homeKey: string;
  hand: 'left' | 'right';
  height: string; // Tailored height to represent finger length
  color: string;
  hex: string;
  isTactile?: boolean;
}

const LEFT_FINGERS: FingerModel[] = [
  {
    id: 'left-pinky',
    name: 'Pinky',
    shortName: 'Pinky',
    homeKey: 'A',
    hand: 'left',
    height: 'h-16',
    color: 'rose',
    hex: '#f43f5e',
  },
  {
    id: 'left-ring',
    name: 'Ring',
    shortName: 'Ring',
    homeKey: 'S',
    hand: 'left',
    height: 'h-24',
    color: 'amber',
    hex: '#f59e0b',
  },
  {
    id: 'left-middle',
    name: 'Middle',
    shortName: 'Middle',
    homeKey: 'D',
    hand: 'left',
    height: 'h-32',
    color: 'emerald',
    hex: '#10b981',
  },
  {
    id: 'left-index',
    name: 'Index',
    shortName: 'Index',
    homeKey: 'F',
    hand: 'left',
    height: 'h-20',
    color: 'cyan',
    hex: '#22d3ee',
    isTactile: true,
  },
  {
    id: 'thumb',
    name: 'Thumb',
    shortName: 'Thumb',
    homeKey: '␣',
    hand: 'left',
    height: 'h-12',
    color: 'blue',
    hex: '#3b82f6',
  },
];

const RIGHT_FINGERS: FingerModel[] = [
  {
    id: 'thumb',
    name: 'Thumb',
    shortName: 'Thumb',
    homeKey: '␣',
    hand: 'right',
    height: 'h-12',
    color: 'blue',
    hex: '#3b82f6',
  },
  {
    id: 'right-index',
    name: 'Index',
    shortName: 'Index',
    homeKey: 'J',
    hand: 'right',
    height: 'h-20',
    color: 'cyan',
    hex: '#22d3ee',
    isTactile: true,
  },
  {
    id: 'right-middle',
    name: 'Middle',
    shortName: 'Middle',
    homeKey: 'K',
    hand: 'right',
    height: 'h-32',
    color: 'emerald',
    hex: '#10b981',
  },
  {
    id: 'right-ring',
    name: 'Ring',
    shortName: 'Ring',
    homeKey: 'L',
    hand: 'right',
    height: 'h-24',
    color: 'amber',
    hex: '#f59e0b',
  },
  {
    id: 'right-pinky',
    name: 'Pinky',
    shortName: 'Pinky',
    homeKey: ';',
    hand: 'right',
    height: 'h-16',
    color: 'rose',
    hex: '#f43f5e',
  },
];

export const HandsVisualizer: React.FC<HandsVisualizerProps> = ({
  activeChar = '',
  className = '',
}) => {
  const guide: KeyFingerGuide | null = getFingerForKey(activeChar);
  const activeFingerId = guide?.finger;
  const activeHand = guide?.hand;
  const isReach = guide && guide.homeKey.toLowerCase() !== activeChar.toLowerCase();

  return (
    <div
      className={`rounded-2xl border border-surface-border bg-surface/75 p-5 backdrop-blur shadow-neon-card select-none ${className}`}
    >
      {/* Hand Visualizer Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <Hand className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Anatomical Finger Placement Guide
          </span>
        </div>

        {/* Action Trajectory Badges */}
        {guide && (
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-0.5 text-slate-300">
              {guide.hand === 'left' ? 'Left Hand' : 'Right Hand'}
            </span>

            <span
              className={`rounded-lg border px-2.5 py-0.5 font-bold ${
                guide.finger.includes('index')
                  ? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-300'
                  : guide.finger.includes('middle')
                  ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                  : guide.finger.includes('ring')
                  ? 'border-amber-400/50 bg-amber-500/20 text-amber-300'
                  : guide.finger.includes('pinky')
                  ? 'border-rose-400/50 bg-rose-500/20 text-rose-300'
                  : 'border-blue-400/50 bg-blue-500/20 text-blue-300'
              }`}
            >
              {FINGER_NAMES[guide.finger]?.label}
            </span>

            {isReach && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-purple-500/40 bg-purple-500/20 px-2 py-0.5 text-[11px] font-bold text-purple-300">
                <span>{guide.homeKey.toUpperCase()}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="text-cyan-300 font-black">{activeChar.toUpperCase()}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Two Hands Illustration Container */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-end justify-center py-2">
        {/* LEFT HAND */}
        <div
          className={`flex flex-col items-center rounded-xl p-4 border transition-all duration-300 ${
            activeHand === 'left'
              ? 'border-cyan-500/40 bg-surface-muted/40 shadow-neon-card'
              : 'border-surface-border/40 bg-surface/30 opacity-70'
          }`}
        >
          <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>Left Hand</span>
            {activeHand === 'left' && (
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>

          {/* Fingers Row */}
          <div className="flex items-end gap-2.5 sm:gap-3.5">
            {LEFT_FINGERS.map((finger) => {
              const isActive = activeHand === 'left' && activeFingerId === finger.id;

              return (
                <div key={finger.id} className="flex flex-col items-center">
                  {/* Floating Target Character Badge */}
                  <div className="h-7 mb-1 flex items-center justify-center">
                    {isActive ? (
                      <span className="flex items-center gap-1 rounded-md border border-cyan-400 bg-cyan-400 text-slate-950 px-1.5 py-0.5 font-mono text-xs font-black shadow-[0_0_12px_#22d3ee] animate-bounce-subtle">
                        {activeChar === ' ' ? '␣' : activeChar.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-[10px] text-transparent">—</span>
                    )}
                  </div>

                  {/* Anatomical Finger Capsule */}
                  <div
                    className={`relative w-8 sm:w-10 rounded-t-2xl border-2 transition-all duration-200 flex flex-col justify-between items-center py-2 ${
                      finger.height
                    } ${
                      isActive
                        ? 'border-cyan-300 bg-cyan-500/30 scale-105 z-10 shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                        : `border-slate-800 bg-surface-muted hover:border-slate-700`
                    }`}
                  >
                    {/* Fingernail / Pad Accent */}
                    <div
                      className={`h-3 w-5 sm:w-6 rounded-t-lg transition-all ${
                        isActive
                          ? 'bg-cyan-300 shadow-[0_0_8px_#22d3ee]'
                          : finger.color === 'rose'
                          ? 'bg-rose-900/40'
                          : finger.color === 'amber'
                          ? 'bg-amber-900/40'
                          : finger.color === 'emerald'
                          ? 'bg-emerald-900/40'
                          : finger.color === 'cyan'
                          ? 'bg-cyan-900/40'
                          : 'bg-blue-900/40'
                      }`}
                    />

                    {/* Joint Rings */}
                    <div className="w-full flex justify-center space-y-0.5 opacity-30">
                      <div className="h-0.5 w-4 rounded-full bg-slate-500" />
                    </div>

                    {/* Home Key resting pill */}
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md font-mono text-[11px] font-bold border transition-colors ${
                        isActive
                          ? 'border-cyan-300 bg-cyan-400 text-slate-950 font-black'
                          : 'border-slate-700 bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      {finger.homeKey}
                    </div>

                    {/* Tactile bump marker for F */}
                    {finger.isTactile && (
                      <div className="absolute -bottom-1 h-1 w-3 rounded-full bg-cyan-400" />
                    )}
                  </div>

                  {/* Finger Label */}
                  <span
                    className={`mt-2 font-mono text-[10px] font-semibold transition-colors ${
                      isActive ? 'text-cyan-300 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {finger.shortName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Palm Base */}
          <div className="mt-2 h-7 w-48 sm:w-60 rounded-b-2xl border-t border-slate-800 bg-gradient-to-b from-surface-muted/60 to-transparent flex items-center justify-center">
            <span className="text-[10px] font-mono text-slate-600">Left Palm (Desk Rest)</span>
          </div>
        </div>

        {/* RIGHT HAND */}
        <div
          className={`flex flex-col items-center rounded-xl p-4 border transition-all duration-300 ${
            activeHand === 'right'
              ? 'border-cyan-500/40 bg-surface-muted/40 shadow-neon-card'
              : 'border-surface-border/40 bg-surface/30 opacity-70'
          }`}
        >
          <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>Right Hand</span>
            {activeHand === 'right' && (
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>

          {/* Fingers Row */}
          <div className="flex items-end gap-2.5 sm:gap-3.5">
            {RIGHT_FINGERS.map((finger) => {
              const isActive = activeHand === 'right' && activeFingerId === finger.id;

              return (
                <div key={`${finger.id}-${finger.homeKey}`} className="flex flex-col items-center">
                  {/* Floating Target Character Badge */}
                  <div className="h-7 mb-1 flex items-center justify-center">
                    {isActive ? (
                      <span className="flex items-center gap-1 rounded-md border border-cyan-400 bg-cyan-400 text-slate-950 px-1.5 py-0.5 font-mono text-xs font-black shadow-[0_0_12px_#22d3ee] animate-bounce-subtle">
                        {activeChar === ' ' ? '␣' : activeChar.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-[10px] text-transparent">—</span>
                    )}
                  </div>

                  {/* Anatomical Finger Capsule */}
                  <div
                    className={`relative w-8 sm:w-10 rounded-t-2xl border-2 transition-all duration-200 flex flex-col justify-between items-center py-2 ${
                      finger.height
                    } ${
                      isActive
                        ? 'border-cyan-300 bg-cyan-500/30 scale-105 z-10 shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                        : `border-slate-800 bg-surface-muted hover:border-slate-700`
                    }`}
                  >
                    {/* Fingernail / Pad Accent */}
                    <div
                      className={`h-3 w-5 sm:w-6 rounded-t-lg transition-all ${
                        isActive
                          ? 'bg-cyan-300 shadow-[0_0_8px_#22d3ee]'
                          : finger.color === 'rose'
                          ? 'bg-rose-900/40'
                          : finger.color === 'amber'
                          ? 'bg-amber-900/40'
                          : finger.color === 'emerald'
                          ? 'bg-emerald-900/40'
                          : finger.color === 'cyan'
                          ? 'bg-cyan-900/40'
                          : 'bg-blue-900/40'
                      }`}
                    />

                    {/* Joint Rings */}
                    <div className="w-full flex justify-center space-y-0.5 opacity-30">
                      <div className="h-0.5 w-4 rounded-full bg-slate-500" />
                    </div>

                    {/* Home Key resting pill */}
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md font-mono text-[11px] font-bold border transition-colors ${
                        isActive
                          ? 'border-cyan-300 bg-cyan-400 text-slate-950 font-black'
                          : 'border-slate-700 bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      {finger.homeKey}
                    </div>

                    {/* Tactile bump marker for J */}
                    {finger.isTactile && (
                      <div className="absolute -bottom-1 h-1 w-3 rounded-full bg-cyan-400" />
                    )}
                  </div>

                  {/* Finger Label */}
                  <span
                    className={`mt-2 font-mono text-[10px] font-semibold transition-colors ${
                      isActive ? 'text-cyan-300 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {finger.shortName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Palm Base */}
          <div className="mt-2 h-7 w-48 sm:w-60 rounded-b-2xl border-t border-slate-800 bg-gradient-to-b from-surface-muted/60 to-transparent flex items-center justify-center">
            <span className="text-[10px] font-mono text-slate-600">Right Palm (Desk Rest)</span>
          </div>
        </div>
      </div>

      {/* Movement Coach Live Instructions Bar */}
      {guide && (
        <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Compass className="h-4 w-4" />
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Movement & Placement Instruction:
              </div>
              <p className="text-xs font-medium text-slate-200 mt-0.5">
                {guide.instruction}
              </p>
            </div>
          </div>

          {/* Step-by-step vector trajectory */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0 self-end sm:self-center bg-surface px-2.5 py-1.5 rounded-lg border border-surface-border">
            <span className="text-slate-400">Home:</span>
            <span className="font-bold text-amber-300">[{guide.homeKey.toUpperCase()}]</span>
            <ArrowRight className="h-3 w-3 text-cyan-400" />
            <span className="text-slate-400">Press:</span>
            <span className="font-black text-cyan-300">[{activeChar === ' ' ? 'Space' : activeChar.toUpperCase()}]</span>
            {isReach && (
              <>
                <ArrowRight className="h-3 w-3 text-slate-600" />
                <span className="text-slate-500">Return:</span>
                <span className="font-bold text-slate-400">[{guide.homeKey.toUpperCase()}]</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
