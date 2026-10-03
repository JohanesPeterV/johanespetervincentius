'use client';

import { SiClaude, SiOpenai } from 'react-icons/si';

import { useAiUsage } from '@/hooks/use-ai-usage';

const WIDTH = 1000;
const HEIGHT = 100;

const buildCurve = (values: readonly number[], peak: number): string => {
  const points = values.map((value, index) => ({
    x: (index / (values.length - 1)) * WIDTH,
    y: HEIGHT * (1 - value / peak),
  }));
  const first = points[0];
  const last = points[points.length - 1];
  // REASON: each day is a control point and the curve passes through the
  // midpoints between days, so it stays smooth and never dips below zero.
  const bends = points.slice(1, -1).map((point, index) => {
    const next = points[index + 2];
    return `Q ${point.x} ${point.y} ${(point.x + next.x) / 2} ${(point.y + next.y) / 2}`;
  });
  return `M ${first.x} ${first.y} ${bends.join(' ')} L ${last.x} ${last.y}`;
};

export const AiUsageBackground = () => {
  const { usage } = useAiUsage();
  const peak = Math.max(
    1,
    ...usage.daily.flatMap(({ codex, claude }) => [codex, claude]),
  );
  const series = [
    {
      tool: 'Claude Code',
      icon: SiClaude,
      color: 'text-primary',
      values: usage.daily.map(({ claude }) => claude),
    },
    {
      tool: 'Codex',
      icon: SiOpenai,
      color: 'text-secondary',
      values: usage.daily.map(({ codex }) => codex),
    },
  ];

  return (
    <figure className="pointer-events-none absolute inset-0">
      <svg
        aria-hidden
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[45svh] w-full"
      >
        {series.map(({ tool, color, values }) => {
          const curve = buildCurve(values, peak);
          return (
            <g key={tool} className={color}>
              <path
                d={`${curve} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`}
                fill="currentColor"
                fillOpacity={0.08}
              />
              <path
                d={curve}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.6}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}
      </svg>
      <figcaption className="type-meta absolute bottom-6 left-5 flex h-11 items-center gap-4 text-muted-foreground sm:bottom-8 sm:left-8">
        <span className="sr-only md:not-sr-only">
          My daily AI usage · last 30 days
        </span>
        {series.map(({ tool, icon: Icon, color }) => (
          <span key={tool} className="flex items-center gap-1.5">
            <Icon aria-hidden className={`size-3.5 ${color}`} />
            <span className="sr-only md:not-sr-only">{tool}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
};
