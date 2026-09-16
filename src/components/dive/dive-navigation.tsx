'use client';

import { ReactNode, RefObject, useEffect, useRef } from 'react';
import {
  scrollDriveBy,
  settleDriveToSection,
  stepDriveToSection,
} from './camera-motion';
import type { DriveMotion } from './camera-motion';
import {
  canScrollSection,
  dragInputDelta,
  getReadingSection,
  getScrollableSection,
  normalizeWheelDelta,
  scrollSectionBy,
} from './dive-input';
import type { PointerDrag, PointerState } from './dive-input';

type DiveNavigationProps = {
  children: ReactNode;
  driveRef: RefObject<DriveMotion>;
  pointerRef: RefObject<PointerState>;
  onMount: (element: HTMLDivElement | null) => void;
};

export default function DiveNavigation({
  children,
  driveRef,
  pointerRef,
  onMount,
}: DiveNavigationProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<PointerDrag>({
    id: null,
    x: 0,
    y: 0,
    axis: 'pending-vertical',
    scrollTarget: null,
  });
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
    const delta = dragInputDelta(drag, event);
    if (delta === 0) {
      return;
    }
    // REASON: capture only real drags; capturing on press steals the canvas eye click.
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const remaining = scrollSectionBy(
      getReadingSection(drag.scrollTarget, driveRef.current),
      delta,
    );
    if (remaining !== 0) {
      drag.scrollTarget = null;
      scrollDriveBy(driveRef.current, remaining / 1000);
    }
  };

  const handlePointerEnd = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (dragRef.current.id === event.pointerId) {
      if (dragRef.current.axis === 'vertical') {
        settleDriveToSection(driveRef.current);
      }
      dragRef.current.id = null;
      dragRef.current.scrollTarget = null;
    }
  };

  // REASON: one wheel delta can finish reading a panel and continue the
  // journey; a non-passive listener prevents the browser applying it twice.
  useEffect(() => {
    let snapTimer: ReturnType<typeof setTimeout> | undefined;
    const cancelSnap = (): void => clearTimeout(snapTimer);
    const handleWheel = (event: WheelEvent): void => {
      if (
        event.ctrlKey ||
        event.deltaY === 0 ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ) {
        return;
      }
      cancelSnap();
      event.preventDefault();
      const remaining = scrollSectionBy(
        getReadingSection(event.target, driveRef.current),
        normalizeWheelDelta(event, window.innerHeight),
      );
      if (remaining !== 0) {
        scrollDriveBy(driveRef.current, remaining / 1000);
      }
      // REASON: align the screen even if reading consumed the final delta;
      // settling the drive leaves the panel's own scroll position intact.
      snapTimer = setTimeout(() => {
        if (dragRef.current.id === null) {
          settleDriveToSection(driveRef.current);
        }
      }, 220);
    };

    const root = rootRef.current;
    root?.addEventListener('wheel', handleWheel, { passive: false });
    root?.addEventListener('pointerdown', cancelSnap);
    return () => {
      cancelSnap();
      root?.removeEventListener('wheel', handleWheel);
      root?.removeEventListener('pointerdown', cancelSnap);
    };
  }, [driveRef]);

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
  }, [driveRef]);

  return (
    <div
      ref={(element) => {
        rootRef.current = element;
        onMount(element);
      }}
      data-dive-scene
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}
      className="fixed inset-0 touch-none cursor-grab overflow-hidden bg-background text-foreground active:cursor-grabbing"
    >
      {children}
    </div>
  );
}
