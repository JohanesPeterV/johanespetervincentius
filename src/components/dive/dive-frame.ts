import { arrivalApproach } from './arrival';
import { createDescentFrame, writeDescentFrame } from './descent';
import type { DescentFrame, MotionMode } from './descent';
import { applyDivePalette } from './dive-palette';
import type { DivePalette } from './dive-palette';
import type { DiveTimeline } from './dive-timeline';
import { worldAtProgress } from './hero-handoff';

export type DiveFrame = {
  descent: DescentFrame;
  delta: number;
  velocity: number;
  approach: number;
  travel: number;
  cameraTravel: number;
  world: 'hero' | 'orbital';
};

type FrameSample = {
  timeline: DiveTimeline;
  palette: DivePalette;
  motionMode: MotionMode;
};

export const createDiveFrame = (): DiveFrame => ({
  descent: createDescentFrame(),
  delta: 0,
  velocity: 0,
  approach: 1,
  travel: 0,
  cameraTravel: 0,
  world: 'hero',
});

export const writeDiveFrame = (
  frame: DiveFrame,
  { timeline, palette, motionMode }: FrameSample,
): void => {
  const { handoff, renderProgress: progress } = timeline;
  const { route } = handoff;
  const sceneProgress = route.sceneProgress(progress);
  writeDescentFrame(frame.descent, sceneProgress);
  applyDivePalette(frame.descent, palette, sceneProgress);
  if (motionMode === 'reduced') {
    frame.descent.position[0] = 0;
    frame.descent.position[1] = 3.5;
    frame.descent.position[2] = 16;
    frame.descent.look[0] = 0;
    frame.descent.look[1] = 2.4;
    frame.descent.look[2] = 0;
  }
  frame.delta = timeline.delta;
  frame.velocity = timeline.velocity;
  frame.approach = arrivalApproach(handoff.arrival);
  frame.travel = route.travel(progress);
  frame.cameraTravel =
    motionMode === 'reduced' || handoff.crossing !== null ? 0 : frame.travel;
  frame.world = worldAtProgress(progress, route);
};
