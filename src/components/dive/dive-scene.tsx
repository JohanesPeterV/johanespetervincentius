'use client';

import { ReactNode, Suspense, useEffect, useRef, useState } from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';
import PalettePicker from '@/components/theme-buttons/palette-picker';

import type { PointerState } from './camera-rig';
import { driveInputDelta, stepDriveToSection } from './camera-motion';
import type { DriveMotion } from './camera-motion';
import DiveCanvas from './dive-canvas';
import {
  DIVE_START,
  TOUCH_SENSITIVITY,
  WHEEL_SENSITIVITY,
  wrapProgress,
} from './descent';
import { useDivePalette } from './use-dive-palette';
import DiveOverlay from './dive-overlay';
import type { DiveMode } from './dive-overlay';
import type { OverlayNodes } from './dive-overlay-motion';
import {
  galaxyEngage,
  galaxyPointerDown,
  galaxyPointerMove,
  galaxyPointerUp,
  galaxyRelease,
  galaxyZoomBy,
  resetGalaxy,
} from './skill-galaxy';
import { useHeroHandoff } from './use-hero-handoff';
import {
  canScrollSection,
  dragInputDelta,
  getScrollableSection,
  normalizeWheelDelta,
} from './dive-input';
import type { PointerDrag } from './dive-input';

export default function DiveScene({ children }: { children: ReactNode }) {
  const driveRef = useRef<DriveMotion>({
    current: DIVE_START,
    target: DIVE_START,
    expectedTarget: Number.NaN,
    idleTime: 0,
  });
  const progressRef = useRef(DIVE_START);
  const dragRef = useRef<PointerDrag>({
    id: null,
    x: 0,
    y: 0,
    axis: 'pending-vertical',
    scrollTarget: null,
  });
  const pointerRef = useRef<PointerState>({ x: 0, y: 0 });
  const overlayRef = useRef<OverlayNodes>({
    chapters: [],
    sections: [],
    skillLayer: null,
    skillRail: [],
    skillWords: [],
    veil: null,
  });
  const { handoffRef, error: handoffError } = useHeroHandoff(overlayRef);
  const modeRef = useRef<DiveMode>('dive');
  const [mode, setMode] = useState<DiveMode>('dive');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const motionMode = reducedMotion ? 'reduced' : 'full';
  const palette = useDivePalette();

  const applyDriveDelta = (step: number): void => {
    const drive = driveRef.current;
    drive.target += driveInputDelta({
      target: drive.target,
      progress: drive.current,
      step,
    });
  };

  const handleEngage = (category: number | null): void => {
    modeRef.current = 'explore';
    setMode('explore');
    galaxyEngage(category);
  };

  const handleRelease = (): void => {
    modeRef.current = 'dive';
    setMode('dive');
    galaxyRelease();
  };

  const handleToggleExplore = (): void => {
    if (modeRef.current === 'explore') {
      handleRelease();
      return;
    }
    handleEngage(null);
  };

  const handleNavigate = (center: number): void => {
    handleRelease();
    driveRef.current.target += center - wrapProgress(driveRef.current.target);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>): void => {
    if (canScrollSection(getScrollableSection(event.target), event.deltaY)) {
      return;
    }
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      return;
    }
    if (modeRef.current === 'explore') {
      galaxyZoomBy(normalizeWheelDelta(event));
      return;
    }
    applyDriveDelta(normalizeWheelDelta(event) * WHEEL_SENSITIVITY);
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    if (event.button !== 0) {
      return;
    }
    if (
      event.target instanceof Element &&
      event.target.closest('a, button, summary')
    ) {
      return;
    }
    if (modeRef.current === 'explore') {
      event.currentTarget.setPointerCapture(event.pointerId);
      galaxyPointerDown(event.pointerId, event.clientX, event.clientY);
      return;
    }
    const horizontal =
      event.target instanceof Element &&
      event.target.closest('[data-horizontal-gesture]');
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      axis: horizontal ? 'pending' : 'pending-vertical',
      scrollTarget: getScrollableSection(event.target),
    };
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    if (event.pointerType !== 'mouse') {
      pointerRef.current = { x: 0, y: 0 };
    } else {
      pointerRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
    }
    if (modeRef.current === 'explore') {
      galaxyPointerMove(event.pointerId, event.clientX, event.clientY);
      return;
    }
    if (dragRef.current.id !== event.pointerId) {
      return;
    }
    const drag = dragRef.current;
    const delta = dragInputDelta(drag, event);
    if (delta === 0) {
      return;
    }
    // REASON: capture only real drags; capturing on press steals the canvas eye click.
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (canScrollSection(drag.scrollTarget, delta) && drag.scrollTarget) {
      drag.scrollTarget.scrollTop += delta;
    } else {
      applyDriveDelta(delta * TOUCH_SENSITIVITY);
    }
  };

  const handlePointerEnd = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    galaxyPointerUp(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (dragRef.current.id === event.pointerId) {
      dragRef.current.id = null;
      dragRef.current.scrollTarget = null;
    }
  };

  // REASON: galaxy motion survives React remounts; a return visit must not
  // inherit an explored camera while the UI reports a fresh dive.
  useEffect(() => {
    resetGalaxy();
  }, []);

  // REASON: arrow-key navigation needs window-level key events - the
  // full-screen div is never focused, so an onKeyDown prop would not fire
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest(
          'input, textarea, select, [contenteditable="true"]',
        )
      ) {
        return;
      }
      if (modeRef.current === 'explore') {
        if (event.key === 'Escape') {
          modeRef.current = 'dive';
          setMode('dive');
          galaxyRelease();
        }
        return;
      }
      if (
        (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
        event.target instanceof HTMLElement &&
        canScrollSection(
          getScrollableSection(event.target),
          event.key === 'ArrowDown' ? 1 : -1,
        )
      ) {
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        stepDriveToSection(driveRef.current, 1);
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        stepDriveToSection(driveRef.current, -1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      data-dive-scene
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      className="fixed inset-0 touch-none cursor-grab overflow-hidden bg-background text-foreground active:cursor-grabbing"
    >
      <Suspense fallback={null}>
        <DiveCanvas
          palette={palette}
          driveRef={driveRef}
          progressRef={progressRef}
          pointerRef={pointerRef}
          overlayRef={overlayRef}
          handoffRef={handoffRef}
          motionMode={motionMode}
          onEngage={handleEngage}
        />
      </Suspense>
      <PalettePicker />
      <DiveOverlay
        overlayRef={overlayRef}
        mode={mode}
        onEngage={handleEngage}
        onToggleExplore={handleToggleExplore}
        onNavigate={handleNavigate}
      >
        {children}
      </DiveOverlay>
      {handoffError ? (
        <p
          role="status"
          className="absolute left-6 right-6 top-4 text-center text-xs"
        >
          Transisi sederhana aktif: {handoffError}
        </p>
      ) : null}
    </div>
  );
}
