'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { Vector2 } from 'three';

export type StarfieldInteraction = {
  pointer: Vector2;
  active: number;
  burstOrigin: Vector2;
  burst: number;
};

type PointerGesture = {
  id: number;
  x: number;
  y: number;
  distanceSquared: number;
};

const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, summary, [contenteditable="true"], [role="button"], [role="dialog"], [popover], [data-horizontal-gesture], [data-section-scroll]';

const isSceneElement = (element: Element | null): boolean => {
  return Boolean(
    element?.closest('[data-dive-scene]') &&
      !element.closest(INTERACTIVE_SELECTOR),
  );
};

const isScenePoint = (event: PointerEvent): boolean => {
  return isSceneElement(
    document.elementFromPoint(event.clientX, event.clientY),
  );
};

const writePointer = (pointer: Vector2, event: PointerEvent): void => {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    1 - (event.clientY / window.innerHeight) * 2,
  );
};

export const useStarfieldInteraction = (): RefObject<StarfieldInteraction> => {
  const interactionRef = useRef<StarfieldInteraction>({
    pointer: new Vector2(),
    active: 0,
    burstOrigin: new Vector2(),
    burst: 0,
  });
  const gestureRef = useRef<PointerGesture | null>(null);

  // REASON: DOM overlays cover the canvas; passive native listeners bridge
  // pointer input into the shader without taking over existing gestures.
  useEffect(() => {
    const interaction = interactionRef.current;
    const options = { passive: true, capture: true };

    const handleReset = (): void => {
      interaction.active = 0;
      gestureRef.current = null;
    };

    const handleScroll = (): void => {
      gestureRef.current = null;
    };

    const handlePointerDown = (event: PointerEvent): void => {
      gestureRef.current = null;
      if (!event.isPrimary || event.button !== 0 || !isScenePoint(event)) {
        interaction.active = 0;
        return;
      }
      gestureRef.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        distanceSquared: 0,
      };
    };

    const handlePointerMove = (event: PointerEvent): void => {
      const gesture = gestureRef.current;
      if (gesture?.id === event.pointerId) {
        const x = event.clientX - gesture.x;
        const y = event.clientY - gesture.y;
        gesture.distanceSquared = Math.max(
          gesture.distanceSquared,
          x * x + y * y,
        );
      }
      if (event.pointerType !== 'mouse' || !isScenePoint(event)) {
        interaction.active = 0;
        return;
      }
      writePointer(interaction.pointer, event);
      interaction.active = 1;
    };

    const handlePointerUp = (event: PointerEvent): void => {
      const gesture = gestureRef.current;
      if (gesture?.id !== event.pointerId) {
        return;
      }
      gestureRef.current = null;
      const x = event.clientX - gesture.x;
      const y = event.clientY - gesture.y;
      if (
        event.button !== 0 ||
        Math.max(gesture.distanceSquared, x * x + y * y) > 36 ||
        !isScenePoint(event)
      ) {
        return;
      }
      writePointer(interaction.burstOrigin, event);
      interaction.burst += 1;
    };

    const handlePointerOut = (event: PointerEvent): void => {
      if (
        !(event.relatedTarget instanceof Element) ||
        !isSceneElement(event.relatedTarget)
      ) {
        handleReset();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, options);
    window.addEventListener('pointermove', handlePointerMove, options);
    window.addEventListener('pointerup', handlePointerUp, options);
    window.addEventListener('pointerout', handlePointerOut, options);
    window.addEventListener('pointercancel', handleReset, options);
    window.addEventListener('blur', handleReset, options);
    window.addEventListener('wheel', handleScroll, options);
    window.addEventListener('scroll', handleScroll, options);
    return () => {
      handleReset();
      window.removeEventListener('pointerdown', handlePointerDown, options);
      window.removeEventListener('pointermove', handlePointerMove, options);
      window.removeEventListener('pointerup', handlePointerUp, options);
      window.removeEventListener('pointerout', handlePointerOut, options);
      window.removeEventListener('pointercancel', handleReset, options);
      window.removeEventListener('blur', handleReset, options);
      window.removeEventListener('wheel', handleScroll, options);
      window.removeEventListener('scroll', handleScroll, options);
    };
  }, []);

  return interactionRef;
};
