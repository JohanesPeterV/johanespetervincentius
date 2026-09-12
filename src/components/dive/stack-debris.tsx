'use client';

import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RefObject, useRef } from 'react';
import { Group, MeshStandardMaterial, OctahedronGeometry } from 'three';

import { STACK } from '@/app/_components/stack';
import {
  PROJECTS_STONE,
  WORK_STONE,
  narrativeStoneY,
  stoneSectionOpacity,
} from './descent';
import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import { orbitalArrival } from './hero-handoff';
import type { HeroHandoff } from './hero-handoff';

type StackDebrisParams = {
  palette: DivePalette;
  progressRef: RefObject<number>;
  handoffRef: RefObject<HeroHandoff>;
  motionMode: MotionMode;
};

type Tier = 'core' | 'satellite' | 'drifter';

type BodyProps = {
  name: string;
  material: MeshStandardMaterial;
  tier: Tier;
  scale: number;
  bodyRef: (element: Group | null) => void;
  labelRef?: (element: HTMLSpanElement | null) => void;
};

type SatelliteRefs = { body: Group | null; label: HTMLSpanElement | null };

// REASON: each group's cores hang on a line above the work deck with their
// satellites orbiting them, near side rising clear of the core labels and
// far side ducking behind the deck; the drifters blow through the projects
// chapter
const WORK_LINE_RISE = 1.4;
const GROUP_SPACING = 2.4;
const GROUP_CENTER_X = -0.8;
const CORE_SPREAD = 0.45;
const ORBIT_DEPTH = 0.9;
const FIELD_HALF_WIDTH = 7.5;
const CROSSING_SHARE = 0.35;
const PARKED_Z = 30;
const TAU = Math.PI * 2;
const OCTAHEDRON = new OctahedronGeometry(1, 0);

const groupX = (group: number): number =>
  GROUP_CENTER_X + (group - (STACK.groups.length - 1) / 2) * GROUP_SPACING;

const CORES = STACK.groups.flatMap((group, groupIndex) =>
  group.core.map((name, index) => ({
    name,
    x: groupX(groupIndex) + (2 * index - (group.core.length - 1)) * CORE_SPREAD,
    phase: groupIndex * 1.7 + index * 0.9,
  })),
);

const SATELLITES = STACK.groups.flatMap((group, groupIndex) =>
  group.satellites.map((name, index) => ({
    name,
    centerX: groupX(groupIndex),
    radius: 0.55 + group.satellites.length * 0.08,
    incline: 0.5 + (index % 3) * 0.12,
    period: (36 + groupIndex * 6) * (groupIndex % 2 === 0 ? 1 : -1),
    phase: (index / group.satellites.length) * TAU,
    scale: 0.13 + (index % 3) * 0.02,
  })),
);

const DRIFTERS = STACK.drifters.map((name, index) => ({
  name,
  y: -3.4 + (index / (STACK.drifters.length - 1)) * 6.8,
  z: PROJECTS_STONE.z - 1 + ((index * 3) % 5) * 0.5,
  period: 40 + ((index * 11) % 30),
  phase: (index * 0.37) % 1,
  direction: index % 2 === 0 ? 1 : -1,
  scale: 0.13 + ((index * 5) % 4) * 0.02,
}));

const createBodyMaterial = (): MeshStandardMaterial =>
  new MeshStandardMaterial({
    roughness: 1,
    metalness: 0,
    flatShading: true,
    toneMapped: false,
    fog: false,
    transparent: true,
  });

const Body = ({
  name,
  material,
  tier,
  scale,
  bodyRef,
  labelRef,
}: BodyProps) => (
  <group ref={bodyRef} scale={scale}>
    <mesh geometry={OCTAHEDRON} material={material} />
    <Html
      wrapperClass="stack-debris-label"
      position={[1.7, 0, 0]}
      zIndexRange={[0, 0]}
    >
      <span ref={labelRef} className="stack-debris-name" data-tier={tier}>
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
  const coreRefs = useRef<(Group | null)[]>([]);
  const satelliteRefs = useRef<SatelliteRefs[]>(
    SATELLITES.map(() => ({ body: null, label: null })),
  );
  const drifterRefs = useRef<(Group | null)[]>([]);
  const elapsedRef = useRef(0);
  const alphaRef = useRef({ work: -1, projects: -1 });
  // REASON: one material per tier so a chapter fades every body at once
  const materialsRef = useRef<Record<Tier, MeshStandardMaterial> | null>(null);
  if (materialsRef.current === null) {
    materialsRef.current = {
      core: createBodyMaterial(),
      satellite: createBodyMaterial(),
      drifter: createBodyMaterial(),
    };
  }
  const materials = materialsRef.current;

  // REASON: drei Html portals the labels next to the event target, not the
  // canvas, so each chapter's alpha is set on the dive root holding both
  useFrame(({ gl }, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const progress = progressRef.current;
    const arrival = orbitalArrival(handoffRef.current);
    const alpha = {
      work: stoneSectionOpacity(progress, WORK_STONE.center) * arrival,
      projects: stoneSectionOpacity(progress, PROJECTS_STONE.center),
    };
    group.visible = alpha.work > 0 || alpha.projects > 0;
    materials.core.color.set(palette.accent);
    materials.satellite.color.set(palette.highlight);
    materials.drifter.color.set(palette.highlight);
    materials.core.opacity = alpha.work;
    materials.satellite.opacity = alpha.work;
    materials.drifter.opacity = alpha.projects;
    const scene = gl.domElement.closest('[data-dive-scene]');
    if (
      scene instanceof HTMLElement &&
      (alpha.work !== alphaRef.current.work ||
        alpha.projects !== alphaRef.current.projects)
    ) {
      alphaRef.current = alpha;
      scene.style.setProperty('--stack-alpha-work', String(alpha.work));
      scene.style.setProperty('--stack-alpha-projects', String(alpha.projects));
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
    CORES.forEach((body, index) => {
      const object = coreRefs.current[index];
      if (!object) {
        return;
      }
      object.position.set(
        body.x + Math.sin(time * 0.31 + body.phase) * 0.2,
        lineY + Math.sin(time * 0.47 + body.phase) * 0.14,
        WORK_STONE.z,
      );
      object.rotation.set(
        time * 0.15 + body.phase,
        time * 0.1 + body.phase,
        0.3,
      );
    });
    SATELLITES.forEach((body, index) => {
      const { body: object, label } = satelliteRefs.current[index];
      if (!object || !label) {
        return;
      }
      const angle = (time / body.period) * TAU + body.phase;
      const toward = Math.sin(angle);
      object.position.set(
        body.centerX + Math.cos(angle) * body.radius,
        lineY + toward * body.incline,
        WORK_STONE.z + toward * ORBIT_DEPTH,
      );
      object.rotation.set(time * 0.2 + index, time * 0.12 + index, 0.3);
      // REASON: the label only reads on the near side of the orbit, so the
      // name comes and goes with the body instead of piling up behind the core
      const depth = Math.min(1, Math.max(0, (toward - 0.4) / 0.5));
      label.style.setProperty('--stack-depth', depth.toFixed(3));
    });
    DRIFTERS.forEach((body, index) => {
      const object = drifterRefs.current[index];
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
      {CORES.map((body, index) => (
        <Body
          key={body.name}
          name={body.name}
          material={materials.core}
          tier="core"
          scale={0.26}
          bodyRef={(element) => {
            coreRefs.current[index] = element;
          }}
        />
      ))}
      {SATELLITES.map((body, index) => (
        <Body
          key={body.name}
          name={body.name}
          material={materials.satellite}
          tier="satellite"
          scale={body.scale}
          bodyRef={(element) => {
            satelliteRefs.current[index].body = element;
          }}
          labelRef={(element) => {
            satelliteRefs.current[index].label = element;
          }}
        />
      ))}
      {DRIFTERS.map((body, index) => (
        <Body
          key={body.name}
          name={body.name}
          material={materials.drifter}
          tier="drifter"
          scale={body.scale}
          bodyRef={(element) => {
            drifterRefs.current[index] = element;
          }}
        />
      ))}
    </group>
  );
}
