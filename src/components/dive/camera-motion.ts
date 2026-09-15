import { MathUtils } from 'three';

import { DIVE_START } from './dive-route';
import type { DiveRoute } from './dive-route';

export type DriveMotion = {
  route: DiveRoute;
  current: number;
  target: number;
};

export const createDrive = (route: DiveRoute): DriveMotion => ({
  route,
  current: DIVE_START,
  target: DIVE_START,
});

const POSITION_FOLLOW_RATE = 5;
const MAX_TARGET_SPEED = 4.5;
const POSITION_EPSILON = 0.0004;

export const advanceDrive = (motion: DriveMotion, delta: number): void => {
  const resolved = motion.target;
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
  const toHero = motion.route.wrapDistance(
    (DIVE_START - motion.current) * direction,
  );
  const nextHero = toHero < 0.0000001 ? motion.route.length : toHero;
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
  motion.target += motion.route.jumpDelta(motion.target, center);
};

export const scrollDriveBy = (motion: DriveMotion, delta: number): void => {
  const target = MathUtils.clamp(
    motion.target + delta,
    motion.current - 0.85,
    motion.current + 0.85,
  );
  // REASON: a chapter command can exceed the scroll lead; its next forward
  // input must not pull the destination backward to the continuous-input cap.
  if (Math.sign(target - motion.target) === Math.sign(delta)) {
    motion.target = target;
  }
};

export const stepDriveToSection = (
  motion: DriveMotion,
  direction: 1 | -1,
): void => {
  // REASON: chapter commands choose a destination, not a wheel delta. The
  // longer loop hop must not be truncated by the continuous-input lead cap.
  motion.target += motion.route.stepDelta(motion.target, direction);
};
