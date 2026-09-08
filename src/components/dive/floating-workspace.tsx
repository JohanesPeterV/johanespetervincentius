'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Group } from 'three';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import { createSpaceOrigin } from './space-origin';
import { createWorkspaceModels } from './workspace-models';

type FloatingWorkspaceParams = {
  palette: DivePalette;
  motionMode: MotionMode;
};

type DevicePlacement = {
  name: string;
  path: string;
  position: [number, number];
  mobile: [number, number];
  rotation: [number, number, number];
  depth: number;
  size: number;
};

const DEVICES: DevicePlacement[] = [
  {
    name: 'MacBook Pro',
    path: '/models/workspace/macbook.glb',
    position: [-0.66, 0.28],
    mobile: [-0.22, 0.72],
    rotation: [1.05, -0.4, -0.12],
    depth: 26,
    size: 0.22,
  },
  {
    name: 'Magic Trackpad',
    path: '/models/workspace/trackpad.glb',
    position: [0.56, 0.68],
    mobile: [0.6, 0.74],
    rotation: [1.05, 0.1, 0.25],
    depth: 34,
    size: 0.17,
  },
  {
    name: 'Xiaomi A27Ui',
    path: '/models/workspace/monitor.glb',
    position: [0.72, -0.44],
    mobile: [-0.68, -0.68],
    rotation: [-0.08, -0.25, 0.1],
    depth: 30,
    size: 0.22,
  },
  {
    name: 'SPACE65 PYGA Black',
    path: '/models/workspace/keyboard.glb',
    position: [-0.52, -0.56],
    mobile: [0.35, -0.69],
    rotation: [1.02, -0.12, -0.18],
    depth: 28,
    size: 0.27,
  },
];

const ASSET_PATHS = DEVICES.map((device) => device.path);

const WorkspaceDevices = ({ palette, motionMode }: FloatingWorkspaceParams) => {
  const assets = useGLTF(ASSET_PATHS);
  const renderer = useThree(({ gl }) => gl);
  const groupRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const [origin] = useState(createSpaceOrigin);
  const [workspace, setWorkspace] = useState<ReturnType<
    typeof createWorkspaceModels
  > | null>(null);

  // REASON: GPU resources and mixers must be created and disposed together, including React's development remount.
  useEffect(() => {
    const models = createWorkspaceModels(assets, renderer);
    setWorkspace(models);
    return () => models.dispose();
  }, [assets, renderer]);

  // REASON: cloned materials share imperative shader uniforms that must follow live theme changes.
  useEffect(() => {
    if (!workspace) {
      return;
    }
    workspace.uniforms.uLuminous.value = Number(palette.mode === 'dark');
    workspace.uniforms.uSunlight.value.set(palette.sunlight);
    workspace.uniforms.uLitInk.value.set(palette.litInk);
    workspace.uniforms.uShadowInk.value.set(palette.shadowInk);
  }, [
    palette.mode,
    palette.sunlight,
    palette.litInk,
    palette.shadowInk,
    workspace,
  ]);

  useFrame(({ size }, delta) => {
    if (!workspace || !groupRef.current?.parent?.visible) {
      return;
    }
    const step = motionMode === 'full' ? Math.min(delta, 0.1) : 0;
    elapsedRef.current += step;
    const compact = size.width < 768;
    workspace.models.forEach(({ object, mixer }, index) => {
      const placement = DEVICES[index];
      const [x, y] = compact ? placement.mobile : placement.position;
      const halfHeight = Math.tan((58 * Math.PI) / 360) * placement.depth;
      const halfWidth = halfHeight * (size.width / size.height);
      const drift = elapsedRef.current * 0.12 + index * 1.8;
      object.position.set(
        (x + Math.sin(drift) * 0.008) * halfWidth,
        (y + Math.cos(drift * 0.8) * 0.012) * halfHeight,
        -placement.depth,
      );
      object.rotation.set(
        placement.rotation[0] + Math.sin(drift * 0.6) * 0.06,
        placement.rotation[1] + Math.cos(drift * 0.7) * 0.1,
        placement.rotation[2] + Math.sin(drift) * 0.035,
      );
      object.scale.setScalar(
        Math.min(halfHeight, halfWidth) * placement.size * (compact ? 1.3 : 1),
      );
      if (motionMode === 'reduced') {
        mixer.setTime(0);
      } else {
        mixer.update(step);
      }
    });
  }, -1);

  return (
    <group
      ref={groupRef}
      name="floating-workspace"
      position={origin.position}
      quaternion={origin.quaternion}
    >
      {workspace?.models.map(({ object }, index) => (
        <primitive
          key={DEVICES[index].path}
          object={object}
          name={DEVICES[index].name}
          dispose={null}
        />
      ))}
    </group>
  );
};

export default function FloatingWorkspace(props: FloatingWorkspaceParams) {
  return (
    <Suspense fallback={null}>
      <WorkspaceDevices {...props} />
    </Suspense>
  );
}
