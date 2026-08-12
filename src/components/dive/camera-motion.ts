import { MathUtils } from 'three';

import type { DescentFrame } from './descent';
import {
  WORK_JOBS,
  WORK_STONE,
  nearestSectionDelta,
  sectionStepDelta,
  wrapProgress,
} from './descent';

export type DriveMotion = {
  current: number;
  target: number;
  expectedTarget: number;
  idleTime: number;
};

const TARGET_FOLLOW_RATE = 4.68;
const POSITION_FOLLOW_RATE = 9.75;
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

const WORK_PULL_DECAY_RATE = 1.4;

export const advanceDrive = (
  motion: DriveMotion,
  target: number,
  delta: number,
): number => {
  // REASON: a sub-threshold scroll leaves the pull hint extended - decaying
  // it here springs the peeked panel back once input stops arriving
  WORK_MOTION.accum = MathUtils.damp(
    WORK_MOTION.accum,
    0,
    WORK_PULL_DECAY_RATE,
    delta,
  );
  if (Math.abs(WORK_MOTION.accum) < 0.004) {
    WORK_MOTION.accum = 0;
  }
  const lead = MathUtils.clamp(
    target,
    motion.current - MAX_TARGET_LEAD,
    motion.current + MAX_TARGET_LEAD,
  );
  const resolved = driftTargetToSection(motion, lead, delta);
  const followedTarget = MathUtils.damp(
    motion.target,
    resolved,
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
  if (Math.abs(resolved - motion.current) < POSITION_EPSILON) {
    motion.current = resolved;
    motion.target = resolved;
  }
  return resolved;
};

export type WorkLockInput = {
  target: number;
  progress: number;
  step: number;
  now: number;
};

// REASON: overlay motion reads the active job and pull every frame outside
// React, so the lock publishes them as module state like the galaxy does
export const WORK_MOTION = { accum: 0, job: 0, swappedAt: 0 };

// REASON: the lock is module state so it survives React remounts - a fresh
// DiveScene must not inherit the previous visit's active job or pull
export const resetWorkMotion = (): void => {
  WORK_MOTION.accum = 0;
  WORK_MOTION.job = 0;
  WORK_MOTION.swappedAt = 0;
};

const WORK_CATCH_HALF = 0.3;
const WORK_ZONE_START = WORK_STONE.center - WORK_CATCH_HALF;
const WORK_ZONE_END = WORK_STONE.center + WORK_CATCH_HALF;
const WORK_STEP_THRESHOLD = 0.18;
const WORK_SETTLE_EPSILON = 0.03;
// REASON: with the target frozen the settle gate never re-arms between
// swaps, so one long trackpad swipe would chain through every job or carry
// its leftover momentum straight past the next section on release - the
// cooldown matches the 700ms swap animation and absorbs the swipe tail
const WORK_SWAP_COOLDOWN_MS = 700;
const LAST_JOB = WORK_JOBS.length - 1;

// REASON: a sub-threshold scroll must visibly tug the active panel so short
// gestures never read as dead input - pull is the signed fraction of a swap
export const workPull = (): number =>
  MathUtils.clamp(WORK_MOTION.accum / WORK_STEP_THRESHOLD, -1, 1);

// REASON: while jobs swap, the stone and camera must stay perfectly still -
// jobs are overlay state instead of scroll stops, so any scroll or drag
// crossing the zone is caught dead at the section centre, and each settled
// full gesture swaps one job until the edges release back to free scroll
export const workLockedDelta = ({
  target,
  progress,
  step,
  now,
}: WorkLockInput): number => {
  const wrapped = wrapProgress(target);
  const inside = wrapped > WORK_ZONE_START && wrapped < WORK_ZONE_END;
  if (!inside) {
    WORK_MOTION.accum = 0;
    if (now - WORK_MOTION.swappedAt < WORK_SWAP_COOLDOWN_MS) {
      return 0;
    }
    const next = wrapped + step;
    if (wrapped <= WORK_ZONE_START && next > WORK_ZONE_START) {
      WORK_MOTION.job = 0;
      return WORK_STONE.center - wrapped;
    }
    if (wrapped >= WORK_ZONE_END && next < WORK_ZONE_END) {
      WORK_MOTION.job = LAST_JOB;
      return WORK_STONE.center - wrapped;
    }
    return step;
  }
  if (Math.abs(wrapProgress(progress) - wrapped) > WORK_SETTLE_EPSILON) {
    WORK_MOTION.accum = 0;
    return 0;
  }
  if (now - WORK_MOTION.swappedAt < WORK_SWAP_COOLDOWN_MS) {
    WORK_MOTION.accum = 0;
    return 0;
  }
  const nextAccum = WORK_MOTION.accum + step;
  if (Math.abs(nextAccum) < WORK_STEP_THRESHOLD) {
    WORK_MOTION.accum = nextAccum;
    return 0;
  }
  WORK_MOTION.accum = 0;
  WORK_MOTION.swappedAt = now;
  if (nextAccum > 0) {
    if (WORK_MOTION.job < LAST_JOB) {
      WORK_MOTION.job += 1;
      return 0;
    }
    return sectionStepDelta(wrapped, 1);
  }
  if (WORK_MOTION.job > 0) {
    WORK_MOTION.job -= 1;
    return 0;
  }
  return sectionStepDelta(wrapped, -1);
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
