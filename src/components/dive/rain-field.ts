import { createSeededRandom } from './world-layout';

type Drop = {
  seed: number;
  spawn: number;
  x: number;
  z: number;
};

export type QuadField = {
  corners: Float32Array;
  indices: Uint16Array;
  origins: Float32Array;
  seeds: Float32Array;
};

// REASON: rain reads calm because it is a dense field of faint drops, not a
// handful of bright ones - a sparse field turns every streak into an object
// the eye tracks individually, which is what made it look like a meteor shower
const RAIN_COUNT = 700;
const FALL_SPAN = 24;
const FIELD_WIDTH = 84;
const FIELD_NEAR_Z = 18;
const FIELD_DEPTH = 56;
const MID_SLANT = 0.12;
const RIPPLE_LIMIT = 24;
const RIPPLE_MAX_X = 14;
const RIPPLE_NEAR_Z = 2;
const RIPPLE_FAR_Z = -30;

const QUAD_CORNERS = [-1, -1, 1, -1, -1, 1, 1, 1];
const QUAD_INDICES = [0, 1, 2, 2, 1, 3];

// REASON: the streaks and the splash rings must resolve the same drop to the
// same place at the same instant, so speed and wind live in one snippet that
// both shaders paste in verbatim
export const DROP_MOTION = `
const float FALL_SPAN = ${FALL_SPAN.toFixed(1)};

float dropSpeed(float seed) {
  return 8.0 + seed * 5.0;
}

float dropSlant(float time) {
  return 0.07 + (sin(time * 0.19) * 0.5 + 0.5) * 0.1;
}

float dropFall(float spawn, float time, float speed) {
  return mod(spawn - time * speed, FALL_SPAN);
}
`;

const buildDrops = (): Drop[] => {
  const random = createSeededRandom(113);
  const drops: Drop[] = [];
  for (let index = 0; index < RAIN_COUNT; index++) {
    drops.push({
      x: (random() - 0.5) * FIELD_WIDTH,
      spawn: random() * FALL_SPAN,
      z: FIELD_NEAR_Z - random() * FIELD_DEPTH,
      seed: random(),
    });
  }
  return drops;
};

const buildQuadField = (drops: Drop[]): QuadField => {
  const origins = new Float32Array(drops.length * 12);
  const corners = new Float32Array(drops.length * 8);
  const seeds = new Float32Array(drops.length * 4);
  const indices = new Uint16Array(drops.length * 6);
  drops.forEach((drop, quad) => {
    for (let corner = 0; corner < 4; corner++) {
      const vertex = quad * 4 + corner;
      origins[vertex * 3] = drop.x;
      origins[vertex * 3 + 1] = drop.spawn;
      origins[vertex * 3 + 2] = drop.z;
      corners[vertex * 2] = QUAD_CORNERS[corner * 2];
      corners[vertex * 2 + 1] = QUAD_CORNERS[corner * 2 + 1];
      seeds[vertex] = drop.seed;
    }
    for (let step = 0; step < 6; step++) {
      indices[quad * 6 + step] = quad * 4 + QUAD_INDICES[step];
    }
  });
  return { corners, indices, origins, seeds };
};

const DROPS = buildDrops();

export const RAIN_FIELD = buildQuadField(DROPS);

// REASON: a ring is only ever built from a drop that lands inside the view
// cone - the two failures are not symmetric, a landing with no ring is
// invisible but a ring with no landing is what read as broken
const landsInView = (drop: Drop): boolean =>
  Math.abs(drop.x - MID_SLANT * FALL_SPAN) < RIPPLE_MAX_X &&
  drop.z < RIPPLE_NEAR_Z &&
  drop.z > RIPPLE_FAR_Z;

export const RIPPLE_FIELD = buildQuadField(
  DROPS.filter(landsInView).slice(0, RIPPLE_LIMIT),
);
