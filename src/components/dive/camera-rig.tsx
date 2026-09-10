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
  Vector2,
  Vector3,
} from 'three';

import {
  NARRATIVE_STONES,
  WORK_STONE,
  aberrationStrength,
  createDescentFrame,
  narrativeStoneY,
  rushFov,
  sectionTravel,
  stoneSectionOpacity,
  wrapProgress,
  writeDescentFrame,
} from './descent';
import type { DescentFrame, MotionMode } from './descent';
import { advanceDrive } from './camera-motion';
import type { DriveMotion } from './camera-motion';
import { applyOverlay } from './dive-overlay-motion';
import type { OverlayNodes } from './dive-overlay-motion';
import { applyDivePalette } from './dive-palette';
import type { DivePalette } from './dive-palette';
import DivePostprocessing from './dive-postprocessing';
import { sampleHeroHandoff } from './hero-handoff';
import type { HeroHandoff } from './hero-handoff';

export type PointerState = {
  x: number;
  y: number;
};

export type DiveStage = 'loading' | 'live';

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

const BASELINE_FPS = 60;
const BASE_FOV = 58;
const MAX_FRAME_DELTA = 0.1;
const PARALLAX_DAMPING = 1.7;
const LENS_DAMPING = 5.5;
const ROLL_DAMPING = 6;

const STONE_PROJECTIONS = NARRATIVE_STONES.map(() => new Vector3());
const STONE_SCREENS = NARRATIVE_STONES.map(() => new Vector2());

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
  const overlayProgressRef = useRef(Number.NaN);
  const overlayMotionModeRef = useRef(motionMode);
  const overlaySizeRef = useRef(new Vector2());
  const parallaxRef = useRef<PointerState>({ x: 0, y: 0 });
  const aberrationRef = useRef<ChromaticAberrationEffect>(null);
  const glowRef = useRef<PointLight>(null);
  const frameRef = useRef<DescentFrame | null>(null);
  if (frameRef.current === null) {
    frameRef.current = createDescentFrame();
  }
  const descentFrame = frameRef.current;

  useFrame(({ camera, scene, performance }, delta) => {
    const frameDelta = Math.min(delta, MAX_FRAME_DELTA);
    const live = stageRef.current === 'live';
    const drive = driveRef.current;
    const previousProgress = drive.current;
    if (live) {
      advanceDrive(drive, frameDelta);
      if (motionMode === 'reduced') {
        drive.current = drive.target;
      }
    }
    const step = drive.current - previousProgress;
    const driveStep = frameDelta > 0 ? step / (frameDelta * BASELINE_FPS) : 0;
    const handoff = handoffRef.current;
    handoff.journey = wrapProgress(drive.current);
    const progress = sampleHeroHandoff(handoff, motionMode);
    progressRef.current = progress;
    const frame = writeDescentFrame(descentFrame, progress);
    applyDivePalette(frame, palette, progress);
    if (motionMode === 'reduced') {
      frame.position[0] = 0;
      frame.position[1] = 3.5;
      frame.position[2] = 16;
      frame.look[0] = 0;
      frame.look[1] = 2.4;
      frame.look[2] = 0;
    }
    if (live && Math.abs(step) > 0.00008) {
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
      frame.position[2],
    );
    camera.lookAt(
      frame.look[0] + parallax.x * 0.28,
      frame.look[1] - parallax.y * 0.16,
      frame.look[2],
    );
    const transitionZone =
      motionMode === 'reduced' || handoff.crossing !== null
        ? 0
        : sectionTravel(progress);
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
      const targetFov = rushFov(driveStep * transitionZone);
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
      const strength = aberrationStrength(driveStep) * transitionZone;
      aberrationRef.current.offset.set(strength, strength * 0.55);
    }
    if (glowRef.current) {
      glowRef.current.intensity = frame.glow * 260;
    }
    camera.updateMatrixWorld();
  }, -2);

  // REASON: DOM projection runs after the world update, but before
  // the composer renders, so text and geometry describe the same frame.
  useFrame(({ camera, size }) => {
    const progress = wrapProgress(driveRef.current.current);
    NARRATIVE_STONES.forEach((stone, index) => {
      const projection = STONE_PROJECTIONS[index];
      projection
        .set(
          stone.x,
          narrativeStoneY(progressRef.current, stone.center),
          stone.z,
        )
        .project(camera);
      STONE_SCREENS[index].set(
        ((projection.x + 1) * size.width) / 2,
        ((1 - projection.y) * size.height) / 2,
      );
    });
    const workVisible = stoneSectionOpacity(progress, WORK_STONE.center) > 0;
    const sizeChanged =
      size.width !== overlaySizeRef.current.x ||
      size.height !== overlaySizeRef.current.y;
    // REASON: work panels animate while camera progress is
    // frozen, so their visible sections still need overlay writes every frame
    if (
      progress !== overlayProgressRef.current ||
      motionMode !== overlayMotionModeRef.current ||
      sizeChanged ||
      (handoffRef.current.progress > 0 && handoffRef.current.progress < 1) ||
      workVisible
    ) {
      overlayProgressRef.current = progress;
      overlayMotionModeRef.current = motionMode;
      overlaySizeRef.current.set(size.width, size.height);
      applyOverlay(overlayRef.current, {
        descent: descentFrame,
        height: size.height,
        progress,
        stones: STONE_SCREENS,
        width: size.width,
        motionMode,
        handoff: handoffRef.current,
      });
    }
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
          aberrationRef={aberrationRef}
          handoffRef={handoffRef}
          gpuTier={gpuTier}
        />
      ) : null}
    </>
  );
}
