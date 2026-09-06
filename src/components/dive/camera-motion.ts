import { MathUtils } from 'three';

import type { DescentFrame } from './descent';
import { nearestSectionDelta } from './descent';

export type DriveMotion = {
  current: number;
  target: number;
  expectedTarget: number;
  idleTime: number;
};

type DriveInput = {
  target: number;
  progress: number;
  step: number;
};

const POSITION_FOLLOW_RATE = 7.5;
const MAX_TARGET_SPEED = 4.5;
// REASON: unclamped wheel deltas bank whole extra loops on trackpad momentum
// flicks - the target may never lead the camera by more than ~1.4 sections
const MAX_TARGET_LEAD = 0.85;
const POSITION_EPSILON = 0.0004;
const SNAP_IDLE_DELAY = 0.4;
const SNAP_RATE = 2.2;
const FINALE_LAUNCH_START = 3.48;
const FINALE_LAUNCH_END = 4.08;

const smootherstep = (value: number): number => {
  const t = MathUtils.clamp(value, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

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

export const limitDriveTarget = (target: number, progress: number): number => {
  return MathUtils.clamp(
    target,
    progress - MAX_TARGET_LEAD,
    progress + MAX_TARGET_LEAD,
  );
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
  motion.current += MathUtils.clamp(
    followed - motion.current,
    -maxStep,
    maxStep,
  );
  if (Math.abs(resolved - motion.current) < POSITION_EPSILON) {
    motion.current = resolved;
  }
};

export const driveInputDelta = (input: DriveInput): number => {
  const step =
    limitDriveTarget(input.target + input.step, input.progress) - input.target;
  // REASON: a chosen chapter can lead by more than the wheel limit; another
  // forward gesture must never be converted into backward motion by that cap.
  if (Math.sign(step) !== Math.sign(input.step)) {
    return 0;
  }
  return step;
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
