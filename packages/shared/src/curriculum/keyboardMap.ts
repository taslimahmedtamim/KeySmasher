import { FingerName, KeyFingerGuide } from './types';

export const FINGER_NAMES: Record<FingerName, { label: string; hand: 'left' | 'right'; colorClass: string }> = {
  'left-pinky': { label: 'Left Pinky', hand: 'left', colorClass: 'text-rose-400 bg-rose-500/20 border-rose-500/40' },
  'left-ring': { label: 'Left Ring', hand: 'left', colorClass: 'text-amber-400 bg-amber-500/20 border-amber-500/40' },
  'left-middle': { label: 'Left Middle', hand: 'left', colorClass: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40' },
  'left-index': { label: 'Left Index', hand: 'left', colorClass: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40' },
  'thumb': { label: 'Thumb', hand: 'left', colorClass: 'text-blue-400 bg-blue-500/20 border-blue-500/40' },
  'right-index': { label: 'Right Index', hand: 'right', colorClass: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40' },
  'right-middle': { label: 'Right Middle', hand: 'right', colorClass: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40' },
  'right-ring': { label: 'Right Ring', hand: 'right', colorClass: 'text-amber-400 bg-amber-500/20 border-amber-500/40' },
  'right-pinky': { label: 'Right Pinky', hand: 'right', colorClass: 'text-rose-400 bg-rose-500/20 border-rose-500/40' },
};

export const KEYBOARD_FINGER_MAP: Record<string, KeyFingerGuide> = {
  // Number row
  '`': { char: '`', display: '~ `', finger: 'left-pinky', hand: 'left', row: 'number', colorClass: 'border-rose-500/40' },
  '1': { char: '1', display: '! 1', finger: 'left-pinky', hand: 'left', row: 'number', colorClass: 'border-rose-500/40' },
  '2': { char: '2', display: '@ 2', finger: 'left-ring', hand: 'left', row: 'number', colorClass: 'border-amber-500/40' },
  '3': { char: '3', display: '# 3', finger: 'left-middle', hand: 'left', row: 'number', colorClass: 'border-emerald-500/40' },
  '4': { char: '4', display: '$ 4', finger: 'left-index', hand: 'left', row: 'number', colorClass: 'border-cyan-500/40' },
  '5': { char: '5', display: '% 5', finger: 'left-index', hand: 'left', row: 'number', colorClass: 'border-cyan-500/40' },
  '6': { char: '6', display: '^ 6', finger: 'right-index', hand: 'right', row: 'number', colorClass: 'border-cyan-500/40' },
  '7': { char: '7', display: '& 7', finger: 'right-index', hand: 'right', row: 'number', colorClass: 'border-cyan-500/40' },
  '8': { char: '8', display: '* 8', finger: 'right-middle', hand: 'right', row: 'number', colorClass: 'border-emerald-500/40' },
  '9': { char: '9', display: '( 9', finger: 'right-ring', hand: 'right', row: 'number', colorClass: 'border-amber-500/40' },
  '0': { char: '0', display: ') 0', finger: 'right-pinky', hand: 'right', row: 'number', colorClass: 'border-rose-500/40' },
  '-': { char: '-', display: '_ -', finger: 'right-pinky', hand: 'right', row: 'number', colorClass: 'border-rose-500/40' },
  '=': { char: '=', display: '+ =', finger: 'right-pinky', hand: 'right', row: 'number', colorClass: 'border-rose-500/40' },

  // Top row
  'q': { char: 'q', display: 'Q', finger: 'left-pinky', hand: 'left', row: 'top', colorClass: 'border-rose-500/40' },
  'w': { char: 'w', display: 'W', finger: 'left-ring', hand: 'left', row: 'top', colorClass: 'border-amber-500/40' },
  'e': { char: 'e', display: 'E', finger: 'left-middle', hand: 'left', row: 'top', colorClass: 'border-emerald-500/40' },
  'r': { char: 'r', display: 'R', finger: 'left-index', hand: 'left', row: 'top', colorClass: 'border-cyan-500/40' },
  't': { char: 't', display: 'T', finger: 'left-index', hand: 'left', row: 'top', colorClass: 'border-cyan-500/40' },
  'y': { char: 'y', display: 'Y', finger: 'right-index', hand: 'right', row: 'top', colorClass: 'border-cyan-500/40' },
  'u': { char: 'u', display: 'U', finger: 'right-index', hand: 'right', row: 'top', colorClass: 'border-cyan-500/40' },
  'i': { char: 'i', display: 'I', finger: 'right-middle', hand: 'right', row: 'top', colorClass: 'border-emerald-500/40' },
  'o': { char: 'o', display: 'O', finger: 'right-ring', hand: 'right', row: 'top', colorClass: 'border-amber-500/40' },
  'p': { char: 'p', display: 'P', finger: 'right-pinky', hand: 'right', row: 'top', colorClass: 'border-rose-500/40' },
  '[': { char: '[', display: '{ [', finger: 'right-pinky', hand: 'right', row: 'top', colorClass: 'border-rose-500/40' },
  ']': { char: ']', display: '} ]', finger: 'right-pinky', hand: 'right', row: 'top', colorClass: 'border-rose-500/40' },
  '\\': { char: '\\', display: '| \\', finger: 'right-pinky', hand: 'right', row: 'top', colorClass: 'border-rose-500/40' },

  // Home row (anchor row)
  'a': { char: 'a', display: 'A', finger: 'left-pinky', hand: 'left', row: 'home', colorClass: 'border-rose-500/40' },
  's': { char: 's', display: 'S', finger: 'left-ring', hand: 'left', row: 'home', colorClass: 'border-amber-500/40' },
  'd': { char: 'd', display: 'D', finger: 'left-middle', hand: 'left', row: 'home', colorClass: 'border-emerald-500/40' },
  'f': { char: 'f', display: 'F', finger: 'left-index', hand: 'left', row: 'home', colorClass: 'border-cyan-500/40' },
  'g': { char: 'g', display: 'G', finger: 'left-index', hand: 'left', row: 'home', colorClass: 'border-cyan-500/40' },
  'h': { char: 'h', display: 'H', finger: 'right-index', hand: 'right', row: 'home', colorClass: 'border-cyan-500/40' },
  'j': { char: 'j', display: 'J', finger: 'right-index', hand: 'right', row: 'home', colorClass: 'border-cyan-500/40' },
  'k': { char: 'k', display: 'K', finger: 'right-middle', hand: 'right', row: 'home', colorClass: 'border-emerald-500/40' },
  'l': { char: 'l', display: 'L', finger: 'right-ring', hand: 'right', row: 'home', colorClass: 'border-amber-500/40' },
  ';': { char: ';', display: ': ;', finger: 'right-pinky', hand: 'right', row: 'home', colorClass: 'border-rose-500/40' },
  "'": { char: "'", display: '" \' ', finger: 'right-pinky', hand: 'right', row: 'home', colorClass: 'border-rose-500/40' },

  // Bottom row
  'z': { char: 'z', display: 'Z', finger: 'left-pinky', hand: 'left', row: 'bottom', colorClass: 'border-rose-500/40' },
  'x': { char: 'x', display: 'X', finger: 'left-ring', hand: 'left', row: 'bottom', colorClass: 'border-amber-500/40' },
  'c': { char: 'c', display: 'C', finger: 'left-middle', hand: 'left', row: 'bottom', colorClass: 'border-emerald-500/40' },
  'v': { char: 'v', display: 'V', finger: 'left-index', hand: 'left', row: 'bottom', colorClass: 'border-cyan-500/40' },
  'b': { char: 'b', display: 'B', finger: 'left-index', hand: 'left', row: 'bottom', colorClass: 'border-cyan-500/40' },
  'n': { char: 'n', display: 'N', finger: 'right-index', hand: 'right', row: 'bottom', colorClass: 'border-cyan-500/40' },
  'm': { char: 'm', display: 'M', finger: 'right-index', hand: 'right', row: 'bottom', colorClass: 'border-cyan-500/40' },
  ',': { char: ',', display: '< ,', finger: 'right-middle', hand: 'right', row: 'bottom', colorClass: 'border-emerald-500/40' },
  '.': { char: '.', display: '> .', finger: 'right-ring', hand: 'right', row: 'bottom', colorClass: 'border-amber-500/40' },
  '/': { char: '/', display: '? /', finger: 'right-pinky', hand: 'right', row: 'bottom', colorClass: 'border-rose-500/40' },

  // Spacebar
  ' ': { char: ' ', display: 'Space', finger: 'thumb', hand: 'left', row: 'space', colorClass: 'border-blue-500/40' },
};

/**
 * Returns finger guidance for any given character (handles uppercase via lowercase mapping).
 */
export function getFingerForKey(char: string): KeyFingerGuide | null {
  const lower = char.toLowerCase();
  return KEYBOARD_FINGER_MAP[lower] || null;
}
