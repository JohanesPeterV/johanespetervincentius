import {
  BufferGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  PlaneGeometry,
  Vector3,
} from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import {
  mergeGeometries,
  mergeVertices,
} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { SPACE_KEY_LIGHT } from './space-lighting';
import { createSpaceOrigin } from './space-origin';
import { createSeededRandom } from './world-layout';

type Crater = { x: number; z: number; radius: number; depth: number };
type Rock = { x: number; y: number; z: number; radius: number };
export type LunarView = 'wide' | 'compact';

export const LUNAR_SURFACE_TILT: Record<LunarView, number> = {
  wide: -0.12,
  compact: -0.27,
};

const noise = new ImprovedNoise();
const random = createSeededRandom(1969);
const craters: Crater[] = [
  { x: -12, z: -27, radius: 12, depth: 2 },
  { x: 19, z: -55, radius: 16, depth: 2.5 },
  { x: -24, z: -112, radius: 28, depth: 3.4 },
  ...Array.from({ length: 12 }, () => {
    const distance = 10 + random() * 150;
    const radius = 1 + random() ** 2 * 3;
    return {
      x: (random() - 0.5) * distance * 2.3,
      z: -distance,
      radius,
      depth: radius * 0.1,
    };
  }),
];

const terrainHeight = (x: number, z: number): number => {
  const broad = noise.noise(x * 0.035, z * 0.035, 4.7);
  const ridge = z + 91 + Math.sin(x * 0.035) * 14;
  let height = -2.4 - z * z * 0.00035;
  height += broad * 0.5;
  height += noise.noise(x * 0.16, z * 0.16, 2.3) * 0.045;
  height += Math.exp(-((ridge / 24) ** 2)) * (0.8 + broad * 0.6);

  for (const crater of craters) {
    const dx = x - crater.x;
    const dz = z - crater.z;
    const radius = Math.hypot(dx, dz) / crater.radius;
    if (radius > 1.7) {
      continue;
    }
    const irregularity = 1 + noise.noise(x * 0.06, z * 0.06, 3.1) * 0.035;
    const rim = Math.exp(-(((radius * irregularity - 1) / 0.2) ** 2));
    const interior = Math.min(1, Math.max(0, (1 - radius) / 0.72));
    const bowl = interior * interior * (3 - 2 * interior);
    height += crater.depth * (rim * 0.18 - bowl);
  }
  return height;
};

const createRocks = (gpuTier: number): Rock[] => {
  const rockRandom = createSeededRandom(1972);
  return [
    { x: -5, z: -9, radius: 0.2 },
    { x: 9, z: -18, radius: 0.28 },
    ...Array.from({ length: gpuTier < 2 ? 12 : 24 }, () => {
      const distance = 5 + rockRandom() ** 1.5 * 82;
      return {
        x: (rockRandom() - 0.5) * distance * 1.8,
        z: -distance,
        radius: 0.025 + rockRandom() ** 3 * 0.18,
      };
    }),
  ].map((rock) => ({
    ...rock,
    y: terrainHeight(rock.x, rock.z) + rock.radius * 0.12,
  }));
};

const createRockGeometry = (rocks: Rock[]): BufferGeometry => {
  const fragments = rocks.map((rock) => {
    const source = new IcosahedronGeometry(1, 3);
    source.deleteAttribute('normal');
    source.deleteAttribute('uv');
    const geometry = mergeVertices(source);
    source.dispose();
    const positions = geometry.getAttribute('position');
    for (let index = 0; index < positions.count; index++) {
      const x = positions.getX(index);
      const y = positions.getY(index);
      const z = positions.getZ(index);
      const relief = 1 + noise.noise(x * 2.7, y * 2.7, z * 2.7) * 0.2;
      positions.setXYZ(
        index,
        rock.x + x * relief * rock.radius,
        rock.y + y * relief * rock.radius * 0.7,
        rock.z + z * relief * rock.radius * 0.85,
      );
    }
    geometry.computeVertexNormals();
    geometry.setAttribute(
      'aSunVisibility',
      new Float32BufferAttribute(new Float32Array(positions.count).fill(1), 1),
    );
    return geometry;
  });
  const geometry = mergeGeometries(fragments);
  for (const fragment of fragments) {
    fragment.dispose();
  }
  if (!geometry) {
    throw new Error('The lunar rock geometries must have matching attributes.');
  }
  geometry.name = 'lunar-surface-rocks';
  return geometry;
};

export const createLunarTerrain = (
  gpuTier: number,
  view: LunarView,
): { ground: PlaneGeometry; rocks: BufferGeometry } => {
  const segments = gpuTier < 2 ? 140 : 260;
  const geometry = new PlaneGeometry(1, 1, segments, segments);
  const positions = geometry.getAttribute('position');
  const uv = geometry.getAttribute('uv');
  const shade = new Float32Array(positions.count);
  const normals = new Float32Array(positions.count * 3);
  const normal = new Vector3();
  const rocks = createRocks(gpuTier);
  const light = new Vector3(...SPACE_KEY_LIGHT)
    .applyQuaternion(createSpaceOrigin().quaternion.invert())
    .applyAxisAngle(new Vector3(1, 0, 0), -LUNAR_SURFACE_TILT[view])
    .normalize();
  const rockLight = new Vector3(
    light.x,
    light.y / 0.7,
    light.z / 0.85,
  ).normalize();

  for (let index = 0; index < positions.count; index++) {
    // REASON: perspective spacing spends vertices on nearby crater rims while covering the full horizon.
    const distance = Math.pow(uv.getY(index), 1.7) * 205;
    const x = (uv.getX(index) - 0.5) * (24 + distance * 4.8);
    const z = 4 - distance;
    const y = terrainHeight(x, z);
    positions.setXYZ(index, x, y, z);
    // REASON: sample the smooth height field directly so wide perspective cells do not turn crater lighting into visible facets.
    normal
      .set(
        terrainHeight(x - 0.12, z) - terrainHeight(x + 0.12, z),
        0.24,
        terrainHeight(x, z - 0.12) - terrainHeight(x, z + 0.12),
      )
      .normalize()
      .toArray(normals, index * 3);
    let occlusion = 0;
    // REASON: static terrain can bake its sunlight visibility once instead of adding a per-frame shadow pass.
    for (const step of [0.4, 0.9, 1.8, 3.5, 7, 14]) {
      const obstruction = terrainHeight(x + light.x * step, z + light.z * step);
      occlusion = Math.max(occlusion, (obstruction - y) / step - light.y);
    }
    shade[index] = 1 / (1 + occlusion * 3);
    for (const rock of rocks) {
      const dx = rock.x - x;
      const dy = (rock.y - y) / 0.7;
      const dz = (rock.z - z) / 0.85;
      const along = dx * rockLight.x + dy * rockLight.y + dz * rockLight.z;
      const clearance = dx * dx + dy * dy + dz * dz - along * along;
      if (along > 0 && clearance < rock.radius * rock.radius) {
        const coverage = Math.max(
          0,
          1 - clearance / (rock.radius * rock.radius),
        );
        shade[index] *= 1 - Math.min(1, coverage) * 0.45;
      }
    }
  }

  geometry.name = 'lunar-crater-terrain';
  geometry.setAttribute('aSunVisibility', new Float32BufferAttribute(shade, 1));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.computeBoundingSphere();
  return { ground: geometry, rocks: createRockGeometry(rocks) };
};
