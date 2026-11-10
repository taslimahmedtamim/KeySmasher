'use client';

import React, { useMemo, useState } from 'react';
import { WpmHistoryPoint } from '../types';

interface WpmHistoryChartProps {
  history: WpmHistoryPoint[];
  averageWpm: number;
  className?: string;
}

interface PlotPoint {
  x: number;
  y: number;
}

/**
 * Compute clean axis tick intervals scaled dynamically to peak values.
 */
function getSpeedStep(peak: number): number {
  if (peak <= 80) return 20;
  if (peak <= 160) return 40;
  if (peak <= 240) return 60;
  if (peak <= 400) return 80;
  return Math.max(50, Math.ceil(peak / 4 / 25) * 25);
}

/**
 * Compute Fritsch-Carlson monotone cubic Hermite spline commands (`M ... C ...`)
 * so speed curves stay smooth without overshooting peaks or dipping below 0 WPM.
 */
function buildMonotoneSplinePath(points: PlotPoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`;
  }

  const n = points.length;
  const dx: number[] = [];
  const dy: number[] = [];
  const secants: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    const deltaX = points[i + 1].x - points[i].x;
    const deltaY = points[i + 1].y - points[i].y;
    dx.push(deltaX);
    dy.push(deltaY);
    secants.push(deltaX === 0 ? 0 : deltaY / deltaX);
  }

  const tangents: number[] = new Array(n).fill(0);
  tangents[0] = secants[0];
  tangents[n - 1] = secants[n - 2];

  for (let i = 1; i < n - 1; i++) {
    const sPrev = secants[i - 1];
    const sNext = secants[i];
    if (sPrev * sNext <= 0) {
      tangents[i] = 0;
    } else {
      tangents[i] = (sPrev + sNext) / 2;
    }
  }

  // Enforce monotonicity constraint across every segment
  for (let i = 0; i < n - 1; i++) {
    const s = secants[i];
    if (s === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const alpha = tangents[i] / s;
    const beta = tangents[i + 1] / s;
    const normSq = alpha * alpha + beta * beta;
    if (normSq > 9) {
      const scale = 3 / Math.sqrt(normSq);
      tangents[i] = scale * alpha * s;
      tangents[i + 1] = scale * beta * s;
    }
  }

  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const segDx = dx[i];
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + segDx / 3;
    const cp1y = p0.y + (tangents[i] * segDx) / 3;
    const cp2x = p1.x - segDx / 3;
    const cp2y = p1.y - (tangents[i + 1] * segDx) / 3;
    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  }

  return path;
}

export const WpmHistoryChart: React.FC<WpmHistoryChartProps> = ({
  history,
  averageWpm,
  className = '',
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<WpmHistoryPoint | null>(null);

  const sortedHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    return [...history].sort((a, b) => a.second - b.second);
  }, [history]);

  if (sortedHistory.length < 2) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-surface-border bg-surface/40 text-xs text-slate-500">
        Speed graph will generate on tests longer than 2 seconds
      </div>
    );
  }

  const width = 760;
  const height = 220;
  const padding = { top: 18, right: 48, bottom: 28, left: 54 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const bottomY = padding.top + chartHeight;

  const hasBurstSeries = sortedHistory.some((p) => typeof p.burstWpm === 'number');

  const peakSpeed = Math.max(
    40,
    averageWpm,
    ...sortedHistory.map((p) => Math.max(p.rawWpm, p.netWpm, p.burstWpm ?? 0))
  );
  const yStep = getSpeedStep(peakSpeed);
  const axisMaxWpm = Math.max(yStep * 2, Math.ceil(peakSpeed / yStep) * yStep);

  const yTicks: number[] = [];
  for (let val = 0; val <= axisMaxWpm; val += yStep) {
    yTicks.push(val);
  }

  const maxErrorsRaw = Math.max(0, ...sortedHistory.map((p) => p.errors));
  const errorStep =
    maxErrorsRaw <= 4
      ? 1
      : maxErrorsRaw <= 8
      ? 2
      : maxErrorsRaw <= 16
      ? 4
      : Math.ceil(maxErrorsRaw / 4);
  const axisMaxErrors = Math.max(
    errorStep * 2,
    Math.ceil(Math.max(1, maxErrorsRaw) / errorStep) * errorStep
  );

  const errorTicks: number[] = [];
  for (let err = 0; err <= axisMaxErrors; err += errorStep) {
    errorTicks.push(err);
  }

  const minSecond = sortedHistory[0]?.second ?? 1;
  const maxSecond = Math.max(sortedHistory[sortedHistory.length - 1]?.second ?? 1, minSecond + 1);

  const getX = (second: number) => {
    return padding.left + ((second - minSecond) / (maxSecond - minSecond)) * chartWidth;
  };

  const getY = (wpm: number) => {
    const clamped = Math.min(axisMaxWpm, Math.max(0, wpm));
    return bottomY - (clamped / axisMaxWpm) * chartHeight;
  };

  const getErrorY = (errors: number) => {
    const clamped = Math.min(axisMaxErrors, Math.max(0, errors));
    return bottomY - (clamped / axisMaxErrors) * chartHeight;
  };

  const netPlotPoints = sortedHistory.map((p) => ({ x: getX(p.second), y: getY(p.netWpm) }));
  const rawPlotPoints = sortedHistory.map((p) => ({ x: getX(p.second), y: getY(p.rawWpm) }));
  const burstPlotPoints = hasBurstSeries
    ? sortedHistory.map((p) => ({ x: getX(p.second), y: getY(p.burstWpm ?? p.rawWpm) }))
    : [];

  const netPathD = buildMonotoneSplinePath(netPlotPoints);
  const rawPathD = buildMonotoneSplinePath(rawPlotPoints);
  const burstPathD = hasBurstSeries ? buildMonotoneSplinePath(burstPlotPoints) : '';

  const firstX = netPlotPoints[0].x;
  const lastX = netPlotPoints[netPlotPoints.length - 1].x;
  const netAreaD = `${netPathD} L ${lastX.toFixed(2)} ${bottomY.toFixed(2)} L ${firstX.toFixed(2)} ${bottomY.toFixed(2)} Z`;
  const burstAreaD = hasBurstSeries
    ? `${burstPathD} L ${lastX.toFixed(2)} ${bottomY.toFixed(2)} L ${firstX.toFixed(2)} ${bottomY.toFixed(2)} Z`
    : '';

  const avgY = getY(averageWpm);

  // X-axis tick spacing matching Monkeytype integer labels (1, 2, 3...)
  const totalPoints = sortedHistory.length;
  const xTickStep =
    totalPoints <= 20 ? 1 : totalPoints <= 40 ? 2 : totalPoints <= 80 ? 5 : 10;

  const visibleXTicks = sortedHistory.filter(
    (point, idx) =>
      idx === 0 || idx === sortedHistory.length - 1 || point.second % xTickStep === 0
  );

  // Compute interactive vertical hover strip boundaries around each sample point
  const hitStrips = sortedHistory.map((point, idx) => {
    const currX = getX(point.second);
    const prevX = idx === 0 ? padding.left : getX(sortedHistory[idx - 1].second);
    const nextX =
      idx === sortedHistory.length - 1
        ? padding.left + chartWidth
        : getX(sortedHistory[idx + 1].second);
    const leftBound = idx === 0 ? padding.left : (prevX + currX) / 2;
    const rightBound =
      idx === sortedHistory.length - 1 ? padding.left + chartWidth : (currX + nextX) / 2;
    return {
      point,
      x: leftBound,
      width: Math.max(4, rightBound - leftBound),
    };
  });

  return (
    <div className={`relative rounded-xl border border-surface-border bg-surface/60 p-4 ${className}`}>
      {/* Header & Monkeytype-style Legend */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-slate-200">Speed Over Time</span>
          <span className="text-[11px] text-slate-500 font-mono">
            (seconds vs WPM)
          </span>
          <span className="rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-cyan-300">
            Avg {Math.round(averageWpm)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-cyan-400" />
            <span className="text-cyan-300">Net WPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-slate-400" />
            <span className="text-slate-300">Raw WPM</span>
          </div>
          {hasBurstSeries && (
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded-full bg-slate-500" />
              <span className="text-slate-400">Burst</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold leading-none text-rose-400">×</span>
            <span className="text-rose-400">Errors</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Speed Over Time Chart"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="netWpmGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="burstWpmGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal WPM Gridlines & Left Y-Axis Labels */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={`y-${tick}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="#1e293b"
                  strokeOpacity="0.85"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Vertical Second Gridlines & Bottom X-Axis Labels */}
          {visibleXTicks.map((point) => {
            const x = getX(point.second);
            return (
              <g key={`x-${point.second}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={bottomY}
                  stroke="#1e293b"
                  strokeOpacity="0.55"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={bottomY + 16}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {point.second}
                </text>
              </g>
            );
          })}

          {/* Right Y-Axis Error Ticks */}
          {errorTicks.map((err) => {
            const y = getErrorY(err);
            return (
              <text
                key={`err-tick-${err}`}
                x={padding.left + chartWidth + 8}
                y={y + 3}
                fill="#64748b"
                fontSize="10"
                textAnchor="start"
                fontFamily="monospace"
              >
                {err}
              </text>
            );
          })}

          {/* Axis Titles (Monkeytype dual vertical labels) */}
          <text
            x={14}
            y={padding.top + chartHeight / 2}
            fill="#64748b"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
            transform={`rotate(-90, 14, ${padding.top + chartHeight / 2})`}
          >
            Words per Minute
          </text>
          <text
            x={width - 12}
            y={padding.top + chartHeight / 2}
            fill="#64748b"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
            transform={`rotate(90, ${width - 12}, ${padding.top + chartHeight / 2})`}
          >
            Errors
          </text>

          {/* Subtle Burst Area & Smooth Curve */}
          {hasBurstSeries && (
            <>
              <path d={burstAreaD} fill="url(#burstWpmGradient)" />
              <path
                d={burstPathD}
                fill="none"
                stroke="#64748b"
                strokeOpacity="0.7"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Soft Gradient Fill Under Net WPM */}
          <path d={netAreaD} fill="url(#netWpmGradient)" />

          {/* Subtle Average WPM Horizontal Guide */}
          {averageWpm > 0 && (
            <line
              x1={padding.left}
              y1={avgY}
              x2={padding.left + chartWidth}
              y2={avgY}
              stroke="#06b6d4"
              strokeDasharray="3 5"
              strokeWidth="1"
              strokeOpacity="0.4"
            />
          )}

          {/* Cumulative Raw WPM Smooth Dashed Curve */}
          <path
            d={rawPathD}
            fill="none"
            stroke="#94a3b8"
            strokeOpacity="0.85"
            strokeDasharray="5 4"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Primary Net WPM Smooth Curve */}
          <path
            d={netPathD}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical Hover Crosshair */}
          {hoveredPoint && (
            <line
              x1={getX(hoveredPoint.second)}
              y1={padding.top}
              x2={getX(hoveredPoint.second)}
              y2={bottomY}
              stroke="#475569"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          )}

          {/* Point Dots (Burst + Net WPM) & Red '×' Error Markers */}
          {sortedHistory.map((point) => {
            const x = getX(point.second);
            const yNet = getY(point.netWpm);
            const yBurst = hasBurstSeries ? getY(point.burstWpm ?? point.rawWpm) : null;
            const yRaw = getY(point.rawWpm);
            const yErr = getErrorY(point.errors);
            const isHovered = hoveredPoint?.second === point.second;

            return (
              <g key={`pts-${point.second}`}>
                {hasBurstSeries && yBurst !== null && (
                  <circle
                    cx={x}
                    cy={yBurst}
                    r={isHovered ? 3.5 : 2}
                    fill="#475569"
                    stroke="#090d16"
                    strokeWidth="1"
                  />
                )}

                {isHovered && (
                  <circle
                    cx={x}
                    cy={yRaw}
                    r={3.5}
                    fill="#94a3b8"
                    stroke="#090d16"
                    strokeWidth="1.2"
                  />
                )}

                <circle
                  cx={x}
                  cy={yNet}
                  r={isHovered ? 4.5 : 2.5}
                  fill={isHovered ? '#22d3ee' : '#090d16'}
                  stroke="#22d3ee"
                  strokeWidth={isHovered ? 2 : 1.75}
                />

                {point.errors > 0 && (
                  <g
                    data-testid="error-marker"
                    transform={`translate(${x}, ${yErr})`}
                  >
                    <line
                      x1={isHovered ? -4.2 : -3.2}
                      y1={isHovered ? -4.2 : -3.2}
                      x2={isHovered ? 4.2 : 3.2}
                      y2={isHovered ? 4.2 : 3.2}
                      stroke="#fb7185"
                      strokeWidth={isHovered ? 2.4 : 1.9}
                      strokeLinecap="round"
                    />
                    <line
                      x1={isHovered ? -4.2 : -3.2}
                      y1={isHovered ? 4.2 : 3.2}
                      x2={isHovered ? 4.2 : 3.2}
                      y2={isHovered ? -4.2 : -3.2}
                      stroke="#fb7185"
                      strokeWidth={isHovered ? 2.4 : 1.9}
                      strokeLinecap="round"
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* Full-Height Interactive Hover Hit Strips */}
          {hitStrips.map((strip) => (
            <rect
              key={`hit-${strip.point.second}`}
              x={strip.x}
              y={padding.top}
              width={strip.width}
              height={chartHeight}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoveredPoint(strip.point)}
            />
          ))}
        </svg>
      </div>

      {/* Fixed-Height Second Telemetry Bar */}
      <div className="mt-2 flex min-h-[32px] flex-wrap items-center justify-center gap-4 rounded-lg border border-surface-border bg-surface-muted/80 px-3 py-1.5 font-mono text-xs text-slate-300">
        {hoveredPoint ? (
          <>
            <div>
              <span className="text-slate-500">Second: </span>
              <span className="font-bold text-white">{hoveredPoint.second}s</span>
            </div>
            <div>
              <span className="font-bold text-cyan-400">{Math.round(hoveredPoint.netWpm)}</span>
              <span className="text-slate-500"> Net</span>
            </div>
            <div>
              <span className="font-bold text-slate-200">{Math.round(hoveredPoint.rawWpm)}</span>
              <span className="text-slate-500"> Raw</span>
            </div>
            {typeof hoveredPoint.burstWpm === 'number' && (
              <div>
                <span className="font-bold text-slate-400">{Math.round(hoveredPoint.burstWpm)}</span>
                <span className="text-slate-500"> Burst</span>
              </div>
            )}
            <div>
              <span className="font-bold text-emerald-400">{Math.round(hoveredPoint.accuracy)}%</span>
              <span className="text-slate-500"> Acc</span>
            </div>
            <div>
              <span
                className={`font-bold ${
                  hoveredPoint.errors > 0 ? 'text-rose-400' : 'text-slate-500'
                }`}
              >
                {hoveredPoint.errors}
              </span>
              <span className={hoveredPoint.errors > 0 ? 'text-rose-400' : 'text-slate-500'}>
                {' '}
                {hoveredPoint.errors === 1 ? 'Error' : 'Errors'}
              </span>
            </div>
          </>
        ) : (
          <span className="text-[11px] text-slate-500">
            Hover across seconds to inspect Net WPM, Raw WPM, Burst & Errors
          </span>
        )}
      </div>
    </div>
  );
};
