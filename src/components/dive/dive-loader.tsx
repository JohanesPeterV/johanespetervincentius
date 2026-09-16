'use client';

import { useProgress } from '@react-three/drei';
import { RefObject, useEffect, useRef } from 'react';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import type { HeroHandoff } from './hero-handoff';
import { drawLoadingStar } from './loading-star';
import type { LoadingStarMessage } from './loading-star.worker';

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
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  // REASON: a worker keeps the loader animating while WebGL startup blocks
  // the main thread; DOM progress and exit still follow the shared arrival.
  useEffect(() => {
    const root = rootRef.current;
    const host = canvasHostRef.current;
    const count = countRef.current;
    if (!root || !host || !count) {
      return;
    }
    let width = 0;
    let height = 0;
    let dpr = 1;

    // REASON: transferControlToOffscreen is one-way, so the worker and the
    // main-thread fallback each need a canvas element of their own.
    const mountCanvas = (): HTMLCanvasElement => {
      const element = document.createElement('canvas');
      element.className = 'absolute inset-0 h-full w-full';
      return host.appendChild(element);
    };

    let canvas = mountCanvas();
    let context: CanvasRenderingContext2D | null = null;
    let worker: Worker | null = null;
    let offscreen: OffscreenCanvas | undefined;

    const sizeCanvas = (): void => {
      if (!context) {
        return;
      }
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // REASON: a worker that never starts must not cost the visitor the star,
    // so drawing moves back here rather than surfacing the failure.
    const drawOnMainThread = (): void => {
      worker?.terminate();
      worker = null;
      offscreen = undefined;
      canvas.remove();
      canvas = mountCanvas();
      context = canvas.getContext('2d');
      sizeCanvas();
    };

    if (typeof canvas.transferControlToOffscreen === 'function') {
      worker = new Worker(new URL('./loading-star.worker.ts', import.meta.url));
      worker.onerror = drawOnMainThread;
      offscreen = canvas.transferControlToOffscreen();
    } else {
      context = canvas.getContext('2d');
    }

    let frame = 0;
    let progress = 0;
    const started = performance.now();
    let lastPercentage = -1;
    let lastExit = -1;
    let resized = true;
    const resize = new ResizeObserver(() => {
      width = root.clientWidth;
      height = root.clientHeight;
      dpr = Math.min(window.devicePixelRatio, 1.5);
      resized = true;
      sizeCanvas();
    });
    resize.observe(root);

    const render = (now: number): void => {
      const arrival = handoffRef.current.arrival;
      const exit = Math.min(1, arrival / 0.6);
      if (exit === 1) {
        root.hidden = true;
        resize.disconnect();
        worker?.terminate();
        return;
      }
      root.hidden = false;
      const { loaded, total } = useProgress.getState();
      const assets = total > 0 ? loaded / total : 0;
      progress = Math.max(progress, Math.min(99, Math.floor(assets * 100)));
      const percentage = arrival > 0 ? 100 : progress;
      const drawing = {
        width,
        height,
        progress: percentage / 100,
        exit,
        palette,
      };
      if (percentage !== lastPercentage || exit !== lastExit || resized) {
        count.textContent = String(percentage).padStart(3, '0');
        root.style.setProperty('--loader-exit', String(exit));
        const message: LoadingStarMessage = {
          canvas: offscreen,
          frame: drawing,
          dpr,
          motionMode,
        };
        worker?.postMessage(message, offscreen ? [offscreen] : []);
        offscreen = undefined;
        lastPercentage = percentage;
        lastExit = exit;
        resized = false;
      }
      if (context) {
        drawLoadingStar(context, {
          ...drawing,
          time: motionMode === 'reduced' ? 0 : (now - started) / 1000,
        });
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      worker?.terminate();
      canvas.remove();
    };
  }, [handoffRef, palette, motionMode]);

  return (
    <div
      ref={rootRef}
      role="status"
      className="dive-loader pointer-events-none absolute inset-0 z-20 select-none"
    >
      <span className="sr-only">Loading the scene</span>
      <div
        ref={canvasHostRef}
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
