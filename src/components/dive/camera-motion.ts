import { MathUtils } from 'three';

import { DIVE_LENGTH, DIVE_START } from './dive-sections';
import {
  nearestSectionDelta,
  sectionJumpDelta,
  sectionStepDelta,
  wrapProgress,
} from './descent';

export type DriveMotion = {
  current: number;
  target: number;
  expectedTarget: number;
  idleTime: number;
};

const POSITION_FOLLOW_RATE = 7.5;
const MAX_TARGET_SPEED = 4.5;
const POSITION_EPSILON = 0.0004;
const SNAP_IDLE_DELAY = 0.4;
const SNAP_RATE = 2.2;

// REASON: gravity may only engage after true idle - pulling while wheel
// deltas still arrive turns slow deliberate scrolling into a rubber band
const driftTargetToSection = (
  motion: DriveMotion,
  target: number,
  delta: number,
): number => {
  if (target === motion.expectedTarget) {
    motion.idleTime += delta;
  } else {
    motion.idleTime = 0;
  }
  let next = target;
  if (motion.idleTime > SNAP_IDLE_DELAY) {
    next = MathUtils.damp(
      target,
      target + nearestSectionDelta(target),
      SNAP_RATE,
      delta,
    );
  }
  motion.expectedTarget = next;
  return next;
};

export const advanceDrive = (motion: DriveMotion, delta: number): void => {
  const resolved = driftTargetToSection(motion, motion.target, delta);
  motion.target = resolved;
  const followed = MathUtils.damp(
    motion.current,
    resolved,
    POSITION_FOLLOW_RATE,
    delta,
  );
  const maxStep = MAX_TARGET_SPEED * delta;
  let step = MathUtils.clamp(followed - motion.current, -maxStep, maxStep);
  // REASON: opposite world crossings meet at Hero. Sample its reading pose
  // at least once, even on a slow frame, so the next crossing saves the right world.
  const direction = Math.sign(step);
  const toHero = wrapProgress((DIVE_START - motion.current) * direction);
  const nextHero = toHero < 0.0000001 ? DIVE_LENGTH : toHero;
  const stopsAtHero = nextHero < Math.abs(step);
  if (stopsAtHero) {
    step = nextHero * direction;
  }
  motion.current += step;
  if (!stopsAtHero && Math.abs(resolved - motion.current) < POSITION_EPSILON) {
    motion.current = resolved;
  }
};

export const jumpDriveToSection = (
  motion: DriveMotion,
  center: number,
): void => {
  motion.target += sectionJumpDelta(motion.target, center);
};

export const stepDriveToSection = (
  motion: DriveMotion,
  direction: 1 | -1,
): void => {
  // REASON: chapter commands choose a destination, not a wheel delta. The
  // longer loop hop must not be truncated by the continuous-input lead cap.
  motion.target += sectionStepDelta(motion.target, direction);
};
