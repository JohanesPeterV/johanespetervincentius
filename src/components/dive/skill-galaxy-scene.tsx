'use client';

import { useCursor } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { RefObject, useRef, useState } from 'react';
import { Group, InstancedMesh, Object3D } from 'three';

import { techSectionOpacity } from './descent';
import {
  GALAXY_LINKS,
  GALAXY_MOTION,
  GALAXY_NODES,
  advanceGalaxy,
  galaxyEngage,
  writeGalaxyPose,
} from './skill-galaxy';

type SkillGalaxySceneParams = {
  accentColor: string;
  progressRef: RefObject<number>;
  onEngage: (category: number | null) => void;
};

const HUB_NODE_SCALE = 2.4;
const HOVER_BOOST = 1.6;
const CLICK_DRAG_THRESHOLD = 5;
const nodeHelper = new Object3D();

export default function SkillGalaxyScene({
  accentColor,
  progressRef,
  onEngage,
}: SkillGalaxySceneParams) {
  const groupRef = useRef<Group>(null);
  const nodesRef = useRef<InstancedMesh>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const handlePointerMove = (event: ThreeEvent<PointerEvent>): void => {
    if (event.instanceId === undefined) {
      return;
    }
    GALAXY_MOTION.hovered = event.instanceId;
    setHovered(true);
  };

  const handlePointerOut = (): void => {
    GALAXY_MOTION.hovered = null;
    setHovered(false);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>): void => {
    if (event.instanceId === undefined || event.delta > CLICK_DRAG_THRESHOLD) {
      return;
    }
    const node = GALAXY_NODES[event.instanceId];
    if (!GALAXY_MOTION.exploring) {
      onEngage(node.kind === 'hub' ? node.category : null);
      return;
    }
    if (node.kind === 'skill' && node.link) {
      window.open(node.link, '_blank', 'noopener');
      return;
    }
    galaxyEngage(GALAXY_MOTION.focus === node.category ? null : node.category);
  };

  useFrame(({ size }, delta) => {
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
    advanceGalaxy(delta);
    const scale = writeGalaxyPose(
      progress,
      size.width / size.height,
      group.position,
      group.quaternion,
    );
    group.scale.setScalar(scale);
    GALAXY_NODES.forEach((node, index) => {
      nodeHelper.position.copy(node.position);
      const base = node.kind === 'hub' ? HUB_NODE_SCALE : 1;
      const boost = GALAXY_MOTION.hovered === index ? HOVER_BOOST : 1;
      nodeHelper.scale.setScalar(base * boost);
      nodeHelper.updateMatrix();
      nodes.setMatrixAt(index, nodeHelper.matrix);
    });
    nodes.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} visible={false}>
      <instancedMesh
        ref={nodesRef}
        args={[undefined, undefined, GALAXY_NODES.length]}
        frustumCulled={false}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <octahedronGeometry args={[0.055, 0]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.6}
          roughness={0.4}
        />
      </instancedMesh>
      <mesh>
        <icosahedronGeometry args={[0.24, 1]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.85}
          roughness={0.3}
        />
      </mesh>
      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[GALAXY_LINKS, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={accentColor}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
