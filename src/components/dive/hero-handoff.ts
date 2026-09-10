import { Vector4 } from 'three';
import type { CanvasTexture } from 'three';

import {
  DIVE_LENGTH,
  DIVE_START,
  LOOP_END,
  LOOP_START,
  WORK_STONE,
  stoneSectionOpacity,
  wrapProgress,
} from './descent';
import type { MotionMode } from './descent';

type HandoffWorld = 'hero' | 'orbital';
type HandoffCrossing = 'work' | 'loop' | null;

export type SectionSnapshot = {
  texture: CanvasTexture;
  width: number;
  height: number;
};

export type HeroHandoff = {
  hero: SectionSnapshot | null;
  work: SectionSnapshot | null;
  workRect: Vector4;
  sourceWorld: HandoffWorld | null;
  crossing: HandoffCrossing;
  compositing: boolean;
  progress: number;
  journey: number;
};

export const HANDOFF_START = DIVE_START + 0.1;
export const HANDOFF_END = WORK_STONE.center - 0.1;

export const createHeroHandoff = (): HeroHandoff => ({
  hero: null,
  work: null,
  workRect: new Vector4(),
  sourceWorld: null,
  crossing: null,
  compositing: false,
  progress: 0,
  journey: DIVE_START,
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

export const loopHandoffProgress = (progress: number): number => {
  const wrapped = wrapProgress(progress);
  const unwrapped =
    wrapped < (LOOP_START + LOOP_END) / 2 ? wrapped + DIVE_LENGTH : wrapped;
  return clampHandoffProgress(
    (unwrapped - LOOP_START) / (DIVE_LENGTH + LOOP_END - LOOP_START),
  );
};

export const worldAtProgress = (progress: number): HandoffWorld =>
  wrapProgress(progress) >= (HANDOFF_START + HANDOFF_END) / 2
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

export const workSectionOpacity = (progress: number): number =>
  progress <= HANDOFF_END
    ? Number(heroHandoffProgress(progress) >= 0.5)
    : stoneSectionOpacity(progress, WORK_STONE.center);

export const workOverlayOpacity = (handoff: HeroHandoff): number =>
  handoff.compositing ? 0 : workSectionOpacity(handoff.journey);

export const sampleHeroHandoff = (
  handoff: HeroHandoff,
  motionMode: MotionMode,
): number => {
  const workProgress = heroHandoffProgress(handoff.journey);
  const loopProgress = loopHandoffProgress(handoff.journey);
  let crossing: HandoffCrossing = null;
  if (loopProgress > 0 && loopProgress < 1) {
    crossing = 'loop';
  } else if (workProgress > 0 && workProgress < 1) {
    crossing = 'work';
  }
  // REASON: late snapshots must not replace a cut/crossfade midway through a
  // gesture. The saved outgoing world also stays fixed when input reverses.
  const entering = crossing !== handoff.crossing;
  handoff.compositing =
    crossing !== null &&
    motionMode === 'full' &&
    handoff.sourceWorld !== null &&
    handoff.hero !== null &&
    (crossing === 'loop' || handoff.work !== null) &&
    (entering || handoff.compositing);
  handoff.crossing = crossing;
  handoff.progress = crossing === 'loop' ? loopProgress : workProgress;
  if (handoff.compositing) {
    // REASON: render the other endpoint behind the etched edge, never the
    // numeric wrap's resetting camera. The source identity survives reversals.
    if (handoff.sourceWorld === 'hero') {
      return crossing === 'loop' ? LOOP_START : HANDOFF_END;
    }
    return crossing === 'loop' ? LOOP_END : HANDOFF_START;
  }
  if (crossing === 'loop') {
    return loopProgress < 0.5 ? LOOP_START : LOOP_END;
  }
  return handoff.journey;
};
