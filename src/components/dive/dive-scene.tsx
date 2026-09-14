'use client';

import { ReactNode, Suspense, useEffect, useRef } from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';
import PalettePicker from '@/components/theme-buttons/palette-picker';

import type { PointerState } from './camera-rig';
import { stepDriveToSection } from './camera-motion';
import type { DriveMotion } from './camera-motion';
import DiveCanvas from './dive-canvas';
import { DIVE_START, DIVE_SECTIONS, sectionJumpDelta } from './descent';
import { useDivePalette } from './use-dive-palette';
import DiveOverlay from './dive-overlay';
import DiveLoader from './dive-loader';
import type { OverlayNodes } from './dive-overlay-motion';
import { useHeroHandoff } from './use-hero-handoff';
import {
  canScrollSection,
  captureWheelSection,
  dragInputDelta,
  getScrollableSection,
} from './dive-input';
import type { PointerDrag, WheelGesture } from './dive-input';

const settleReadingSection = (
  section: HTMLElement,
  drive: DriveMotion,
  sections: OverlayNodes['sections'],
): void => {
  const index = sections.findIndex((element) => element?.contains(section));
  if (index >= 0) {
    drive.target =
      drive.current +
      sectionJumpDelta(drive.current, DIVE_SECTIONS[index].center);
  }
};

export default function DiveScene({ children }: { children: ReactNode }) {
  const driveRef = useRef<DriveMotion>({
    current: DIVE_START,
    target: DIVE_START,
    expectedTarget: Number.NaN,
    idleTime: 0,
  });
  const progressRef = useRef(DIVE_START);
  const wheelRef = useRef<WheelGesture>({
    lastEventAt: -Infinity,
    scrollTarget: null,
    navigating: false,
  });
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
    root: null,
    sections: [],
    veil: null,
  });
  const { handoffRef, error: handoffError } = useHeroHandoff(overlayRef);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const motionMode = reducedMotion ? 'reduced' : 'full';
  const palette = useDivePalette();

  const handleNavigate = (center: number): void => {
    driveRef.current.target += sectionJumpDelta(
      driveRef.current.target,
      center,
    );
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
    const horizontal =
      event.target instanceof Element &&
      event.target.closest('[data-horizontal-gesture]');
    const section = getScrollableSection(event.target);
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      axis: horizontal ? 'pending' : 'pending-vertical',
      scrollTarget: section,
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
    if (dragRef.current.id !== event.pointerId) {
      return;
    }
    const drag = dragRef.current;
    if (drag.axis === 'navigating') {
      return;
    }
    const delta = dragInputDelta(drag, event);
    if (delta === 0) {
      return;
    }
    // REASON: capture only real drags; capturing on press steals the canvas eye click.
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (
      drag.scrollTarget &&
      (canScrollSection(drag.scrollTarget, delta) || drag.axis === 'scrolling')
    ) {
      drag.axis = 'scrolling';
      settleReadingSection(
        drag.scrollTarget,
        driveRef.current,
        overlayRef.current.sections,
      );
      drag.scrollTarget.scrollTop += delta;
    } else {
      drag.axis = 'navigating';
      stepDriveToSection(driveRef.current, delta > 0 ? 1 : -1);
    }
  };

  const handlePointerEnd = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (dragRef.current.id === event.pointerId) {
      dragRef.current.id = null;
      dragRef.current.scrollTarget = null;
    }
  };

  // REASON: journey gestures must cancel native scrolling so their momentum
  // cannot scroll an incoming panel; React's wheel listener is passive.
  useEffect(() => {
    const handleWheel = (event: WheelEvent): void => {
      if (
        event.ctrlKey ||
        event.deltaY === 0 ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ) {
        return;
      }
      const section = captureWheelSection(wheelRef.current, event);
      if (section) {
        settleReadingSection(
          section,
          driveRef.current,
          overlayRef.current.sections,
        );
        return;
      }
      event.preventDefault();
      if (!wheelRef.current.navigating) {
        wheelRef.current.navigating = true;
        stepDriveToSection(driveRef.current, event.deltaY > 0 ? 1 : -1);
      }
    };

    const root = overlayRef.current.root;
    root?.addEventListener('wheel', handleWheel, { passive: false });
    return () => root?.removeEventListener('wheel', handleWheel);
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
      ref={(element) => {
        overlayRef.current.root = element;
      }}
      data-dive-scene
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
        />
      </Suspense>
      <DiveLoader
        handoffRef={handoffRef}
        palette={palette}
        motionMode={motionMode}
      />
      <div className="dive-chrome relative z-30">
        <PalettePicker />
      </div>
      <DiveOverlay overlayRef={overlayRef} onNavigate={handleNavigate}>
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
