import type { Vector3 } from 'three';

// REASON: bodies circle the camera's rest position, so from the screen POV they sweep past the centred card instead of visibly orbiting a point ahead of it
export const ORBIT_CENTER: readonly [number, number, number] = [0, 0, 8];

export type OrbitPath = {
  phase: number;
  radius: number;
  height: number;
  speed: number;
};

// REASON: irregular phases, radii, and per-lane speeds keep the lanes drifting in and out of view together instead of filing past the card one at a time
export const AGENT_ORBIT_PATHS: readonly OrbitPath[] = [
  { phase: 0.3, radius: 13.2, height: 1.1, speed: 0.085 },
  { phase: 1.1, radius: 10.6, height: -1.2, speed: 0.128 },
  { phase: 3.2, radius: 14.8, height: 0.5, speed: 0.062 },
  { phase: 4.9, radius: 11.8, height: -0.7, speed: 0.104 },
];

// REASON: writes into a caller-owned Vector3 so the per-frame orbit loops on the
// landing page allocate nothing instead of churning a fresh tuple every frame
export const writeOrbitPosition = (
  path: OrbitPath,
  elapsedTime: number,
  target: Vector3,
): Vector3 => {
  const angle = path.phase + elapsedTime * path.speed;
  return target.set(
    ORBIT_CENTER[0] + Math.sin(angle) * path.radius,
    ORBIT_CENTER[1] + path.height,
    ORBIT_CENTER[2] - Math.cos(angle) * path.radius,
  );
};
