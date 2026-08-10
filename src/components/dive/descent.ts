import { RAW_DESCENT_KEYS } from './descent-keys';

export type DiveSectionLink = {
  label: string;
  href: string;
};

type DiveSectionBase = {
  tag: string;
  title: string;
  subtitle: string;
  center: number;
  details?: string[];
  links?: DiveSectionLink[];
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

export type SectionMotion = {
  opacity: number;
  shift: number;
};

type DescentKey = DescentFrame & { at: number };

export const TECH_STONE = { center: 3.15, x: -1.6, z: 8.1 };

export const DIVE_SECTIONS: DiveSection[] = [
  {
    tag: '01',
    title: 'Johanes Peter\nVincentius',
    subtitle: 'Scroll to explore',
    center: 0.95,
    placement: 'center',
  },
  {
    tag: '02',
    title: 'Work\nExperience',
    subtitle: '2020 — present',
    center: 1.95,
    placement: 'stone',
    stoneIndex: 0,
    x: -1.65,
    z: 8,
    details: [
      'Smilie — Lead Software Engineer · 2025—now',
      'TableLink — Full-stack Developer · 2025',
      'Farmio — Software Engineer · 2023—2024',
      'Software Lab Center, Binus · 2020—2024',
    ],
  },
  {
    tag: '03',
    title: 'Projects',
    subtitle: 'a few things built',
    center: 2.55,
    placement: 'stone',
    stoneIndex: 1,
    x: -1.45,
    z: 8.4,
    links: [
      {
        label: 'Pomodoro Planter',
        href: 'https://pomoplanter.com',
      },
      {
        label: 'Simple Helpdesk',
        href: 'https://github.com/JohanesPeterV/simple-helpdesk',
      },
      {
        label: 'MyUtang Backend',
        href: 'https://github.com/JohanesPeterV/MyUtangBackend',
      },
      {
        label: 'This Portfolio',
        href: 'https://github.com/JohanesPeterV/johanespetervincentius',
      },
    ],
  },
  {
    tag: '04',
    title: 'Tech\nStack',
    subtitle: 'tools of the trade',
    placement: 'stone',
    stoneIndex: 2,
    // REASON: this stone is the nucleus of the skill orbit - at full size its
    // silhouette swallows the inner rings of orbiting words
    stoneScale: 0.6,
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

export type NarrativeStone = {
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

export const narrativeStoneY = (progress: number, center: number): number => {
  return (
    NARRATIVE_STONE_CENTER_Y + (progress - center) * NARRATIVE_STONE_RISE_RATE
  );
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

export const wrapProgress = (value: number): number =>
  ((value % DIVE_LENGTH) + DIVE_LENGTH) % DIVE_LENGTH;

const WORLD_A_SETTLE_DROP = 3.2;
const WORLD_A_SETTLE_END = 0.65;
const WORLD_A_DRIFT_RATE = 3;
const WORLD_A_EXIT_START = 1.24;
const WORLD_A_EXIT_END = 1.68;
const WORLD_A_EXIT_LIFT = 46;
const WORLD_B_ENTER_AT = 1.3;
const WORLD_B_ACCELERATION_SPAN = 0.38;
const WORLD_B_RISE_RATE = 20;

export const worldARise = (progress: number): number => {
  const settle =
    WORLD_A_SETTLE_DROP * (1 - smootherstep(0, WORLD_A_SETTLE_END, progress));
  // REASON: settle and exit leave the terrain motionless across the whole
  // opening section, so scrolling the hero reads as a dead input - a constant
  // lift between them keeps the world rising the moment the wheel moves
  const drift =
    Math.max(0, Math.min(progress, WORLD_A_EXIT_START) - WORLD_A_SETTLE_END) *
    WORLD_A_DRIFT_RATE;
  const exit =
    smootherstep(WORLD_A_EXIT_START, WORLD_A_EXIT_END, progress) *
    WORLD_A_EXIT_LIFT;
  return exit + drift - settle;
};

export const worldBRise = (progress: number): number => {
  const distance = Math.max(0, progress - WORLD_B_ENTER_AT);
  return (
    distance *
    smootherstep(0, WORLD_B_ACCELERATION_SPAN, distance) *
    WORLD_B_RISE_RATE
  );
};

const FINALE_SUN_START = 3.55;
const FINALE_SUN_END = 3.95;

export const finaleSunLift = (progress: number): number => {
  return smootherstep(FINALE_SUN_START, FINALE_SUN_END, progress);
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

export const sectionMotion = (
  progress: number,
  section: DiveSection,
): SectionMotion => {
  if (section.placement === 'stone') {
    return { opacity: stoneSectionOpacity(progress, section.center), shift: 0 };
  }
  const delta = progress - section.center;
  const distance = Math.abs(delta);
  return {
    opacity: 1 - smootherstep(0.22, 0.52, distance),
    shift: -delta * 110,
  };
};

const SECTION_STEP_EPSILON = 0.05;

export const sectionStepDelta = (
  progress: number,
  direction: 1 | -1,
): number => {
  const wrapped = wrapProgress(progress);
  let nearest = DIVE_LENGTH;
  for (const section of DIVE_SECTIONS) {
    const forward = wrapProgress((section.center - wrapped) * direction);
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
  for (const section of DIVE_SECTIONS) {
    const forward = wrapProgress(section.center - wrapped);
    const delta = forward > DIVE_LENGTH / 2 ? forward - DIVE_LENGTH : forward;
    if (Math.abs(delta) < bestDistance) {
      bestDistance = Math.abs(delta);
      best = delta;
    }
  }
  return best;
};

export const DIVE_TUNING = {
  aberrationScale: 1,
  fovRush: 1,
  snowSize: 2.1,
  transitionScale: 1,
};

export const transitionStrength = (velocity: number): number => {
  return Math.min(1, Math.abs(velocity) * 12) * DIVE_TUNING.transitionScale;
};

export const aberrationStrength = (velocity: number): number => {
  const base = Math.min(0.0011, Math.abs(velocity) * 0.008);
  return base * DIVE_TUNING.aberrationScale;
};

export const rushFov = (velocity: number): number => {
  return 58 + Math.min(0.4, Math.abs(velocity) * 14) * DIVE_TUNING.fovRush;
};
