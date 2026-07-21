export type BlockTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  shade: number;
};

const DOME_RADIUS = 3.4;
const DOME_ROWS = 6;
const ENTRANCE_HALF_ANGLE = 0.46;
const TUNNEL_RADIUS = 1.35;
const RISING_STONE_COUNT = 18;
const AMBIENT_SNOW_COUNT = 620;
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

export const createSeededRandom = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const wrapAngle = (angle: number): number => {
  let wrapped = angle % (Math.PI * 2);
  if (wrapped > Math.PI) {
    wrapped -= Math.PI * 2;
  }
  if (wrapped < -Math.PI) {
    wrapped += Math.PI * 2;
  }
  return wrapped;
};

const buildDomeRows = (random: () => number): BlockTransform[] => {
  const blocks: BlockTransform[] = [];
  const rowSpan = Math.PI / 2 / (DOME_ROWS + 1);
  for (let row = 0; row < DOME_ROWS; row++) {
    const latitude = (row + 0.5) * rowSpan;
    const ringRadius = DOME_RADIUS * Math.cos(latitude);
    const ringY = DOME_RADIUS * Math.sin(latitude);
    const count = Math.max(5, Math.round((Math.PI * 2 * ringRadius) / 1.15));
    for (let slot = 0; slot < count; slot++) {
      const angle = ((slot + row * 0.37) / count) * Math.PI * 2;
      const facesEntrance = Math.abs(wrapAngle(angle)) < ENTRANCE_HALF_ANGLE;
      if (row < 2 && facesEntrance) {
        continue;
      }
      blocks.push({
        position: [
          Math.sin(angle) * ringRadius,
          ringY + (random() - 0.5) * 0.04,
          Math.cos(angle) * ringRadius,
        ],
        rotation: [latitude * (0.85 + (random() - 0.5) * 0.2), angle, 0],
        scale: [
          ((Math.PI * 2 * ringRadius) / count) * 0.94,
          rowSpan * DOME_RADIUS * 0.96,
          0.8 + random() * 0.15,
        ],
        shade: 0.82 + random() * 0.18,
      });
    }
  }
  blocks.push({
    position: [0, DOME_RADIUS * 0.96, 0],
    rotation: [0, random() * Math.PI, 0],
    scale: [1.3, 0.5, 1.3],
    shade: 0.9,
  });
  return blocks;
};

const buildEntranceTunnel = (random: () => number): BlockTransform[] => {
  const blocks: BlockTransform[] = [];
  for (const ringZ of [2.9, 3.7, 4.5]) {
    for (let slot = 0; slot < 7; slot++) {
      const angle = Math.PI * (0.12 + (0.76 * slot) / 6);
      blocks.push({
        position: [
          Math.cos(angle) * TUNNEL_RADIUS,
          Math.sin(angle) * TUNNEL_RADIUS,
          ringZ + (random() - 0.5) * 0.12,
        ],
        rotation: [0, 0, angle - Math.PI / 2],
        scale: [
          0.6 + random() * 0.1,
          0.55 + random() * 0.1,
          0.7 + random() * 0.1,
        ],
        shade: 0.82 + random() * 0.18,
      });
    }
  }
  return blocks;
};

export const buildIglooBlocks = (): BlockTransform[] => {
  const random = createSeededRandom(7);
  return [...buildDomeRows(random), ...buildEntranceTunnel(random)];
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

export const buildIceRidges = (): BlockTransform[] => [
  {
    position: [-19, 2.2, -24],
    rotation: [0.08, 0.28, -0.06],
    scale: [10.5, 7.6, 7],
    shade: 0.82,
  },
  {
    position: [-2, 3.2, -38],
    rotation: [-0.04, -0.2, 0.03],
    scale: [14, 10, 10],
    shade: 0.94,
  },
  {
    position: [22, 1.4, -29],
    rotation: [0.06, -0.36, 0.08],
    scale: [10.5, 7.2, 8],
    shade: 0.76,
  },
  {
    position: [-35, 2.3, -43],
    rotation: [0.02, 0.44, -0.05],
    scale: [18, 6.5, 11],
    shade: 0.7,
  },
  {
    position: [38, 2.8, -46],
    rotation: [-0.05, -0.38, 0.04],
    scale: [20, 7.2, 12],
    shade: 0.68,
  },
];

const CRYSTAL_SHARD_COUNT = 6;

export const buildCrystalShards = (): BlockTransform[] => {
  const random = createSeededRandom(43);
  const blocks: BlockTransform[] = [];
  for (let index = 0; index < CRYSTAL_SHARD_COUNT; index++) {
    const slot = sampleFieldSlot(random, index % 2 === 0 ? 1 : -1);
    const y = -16 - ((index + random()) / CRYSTAL_SHARD_COUNT) * 42;
    const height = slot.distance * (0.14 + random() * 0.1);
    blocks.push({
      position: [slot.x, y, slot.z],
      rotation: [
        (random() - 0.5) * 0.9,
        random() * Math.PI,
        (random() - 0.5) * 0.9,
      ],
      scale: [height * 0.34, height, height * 0.34],
      shade: 0.92 + random() * 0.08,
    });
  }
  blocks.push({
    position: [11.5, -9, 6],
    rotation: [0.15, 0.6, -0.2],
    scale: [1.3, 3.6, 1.3],
    shade: 1,
  });
  blocks.push({
    position: [-11.8, -12, 6.5],
    rotation: [-0.12, 1.9, 0.24],
    scale: [1.5, 4.2, 1.5],
    shade: 1,
  });
  return blocks;
};

export const buildSnowPositions = (): Float32Array => {
  const random = createSeededRandom(31);
  const positions = new Float32Array(AMBIENT_SNOW_COUNT * 3);
  for (let index = 0; index < AMBIENT_SNOW_COUNT; index++) {
    positions[index * 3] = (random() - 0.5) * 95;
    positions[index * 3 + 1] = -10 + random() * 40;
    positions[index * 3 + 2] = 16 + (random() - 0.5) * 95;
  }
  return positions;
};
