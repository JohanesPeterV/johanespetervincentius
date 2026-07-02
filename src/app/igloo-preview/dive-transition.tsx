'use client';

import { useEffect, useRef } from 'react';

import {
  DIVE_EASE,
  DIVE_SCREENS,
  TOUCH_SENSITIVITY,
  WHEEL_SENSITIVITY,
  aberrationShadow,
  ambientBackground,
  computeScreenMotion,
  grainShift,
  railProximity,
  rushTransform,
  shimmerOpacity,
  streakMotion,
  wrapDistance,
} from './dive-motion';

const GRAIN_TEXTURE = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='128' height='128' filter='url(%23n)'/></svg>")`;

export default function DiveTransition() {
  const screensRef = useRef<(HTMLDivElement | null)[]>([]);
  const railRef = useRef<(HTMLDivElement | null)[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const streaksRef = useRef<HTMLDivElement>(null);
  const ambientRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const lastTouchRef = useRef(0);

  const apply = (value: number, velocity: number): void => {
    const count = DIVE_SCREENS.length;
    const g = ((value % count) + count) % count;
    for (let index = 0; index < count; index++) {
      const element = screensRef.current[index];
      if (!element) {
        continue;
      }
      const motion = computeScreenMotion(wrapDistance(g, index, count));
      if (!motion) {
        element.style.opacity = '0';
        continue;
      }
      element.style.transform = motion.transform;
      element.style.opacity = motion.opacity;
      element.style.filter = motion.filter;
      element.style.setProperty('--dive', motion.dive);
    }
    for (let index = 0; index < count; index++) {
      const notch = railRef.current[index];
      if (!notch) {
        continue;
      }
      const proximity = railProximity(g, index);
      notch.style.opacity = String(0.2 + proximity * 0.8);
      notch.style.transform = `scaleX(${1 + proximity * 1.6})`;
    }
    const stage = stageRef.current;
    if (stage) {
      stage.style.textShadow = aberrationShadow(velocity);
      stage.style.transform = rushTransform(velocity);
    }
    const shimmer = shimmerRef.current;
    if (shimmer) {
      shimmer.style.opacity = shimmerOpacity(g);
    }
    const streaks = streaksRef.current;
    if (streaks) {
      const overlay = streakMotion(g, velocity);
      streaks.style.opacity = overlay.opacity;
      streaks.style.transform = overlay.transform;
    }
    const ambient = ambientRef.current;
    if (ambient) {
      ambient.style.background = ambientBackground(g);
    }
    const grain = grainRef.current;
    if (grain) {
      grain.style.backgroundPosition = grainShift(g);
    }
  };

  const tick = (): void => {
    const step = (targetRef.current - currentRef.current) * DIVE_EASE;
    currentRef.current += step;
    if (Math.abs(targetRef.current - currentRef.current) < 0.0005) {
      const count = DIVE_SCREENS.length;
      const wrapped = ((currentRef.current % count) + count) % count;
      currentRef.current = wrapped;
      targetRef.current = wrapped;
      apply(wrapped, 0);
      frameRef.current = null;
      return;
    }
    apply(currentRef.current, step);
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
    apply(0, 0);
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
      <div ref={ambientRef} aria-hidden className="absolute inset-0" />
      <div
        ref={stageRef}
        className="absolute inset-0 [transform-style:preserve-3d]"
      >
        {DIVE_SCREENS.map((screen, index) => (
          <div
            key={screen.tag}
            ref={(element) => {
              screensRef.current[index] = element;
            }}
            style={{ opacity: index === 0 ? 1 : 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 [--dive:0]"
          >
            <span
              className={`font-mono text-xs tracking-[0.4em] [transform:translateY(calc(var(--dive)*-70px))] ${screen.accent}`}
            >
              {screen.tag}
            </span>
            <h2 className="whitespace-pre-line text-center text-5xl font-semibold leading-[1.05] [letter-spacing:clamp(-0.025em,calc(-0.025em+var(--dive)*0.18em),0.4em)] sm:text-7xl">
              {screen.title}
            </h2>
            <span className="font-mono text-xs tracking-[0.3em] text-white/30 [transform:translateY(calc(var(--dive)*90px))]">
              {screen.subtitle}
            </span>
          </div>
        ))}
      </div>
      <div
        ref={streaksRef}
        aria-hidden
        style={{
          opacity: 0,
          background:
            'repeating-conic-gradient(from 0deg at 50% 50%, rgba(150, 215, 255, 0.5) 0deg, transparent 0.7deg, transparent 5.4deg)',
          maskImage:
            'radial-gradient(circle at 50% 50%, transparent 18%, black 62%)',
          WebkitMaskImage:
            'radial-gradient(circle at 50% 50%, transparent 18%, black 62%)',
          mixBlendMode: 'screen',
        }}
        className="pointer-events-none absolute inset-0"
      />
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
      <div
        ref={grainRef}
        aria-hidden
        style={{ backgroundImage: GRAIN_TEXTURE }}
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
      />
      <div className="pointer-events-none absolute right-6 top-1/2 flex -translate-y-1/2 flex-col items-end gap-3">
        {DIVE_SCREENS.map((screen, index) => (
          <div
            key={screen.tag}
            ref={(element) => {
              railRef.current[index] = element;
            }}
            style={{ opacity: index === 0 ? 1 : 0.2 }}
            className="h-px w-6 origin-right bg-white"
          />
        ))}
      </div>
      <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 font-mono text-[0.65rem] tracking-[0.3em] text-white/30">
        wheel / drag · loops both ways
      </div>
    </div>
  );
}
