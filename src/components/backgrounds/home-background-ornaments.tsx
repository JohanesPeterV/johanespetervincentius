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

export type FloaterTone = 'accent' | 'highlight' | 'shadow';

export type FloatingObjectSpec = {
  delay: string;
  duration: string;
  height: string;
  left: string;
  opacity: number;
  rotate: number;
  shape: 'diamond' | 'pill' | 'ring';
  tone: FloaterTone;
  top: string;
  width: string;
};

export const MOTION_LAYERS: MotionLayer[] = [
  { pointerX: 18, pointerY: 10, scale: 1.01, scrollY: 10 },
  { pointerX: 28, pointerY: 16, scale: 1.03, scrollY: 16 },
  { pointerX: 40, pointerY: 22, scale: 1.05, scrollY: 10 },
  { pointerX: 44, pointerY: 26, scale: 1.06, scrollY: 16 },
  { pointerX: 56, pointerY: 32, scale: 1.08, scrollY: 28 },
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

export const FLOATERS: FloatingObjectSpec[] = [
  {
    delay: '-2s',
    duration: '11s',
    height: '4.5rem',
    left: '10%',
    opacity: 0.44,
    rotate: -16,
    shape: 'ring',
    tone: 'highlight',
    top: '68%',
    width: '4.5rem',
  },
  {
    delay: '-5s',
    duration: '14s',
    height: '1.4rem',
    left: '24%',
    opacity: 0.42,
    rotate: 26,
    shape: 'diamond',
    tone: 'accent',
    top: '58%',
    width: '1.4rem',
  },
  {
    delay: '-8s',
    duration: '13s',
    height: '1.2rem',
    left: '66%',
    opacity: 0.36,
    rotate: 8,
    shape: 'pill',
    tone: 'highlight',
    top: '60%',
    width: '5.5rem',
  },
  {
    delay: '-3s',
    duration: '12s',
    height: '2rem',
    left: '80%',
    opacity: 0.34,
    rotate: -22,
    shape: 'diamond',
    tone: 'accent',
    top: '72%',
    width: '2rem',
  },
  {
    delay: '-6s',
    duration: '15s',
    height: '6rem',
    left: '88%',
    opacity: 0.22,
    rotate: 18,
    shape: 'ring',
    tone: 'shadow',
    top: '46%',
    width: '6rem',
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

export const FloatingObject = ({
  borderColor,
  glowColor,
  spec,
}: {
  borderColor: string;
  glowColor: string;
  spec: FloatingObjectSpec;
}): ReactElement => {
  const borderRadius = spec.shape === 'diamond' ? '0.8rem' : '9999px';

  return (
    <div
      className="absolute"
      style={{
        height: spec.height,
        left: spec.left,
        opacity: spec.opacity,
        top: spec.top,
        transform: `rotate(${spec.rotate}deg)`,
        width: spec.width,
      }}
    >
      <div
        className="animate-background-float h-full w-full"
        style={{ animationDelay: spec.delay, animationDuration: spec.duration }}
      >
        <div
          className="h-full w-full border backdrop-blur-sm"
          style={{
            backgroundColor: `${glowColor}18`,
            borderColor,
            borderRadius,
            boxShadow: `0 0 32px ${glowColor}22`,
          }}
        />
      </div>
    </div>
  );
};
