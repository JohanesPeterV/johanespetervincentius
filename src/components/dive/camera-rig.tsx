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

import { aberrationStrength, rushFov } from './descent';
import type { MotionMode } from './descent';
import { ARRIVAL_DOLLY } from './arrival';
import type { DiveFrame } from './dive-frame';
import type { DivePalette } from './dive-palette';
import DivePostprocessing from './dive-postprocessing';
import type { HeroHandoff } from './hero-handoff';

import type { PointerState } from './dive-input';

type CameraRigParams = {
  frame: Readonly<DiveFrame>;
  pointerRef: RefObject<PointerState>;
  handoffRef: RefObject<HeroHandoff>;
  palette: DivePalette;
  gpuTier: number;
  motionMode: MotionMode;
};

const BASE_FOV = 58;
const PARALLAX_DAMPING = 1.7;
const LENS_DAMPING = 5.5;
const ROLL_DAMPING = 6;

export default function CameraRig({
  frame,
  pointerRef,
  handoffRef,
  palette,
  gpuTier,
  motionMode,
}: CameraRigParams) {
  const fovRef = useRef(BASE_FOV);
  const rollRef = useRef(0);
  const parallaxRef = useRef<PointerState>({ x: 0, y: 0 });
  const aberrationRef = useRef<ChromaticAberrationEffect>(null);
  const glowRef = useRef<PointLight>(null);
  useFrame(({ camera, scene }) => {
    const {
      descent,
      delta: frameDelta,
      velocity: driveStep,
      approach,
      cameraTravel: transitionZone,
    } = frame;
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
      descent.position[0] + parallax.x * 0.3,
      descent.position[1] - parallax.y * 0.15,
      descent.position[2],
    );
    camera.lookAt(
      descent.look[0] + parallax.x * 0.28,
      descent.look[1] - parallax.y * 0.16,
      descent.look[2],
    );
    camera.translateZ(approach * ARRIVAL_DOLLY);
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
        descent.fogColor[0],
        descent.fogColor[1],
        descent.fogColor[2],
        SRGBColorSpace,
      );
      scene.fog.density = descent.fogDensity;
    }
    if (scene.background instanceof Color) {
      scene.background.setRGB(
        descent.fogColor[0],
        descent.fogColor[1],
        descent.fogColor[2],
        SRGBColorSpace,
      );
    }
    if (aberrationRef.current) {
      const strength = aberrationStrength(driveStep) * transitionZone;
      aberrationRef.current.offset.set(strength, strength * 0.55);
    }
    if (glowRef.current) {
      glowRef.current.intensity = descent.glow * 260;
    }
    camera.updateMatrixWorld();
  }, -2);

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
