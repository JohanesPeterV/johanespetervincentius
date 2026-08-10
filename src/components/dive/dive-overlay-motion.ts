import type { Vector2 } from 'three';

import {
  DIVE_SECTIONS,
  DescentFrame,
  sectionMotion,
  techSectionOpacity,
} from './descent';
import { activeCategoryIndex } from './skill-dial';

export type OverlayNodes = {
  sections: (HTMLDivElement | null)[];
  skillLayer: HTMLDivElement | null;
  skillRail: (HTMLDivElement | null)[];
  skillWords: (HTMLSpanElement | null)[];
  veil: HTMLDivElement | null;
};

export type OverlayFrame = {
  descent: DescentFrame;
  height: number;
  progress: number;
  skillAlphas: Float32Array;
  skillScreens: Vector2[];
  stones: Vector2[];
  width: number;
};

const SKILL_HIDE_THRESHOLD = 0.05;

const applySkillDial = (nodes: OverlayNodes, frame: OverlayFrame): void => {
  const layer = nodes.skillLayer;
  if (!layer) {
    return;
  }
  const opacity = techSectionOpacity(frame.progress);
  layer.style.opacity = String(opacity);
  const visibility = opacity < SKILL_HIDE_THRESHOLD ? 'hidden' : 'visible';
  if (layer.style.visibility !== visibility) {
    layer.style.visibility = visibility;
  }
  if (opacity < SKILL_HIDE_THRESHOLD) {
    return;
  }
  const active = activeCategoryIndex(frame.progress);
  nodes.skillRail.forEach((element, index) => {
    if (!element) {
      return;
    }
    const value = index === active ? 'true' : 'false';
    if (element.dataset.active !== value) {
      element.dataset.active = value;
    }
  });
  nodes.skillWords.forEach((element, index) => {
    if (!element) {
      return;
    }
    const alpha = frame.skillAlphas[index];
    if (alpha <= 0) {
      if (element.style.opacity !== '0') {
        element.style.opacity = '0';
      }
      return;
    }
    const screen = frame.skillScreens[index];
    element.style.transform = `translate3d(${screen.x}px, ${screen.y}px, 0) translate(-50%, -50%) scale(${0.9 + alpha * 0.1})`;
    element.style.opacity = String(alpha);
  });
};

const positionStoneSection = (
  element: HTMLDivElement,
  frame: OverlayFrame,
  stone: Vector2,
): void => {
  // REASON: the stone projects to ~120px screen radius, so the gap must stay
  // beyond it or headlines start on top of the sphere
  const horizontalGap = Math.min(320, Math.max(96, frame.width * 0.16));
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
    if (motion.opacity > 0.4 && element.dataset.visible !== 'true') {
      element.dataset.visible = 'true';
    }
    if (motion.opacity < 0.05 && element.dataset.visible !== 'false') {
      element.dataset.visible = 'false';
    }
    if (section.placement === 'stone') {
      positionStoneSection(element, frame, frame.stones[section.stoneIndex]);
    } else {
      element.style.transform = `translateY(${motion.shift}px)`;
    }
  });
  applySkillDial(nodes, frame);
  if (nodes.veil) {
    nodes.veil.style.opacity = String(frame.descent.veil);
    nodes.veil.style.backgroundColor = `rgb(${Math.round(
      frame.descent.veilColor[0] * 255,
    )}, ${Math.round(frame.descent.veilColor[1] * 255)}, ${Math.round(
      frame.descent.veilColor[2] * 255,
    )})`;
  }
};
