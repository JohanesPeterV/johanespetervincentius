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
const SHAFT_BLOCK_COUNT = 130;
const SKY_SNOW_COUNT = 550;
const SHAFT_SNOW_COUNT = 450;

const createSeededRandom = (seed: number): (() => number) => {
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

export const buildShaftBlocks = (): BlockTransform[] => {
  const random = createSeededRandom(19);
  const blocks: BlockTransform[] = [];
  for (let index = 0; index < SHAFT_BLOCK_COUNT; index++) {
    const y = -3 - random() * 68;
    const angle = random() * Math.PI * 2;
    const radius = 9 + random() * 8;
    const size = 1.2 + random() * 2.2;
    blocks.push({
      position: [Math.sin(angle) * radius, y, Math.cos(angle) * radius + 16],
      rotation: [random() * Math.PI, random() * Math.PI, random() * Math.PI],
      scale: [size, size * (0.5 + random() * 0.8), size],
      shade: 0.5 + random() * 0.4,
    });
  }
  return blocks;
};

export const buildSnowPositions = (): Float32Array => {
  const random = createSeededRandom(31);
  const positions = new Float32Array((SKY_SNOW_COUNT + SHAFT_SNOW_COUNT) * 3);
  for (let index = 0; index < SKY_SNOW_COUNT; index++) {
    positions[index * 3] = (random() - 0.5) * 95;
    positions[index * 3 + 1] = random() * 30;
    positions[index * 3 + 2] = (random() - 0.5) * 95;
  }
  for (
    let index = SKY_SNOW_COUNT;
    index < SKY_SNOW_COUNT + SHAFT_SNOW_COUNT;
    index++
  ) {
    const angle = random() * Math.PI * 2;
    const radius = random() * 11;
    positions[index * 3] = Math.sin(angle) * radius;
    positions[index * 3 + 1] = -70 + random() * 70;
    positions[index * 3 + 2] = Math.cos(angle) * radius + 16;
  }
  return positions;
};
