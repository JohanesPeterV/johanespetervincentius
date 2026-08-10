'use client';

import { useFrame } from '@react-three/fiber';
import { RefObject, useRef } from 'react';
import { Group, InstancedMesh, Object3D, Vector3 } from 'three';

import { TECH_STONE, narrativeStoneY, techSectionOpacity } from './descent';
import {
  DIAL_RADIUS,
  DIAL_TILT,
  SKILL_DIAL_ENTRIES,
  categoryAlpha,
  skillDialPlacement,
  writeSkillNodeLocal,
} from './skill-dial';

type SkillDialRingParams = {
  accentColor: string;
  progressRef: RefObject<number>;
};

const HIDDEN_NODE_SCALE = 0.001;
const nodeHelper = new Object3D();
const nodeLocal = new Vector3();

export default function SkillDialRing({
  accentColor,
  progressRef,
}: SkillDialRingParams) {
  const groupRef = useRef<Group>(null);
  const nodesRef = useRef<InstancedMesh>(null);

  useFrame(({ size }) => {
    const group = groupRef.current;
    const nodes = nodesRef.current;
    if (!group || !nodes) {
      return;
    }
    const progress = progressRef.current;
    const visible = techSectionOpacity(progress) > 0;
    if (group.visible !== visible) {
      group.visible = visible;
    }
    if (!visible) {
      return;
    }
    const placement = skillDialPlacement(size.width / size.height);
    group.position.set(
      placement.x,
      narrativeStoneY(progress, TECH_STONE.center) + placement.y,
      TECH_STONE.z,
    );
    group.scale.setScalar(placement.scale);
    SKILL_DIAL_ENTRIES.forEach((entry, index) => {
      const alpha = categoryAlpha(progress, entry.category);
      writeSkillNodeLocal(index, progress, nodeLocal);
      nodeHelper.position.copy(nodeLocal);
      nodeHelper.scale.setScalar(Math.max(HIDDEN_NODE_SCALE, alpha));
      nodeHelper.updateMatrix();
      nodes.setMatrixAt(index, nodeHelper.matrix);
    });
    nodes.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} visible={false}>
      <instancedMesh
        ref={nodesRef}
        args={[undefined, undefined, SKILL_DIAL_ENTRIES.length]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[0.05, 0]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.55}
          roughness={0.4}
        />
      </instancedMesh>
      <mesh rotation={[DIAL_TILT, 0, 0]} frustumCulled={false}>
        <torusGeometry args={[DIAL_RADIUS, 0.012, 8, 128]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
