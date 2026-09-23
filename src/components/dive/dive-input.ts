import type { DriveMotion } from './camera-motion';
import { CHAPTER_GAP, READING_RANGE } from './dive-route';

export type PointerState = { x: number; y: number };

export type PointerDrag = {
  id: number | null;
  x: number;
  y: number;
  axis: 'pending' | 'pending-vertical' | 'horizontal' | 'vertical';
  scrollTarget: HTMLElement | null;
};

export const dragInputDelta = (
  drag: PointerDrag,
  pointer: { clientX: number; clientY: number },
): number => {
  const delta = drag.y - pointer.clientY;
  if (drag.axis === 'pending' || drag.axis === 'pending-vertical') {
    const horizontal = Math.abs(drag.x - pointer.clientX);
    if (Math.max(horizontal, Math.abs(delta)) < 6) {
      return 0;
    }
    drag.axis =
      drag.axis === 'pending' && horizontal > Math.abs(delta)
        ? 'horizontal'
        : 'vertical';
  }
  if (drag.axis === 'horizontal') {
    return 0;
  }
  drag.y = pointer.clientY;
  return delta;
};

export const getScrollableSection = (
  target: EventTarget | null,
): HTMLElement | null => {
  if (!(target instanceof Element)) {
    return null;
  }
  const section = target.closest('[data-section-scroll]');
  return section instanceof HTMLElement ? section : null;
};

export const canScrollSection = (
  section: HTMLElement | null,
  delta: number,
): boolean => {
  if (!section || section.scrollHeight <= section.clientHeight) {
    return false;
  }
  return delta > 0
    ? section.scrollTop + section.clientHeight < section.scrollHeight - 1
    : section.scrollTop > 0;
};

export const getReadingSection = (
  target: EventTarget | null,
  drive: DriveMotion,
): HTMLElement | null => {
  const section = getScrollableSection(target);
  const id = section?.closest<HTMLElement>('[data-dive-section]')?.dataset
    .diveSection;
  const chapter = drive.route.sections.find((candidate) => candidate.id === id);
  // REASON: departing and incoming panels must not reclaim scroll and reset
  // the journey while the camera is still travelling between reading poses.
  if (
    !chapter ||
    Math.abs(drive.route.jumpDelta(drive.current, chapter.center)) >
      READING_RANGE ||
    Math.abs(drive.route.jumpDelta(drive.target, chapter.center)) >
      READING_RANGE
  ) {
    return null;
  }
  return section;
};

export const scrollSectionBy = (
  section: Pick<
    HTMLElement,
    'scrollTop' | 'scrollHeight' | 'clientHeight'
  > | null,
  delta: number,
): number => {
  if (!section) {
    return delta;
  }
  const requested = section.scrollTop + delta;
  const max = Math.max(0, section.scrollHeight - section.clientHeight);
  const next = Math.min(max, Math.max(0, requested));
  section.scrollTop = next;
  return requested - next;
};

export const journeyDeltaForScroll = (
  pixels: number,
  viewportHeight: number,
): number => (pixels / viewportHeight) * CHAPTER_GAP;

export const normalizeWheelDelta = (
  event: { deltaY: number; deltaMode: number },
  pageHeight: number,
): number => {
  if (event.deltaMode === 1) {
    return event.deltaY * 16;
  }
  if (event.deltaMode === 2) {
    return event.deltaY * pageHeight;
  }
  return event.deltaY;
};
