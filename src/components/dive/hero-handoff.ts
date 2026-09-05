import { Vector4 } from 'three';
import type { CanvasTexture } from 'three';

import { DIVE_START, WORK_STONE } from './descent';
import type { MotionMode } from './descent';

export type SectionSnapshot = {
  texture: CanvasTexture;
  width: number;
  height: number;
};

export type HeroHandoff = {
  hero: SectionSnapshot | null;
  work: SectionSnapshot | null;
  workRect: Vector4;
  sourceReady: boolean;
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
  sourceReady: false,
  compositing: false,
  progress: 0,
  journey: DIVE_START,
});

export const heroHandoffProgress = (progress: number): number =>
  Math.max(
    0,
    Math.min(1, (progress - HANDOFF_START) / (HANDOFF_END - HANDOFF_START)),
  );

export const sampleHeroHandoff = (
  handoff: HeroHandoff,
  motionMode: MotionMode,
): number => {
  // REASON: choose the compositor at an endpoint only; an asynchronously
  // prepared snapshot must not replace a crossfade halfway through a gesture.
  const entering = handoff.progress === 0 || handoff.progress === 1;
  handoff.progress = heroHandoffProgress(handoff.journey);
  handoff.compositing =
    motionMode === 'full' &&
    handoff.sourceReady &&
    handoff.hero !== null &&
    handoff.work !== null &&
    (entering || handoff.compositing) &&
    handoff.progress > 0 &&
    handoff.progress < 1;
  // REASON: the incoming world must already contain Work while the outgoing
  // hero still occupies the screen; a single moving frame cannot reveal it.
  return handoff.compositing ? HANDOFF_END : handoff.journey;
};
