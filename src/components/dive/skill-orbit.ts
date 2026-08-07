import { Camera, Euler, Vector2, Vector3 } from 'three';

import { TECHNOLOGIES } from '@/app/_components/technologies/technologies';

import { TECH_STONE, narrativeStoneY } from './descent';

export type SkillOrbitEntry = {
  label: string;
  kind: 'category' | 'skill';
  ring: number;
  angle: number;
};

export type SkillOrbitRing = {
  radius: number;
  spin: number;
  tilt: [number, number];
  u: Vector3;
  v: Vector3;
  depthSpan: number;
};

type SkillOrbit = {
  entries: SkillOrbitEntry[];
  rings: SkillOrbitRing[];
};

export type SkillScreenWrite = {
  camera: Camera;
  depths: Float32Array;
  height: number;
  progress: number;
  screens: Vector2[];
  width: number;
};

const RING_BASE_RADIUS = 1.5;
const RING_RADIUS_PER_ITEM = 0.031;
const RING_PHASE_STEP = 0.85;
const SPIN_BASE = 1.5;
const SPIN_STEP = 0.24;
// REASON: the headline column starts right of the stone - nudging the orbit
// centre left keeps side-profile words out of the caption text
const SKILL_ORBIT_BIAS_X = -0.22;
// REASON: hand-picked inclinations keep the five rings off a shared plane so
// the stack reads as one word sphere instead of stacked discs
const RING_TILTS: [number, number][] = [
  [0.38, -0.3],
  [-0.34, 0.24],
  [0.16, 0.48],
  [-0.46, -0.18],
  [0.28, 0.36],
];

const buildRing = (index: number, itemCount: number): SkillOrbitRing => {
  const tilt = RING_TILTS[index % RING_TILTS.length];
  const rotation = new Euler(tilt[0], tilt[1], 0);
  const u = new Vector3(1, 0, 0).applyEuler(rotation);
  const v = new Vector3(0, 1, 0).applyEuler(rotation);
  const radius = RING_BASE_RADIUS + itemCount * RING_RADIUS_PER_ITEM;
  const direction = index % 2 === 0 ? 1 : -1;
  return {
    radius,
    spin: direction * (SPIN_BASE + index * SPIN_STEP),
    tilt,
    u,
    v,
    depthSpan: radius * Math.hypot(u.z, v.z),
  };
};

const buildSkillOrbit = (): SkillOrbit => {
  const entries: SkillOrbitEntry[] = [];
  const rings: SkillOrbitRing[] = [];
  TECHNOLOGIES.forEach((technology, ringIndex) => {
    const labels = [
      technology.category,
      ...technology.contents.map((content) => content.name),
    ];
    rings.push(buildRing(ringIndex, labels.length));
    labels.forEach((label, itemIndex) => {
      entries.push({
        label,
        kind: itemIndex === 0 ? 'category' : 'skill',
        ring: ringIndex,
        angle:
          ringIndex * RING_PHASE_STEP +
          (itemIndex / labels.length) * Math.PI * 2,
      });
    });
  });
  return { entries, rings };
};

const SKILL_ORBIT = buildSkillOrbit();

export const SKILL_ORBIT_ENTRIES = SKILL_ORBIT.entries;
export const SKILL_ORBIT_RINGS = SKILL_ORBIT.rings;

export type SkillOrbitPlacement = {
  scale: number;
  x: number;
  y: number;
};

const MIN_ORBIT_SCALE = 0.58;
const ORBIT_SCALE_PER_ASPECT = 0.82;
const PORTRAIT_BLEND_START = 0.7;
const PORTRAIT_BLEND_SPAN = 0.5;
const PORTRAIT_CENTER_X = 0.1;
const PORTRAIT_DROP_Y = -2.3;

// REASON: the stone sits nearly off-screen on portrait viewports - the orbit
// detaches from it there and re-centres below the headline instead of clipping
export const skillOrbitPlacement = (aspect: number): SkillOrbitPlacement => {
  const blend = Math.min(
    1,
    Math.max(0, (aspect - PORTRAIT_BLEND_START) / PORTRAIT_BLEND_SPAN),
  );
  return {
    scale: Math.min(
      1,
      Math.max(MIN_ORBIT_SCALE, aspect * ORBIT_SCALE_PER_ASPECT),
    ),
    x:
      (TECH_STONE.x + SKILL_ORBIT_BIAS_X) * blend +
      PORTRAIT_CENTER_X * (1 - blend),
    y: PORTRAIT_DROP_Y * (1 - blend),
  };
};

export const writeSkillLocalPosition = (
  index: number,
  progress: number,
  target: Vector3,
): Vector3 => {
  const entry = SKILL_ORBIT_ENTRIES[index];
  const ring = SKILL_ORBIT_RINGS[entry.ring];
  const theta = entry.angle + progress * ring.spin;
  return target
    .copy(ring.u)
    .multiplyScalar(Math.cos(theta) * ring.radius)
    .addScaledVector(ring.v, Math.sin(theta) * ring.radius);
};

const localVector = new Vector3();

export const writeSkillScreens = (write: SkillScreenWrite): void => {
  const placement = skillOrbitPlacement(write.width / write.height);
  const centerY =
    narrativeStoneY(write.progress, TECH_STONE.center) + placement.y;
  SKILL_ORBIT_ENTRIES.forEach((entry, index) => {
    writeSkillLocalPosition(index, write.progress, localVector);
    write.depths[index] =
      localVector.z / SKILL_ORBIT_RINGS[entry.ring].depthSpan;
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
