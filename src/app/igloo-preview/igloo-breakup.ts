import { InstancedMesh, Object3D } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import { buildIglooBlocks } from './world-layout';
import type { BlockTransform } from './world-layout';

export const IGLOO_BLOCKS = buildIglooBlocks();
export const IGLOO_BLOCK_GEOMETRY = new RoundedBoxGeometry(1, 1, 1, 3, 0.12);

const blockHelper = new Object3D();
blockHelper.rotation.order = 'YXZ';

const smoothstep = (start: number, end: number, value: number): number => {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};

export const applyIglooBreakup = (
  mesh: InstancedMesh | null,
  progress: number,
): void => {
  if (!mesh) {
    return;
  }
  IGLOO_BLOCKS.forEach((block: BlockTransform, index: number) => {
    const variation = ((index * 17) % 19) / 18;
    const height = Math.min(1, Math.max(0, block.position[1] / 3.4));
    const loosenStart = 1.42 + (1 - height) * 0.24 + variation * 0.12;
    const loosen = smoothstep(loosenStart, loosenStart + 0.42, progress);
    const releaseStart = 2.02 + (1 - height) * 0.08 + variation * 0.06;
    const release = smoothstep(releaseStart, releaseStart + 0.34, progress);
    const spread = 1 + loosen * (0.055 + variation * 0.045) + release * 0.12;
    const lift =
      loosen * (0.16 + height * 0.82 + variation * 0.24) +
      release * (2.2 + height * 3.4 + variation * 1.8);
    blockHelper.position.set(
      block.position[0] * spread,
      block.position[1] + lift,
      block.position[2] * spread,
    );
    blockHelper.rotation.set(
      block.rotation[0] + loosen * (variation - 0.5) * 0.18,
      block.rotation[1] + release * (variation - 0.5) * 0.48,
      block.rotation[2] + loosen * (variation - 0.5) * 0.16,
    );
    const shrink = 0.98 - release * (0.06 + variation * 0.07);
    blockHelper.scale.set(
      block.scale[0] * shrink,
      block.scale[1] * shrink,
      block.scale[2] * shrink,
    );
    blockHelper.updateMatrix();
    mesh.setMatrixAt(index, blockHelper.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
};
