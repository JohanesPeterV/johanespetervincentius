export const createSeededRandom = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const buildStarField = (count: number): Float32Array => {
  const random = createSeededRandom(71);
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < positions.length; index += 3) {
    positions[index] = (random() - 0.5) * 150;
    positions[index + 1] = (random() - 0.5) * 140;
    positions[index + 2] = -8 - random() * 100;
  }
  return positions;
};

export const ORBIT_PATH = (() => {
  const count = 180;
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index++) {
    const angle = (index / count) * Math.PI * 2;
    positions[index * 3] = Math.cos(angle);
    positions[index * 3 + 1] = Math.sin(angle);
  }
  return positions;
})();
