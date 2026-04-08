import { type ReactElement } from 'react';

export type MotionLayer = {
  pointerX: number;
  pointerY: number;
  scale: number;
  scrollY: number;
};

export type SparkSpec = {
  left: string;
  opacity: number;
  rotate: number;
  size: number;
  top: string;
  variant: 'cross' | 'dot';
};

export const MOTION_LAYERS: MotionLayer[] = [
  { pointerX: 34, pointerY: 18, scale: 1.02, scrollY: 18 },
  { pointerX: 52, pointerY: 28, scale: 1.05, scrollY: 28 },
  { pointerX: 72, pointerY: 36, scale: 1.08, scrollY: 16 },
  { pointerX: 96, pointerY: 52, scale: 1.12, scrollY: 42 },
];

export const SPARKS: SparkSpec[] = [
  {
    left: '8%',
    opacity: 0.88,
    rotate: -8,
    size: 84,
    top: '6%',
    variant: 'cross',
  },
  {
    left: '18%',
    opacity: 0.76,
    rotate: 10,
    size: 18,
    top: '22%',
    variant: 'dot',
  },
  {
    left: '28%',
    opacity: 0.82,
    rotate: -4,
    size: 22,
    top: '10%',
    variant: 'dot',
  },
  {
    left: '35%',
    opacity: 0.9,
    rotate: 12,
    size: 76,
    top: '4%',
    variant: 'cross',
  },
  {
    left: '46%',
    opacity: 0.72,
    rotate: 4,
    size: 16,
    top: '18%',
    variant: 'dot',
  },
  {
    left: '58%',
    opacity: 0.94,
    rotate: -10,
    size: 18,
    top: '12%',
    variant: 'dot',
  },
  {
    left: '64%',
    opacity: 0.86,
    rotate: 9,
    size: 66,
    top: '22%',
    variant: 'cross',
  },
  {
    left: '73%',
    opacity: 0.8,
    rotate: -2,
    size: 20,
    top: '14%',
    variant: 'dot',
  },
  {
    left: '81%',
    opacity: 0.9,
    rotate: 7,
    size: 58,
    top: '7%',
    variant: 'cross',
  },
  {
    left: '88%',
    opacity: 0.78,
    rotate: 0,
    size: 14,
    top: '20%',
    variant: 'dot',
  },
  {
    left: '14%',
    opacity: 0.6,
    rotate: -10,
    size: 58,
    top: '40%',
    variant: 'cross',
  },
  {
    left: '78%',
    opacity: 0.7,
    rotate: 6,
    size: 16,
    top: '34%',
    variant: 'dot',
  },
];

export const SparkMark = ({
  color,
  spec,
}: {
  color: string;
  spec: SparkSpec;
}): ReactElement => {
  if (spec.variant === 'dot') {
    return (
      <div
        className="absolute rounded-full"
        style={{
          backgroundColor: color,
          height: `${spec.size}px`,
          left: spec.left,
          opacity: spec.opacity,
          top: spec.top,
          width: `${spec.size}px`,
        }}
      />
    );
  }

  return (
    <div
      className="absolute"
      style={{
        height: `${spec.size}px`,
        left: spec.left,
        opacity: spec.opacity,
        top: spec.top,
        transform: `rotate(${spec.rotate}deg)`,
        width: `${spec.size}px`,
      }}
    >
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full"
        style={{
          backgroundColor: color,
          height: '100%',
          width: `${Math.max(4, Math.floor(spec.size * 0.12))}px`,
        }}
      />
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
        style={{
          backgroundColor: color,
          height: `${Math.max(4, Math.floor(spec.size * 0.12))}px`,
          width: '100%',
        }}
      />
    </div>
  );
};
