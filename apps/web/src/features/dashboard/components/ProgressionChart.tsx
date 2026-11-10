'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { LineChart, Play } from 'lucide-react';
import { ProgressionPoint } from '../types';

interface ProgressionChartProps {
  points: ProgressionPoint[];
}

export const ProgressionChart: React.FC<ProgressionChartProps> = ({ points }) => {
  const [filterMode, setFilterMode] = useState<string>('all');
  const [hoveredPoint, setHoveredPoint] = useState<ProgressionPoint | null>(null);

  // Filter points based on selected tab
  const filteredPoints = useMemo(() => {
    if (filterMode === 'all') return points;
    return points.filter((p) => p.mode === filterMode || p.preset.includes(filterMode));
  }, [points, filterMode]);

  // Handle empty state (0 tests in history)
  if (points.length === 0) {
    return (
      <div className="rounded-3xl border border-surface-border bg-surface p-8 text-center shadow-neon-card">
        <div className="mx-auto inline-flex rounded-2xl bg-cyan-500/10 p-4 text-cyan-400 border border-cyan-500/20">
          <LineChart className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">No Speed Tests Recorded Yet</h3>
        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
          Complete your first practice test or academy exercise to begin plotting your speed
          progression over time.
        </p>
        <Link
          href="/practice"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-neon-cyan transition-all active:scale-95"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Start First Speed Test</span>
        </Link>
      </div>
    );
  }

  // Chart dimensions with generous padding to prevent edge clipping
  const width = 800;
  const height = 280;
  const paddingLeft = 60;
  const paddingRight = 40;
  const paddingTop = 40;
  const paddingBottom = 45;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Min and Max values for scale across BOTH netWpm and rawWpm so spikes never overflow the chart
  const allWpmValues = filteredPoints.flatMap((p) => [p.netWpm, p.rawWpm]);
  const minWpm = Math.max(0, Math.floor((Math.min(...allWpmValues, 40) - 10) / 10) * 10);
  const maxWpm = Math.ceil((Math.max(...allWpmValues, 80) + 15) / 10) * 10;
  const wpmRange = maxWpm - minWpm || 1;

  const clampY = (val: number) =>
    Math.min(paddingTop + chartH, Math.max(paddingTop, val));

  // Coordinates calculation
  const coordinates = filteredPoints.map((p, idx) => {
    const x =
      filteredPoints.length === 1
        ? paddingLeft + chartW / 2
        : paddingLeft + (idx / (filteredPoints.length - 1)) * chartW;
    const y = clampY(paddingTop + chartH - ((p.netWpm - minWpm) / wpmRange) * chartH);
    const rawY = clampY(paddingTop + chartH - ((p.rawWpm - minWpm) / wpmRange) * chartH);
    return { ...p, x, y, rawY };
  });

  // SVG Paths
  const netLinePath =
    coordinates.length > 1
      ? coordinates.reduce(
          (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
          ''
        )
      : '';

  const rawLinePath =
    coordinates.length > 1
      ? coordinates.reduce(
          (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.rawY}` : `${acc} L ${pt.x} ${pt.rawY}`),
          ''
        )
      : '';

  // Area path for gradient under net WPM line
  const areaPath =
    coordinates.length > 1
      ? `${netLinePath} L ${coordinates[coordinates.length - 1].x} ${
          paddingTop + chartH
        } L ${coordinates[0].x} ${paddingTop + chartH} Z`
      : '';

  // Horizontal Grid Lines
  const gridTicks = [minWpm, Math.round(minWpm + wpmRange / 2), maxWpm];

  return (
    <div className="rounded-3xl border border-surface-border bg-surface p-5 sm:p-6 shadow-neon-card">
      {/* Chart Header & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Speed & Precision Progression</h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Chronological performance trend across completed speed tests.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-surface-border bg-surface-muted p-1 text-[11px] font-semibold">
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'time', label: 'Time' },
            { id: 'words', label: 'Words' },
            { id: 'quote', label: 'Quotes' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setFilterMode(tab.id);
                setHoveredPoint(null);
              }}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                filterMode === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-neon-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative mt-4 w-full select-none overflow-hidden">
        {filteredPoints.length > 0 ? (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-hidden"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="progressionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
              </linearGradient>
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#22d3ee" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Horizontal Grid lines and labels */}
            {gridTicks.map((val) => {
              const y = paddingTop + chartH - ((val - minWpm) / wpmRange) * chartH;
              return (
                <g key={val} className="text-slate-600">
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="currentColor"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                    strokeOpacity="0.35"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 3.5}
                    textAnchor="end"
                    className="fill-slate-500 font-mono text-[11px]"
                  >
                    {val} WPM
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {areaPath && <path d={areaPath} fill="url(#progressionGradient)" />}

            {/* Raw WPM Line (Dashed Slate) */}
            {rawLinePath && (
              <path
                d={rawLinePath}
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />
            )}

            {/* Net WPM Line (Neon Cyan Glow) */}
            {netLinePath && (
              <path
                d={netLinePath}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#neonGlow)"
              />
            )}

            {/* Interactive Data Points */}
            {coordinates.map((pt) => {
              const isHovered = hoveredPoint?.id === pt.id;

              return (
                <g
                  key={pt.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                >
                  {/* Invisible hit target for smooth hovering */}
                  <circle cx={pt.x} cy={pt.y} r={14} fill="transparent" />

                  {/* Visible Data Dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    className={`transition-all duration-150 ${
                      isHovered
                        ? 'fill-cyan-300 stroke-slate-950 stroke-2 drop-shadow-[0_0_10px_#22d3ee]'
                        : 'fill-cyan-400 stroke-slate-900 stroke-1'
                    }`}
                  />
                </g>
              );
            })}
          </svg>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            No tests match this filter yet.
          </div>
        )}

        {/* Hover Popover Tooltip */}
        {hoveredPoint && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-500/40 bg-cyan-950/30 p-2.5 px-4 font-mono text-xs text-white shadow-neon-card animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300 uppercase">
                Test #{hoveredPoint.testIndex} • {hoveredPoint.preset}
              </span>
              <span className="text-[11px] text-slate-400">
                {new Date(hoveredPoint.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase mr-1">Speed:</span>
                <span className="font-bold text-cyan-300">{hoveredPoint.netWpm} WPM</span>
                <span className="text-slate-500 text-[10px] ml-1">({hoveredPoint.rawWpm} raw)</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase mr-1">Accuracy:</span>
                <span className="font-bold text-emerald-400">{hoveredPoint.accuracy}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase mr-1">Consistency:</span>
                <span className="font-bold text-purple-400">{hoveredPoint.consistency}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-surface-border/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-cyan-400" />
            <span className="font-medium text-slate-300">Net WPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-b border-dashed border-slate-500" />
            <span className="font-medium text-slate-400">Raw WPM</span>
          </div>
        </div>
        <div className="font-mono text-[10px] text-slate-500">
          {filteredPoints.length} test{filteredPoints.length === 1 ? '' : 's'} recorded
        </div>
      </div>
    </div>
  );
};
