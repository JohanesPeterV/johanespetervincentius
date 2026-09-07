import { BufferGeometry, Float32BufferAttribute } from 'three';

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

export const createStarGeometry = (): BufferGeometry => {
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

  const geometry = new BufferGeometry();
  geometry.name = 'solid-four-point-star';
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
};
