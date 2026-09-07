import { BufferGeometry, Float32BufferAttribute } from 'three';

type EyeContour = {
  radius: number;
  depth: number;
  interior: number;
};

const SEGMENTS = 64;
const CONTOURS: EyeContour[] = [
  { radius: 0.28, depth: 0.13, interior: 1 },
  { radius: 0.56, depth: 0.105, interior: 1 },
  { radius: 0.78, depth: 0.055, interior: 1 },
  { radius: 0.84, depth: 0.015, interior: 1 },
  { radius: 0.86, depth: 0.015, interior: 0 },
  { radius: 0.9, depth: 0.16, interior: 0 },
  { radius: 0.96, depth: 0.16, interior: 0 },
  { radius: 1, depth: 0.08, interior: 0 },
  { radius: 1, depth: -0.18, interior: 0 },
  { radius: 0.94, depth: -0.25, interior: 0 },
];

export const createCosmicEyeGeometry = (): BufferGeometry => {
  const positions = [0, 0, 0.15];
  const interior = [1];
  const indices: number[] = [];

  CONTOURS.forEach((contour) => {
    for (let segment = 0; segment < SEGMENTS; segment += 1) {
      const angle = (segment / SEGMENTS) * Math.PI * 2;
      const x = Math.cos(angle);
      const y =
        Math.sign(Math.sin(angle)) * 0.48 * (1 - Math.pow(Math.abs(x), 1.35));
      positions.push(x * contour.radius, y * contour.radius, contour.depth);
      interior.push(contour.interior);
    }
  });

  const back = positions.length / 3;
  positions.push(0, 0, -0.25);
  interior.push(0);

  for (let segment = 0; segment < SEGMENTS; segment += 1) {
    const next = (segment + 1) % SEGMENTS;
    indices.push(0, segment + 1, next + 1);
    for (let contour = 0; contour < CONTOURS.length - 1; contour += 1) {
      const inner = 1 + contour * SEGMENTS;
      const outer = inner + SEGMENTS;
      indices.push(inner + segment, outer + segment, outer + next);
      indices.push(inner + segment, outer + next, inner + next);
    }
    const last = back - SEGMENTS;
    indices.push(last + segment, back, last + next);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aInterior', new Float32BufferAttribute(interior, 1));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
};
