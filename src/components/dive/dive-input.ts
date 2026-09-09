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
