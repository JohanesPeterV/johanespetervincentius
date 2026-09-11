'use client';

import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RefObject, useRef } from 'react';
import { Group } from 'three';

import { STACK } from '@/app/_components/stack';
import {
  PROJECTS_STONE,
  WORK_STONE,
  narrativeStoneY,
  stoneSectionOpacity,
} from './descent';
import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import type { HeroHandoff } from './hero-handoff';

type StackDebrisParams = {
  palette: DivePalette;
  progressRef: RefObject<number>;
  handoffRef: RefObject<HeroHandoff>;
  motionMode: MotionMode;
};

// REASON: the main stack hangs on a line above the work deck; the rest
// blow through the projects chapter across its full height
const WORK_LINE_RISE = 1.4;
const FIELD_HALF_WIDTH = 7.5;
const CROSSING_SHARE = 0.35;
const PARKED_Z = 30;

const PRIMARY = STACK.primary.map((name, index) => ({
  name,
  x: -5.9 + (10.2 * index) / (STACK.primary.length - 1),
  phase: index * 1.7,
}));

const SECONDARY = STACK.secondary.map((name, index) => ({
  name,
  y: -3.4 + (((index * 7) % 26) / 25) * 6.8,
  z: PROJECTS_STONE.z - 1 + ((index * 3) % 5) * 0.5,
  period: 40 + ((index * 11) % 30),
  phase: (index * 0.37) % 1,
  direction: index % 2 === 0 ? 1 : -1,
  scale: 0.13 + ((index * 5) % 4) * 0.02,
}));

type BodyProps = {
  name: string;
  color: string;
  tier: 'primary' | 'secondary';
  scale: number;
  bodyRef: (element: Group | null) => void;
};

const Body = ({ name, color, tier, scale, bodyRef }: BodyProps) => (
  <group ref={bodyRef} scale={scale}>
    <mesh>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        roughness={1}
        metalness={0}
        flatShading
        toneMapped={false}
        fog={false}
      />
    </mesh>
    <Html
      wrapperClass="stack-debris-label"
      position={[1.7, 0, 0]}
      zIndexRange={[0, 0]}
    >
      <span className="stack-debris-name" data-tier={tier}>
        {name}
      </span>
    </Html>
  </group>
);

export default function StackDebris({
  palette,
  progressRef,
  handoffRef,
  motionMode,
}: StackDebrisParams) {
  const groupRef = useRef<Group>(null);
  const primaryRefs = useRef<(Group | null)[]>([]);
  const secondaryRefs = useRef<(Group | null)[]>([]);
  const elapsedRef = useRef(0);
  const alphaRef = useRef({ primary: -1, secondary: -1 });

  // REASON: drei Html portals the labels next to the event target, not the
  // canvas, so each tier's chapter alpha is set on the dive root holding both
  useFrame(({ gl }, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const progress = progressRef.current;
    const workOpacity = stoneSectionOpacity(progress, WORK_STONE.center);
    const projectsOpacity = stoneSectionOpacity(
      progress,
      PROJECTS_STONE.center,
    );
    group.visible = workOpacity > 0 || projectsOpacity > 0;
    // REASON: the crossing renders the scene at its destination pose and wipes
    // it in under the etched edge; the labels are DOM the wipe cannot cover,
    // so they wait until the compositor hands back to live HTML
    const compositing = handoffRef.current.compositing;
    const alpha = {
      primary: compositing ? 0 : workOpacity,
      secondary: compositing ? 0 : projectsOpacity,
    };
    const scene = gl.domElement.closest('[data-dive-scene]');
    if (
      scene instanceof HTMLElement &&
      (alpha.primary !== alphaRef.current.primary ||
        alpha.secondary !== alphaRef.current.secondary)
    ) {
      alphaRef.current = alpha;
      scene.style.setProperty('--stack-alpha-primary', String(alpha.primary));
      scene.style.setProperty(
        '--stack-alpha-secondary',
        String(alpha.secondary),
      );
    }
    if (!group.visible) {
      return;
    }
    if (motionMode === 'full') {
      elapsedRef.current += Math.min(delta, 0.1);
    }
    const time = elapsedRef.current;
    const lineY = narrativeStoneY(progress, WORK_STONE.center) + WORK_LINE_RISE;
    const fieldY = narrativeStoneY(progress, PROJECTS_STONE.center);
    PRIMARY.forEach((body, index) => {
      const object = primaryRefs.current[index];
      if (!object) {
        return;
      }
      object.position.set(
        body.x + Math.sin(time * 0.31 + body.phase) * 0.35,
        lineY + Math.sin(time * 0.47 + body.phase) * 0.14,
        WORK_STONE.z,
      );
      object.rotation.set(
        time * 0.15 + body.phase,
        time * 0.1 + body.phase,
        0.3,
      );
    });
    SECONDARY.forEach((body, index) => {
      const object = secondaryRefs.current[index];
      if (!object) {
        return;
      }
      const cycle = (time / body.period + body.phase) % 1;
      if (cycle > CROSSING_SHARE) {
        object.position.z = PARKED_Z;
        return;
      }
      const travel = cycle / CROSSING_SHARE;
      object.position.set(
        body.direction * (FIELD_HALF_WIDTH * (2 * travel - 1)),
        fieldY + body.y + Math.sin(time * 0.4 + index) * 0.15,
        body.z,
      );
      object.rotation.set(time * 0.2 + index, time * 0.12 + index, 0.3);
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      {PRIMARY.map((body, index) => (
        <Body
          key={body.name}
          name={body.name}
          color={palette.accent}
          tier="primary"
          scale={0.26}
          bodyRef={(element) => {
            primaryRefs.current[index] = element;
          }}
        />
      ))}
      {SECONDARY.map((body, index) => (
        <Body
          key={body.name}
          name={body.name}
          color={palette.highlight}
          tier="secondary"
          scale={body.scale}
          bodyRef={(element) => {
            secondaryRefs.current[index] = element;
          }}
        />
      ))}
    </group>
  );
}
