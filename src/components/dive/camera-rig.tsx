'use client';

import { useFrame } from '@react-three/fiber';
import type { ChromaticAberrationEffect } from 'postprocessing';
import { RefObject, useRef } from 'react';
import {
  Color,
  FogExp2,
  MathUtils,
  PerspectiveCamera,
  PointLight,
  SRGBColorSpace,
} from 'three';

import {
  aberrationStrength,
  createDescentFrame,
  rushFov,
  writeDescentFrame,
} from './descent';
import type { DescentFrame, MotionMode } from './descent';
import {
  ARRIVAL_ABERRATION,
  ARRIVAL_DOLLY,
  ARRIVAL_LENS,
  arrivalApproach,
} from './arrival';
import type { DriveMotion } from './camera-motion';
import { createOverlayMotion, updateOverlay } from './dive-overlay-motion';
import type { OverlayNodes } from './dive-overlay-motion';
import { applyDivePalette } from './dive-palette';
import type { DivePalette } from './dive-palette';
import DivePostprocessing from './dive-postprocessing';
import { createDiveTimeline, advanceDiveTimeline } from './dive-timeline';
import type { DiveStage } from './dive-timeline';
import type { HeroHandoff } from './hero-handoff';

import type { PointerState } from './dive-input';

type CameraRigParams = {
  driveRef: RefObject<DriveMotion>;
  progressRef: RefObject<number>;
  pointerRef: RefObject<PointerState>;
  overlayRef: RefObject<OverlayNodes>;
  handoffRef: RefObject<HeroHandoff>;
  palette: DivePalette;
  gpuTier: number;
  stageRef: RefObject<DiveStage>;
  motionMode: MotionMode;
};

const BASE_FOV = 58;
const PARALLAX_DAMPING = 1.7;
const LENS_DAMPING = 5.5;
const ROLL_DAMPING = 6;

export default function CameraRig({
  driveRef,
  progressRef,
  pointerRef,
  overlayRef,
  handoffRef,
  palette,
  gpuTier,
  stageRef,
  motionMode,
}: CameraRigParams) {
  const fovRef = useRef(BASE_FOV);
  const rollRef = useRef(0);
  const timelineRef = useRef(
    createDiveTimeline(driveRef.current, handoffRef.current),
  );
  const overlayMotionRef = useRef(createOverlayMotion(overlayRef.current));
  const parallaxRef = useRef<PointerState>({ x: 0, y: 0 });
  const aberrationRef = useRef<ChromaticAberrationEffect>(null);
  const glowRef = useRef<PointLight>(null);
  const frameRef = useRef<DescentFrame | null>(null);
  if (frameRef.current === null) {
    frameRef.current = createDescentFrame();
  }
  const descentFrame = frameRef.current;

  useFrame(({ camera, scene, performance }, delta) => {
    const timeline = timelineRef.current;
    advanceDiveTimeline(timeline, {
      delta,
      stage: stageRef.current,
      motionMode,
    });
    const {
      delta: frameDelta,
      step,
      velocity: driveStep,
      renderProgress: progress,
    } = timeline;
    const handoff = handoffRef.current;
    const approach = arrivalApproach(handoff.arrival);
    progressRef.current = progress;
    const sceneProgress = driveRef.current.route.sceneProgress(progress);
    const frame = writeDescentFrame(descentFrame, sceneProgress);
    applyDivePalette(frame, palette, sceneProgress);
    if (motionMode === 'reduced') {
      frame.position[0] = 0;
      frame.position[1] = 3.5;
      frame.position[2] = 16;
      frame.look[0] = 0;
      frame.look[1] = 2.4;
      frame.look[2] = 0;
    }
    if (stageRef.current === 'live' && Math.abs(step) > 0.00008) {
      performance.regress();
    }
    const parallax = parallaxRef.current;
    parallax.x = MathUtils.damp(
      parallax.x,
      motionMode === 'reduced' ? 0 : pointerRef.current.x,
      PARALLAX_DAMPING,
      frameDelta,
    );
    parallax.y = MathUtils.damp(
      parallax.y,
      motionMode === 'reduced' ? 0 : pointerRef.current.y,
      PARALLAX_DAMPING,
      frameDelta,
    );
    camera.position.set(
      frame.position[0] + parallax.x * 0.3,
      frame.position[1] - parallax.y * 0.15,
      frame.position[2] + approach * ARRIVAL_DOLLY,
    );
    camera.lookAt(
      frame.look[0] + parallax.x * 0.28,
      frame.look[1] - parallax.y * 0.16,
      frame.look[2],
    );
    const transitionZone =
      motionMode === 'reduced' || handoff.crossing !== null
        ? 0
        : driveRef.current.route.travel(progress);
    const targetRoll =
      Math.max(-0.012, Math.min(0.012, -driveStep * 0.12)) * transitionZone;
    rollRef.current = MathUtils.damp(
      rollRef.current,
      targetRoll,
      ROLL_DAMPING,
      frameDelta,
    );
    camera.rotateZ(rollRef.current);
    if (camera instanceof PerspectiveCamera) {
      const targetFov =
        rushFov(driveStep * transitionZone) + approach * ARRIVAL_LENS;
      fovRef.current = MathUtils.damp(
        fovRef.current,
        targetFov,
        LENS_DAMPING,
        frameDelta,
      );
      if (Math.abs(fovRef.current - targetFov) < 0.001) {
        fovRef.current = targetFov;
      }
      if (fovRef.current !== camera.fov) {
        camera.fov = fovRef.current;
        camera.updateProjectionMatrix();
      }
    }
    if (scene.fog instanceof FogExp2) {
      scene.fog.color.setRGB(
        frame.fogColor[0],
        frame.fogColor[1],
        frame.fogColor[2],
        SRGBColorSpace,
      );
      scene.fog.density = frame.fogDensity;
    }
    if (scene.background instanceof Color) {
      scene.background.setRGB(
        frame.fogColor[0],
        frame.fogColor[1],
        frame.fogColor[2],
        SRGBColorSpace,
      );
    }
    if (aberrationRef.current) {
      const strength = Math.max(
        aberrationStrength(driveStep) * transitionZone,
        approach * ARRIVAL_ABERRATION,
      );
      aberrationRef.current.offset.set(strength, strength * 0.55);
    }
    if (glowRef.current) {
      glowRef.current.intensity = frame.glow * 260;
    }
    camera.updateMatrixWorld();
  }, -2);

  // REASON: overlay writes run after the world update, but before the
  // composer renders, so text and geometry describe the same frame.
  useFrame(() => {
    updateOverlay(overlayMotionRef.current, {
      descent: descentFrame,
      motionMode,
      handoff: handoffRef.current,
    });
  });

  return (
    <>
      <pointLight
        ref={glowRef}
        position={[0, -9, 4]}
        distance={42}
        intensity={0}
        color={palette.accent}
      />
      {motionMode === 'full' ? (
        <DivePostprocessing
          background={palette.background}
          foreground={palette.foreground}
          glow={palette.glow}
          print={palette.mode === 'light'}
          aberrationRef={aberrationRef}
          handoffRef={handoffRef}
          gpuTier={gpuTier}
        />
      ) : null}
    </>
  );
}
