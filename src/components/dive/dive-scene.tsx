'use client';

import { ReactNode, Suspense, useEffect, useRef, useState } from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';

import type { PointerState } from './camera-rig';
import { driveInputDelta, resetWorkMotion } from './camera-motion';
import type { DriveMotion } from './camera-motion';
import DiveCanvas from './dive-canvas';
import {
  DIVE_START,
  TOUCH_SENSITIVITY,
  WHEEL_SENSITIVITY,
  sectionStepDelta,
  wrapProgress,
} from './descent';
import { DIVE_PALETTE } from './dive-palette';
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

type PointerDrag = {
  id: number | null;
  y: number;
};

const LINE_DELTA_MODE = 1;
const PAGE_DELTA_MODE = 2;
const LINE_HEIGHT_PX = 16;

const normalizeWheelDelta = (
  event: React.WheelEvent<HTMLDivElement>,
): number => {
  let pixels = event.deltaY;
  if (event.deltaMode === LINE_DELTA_MODE) {
    pixels *= LINE_HEIGHT_PX;
  }
  if (event.deltaMode === PAGE_DELTA_MODE) {
    pixels *= window.innerHeight;
  }
  return pixels;
};

export default function DiveScene({ children }: { children: ReactNode }) {
  const driveRef = useRef<DriveMotion>({
    current: DIVE_START,
    target: DIVE_START,
    expectedTarget: Number.NaN,
    idleTime: 0,
  });
  const progressRef = useRef(DIVE_START);
  const dragRef = useRef<PointerDrag>({ id: null, y: 0 });
  const pointerRef = useRef<PointerState>({ x: 0, y: 0 });
  const overlayRef = useRef<OverlayNodes>({
    chapters: [],
    sections: [],
    skillLayer: null,
    skillRail: [],
    skillWords: [],
    veil: null,
    workPanels: [],
    workRail: [],
  });
  const modeRef = useRef<DiveMode>('dive');
  const [mode, setMode] = useState<DiveMode>('dive');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const motionMode = reducedMotion ? 'reduced' : 'full';
  const palette = DIVE_PALETTE;

  const applyDriveDelta = (step: number): void => {
    const drive = driveRef.current;
    drive.target += driveInputDelta({
      target: drive.target,
      progress: drive.current,
      step,
      now: performance.now(),
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
      event.target instanceof HTMLElement &&
      event.target.closest('a, button')
    ) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    if (modeRef.current === 'explore') {
      galaxyPointerDown(event.pointerId, event.clientX, event.clientY);
      return;
    }
    dragRef.current = { id: event.pointerId, y: event.clientY };
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
    applyDriveDelta((dragRef.current.y - event.clientY) * TOUCH_SENSITIVITY);
    dragRef.current.y = event.clientY;
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
    }
  };

  // REASON: galaxy and work-lock motion live in module state that survives
  // React remounts - without this reset a return visit starts zoomed, focused,
  // or mid-job while the UI reports a fresh dive
  useEffect(() => {
    resetGalaxy();
    resetWorkMotion();
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
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        applyDriveDelta(sectionStepDelta(driveRef.current.target, 1));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        applyDriveDelta(sectionStepDelta(driveRef.current.target, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      className="fixed inset-0 touch-none cursor-grab overflow-hidden font-mono active:cursor-grabbing"
      style={{ backgroundColor: palette.background, color: palette.foreground }}
    >
      <Suspense fallback={null}>
        <DiveCanvas
          driveRef={driveRef}
          progressRef={progressRef}
          pointerRef={pointerRef}
          overlayRef={overlayRef}
          motionMode={motionMode}
          onEngage={handleEngage}
        />
      </Suspense>
      <DiveOverlay
        overlayRef={overlayRef}
        mode={mode}
        onEngage={handleEngage}
        onToggleExplore={handleToggleExplore}
        onNavigate={handleNavigate}
      >
        {children}
      </DiveOverlay>
    </div>
  );
}
