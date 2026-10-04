'use client';

import { PerformanceMonitor, useDetectGPU } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { RefObject, Suspense, useEffect, useRef, useState } from 'react';

import CameraRig from './camera-rig';
import DiveDirector from './dive-director';
import { createDiveFrame } from './dive-frame';
import type { DiveStage } from './dive-timeline';
import type { PointerState } from './dive-input';
import type { DriveMotion } from './camera-motion';
import SpaceWorld from './space-world';
import type { MotionMode } from './descent';
import type { OverlayNodes } from './dive-overlay-motion';
import type { DivePalette } from './dive-palette';
import { handoffPixelRatio } from './hero-handoff';
import type { HeroHandoff } from './hero-handoff';

type DiveCanvasParams = {
  palette: DivePalette;
  driveRef: RefObject<DriveMotion>;
  pointerRef: RefObject<PointerState>;
  overlayRef: RefObject<OverlayNodes>;
  handoffRef: RefObject<HeroHandoff>;
  motionMode: MotionMode;
};

const LoadedSignal = ({
  stageRef,
  handoffRef,
  motionMode,
}: {
  stageRef: RefObject<DiveStage>;
  handoffRef: RefObject<HeroHandoff>;
  motionMode: MotionMode;
}) => {
  const firstFrameRef = useRef<number | null>(null);
  // REASON: arrival starts after model warmup and initial DOM rasterization,
  // then waits for a complete prepared frame to reach the renderer.
  useEffect(() => {
    stageRef.current = 'loading';
    return () => {
      stageRef.current = 'loading';
    };
  }, [stageRef]);
  useFrame(({ gl }) => {
    const handoff = handoffRef.current;
    if (
      stageRef.current === 'loading' ||
      (motionMode === 'full' && handoff.snapshotState === 'pending')
    ) {
      firstFrameRef.current = null;
      return;
    }
    if (firstFrameRef.current === null) {
      firstFrameRef.current = gl.info.render.frame;
    } else if (gl.info.render.frame > firstFrameRef.current) {
      stageRef.current = 'live';
    }
  }, -4);
  return null;
};

const AdaptiveResolution = ({
  maxDpr,
  handoffRef,
}: {
  maxDpr: number;
  handoffRef: RefObject<HeroHandoff>;
}) => {
  const [qualityDpr, setQualityDpr] = useState(maxDpr);
  useFrame(({ performance, viewport, setDpr }) => {
    const dpr = handoffRef.current.compositing
      ? handoffPixelRatio()
      : qualityDpr * performance.current;
    if (viewport.dpr !== dpr) {
      setDpr(dpr);
    }
  });
  return (
    <PerformanceMonitor
      bounds={() => [55, Infinity]}
      onDecline={() => {
        // REASON: sustained slow frames lower the resolution ceiling for this
        // visit; scrolling must not reset it to the original GPU-tier estimate.
        setQualityDpr((current) => Math.max(1, current - 0.25));
      }}
    />
  );
};

export default function DiveCanvas({
  palette,
  driveRef,
  pointerRef,
  overlayRef,
  handoffRef,
  motionMode,
}: DiveCanvasParams) {
  const { tier } = useDetectGPU();
  const stageRef = useRef<DiveStage>('loading');
  const [frame] = useState(createDiveFrame);
  const dpr = Math.min(1.5, 1 + Math.max(0, tier - 1) * 0.25);

  return (
    <Canvas
      camera={{ fov: 58, near: 0.2, far: 240, position: [0, 3.8, 16] }}
      dpr={dpr}
      gl={{ toneMappingExposure: palette.exposure }}
      performance={{ min: 0.72, debounce: 350 }}
    >
      <AdaptiveResolution maxDpr={dpr} handoffRef={handoffRef} />
      <color attach="background" args={[palette.background]} />
      <fogExp2 attach="fog" args={[palette.background, palette.fogDensity]} />
      <Suspense fallback={null}>
        <SpaceWorld
          palette={palette}
          frame={frame}
          handoffRef={handoffRef}
          motionMode={motionMode}
          gpuTier={tier}
          onPrepared={() => {
            stageRef.current = 'prepared';
          }}
        />
        <LoadedSignal
          stageRef={stageRef}
          handoffRef={handoffRef}
          motionMode={motionMode}
        />
      </Suspense>
      <DiveDirector
        driveRef={driveRef}
        frame={frame}
        overlayRef={overlayRef}
        handoffRef={handoffRef}
        palette={palette}
        stageRef={stageRef}
        motionMode={motionMode}
      />
      <CameraRig
        frame={frame}
        pointerRef={pointerRef}
        handoffRef={handoffRef}
        palette={palette}
        gpuTier={tier}
        motionMode={motionMode}
      />
    </Canvas>
  );
}
