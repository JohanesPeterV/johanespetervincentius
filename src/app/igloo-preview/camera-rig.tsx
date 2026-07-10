'use client';

import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  EffectComposer,
  GodRays,
  HueSaturation,
  Noise,
  SMAA,
  Vignette,
  wrapEffect,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import type { ChromaticAberrationEffect } from 'postprocessing';
import { RefObject, useRef } from 'react';
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

import { DiveTransitionEffect } from './dive-transition-effect';

const DiveTransition = wrapEffect(DiveTransitionEffect);

import {
  DIVE_DAMPING,
  DIVE_LENGTH,
  DescentFrame,
  NARRATIVE_STONES,
  aberrationStrength,
  clampProgress,
  createDescentFrame,
  finaleBoost,
  finaleSunLift,
  narrativeStoneY,
  rushFov,
  seamBoost,
  transitionStrength,
  writeDescentFrame,
} from './descent';
import { applyOverlay } from './dive-overlay-motion';
import type { OverlayNodes } from './dive-overlay-motion';
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
const MAX_FRAME_DELTA = 0.05;
const PARALLAX_DAMPING = 2.76;
const RUSH_DECAY = 5;

const ABERRATION_OFFSET = new Vector2(0.0011, 0.0006);
const STONE_PROJECTIONS = NARRATIVE_STONES.map(() => new Vector3());
const STONE_SCREENS = NARRATIVE_STONES.map(() => new Vector2());

type SunMesh = Mesh<SphereGeometry, MeshBasicMaterial>;

const buildSunMesh = (): SunMesh => {
  const sun = new Mesh(
    new SphereGeometry(2.4, 24, 24),
    new MeshBasicMaterial({
      color: '#f2f8ff',
      transparent: true,
      opacity: 0,
    }),
  );
  sun.position.set(0, -7, -6);
  return sun;
};

export default function CameraRig({
  targetRef,
  progressRef,
  pointerRef,
  overlayRef,
  gpuTier,
  stageRef,
}: CameraRigParams) {
  const currentRef = useRef(0);
  const rushRef = useRef(0);
  const overlayProgressRef = useRef(Number.NaN);
  const overlaySizeRef = useRef(new Vector2());
  const parallaxRef = useRef<PointerState>({ x: 0, y: 0 });
  const aberrationRef = useRef<ChromaticAberrationEffect>(null);
  const glowRef = useRef<PointLight>(null);
  const transitionRef = useRef<DiveTransitionEffect | null>(null);
  const sunRef = useRef<SunMesh | null>(null);
  if (sunRef.current === null) {
    sunRef.current = buildSunMesh();
  }
  const sunMesh = sunRef.current;
  const frameRef = useRef<DescentFrame | null>(null);
  if (frameRef.current === null) {
    frameRef.current = createDescentFrame();
  }
  const descentFrame = frameRef.current;

  useFrame(({ camera, scene, clock, size }, delta) => {
    const frameDelta = Math.min(delta, MAX_FRAME_DELTA);
    const live = stageRef.current === 'live';
    const previousProgress = currentRef.current;
    if (live) {
      currentRef.current = MathUtils.damp(
        previousProgress,
        targetRef.current,
        DIVE_DAMPING,
        frameDelta,
      );
    }
    const step = currentRef.current - previousProgress;
    const driveStep = frameDelta > 0 ? step / (frameDelta * BASELINE_FPS) : 0;
    if (live && Math.abs(targetRef.current - currentRef.current) < 0.0004) {
      currentRef.current = targetRef.current;
    }
    const progress = clampProgress(currentRef.current);
    progressRef.current = progress;
    const frame = writeDescentFrame(descentFrame, progress);
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
      frame.position[0] + parallax.x * 0.7,
      frame.position[1] - parallax.y * 0.35,
      frame.position[2],
    );
    camera.lookAt(
      frame.look[0] + parallax.x * 2.2,
      frame.look[1] - parallax.y * 1.4,
      frame.look[2],
    );
    const transitionZone = Math.min(
      1,
      seamBoost(progress) + finaleBoost(progress),
    );
    camera.rotateZ(
      Math.max(-0.05, Math.min(0.05, -driveStep * 0.6)) * transitionZone,
    );
    if (camera instanceof PerspectiveCamera) {
      const nextFov = rushFov(driveStep * transitionZone);
      if (nextFov !== camera.fov) {
        camera.fov = nextFov;
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
    const impulse = Math.min(
      1,
      transitionStrength(driveStep) * transitionZone * 2.5,
    );
    rushRef.current = Math.max(
      impulse,
      rushRef.current * Math.exp(-RUSH_DECAY * frameDelta),
    );
    const rush = rushRef.current < 0.01 ? 0 : rushRef.current;
    if (transitionRef.current) {
      transitionRef.current.setDriveState(rush, clock.elapsedTime);
    }
    setWindDrive(progress / DIVE_LENGTH, rush);
    if (glowRef.current) {
      glowRef.current.intensity = frame.glow * 260;
    }
    const sunLift = finaleSunLift(progress);
    sunMesh.position.set(0, -7 + sunLift * 31, -6 - sunLift * 16);
    sunMesh.scale.setScalar(1 + sunLift * 1.6);
    sunMesh.material.opacity = Math.min(1, frame.glow * 0.9 + sunLift * 0.45);
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
      <primitive object={sunMesh} />
      <EffectComposer enabled={gpuTier >= 2} multisampling={0}>
        <SMAA />
        <Bloom intensity={0.35} luminanceThreshold={0.85} mipmapBlur />
        <GodRays
          sun={sunMesh}
          samples={36}
          density={0.85}
          decay={0.92}
          weight={0.25}
          exposure={0.18}
          clampMax={0.8}
        />
        <ChromaticAberration
          ref={aberrationRef}
          offset={ABERRATION_OFFSET}
          radialModulation
          modulationOffset={0.4}
        />
        <DiveTransition ref={transitionRef} />
        <HueSaturation saturation={-0.1} />
        <BrightnessContrast contrast={0.08} />
        <Noise opacity={0.22} blendFunction={BlendFunction.OVERLAY} />
        <Vignette offset={0.25} darkness={0.5} />
      </EffectComposer>
    </>
  );
}
