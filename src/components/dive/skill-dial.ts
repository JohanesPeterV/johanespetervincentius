import { Camera, Vector2, Vector3 } from 'three';

import { TECHNOLOGIES } from '@/app/_components/technologies/technologies';

import { TECH_CATEGORY_CENTERS, TECH_STONE, narrativeStoneY } from './descent';

export type SkillDialEntry = {
  label: string;
  category: number;
  slot: number;
  count: number;
};

export type SkillDialCategory = {
  name: string;
  count: number;
};

export type SkillDialPlacement = {
  scale: number;
  x: number;
  y: number;
};

export type SkillDialWrite = {
  alphas: Float32Array;
  camera: Camera;
  height: number;
  progress: number;
  screens: Vector2[];
  width: number;
};

export const DIAL_RADIUS = 1.75;
export const DIAL_TILT = 0.14;
const WORD_HALO_NEAR = 0.34;
const WORD_HALO_FAR = 0.72;
// REASON: eighteen labels on one circle collide - alternating two halo
// distances doubles the effective spacing for crowded categories
const ALTERNATE_MIN_COUNT = 13;
const DIAL_ROTATE_RATE = 2.2;
const ALPHA_PLATEAU = 0.03;
const ALPHA_FADE = 0.06;

export const SKILL_DIAL_CATEGORIES: SkillDialCategory[] = TECHNOLOGIES.map(
  (technology) => ({
    name: technology.category,
    count: technology.contents.length,
  }),
);

export const SKILL_DIAL_ENTRIES: SkillDialEntry[] = TECHNOLOGIES.flatMap(
  (technology, categoryIndex) =>
    technology.contents.map((content, slot) => ({
      label: content.name,
      category: categoryIndex,
      slot,
      count: technology.contents.length,
    })),
);

export const categoryAlpha = (progress: number, category: number): number => {
  const distance = Math.abs(progress - TECH_CATEGORY_CENTERS[category]);
  return 1 - Math.min(1, Math.max(0, (distance - ALPHA_PLATEAU) / ALPHA_FADE));
};

export const activeCategoryIndex = (progress: number): number => {
  let best = 0;
  TECH_CATEGORY_CENTERS.forEach((center, index) => {
    const bestDistance = Math.abs(progress - TECH_CATEGORY_CENTERS[best]);
    if (Math.abs(progress - center) < bestDistance) {
      best = index;
    }
  });
  return best;
};

const MIN_DIAL_SCALE = 0.58;
const DIAL_SCALE_PER_ASPECT = 0.82;
const PORTRAIT_BLEND_START = 0.7;
const PORTRAIT_BLEND_SPAN = 0.5;
const PORTRAIT_CENTER_X = 0.1;
const PORTRAIT_DROP_Y = -2.3;
// REASON: the headline column starts right of the stone - nudging the dial
// centre left keeps three-o-clock words out of the caption text
const DIAL_BIAS_X = -0.32;

// REASON: the stone sits nearly off-screen on portrait viewports - the dial
// detaches from it there and re-centres below the headline instead of clipping
export const skillDialPlacement = (aspect: number): SkillDialPlacement => {
  const blend = Math.min(
    1,
    Math.max(0, (aspect - PORTRAIT_BLEND_START) / PORTRAIT_BLEND_SPAN),
  );
  return {
    scale: Math.min(
      1,
      Math.max(MIN_DIAL_SCALE, aspect * DIAL_SCALE_PER_ASPECT),
    ),
    x: (TECH_STONE.x + DIAL_BIAS_X) * blend + PORTRAIT_CENTER_X * (1 - blend),
    y: PORTRAIT_DROP_Y * (1 - blend),
  };
};

const slotTheta = (entry: SkillDialEntry, progress: number): number =>
  Math.PI / 2 -
  (entry.slot / entry.count) * Math.PI * 2 +
  (progress - TECH_STONE.center) * DIAL_ROTATE_RATE;

const setRingPoint = (
  target: Vector3,
  theta: number,
  radius: number,
): Vector3 =>
  target.set(
    Math.cos(theta) * radius,
    Math.sin(theta) * radius * Math.cos(DIAL_TILT),
    Math.sin(theta) * radius * Math.sin(DIAL_TILT),
  );

export const writeSkillNodeLocal = (
  index: number,
  progress: number,
  target: Vector3,
): Vector3 => {
  const entry = SKILL_DIAL_ENTRIES[index];
  return setRingPoint(target, slotTheta(entry, progress), DIAL_RADIUS);
};

const wordRadius = (entry: SkillDialEntry): number => {
  if (entry.count >= ALTERNATE_MIN_COUNT && entry.slot % 2 === 1) {
    return DIAL_RADIUS + WORD_HALO_FAR;
  }
  return DIAL_RADIUS + WORD_HALO_NEAR;
};

const localVector = new Vector3();

export const writeSkillDialScreens = (write: SkillDialWrite): void => {
  const placement = skillDialPlacement(write.width / write.height);
  const centerY =
    narrativeStoneY(write.progress, TECH_STONE.center) + placement.y;
  SKILL_DIAL_ENTRIES.forEach((entry, index) => {
    const alpha = categoryAlpha(write.progress, entry.category);
    write.alphas[index] = alpha;
    if (alpha <= 0) {
      return;
    }
    setRingPoint(
      localVector,
      slotTheta(entry, write.progress),
      wordRadius(entry),
    );
    localVector.multiplyScalar(placement.scale);
    localVector.x += placement.x;
    localVector.y += centerY;
    localVector.z += TECH_STONE.z;
    localVector.project(write.camera);
    write.screens[index].set(
      ((localVector.x + 1) * write.width) / 2,
      ((1 - localVector.y) * write.height) / 2,
    );
  });
};
