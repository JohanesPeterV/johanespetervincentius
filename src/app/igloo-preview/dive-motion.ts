export type DiveScreen = {
  tag: string;
  title: string;
  subtitle: string;
  accent: string;
  ambientRgb: [number, number, number];
};

export const DIVE_SCREENS: DiveScreen[] = [
  {
    tag: '// 01',
    title: 'Johanes Peter\nVincentius',
    subtitle: 'scroll to dive',
    accent: 'text-sky-200/60',
    ambientRgb: [56, 189, 248],
  },
  {
    tag: '// 02',
    title: 'Work\nExperience',
    subtitle: '2020 — present',
    accent: 'text-cyan-200/60',
    ambientRgb: [34, 211, 238],
  },
  {
    tag: '// 03',
    title: 'Selected\nProjects',
    subtitle: 'a few things built',
    accent: 'text-indigo-200/60',
    ambientRgb: [129, 140, 248],
  },
  {
    tag: '// 04',
    title: 'Tech\nStack',
    subtitle: 'tools of the trade',
    accent: 'text-emerald-200/60',
    ambientRgb: [52, 211, 153],
  },
  {
    tag: '// 05',
    title: "Let's\nTalk",
    subtitle: 'say hello',
    accent: 'text-rose-200/60',
    ambientRgb: [251, 113, 133],
  },
];

export const DIVE_EASE = 0.1;
export const WHEEL_SENSITIVITY = 1 / 520;
export const TOUCH_SENSITIVITY = 1 / 380;

type ScreenMotion = {
  transform: string;
  opacity: string;
  filter: string;
  dive: string;
};

type OverlayMotion = {
  opacity: string;
  transform: string;
};

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

export const wrapDistance = (
  progress: number,
  index: number,
  count: number,
): number => {
  let distance = progress - index;
  distance -= count * Math.round(distance / count);
  return distance;
};

export const computeScreenMotion = (distance: number): ScreenMotion | null => {
  if (distance >= 0 && distance <= 1) {
    return {
      transform: `translateZ(${distance * 600}px) scale(${1 + distance * 0.7})`,
      opacity: String(1 - smoothstep(0.2, 0.58, distance)),
      filter: `blur(${distance * 7}px)`,
      dive: String(distance),
    };
  }
  if (distance < 0 && distance > -1) {
    const incoming = 1 + distance;
    return {
      transform: `translateZ(${-780 * (1 - incoming)}px) scale(${0.5 + incoming * 0.5})`,
      opacity: String(smoothstep(0.42, 0.92, incoming)),
      filter: `blur(${(1 - incoming) * 9}px)`,
      dive: String(distance),
    };
  }
  return null;
};

export const aberrationShadow = (velocity: number): string => {
  const offset = Math.min(14, Math.abs(velocity) * 240);
  if (offset < 0.15) {
    return 'none';
  }
  const alpha = Math.min(0.85, 0.2 + offset * 0.06);
  return `${-offset}px 0 rgba(255, 70, 150, ${alpha}), ${offset}px 0 rgba(90, 210, 255, ${alpha})`;
};

export const rushTransform = (velocity: number): string => {
  const stretch = Math.min(0.12, Math.abs(velocity) * 1.6);
  const shift = Math.max(-28, Math.min(28, -velocity * 380));
  return `translateY(${shift}px) scaleY(${1 + stretch})`;
};

export const streakMotion = (
  progress: number,
  velocity: number,
): OverlayMotion => {
  const energy = Math.min(1, Math.abs(velocity) * 26);
  return {
    opacity: String(energy * energy * 0.45),
    transform: `rotate(${progress * 36}deg) scale(${1 + energy * 0.35})`,
  };
};

export const shimmerOpacity = (progress: number): string => {
  const local = progress - Math.floor(progress);
  const energy = 1 - Math.abs(2 * local - 1);
  return String(energy * energy * 0.7);
};

export const ambientBackground = (progress: number): string => {
  const count = DIVE_SCREENS.length;
  const wrapped = ((progress % count) + count) % count;
  const local = wrapped - Math.floor(wrapped);
  const from = DIVE_SCREENS[Math.floor(wrapped) % count].ambientRgb;
  const to = DIVE_SCREENS[(Math.floor(wrapped) + 1) % count].ambientRgb;
  const red = Math.round(from[0] + (to[0] - from[0]) * local);
  const green = Math.round(from[1] + (to[1] - from[1]) * local);
  const blue = Math.round(from[2] + (to[2] - from[2]) * local);
  return `radial-gradient(ellipse 130% 90% at 50% 116%, rgba(${red}, ${green}, ${blue}, 0.2), transparent 62%), radial-gradient(ellipse 100% 60% at 50% -12%, rgba(${red}, ${green}, ${blue}, 0.1), transparent 55%)`;
};

export const railProximity = (progress: number, index: number): number => {
  const count = DIVE_SCREENS.length;
  return 1 - Math.min(1, Math.abs(wrapDistance(progress, index, count)));
};

export const grainShift = (progress: number): string => {
  return `${(progress * 137) % 128}px ${(progress * 89) % 128}px`;
};
