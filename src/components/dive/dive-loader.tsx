'use client';

import { useProgress } from '@react-three/drei';
import { RefObject, useEffect, useRef } from 'react';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import type { HeroHandoff } from './hero-handoff';
import { drawLoadingStar } from './loading-star';

type DiveLoaderProps = {
  handoffRef: RefObject<HeroHandoff>;
  palette: DivePalette;
  motionMode: MotionMode;
};

export default function DiveLoader({
  handoffRef,
  palette,
  motionMode,
}: DiveLoaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  // REASON: the lightweight canvas must animate before WebGL and its assets
  // mount. Its imperative drawing loop reads the same arrival as the scene.
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const count = countRef.current;
    if (!root || !canvas || !count) {
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('The loading scene could not create its canvas.');
    }
    let width = 0;
    let height = 0;
    let frame = 0;
    let progress = 0;
    const started = performance.now();
    const resize = new ResizeObserver(() => {
      width = root.clientWidth;
      height = root.clientHeight;
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    resize.observe(root);

    const render = (now: number): void => {
      const arrival = handoffRef.current.arrival;
      const exit = Math.min(1, arrival / 0.6);
      if (exit === 1) {
        root.hidden = true;
        resize.disconnect();
        return;
      }
      root.hidden = false;
      const { loaded, total } = useProgress.getState();
      const assets = total > 0 ? loaded / total : 0;
      progress = Math.max(progress, Math.min(99, Math.floor(assets * 100)));
      const percentage = arrival > 0 ? 100 : progress;
      count.textContent = String(percentage).padStart(3, '0');
      root.style.setProperty('--loader-exit', String(exit));
      drawLoadingStar(context, {
        width,
        height,
        time: motionMode === 'reduced' ? 0 : (now - started) / 1000,
        progress: percentage / 100,
        exit,
        palette,
      });
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
    };
  }, [handoffRef, palette, motionMode]);

  return (
    <div
      ref={rootRef}
      role="status"
      className="dive-loader pointer-events-none absolute inset-0 z-20 select-none"
    >
      <span className="sr-only">Loading the scene</span>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full"
      />
      <div aria-hidden className="dive-loader-caption dive-loader-identity">
        Johanes Peter
        <br />
        Vincentius
      </div>
      <p aria-hidden className="dive-loader-caption dive-loader-edition">
        An independent
        <br />
        point of view
      </p>
      <div aria-hidden className="dive-loader-readout">
        <span className="dive-loader-caption">Assembling the scene</span>
        <span className="dive-loader-meter">
          [ <span ref={countRef}>000</span>
          <span className="dive-loader-unit">%</span> ]
        </span>
      </div>
      <p aria-hidden className="dive-loader-caption dive-loader-coordinate">
        01 / The observer
      </p>
    </div>
  );
}
