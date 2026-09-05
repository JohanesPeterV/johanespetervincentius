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
import { WORK_MOTION, workPull } from './camera-motion';
import { GALAXY_MOTION, GALAXY_NODES } from './skill-galaxy';
import { HANDOFF_END, heroHandoffProgress } from './hero-handoff';
import type { HeroHandoff } from './hero-handoff';

export type OverlayNodes = {
  chapters: (HTMLButtonElement | null)[];
  sections: (HTMLDivElement | null)[];
  skillLayer: HTMLDivElement | null;
  skillRail: (HTMLButtonElement | null)[];
  skillWords: (HTMLSpanElement | null)[];
  veil: HTMLDivElement | null;
  workPanels: (HTMLDivElement | null)[];
  workRail: (HTMLButtonElement | null)[];
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

const WORK_PULL_NUDGE_PX = 18;

const applyWorkShowcase = (nodes: OverlayNodes): void => {
  const active = WORK_MOTION.job;
  const mark = (element: HTMLElement | null, index: number): void => {
    if (!element) {
      return;
    }
    const value = index === active ? 'true' : 'false';
    if (element.dataset.active !== value) {
      element.dataset.active = value;
    }
  };
  nodes.workRail.forEach((element, index) => {
    mark(element, index);
    const pressed = String(index === active);
    if (element && element.getAttribute('aria-pressed') !== pressed) {
      element.setAttribute('aria-pressed', pressed);
    }
  });
  const pull = workPull();
  nodes.workPanels.forEach((element, index) => {
    if (!element) {
      return;
    }
    mark(element, index);
    element.inert = index !== active;
    // REASON: gesture feedback uses translate independently of the timed
    // panel swap's transform, so CSS cannot ease every frame of the pull again.
    const translate =
      index === active && pull !== 0
        ? `0 ${(-pull * WORK_PULL_NUDGE_PX).toFixed(2)}px`
        : '';
    if (element.style.translate !== translate) {
      element.style.translate = translate;
    }
  });
};

// REASON: the galaxy claims the screen centre, so this section's copy docks
// as a hud in the top-left corner instead of chasing its stone
const positionTechHud = (
  element: HTMLDivElement,
  frame: OverlayFrame,
): void => {
  const left = Math.max(24, frame.width * 0.05);
  element.style.transform = `translate3d(${left}px, ${frame.height * 0.14}px, 0)`;
};

const positionStoneSection = (
  element: HTMLDivElement,
  frame: OverlayFrame,
  stone: Vector2,
): { left: number; top: number; anchor: number } => {
  // REASON: the stone projects to ~120px screen radius, so the gap must stay
  // beyond it or headlines start on top of the sphere
  const height = element.offsetHeight;
  const maxTop = frame.height - height - 104;
  if (frame.width < 768) {
    const top = Math.max(24, Math.min(frame.height * 0.16, maxTop));
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
  const top = Math.max(24, Math.min(center - height / 2, maxTop));
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
    const motion = sectionMotion(frame.progress, section);
    const crossing =
      frame.progress >= DIVE_START && frame.progress <= HANDOFF_END;
    if (crossing && section.placement === 'center') {
      motion.opacity = frame.handoff.compositing
        ? 0
        : 1 - heroHandoffProgress(frame.progress);
      motion.shift = 0;
    }
    if (crossing && section.center === WORK_STONE.center) {
      motion.opacity = frame.handoff.compositing
        ? 0
        : heroHandoffProgress(frame.progress);
    }
    element.style.opacity = String(motion.opacity);
    element.style.setProperty('--reveal', String(motion.opacity));
    element.inert = motion.opacity < 0.1;
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
    if (section.placement !== 'stone') {
      const scale = 1 - (1 - motion.opacity) * 0.14;
      element.style.transform =
        frame.motionMode === 'reduced' || crossing
          ? ''
          : `perspective(1000px) translate3d(0, ${motion.shift}px, 0) scale(${scale}) rotateX(${(1 - motion.opacity) * 7}deg)`;
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
  applyWorkShowcase(nodes);
  applyGalaxyLabels(nodes, frame);
  if (nodes.veil) {
    nodes.veil.style.opacity = String(frame.descent.veil);
    nodes.veil.style.backgroundColor = `rgb(${Math.round(
      frame.descent.veilColor[0] * 255,
    )}, ${Math.round(frame.descent.veilColor[1] * 255)}, ${Math.round(
      frame.descent.veilColor[2] * 255,
    )})`;
  }
};
