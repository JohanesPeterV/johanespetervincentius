import { RAW_DESCENT_KEYS } from './descent-keys';

type DiveSectionBase = {
  tag: string;
  title: string;
  subtitle: string;
  center: number;
};

type CenterDiveSection = DiveSectionBase & {
  placement: 'center';
};

type StoneDiveSection = DiveSectionBase & {
  placement: 'stone';
  stoneIndex: number;
  stoneScale?: number;
  x: number;
  z: number;
};

export type DiveSection = CenterDiveSection | StoneDiveSection;

export type DescentFrame = {
  position: [number, number, number];
  look: [number, number, number];
  fogColor: [number, number, number];
  fogDensity: number;
  glow: number;
  veil: number;
  veilColor: [number, number, number];
};

type SectionMotion = {
  opacity: number;
  shift: number;
};

export type MotionMode = 'full' | 'reduced';

type DescentKey = DescentFrame & { at: number };

export const TECH_STONE = { center: 3.15, x: -1.6, z: 8.1 };
const TECH_DWELL_HALF = 0.3;

export const WORK_STONE = { center: 1.95, x: -1.65, z: 8 };

export const PROJECT_STONE = { center: 2.55, x: -1.45, z: 8.4 };

export const WORK_SECTION: StoneDiveSection = {
  tag: '02',
  title: 'Work\nExperience',
  subtitle: '2020 — present',
  placement: 'stone',
  stoneIndex: 0,
  ...WORK_STONE,
};

export const PROJECT_SECTION: StoneDiveSection = {
  tag: '03',
  title: 'Projects',
  subtitle: 'From idea to a product you can use.',
  placement: 'stone',
  stoneIndex: 1,
  ...PROJECT_STONE,
};

export const DIVE_SECTIONS: DiveSection[] = [
  {
    tag: '01',
    title: 'Johanes Peter\nVincentius',
    subtitle: 'Scroll to explore',
    center: 0.95,
    placement: 'center',
  },
  WORK_SECTION,
  PROJECT_SECTION,
  {
    tag: '04',
    title: 'Tech\nStack',
    subtitle: 'tools of the trade',
    placement: 'stone',
    stoneIndex: 2,
    // REASON: this stone passes behind the skill galaxy - at full size its
    // silhouette fights the constellation for the frame
    stoneScale: 0.38,
    ...TECH_STONE,
  },
];

export const DIVE_LENGTH = 4.1;
export const DIVE_START = 0.95;
export const WHEEL_SENSITIVITY = 1 / 2000;
export const TOUCH_SENSITIVITY = 1 / 1000;

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
const FINALE_CENTER = 3.68;
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

type NarrativeStone = {
  center: number;
  scale: number;
  x: number;
  z: number;
};

export const NARRATIVE_STONES: NarrativeStone[] = DIVE_SECTIONS.flatMap(
  (section) => {
    if (section.placement === 'center') {
      return [];
    }
    return [
      {
        center: section.center,
        scale: section.stoneScale ?? 1,
        x: section.x,
        z: section.z,
      },
    ];
  },
);

const NARRATIVE_STONE_CENTER_Y = 4.45;
// REASON: stone sections sit 0.6 progress apart and the camera sees ~9 world
// units vertically - a rate of 17 spaces stones ~10 units apart so only the
// active stone is ever in frame
const NARRATIVE_STONE_RISE_RATE = 17;

const DWELL_RATE = 2.5;

export const narrativeStoneY = (progress: number, center: number): number => {
  let delta = progress - center;
  // REASON: the opening spans a full chapter rather than the later 0.6 steps;
  // the first stone must enter while the hero leaves, not after an empty gap.
  if (center === WORK_STONE.center && delta < 0) {
    delta *= 0.5;
  }
  // REASON: the tech section hosts the skill galaxy - compressing travel
  // inside the dwell holds the galaxy on screen long enough to notice and
  // explore it, then full rise speed resumes at the dwell edges
  if (center === TECH_STONE.center) {
    const held = Math.max(-TECH_DWELL_HALF, Math.min(TECH_DWELL_HALF, delta));
    delta = held * (DWELL_RATE / NARRATIVE_STONE_RISE_RATE) + (delta - held);
  }
  return NARRATIVE_STONE_CENTER_Y + delta * NARRATIVE_STONE_RISE_RATE;
};

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
  const wrapped = wrapProgress(progress);
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

const TECH_FADE_SPAN = 0.18;
const HERO_FADE_SPAN = 0.54;
const HERO_READING_HALF = 0.1;

export const LOOP_START = TECH_STONE.center + TECH_DWELL_HALF + TECH_FADE_SPAN;
export const LOOP_END = DIVE_START - HERO_READING_HALF;

export const techSectionOpacity = (progress: number): number => {
  const distance = Math.abs(progress - TECH_STONE.center);
  return (
    1 -
    smootherstep(TECH_DWELL_HALF, TECH_DWELL_HALF + TECH_FADE_SPAN, distance)
  );
};

const stoneOpacity = (progress: number, center: number): number => {
  if (center === TECH_STONE.center) {
    return techSectionOpacity(progress);
  }
  return stoneSectionOpacity(progress, center);
};

export const sectionMotion = (
  progress: number,
  section: DiveSection,
): SectionMotion => {
  if (section.placement === 'stone') {
    return { opacity: stoneOpacity(progress, section.center), shift: 0 };
  }
  const delta = progress - section.center;
  const distance = Math.abs(delta);
  return {
    opacity: 1 - smootherstep(HERO_READING_HALF, HERO_FADE_SPAN, distance),
    shift: -delta * 240,
  };
};

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
