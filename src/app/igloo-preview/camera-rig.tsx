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
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PointLight,
  SphereGeometry,
  Vector2,
} from 'three';

import { DiveTransitionEffect } from './dive-transition-effect';

const DiveTransition = wrapEffect(DiveTransitionEffect);

import {
  DIVE_EASE,
  DIVE_LENGTH,
  DIVE_SECTIONS,
  DescentFrame,
  aberrationStrength,
  clampProgress,
  depthMeters,
  railProximity,
  rushFov,
  sampleDescent,
  seamBoost,
  sectionMotion,
  transitionStrength,
} from './descent';
import { setWindDrive } from './wind-audio';

export type OverlayNodes = {
  sections: (HTMLDivElement | null)[];
  rail: (HTMLDivElement | null)[];
  veil: HTMLDivElement | null;
  depth: HTMLSpanElement | null;
};

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

const PARALLAX_EASE = 0.045;

const ABERRATION_OFFSET = new Vector2(0.0011, 0.0006);

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
  sun.position.set(0, -74, 16);
  return sun;
};

const applyOverlay = (
  nodes: OverlayNodes,
  progress: number,
  frame: DescentFrame,
): void => {
  DIVE_SECTIONS.forEach((section, index) => {
    const element = nodes.sections[index];
    if (!element) {
      return;
    }
    const motion = sectionMotion(progress, section.center);
    element.style.opacity = String(motion.opacity);
    element.style.transform = `translateY(${motion.shift}px)`;
    element.style.filter = `blur(${motion.blur}px)`;
    element.style.visibility = motion.opacity < 0.05 ? 'hidden' : 'visible';
    element.dataset.visible = motion.opacity > 0.4 ? 'true' : 'false';
  });
  DIVE_SECTIONS.forEach((section, index) => {
    const notch = nodes.rail[index];
    if (!notch) {
      return;
    }
    const proximity = railProximity(progress, section.center);
    notch.style.opacity = String(0.2 + proximity * 0.8);
    notch.style.transform = `scaleX(${1 + proximity * 1.6})`;
  });
  if (nodes.veil) {
    nodes.veil.style.opacity = String(frame.veil);
    nodes.veil.style.backgroundColor = `rgb(${Math.round(
      frame.veilColor[0] * 255,
    )}, ${Math.round(frame.veilColor[1] * 255)}, ${Math.round(
      frame.veilColor[2] * 255,
    )})`;
  }
  if (nodes.depth) {
    const meters = String(depthMeters(progress)).padStart(4, '0');
    nodes.depth.textContent = `${meters}M`;
  }
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
  const parallaxRef = useRef<PointerState>({ x: 0, y: 0 });
  const aberrationRef = useRef<ChromaticAberrationEffect>(null);
  const glowRef = useRef<PointLight>(null);
  const transitionRef = useRef<DiveTransitionEffect | null>(null);
  const sunRef = useRef<SunMesh | null>(null);
  if (sunRef.current === null) {
    sunRef.current = buildSunMesh();
  }
  const sunMesh = sunRef.current;

  useFrame(({ camera, scene, clock }) => {
    const live = stageRef.current === 'live';
    const step = live
      ? (targetRef.current - currentRef.current) * DIVE_EASE
      : 0;
    currentRef.current += step;
    if (live && Math.abs(targetRef.current - currentRef.current) < 0.0004) {
      currentRef.current = targetRef.current;
    }
    const progress = clampProgress(currentRef.current);
    progressRef.current = progress;
    const frame = sampleDescent(progress);
    const parallax = parallaxRef.current;
    parallax.x += (pointerRef.current.x - parallax.x) * PARALLAX_EASE;
    parallax.y += (pointerRef.current.y - parallax.y) * PARALLAX_EASE;
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
    camera.rotateZ(Math.max(-0.05, Math.min(0.05, -step * 0.6)));
    if (camera instanceof PerspectiveCamera) {
      camera.fov = rushFov(step);
      camera.updateProjectionMatrix();
    }
    if (scene.fog instanceof FogExp2) {
      scene.fog.color.setRGB(
        frame.fogColor[0],
        frame.fogColor[1],
        frame.fogColor[2],
      );
      scene.fog.density = frame.fogDensity;
    }
    if (scene.background instanceof Color) {
      scene.background.setRGB(
        frame.fogColor[0],
        frame.fogColor[1],
        frame.fogColor[2],
      );
    }
    if (aberrationRef.current) {
      const strength = aberrationStrength(step);
      aberrationRef.current.offset.set(strength, strength * 0.55);
    }
    const impulse = Math.min(
      1,
      transitionStrength(step) * (1 + seamBoost(progress) * 1.5),
    );
    rushRef.current = Math.max(impulse, rushRef.current * 0.92);
    const rush = rushRef.current < 0.01 ? 0 : rushRef.current;
    if (transitionRef.current) {
      transitionRef.current.setDriveState(rush, clock.elapsedTime);
    }
    setWindDrive(progress / DIVE_LENGTH, rush);
    if (glowRef.current) {
      glowRef.current.intensity = frame.glow * 260;
    }
    sunMesh.material.opacity = frame.glow * 0.9;
    applyOverlay(overlayRef.current, progress, frame);
  });

  return (
    <>
      <pointLight
        ref={glowRef}
        position={[0, -66, 16]}
        distance={55}
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
