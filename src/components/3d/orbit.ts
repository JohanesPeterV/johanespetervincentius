// REASON: shared so the AI marks and the MacBook revolve on one ring around the card instead of as separate systems
export const ORBIT_RADIUS = 2.5;
export const ORBIT_SPEED = 0.06;

const VISIBLE_HALF_HEIGHT = 3.75;
const EDGE_GAP = 0.5;

export const getOrbitRadius = (aspect: number): number => {
  return Math.min(ORBIT_RADIUS, VISIBLE_HALF_HEIGHT * aspect - EDGE_GAP);
};
