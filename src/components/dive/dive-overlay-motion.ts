import { DIVE_START } from './dive-route';
import type { DiveRoute } from './dive-route';
import { ARRIVAL_RISE, arrivalCard } from './arrival';
import { DescentFrame, stoneSectionOpacity } from './descent';
import type { MotionMode } from './descent';
import {
  heroOverlayOpacity,
  entryOverlayOpacity,
  lastOverlayOpacity,
} from './hero-handoff';
import type { HeroHandoff } from './hero-handoff';

export type OverlayNodes = {
  chapters: Map<string, HTMLButtonElement | null>;
  root: HTMLDivElement | null;
  sections: Map<string, HTMLDivElement | null>;
  veil: HTMLDivElement | null;
};

export type OverlayFrame = {
  descent: DescentFrame;
  motionMode: MotionMode;
  handoff: HeroHandoff;
};

type OverlayMotion = {
  route: DiveRoute | null;
  nodes: OverlayNodes;
  progress: number;
  arrival: number;
  motionMode: MotionMode | null;
};

export const createOverlayMotion = (nodes: OverlayNodes): OverlayMotion => ({
  nodes,
  route: null,
  progress: Number.NaN,
  arrival: Number.NaN,
  motionMode: null,
});

export const overlayNeedsUpdate = (
  previous: OverlayMotion,
  frame: OverlayFrame,
): boolean =>
  frame.handoff.route !== previous.route ||
  frame.handoff.journey !== previous.progress ||
  frame.motionMode !== previous.motionMode ||
  frame.handoff.arrival !== previous.arrival ||
  (frame.handoff.progress > 0 && frame.handoff.progress < 1);

export const updateOverlay = (
  motion: OverlayMotion,
  frame: OverlayFrame,
): void => {
  // REASON: resting chapters need no repeated DOM writes, but crossing
  // animations still need refreshes when the rendered camera is held still.
  if (!overlayNeedsUpdate(motion, frame)) {
    return;
  }
  applyOverlay(motion.nodes, frame);
  motion.route = frame.handoff.route;
  motion.progress = frame.handoff.journey;
  motion.arrival = frame.handoff.arrival;
  motion.motionMode = frame.motionMode;
};

const applyOverlay = (nodes: OverlayNodes, frame: OverlayFrame): void => {
  let activeChapter: string = 'hero';
  let nearestDistance = Infinity;
  const card = arrivalCard(frame.handoff.arrival);
  if (nodes.root) {
    nodes.root.style.setProperty('--arrival', String(frame.handoff.arrival));
  }
  frame.handoff.route.sections.forEach((section) => {
    const distance = Math.abs(
      frame.handoff.route.jumpDelta(frame.handoff.journey, section.center),
    );
    if (distance < nearestDistance) {
      nearestDistance = distance;
      activeChapter = section.id;
    }
    const element = nodes.sections.get(section.id);
    if (!element) {
      return;
    }
    let opacity = stoneSectionOpacity(frame.handoff.journey, section.center);
    if (section.id === 'hero') {
      opacity = heroOverlayOpacity(frame.handoff) * card;
    }
    if (section.id === frame.handoff.route.entry.id) {
      opacity = entryOverlayOpacity(frame.handoff);
    }
    const last = section.id === frame.handoff.route.last.id;
    if (
      last &&
      (frame.handoff.crossing === 'loop' ||
        frame.handoff.journey >= section.center)
    ) {
      opacity = lastOverlayOpacity(frame.handoff);
    }
    const keepMounted = last && frame.handoff.crossing === 'loop';
    element.style.opacity = String(opacity);
    element.inert = opacity < 0.1;
    const visibility = opacity < 0.05 ? 'hidden' : 'visible';
    if (element.style.visibility !== visibility) {
      element.style.visibility = visibility;
    }
    if ((opacity > 0.4 || keepMounted) && element.dataset.visible !== 'true') {
      element.dataset.visible = 'true';
    }
    if (opacity < 0.05 && !keepMounted && element.dataset.visible !== 'false') {
      element.dataset.visible = 'false';
      // REASON: the crossing reveals the chapter from its top, so the live
      // panel must hand over from the top as well.
      element.scrollTop = 0;
    }
    if (section.id === 'hero') {
      element.style.transform = `translate3d(0, ${(1 - card) * ARRIVAL_RISE}px, 0)`;
    }
  });
  nodes.chapters.forEach((element, id) => {
    if (!element) {
      return;
    }
    if (id === activeChapter) {
      element.setAttribute('aria-current', 'step');
    } else {
      element.removeAttribute('aria-current');
    }
  });
  if (nodes.veil) {
    let opacity = frame.descent.veil;
    if (
      frame.handoff.journey < DIVE_START ||
      frame.handoff.journey > frame.handoff.route.entry.center
    ) {
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
