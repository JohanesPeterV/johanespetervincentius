'use client';

import { AdaptiveDpr, useDetectGPU } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { RefObject, Suspense, useEffect, useRef } from 'react';

import CameraRig, { DiveStage, PointerState } from './camera-rig';
import type { DriveMotion } from './camera-motion';
import SpaceWorld from './space-world';
import StackDebris from './stack-debris';
import type { MotionMode } from './descent';
import type { OverlayNodes } from './dive-overlay-motion';
import type { DivePalette } from './dive-palette';
import type { HeroHandoff } from './hero-handoff';

type DiveCanvasParams = {
  palette: DivePalette;
  driveRef: RefObject<DriveMotion>;
  progressRef: RefObject<number>;
  pointerRef: RefObject<PointerState>;
  overlayRef: RefObject<OverlayNodes>;
  handoffRef: RefObject<HeroHandoff>;
  motionMode: MotionMode;
};

const LoadedSignal = ({ stageRef }: { stageRef: RefObject<DiveStage> }) => {
  // REASON: the director must wait for the first mounted scene before advancing
  // the shared progress, including when the GPU probe suspends canvas creation.
  useEffect(() => {
    stageRef.current = 'live';
  }, [stageRef]);
  return null;
};

export default function DiveCanvas({
  palette,
  driveRef,
  progressRef,
  pointerRef,
  overlayRef,
  handoffRef,
  motionMode,
}: DiveCanvasParams) {
  const { tier } = useDetectGPU();
  const stageRef = useRef<DiveStage>('loading');
  const dpr = Math.min(1.5, 1 + Math.max(0, tier - 1) * 0.25);

  return (
    <Canvas
      camera={{ fov: 58, near: 0.2, far: 240, position: [0, 3.8, 16] }}
      dpr={dpr}
      gl={{ toneMappingExposure: palette.exposure }}
      performance={{ min: 0.72, debounce: 350 }}
    >
      <AdaptiveDpr />
      <color attach="background" args={[palette.background]} />
      <fogExp2 attach="fog" args={[palette.background, palette.fogDensity]} />
      <Suspense fallback={null}>
        <SpaceWorld
          palette={palette}
          progressRef={progressRef}
          handoffRef={handoffRef}
          motionMode={motionMode}
          gpuTier={tier}
        />
        <LoadedSignal stageRef={stageRef} />
      </Suspense>
      <StackDebris
        palette={palette}
        progressRef={progressRef}
        motionMode={motionMode}
      />
      <CameraRig
        driveRef={driveRef}
        progressRef={progressRef}
        pointerRef={pointerRef}
        overlayRef={overlayRef}
        handoffRef={handoffRef}
        palette={palette}
        gpuTier={tier}
        stageRef={stageRef}
        motionMode={motionMode}
      />
    </Canvas>
  );
}
