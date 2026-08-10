'use client';

import { useFrame } from '@react-three/fiber';
import { ReactNode, RefObject, useRef } from 'react';
import { Color, Group, InstancedMesh, Object3D } from 'three';

import { NARRATIVE_STONES, narrativeStoneY } from './descent';
import { BlockTransform, buildRisingStones } from './world-layout';

const RISING_STONE_BLOCKS = buildRisingStones();
const narrativeStoneHelper = new Object3D();

const applyBlockInstances = (
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

type RisingStonesParams = {
  color: string;
};

export const RisingStones = ({ color }: RisingStonesParams) => (
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
  accentColor: string;
  color: string;
  progressRef: RefObject<number>;
};

export const NarrativeStones = ({
  accentColor,
  color,
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
      const size = (1.26 + index * 0.06) * stone.scale;
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
