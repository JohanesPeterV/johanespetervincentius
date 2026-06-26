// REASON: shared so every body (AI marks + MacBook) revolves on one ring around the card as a single system
export const ORBIT_RADIUS = 2.5;
export const ORBIT_SPEED = 0.06;

const VISIBLE_HALF_HEIGHT = 3.75;
const EDGE_GAP = 0.5;
const MIN_SCALE = 0.5;

export const getOrbitScale = (aspect: number): number => {
  const available = VISIBLE_HALF_HEIGHT * aspect - EDGE_GAP;
  return Math.min(1, Math.max(MIN_SCALE, available / ORBIT_RADIUS));
};

export const getRingPosition = (
  angle: number,
  height: number,
): [number, number, number] => {
  return [
    Math.cos(angle) * ORBIT_RADIUS,
    height,
    Math.sin(angle) * ORBIT_RADIUS,
  ];
};
