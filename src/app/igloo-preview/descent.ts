export type DiveSectionLink = {
  label: string;
  href: string;
};

export type DiveSection = {
  tag: string;
  title: string;
  subtitle: string;
  center: number;
  details?: string[];
  links?: DiveSectionLink[];
};

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
  },
  {
    tag: '// 02',
    title: 'Work\nExperience',
    subtitle: '2020 — present',
    center: 2.85,
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

const SURFACE_HEIGHT = 2;

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
    position: [0, 36, 16],
    look: [0, 20, -30],
    fog: '#c6ccd4',
    fogDensity: 0.05,
    glow: 0,
    veil: 1,
    veilColor: '#e9edf2',
  },
  {
    at: 0.3,
    position: [0, 24, 16],
    look: [0, 12, -25],
    fog: '#c2c8d0',
    fogDensity: 0.042,
    glow: 0,
    veil: 0,
    veilColor: '#e9edf2',
  },
  {
    at: 1,
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
    position: [0, 2.4, 16],
    look: [0, 1.6, 0],
    fog: '#b3bac4',
    fogDensity: 0.032,
    glow: 0,
    veil: 0,
    veilColor: '#dfe5ec',
  },
  {
    at: 2.05,
    position: [0, 0.8, 16],
    look: [0, -2, 6],
    fog: '#8c99a7',
    fogDensity: 0.045,
    glow: 0,
    veil: 0.1,
    veilColor: '#141f2c',
  },
  {
    at: 2.18,
    position: [0, -1, 16],
    look: [0, -8, 10],
    fog: '#5c6d80',
    fogDensity: 0.05,
    glow: 0,
    veil: 0.7,
    veilColor: '#141f2c',
  },
  {
    at: 2.3,
    position: [0, -3, 16],
    look: [0, -13, 14],
    fog: '#3f5065',
    fogDensity: 0.05,
    glow: 0.05,
    veil: 0.35,
    veilColor: '#141f2c',
  },
  {
    at: 2.6,
    position: [0, -9, 16],
    look: [0, -19, 15],
    fog: '#2b4157',
    fogDensity: 0.045,
    glow: 0.15,
    veil: 0,
    veilColor: '#141f2c',
  },
  {
    at: 3.4,
    position: [0, -26, 16],
    look: [0, -37, 15.5],
    fog: '#1e3049',
    fogDensity: 0.042,
    glow: 0.4,
    veil: 0,
    veilColor: '#141f2c',
  },
  {
    at: 4.3,
    position: [0, -47, 16],
    look: [0, -59, 15.7],
    fog: '#2f4a66',
    fogDensity: 0.045,
    glow: 0.85,
    veil: 0,
    veilColor: '#141f2c',
  },
  {
    at: 4.8,
    position: [0, -60, 16],
    look: [0, -72, 16],
    fog: '#9cc0dd',
    fogDensity: 0.075,
    glow: 1,
    veil: 0.4,
    veilColor: '#eaf2f9',
  },
  {
    at: 5,
    position: [0, -66, 16],
    look: [0, -78, 16],
    fog: '#c9dcec',
    fogDensity: 0.09,
    glow: 1,
    veil: 0.62,
    veilColor: '#eaf2f9',
  },
];

const SEAM_CENTER = 2.3;
const SEAM_SPAN = 0.55;

export const seamBoost = (progress: number): number => {
  return 1 - Math.min(1, Math.abs(progress - SEAM_CENTER) / SEAM_SPAN);
};

export type DiveLandmark = {
  at: number;
  position: [number, number, number];
};

export const DIVE_LANDMARKS: DiveLandmark[] = [
  { at: 2.45, position: [2.4, -7, 14.6] },
  { at: 3.15, position: [-2.6, -23, 17.2] },
  { at: 3.75, position: [2.2, -34, 14.9] },
  { at: 4.44, position: [-2.3, -50.5, 17] },
];

const LANDMARK_SPAN = 0.3;

export const landmarkDip = (progress: number): number => {
  let dip = 0;
  for (const landmark of DIVE_LANDMARKS) {
    dip = Math.max(
      dip,
      1 - Math.min(1, Math.abs(progress - landmark.at) / LANDMARK_SPAN),
    );
  }
  return dip;
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

const lerpTriple = (
  from: [number, number, number],
  to: [number, number, number],
  t: number,
): [number, number, number] => {
  return [
    lerp(from[0], to[0], t),
    lerp(from[1], to[1], t),
    lerp(from[2], to[2], t),
  ];
};

export const clampProgress = (value: number): number => {
  return Math.min(DIVE_LENGTH, Math.max(0, value));
};

export const sampleDescent = (progress: number): DescentFrame => {
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
  return {
    position: lerpTriple(start.position, end.position, t),
    look: lerpTriple(start.look, end.look, t),
    fogColor: lerpTriple(start.fogColor, end.fogColor, t),
    fogDensity: lerp(start.fogDensity, end.fogDensity, t),
    glow: lerp(start.glow, end.glow, t),
    veil: lerp(start.veil, end.veil, t),
    veilColor: lerpTriple(start.veilColor, end.veilColor, t),
  };
};

export const sectionMotion = (
  progress: number,
  center: number,
): SectionMotion => {
  const delta = progress - center;
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

export const depthMeters = (cameraY: number): number => {
  return Math.max(0, Math.round((SURFACE_HEIGHT - cameraY) * 2.4));
};
