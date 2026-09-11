'use client';

import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RefObject, useRef } from 'react';
import { Group } from 'three';

import { STACK } from '@/app/_components/stack';
import { WORK_STONE, narrativeStoneY, stoneSectionOpacity } from './descent';
import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';

type StackDebrisParams = {
  palette: DivePalette;
  progressRef: RefObject<number>;
  motionMode: MotionMode;
};

// REASON: the seam between the two card decks sits under the work stone; the
// main bodies hover there and the rest cross the chapter's full height
const SEAM_DROP = -0.85;
const FIELD_HALF_WIDTH = 7.5;
const CROSSING_SHARE = 0.35;
const PARKED_Z = 30;

const PRIMARY = STACK.primary.map((name, index) => ({
  name,
  x: -5.4 + (10.8 * index) / (STACK.primary.length - 1),
  phase: index * 1.7,
}));

const SECONDARY = STACK.secondary.map((name, index) => ({
  name,
  y: -3.4 + (((index * 7) % 26) / 25) * 6.8,
  z: WORK_STONE.z - 1 + ((index * 3) % 5) * 0.5,
  period: 40 + ((index * 11) % 30),
  phase: (index * 0.37) % 1,
  direction: index % 2 === 0 ? 1 : -1,
  scale: 0.13 + ((index * 5) % 4) * 0.02,
}));

type BodyProps = {
  name: string;
  color: string;
  labelClass: string;
  scale: number;
  bodyRef: (element: Group | null) => void;
};

const Body = ({ name, color, labelClass, scale, bodyRef }: BodyProps) => (
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
      <span className={`type-meta whitespace-nowrap ${labelClass}`}>
        {name}
      </span>
    </Html>
  </group>
);

export default function StackDebris({
  palette,
  progressRef,
  motionMode,
}: StackDebrisParams) {
  const groupRef = useRef<Group>(null);
  const primaryRefs = useRef<(Group | null)[]>([]);
  const secondaryRefs = useRef<(Group | null)[]>([]);
  const elapsedRef = useRef(0);
  const alphaRef = useRef(-1);

  // REASON: drei Html portals the labels next to the event target, not the
  // canvas, so the chapter alpha is set on the dive root that contains both
  useFrame(({ gl }, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const progress = progressRef.current;
    const opacity = stoneSectionOpacity(progress, WORK_STONE.center);
    group.visible = opacity > 0;
    if (alphaRef.current !== opacity) {
      alphaRef.current = opacity;
      const scene = gl.domElement.closest('[data-dive-scene]');
      if (scene instanceof HTMLElement) {
        scene.style.setProperty('--stack-alpha', String(opacity));
      }
    }
    if (!group.visible) {
      return;
    }
    if (motionMode === 'full') {
      elapsedRef.current += Math.min(delta, 0.1);
    }
    const time = elapsedRef.current;
    const seamY = narrativeStoneY(progress, WORK_STONE.center) + SEAM_DROP;
    PRIMARY.forEach((body, index) => {
      const object = primaryRefs.current[index];
      if (!object) {
        return;
      }
      object.position.set(
        body.x + Math.sin(time * 0.31 + body.phase) * 0.35,
        seamY + Math.sin(time * 0.47 + body.phase) * 0.14,
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
        seamY + body.y + Math.sin(time * 0.4 + index) * 0.15,
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
          labelClass="text-primary-text"
          scale={0.22}
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
          labelClass="text-muted-foreground"
          scale={body.scale}
          bodyRef={(element) => {
            secondaryRefs.current[index] = element;
          }}
        />
      ))}
    </group>
  );
}
