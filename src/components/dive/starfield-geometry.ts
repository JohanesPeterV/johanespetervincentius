import { BufferGeometry, Float32BufferAttribute } from 'three';

import { createStarPositions } from './star-shape';

export const createStarGeometry = (): BufferGeometry => {
  const geometry = new BufferGeometry();
  geometry.name = 'solid-four-point-star';
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(createStarPositions(), 3),
  );
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
};
