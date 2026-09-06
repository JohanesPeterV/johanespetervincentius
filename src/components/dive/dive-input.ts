export type PointerDrag = {
  id: number | null;
  x: number;
  y: number;
  axis: 'pending' | 'horizontal' | 'vertical';
  scrollTarget: HTMLElement | null;
};

export const getScrollableSection = (
  target: EventTarget,
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

export const normalizeWheelDelta = (event: {
  deltaY: number;
  deltaMode: number;
}): number => {
  if (event.deltaMode === 1) {
    return event.deltaY * 16;
  }
  if (event.deltaMode === 2) {
    return event.deltaY * window.innerHeight;
  }
  return event.deltaY;
};
