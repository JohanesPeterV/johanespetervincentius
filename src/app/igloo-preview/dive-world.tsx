'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RefObject, useRef } from 'react';
import { BackSide, Color, Group, InstancedMesh, Object3D } from 'three';

import {
  PARKED_EYE_Y,
  ROCK_RISE_RATE,
  ROCK_SPIN_RATE,
  SECTION_ROCKS,
} from './descent';
import {
  BlockTransform,
  buildIglooBlocks,
  buildSectionRocks,
  buildShaftBlocks,
  buildSnowPositions,
} from './world-layout';

const TERRAIN_URL = '/models/snowy-terrain-transformed.glb';
const TERRAIN_SCALE = 40;
const IGLOO_BLOCKS = buildIglooBlocks();
const SHAFT_BLOCKS = buildShaftBlocks();
const SECTION_ROCK_BLOCKS = buildSectionRocks();
const SNOW_POSITIONS = buildSnowPositions();
const ROCK_BASE_COLOR = '#c2d6e8';
const rockHelper = new Object3D();
rockHelper.rotation.order = 'YXZ';

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

export const ShaftDebris = () => (
  <instancedMesh
    args={[undefined, undefined, SHAFT_BLOCKS.length]}
    ref={(mesh) => {
      applyBlockInstances(mesh, SHAFT_BLOCKS, '#5f7591');
    }}
  >
    <boxGeometry />
    <meshStandardMaterial roughness={0.9} metalness={0.06} />
  </instancedMesh>
);

export const IceShaft = () => (
  <mesh position={[0, -40, 16]}>
    <cylinderGeometry args={[12.5, 14, 78, 16, 8, true]} />
    <meshStandardMaterial
      color="#3d5269"
      roughness={0.92}
      metalness={0.05}
      flatShading
      side={BackSide}
    />
  </mesh>
);

const applyRockColors = (mesh: InstancedMesh | null): void => {
  if (!mesh) {
    return;
  }
  const tint = new Color();
  const base = new Color(ROCK_BASE_COLOR);
  SECTION_ROCK_BLOCKS.forEach((block, index) => {
    tint.copy(base).multiplyScalar(block.shade);
    mesh.setColorAt(index, tint);
  });
  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true;
  }
};

type SectionRocksParams = {
  progressRef: RefObject<number>;
};

export const SectionRocks = ({ progressRef }: SectionRocksParams) => {
  const meshRef = useRef<InstancedMesh | null>(null);
  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    const progress = progressRef.current;
    const idle = state.clock.elapsedTime * 0.25;
    SECTION_ROCKS.forEach((rock, index) => {
      const block = SECTION_ROCK_BLOCKS[index];
      const travel = progress - rock.center;
      rockHelper.position.set(
        rock.x,
        PARKED_EYE_Y + travel * ROCK_RISE_RATE,
        rock.z,
      );
      rockHelper.rotation.set(
        block.rotation[0],
        block.rotation[1] + travel * ROCK_SPIN_RATE + idle,
        block.rotation[2],
      );
      rockHelper.scale.set(block.scale[0], block.scale[1], block.scale[2]);
      rockHelper.updateMatrix();
      mesh.setMatrixAt(index, rockHelper.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={(mesh) => {
        meshRef.current = mesh;
        applyRockColors(mesh);
      }}
      args={[undefined, undefined, SECTION_ROCKS.length]}
    >
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        flatShading
        roughness={0.82}
        metalness={0.06}
        emissive="#5f7c96"
        emissiveIntensity={0.32}
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
