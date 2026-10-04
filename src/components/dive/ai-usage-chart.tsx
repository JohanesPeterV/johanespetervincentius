'use client';

import { useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { SiClaude, SiOpenai } from 'react-icons/si';

import { useAiUsage } from '@/hooks/use-ai-usage';
import { formatTokens } from '@/lib/ai-usage';

type Point = { x: number; y: number };

const WIDTH = 1000;
const HEIGHT = 100;

const dayFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

const formatDay = (date: string): string =>
  dayFormat.format(new Date(`${date}T00:00:00Z`));

const tickStep = (scaleMax: number): number => {
  const rough = scaleMax / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const factor =
    [1, 2, 5].find((candidate) => candidate * magnitude >= rough) ?? 10;
  return factor * magnitude;
};

// REASON: Steffen's monotone tangents pass the curve through every day's
// value without overshooting, so the axis reads true and never dips below zero.
const tangent = (before: number, after: number): number => {
  if (before * after <= 0) {
    return 0;
  }
  return (
    Math.sign(before) *
    Math.min(
      2 * Math.abs(before),
      2 * Math.abs(after),
      Math.abs(before + after) / 2,
    )
  );
};

const buildCurve = (points: readonly Point[]): string => {
  const step = points[1].x - points[0].x;
  const slopes = points
    .slice(1)
    .map((point, index) => (point.y - points[index].y) / step);
  const tangents = points.map((_, index) => {
    if (index === 0) {
      return slopes[0];
    }
    if (index === slopes.length) {
      return slopes[index - 1];
    }
    return tangent(slopes[index - 1], slopes[index]);
  });
  const segments = points.slice(1).map((point, index) => {
    const start = points[index];
    return `C ${start.x + step / 3} ${start.y + (tangents[index] * step) / 3} ${point.x - step / 3} ${point.y - (tangents[index + 1] * step) / 3} ${point.x} ${point.y}`;
  });
  return `M ${points[0].x} ${points[0].y} ${segments.join(' ')}`;
};

export const AiUsageChart = () => {
  const { usage } = useAiUsage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { daily } = usage;
  const lastIndex = daily.length - 1;
  const totals = daily.map(({ codex, claude }) => codex + claude);
  const busiestIndex = totals.indexOf(Math.max(...totals));
  const peak = Math.max(
    1,
    ...daily.flatMap(({ codex, claude }) => [codex, claude]),
  );
  const scaleMax = peak * 1.1;
  const step = tickStep(scaleMax);
  const ticks = Array.from(
    { length: Math.floor(scaleMax / step) },
    (_, index) => (index + 1) * step,
  );
  const shownIndex = activeIndex ?? busiestIndex;
  const shown = daily[shownIndex];
  const xPercent = (index: number): number => (index / lastIndex) * 100;
  const yPercent = (value: number): number => (value / scaleMax) * 100;
  const series = [
    {
      id: 'codex',
      tool: 'Codex',
      icon: SiOpenai,
      color: 'text-secondary',
      values: daily.map(({ codex }) => codex),
    },
    {
      id: 'claude',
      tool: 'Claude Code',
      icon: SiClaude,
      color: 'text-primary',
      values: daily.map(({ claude }) => claude),
    },
  ];
  const valueText = `${formatDay(shown.date)}: ${series
    .map(
      ({ tool, values }) =>
        `${tool} ${formatTokens(values[shownIndex])} tokens`,
    )
    .join(', ')}`;

  const selectDayAt = (event: PointerEvent<HTMLDivElement>): void => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    setActiveIndex(Math.round(Math.min(1, Math.max(0, ratio)) * lastIndex));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    setActiveIndex(Math.min(lastIndex, Math.max(0, shownIndex + direction)));
  };

  return (
    <figure className="mt-10 grid gap-6">
      <figcaption className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <span className="type-meta text-muted-foreground">
          Daily tokens · last 30 days
        </span>
        <span
          aria-hidden
          className="type-meta flex flex-wrap items-center gap-x-4 gap-y-1"
        >
          <span className="text-muted-foreground">
            {formatDay(shown.date)}
            {shownIndex === busiestIndex ? ' · busiest day' : null}
          </span>
          {series.map(({ id, tool, icon: Icon, color, values }) => (
            <span key={id} className="flex items-center gap-1.5">
              <Icon aria-hidden className={`size-3.5 ${color}`} />
              <span className="text-muted-foreground">{tool}</span>
              <span className="text-foreground">
                {formatTokens(values[shownIndex])}
              </span>
            </span>
          ))}
        </span>
      </figcaption>
      <div>
        <div
          role="slider"
          tabIndex={0}
          aria-label="Daily AI token usage"
          aria-valuemin={0}
          aria-valuemax={lastIndex}
          aria-valuenow={shownIndex}
          aria-valuetext={valueText}
          data-horizontal-gesture
          onPointerDown={selectDayAt}
          onPointerMove={selectDayAt}
          onPointerLeave={() => setActiveIndex(null)}
          onKeyDown={handleKeyDown}
          onBlur={() => setActiveIndex(null)}
          className="relative h-64 cursor-crosshair border-b border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-text sm:h-80"
        >
          {ticks.map((tick) => (
            <div
              key={tick}
              aria-hidden
              className="absolute inset-x-0 border-t border-border/60"
              style={{ bottom: `${yPercent(tick)}%` }}
            >
              <span className="type-meta absolute bottom-full left-0 mb-1 text-muted-foreground">
                {formatTokens(tick)}
              </span>
            </div>
          ))}
          <svg
            aria-hidden
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            {series.map(({ id, color, values }) => {
              const curve = buildCurve(
                values.map((value, index) => ({
                  x: (index / lastIndex) * WIDTH,
                  y: HEIGHT * (1 - value / scaleMax),
                })),
              );
              return (
                <g key={id} className={color}>
                  <defs>
                    <linearGradient
                      id={`ai-usage-fill-${id}`}
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="0"
                        stopColor="currentColor"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="1"
                        stopColor="currentColor"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${curve} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`}
                    fill={`url(#ai-usage-fill-${id})`}
                  />
                  <path
                    d={curve}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </svg>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-px bg-foreground/30"
            style={{ left: `${xPercent(shownIndex)}%` }}
          />
          {series.map(({ id, color, values }) => (
            <span
              key={`${id}-live`}
              aria-hidden
              className={`pointer-events-none absolute size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-current opacity-60 motion-safe:animate-ping ${color}`}
              style={{
                left: '100%',
                bottom: `${yPercent(values[lastIndex])}%`,
              }}
            />
          ))}
          {series.map(({ id, color, values }) => (
            <span
              key={id}
              aria-hidden
              className={`pointer-events-none absolute size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-current ring-2 ring-background ${color}`}
              style={{
                left: `${xPercent(shownIndex)}%`,
                bottom: `${yPercent(values[shownIndex])}%`,
              }}
            />
          ))}
        </div>
        <div
          aria-hidden
          className="type-meta mt-2 flex justify-between text-muted-foreground"
        >
          <span>{formatDay(daily[0].date)}</span>
          <span>{formatDay(daily[lastIndex].date)}</span>
        </div>
      </div>
    </figure>
  );
};
