export type BlockTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  shade: number;
};

const RISING_STONE_COUNT = 18;
const CAMERA_DISTANCE_Z = 16;
const FIELD_MIN_AZIMUTH = 0.55;
const FIELD_MAX_AZIMUTH = 0.78;
const FIELD_MIN_DISTANCE = 10.5;
const FIELD_DISTANCE_SPREAD = 13.5;

type FieldSlot = {
  x: number;
  z: number;
  distance: number;
};

// REASON: the peripheral field must frame the narrative stones, never cross
// them - slots live in two side curtains outside the central view column,
// sized by distance so nothing looms into the lens
const sampleFieldSlot = (random: () => number, side: 1 | -1): FieldSlot => {
  const azimuth =
    FIELD_MIN_AZIMUTH + random() * (FIELD_MAX_AZIMUTH - FIELD_MIN_AZIMUTH);
  const distance = FIELD_MIN_DISTANCE + random() * FIELD_DISTANCE_SPREAD;
  return {
    x: Math.sin(azimuth) * distance * side,
    z: CAMERA_DISTANCE_Z - Math.cos(azimuth) * distance,
    distance,
  };
};

const createSeededRandom = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const buildRisingStones = (): BlockTransform[] => {
  const random = createSeededRandom(19);
  const blocks: BlockTransform[] = [];
  for (let index = 0; index < RISING_STONE_COUNT; index++) {
    const slot = sampleFieldSlot(random, index % 2 === 0 ? 1 : -1);
    const y = -4 - ((index + random()) / RISING_STONE_COUNT) * 68;
    const size = slot.distance * (0.045 + random() * 0.03);
    blocks.push({
      position: [slot.x, y, slot.z],
      rotation: [random() * Math.PI, random() * Math.PI, random() * Math.PI],
      scale: [size, size * (0.5 + random() * 0.8), size],
      shade: 0.5 + random() * 0.4,
    });
  }
  return blocks;
};
