'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { ReactNode, RefObject, useRef } from 'react';
import { Color, Group, InstancedMesh, Object3D } from 'three';

import { NARRATIVE_STONES, narrativeStoneY } from './descent';
import {
  BlockTransform,
  buildIceRidges,
  buildRockDrift,
  buildRisingStones,
  buildSnowPositions,
} from './world-layout';

const TERRAIN_URL = '/models/snowy-terrain-transformed.glb';
const TERRAIN_SCALE = 40;
const ICE_RIDGE_BLOCKS = buildIceRidges();
// REASON: the shared ridge silhouettes read as bright mid-frame masses against
// the dark space backdrop, so the space world recedes them into the fog
const SPACE_RIDGE_BLOCKS = ICE_RIDGE_BLOCKS.map((block) => ({
  ...block,
  shade: block.shade * 0.55,
}));
const RISING_STONE_BLOCKS = buildRisingStones();
const SNOW_POSITIONS = buildSnowPositions();
const ROCK_DRIFT_BLOCKS = buildRockDrift();
const narrativeStoneHelper = new Object3D();

export const applyBlockInstances = (
  mesh: InstancedMesh | null,
  blocks: BlockTransform[],
  baseColor: string,
): void => {
  if (!mesh) {
    return;
  }
  const helper = new Object3D();
  helper.rotation.order = 'YXZ';
  const tint = new Color();
  const base = new Color(baseColor);
  blocks.forEach((block, index) => {
    helper.position.set(
      block.position[0],
      block.position[1],
      block.position[2],
    );
    helper.rotation.set(
      block.rotation[0],
      block.rotation[1],
      block.rotation[2],
    );
    helper.scale.set(block.scale[0], block.scale[1], block.scale[2]);
    helper.updateMatrix();
    mesh.setMatrixAt(index, helper.matrix);
    tint.copy(base).multiplyScalar(block.shade);
    mesh.setColorAt(index, tint);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true;
  }
};

export const SnowTerrain = () => {
  const { scene } = useGLTF(TERRAIN_URL);
  return (
    <primitive object={scene} scale={TERRAIN_SCALE} position={[0, -1.8, 0]} />
  );
};

export const IceRidges = () => (
  <instancedMesh
    args={[undefined, undefined, ICE_RIDGE_BLOCKS.length]}
    ref={(mesh) => {
      applyBlockInstances(mesh, ICE_RIDGE_BLOCKS, '#9ba6b2');
    }}
  >
    <icosahedronGeometry args={[1, 2]} />
    <meshStandardMaterial flatShading color="#9ba6b2" roughness={1} />
  </instancedMesh>
);

type ColoredFieldParams = {
  color: string;
};

type RisingStonesParams = {
  color?: string;
};

export const SpaceRidges = ({ color }: ColoredFieldParams) => (
  <instancedMesh
    args={[undefined, undefined, SPACE_RIDGE_BLOCKS.length]}
    ref={(mesh) => {
      applyBlockInstances(mesh, SPACE_RIDGE_BLOCKS, color);
    }}
  >
    <icosahedronGeometry args={[1, 1]} />
    <meshStandardMaterial flatShading color={color} roughness={0.94} />
  </instancedMesh>
);

useGLTF.preload(TERRAIN_URL);

export const RisingStones = ({ color = '#7890a7' }: RisingStonesParams) => (
  <instancedMesh
    args={[undefined, undefined, RISING_STONE_BLOCKS.length]}
    ref={(mesh) => {
      applyBlockInstances(mesh, RISING_STONE_BLOCKS, color);
    }}
  >
    <dodecahedronGeometry args={[1, 0]} />
    <meshStandardMaterial color={color} roughness={0.86} metalness={0.04} />
  </instancedMesh>
);

type RisingWorldParams = {
  progressRef: RefObject<number>;
  rise: (progress: number) => number;
  children: ReactNode;
};

export const RisingWorld = ({
  progressRef,
  rise,
  children,
}: RisingWorldParams) => {
  const groupRef = useRef<Group>(null);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.y = rise(progressRef.current);
    }
  });
  return <group ref={groupRef}>{children}</group>;
};

type NarrativeStonesParams = {
  accentColor?: string;
  color?: string;
  progressRef: RefObject<number>;
};

export const NarrativeStones = ({
  accentColor = '#6f94b2',
  color = '#d6e6f2',
  progressRef,
}: NarrativeStonesParams) => {
  const meshRef = useRef<InstancedMesh>(null);
  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    const progress = progressRef.current;
    const idle = Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
    NARRATIVE_STONES.forEach((stone, index) => {
      narrativeStoneHelper.position.set(
        stone.x,
        narrativeStoneY(progress, stone.center),
        stone.z,
      );
      narrativeStoneHelper.rotation.set(
        0.2 + index * 0.28 + progress * 0.16,
        0.5 + index * 0.55 + progress * 0.22 + idle,
        -0.18 + index * 0.1,
      );
      const size = 1.26 + index * 0.06;
      narrativeStoneHelper.scale.set(size, size * 0.84, size * 0.94);
      narrativeStoneHelper.updateMatrix();
      mesh.setMatrixAt(index, narrativeStoneHelper.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, NARRATIVE_STONES.length]}
      frustumCulled={false}
    >
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        flatShading
        color={color}
        roughness={0.46}
        metalness={0.12}
        emissive={accentColor}
        emissiveIntensity={0.3}
      />
    </instancedMesh>
  );
};

export const RockDrift = ({ color }: ColoredFieldParams) => {
  const groupRef = useRef<Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.08) * 0.08;
      groupRef.current.position.y =
        Math.cos(state.clock.elapsedTime * 0.12) * 0.2;
    }
  });
  return (
    <group ref={groupRef}>
      <instancedMesh
        args={[undefined, undefined, ROCK_DRIFT_BLOCKS.length]}
        ref={(mesh) => {
          applyBlockInstances(mesh, ROCK_DRIFT_BLOCKS, color);
        }}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} roughness={0.92} metalness={0.08} />
      </instancedMesh>
    </group>
  );
};

export const SnowDrift = () => {
  const groupRef = useRef<Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.15) * 0.06;
    }
  });
  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[SNOW_POSITIONS, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#ffffff"
          transparent
          opacity={0.34}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
