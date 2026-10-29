'use client';

import React, { useState } from 'react';
import { WpmHistoryPoint } from '../types';

interface WpmHistoryChartProps {
  history: WpmHistoryPoint[];
  averageWpm: number;
  className?: string;
}

export const WpmHistoryChart: React.FC<WpmHistoryChartProps> = ({
  history,
  averageWpm,
  className = '',
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<WpmHistoryPoint | null>(null);

  if (!history || history.length < 2) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-surface-border bg-surface/40 text-xs text-slate-500">
        Speed graph will generate on tests longer than 2 seconds
      </div>
    );
  }

  const width = 600;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 25, left: 35 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxWpm =
    Math.max(
      60,
      ...history.map((p) => Math.max(p.rawWpm, p.netWpm))
    ) * 1.15;
  const minWpm = 0;

  const maxSecond = Math.max(history[history.length - 1]?.second || 1, 1);
  const minSecond = 1;

  const getX = (second: number) => {
    if (maxSecond === minSecond) return padding.left + chartWidth / 2;
    return padding.left + ((second - minSecond) / (maxSecond - minSecond)) * chartWidth;
  };

  const getY = (wpm: number) => {
    return padding.top + chartHeight - ((wpm - minWpm) / (maxWpm - minWpm)) * chartHeight;
  };

  // Generate SVG path for Raw WPM
  const rawPathD = history.reduce((acc, point, index) => {
    const x = getX(point.second);
    const y = getY(point.rawWpm);
    return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Generate SVG path for Net WPM
  const netPathD = history.reduce((acc, point, index) => {
    const x = getX(point.second);
    const y = getY(point.netWpm);
    return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Generate filled area for Raw WPM
  const firstX = getX(history[0].second);
  const lastX = getX(history[history.length - 1].second);
  const bottomY = padding.top + chartHeight;
  const areaD = `${rawPathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

  // Gridlines for Y-axis (e.g. 0, 30, 60, 90, 120...)
  const yStep = maxWpm > 100 ? 30 : 20;
  const yTicks: number[] = [];
  for (let val = yStep; val < maxWpm; val += yStep) {
    yTicks.push(val);
  }

  const avgY = getY(averageWpm);

  return (
    <div className={`relative rounded-xl border border-surface-border bg-surface/60 p-4 ${className}`}>
      {/* Header and Legend */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">Speed Over Time</span>
          <span className="text-[10px] text-slate-500 font-mono">(seconds vs WPM)</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-medium font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-cyan-400" />
            <span className="text-cyan-300">Raw WPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-white" />
            <span className="text-slate-200">Net WPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span className="text-rose-400">Errors</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={getY(tick)}
                x2={padding.left + chartWidth}
                y2={getY(tick)}
                stroke="#1e293b"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={getY(tick) + 3}
                fill="#64748b"
                fontSize="9"
                textAnchor="end"
                fontFamily="monospace"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Average Line */}
          {averageWpm > 0 && (
            <g>
              <line
                x1={padding.left}
                y1={avgY}
                x2={padding.left + chartWidth}
                y2={avgY}
                stroke="#06b6d4"
                strokeDasharray="4 4"
                strokeWidth="1.2"
                strokeOpacity="0.7"
              />
              <text
                x={padding.left + chartWidth}
                y={avgY - 4}
                fill="#22d3ee"
                fontSize="9"
                textAnchor="end"
                fontFamily="monospace"
              >
                Avg {Math.round(averageWpm)}
              </text>
            </g>
          )}

          {/* Filled Area */}
          <path d={areaD} fill="url(#wpmGradient)" />

          {/* Raw WPM Line */}
          <path
            d={rawPathD}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Net WPM Line */}
          <path
            d={netPathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points and Error Markers */}
          {history.map((point) => {
            const x = getX(point.second);
            const yRaw = getY(point.rawWpm);
            const hasErrors = point.errors > 0;

            return (
              <g
                key={point.second}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Invisible hover target */}
                <circle cx={x} cy={yRaw} r="8" fill="transparent" />

                {/* Raw WPM dot */}
                <circle
                  cx={x}
                  cy={yRaw}
                  r="3"
                  fill="#090d16"
                  stroke="#22d3ee"
                  strokeWidth="2"
                />

                {/* Error marker */}
                {hasErrors && (
                  <circle
                    cx={x}
                    cy={padding.top + chartHeight + 10}
                    r="3.5"
                    fill="#f43f5e"
                    stroke="#881337"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}

          {/* X Axis baseline */}
          <line
            x1={padding.left}
            y1={bottomY}
            x2={padding.left + chartWidth}
            y2={bottomY}
            stroke="#334155"
            strokeWidth="1"
          />

          {/* X Axis ticks */}
          {history.map((point, idx) => {
            // Show every few seconds depending on duration
            const showTick =
              history.length <= 15
                ? true
                : history.length <= 30
                ? point.second % 5 === 0 || idx === history.length - 1
                : point.second % 10 === 0 || idx === history.length - 1;

            if (!showTick) return null;

            return (
              <text
                key={`tick-${point.second}`}
                x={getX(point.second)}
                y={bottomY + 14}
                fill="#64748b"
                fontSize="9"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {point.second}s
              </text>
            );
          })}
        </svg>
      </div>

      {/* Hover Floating Tooltip */}
      {hoveredPoint && (
        <div className="mt-2 flex items-center justify-center gap-4 rounded-lg border border-surface-border bg-surface-muted/90 px-3 py-1.5 font-mono text-xs text-slate-300">
          <div>
            <span className="text-slate-500">Second: </span>
            <span className="font-bold text-white">{hoveredPoint.second}s</span>
          </div>
          <div>
            <span className="text-cyan-400 font-bold">{Math.round(hoveredPoint.rawWpm)}</span>
            <span className="text-slate-500"> Raw</span>
          </div>
          <div>
            <span className="text-white font-bold">{Math.round(hoveredPoint.netWpm)}</span>
            <span className="text-slate-500"> Net</span>
          </div>
          <div>
            <span className="text-emerald-400 font-bold">{Math.round(hoveredPoint.accuracy)}%</span>
            <span className="text-slate-500"> Acc</span>
          </div>
          {hoveredPoint.errors > 0 && (
            <div>
              <span className="text-rose-400 font-bold">{hoveredPoint.errors}</span>
              <span className="text-rose-400"> Errors</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
