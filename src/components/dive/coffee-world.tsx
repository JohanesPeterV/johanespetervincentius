'use client';

import { useFrame } from '@react-three/fiber';
import { RefObject, useRef } from 'react';
import { AdditiveBlending, BufferGeometry, Group } from 'three';

import { worldARise, worldBRise } from './descent';
import {
  NarrativeStones,
  RisingStones,
  RisingWorld,
  applyBlockInstances,
} from './dive-world';
import { buildCremaSwirl, createSeededRandom } from './world-layout';

type CoffeeWorldParams = {
  accentColor: string;
  progressRef: RefObject<number>;
  rockColor: string;
  stoneColor: string;
};

type SteamField = {
  positions: Float32Array;
  seeds: Float32Array;
};

type RainField = {
  positions: Float32Array;
  seeds: Float32Array;
};

const CREMA_BLOCKS = buildCremaSwirl();
const CREMA_COLOR = '#c99a63';
const SURFACE_COLOR = '#150c07';
const KEY_LIGHT_COLOR = '#ffb066';
const CREMA_SPIN_RATE = 0.032;
const STEAM_COUNT = 220;
const STEAM_FLOOR_Y = -4;
const STEAM_CEILING_Y = 14;
const MAX_DRIFT_DELTA = 0.05;

const STEAM_VERTEX = `
attribute float aSeed;
varying float vFade;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float growth = 1.0 + smoothstep(-2.0, 12.0, position.y) * 0.9;
  gl_PointSize = (6.0 + aSeed * 6.0) * growth * (24.0 / -mvPosition.z);
  vFade =
    smoothstep(-4.0, -1.5, position.y) *
    (1.0 - smoothstep(9.0, 13.5, position.y));
  gl_Position = projectionMatrix * mvPosition;
}
`;

const STEAM_FRAGMENT = `
varying float vFade;

void main() {
  float distanceToCenter = length(gl_PointCoord - vec2(0.5));
  float alpha = smoothstep(0.5, 0.08, distanceToCenter) * 0.09 * vFade;
  if (alpha < 0.004) {
    discard;
  }
  gl_FragColor = vec4(1.0, 0.9, 0.78, alpha);
}
`;

const buildSteamField = (): SteamField => {
  const random = createSeededRandom(97);
  const positions = new Float32Array(STEAM_COUNT * 3);
  const seeds = new Float32Array(STEAM_COUNT);
  for (let index = 0; index < STEAM_COUNT; index++) {
    positions[index * 3] = (random() - 0.5) * 34;
    positions[index * 3 + 1] =
      STEAM_FLOOR_Y + random() * (STEAM_CEILING_Y - STEAM_FLOOR_Y);
    positions[index * 3 + 2] = -4 + random() * 18;
    seeds[index] = random();
  }
  return { positions, seeds };
};

const SteamDrift = () => {
  const fieldRef = useRef<SteamField | null>(null);
  if (fieldRef.current === null) {
    fieldRef.current = buildSteamField();
  }
  const field = fieldRef.current;
  const geometryRef = useRef<BufferGeometry>(null);
  useFrame((state, delta) => {
    const geometry = geometryRef.current;
    if (!geometry) {
      return;
    }
    const time = state.clock.elapsedTime;
    const frameDelta = Math.min(delta, MAX_DRIFT_DELTA);
    const positions = field.positions;
    for (let index = 0; index < STEAM_COUNT; index++) {
      const seed = field.seeds[index];
      positions[index * 3 + 1] += (0.3 + seed * 0.5) * frameDelta;
      const sway = time * (0.25 + seed * 0.4) + seed * 40;
      positions[index * 3] += Math.sin(sway) * frameDelta * 0.32;
      positions[index * 3 + 2] += Math.cos(sway * 0.8) * frameDelta * 0.22;
      if (positions[index * 3 + 1] > STEAM_CEILING_Y) {
        positions[index * 3 + 1] = STEAM_FLOOR_Y;
      }
    }
    geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[field.positions, 3]}
        />
        <bufferAttribute attach="attributes-aSeed" args={[field.seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={STEAM_VERTEX}
        fragmentShader={STEAM_FRAGMENT}
        blending={AdditiveBlending}
        transparent
        depthWrite={false}
      />
    </points>
  );
};

const RAIN_COUNT = 340;
const RAIN_COLOR = '#8fa8bd';
const RAIN_FLOOR_Y = -10;
const RAIN_SPAN_Y = 30;
const RAIN_SLANT = 0.14;

const rainDropLength = (seed: number): number => 0.45 + seed * 0.75;

const buildRainField = (): RainField => {
  const random = createSeededRandom(113);
  const positions = new Float32Array(RAIN_COUNT * 6);
  const seeds = new Float32Array(RAIN_COUNT);
  for (let index = 0; index < RAIN_COUNT; index++) {
    const seed = random();
    const x = (random() - 0.5) * 80;
    const y = RAIN_FLOOR_Y + random() * RAIN_SPAN_Y;
    const z = -30 + random() * 40;
    const length = rainDropLength(seed);
    positions[index * 6] = x;
    positions[index * 6 + 1] = y;
    positions[index * 6 + 2] = z;
    positions[index * 6 + 3] = x + RAIN_SLANT * length;
    positions[index * 6 + 4] = y + length;
    positions[index * 6 + 5] = z;
    seeds[index] = seed;
  }
  return { positions, seeds };
};

const RainDrift = () => {
  const fieldRef = useRef<RainField | null>(null);
  if (fieldRef.current === null) {
    fieldRef.current = buildRainField();
  }
  const field = fieldRef.current;
  const geometryRef = useRef<BufferGeometry>(null);
  useFrame((_, delta) => {
    const geometry = geometryRef.current;
    if (!geometry) {
      return;
    }
    const frameDelta = Math.min(delta, MAX_DRIFT_DELTA);
    const positions = field.positions;
    for (let index = 0; index < RAIN_COUNT; index++) {
      const seed = field.seeds[index];
      let y = positions[index * 6 + 1] - (9 + seed * 7) * frameDelta;
      if (y < RAIN_FLOOR_Y) {
        y += RAIN_SPAN_Y;
      }
      positions[index * 6 + 1] = y;
      positions[index * 6 + 4] = y + rainDropLength(seed);
    }
    geometry.attributes.position.needsUpdate = true;
  });
  return (
    <lineSegments frustumCulled={false}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[field.positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={RAIN_COLOR}
        transparent
        opacity={0.34}
        depthWrite={false}
      />
    </lineSegments>
  );
};

const CremaSwirl = () => {
  const groupRef = useRef<Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * CREMA_SPIN_RATE;
    }
  });
  return (
    <group ref={groupRef}>
      <instancedMesh
        args={[undefined, undefined, CREMA_BLOCKS.length]}
        ref={(mesh) => {
          applyBlockInstances(mesh, CREMA_BLOCKS, CREMA_COLOR);
        }}
      >
        <cylinderGeometry args={[1, 1, 1, 12]} />
        <meshStandardMaterial color={CREMA_COLOR} roughness={0.85} />
      </instancedMesh>
    </group>
  );
};

export default function CoffeeWorld({
  accentColor,
  progressRef,
  rockColor,
  stoneColor,
}: CoffeeWorldParams) {
  return (
    <>
      <ambientLight intensity={0.24} color="#ffe2c4" />
      <spotLight
        position={[8, 9, 6]}
        intensity={640}
        angle={0.85}
        penumbra={0.9}
        color={KEY_LIGHT_COLOR}
      />
      <pointLight
        position={[0, 2.6, 3]}
        intensity={10}
        distance={26}
        color="#ffbf78"
      />
      <RisingWorld progressRef={progressRef} rise={worldARise}>
        <group position={[0, -1.6, 0]}>
          <mesh rotation-x={-Math.PI / 2}>
            <circleGeometry args={[46, 64]} />
            <meshStandardMaterial
              color={SURFACE_COLOR}
              roughness={0.24}
              metalness={0.08}
            />
          </mesh>
          <CremaSwirl />
        </group>
      </RisingWorld>
      <RisingWorld progressRef={progressRef} rise={worldBRise}>
        <RisingStones color={rockColor} />
      </RisingWorld>
      <NarrativeStones
        accentColor={accentColor}
        color={stoneColor}
        progressRef={progressRef}
      />
      <SteamDrift />
      <RainDrift />
    </>
  );
}
