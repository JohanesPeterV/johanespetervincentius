import { createAnimatable } from 'animejs/animatable';
import type { AnimatableObject } from 'animejs';
import type { Vector2 } from 'three';

import {
  DIVE_SECTIONS,
  DescentFrame,
  TECH_STONE,
  sectionMotion,
  techSectionOpacity,
} from './descent';
import { WORK_MOTION, workPull } from './camera-motion';
import { GALAXY_MOTION, GALAXY_NODES } from './skill-galaxy';

export type OverlayNodes = {
  sections: (HTMLDivElement | null)[];
  skillLayer: HTMLDivElement | null;
  skillRail: (HTMLButtonElement | null)[];
  skillWords: (HTMLSpanElement | null)[];
  veil: HTMLDivElement | null;
  workPanelContents: (HTMLDivElement | null)[];
  workPanels: (HTMLDivElement | null)[];
  workRail: (HTMLDivElement | null)[];
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
const WORK_PULL_DURATION_MS = 90;
const WORK_ENTER_DURATION_MS = 700;
const WORK_EXIT_DURATION_MS = 400;

type WorkPanelMotion = {
  content: AnimatableObject;
  pull: AnimatableObject;
  pullY: number;
};

const workPanelMotions = new Map<HTMLDivElement, WorkPanelMotion>();

const createWorkPanelMotion = (
  panel: HTMLDivElement,
  content: HTMLDivElement,
): WorkPanelMotion => {
  const motion = {
    content: createAnimatable(content, {
      opacity: { duration: WORK_EXIT_DURATION_MS, ease: 'out(3)' },
      y: { duration: WORK_ENTER_DURATION_MS, ease: 'outExpo' },
    }),
    pull: createAnimatable(panel, {
      y: { duration: WORK_PULL_DURATION_MS, ease: 'out(3)' },
    }),
    pullY: 0,
  };
  workPanelMotions.set(panel, motion);
  return motion;
};

const getWorkPanelMotion = (
  panel: HTMLDivElement,
  content: HTMLDivElement,
): WorkPanelMotion =>
  workPanelMotions.get(panel) ?? createWorkPanelMotion(panel, content);

const animateWorkPanel = (
  motion: WorkPanelMotion,
  state: 'active' | 'inactive',
): void => {
  if (state === 'active') {
    motion.content.opacity(1, WORK_EXIT_DURATION_MS, 'out(3)');
    motion.content.y(0, WORK_ENTER_DURATION_MS, 'outExpo');
    return;
  }
  motion.content.opacity(0, WORK_EXIT_DURATION_MS, 'out(3)');
  motion.content.y(20, WORK_EXIT_DURATION_MS, 'out(3)');
};

const applyWorkShowcase = (nodes: OverlayNodes): void => {
  const active = WORK_MOTION.job;
  const mark = (element: HTMLDivElement | null, index: number): void => {
    if (!element) {
      return;
    }
    const value = index === active ? 'true' : 'false';
    if (element.dataset.active !== value) {
      element.dataset.active = value;
    }
  };
  nodes.workRail.forEach(mark);
  const pull = workPull();
  nodes.workPanels.forEach((panel, index) => {
    const content = nodes.workPanelContents[index];
    if (!panel || !content) {
      return;
    }
    const state = index === active ? 'active' : 'inactive';
    const value = state === 'active' ? 'true' : 'false';
    const motion = getWorkPanelMotion(panel, content);
    if (panel.dataset.active !== value) {
      panel.dataset.active = value;
      animateWorkPanel(motion, state);
    }
    const pullY = state === 'active' ? -pull * WORK_PULL_NUDGE_PX : 0;
    if (motion.pullY !== pullY) {
      motion.pull.y(pullY);
      motion.pullY = pullY;
    }
  });
};

export const disposeOverlayMotion = (nodes: OverlayNodes): void => {
  nodes.workPanels.forEach((panel) => {
    if (!panel) {
      return;
    }
    const motion = workPanelMotions.get(panel);
    if (!motion) {
      return;
    }
    motion.content.revert();
    motion.pull.revert();
    workPanelMotions.delete(panel);
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
    if (section.placement !== 'stone') {
      element.style.transform = `translateY(${motion.shift}px)`;
    } else if (section.center === TECH_STONE.center) {
      positionTechHud(element, frame);
    } else {
      positionStoneSection(element, frame, frame.stones[section.stoneIndex]);
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
