'use client';

import React, { useState } from 'react';
import { X, FileText, Sparkles, Check } from 'lucide-react';

interface CustomTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (text: string) => void;
  initialText?: string;
}

const PRESETS = [
  {
    name: 'JavaScript / React',
    text: 'const [status, setStatus] = useState("ready"); useEffect(() => { console.log(status); }, [status]);',
  },
  {
    name: 'Philosophy',
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit of disciplined action.',
  },
  {
    name: 'Speed Drill',
    text: 'the quick brown fox jumps over the lazy dog while typing fast with rhythm and flawless accuracy',
  },
];

export const CustomTextModal: React.FC<CustomTextModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialText = '',
}) => {
  const [text, setText] = useState(initialText);

  if (!isOpen) return null;

  const wordsCount = text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
  const charsCount = text.length;

  const handleApply = () => {
    if (text.trim().length > 0) {
      onApply(text.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Custom Practice Text</h3>
              <p className="text-xs text-slate-400">Paste or type your own practice passage</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-muted hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Text Area */}
        <div className="mt-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Paste your code snippet, book excerpt, or practice text here..."
            className="w-full rounded-xl border border-surface-border bg-surface-muted p-4 font-mono text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none"
            autoFocus
          />

          <div className="mt-2 flex items-center justify-between font-mono text-xs text-slate-400">
            <div>
              <span>{wordsCount} words</span>
              <span className="mx-2">•</span>
              <span>{charsCount} characters</span>
            </div>
            {text.length > 0 && (
              <button
                type="button"
                onClick={() => setText('')}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear text
              </button>
            )}
          </div>
        </div>

        {/* Presets */}
        <div className="mt-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Or choose a quick preset:
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setText(preset.text)}
                className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-muted/60 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-white transition-all"
              >
                <Sparkles className="h-3 w-3 text-cyan-400" />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-surface-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-surface-border px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-surface-muted hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={text.trim().length === 0}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-neon-cyan active:scale-95"
          >
            <Check className="h-4 w-4" />
            <span>Start Practice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
