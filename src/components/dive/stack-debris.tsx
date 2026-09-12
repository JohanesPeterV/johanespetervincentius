'use client';

import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RefObject, useRef } from 'react';
import {
  Group,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
} from 'three';

import { STACK_STONE, narrativeStoneY, stoneSectionOpacity } from './descent';
import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import {
  CORES,
  DRIFTERS,
  ORBIT_DEPTH,
  SATELLITES,
  SYSTEMS,
  TAU,
} from './stack-orbits';

type StackDebrisParams = {
  palette: DivePalette;
  progressRef: RefObject<number>;
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

type StackMaterials = {
  bodies: Record<Tier, MeshStandardMaterial>;
  ring: MeshBasicMaterial;
};

const FIELD_HALF_WIDTH = 7.5;
const CROSSING_SHARE = 0.35;
const PARKED_Z = 30;
// REASON: a ring is a unit torus stretched to the orbit and tilted so its far
// side leans back into the scene, the same line its satellites travel
const ringTilt = (rise: number): number => Math.atan2(ORBIT_DEPTH, rise);
const ringStretch = (rise: number): number => Math.hypot(rise, ORBIT_DEPTH);
const RING_ALPHA: Record<DivePalette['mode'], number> = {
  light: 0.7,
  dark: 0.25,
};
const OCTAHEDRON = new OctahedronGeometry(1, 0);

const createBodyMaterial = (): MeshStandardMaterial =>
  new MeshStandardMaterial({
    roughness: 1,
    metalness: 0,
    flatShading: true,
    toneMapped: false,
    fog: false,
    transparent: true,
  });

const createStackMaterials = (): StackMaterials => ({
  bodies: {
    core: createBodyMaterial(),
    satellite: createBodyMaterial(),
    drifter: createBodyMaterial(),
  },
  ring: new MeshBasicMaterial({
    toneMapped: false,
    fog: false,
    transparent: true,
    depthWrite: false,
  }),
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
  motionMode,
}: StackDebrisParams) {
  const groupRef = useRef<Group>(null);
  const coreRefs = useRef<(Group | null)[]>([]);
  const satelliteRefs = useRef<SatelliteRefs[]>(
    SATELLITES.map(() => ({ body: null, label: null })),
  );
  const drifterRefs = useRef<(Group | null)[]>([]);
  const elapsedRef = useRef(0);
  const alphaRef = useRef(-1);
  // REASON: one material per tier so the chapter fades every body at once
  const materialsRef = useRef<StackMaterials | null>(null);
  if (materialsRef.current === null) {
    materialsRef.current = createStackMaterials();
  }
  const { bodies, ring } = materialsRef.current;

  // REASON: drei Html portals the labels next to the event target, not the
  // canvas, so the chapter alpha is set on the dive root holding both
  useFrame(({ gl }, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const progress = progressRef.current;
    const alpha = stoneSectionOpacity(progress, STACK_STONE.center);
    group.visible = alpha > 0;
    bodies.core.color.set(palette.accent);
    bodies.satellite.color.set(palette.highlight);
    bodies.drifter.color.set(palette.highlight);
    ring.color.set(palette.highlight);
    bodies.core.opacity = alpha;
    bodies.satellite.opacity = alpha;
    bodies.drifter.opacity = alpha;
    ring.opacity = alpha * RING_ALPHA[palette.mode];
    const scene = gl.domElement.closest('[data-dive-scene]');
    if (scene instanceof HTMLElement && alpha !== alphaRef.current) {
      alphaRef.current = alpha;
      scene.style.setProperty('--stack-alpha', String(alpha));
    }
    if (!group.visible) {
      return;
    }
    if (motionMode === 'full') {
      elapsedRef.current += Math.min(delta, 0.1);
    }
    const time = elapsedRef.current;
    group.position.set(
      0,
      narrativeStoneY(progress, STACK_STONE.center),
      STACK_STONE.z,
    );
    CORES.forEach((body, index) => {
      const object = coreRefs.current[index];
      if (!object) {
        return;
      }
      object.position.set(
        body.x + Math.sin(time * 0.31 + body.phase) * 0.12,
        body.y + Math.sin(time * 0.47 + body.phase) * 0.14,
        0,
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
      const system = SYSTEMS[body.system];
      const angle = (time / system.period) * TAU + body.phase;
      const toward = Math.sin(angle);
      object.position.set(
        system.x + Math.cos(angle) * system.radius,
        system.y + toward * system.rise,
        toward * ORBIT_DEPTH,
      );
      object.rotation.set(time * 0.2 + index, time * 0.12 + index, 0.3);
      // REASON: every name stays legible around the ring; the far side only
      // dims so the orbit reads as depth rather than a flat wheel
      const depth = 0.4 + 0.3 * (toward + 1);
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
        body.y + Math.sin(time * 0.4 + index) * 0.15,
        body.z,
      );
      object.rotation.set(time * 0.2 + index, time * 0.12 + index, 0.3);
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      {SYSTEMS.map((system) => (
        <mesh
          key={system.name}
          position={[system.x, system.y, 0]}
          rotation={[ringTilt(system.rise), 0, 0]}
          scale={[system.radius, ringStretch(system.rise), 1]}
          material={ring}
        >
          <torusGeometry args={[1, 0.012, 3, 128]} />
        </mesh>
      ))}
      {CORES.map((body, index) => (
        <Body
          key={body.name}
          name={body.name}
          material={bodies.core}
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
          material={bodies.satellite}
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
          material={bodies.drifter}
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
