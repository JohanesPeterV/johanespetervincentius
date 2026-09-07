'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import {
  Color,
  DynamicDrawUsage,
  IcosahedronGeometry,
  InstancedMesh,
  Object3D,
} from 'three';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import { createSpaceOrigin } from './space-origin';
import { createSeededRandom } from './world-layout';
import type { StarfieldReality } from './world-layout';

type AsteroidFieldParams = {
  palette: DivePalette;
  reality: StarfieldReality;
  motionMode: MotionMode;
  gpuTier: number;
};

type Asteroid = {
  x: number;
  y: number;
  distance: number;
  radius: number;
  stretch: number;
  phase: number;
  spin: number;
  tint: number;
};

const ASTEROID_COUNT = 18;
const VIEW_TANGENT = Math.tan((58 * Math.PI) / 360);

const buildAsteroids = (reality: StarfieldReality): Asteroid[] => {
  const random = createSeededRandom(reality === 'watchers' ? 3947 : 9157);
  return Array.from({ length: ASTEROID_COUNT }, (_, index) => {
    let x = 0.52 + random() * 0.63;
    let y = -0.6 - random() * 0.48;
    if (index % 3 === 1) {
      x = -0.56 - random() * 0.53;
      y = 0.45 + random() * 0.4;
    }
    if (index % 6 === 2) {
      x = -0.56 - random() * 0.52;
      y = -0.62 - random() * 0.38;
    }
    if (reality === 'orbital') {
      const angle = 1.85 + random() * 3.05;
      x = -0.12 + Math.cos(angle) * (0.84 + random() * 0.24);
      y = 0.08 + Math.sin(angle) * (0.81 + random() * 0.25);
    }
    const prominent = index === 0;
    const depth = prominent ? random() * 0.25 : random();
    return {
      x,
      y,
      distance: 15 * Math.pow(5, depth),
      radius: prominent
        ? 0.009 + random() * 0.003
        : 0.003 + random() ** 2 * 0.006,
      stretch: 0.8 + random() * 0.4,
      phase: random() * Math.PI * 2,
      spin: (random() - 0.5) * 0.1,
      tint: random(),
    };
  });
};

const createAsteroidGeometry = (): IcosahedronGeometry => {
  const geometry = new IcosahedronGeometry(1, 1);
  const position = geometry.getAttribute('position');
  for (let index = 0; index < position.count; index++) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    // REASON: equal vertices receive equal displacement, preserving closed edges between the flat-shaded faces.
    const radius =
      1 +
      Math.sin(x * 5.3 + y * 2.7) * Math.cos(z * 4.1 - x) * 0.17 +
      Math.sin(y * 8.2 + z * 3.4) * 0.07;
    position.setXYZ(index, x * radius, y * radius, z * radius);
  }
  geometry.name = 'faceted-asteroid';
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
};

export default function AsteroidField({
  palette,
  reality,
  motionMode,
  gpuTier,
}: AsteroidFieldParams) {
  const compact = useThree(({ size }) => size.width < 768);
  const aspect = useThree(({ size }) => size.width / size.height);
  const meshRef = useRef<InstancedMesh>(null);
  const [field] = useState(() => {
    return {
      asteroids: buildAsteroids(reality),
      geometry: createAsteroidGeometry(),
      origin: createSpaceOrigin(),
      transform: new Object3D(),
      elapsed: 0,
    };
  });
  let count = compact ? 8 : ASTEROID_COUNT;
  if (gpuTier < 2) {
    count = Math.floor((count * 2) / 3);
  }

  // REASON: instance colours live in an imperative GPU buffer and must update when the site's palette changes.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    const graphite = new Color(palette.background).lerp(
      new Color(palette.foreground),
      palette.mode === 'light' ? 0.8 : 0.25,
    );
    const accent = new Color(palette.accent);
    const highlight = new Color(palette.highlight);
    const color = new Color();
    field.asteroids.forEach((asteroid, index) => {
      color.copy(graphite);
      const pigment = asteroid.tint < 0.5 ? accent : highlight;
      color.lerp(
        pigment,
        palette.mode === 'light' ? 0.9 : 0.08 + asteroid.tint * 0.18,
      );
      mesh.setColorAt(index, color);
    });
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
  }, [
    field,
    palette.accent,
    palette.background,
    palette.foreground,
    palette.highlight,
    palette.mode,
  ]);

  // REASON: R3F does not dispose externally constructed primitive geometry; this component owns its GPU lifetime.
  useEffect(() => () => field.geometry.dispose(), [field]);

  useFrame((_state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    if (motionMode === 'full') {
      field.elapsed += Math.min(delta, 0.1);
    }
    for (let index = 0; index < count; index++) {
      const asteroid = field.asteroids[index];
      const halfHeight = asteroid.distance * VIEW_TANGENT;
      let x = asteroid.x;
      let y = asteroid.y;
      if (compact) {
        x = Math.sign(x) * Math.max(0.88, Math.abs(x));
        y *= 1.09;
      }
      const drift = field.elapsed * 0.07 + asteroid.phase;
      field.transform.position.set(
        (x * aspect + Math.sin(drift) * 0.012) * halfHeight,
        (y + Math.cos(drift * 0.7) * 0.014) * halfHeight,
        -asteroid.distance + Math.sin(drift * 0.5) * 0.22,
      );
      const rotation = asteroid.phase + field.elapsed * asteroid.spin;
      field.transform.rotation.set(rotation * 0.7, rotation, rotation * 0.4);
      const radius = asteroid.radius * halfHeight * (compact ? 0.68 : 1);
      field.transform.scale.set(
        radius * asteroid.stretch,
        radius,
        radius / asteroid.stretch,
      );
      field.transform.updateMatrix();
      mesh.setMatrixAt(index, field.transform.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, -1);

  return (
    <group
      position={field.origin.position}
      quaternion={field.origin.quaternion}
    >
      <instancedMesh
        ref={meshRef}
        name={`asteroids-${reality}`}
        args={[undefined, undefined, ASTEROID_COUNT]}
        count={count}
        frustumCulled={false}
      >
        <primitive object={field.geometry} attach="geometry" />
        <meshStandardMaterial
          roughness={0.95}
          metalness={0.05}
          flatShading
          toneMapped={false}
          fog={false}
        />
      </instancedMesh>
    </group>
  );
}
