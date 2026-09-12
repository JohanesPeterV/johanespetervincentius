import { STACK } from '@/app/_components/stack';

export type OrbitalSystem = {
  name: string;
  x: number;
  y: number;
  rise: number;
  radius: number;
  period: number;
};

export type CoreBody = {
  name: string;
  x: number;
  y: number;
  phase: number;
};

export type SatelliteBody = {
  name: string;
  system: number;
  phase: number;
  scale: number;
};

export type DrifterBody = {
  name: string;
  y: number;
  z: number;
  period: number;
  phase: number;
  direction: number;
  scale: number;
};

type SystemSlot = { x: number; y: number; tilt: 1 | -1 };

// REASON: offsets are from the chapter stone; the two busiest groups take the
// upper row, the three small ones the lower, and each ring grows with its
// count. Rows above the camera lean their near side up and rows below lean it
// down, so perspective opens every ring instead of flattening the lower row
const SYSTEM_SLOTS: SystemSlot[] = [
  { x: -3.4, y: 0.3, tilt: 1 },
  { x: 3.4, y: 0.3, tilt: 1 },
  { x: -4, y: -3.1, tilt: -1 },
  { x: 0, y: -3.1, tilt: -1 },
  { x: 4, y: -3.1, tilt: -1 },
];
const CORE_SPREAD = 1;
const ORBIT_RISE = 0.7;
export const ORBIT_DEPTH = 0.9;
export const TAU = Math.PI * 2;

export const SYSTEMS: OrbitalSystem[] = STACK.groups.map((group, index) => {
  const slot = SYSTEM_SLOTS[index];
  if (!slot) {
    throw new Error(`No orbital slot for stack group ${group.core.join(' ')}`);
  }
  return {
    name: group.core.join(' '),
    x: slot.x,
    y: slot.y,
    rise: slot.tilt * ORBIT_RISE,
    radius: 0.8 + group.satellites.length * 0.09,
    period: (36 + index * 6) * (index % 2 === 0 ? 1 : -1),
  };
});

export const CORES: CoreBody[] = STACK.groups.flatMap((group, groupIndex) =>
  group.core.map((name, index) => ({
    name,
    x:
      SYSTEMS[groupIndex].x +
      (2 * index - (group.core.length - 1)) * CORE_SPREAD,
    // REASON: cores sit between the ring's centre line and its near apex so
    // the satellites passing the ring's sides clear the core labels
    y: SYSTEMS[groupIndex].y + SYSTEMS[groupIndex].rise * 0.5,
    phase: groupIndex * 1.7 + index * 0.9,
  })),
);

export const SATELLITES: SatelliteBody[] = STACK.groups.flatMap(
  (group, groupIndex) =>
    group.satellites.map((name, index) => ({
      name,
      system: groupIndex,
      phase: (index / group.satellites.length) * TAU,
      scale: 0.13 + (index % 3) * 0.02,
    })),
);

export const DRIFTERS: DrifterBody[] = STACK.drifters.map((name, index) => ({
  name,
  y: -5.4 + (index / (STACK.drifters.length - 1)) * 7.8,
  z: -1 + ((index * 3) % 5) * 0.5,
  period: 40 + ((index * 11) % 30),
  phase: (index * 0.37) % 1,
  direction: index % 2 === 0 ? 1 : -1,
  scale: 0.13 + ((index * 5) % 4) * 0.02,
}));
