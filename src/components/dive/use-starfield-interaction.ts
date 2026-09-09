'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { Vector2 } from 'three';

export type StarfieldInteraction = {
  pointer: Vector2;
  active: number;
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
  });

  // REASON: DOM overlays cover the canvas; passive native listeners bridge
  // pointer input into the shader without taking over existing gestures.
  useEffect(() => {
    const interaction = interactionRef.current;
    const options = { passive: true, capture: true };

    const handleReset = (): void => {
      interaction.active = 0;
    };

    const handlePointerMove = (event: PointerEvent): void => {
      if (event.pointerType !== 'mouse' || !isScenePoint(event)) {
        interaction.active = 0;
        return;
      }
      writePointer(interaction.pointer, event);
      interaction.active = 1;
    };

    const handlePointerOut = (event: PointerEvent): void => {
      if (
        !(event.relatedTarget instanceof Element) ||
        !isSceneElement(event.relatedTarget)
      ) {
        handleReset();
      }
    };

    window.addEventListener('pointermove', handlePointerMove, options);
    window.addEventListener('pointerout', handlePointerOut, options);
    window.addEventListener('pointercancel', handleReset, options);
    window.addEventListener('blur', handleReset, options);
    return () => {
      handleReset();
      window.removeEventListener('pointermove', handlePointerMove, options);
      window.removeEventListener('pointerout', handlePointerOut, options);
      window.removeEventListener('pointercancel', handleReset, options);
      window.removeEventListener('blur', handleReset, options);
    };
  }, []);

  return interactionRef;
};
