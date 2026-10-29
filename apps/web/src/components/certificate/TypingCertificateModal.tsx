'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Award,
  Download,
  Printer,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Edit3,
} from 'lucide-react';

export interface CertificateData {
  recipientName: string;
  wpm: number;
  accuracy: number;
  consistency?: number;
  presetLabel?: string;
  issueDate?: string;
  certificateId?: string;
}

interface TypingCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CertificateData;
}

export const TypingCertificateModal: React.FC<TypingCertificateModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [name, setName] = useState(data.recipientName || 'KeySmasher Typist');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (data.recipientName) {
      setName(data.recipientName);
    }
  }, [data.recipientName, isOpen]);

  const certId = useRef(
    data.certificateId ||
      `KS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
  ).current;

  const formattedDate =
    data.issueDate ||
    new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const roundedWpm = Math.round(data.wpm);
  const roundedAccuracy = Math.round(data.accuracy);
  const roundedConsistency = Math.round(data.consistency || 95);
  const preset = data.presetLabel || 'Verified Speed Test';

  // High-Resolution 1600x1000 Canvas Certificate Generator
  const generateAndDownloadCertificate = useCallback(() => {
    setIsGenerating(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = 1600;
      const H = 1000;
      canvas.width = W;
      canvas.height = H;

      // 1. Background Gradient (Deep Cosmic Slate/Navy)
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#060a12');
      bgGrad.addColorStop(0.5, '#0a101f');
      bgGrad.addColorStop(1, '#04070d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // 2. Subtle Cyber Tech Grid Watermark
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // 3. Ornate Double Borders (Gold + Cyan Neon)
      // Outer Gold Frame
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.strokeRect(35, 35, W - 70, H - 70);

      // Inner Cyan Frame
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.strokeRect(48, 48, W - 96, H - 96);

      // Corner Accents (Cyber gold corner brackets)
      const cornerSize = 40;
      const corners = [
        { x: 35, y: 35, dx: 1, dy: 1 },
        { x: W - 35, y: 35, dx: -1, dy: 1 },
        { x: 35, y: H - 35, dx: 1, dy: -1 },
        { x: W - 35, y: H - 35, dx: -1, dy: -1 },
      ];

      ctx.fillStyle = '#f59e0b';
      corners.forEach((c) => {
        ctx.fillRect(c.x, c.y, c.dx * cornerSize, c.dy * 8);
        ctx.fillRect(c.x, c.y, c.dx * 8, c.dy * cornerSize);
      });

      // 4. Header Badge / Crest
      ctx.textAlign = 'center';

      // KeySmasher Logo Mark
      ctx.fillStyle = '#22d3ee';
      ctx.font = '900 32px monospace';
      ctx.letterSpacing = '6px';
      ctx.fillText('⚡ KEYSMASHER ACADEMY ⚡', W / 2, 120);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 15px sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('INTERNATIONAL STANDARD FOR TOUCH TYPING PROFICIENCY', W / 2, 150);

      // 5. Main Certificate Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 52px sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('CERTIFICATE OF PROFICIENCY', W / 2, 230);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 22px sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('HIGH-SPEED TOUCH TYPING MASTERY', W / 2, 270);

      // 6. Presentation Line
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 400 20px serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('This officially certifies that', W / 2, 335);

      // 7. Recipient Name
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 48px sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText(name.trim() || 'KeySmasher Typist', W / 2, 400);

      // Underline under name
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 280, 420);
      ctx.lineTo(W / 2 + 280, 420);
      ctx.stroke();

      // Description text
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '400 20px sans-serif';
      ctx.letterSpacing = '0.5px';
      ctx.fillText(
        `has achieved verified keyboard mastery in ${preset} with the following verified metrics:`,
        W / 2,
        470
      );

      // 8. Metrics Showcase (3 Golden / Cyan Badges)
      const badgeY = 530;
      const badgeH = 140;
      const badgeW = 280;
      const badgeSpacing = 60;
      const totalWidth = badgeW * 3 + badgeSpacing * 2;
      const startX = (W - totalWidth) / 2;

      const metricsList = [
        { label: 'NET TYPING SPEED', value: `${roundedWpm} WPM`, sub: 'Verified Speed', color: '#22d3ee' },
        { label: 'ACCURACY RATIO', value: `${roundedAccuracy}%`, sub: 'Precision Score', color: '#10b981' },
        { label: 'CONSISTENCY', value: `${roundedConsistency}%`, sub: 'Rhythm Smoothness', color: '#c084fc' },
      ];

      metricsList.forEach((m, idx) => {
        const bx = startX + idx * (badgeW + badgeSpacing);

        // Badge Box Background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(bx, badgeY, badgeW, badgeH);

        // Badge Box Border
        ctx.strokeStyle = m.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, badgeY, badgeW, badgeH);

        // Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 13px sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillText(m.label, bx + badgeW / 2, badgeY + 35);

        // Value
        ctx.fillStyle = m.color;
        ctx.font = '900 42px monospace';
        ctx.letterSpacing = '1px';
        ctx.fillText(m.value, bx + badgeW / 2, badgeY + 85);

        // Sub
        ctx.fillStyle = '#64748b';
        ctx.font = '500 12px sans-serif';
        ctx.letterSpacing = '0.5px';
        ctx.fillText(m.sub, bx + badgeW / 2, badgeY + 115);
      });

      // 9. Verification Seal (Gold Ribbon Crest)
      const sealX = W / 2;
      const sealY = 760;

      // Outer seal ring
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 48, 0, Math.PI * 2);
      ctx.stroke();

      // Inner seal ring
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 42, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = '900 18px sans-serif';
      ctx.fillText('★ KEYSMASHER ★', sealX, sealY - 6);
      ctx.font = '800 10px sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('VERIFIED AUTHENTIC', sealX, sealY + 12);
      ctx.fillText('OFFICIAL STANDARD', sealX, sealY + 26);

      // 10. Footer Details: Date, Verification ID & Signature
      // Left: Certificate ID and Issue Date
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.font = '500 13px monospace';
      ctx.fillText(`CERTIFICATE ID: ${certId}`, 90, 890);
      ctx.fillText(`DATE OF ISSUANCE: ${formattedDate.toUpperCase()}`, 90, 915);
      ctx.fillText('VERIFICATION: KEYSMASHER ACCREDITED RECORD', 90, 940);

      // Right: Signature line
      ctx.textAlign = 'right';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W - 380, 905);
      ctx.lineTo(W - 90, 905);
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'italic 700 20px serif';
      ctx.fillText('KeySmasher Engine Authority', W - 140, 895);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 13px sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('OFFICIAL ENGINE VERIFICATION', W - 140, 925);

      // Download file
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanName = (name || 'typist').toLowerCase().replace(/[^a-z0-9]/g, '-');
        a.download = `keysmasher-certificate-${cleanName}-${roundedWpm}wpm.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsGenerating(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }, 'image/png');
    } catch {
      setIsGenerating(false);
    }
  }, [name, roundedWpm, roundedAccuracy, roundedConsistency, preset, certId, formattedDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centering Wrapper */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-5 text-center">
        <div
          className="relative w-full max-w-3xl rounded-3xl border border-surface-border bg-surface p-5 sm:p-7 text-left shadow-neon-card animate-scale-in my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-surface-muted hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Official Typing Proficiency Certificate
              </h2>
              <p className="text-xs text-slate-400">
                Verified high-resolution achievement certificate for your portfolio or resume.
              </p>
            </div>
          </div>

          {/* Name Customization Row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface-muted/40 p-3 px-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">Recipient Name:</span>
              {isEditingName ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditingName(false);
                  }}
                  autoFocus
                  className="rounded-lg border border-cyan-400 bg-surface px-2.5 py-1 text-xs font-bold text-white focus:outline-none"
                  placeholder="Enter your name"
                />
              ) : (
                <span className="font-bold text-cyan-300 text-sm">{name}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsEditingName(!isEditingName)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{isEditingName ? 'Done' : 'Change Name'}</span>
            </button>
          </div>

          {/* Interactive Certificate Preview Canvas */}
          <div className="relative mt-4 overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-[#060a12] via-[#090f1d] to-[#04070d] p-6 sm:p-8 text-center shadow-[0_0_30px_rgba(245,158,11,0.1)] select-none">
            {/* Ornate Gold Inner Border */}
            <div className="absolute inset-2 sm:inset-3 rounded-xl border border-amber-500/30 pointer-events-none" />
            <div className="absolute inset-3.5 sm:inset-5 rounded-lg border border-cyan-500/20 pointer-events-none" />

            {/* Header */}
            <div className="relative">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-cyan-400 uppercase">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>KeySmasher Accredited Certification</span>
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </div>

              <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-wider text-white">
                CERTIFICATE OF PROFICIENCY
              </h1>
              <p className="mt-0.5 font-mono text-xs font-semibold text-cyan-300 tracking-wider uppercase">
                High-Speed Touch Typing Mastery
              </p>

              <p className="mt-3 text-xs italic text-slate-400">
                This officially certifies that
              </p>

              <div className="mt-1 text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-300">
                {name || 'KeySmasher Typist'}
              </div>

              <p className="mt-2 text-xs text-slate-300 max-w-md mx-auto">
                has achieved verified keyboard mastery in <span className="font-semibold text-white">{preset}</span> with verified speed and accuracy standards.
              </p>

              {/* 3 Metric Badges */}
              <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto">
                <div className="rounded-xl border border-cyan-500/40 bg-surface/80 p-3 text-center shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Net Speed</div>
                  <div className="mt-1 font-mono text-2xl sm:text-3xl font-black text-cyan-300">
                    {roundedWpm}
                  </div>
                  <div className="text-[10px] text-slate-500">WPM</div>
                </div>

                <div className="rounded-xl border border-emerald-500/40 bg-surface/80 p-3 text-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Accuracy</div>
                  <div className="mt-1 font-mono text-2xl sm:text-3xl font-black text-emerald-300">
                    {roundedAccuracy}%
                  </div>
                  <div className="text-[10px] text-slate-500">Precision</div>
                </div>

                <div className="rounded-xl border border-purple-500/40 bg-surface/80 p-3 text-center shadow-[0_0_15px_rgba(192,132,252,0.15)]">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Consistency</div>
                  <div className="mt-1 font-mono text-2xl sm:text-3xl font-black text-purple-300">
                    {roundedConsistency}%
                  </div>
                  <div className="text-[10px] text-slate-500">Cadence</div>
                </div>
              </div>

              {/* Certificate Footer Stamp */}
              <div className="mt-6 flex flex-wrap items-center justify-between border-t border-surface-border/60 pt-4 text-[11px] font-mono text-slate-400">
                <div className="text-left">
                  <div>ID: {certId}</div>
                  <div>Issued: {formattedDate}</div>
                </div>

                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>OFFICIAL VERIFICATION ENGINE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-muted px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>

            <button
              type="button"
              id="certificate-download-png-btn"
              onClick={generateAndDownloadCertificate}
              disabled={isGenerating}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-amber-300 transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)] active:scale-95 disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Certificate Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>{isGenerating ? 'Generating HD Image...' : 'Download Certificate (PNG)'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
