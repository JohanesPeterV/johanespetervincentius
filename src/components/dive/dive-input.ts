import { scrollDriveBy } from './camera-motion';
import type { DriveMotion } from './camera-motion';
import { CHAPTER_GAP, READING_RANGE } from './dive-route';

const READING_CENTER_EPSILON = 0.001;

export type PointerState = { x: number; y: number };

export type PointerDrag = {
  id: number | null;
  x: number;
  y: number;
  axis: 'pending' | 'pending-vertical' | 'horizontal' | 'vertical';
  scrollTarget: HTMLElement | null;
};

type ReadingSection = {
  element: HTMLElement;
  chapter: HTMLElement;
  center: number;
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

const getReadingSection = (
  target: EventTarget | null,
  drive: DriveMotion,
): ReadingSection | null => {
  const element = getScrollableSection(target);
  const chapter = element?.closest<HTMLElement>('[data-dive-section]');
  const section = drive.route.sections.find(
    (candidate) => candidate.id === chapter?.dataset.diveSection,
  );
  // REASON: departing and incoming panels must not reclaim scroll and reset
  // the journey while the camera is still travelling between reading poses.
  if (
    !element ||
    !chapter ||
    !section ||
    Math.abs(drive.route.jumpDelta(drive.current, section.center)) >
      READING_RANGE ||
    Math.abs(drive.route.jumpDelta(drive.target, section.center)) >
      READING_RANGE
  ) {
    return null;
  }
  return { element, chapter, center: section.center };
};

const isReadingCentered = (
  reading: ReadingSection,
  drive: DriveMotion,
): boolean =>
  Math.abs(drive.route.jumpDelta(drive.current, reading.center)) <=
    READING_CENTER_EPSILON &&
  Math.abs(reading.chapter.getBoundingClientRect().top) <= 1;

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

export const splitReadingInput = (
  pixels: number,
  toCenter: number,
  viewportHeight: number,
): { travelPixels: number; readingPixels: number } => {
  if (pixels === 0 || toCenter === 0) {
    return { travelPixels: 0, readingPixels: pixels };
  }
  const journey = journeyDeltaForScroll(pixels, viewportHeight);
  if (Math.sign(toCenter) !== Math.sign(journey)) {
    return { travelPixels: pixels, readingPixels: 0 };
  }
  const travelPixels =
    Math.sign(pixels) *
    Math.min(
      Math.abs(pixels),
      (Math.abs(toCenter) / CHAPTER_GAP) * viewportHeight,
    );
  return { travelPixels, readingPixels: pixels - travelPixels };
};

export const createReadingInput = (drive: DriveMotion) => {
  let pending: { reading: ReadingSection; pixels: number } | null = null;
  let frame: number | null = null;

  const scrollJourney = (pixels: number): void => {
    scrollDriveBy(drive, journeyDeltaForScroll(pixels, window.innerHeight));
  };
  const targetsReading = (reading: ReadingSection): boolean =>
    Math.abs(drive.route.jumpDelta(drive.target, reading.center)) <=
    READING_CENTER_EPSILON;

  const flush = (): void => {
    frame = null;
    if (!pending) {
      return;
    }
    if (
      !pending.reading.chapter.isConnected ||
      !targetsReading(pending.reading)
    ) {
      pending = null;
      return;
    }
    if (!isReadingCentered(pending.reading, drive)) {
      frame = requestAnimationFrame(flush);
      return;
    }
    const queued = pending;
    pending = null;
    const remaining = scrollSectionBy(queued.reading.element, queued.pixels);
    if (remaining !== 0) {
      scrollJourney(remaining);
    }
  };

  const scroll = (target: EventTarget | null, pixels: number): number => {
    if (
      pending &&
      (!pending.reading.chapter.isConnected || !targetsReading(pending.reading))
    ) {
      pending = null;
    }
    if (pending) {
      const combined = pending.pixels + pixels;
      if (combined !== 0 && Math.sign(combined) !== Math.sign(pending.pixels)) {
        pending = null;
        return combined;
      }
      pending.pixels = combined;
      return 0;
    }
    const reading = getReadingSection(target, drive);
    if (!reading) {
      return pixels;
    }
    const toCenter = drive.route.jumpDelta(
      drive.settling ? drive.current : drive.target,
      reading.center,
    );
    const { travelPixels, readingPixels } = splitReadingInput(
      pixels,
      Math.abs(toCenter) < READING_CENTER_EPSILON ? 0 : toCenter,
      window.innerHeight,
    );
    if (travelPixels !== 0) {
      scrollJourney(travelPixels);
    }
    if (readingPixels === 0) {
      return 0;
    }
    // REASON: wait for the rendered chapter before scrolling its panel so
    // one wheel step cannot move both surfaces through the same distance.
    if (!isReadingCentered(reading, drive)) {
      pending = { reading, pixels: readingPixels };
      if (frame === null) {
        frame = requestAnimationFrame(flush);
      }
      return 0;
    }
    return scrollSectionBy(reading.element, readingPixels);
  };

  const dispose = (): void => {
    if (frame !== null) {
      cancelAnimationFrame(frame);
    }
    frame = null;
    pending = null;
  };

  return { scroll, dispose };
};

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
