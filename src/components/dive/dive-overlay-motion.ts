import type { Vector2 } from 'three';

import {
  DIVE_SECTIONS,
  DIVE_START,
  DescentFrame,
  TECH_STONE,
  WORK_STONE,
  sectionMotion,
  techSectionOpacity,
  sectionJumpDelta,
} from './descent';
import type { MotionMode } from './descent';
import { GALAXY_MOTION, GALAXY_NODES } from './skill-galaxy';
import { heroOverlayOpacity, workOverlayOpacity } from './hero-handoff';
import type { HeroHandoff } from './hero-handoff';
import { getCardSectionLayout } from './card-section-layout';

export type OverlayNodes = {
  chapters: (HTMLButtonElement | null)[];
  sections: (HTMLDivElement | null)[];
  skillLayer: HTMLDivElement | null;
  skillRail: (HTMLButtonElement | null)[];
  skillWords: (HTMLSpanElement | null)[];
  veil: HTMLDivElement | null;
};

export type OverlayFrame = {
  descent: DescentFrame;
  height: number;
  progress: number;
  skillAlphas: Float32Array;
  skillScales: Float32Array;
  skillScreens: Vector2[];
  stones: Vector2[];
  width: number;
  motionMode: MotionMode;
  handoff: HeroHandoff;
};

const SKILL_HIDE_THRESHOLD = 0.05;

const applyGalaxyLabels = (nodes: OverlayNodes, frame: OverlayFrame): void => {
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
  const hovered = GALAXY_MOTION.hovered;
  const active =
    GALAXY_MOTION.focus ??
    (hovered === null ? null : GALAXY_NODES[hovered].category);
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
    const screen = frame.skillScreens[index];
    element.style.transform = `translate3d(${screen.x}px, ${screen.y}px, 0) translate(-50%, -130%) scale(${frame.skillScales[index]})`;
    element.style.opacity = String(frame.skillAlphas[index]);
  });
};

// REASON: the galaxy claims the screen centre, so this section's copy docks
// as a hud in the top-left corner instead of chasing its stone
const positionTechHud = (
  element: HTMLDivElement,
  frame: OverlayFrame,
): void => {
  const left = Math.max(24, frame.width * 0.05);
  const top = Math.max(104, frame.height * 0.14);
  element.style.transform = `translate3d(${left}px, ${top}px, 0)`;
};

const positionStoneSection = (
  element: HTMLDivElement,
  frame: OverlayFrame,
  stone: Vector2,
): { left: number; top: number; anchor: number } => {
  // REASON: reserve the appearance controls above and chapter navigation below;
  // anchored copy scrolls within that space instead of covering either control.
  const height = element.offsetHeight;
  if (element.dataset.workStory === 'true') {
    const layout = getCardSectionLayout(frame.width, frame.height);
    element.style.width = `${layout.width}px`;
    element.style.height = `${layout.height}px`;
    element.style.transform = `translate3d(${layout.left}px, ${layout.top}px, 0)`;
    return { left: layout.left, top: layout.top, anchor: 0 };
  }
  const maxTop = frame.height - height - 104;
  if (frame.width < 768) {
    const top = Math.max(88, Math.min(frame.height * 0.16, maxTop));
    element.style.transform = `translate3d(24px, ${top}px, 0)`;
    return { left: 24, top, anchor: 0 };
  }
  const horizontalGap = Math.min(320, Math.max(96, frame.width * 0.16));
  const left = Math.max(
    24,
    Math.min(frame.width - 456, stone.x + horizontalGap),
  );
  const center = Math.max(
    frame.height * 0.4,
    Math.min(frame.height * 0.6, stone.y),
  );
  const top = Math.max(104, Math.min(center - height / 2, maxTop));
  element.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  return { left, top, anchor: 0 };
};

export const applyOverlay = (
  nodes: OverlayNodes,
  frame: OverlayFrame,
): void => {
  let activeChapter = 0;
  let nearestDistance = Infinity;
  DIVE_SECTIONS.forEach((section, index) => {
    const distance = Math.abs(sectionJumpDelta(frame.progress, section.center));
    if (distance < nearestDistance) {
      nearestDistance = distance;
      activeChapter = index;
    }
    const element = nodes.sections[index];
    if (!element) {
      return;
    }
    let opacity = sectionMotion(frame.progress, section).opacity;
    if (section.placement === 'center') {
      opacity = heroOverlayOpacity(frame.handoff);
    }
    if (section.center === WORK_STONE.center) {
      opacity = workOverlayOpacity(frame.handoff);
    }
    element.style.opacity = String(opacity);
    element.style.setProperty('--reveal', String(opacity));
    element.inert = opacity < 0.1;
    const visibility = opacity < 0.05 ? 'hidden' : 'visible';
    if (element.style.visibility !== visibility) {
      element.style.visibility = visibility;
    }
    if (opacity > 0.4 && element.dataset.visible !== 'true') {
      element.dataset.visible = 'true';
    }
    if (opacity < 0.05 && element.dataset.visible !== 'false') {
      element.dataset.visible = 'false';
    }
    if (section.placement !== 'stone') {
      element.style.transform = '';
    } else if (section.center === TECH_STONE.center) {
      positionTechHud(element, frame);
    } else {
      const position = positionStoneSection(
        element,
        frame,
        frame.stones[section.stoneIndex],
      );
      if (section.center === WORK_STONE.center && frame.handoff.work) {
        const rect = frame.handoff.workRect;
        const { width, height } = frame.handoff.work;
        rect.set(
          position.left / frame.width,
          1 - (position.top + height * (1 - position.anchor)) / frame.height,
          width / frame.width,
          height / frame.height,
        );
      }
    }
  });
  nodes.chapters.forEach((element, index) => {
    if (!element) {
      return;
    }
    if (index === activeChapter) {
      element.setAttribute('aria-current', 'step');
    } else {
      element.removeAttribute('aria-current');
    }
  });
  applyGalaxyLabels(nodes, frame);
  if (nodes.veil) {
    let opacity = frame.descent.veil;
    if (frame.progress < DIVE_START || frame.progress > WORK_STONE.center) {
      opacity = 0;
    }
    nodes.veil.style.opacity = String(opacity);
    nodes.veil.style.backgroundColor = `rgb(${Math.round(
      frame.descent.veilColor[0] * 255,
    )}, ${Math.round(frame.descent.veilColor[1] * 255)}, ${Math.round(
      frame.descent.veilColor[2] * 255,
    )})`;
  }
};
