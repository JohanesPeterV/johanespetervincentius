import type { Vector2 } from 'three';

import {
  DIVE_SECTIONS,
  DescentFrame,
  railProximity,
  riseMeters,
  sectionMotion,
} from './descent';

export type OverlayNodes = {
  sections: (HTMLDivElement | null)[];
  rail: (HTMLDivElement | null)[];
  veil: HTMLDivElement | null;
  rise: HTMLSpanElement | null;
};

export type OverlayFrame = {
  descent: DescentFrame;
  height: number;
  progress: number;
  stones: Vector2[];
  width: number;
};

const positionStoneSection = (
  element: HTMLDivElement,
  frame: OverlayFrame,
  stone: Vector2,
): void => {
  const horizontalGap = Math.min(140, Math.max(72, frame.width * 0.1));
  const left = Math.max(
    24,
    Math.min(frame.width - 24, stone.x + horizontalGap),
  );
  element.style.transform = `translate3d(${left}px, ${stone.y}px, 0) translateY(-50%)`;
};

export const applyOverlay = (
  nodes: OverlayNodes,
  frame: OverlayFrame,
): void => {
  DIVE_SECTIONS.forEach((section, index) => {
    const element = nodes.sections[index];
    if (!element) {
      return;
    }
    const motion = sectionMotion(frame.progress, section);
    element.style.opacity = String(motion.opacity);
    const visibility = motion.opacity < 0.05 ? 'hidden' : 'visible';
    if (element.style.visibility !== visibility) {
      element.style.visibility = visibility;
    }
    const visible = motion.opacity > 0.4 ? 'true' : 'false';
    if (element.dataset.visible !== visible) {
      element.dataset.visible = visible;
    }
    if (section.placement === 'stone') {
      positionStoneSection(element, frame, frame.stones[section.stoneIndex]);
    } else {
      element.style.filter = `blur(${motion.blur}px)`;
      element.style.transform = `translateY(${motion.shift}px)`;
    }
  });
  DIVE_SECTIONS.forEach((section, index) => {
    const notch = nodes.rail[index];
    if (!notch) {
      return;
    }
    const proximity = railProximity(frame.progress, section.center);
    notch.style.opacity = String(0.2 + proximity * 0.8);
    notch.style.transform = `scaleX(${1 + proximity * 1.6})`;
  });
  if (nodes.veil) {
    nodes.veil.style.opacity = String(frame.descent.veil);
    nodes.veil.style.backgroundColor = `rgb(${Math.round(
      frame.descent.veilColor[0] * 255,
    )}, ${Math.round(frame.descent.veilColor[1] * 255)}, ${Math.round(
      frame.descent.veilColor[2] * 255,
    )})`;
  }
  if (nodes.rise) {
    const meters = String(riseMeters(frame.progress)).padStart(4, '0');
    const rise = `${meters}M`;
    if (nodes.rise.textContent !== rise) {
      nodes.rise.textContent = rise;
    }
  }
};
