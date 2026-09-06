'use client';

import { RoundedBox } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { Color, InstancedMesh, Object3D } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import type { DivePalette } from './dive-palette';

type MechanicalKeyboardParams = {
  palette: DivePalette;
};

type Keycap = {
  x: number;
  z: number;
  width: number;
  tone: 'accent' | 'base';
};

const UNIT = 0.34;
const KeycapGeometry = extend(RoundedBoxGeometry);
const KEY_ROWS = [
  [...Array<number>(13).fill(1), 2],
  [1.5, ...Array<number>(12).fill(1), 1.5],
  [1.75, ...Array<number>(11).fill(1), 2.25],
  [2.25, ...Array<number>(10).fill(1), 1.75, 1],
  [1.25, 1.25, 1.25, 6.25, 1, 1, 1, 1, 1],
];

const KEYCAPS: Keycap[] = KEY_ROWS.flatMap((row, rowIndex) => {
  let offset = -7.5;
  return row.map((width, index) => {
    const key: Keycap = {
      x: (offset + width / 2) * UNIT,
      z: (rowIndex - 2) * UNIT,
      width: width * UNIT - 0.035,
      tone:
        (rowIndex === 0 && index === 0) ||
        (rowIndex === 2 && index === row.length - 1)
          ? 'accent'
          : 'base',
    };
    offset += width;
    return key;
  });
});

const placeKeycaps = (
  mesh: InstancedMesh | null,
  palette: DivePalette,
): void => {
  if (!mesh) {
    return;
  }
  const transform = new Object3D();
  const base = new Color(palette.metal);
  const accent = new Color(palette.highlight);
  KEYCAPS.forEach((key, index) => {
    transform.position.set(key.x, 0.3, key.z);
    transform.scale.set(key.width, 0.18, UNIT - 0.035);
    transform.updateMatrix();
    mesh.setMatrixAt(index, transform.matrix);
    mesh.setColorAt(index, key.tone === 'accent' ? accent : base);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true;
  }
};

export default function MechanicalKeyboard({
  palette,
}: MechanicalKeyboardParams) {
  return (
    <group>
      <RoundedBox args={[5.7, 0.34, 2.08]} radius={0.12} smoothness={3}>
        <meshStandardMaterial
          color={palette.accent}
          metalness={0.15}
          roughness={0.4}
          toneMapped={false}
        />
      </RoundedBox>
      <RoundedBox
        args={[5.46, 0.05, 1.87]}
        position={[0, 0.18, 0]}
        radius={0.035}
        smoothness={2}
      >
        <meshStandardMaterial color={palette.background} roughness={0.6} />
      </RoundedBox>
      <instancedMesh
        args={[undefined, undefined, KEYCAPS.length]}
        ref={(mesh) => placeKeycaps(mesh, palette)}
      >
        <KeycapGeometry attach="geometry" args={[1, 1, 1, 2, 0.12]} />
        <meshStandardMaterial
          roughness={0.45}
          metalness={0.08}
          toneMapped={false}
        />
      </instancedMesh>
      <mesh position={[2.73, 0.06, 0]}>
        <boxGeometry args={[0.025, 0.065, 1.3]} />
        <meshStandardMaterial
          color={palette.highlight}
          emissive={palette.highlight}
          emissiveIntensity={0.08}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, -0.16, 0.99]}>
        <boxGeometry args={[3.2, 0.055, 0.025]} />
        <meshStandardMaterial
          color={palette.metal}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
