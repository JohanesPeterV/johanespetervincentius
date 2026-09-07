'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import {
  BufferAttribute,
  Color,
  DynamicDrawUsage,
  Vector2,
  Vector3,
} from 'three';

import type { DivePalette } from './dive-palette';
import { sectionTravel } from './descent';
import type { MotionMode } from './descent';
import { buildStarfield } from './world-layout';
import type { StarfieldReality } from './world-layout';
import { starfieldFragment, starfieldVertex } from './starfield-shader';
import {
  createStarfieldTimeline,
  sampleStarfieldTimeline,
} from './starfield-timeline';
import type { StarfieldInteraction } from './use-starfield-interaction';

type DiveAtmosphereParams = {
  reality: StarfieldReality;
  palette: DivePalette;
  gpuTier: number;
  motionMode: MotionMode;
  progressRef: RefObject<number>;
  interactionRef: RefObject<StarfieldInteraction>;
};

export default function DiveAtmosphere({
  reality,
  palette,
  gpuTier,
  motionMode,
  progressRef,
  interactionRef,
}: DiveAtmosphereParams) {
  const aspect = useThree(({ size }) => size.width / size.height);
  const fromRef = useRef<BufferAttribute>(null);
  const toRef = useRef<BufferAttribute>(null);
  const scatterRef = useRef<BufferAttribute>(null);
  const count = reality === 'watchers' ? 2400 : 2800;
  const [field] = useState(() => {
    const layout = buildStarfield(reality, count, aspect);
    return {
      layout,
      aspect,
      timeline: createStarfieldTimeline(layout.frames),
      from: new Float32Array(layout.frames[0].positions),
      to: new Float32Array(layout.frames[1 % layout.frames.length].positions),
      scatter: new Float32Array(layout.scatter),
      seeds: layout.seeds,
      frame: 0,
      burst: 0,
    };
  });
  const [uniforms] = useState(() => ({
    uStarlight: { value: new Color(palette.foreground) },
    uAccent: { value: new Color(palette.accent) },
    uHighlight: { value: new Color(palette.highlight) },
    uAppearanceFrom: { value: new Vector3() },
    uAppearanceTo: { value: new Vector3() },
    uLuminous: { value: Number(palette.mode === 'dark') },
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uAspect: { value: aspect },
    uViewHeight: { value: 1 },
    uMorph: { value: 0 },
    uTravel: { value: 0 },
    uPointer: { value: new Vector2() },
    uPointerStrength: { value: 0 },
    uBurstOrigin: { value: new Vector2() },
    uBurstAge: { value: 100 },
    uInteraction: { value: 1 },
  }));

  // REASON: palette changes update persistent GPU Color uniforms without parsing colours every frame.
  useEffect(() => {
    uniforms.uStarlight.value.set(palette.foreground);
    uniforms.uAccent.value.set(palette.accent);
    uniforms.uHighlight.value.set(palette.highlight);
    uniforms.uLuminous.value = Number(palette.mode === 'dark');
  }, [
    palette.accent,
    palette.foreground,
    palette.highlight,
    palette.mode,
    uniforms,
  ]);

  useFrame(({ gl, camera }, delta) => {
    if (aspect !== field.aspect) {
      field.layout = buildStarfield(reality, count, aspect);
      field.aspect = aspect;
      field.frame = -1;
      field.scatter.set(field.layout.scatter);
      if (scatterRef.current) {
        scatterRef.current.needsUpdate = true;
      }
    }
    const step = Math.min(delta, 0.1);
    const interaction = interactionRef.current;
    if (motionMode === 'full') {
      uniforms.uTime.value += step;
      uniforms.uBurstAge.value += step;
      if (interaction.burst !== field.burst) {
        uniforms.uBurstAge.value = 0;
        uniforms.uBurstOrigin.value.copy(interaction.burstOrigin);
      }
    }
    field.burst = interaction.burst;
    sampleStarfieldTimeline(field.timeline, uniforms.uTime.value);
    if (field.frame !== field.timeline.from) {
      field.from.set(field.layout.frames[field.timeline.from].positions);
      field.to.set(field.layout.frames[field.timeline.to].positions);
      if (fromRef.current && toRef.current) {
        fromRef.current.needsUpdate = true;
        toRef.current.needsUpdate = true;
      }
      field.frame = field.timeline.from;
    }
    uniforms.uMorph.value = field.timeline.morph;
    const from = field.layout.frames[field.timeline.from].appearance;
    const to = field.layout.frames[field.timeline.to].appearance;
    uniforms.uAppearanceFrom.value.set(from.size, from.glow, from.tint);
    uniforms.uAppearanceTo.value.set(to.size, to.glow, to.tint);
    uniforms.uTravel.value =
      reality === 'orbital' ? sectionTravel(progressRef.current) : 0;
    uniforms.uPointer.value.lerp(interaction.pointer, 1 - Math.exp(-step * 16));
    uniforms.uPointerStrength.value +=
      (interaction.active - uniforms.uPointerStrength.value) *
      (1 - Math.exp(-step * 10));
    uniforms.uInteraction.value = Number(motionMode === 'full');
    uniforms.uPixelRatio.value = gl.getPixelRatio();
    uniforms.uAspect.value = aspect;
    uniforms.uViewHeight.value = 64 / camera.projectionMatrix.elements[5];
  }, -1);

  return (
    <points name={`starfield-${reality}`} frustumCulled={false}>
      <bufferGeometry
        drawRange={{ start: 0, count: gpuTier < 2 ? count / 2 : count }}
      >
        <bufferAttribute
          ref={scatterRef}
          attach="attributes-position"
          args={[field.scatter, 3]}
          usage={DynamicDrawUsage}
        />
        <bufferAttribute
          ref={fromRef}
          attach="attributes-aFrom"
          args={[field.from, 3]}
          usage={DynamicDrawUsage}
        />
        <bufferAttribute
          ref={toRef}
          attach="attributes-aTo"
          args={[field.to, 3]}
          usage={DynamicDrawUsage}
        />
        <bufferAttribute attach="attributes-aSeed" args={[field.seeds, 3]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={starfieldVertex}
        fragmentShader={starfieldFragment}
        transparent
        toneMapped={false}
        depthWrite={false}
      />
    </points>
  );
}
