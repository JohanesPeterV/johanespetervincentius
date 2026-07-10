'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { ReactNode, RefObject, useRef } from 'react';
import { Color, Group, InstancedMesh, Object3D } from 'three';

import { NARRATIVE_STONES, narrativeStoneY } from './descent';
import {
  BlockTransform,
  buildIglooBlocks,
  buildRisingStones,
  buildSnowPositions,
} from './world-layout';

const TERRAIN_URL = '/models/snowy-terrain-transformed.glb';
const TERRAIN_SCALE = 40;
const IGLOO_BLOCKS = buildIglooBlocks();
const RISING_STONE_BLOCKS = buildRisingStones();
const SNOW_POSITIONS = buildSnowPositions();
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
    <primitive object={scene} scale={TERRAIN_SCALE} position={[0, -1.2, 0]} />
  );
};

useGLTF.preload(TERRAIN_URL);

export const IglooShelter = () => (
  <group position={[0, 1.2, 0]} scale={1.2}>
    <instancedMesh
      args={[undefined, undefined, IGLOO_BLOCKS.length]}
      ref={(mesh) => {
        applyBlockInstances(mesh, IGLOO_BLOCKS, '#b7c0c9');
      }}
    >
      <boxGeometry />
      <meshStandardMaterial roughness={0.9} metalness={0.04} />
    </instancedMesh>
    <mesh position={[0, 0.5, 0]}>
      <sphereGeometry args={[1.55, 24, 16]} />
      <meshBasicMaterial color="#f4f8fd" />
    </mesh>
    <pointLight
      position={[0, 0.8, 0]}
      intensity={30}
      distance={16}
      color="#eef5fd"
    />
  </group>
);

export const RisingStones = () => (
  <instancedMesh
    args={[undefined, undefined, RISING_STONE_BLOCKS.length]}
    ref={(mesh) => {
      applyBlockInstances(mesh, RISING_STONE_BLOCKS, '#5f7591');
    }}
  >
    <dodecahedronGeometry args={[1, 0]} />
    <meshStandardMaterial color="#7890a7" roughness={0.86} metalness={0.04} />
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
  progressRef: RefObject<number>;
};

export const NarrativeStones = ({ progressRef }: NarrativeStonesParams) => {
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
      const size = 1.55 + index * 0.08;
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
        color="#d6e6f2"
        roughness={0.62}
        metalness={0.08}
        emissive="#6f94b2"
        emissiveIntensity={0.58}
      />
    </instancedMesh>
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
          size={0.12}
          color="#ffffff"
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
