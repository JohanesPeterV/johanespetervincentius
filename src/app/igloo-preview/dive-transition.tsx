'use client';

import { useEffect, useRef } from 'react';

type DummyScreen = {
  tag: string;
  title: string;
  subtitle: string;
  accent: string;
};

const SCREENS: DummyScreen[] = [
  {
    tag: '// 01',
    title: 'Johanes Peter\nVincentius',
    subtitle: 'scroll to dive',
    accent: 'text-sky-200/60',
  },
  {
    tag: '// 02',
    title: 'Work\nExperience',
    subtitle: '2020 — present',
    accent: 'text-cyan-200/60',
  },
  {
    tag: '// 03',
    title: 'Selected\nProjects',
    subtitle: 'a few things built',
    accent: 'text-indigo-200/60',
  },
  {
    tag: '// 04',
    title: 'Tech\nStack',
    subtitle: 'tools of the trade',
    accent: 'text-emerald-200/60',
  },
  {
    tag: '// 05',
    title: "Let's\nTalk",
    subtitle: 'say hello',
    accent: 'text-rose-200/60',
  },
];

const EASE = 0.1;
const WHEEL_SENSITIVITY = 1 / 520;
const TOUCH_SENSITIVITY = 1 / 380;

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

export default function DiveTransition() {
  const screensRef = useRef<(HTMLDivElement | null)[]>([]);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const lastTouchRef = useRef(0);

  const apply = (value: number): void => {
    const count = SCREENS.length;
    const g = ((value % count) + count) % count;
    for (let index = 0; index < count; index++) {
      const element = screensRef.current[index];
      if (!element) {
        continue;
      }
      let distance = g - index;
      distance -= count * Math.round(distance / count);
      if (distance >= 0 && distance <= 1) {
        element.style.transform = `translateZ(${distance * 600}px) scale(${1 + distance * 0.7})`;
        element.style.opacity = String(1 - smoothstep(0.2, 0.58, distance));
        element.style.filter = `blur(${distance * 7}px)`;
      } else if (distance < 0 && distance > -1) {
        const incoming = 1 + distance;
        element.style.transform = `translateZ(${-780 * (1 - incoming)}px) scale(${0.5 + incoming * 0.5})`;
        element.style.opacity = String(smoothstep(0.42, 0.92, incoming));
        element.style.filter = `blur(${(1 - incoming) * 9}px)`;
      } else {
        element.style.opacity = '0';
      }
    }
    const shimmer = shimmerRef.current;
    if (shimmer) {
      const local = g - Math.floor(g);
      const energy = 1 - Math.abs(2 * local - 1);
      shimmer.style.opacity = String(energy * energy * 0.7);
    }
  };

  const tick = (): void => {
    currentRef.current += (targetRef.current - currentRef.current) * EASE;
    if (Math.abs(targetRef.current - currentRef.current) < 0.0005) {
      const count = SCREENS.length;
      const wrapped = ((currentRef.current % count) + count) % count;
      currentRef.current = wrapped;
      targetRef.current = wrapped;
      apply(wrapped);
      frameRef.current = null;
      return;
    }
    apply(currentRef.current);
    frameRef.current = requestAnimationFrame(tick);
  };

  const startLoop = (): void => {
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(tick);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>): void => {
    targetRef.current += event.deltaY * WHEEL_SENSITIVITY;
    startLoop();
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>): void => {
    const touch = event.touches[0];
    if (touch) {
      lastTouchRef.current = touch.clientY;
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>): void => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    targetRef.current +=
      (lastTouchRef.current - touch.clientY) * TOUCH_SENSITIVITY;
    lastTouchRef.current = touch.clientY;
    startLoop();
  };

  // REASON: virtual scroll eases a wrapping progress value toward its target through a requestAnimationFrame loop; without unmount cleanup a queued frame mutates detached nodes after teardown
  useEffect(() => {
    apply(0);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="fixed inset-0 overflow-hidden bg-[#04060d] text-white [perspective:1100px]"
    >
      {SCREENS.map((screen, index) => (
        <div
          key={screen.tag}
          ref={(element) => {
            screensRef.current[index] = element;
          }}
          style={{ opacity: index === 0 ? 1 : 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-5"
        >
          <span
            className={`font-mono text-xs tracking-[0.4em] ${screen.accent}`}
          >
            {screen.tag}
          </span>
          <h2 className="whitespace-pre-line text-center text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            {screen.title}
          </h2>
          <span className="font-mono text-xs tracking-[0.3em] text-white/30">
            {screen.subtitle}
          </span>
        </div>
      ))}
      <div
        ref={shimmerRef}
        aria-hidden
        style={{
          opacity: 0,
          background:
            'radial-gradient(circle at 50% 50%, rgba(120,200,255,0.22), rgba(255,90,200,0.1) 45%, transparent 70%)',
          mixBlendMode: 'screen',
        }}
        className="pointer-events-none absolute inset-0"
      />
      <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 font-mono text-[0.65rem] tracking-[0.3em] text-white/30">
        wheel / drag · loops both ways
      </div>
    </div>
  );
}
