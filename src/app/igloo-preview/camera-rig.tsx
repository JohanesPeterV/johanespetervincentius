'use client';

import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import type { ChromaticAberrationEffect } from 'postprocessing';
import { RefObject, useRef } from 'react';
import { Color, FogExp2, PerspectiveCamera, PointLight, Vector2 } from 'three';

import {
  DIVE_EASE,
  DIVE_SECTIONS,
  DIVE_START,
  DescentFrame,
  aberrationStrength,
  depthMeters,
  railProximity,
  rushFov,
  sampleDescent,
  sectionMotion,
  wrapProgress,
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

  useFrame(({ camera, scene }) => {
    const step = (targetRef.current - currentRef.current) * DIVE_EASE;
    currentRef.current += step;
    if (Math.abs(targetRef.current - currentRef.current) < 0.0004) {
      const settled = wrapProgress(currentRef.current);
      currentRef.current = settled;
      targetRef.current = settled;
    }
    const progress = wrapProgress(currentRef.current);
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
    if (glowRef.current) {
      glowRef.current.intensity = frame.glow * 260;
    }
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
      <EffectComposer enabled={gpuTier >= 2}>
        <Bloom intensity={0.35} luminanceThreshold={0.85} mipmapBlur />
        <ChromaticAberration
          ref={aberrationRef}
          offset={ABERRATION_OFFSET}
          radialModulation
          modulationOffset={0.4}
        />
        <Noise opacity={0.22} blendFunction={BlendFunction.OVERLAY} />
        <Vignette offset={0.25} darkness={0.5} />
      </EffectComposer>
    </>
  );
}
