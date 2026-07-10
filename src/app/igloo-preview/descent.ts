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
  blur: number;
};

type RawDescentKey = {
  at: number;
  position: [number, number, number];
  look: [number, number, number];
  fog: string;
  fogDensity: number;
  glow: number;
  veil: number;
  veilColor: string;
};

type DescentKey = DescentFrame & { at: number };

export const DIVE_SECTIONS: DiveSection[] = [
  {
    tag: '// 01',
    title: 'Johanes Peter\nVincentius',
    subtitle: 'scroll to dive',
    center: 0.95,
    placement: 'center',
  },
  {
    tag: '// 02',
    title: 'Work\nExperience',
    subtitle: '2020 — present',
    center: 2.85,
    placement: 'stone',
    stoneIndex: 0,
    details: [
      'Smilie — Lead Software Engineer · 2025—now',
      'TableLink — Full-stack Developer · 2025',
      'Farmio — Software Engineer · 2023—2024',
      'Software Lab Center, Binus · 2020—2024',
    ],
  },
  {
    tag: '// 03',
    title: 'Selected\nProjects',
    subtitle: 'a few things built',
    center: 3.45,
    placement: 'stone',
    stoneIndex: 1,
    links: [
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
    tag: '// 04',
    title: 'Tech\nStack',
    subtitle: 'tools of the trade',
    center: 4.05,
    placement: 'stone',
    stoneIndex: 2,
    details: [
      'Next.js · React · Three.js',
      'Nest.js · GraphQL · PostgreSQL',
      'Kotlin · Flutter · ASP.NET',
    ],
  },
  {
    tag: '// 05',
    title: "Let's\nTalk",
    subtitle: 'say hello',
    center: 4.82,
    placement: 'center',
    links: [
      { label: 'Email', href: 'mailto:johanespeter.jp@gmail.com' },
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/johanes-vincentius-714b311a4',
      },
      { label: 'GitHub', href: 'https://github.com/JohanesPeterV' },
    ],
  },
];

export const DIVE_LENGTH = 5;
export const DIVE_START = 0.95;
export const DIVE_EASE = 0.075;
export const WHEEL_SENSITIVITY = 1 / 850;
export const TOUCH_SENSITIVITY = 1 / 600;

const hexToRgb = (hex: string): [number, number, number] => {
  const value = parseInt(hex.slice(1), 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
};

const RAW_DESCENT_KEYS: RawDescentKey[] = [
  {
    at: 0,
    position: [0, 6.6, 16],
    look: [0, 3.4, -2],
    fog: '#c6ccd4',
    fogDensity: 0.05,
    glow: 0,
    veil: 1,
    veilColor: '#e9edf2',
  },
  {
    at: 0.3,
    position: [0, 5.1, 16],
    look: [0, 3, -1],
    fog: '#c2c8d0',
    fogDensity: 0.042,
    glow: 0,
    veil: 0,
    veilColor: '#e9edf2',
  },
  {
    at: 0.65,
    position: [0, 3.8, 16],
    look: [0, 2.6, 0],
    fog: '#b9c0c9',
    fogDensity: 0.03,
    glow: 0,
    veil: 0,
    veilColor: '#e9edf2',
  },
  {
    at: 1.7,
    position: [0, 3.8, 16],
    look: [0, 2.6, 0],
    fog: '#b3bac4',
    fogDensity: 0.032,
    glow: 0,
    veil: 0,
    veilColor: '#dfe5ec',
  },
  {
    at: 2.05,
    position: [0, 3.7, 16],
    look: [0, 2.5, 0],
    fog: '#8c99a7',
    fogDensity: 0.045,
    glow: 0,
    veil: 0.1,
    veilColor: '#141f2c',
  },
  {
    at: 2.18,
    position: [0, 3.6, 16],
    look: [0, 2.45, 0],
    fog: '#5c6d80',
    fogDensity: 0.05,
    glow: 0,
    veil: 0.7,
    veilColor: '#141f2c',
  },
  {
    at: 2.3,
    position: [0, 3.55, 16],
    look: [0, 2.4, 0],
    fog: '#3f5065',
    fogDensity: 0.05,
    glow: 0.05,
    veil: 0.35,
    veilColor: '#141f2c',
  },
  {
    at: 2.45,
    position: [0, 3.5, 16],
    look: [0, 2.4, 0],
    fog: '#33465c',
    fogDensity: 0.048,
    glow: 0.1,
    veil: 0.1,
    veilColor: '#141f2c',
  },
  {
    at: 2.6,
    position: [0, 3.5, 16],
    look: [0, 2.4, 0],
    fog: '#1e3049',
    fogDensity: 0.042,
    glow: 0.15,
    veil: 0,
    veilColor: '#141f2c',
  },
  {
    at: 4.35,
    position: [0, 3.5, 16],
    look: [0, 2.4, 0],
    fog: '#24425f',
    fogDensity: 0.05,
    glow: 0.12,
    veil: 0,
    veilColor: '#dfeefb',
  },
  {
    at: 4.52,
    position: [0, 3.65, 16],
    look: [0, 2.7, 0],
    fog: '#48688a',
    fogDensity: 0.05,
    glow: 0.2,
    veil: 0.6,
    veilColor: '#dfeefb',
  },
  {
    at: 4.64,
    position: [0, 7.6, 18.6],
    look: [0, 8.5, -5],
    fog: '#7fa3c2',
    fogDensity: 0.044,
    glow: 0.3,
    veil: 0.97,
    veilColor: '#eaf4fd',
  },
  {
    at: 4.8,
    position: [0, 10.6, 21],
    look: [0, 14, -10],
    fog: '#33597e',
    fogDensity: 0.038,
    glow: 0.34,
    veil: 0.14,
    veilColor: '#eaf4fd',
  },
  {
    at: 5,
    position: [0, 11.5, 21],
    look: [0, 15.5, -10],
    fog: '#3a5f83',
    fogDensity: 0.034,
    glow: 0.4,
    veil: 0,
    veilColor: '#eaf4fd',
  },
];

const SEAM_CENTER = 2.3;
const SEAM_SPAN = 0.55;
const FINALE_CENTER = 4.58;
const FINALE_SPAN = 0.4;

export const seamBoost = (progress: number): number => {
  return 1 - Math.min(1, Math.abs(progress - SEAM_CENTER) / SEAM_SPAN);
};

export const finaleBoost = (progress: number): number => {
  return 1 - Math.min(1, Math.abs(progress - FINALE_CENTER) / FINALE_SPAN);
};

export type NarrativeStone = {
  center: number;
  x: number;
  z: number;
};

export const NARRATIVE_STONES: NarrativeStone[] = [
  { center: 2.85, x: -1.65, z: 8 },
  { center: 3.45, x: -1.45, z: 8.4 },
  { center: 4.05, x: -1.6, z: 8.1 },
];

const NARRATIVE_STONE_CENTER_Y = 2.8;
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

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
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

export const clampProgress = (value: number): number => {
  return Math.min(DIVE_LENGTH, Math.max(0, value));
};

const WORLD_A_SETTLE_DROP = 3.2;
const WORLD_A_EXIT_START = 1.55;
const WORLD_A_EXIT_END = 2.6;
const WORLD_A_EXIT_LIFT = 46;
const WORLD_B_ENTER_AT = 2.05;
const WORLD_B_RISE_RATE = 26;

export const worldARise = (progress: number): number => {
  const settle = WORLD_A_SETTLE_DROP * (1 - smoothstep(0, 0.65, progress));
  const exit =
    smoothstep(WORLD_A_EXIT_START, WORLD_A_EXIT_END, progress) *
    WORLD_A_EXIT_LIFT;
  return exit - settle;
};

export const worldBRise = (progress: number): number => {
  return Math.max(0, progress - WORLD_B_ENTER_AT) * WORLD_B_RISE_RATE;
};

const FINALE_SUN_START = 4.45;
const FINALE_SUN_END = 4.85;

export const finaleSunLift = (progress: number): number => {
  return smoothstep(FINALE_SUN_START, FINALE_SUN_END, progress);
};

// REASON: runs every frame from the camera rig - writing into a caller-owned
// frame keeps descent sampling allocation-free instead of churning five tuples
// per frame
export const writeDescentFrame = (
  target: DescentFrame,
  progress: number,
): DescentFrame => {
  const clamped = clampProgress(progress);
  let start = DESCENT_KEYS[0];
  let end = DESCENT_KEYS[DESCENT_KEYS.length - 1];
  for (let index = 0; index < DESCENT_KEYS.length - 1; index++) {
    if (
      clamped >= DESCENT_KEYS[index].at &&
      clamped <= DESCENT_KEYS[index + 1].at
    ) {
      start = DESCENT_KEYS[index];
      end = DESCENT_KEYS[index + 1];
      break;
    }
  }
  const span = Math.max(0.0001, end.at - start.at);
  const t = smoothstep(0, 1, (clamped - start.at) / span);
  writeTriple(target.position, start.position, end.position, t);
  writeTriple(target.look, start.look, end.look, t);
  writeTriple(target.fogColor, start.fogColor, end.fogColor, t);
  writeTriple(target.veilColor, start.veilColor, end.veilColor, t);
  target.fogDensity = lerp(start.fogDensity, end.fogDensity, t);
  target.glow = lerp(start.glow, end.glow, t);
  target.veil = lerp(start.veil, end.veil, t);
  return target;
};

export const sectionMotion = (
  progress: number,
  section: DiveSection,
): SectionMotion => {
  if (section.placement === 'stone') {
    const fadeIn = smoothstep(
      section.center - 0.26,
      section.center - 0.16,
      progress,
    );
    const fadeOut =
      1 - smoothstep(section.center + 0.16, section.center + 0.26, progress);
    return { opacity: fadeIn * fadeOut, shift: 0, blur: 0 };
  }
  const delta = progress - section.center;
  const distance = Math.abs(delta);
  return {
    opacity: 1 - smoothstep(0.22, 0.52, distance),
    shift: -delta * 110,
    blur: smoothstep(0.16, 0.5, distance) * 7,
  };
};

export const railProximity = (progress: number, center: number): number => {
  return 1 - Math.min(1, Math.abs(progress - center) / 0.6);
};

export type DiveTuning = {
  aberrationScale: number;
  fovRush: number;
  snowSize: number;
  transitionScale: number;
};

export const DIVE_TUNING: DiveTuning = {
  aberrationScale: 1,
  fovRush: 1,
  snowSize: 3,
  transitionScale: 1,
};

export const transitionStrength = (velocity: number): number => {
  return Math.min(1, Math.abs(velocity) * 34) * DIVE_TUNING.transitionScale;
};

export const aberrationStrength = (velocity: number): number => {
  const base = Math.min(0.007, 0.0011 + Math.abs(velocity) * 0.055);
  return base * DIVE_TUNING.aberrationScale;
};

export const rushFov = (velocity: number): number => {
  return 58 + Math.min(20, Math.abs(velocity) * 520) * DIVE_TUNING.fovRush;
};

export const depthMeters = (progress: number): number => {
  return Math.max(0, Math.round(progress * 32));
};
