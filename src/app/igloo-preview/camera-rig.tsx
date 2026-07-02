'use client';

import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  DepthOfField,
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
  DIVE_SECTIONS,
  DIVE_START,
  DescentFrame,
  aberrationStrength,
  clampProgress,
  depthMeters,
  railProximity,
  rushFov,
  sampleDescent,
  sectionMotion,
  transitionStrength,
} from './descent';

export type OverlayNodes = {
  sections: (HTMLDivElement | null)[];
  rail: (HTMLDivElement | null)[];
  veil: HTMLDivElement | null;
  depth: HTMLSpanElement | null;
};

type CameraRigParams = {
  targetRef: RefObject<number>;
  overlayRef: RefObject<OverlayNodes>;
  gpuTier: number;
};

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
  }
  if (nodes.depth) {
    const meters = String(depthMeters(frame.position[1])).padStart(4, '0');
    nodes.depth.textContent = `${meters}M`;
  }
};

export default function CameraRig({
  targetRef,
  overlayRef,
  gpuTier,
}: CameraRigParams) {
  const currentRef = useRef(DIVE_START);
  const aberrationRef = useRef<ChromaticAberrationEffect>(null);
  const glowRef = useRef<PointLight>(null);
  const transitionRef = useRef<DiveTransitionEffect | null>(null);
  const sunRef = useRef<SunMesh | null>(null);
  if (sunRef.current === null) {
    sunRef.current = buildSunMesh();
  }
  const sunMesh = sunRef.current;

  useFrame(({ camera, scene, clock }) => {
    const step = (targetRef.current - currentRef.current) * DIVE_EASE;
    currentRef.current += step;
    if (Math.abs(targetRef.current - currentRef.current) < 0.0004) {
      currentRef.current = targetRef.current;
    }
    const progress = clampProgress(currentRef.current);
    const frame = sampleDescent(progress);
    camera.position.set(
      frame.position[0],
      frame.position[1],
      frame.position[2],
    );
    camera.lookAt(frame.look[0], frame.look[1], frame.look[2]);
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
    if (transitionRef.current) {
      transitionRef.current.setDriveState(
        transitionStrength(step),
        clock.elapsedTime,
      );
    }
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
        <DepthOfField
          worldFocusDistance={14}
          worldFocusRange={26}
          bokehScale={1.4}
        />
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
