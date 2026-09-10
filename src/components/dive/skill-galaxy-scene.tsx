'use client';

import { useCursor } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { RefObject, useRef, useState } from 'react';
import { Color, Group, InstancedMesh, Object3D } from 'three';

import { techSectionOpacity } from './descent';
import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import {
  GALAXY_MOTION,
  GALAXY_NODES,
  GALAXY_RINGS,
  advanceGalaxy,
  galaxyEngage,
  writeGalaxyPose,
} from './skill-galaxy';

type SkillGalaxySceneParams = {
  palette: DivePalette;
  progressRef: RefObject<number>;
  onEngage: (category: number | null) => void;
  motionMode: MotionMode;
};

const HUB_NODE_SCALE = 2.2;
const HOVER_BOOST = 1.3;
const CLICK_DRAG_THRESHOLD = 5;
const nodeHelper = new Object3D();
const nodeColor = new Color();

export default function SkillGalaxyScene({
  palette,
  progressRef,
  onEngage,
  motionMode,
}: SkillGalaxySceneParams) {
  const groupRef = useRef<Group>(null);
  const nodesRef = useRef<InstancedMesh>(null);
  const paintedRef = useRef('');
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  // REASON: orbit lines glow in the dark but are pigment on paper, which needs more coverage.
  const ringOpacity = palette.mode === 'light' ? 0.7 : 0.3;

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
    advanceGalaxy(Math.min(delta, 0.1), motionMode);
    const scale = writeGalaxyPose(
      progress,
      size.width / size.height,
      group.position,
      group.quaternion,
    );
    group.scale.setScalar(scale);
    const paint = `${palette.accent}|${palette.highlight}`;
    const repaint = paintedRef.current !== paint;
    const tumble = GALAXY_MOTION.orbit;
    GALAXY_NODES.forEach((node, index) => {
      nodeHelper.position.copy(node.position);
      nodeHelper.rotation.set(
        index * 0.7 + tumble * 0.3,
        index + tumble * 0.2,
        0.3,
      );
      const base = node.kind === 'hub' ? HUB_NODE_SCALE : 1;
      const boost = GALAXY_MOTION.hovered === index ? HOVER_BOOST : 1;
      nodeHelper.scale.setScalar(base * boost);
      nodeHelper.updateMatrix();
      nodes.setMatrixAt(index, nodeHelper.matrix);
      if (repaint) {
        nodeColor.set(node.kind === 'hub' ? palette.accent : palette.highlight);
        nodes.setColorAt(index, nodeColor);
      }
    });
    nodes.instanceMatrix.needsUpdate = true;
    if (repaint && nodes.instanceColor) {
      nodes.instanceColor.needsUpdate = true;
      paintedRef.current = paint;
    }
  }, -1);

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
        <octahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial
          roughness={1}
          metalness={0}
          flatShading
          toneMapped={false}
          fog={false}
        />
      </instancedMesh>
      <mesh>
        <icosahedronGeometry args={[0.44, 1]} />
        <meshStandardMaterial
          color={palette.accent}
          roughness={1}
          metalness={0}
          flatShading
          toneMapped={false}
          fog={false}
        />
      </mesh>
      {GALAXY_RINGS.map((ring) => (
        <mesh key={ring.radius} rotation={ring.tilt}>
          <torusGeometry args={[ring.radius, 0.006, 3, 128]} />
          <meshBasicMaterial
            color={palette.highlight}
            transparent
            opacity={ringOpacity}
            toneMapped={false}
            fog={false}
          />
        </mesh>
      ))}
    </group>
  );
}
