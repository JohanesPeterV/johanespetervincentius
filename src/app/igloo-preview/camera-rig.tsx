'use client';

import { useFrame } from '@react-three/fiber';
import type { ChromaticAberrationEffect } from 'postprocessing';
import { RefObject, useRef, useState } from 'react';
import {
  Color,
  FogExp2,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PointLight,
  SRGBColorSpace,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three';

import {
  DIVE_LENGTH,
  NARRATIVE_STONES,
  aberrationStrength,
  createDescentFrame,
  finaleBoost,
  finaleSunLift,
  narrativeStoneY,
  rushFov,
  seamBoost,
  transitionStrength,
  wrapProgress,
  writeDescentFrame,
} from './descent';
import type { DescentFrame } from './descent';
import { advanceDrive, applyFinaleCamera } from './camera-motion';
import type { DriveMotion } from './camera-motion';
import { applyOverlay } from './dive-overlay-motion';
import type { OverlayNodes } from './dive-overlay-motion';
import DivePostprocessing from './dive-postprocessing';
import { DiveTransitionEffect } from './dive-transition-effect';
import { setWindDrive } from './wind-audio';

export type PointerState = {
  x: number;
  y: number;
};

export type DiveStage = 'loading' | 'live';

type CameraRigParams = {
  targetRef: RefObject<number>;
  progressRef: RefObject<number>;
  pointerRef: RefObject<PointerState>;
  overlayRef: RefObject<OverlayNodes>;
  gpuTier: number;
  stageRef: RefObject<DiveStage>;
};

const BASELINE_FPS = 60;
const BASE_FOV = 58;
const MAX_FRAME_DELTA = 0.05;
const PARALLAX_DAMPING = 2.2;
const LENS_DAMPING = 5.5;
const ROLL_DAMPING = 6;
const RUSH_DAMPING = 4;
const TRANSITION_BASE_INTENSITY = 0.4;
const TRANSITION_RUSH_INTENSITY = 0.24;

const STONE_PROJECTIONS = NARRATIVE_STONES.map(() => new Vector3());
const STONE_SCREENS = NARRATIVE_STONES.map(() => new Vector2());

type SunMesh = Mesh<SphereGeometry, MeshBasicMaterial>;

export default function CameraRig({
  targetRef,
  progressRef,
  pointerRef,
  overlayRef,
  gpuTier,
  stageRef,
}: CameraRigParams) {
  const driveRef = useRef<DriveMotion>({ current: 0, velocity: 0 });
  const fovRef = useRef(BASE_FOV);
  const rollRef = useRef(0);
  const rushRef = useRef(0);
  const overlayProgressRef = useRef(Number.NaN);
  const overlaySizeRef = useRef(new Vector2());
  const parallaxRef = useRef<PointerState>({ x: 0, y: 0 });
  const aberrationRef = useRef<ChromaticAberrationEffect>(null);
  const glowRef = useRef<PointLight>(null);
  const transitionRef = useRef<DiveTransitionEffect | null>(null);
  const [sunMesh, setSunMesh] = useState<SunMesh | null>(null);
  const frameRef = useRef<DescentFrame | null>(null);
  if (frameRef.current === null) {
    frameRef.current = createDescentFrame();
  }
  const descentFrame = frameRef.current;

  useFrame(({ camera, scene, performance, size }, delta) => {
    const frameDelta = Math.min(delta, MAX_FRAME_DELTA);
    const live = stageRef.current === 'live';
    const drive = driveRef.current;
    const previousProgress = drive.current;
    if (live) {
      advanceDrive(drive, targetRef.current, frameDelta);
    }
    const step = drive.current - previousProgress;
    const driveStep = frameDelta > 0 ? step / (frameDelta * BASELINE_FPS) : 0;
    const progress = wrapProgress(drive.current);
    progressRef.current = progress;
    const frame = writeDescentFrame(descentFrame, progress);
    applyFinaleCamera(frame, progress);
    if (live && Math.abs(step) > 0.00008) {
      performance.regress();
    }
    const parallax = parallaxRef.current;
    parallax.x = MathUtils.damp(
      parallax.x,
      pointerRef.current.x,
      PARALLAX_DAMPING,
      frameDelta,
    );
    parallax.y = MathUtils.damp(
      parallax.y,
      pointerRef.current.y,
      PARALLAX_DAMPING,
      frameDelta,
    );
    camera.position.set(
      frame.position[0] + parallax.x * 0.22,
      frame.position[1] - parallax.y * 0.1,
      frame.position[2],
    );
    camera.lookAt(
      frame.look[0] + parallax.x * 0.48,
      frame.look[1] - parallax.y * 0.28,
      frame.look[2],
    );
    const transitionZone = Math.min(
      1,
      seamBoost(progress) + finaleBoost(progress),
    );
    const targetRoll =
      Math.max(-0.003, Math.min(0.003, -driveStep * 0.035)) * transitionZone;
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
    const impulse = Math.min(1, transitionStrength(driveStep) * transitionZone);
    rushRef.current = MathUtils.damp(
      rushRef.current,
      impulse,
      RUSH_DAMPING,
      frameDelta,
    );
    const rush = rushRef.current < 0.01 ? 0 : rushRef.current;
    if (transitionRef.current) {
      transitionRef.current.setDriveState(
        Math.max(
          rush * TRANSITION_RUSH_INTENSITY,
          transitionZone * TRANSITION_BASE_INTENSITY,
        ),
        progress,
      );
    }
    setWindDrive(progress / DIVE_LENGTH, rush);
    if (glowRef.current) {
      glowRef.current.intensity = frame.glow * 260;
    }
    if (sunMesh) {
      const sunLift = finaleSunLift(progress);
      sunMesh.position.set(0, -7 + sunLift * 31, -6 - sunLift * 16);
      sunMesh.scale.setScalar(1 + sunLift * 1.6);
      sunMesh.material.opacity = Math.min(
        1,
        sunLift * (0.45 + frame.glow * 1.4),
      );
    }
    NARRATIVE_STONES.forEach((stone, index) => {
      const projection = STONE_PROJECTIONS[index];
      projection
        .set(stone.x, narrativeStoneY(progress, stone.center), stone.z)
        .project(camera);
      STONE_SCREENS[index].set(
        ((projection.x + 1) * size.width) / 2,
        ((1 - projection.y) * size.height) / 2,
      );
    });
    const sizeChanged =
      size.width !== overlaySizeRef.current.x ||
      size.height !== overlaySizeRef.current.y;
    if (progress !== overlayProgressRef.current || sizeChanged) {
      overlayProgressRef.current = progress;
      overlaySizeRef.current.set(size.width, size.height);
      applyOverlay(overlayRef.current, {
        descent: frame,
        height: size.height,
        progress,
        stones: STONE_SCREENS,
        width: size.width,
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
        color="#e9f3fc"
      />
      <mesh ref={setSunMesh} position={[0, -7, -6]}>
        <sphereGeometry args={[2.4, 24, 24]} />
        <meshBasicMaterial
          color="#f2f8ff"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      {sunMesh ? (
        <DivePostprocessing
          aberrationRef={aberrationRef}
          gpuTier={gpuTier}
          sun={sunMesh}
          transitionRef={transitionRef}
        />
      ) : null}
    </>
  );
}
