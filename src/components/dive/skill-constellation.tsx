'use client';

import { useFrame } from '@react-three/fiber';
import { RefObject, useRef } from 'react';
import { Group, InstancedMesh, Object3D, Vector3 } from 'three';

import { TECH_STONE, narrativeStoneY, stoneSectionOpacity } from './descent';
import {
  SKILL_ORBIT_ENTRIES,
  SKILL_ORBIT_RINGS,
  skillOrbitPlacement,
  writeSkillLocalPosition,
} from './skill-orbit';

type SkillConstellationParams = {
  accentColor: string;
  progressRef: RefObject<number>;
};

const CATEGORY_NODE_SCALE = 1.7;
const nodeHelper = new Object3D();
const nodeLocal = new Vector3();

export default function SkillConstellation({
  accentColor,
  progressRef,
}: SkillConstellationParams) {
  const groupRef = useRef<Group>(null);
  const nodesRef = useRef<InstancedMesh>(null);

  useFrame(({ size }) => {
    const group = groupRef.current;
    const nodes = nodesRef.current;
    if (!group || !nodes) {
      return;
    }
    const progress = progressRef.current;
    const visible = stoneSectionOpacity(progress, TECH_STONE.center) > 0;
    if (group.visible !== visible) {
      group.visible = visible;
    }
    if (!visible) {
      return;
    }
    const placement = skillOrbitPlacement(size.width / size.height);
    group.position.set(
      placement.x,
      narrativeStoneY(progress, TECH_STONE.center) + placement.y,
      TECH_STONE.z,
    );
    group.scale.setScalar(placement.scale);
    SKILL_ORBIT_ENTRIES.forEach((entry, index) => {
      writeSkillLocalPosition(index, progress, nodeLocal);
      nodeHelper.position.copy(nodeLocal);
      nodeHelper.scale.setScalar(
        entry.kind === 'category' ? CATEGORY_NODE_SCALE : 1,
      );
      nodeHelper.updateMatrix();
      nodes.setMatrixAt(index, nodeHelper.matrix);
    });
    nodes.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} visible={false}>
      <instancedMesh
        ref={nodesRef}
        args={[undefined, undefined, SKILL_ORBIT_ENTRIES.length]}
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
      {SKILL_ORBIT_RINGS.map((ring) => (
        <mesh
          key={`${ring.tilt[0]}-${ring.tilt[1]}`}
          rotation={[ring.tilt[0], ring.tilt[1], 0]}
          frustumCulled={false}
        >
          <torusGeometry args={[ring.radius, 0.012, 8, 96]} />
          <meshBasicMaterial
            color={accentColor}
            transparent
            opacity={0.16}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
