'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useContext, useEffect, useState } from 'react';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import { StarfieldMotionContext } from './starfield-motion';
import { createWorkspaceModels } from './workspace-models';

type FloatingWorkspaceParams = {
  palette: DivePalette;
  motionMode: MotionMode;
};

type DevicePlacement = {
  name: string;
  path: string;
  anchor: [number, number];
  rotation: [number, number, number];
  size: number;
};

const DEVICES: DevicePlacement[] = [
  {
    name: 'MacBook Pro',
    path: '/models/workspace/macbook.glb',
    anchor: [-0.65, 0.67],
    rotation: [1.05, -0.4, -0.12],
    size: 1.65,
  },
  {
    name: 'Magic Trackpad',
    path: '/models/workspace/trackpad.glb',
    anchor: [0.65, 0.7],
    rotation: [1.05, 0.1, 0.25],
    size: 1.25,
  },
  {
    name: 'Xiaomi A27Ui',
    path: '/models/workspace/monitor.glb',
    anchor: [0.64, -0.64],
    rotation: [-0.08, -0.25, 0.1],
    size: 1.45,
  },
  {
    name: 'SPACE65 PYGA Black',
    path: '/models/workspace/keyboard.glb',
    anchor: [-0.64, -0.68],
    rotation: [1.02, -0.12, -0.18],
    size: 1.65,
  },
];

const ASSET_PATHS = DEVICES.map((device) => device.path);

const WorkspaceDevices = ({ palette, motionMode }: FloatingWorkspaceParams) => {
  const assets = useGLTF(ASSET_PATHS);
  const renderer = useThree(({ gl }) => gl);
  const starfield = useContext(StarfieldMotionContext);
  const [stars] = useState(() => {
    if (!starfield) {
      throw new Error(
        'Floating workspace devices need their parent starfield.',
      );
    }
    return starfield.selectParticles(DEVICES.map(({ anchor }) => anchor));
  });
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
    if (!workspace || !starfield) {
      return;
    }
    const step = motionMode === 'full' ? Math.min(delta, 0.1) : 0;
    const compact = size.width < 768;
    const time = starfield.time.value;
    workspace.models.forEach(({ object, mixer }, index) => {
      const placement = DEVICES[index];
      const phase = index * 1.8;
      starfield.sampleParticle(stars[index], object.position);
      object.rotation.set(
        placement.rotation[0] + Math.sin(time * 0.27 + phase) * 0.3,
        placement.rotation[1] + Math.cos(time * 0.23 + phase) * 0.3,
        placement.rotation[2] + time * (0.12 + index * 0.025),
      );
      object.scale.setScalar(
        placement.size *
          Math.min(size.width / size.height, 1) *
          (compact ? 1.5 : 1),
      );
      if (motionMode === 'reduced') {
        mixer.setTime(0);
      } else {
        mixer.update(step);
      }
    });
  }, -0.5);

  return (
    <group name="floating-workspace">
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
