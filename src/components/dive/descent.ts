import { RAW_DESCENT_KEYS } from './descent-keys';

type DiveSectionLink = {
  label: string;
  href: string;
};

type DiveSectionBase = {
  tag: string;
  title: string;
  subtitle: string;
  center: number;
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

type SectionMotion = {
  opacity: number;
  shift: number;
};

type DescentKey = DescentFrame & { at: number };

export const TECH_STONE = { center: 3.15, x: -1.6, z: 8.1 };
const TECH_DWELL_HALF = 0.3;

export const WORK_STONE = { center: 1.95, x: -1.65, z: 8 };

type DiveWorkJob = {
  label: string;
  description: string;
  showcases: string[];
};

export const WORK_JOBS: DiveWorkJob[] = [
  {
    label: 'Smilie — Lead Software Engineer · 2025—now',
    description: `Own technical direction end-to-end — architecture, database design, deployment, and reliability — across multi-product systems for corporate gifting, digital rewards, and e-commerce. Drive vendor integrations, partner with the Founder on platform strategy, and build AI-assisted workflows that let a lean team ship like a larger one.`,
    showcases: [
      'Corporate Gifting Platform',
      'Digital Rewards',
      'AI-Assisted Workflows',
    ],
  },
  {
    label: 'TableLink — Full-stack Developer · 2025',
    description: `Delivered core venue SaaS workflows — QR ordering, dynamic menus, and real-time guest operations — and standardized frontend architecture across Next.js/Vite apps with reusable components and Storybook. Built shared real-time data infrastructure for synchronized live updates while cutting technical debt across a microservices stack.`,
    showcases: [
      'QR Ordering',
      'Live Guest Operations',
      'Shared Component Library',
    ],
  },
  {
    label: 'Farmio — Software Engineer · 2023—2024',
    description: `Shipped one of the team's first LLM-in-production features — a GPT-3.5 + WhatsApp integration that turned free-form chats into structured orders. Built the Agent Portal end-to-end from auth to UI, moved checkout pricing server-side to guarantee price integrity, and standardized i18n across three locales.`,
    showcases: ['WhatsApp Order Bot', 'Agent Portal', 'Server-Side Checkout'],
  },
  {
    label: 'Software Lab Center, Binus · 2020—2024',
    description: `Maintained the practicum database serving ~20,000 students per semester and an ASP.NET app used by 161 staff, and built full-stack tools with Next.js and Nest.js for practicum operations. Earlier, taught programming-based classes to 1,700+ students and shipped Vue.js/ASP.NET features for an internal app with 5,293 users.`,
    showcases: [
      'Practicum Operations Tools',
      'Practicum Database',
      'Staff Application',
    ],
  },
];

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
    placement: 'stone',
    stoneIndex: 0,
    ...WORK_STONE,
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

export const seamTransitionProgress = (progress: number): number =>
  Math.max(
    0,
    Math.min(1, (progress - SEAM_CENTER + SEAM_SPAN) / (SEAM_SPAN * 2)),
  );

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

export const wrapProgress = (value: number): number =>
  ((value % DIVE_LENGTH) + DIVE_LENGTH) % DIVE_LENGTH;

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

const TECH_FADE_SPAN = 0.18;

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
    opacity: 1 - smootherstep(0.22, 0.52, distance),
    shift: -delta * 110,
  };
};

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
