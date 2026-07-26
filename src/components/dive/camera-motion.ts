import { MathUtils } from 'three';

import type { DescentFrame } from './descent';

export type DriveMotion = {
  current: number;
  target: number;
};

const TARGET_FOLLOW_RATE = 4.68;
const POSITION_FOLLOW_RATE = 9.75;
const MAX_TARGET_SPEED = 4.5;
// REASON: unclamped wheel deltas bank whole extra loops on trackpad momentum
// flicks - the target may never lead the camera by more than ~1.4 sections
export const MAX_TARGET_LEAD = 0.85;
const POSITION_EPSILON = 0.0004;
const FINALE_LAUNCH_START = 3.48;
const FINALE_LAUNCH_END = 4.08;

const smootherstep = (value: number): number => {
  const t = MathUtils.clamp(value, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

export const advanceDrive = (
  motion: DriveMotion,
  target: number,
  delta: number,
): void => {
  const followedTarget = MathUtils.damp(
    motion.target,
    target,
    TARGET_FOLLOW_RATE,
    delta,
  );
  const maxTargetStep = MAX_TARGET_SPEED * delta;
  motion.target += MathUtils.clamp(
    followedTarget - motion.target,
    -maxTargetStep,
    maxTargetStep,
  );
  motion.current = MathUtils.damp(
    motion.current,
    motion.target,
    POSITION_FOLLOW_RATE,
    delta,
  );
  if (Math.abs(target - motion.current) < POSITION_EPSILON) {
    motion.current = target;
    motion.target = target;
  }
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
