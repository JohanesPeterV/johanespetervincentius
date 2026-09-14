import { ARRIVAL_DURATION } from './arrival';
import { advanceDrive } from './camera-motion';
import type { DriveMotion } from './camera-motion';
import type { MotionMode } from './descent';
import { sampleHeroHandoff } from './hero-handoff';
import type { HeroHandoff } from './hero-handoff';

export type DiveStage = 'loading' | 'live';

type TimelineTick = {
  delta: number;
  stage: DiveStage;
  motionMode: MotionMode;
};

type DiveTimeline = {
  drive: DriveMotion;
  handoff: HeroHandoff;
  delta: number;
  step: number;
  velocity: number;
  renderProgress: number;
};

const MAX_FRAME_DELTA = 0.1;
const BASELINE_FPS = 60;

export const createDiveTimeline = (
  drive: DriveMotion,
  handoff: HeroHandoff,
): DiveTimeline => ({
  drive,
  handoff,
  delta: 0,
  step: 0,
  velocity: 0,
  renderProgress: handoff.journey,
});

export const advanceDiveTimeline = (
  timeline: DiveTimeline,
  tick: TimelineTick,
): void => {
  const { drive, handoff } = timeline;
  const delta = Math.min(tick.delta, MAX_FRAME_DELTA);
  const previous = drive.current;
  if (tick.stage === 'live') {
    advanceDrive(drive, delta);
    if (tick.motionMode === 'reduced') {
      drive.current = drive.target;
    }
    handoff.arrival =
      tick.motionMode === 'reduced'
        ? 1
        : Math.min(1, handoff.arrival + delta / ARRIVAL_DURATION);
  }
  timeline.delta = delta;
  timeline.step = drive.current - previous;
  timeline.velocity = delta > 0 ? timeline.step / (delta * BASELINE_FPS) : 0;
  handoff.journey = drive.route.wrap(drive.current);
  // REASON: during a crossing, the camera holds an endpoint while the HTML
  // follows the journey. Sampling once keeps every renderer on the same frame.
  timeline.renderProgress = sampleHeroHandoff(handoff, tick.motionMode);
};
