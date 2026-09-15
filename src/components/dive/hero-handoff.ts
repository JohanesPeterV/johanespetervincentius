import { MathUtils } from 'three';
import type { CanvasTexture } from 'three';

import {
  DIVE_START,
  ENTRY_CENTER,
  LOOP_END,
  chapterScroll,
} from './dive-route';
import type { DiveRoute } from './dive-route';
import type { MotionMode } from './descent';

type HandoffWorld = 'hero' | 'orbital';
type HandoffCrossing = 'entry' | 'loop' | null;

export type HeroHandoff = {
  route: DiveRoute;
  hero: CanvasTexture | null;
  entry: CanvasTexture | null;
  last: CanvasTexture | null;
  sourceWorld: HandoffWorld | null;
  crossing: HandoffCrossing;
  compositing: boolean;
  progress: number;
  journey: number;
  // REASON: the opening is the first crossing, from the void into Hero, so it
  // rides the shared transition state every layer already samples per frame.
  arrival: number;
};

export const HANDOFF_START = DIVE_START + 0.1;
export const HANDOFF_END = ENTRY_CENTER - 0.1;

export const createHeroHandoff = (route: DiveRoute): HeroHandoff => ({
  route,
  hero: null,
  entry: null,
  last: null,
  sourceWorld: null,
  crossing: null,
  compositing: false,
  progress: 0,
  journey: DIVE_START,
  arrival: 0,
});

const clampHandoffProgress = (value: number): number => {
  // REASON: wrapping repeated laps introduces tiny rounding errors; endpoint
  // frames must still release the compositor and refresh its saved world.
  if (value < 0.000001) {
    return 0;
  }
  if (value > 0.999999) {
    return 1;
  }
  return value;
};

export const heroHandoffProgress = (progress: number): number =>
  clampHandoffProgress(
    (progress - HANDOFF_START) / (HANDOFF_END - HANDOFF_START),
  );

export const loopHandoffProgress = (handoff: HeroHandoff): number => {
  const { route } = handoff;
  const wrapped = route.wrapDistance(handoff.journey);
  const unwrapped =
    wrapped < (route.loopStart + LOOP_END) / 2
      ? wrapped + route.length
      : wrapped;
  return clampHandoffProgress(
    (unwrapped - route.loopStart) / (route.length + LOOP_END - route.loopStart),
  );
};

export const worldAtProgress = (
  progress: number,
  route: DiveRoute,
): HandoffWorld =>
  route.wrap(progress) >= (HANDOFF_START + HANDOFF_END) / 2
    ? 'orbital'
    : 'hero';

// REASON: without the compositor (snapshot still capturing, or reduced motion)
// a cross-fade shows both overlays as translucent cards over the live scene;
// cutting at the midpoint keeps every card opaque, as the loop crossing does.
export const heroOverlayOpacity = (handoff: HeroHandoff): number => {
  if (handoff.compositing) {
    return 0;
  }
  if (handoff.crossing === 'loop') {
    return Number(handoff.progress >= 0.5);
  }
  return Number(heroHandoffProgress(handoff.journey) < 0.5);
};

export const entrySectionOpacity = (progress: number): number =>
  progress <= HANDOFF_END
    ? Number(heroHandoffProgress(progress) >= 0.5)
    : Number(chapterScroll(progress, ENTRY_CENTER) < 1);

export const entryOverlayOpacity = (handoff: HeroHandoff): number =>
  handoff.compositing ? 0 : entrySectionOpacity(handoff.journey);

export const lastOverlayOpacity = (handoff: HeroHandoff): number => {
  if (handoff.crossing === 'loop') {
    return handoff.compositing ? 0 : Number(handoff.progress < 0.5);
  }
  return Number(chapterScroll(handoff.journey, handoff.route.last.center) > -1);
};

// REASON: the crossing wipes the chapter in under the etched edge; its
// artwork follows the journey instead, settling in after the crossing rather
// than showing under the wipe.
export const orbitalArrival = (journey: number): number =>
  MathUtils.smootherstep(journey, HANDOFF_END, ENTRY_CENTER);

export const sampleHeroHandoff = (
  handoff: HeroHandoff,
  motionMode: MotionMode,
): number => {
  const { route } = handoff;
  const entryProgress = heroHandoffProgress(handoff.journey);
  const loopProgress = loopHandoffProgress(handoff);
  let crossing: HandoffCrossing = null;
  if (loopProgress > 0 && loopProgress < 1) {
    crossing = 'loop';
  } else if (entryProgress > 0 && entryProgress < 1) {
    crossing = 'entry';
  }
  // REASON: late snapshots must not replace a cut/crossfade midway through a
  // gesture. The saved outgoing world also stays fixed when input reverses.
  const entering = crossing !== handoff.crossing;
  handoff.compositing =
    crossing !== null &&
    motionMode === 'full' &&
    handoff.sourceWorld !== null &&
    handoff.hero !== null &&
    (crossing === 'loop' ? handoff.last !== null : handoff.entry !== null) &&
    (entering || handoff.compositing);
  handoff.crossing = crossing;
  handoff.progress = crossing === 'loop' ? loopProgress : entryProgress;
  if (handoff.compositing) {
    // REASON: render the other endpoint behind the etched edge, never the
    // numeric wrap's resetting camera. The source identity survives reversals.
    if (handoff.sourceWorld === 'hero') {
      return crossing === 'loop' ? route.loopStart : HANDOFF_END;
    }
    return crossing === 'loop' ? LOOP_END : HANDOFF_START;
  }
  if (crossing === 'loop') {
    return loopProgress < 0.5 ? route.loopStart : LOOP_END;
  }
  return handoff.journey;
};
