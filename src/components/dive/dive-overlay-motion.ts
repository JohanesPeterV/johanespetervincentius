import { ARRIVAL_RISE, arrivalCard } from './arrival';
import {
  DIVE_SECTIONS,
  DIVE_START,
  DescentFrame,
  WORK_STONE,
  cardScatter,
  sectionMotion,
  sectionJumpDelta,
} from './descent';
import type { MotionMode } from './descent';
import { heroOverlayOpacity, workSectionOpacity } from './hero-handoff';
import type { HeroHandoff } from './hero-handoff';

export type OverlayNodes = {
  chapters: (HTMLButtonElement | null)[];
  root: HTMLDivElement | null;
  sections: (HTMLDivElement | null)[];
  veil: HTMLDivElement | null;
};

export type OverlayFrame = {
  descent: DescentFrame;
  progress: number;
  motionMode: MotionMode;
  handoff: HeroHandoff;
};

export const applyOverlay = (
  nodes: OverlayNodes,
  frame: OverlayFrame,
): void => {
  let activeChapter = 0;
  let nearestDistance = Infinity;
  const card = arrivalCard(frame.handoff.arrival);
  if (nodes.root) {
    nodes.root.style.setProperty('--arrival', String(frame.handoff.arrival));
  }
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
      opacity = heroOverlayOpacity(frame.handoff) * card;
    }
    if (section.center === WORK_STONE.center) {
      opacity = workSectionOpacity(frame.handoff.journey);
    }
    element.style.opacity = String(opacity);
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
      element.style.transform = `translate3d(0, ${(1 - card) * ARRIVAL_RISE}px, 0)`;
    } else {
      const scatter =
        frame.motionMode === 'reduced'
          ? 0
          : cardScatter(frame.progress, section.center);
      element.style.setProperty('--scatter', String(scatter));
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
