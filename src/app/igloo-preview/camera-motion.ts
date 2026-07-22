import { MathUtils } from 'three';

import { DRIVE_FOLLOW_RATE } from './descent';
import type { DescentFrame } from './descent';

export type DriveMotion = {
  current: number;
  velocity: number;
};

const DRIVE_VELOCITY_DAMPING = 32;
const MAX_DRIVE_SPEED = 2;
const POSITION_EPSILON = 0.0004;
const VELOCITY_EPSILON = 0.001;
const FINALE_LAUNCH_START = 4.38;
const FINALE_LAUNCH_END = 4.98;

const smootherstep = (value: number): number => {
  const t = MathUtils.clamp(value, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

export const advanceDrive = (
  motion: DriveMotion,
  target: number,
  delta: number,
): void => {
  const distance = target - motion.current;
  const targetVelocity = MathUtils.clamp(
    distance * DRIVE_FOLLOW_RATE,
    -MAX_DRIVE_SPEED,
    MAX_DRIVE_SPEED,
  );
  motion.velocity = MathUtils.damp(
    motion.velocity,
    targetVelocity,
    DRIVE_VELOCITY_DAMPING,
    delta,
  );
  const step = motion.velocity * delta;
  const reachesTarget =
    Math.sign(step) === Math.sign(distance) &&
    Math.abs(step) >= Math.abs(distance);
  const isSettled =
    Math.abs(distance) < POSITION_EPSILON &&
    Math.abs(motion.velocity) < VELOCITY_EPSILON;
  if (reachesTarget || isSettled) {
    motion.current = target;
    motion.velocity = 0;
    return;
  }
  motion.current += step;
};

export const applyFinaleCamera = (
  frame: DescentFrame,
  progress: number,
): void => {
  const distance =
    (progress - FINALE_LAUNCH_START) /
    (FINALE_LAUNCH_END - FINALE_LAUNCH_START);
  if (distance <= 0) {
    return;
  }
  const eased = smootherstep(distance);
  frame.position[1] = MathUtils.lerp(3.5, 11.5, eased);
  frame.position[2] = MathUtils.lerp(16, 21, eased);
  frame.look[1] = MathUtils.lerp(2.4, 15.5, eased);
  frame.look[2] = MathUtils.lerp(0, -10, eased);
};
