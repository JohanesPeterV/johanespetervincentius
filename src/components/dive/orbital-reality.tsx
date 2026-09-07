'use client';

import { useFrame } from '@react-three/fiber';
import { RefObject, useEffect, useRef, useState } from 'react';
import {
  Color,
  DoubleSide,
  Euler,
  Group,
  MathUtils,
  Matrix4,
  PerspectiveCamera,
  Vector2,
} from 'three';

import type { MotionMode } from './descent';
import { PROJECT_STONE, TECH_STONE } from './descent';
import type { DivePalette } from './dive-palette';
import { celestialVertex } from './celestial-shader';
import {
  gasGiantFragment,
  orbitalRingVertex,
  particulateRingFragment,
} from './orbital-material-shader';

type OrbitalRealityParams = {
  palette: DivePalette;
  progressRef: RefObject<number>;
  motionMode: MotionMode;
  gpuTier: number;
};

const DEBRIS = [
  { x: 0.87, y: 0.76, size: 0.044, depth: -0.18 },
  { x: 0.93, y: -0.55, size: 0.072, depth: -0.08 },
  { x: -0.7, y: -0.75, size: 0.037, depth: -0.12 },
  { x: 0.43, y: -0.9, size: 0.025, depth: -0.28 },
];

const PLANET_RADIUS = 0.51;
const RING_BOUNDS: [number, number] = [0.62, 0.88];
const RING_ROTATION: [number, number, number] = [1.12, 0.16, -0.16];

export default function OrbitalReality({
  palette,
  progressRef,
  motionMode,
  gpuTier,
}: OrbitalRealityParams) {
  const groupRef = useRef<Group>(null);
  const planetRef = useRef<Group>(null);
  const debrisRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const [uniforms] = useState(() => ({
    uAccent: { value: new Color(palette.accent) },
    uHighlight: { value: new Color(palette.highlight) },
    uSunlight: { value: new Color(palette.sunlight) },
    uTime: { value: 0 },
    uPlanetRadius: { value: PLANET_RADIUS },
    uRingBounds: { value: new Vector2(...RING_BOUNDS) },
    uRingToPlanet: {
      value: new Matrix4().makeRotationFromEuler(new Euler(...RING_ROTATION)),
    },
  }));
  const segments = gpuTier < 2 ? 64 : 128;
  // REASON: orbit lines glow in the dark but are pigment on paper, which needs more coverage.
  const light = palette.mode === 'light';

  // REASON: the persistent shader uniforms must follow palette changes
  // without reparsing CSS colours inside the animation loop.
  useEffect(() => {
    uniforms.uAccent.value.set(palette.accent);
    uniforms.uHighlight.value.set(palette.highlight);
    uniforms.uSunlight.value.set(palette.sunlight);
  }, [palette.accent, palette.highlight, palette.sunlight, uniforms]);

  useFrame(({ camera, size }, delta) => {
    const group = groupRef.current;
    if (!group || !(camera instanceof PerspectiveCamera)) {
      return;
    }
    if (motionMode === 'full') {
      elapsedRef.current += Math.min(delta, 0.1);
    }
    const time = elapsedRef.current;
    uniforms.uTime.value = time;
    const compact = size.width < 768;
    const halfHeight = Math.tan(MathUtils.degToRad(camera.fov * 0.5)) * 58;
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);
    group.translateZ(-58);
    group.scale.setScalar(halfHeight);
    if (planetRef.current) {
      // REASON: work and project copy occupy the right side. Cross above the
      // reading area into a cropped edge, leaving the central skill labels clear.
      const travel = MathUtils.smoothstep(
        progressRef.current,
        PROJECT_STONE.center,
        TECH_STONE.center - 0.2,
      );
      const rightEdge = 0.72 + 0.88 / camera.aspect;
      const x = compact ? 0.78 : MathUtils.lerp(-0.88, rightEdge, travel);
      const y = compact
        ? 1.18
        : MathUtils.lerp(0.65, 0.2, travel) + Math.sin(travel * Math.PI) * 1.15;
      planetRef.current.position.set(x * camera.aspect, y, 0);
      planetRef.current.scale.setScalar(compact ? 0.5 : 1);
      planetRef.current.rotation.z = -0.25 + Math.sin(time * 0.06) * 0.025;
    }
    debrisRef.current?.children.forEach((mesh, index) => {
      const placement = DEBRIS[index];
      mesh.position.set(
        placement.x * camera.aspect,
        placement.y + Math.sin(time * 0.1 + index) * 0.018,
        placement.depth,
      );
      mesh.rotation.set(index * 0.7 + time * 0.035, index + time * 0.025, 0.3);
    });
  }, -1);

  return (
    <group ref={groupRef}>
      <group ref={planetRef}>
        <mesh>
          <sphereGeometry args={[PLANET_RADIUS, segments, segments / 2]} />
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={celestialVertex}
            fragmentShader={gasGiantFragment}
            toneMapped={false}
          />
        </mesh>
        <mesh rotation={RING_ROTATION}>
          <ringGeometry args={[RING_BOUNDS[0], RING_BOUNDS[1], segments]} />
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={orbitalRingVertex}
            fragmentShader={particulateRingFragment}
            side={DoubleSide}
            transparent
            depthWrite={false}
            forceSinglePass
            toneMapped={false}
          />
        </mesh>
      </group>
      <mesh position={[-0.8, 0.25, -0.4]} rotation={[0.9, -0.35, -0.6]}>
        <torusGeometry args={[1.63, 0.0025, 3, segments]} />
        <meshBasicMaterial
          color={palette.highlight}
          transparent
          opacity={light ? 0.75 : 0.18}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      <mesh position={[0.95, -0.78, -0.7]} rotation={[0.92, 0.24, 0.48]}>
        <torusGeometry args={[1.25, 0.002, 3, segments]} />
        <meshBasicMaterial
          color={palette.accent}
          transparent
          opacity={light ? 0.6 : 0.12}
          toneMapped={false}
          fog={false}
        />
      </mesh>
      <group ref={debrisRef}>
        {DEBRIS.map((placement, index) => (
          <mesh key={placement.x} scale={placement.size}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? palette.accent : palette.highlight}
              roughness={1}
              metalness={0}
              flatShading
              toneMapped={false}
              fog={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
