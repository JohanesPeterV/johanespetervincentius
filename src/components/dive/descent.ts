import { RAW_DESCENT_KEYS } from './descent-keys';
import {
  DIVE_LENGTH,
  DIVE_START,
  DIVE_SECTIONS,
  LAST_SECTION,
} from './dive-sections';

export type DescentFrame = {
  position: [number, number, number];
  look: [number, number, number];
  fogColor: [number, number, number];
  fogDensity: number;
  glow: number;
  veil: number;
  veilColor: [number, number, number];
};

export type MotionMode = 'full' | 'reduced';

type DescentKey = DescentFrame & { at: number };

const hexToRgb = (hex: string): [number, number, number] => {
  const value = parseInt(hex.slice(1), 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
};

const SEAM_CENTER = 1.4;
const SEAM_SPAN = 0.46;
const FINALE_CENTER = 3.08;
const FINALE_SPAN = 0.4;

const transitionBoost = (
  progress: number,
  center: number,
  span: number,
): number => {
  const distance = Math.min(1, Math.abs(progress - center) / span);
  return 1 - distance * distance * (3 - 2 * distance);
};

export const seamBoost = (progress: number): number =>
  transitionBoost(progress, SEAM_CENTER, SEAM_SPAN);

export const finaleBoost = (progress: number): number =>
  transitionBoost(progress, FINALE_CENTER, FINALE_SPAN);

const DESCENT_KEYS: DescentKey[] = RAW_DESCENT_KEYS.map((raw) => ({
  at: raw.at,
  position: raw.position,
  look: raw.look,
  fogColor: hexToRgb(raw.fog),
  fogDensity: raw.fogDensity,
  glow: raw.glow,
  veil: raw.veil,
  veilColor: hexToRgb(raw.veilColor),
}));

const smootherstep = (edge0: number, edge1: number, value: number): number => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

const lerp = (from: number, to: number, t: number): number => {
  return from + (to - from) * t;
};

const writeTriple = (
  target: [number, number, number],
  from: [number, number, number],
  to: [number, number, number],
  t: number,
): void => {
  target[0] = lerp(from[0], to[0], t);
  target[1] = lerp(from[1], to[1], t);
  target[2] = lerp(from[2], to[2], t);
};

export const createDescentFrame = (): DescentFrame => ({
  position: [0, 0, 0],
  look: [0, 0, 0],
  fogColor: [0, 0, 0],
  fogDensity: 0,
  glow: 0,
  veil: 0,
  veilColor: [0, 0, 0],
});

export const wrapProgress = (value: number): number => {
  const wrapped = ((value % DIVE_LENGTH) + DIVE_LENGTH) % DIVE_LENGTH;
  // REASON: complete laps can round to just below the end instead of zero;
  // both sides of the numeric seam must select the same rendered world.
  return wrapped < 0.000000001 || DIVE_LENGTH - wrapped < 0.000000001
    ? 0
    : wrapped;
};

const WORLD_ENTER_AT = 1.3;
const WORLD_ACCELERATION_SPAN = 0.38;
const WORLD_RISE_RATE = 20;

export const worldRise = (progress: number): number => {
  const distance = Math.max(0, progress - WORLD_ENTER_AT);
  return (
    distance *
    smootherstep(0, WORLD_ACCELERATION_SPAN, distance) *
    WORLD_RISE_RATE
  );
};

// REASON: runs every frame from the camera rig - writing into a caller-owned
// frame keeps descent sampling allocation-free instead of churning five tuples
// per frame
export const writeDescentFrame = (
  target: DescentFrame,
  progress: number,
): DescentFrame => {
  const wrapped = wrapJourney(progress);
  let start = DESCENT_KEYS[0];
  let end = DESCENT_KEYS[DESCENT_KEYS.length - 1];
  for (let index = 0; index < DESCENT_KEYS.length - 1; index++) {
    if (
      wrapped >= DESCENT_KEYS[index].at &&
      wrapped <= DESCENT_KEYS[index + 1].at
    ) {
      start = DESCENT_KEYS[index];
      end = DESCENT_KEYS[index + 1];
      break;
    }
  }
  const span = Math.max(0.0001, end.at - start.at);
  const t = smootherstep(0, 1, (wrapped - start.at) / span);
  writeTriple(target.position, start.position, end.position, t);
  writeTriple(target.look, start.look, end.look, t);
  writeTriple(target.fogColor, start.fogColor, end.fogColor, t);
  writeTriple(target.veilColor, start.veilColor, end.veilColor, t);
  target.fogDensity = lerp(start.fogDensity, end.fogDensity, t);
  target.glow = lerp(start.glow, end.glow, t);
  target.veil = lerp(start.veil, end.veil, t);
  return target;
};

export const stoneSectionOpacity = (
  progress: number,
  center: number,
): number => {
  const fadeIn = smootherstep(center - 0.34, center - 0.16, progress);
  const fadeOut = 1 - smootherstep(center + 0.16, center + 0.34, progress);
  return fadeIn * fadeOut;
};

// REASON: leaving a card chapter flings its cards off along the scroll, so
// idling before the fling gathers them back and past it commits the scatter
const SCATTER_START = 0.05;
const SCATTER_SPAN = 0.3;

export const cardScatter = (progress: number, center: number): number =>
  smootherstep(
    center + SCATTER_START,
    center + SCATTER_START + SCATTER_SPAN,
    progress,
  );

const HERO_READING_HALF = 0.1;

export const LOOP_START = LAST_SECTION.center + SCATTER_START + SCATTER_SPAN;
export const LOOP_END = DIVE_START - HERO_READING_HALF;

// REASON: journey coordinates wrap at Hero's arrival, keeping the authored
// chapter poses intact when the return gap matches the opening gap.
export const wrapJourney = (value: number): number =>
  LOOP_END + wrapProgress(value - LOOP_END);

export const sectionTravel = (progress: number): number => {
  let travel = 1;
  for (const section of DIVE_SECTIONS) {
    const distance = Math.abs(
      wrapProgress(progress - section.center + DIVE_LENGTH / 2) -
        DIVE_LENGTH / 2,
    );
    travel = Math.min(travel, smootherstep(0.08, 0.3, distance));
  }
  return travel;
};

export const sectionJumpDelta = (progress: number, center: number): number =>
  wrapProgress(center - progress + DIVE_LENGTH / 2) - DIVE_LENGTH / 2;

const SECTION_STEP_EPSILON = 0.05;

const SNAP_CENTERS: number[] = DIVE_SECTIONS.map((section) => section.center);

export const sectionStepDelta = (
  progress: number,
  direction: 1 | -1,
): number => {
  const wrapped = wrapProgress(progress);
  let nearest = DIVE_LENGTH;
  for (const center of SNAP_CENTERS) {
    const forward = wrapProgress((center - wrapped) * direction);
    if (forward > SECTION_STEP_EPSILON && forward < nearest) {
      nearest = forward;
    }
  }
  return direction * nearest;
};

export const nearestSectionDelta = (progress: number): number => {
  const wrapped = wrapProgress(progress);
  let best = 0;
  let bestDistance = DIVE_LENGTH;
  for (const center of SNAP_CENTERS) {
    const forward = wrapProgress(center - wrapped);
    const delta = forward > DIVE_LENGTH / 2 ? forward - DIVE_LENGTH : forward;
    if (Math.abs(delta) < bestDistance) {
      bestDistance = Math.abs(delta);
      best = delta;
    }
  }
  return best;
};

export const aberrationStrength = (velocity: number): number => {
  return Math.min(0.0011, Math.abs(velocity) * 0.008);
};

export const rushFov = (velocity: number): number => {
  return 58 + Math.min(0.4, Math.abs(velocity) * 14);
};
