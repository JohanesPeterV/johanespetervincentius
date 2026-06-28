// REASON: bodies circle the camera's rest position, so from the screen POV they sweep past the centred card instead of visibly orbiting a point ahead of it
export const ORBIT_CENTER: readonly [number, number, number] = [0, 0, 8];
export const ORBIT_SPEED = 0.1;

export type OrbitPath = {
  phase: number;
  radius: number;
  height: number;
};

// REASON: single source of truth for the agent lanes so the orbiting logos and the comm streams that feed them stay aligned
export const AGENT_ORBIT_PATHS: readonly OrbitPath[] = [
  { phase: 0, radius: 9, height: 1 },
  { phase: 1.26, radius: 8.4, height: -0.9 },
  { phase: 2.51, radius: 9.6, height: 0.5 },
  { phase: 3.77, radius: 8.8, height: -1.3 },
];

export const getOrbitPosition = (
  path: OrbitPath,
  elapsedTime: number,
): [number, number, number] => {
  const angle = path.phase + elapsedTime * ORBIT_SPEED;
  return [
    ORBIT_CENTER[0] + Math.sin(angle) * path.radius,
    ORBIT_CENTER[1] + path.height,
    ORBIT_CENTER[2] - Math.cos(angle) * path.radius,
  ];
};
