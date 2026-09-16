type Point = readonly [x: number, y: number, z: number];
type OutlinePoint = readonly [x: number, y: number];

const OUTLINE: readonly OutlinePoint[] = [
  [0, 0.5],
  [-0.14, 0.14],
  [-0.5, 0],
  [-0.14, -0.14],
  [0, -0.5],
  [0.14, -0.14],
  [0.5, 0],
  [0.14, 0.14],
];

const appendTriangle = (
  positions: number[],
  points: readonly Point[],
): void => {
  for (const point of points) {
    positions.push(...point);
  }
};

// REASON: the loader worker draws this star while the main thread boots WebGL,
// so the shape stays plain arithmetic and keeps Three.js out of the worker.
export const createStarPositions = (): number[] => {
  const positions: number[] = [];
  const rings = [
    { scale: 0.72, depth: 0.14 },
    { scale: 1, depth: 0.05 },
    { scale: 1, depth: -0.05 },
    { scale: 0.72, depth: -0.14 },
  ].map(({ scale, depth }) =>
    OUTLINE.map<Point>(([x, y]) => [x * scale, y * scale, depth]),
  );

  for (let index = 0; index < OUTLINE.length; index++) {
    const next = (index + 1) % OUTLINE.length;
    appendTriangle(positions, [[0, 0, 0.14], rings[0][index], rings[0][next]]);
    appendTriangle(positions, [[0, 0, -0.14], rings[3][next], rings[3][index]]);

    for (let band = 0; band < rings.length - 1; band++) {
      const front = rings[band];
      const back = rings[band + 1];
      appendTriangle(positions, [front[index], back[index], back[next]]);
      appendTriangle(positions, [front[index], back[next], front[next]]);
    }
  }

  return positions;
};
