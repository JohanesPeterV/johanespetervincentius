'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import {
  BackSide,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  Color,
  DynamicDrawUsage,
  Vector2,
  Vector3,
} from 'three';

import type { DivePalette } from './dive-palette';
import { sectionTravel } from './descent';
import type { MotionMode } from './descent';
import { heroHandoffProgress } from './hero-handoff';
import type { HeroHandoff } from './hero-handoff';
import { buildSpatialStarfield } from './starfield-space';
import { createStarGeometry } from './starfield-geometry';
import { createSpaceOrigin } from './space-origin';
import type { StarfieldReality } from './world-layout';
import {
  starfieldFragment,
  starfieldHaloFragment,
  starfieldVertex,
} from './starfield-shader';
import {
  advanceStarfieldTimeline,
  createStarfieldTimeline,
  sampleStarfieldTimeline,
} from './starfield-timeline';
import type { StarfieldInteraction } from './use-starfield-interaction';
import {
  starfieldRequestAtom,
  starfieldStatusAtom,
} from './starfield-controls';

type DiveAtmosphereParams = {
  reality: StarfieldReality;
  palette: DivePalette;
  gpuTier: number;
  motionMode: MotionMode;
  progressRef: RefObject<number>;
  handoffRef: RefObject<HeroHandoff>;
  interactionRef: RefObject<StarfieldInteraction>;
};

const FORMATION_HOLD_SCALE = 4;

export default function DiveAtmosphere({
  reality,
  palette,
  gpuTier,
  motionMode,
  progressRef,
  handoffRef,
  interactionRef,
}: DiveAtmosphereParams) {
  const aspect = useThree(({ size }) => size.width / size.height);
  const advanceRequest = useAtomValue(starfieldRequestAtom);
  const setStatus = useSetAtom(starfieldStatusAtom);
  const count = reality === 'watchers' ? 2400 : 2800;
  const [field] = useState(() => {
    const layout = buildSpatialStarfield(reality, count, aspect);
    // REASON: the initial observer defines local zero once; following the live
    // camera would cancel perspective movement and lock the stars to the screen.
    const origin = createSpaceOrigin();
    return {
      layout,
      origin,
      aspect,
      timeline: createStarfieldTimeline(
        layout.frames.map(({ hold, duration }) => ({
          hold: hold * FORMATION_HOLD_SCALE,
          duration,
        })),
      ),
      body: createStarGeometry(),
      halo: new IcosahedronGeometry(0.5, 1),
      attributes: {
        aFrom: new InstancedBufferAttribute(
          new Float32Array(layout.frames[0].positions),
          3,
        ).setUsage(DynamicDrawUsage),
        aTo: new InstancedBufferAttribute(
          new Float32Array(layout.frames[1 % layout.frames.length].positions),
          3,
        ).setUsage(DynamicDrawUsage),
        aScatter: new InstancedBufferAttribute(
          new Float32Array(layout.scatter),
          3,
        ).setUsage(DynamicDrawUsage),
        aSeed: new InstancedBufferAttribute(layout.seeds, 3),
      },
      frame: 0,
      burst: 0,
      request: advanceRequest,
      status: 'loading',
    };
  });
  const [uniforms] = useState(() => ({
    uStarlight: { value: new Color(palette.foreground) },
    uBackground: { value: new Color(palette.background) },
    uAccent: { value: new Color(palette.accent) },
    uHighlight: { value: new Color(palette.highlight) },
    uAppearanceFrom: { value: new Vector3() },
    uAppearanceTo: { value: new Vector3() },
    uLuminous: { value: Number(palette.mode === 'dark') },
    uTime: { value: 0 },
    uAspect: { value: aspect },
    uWorldScale: { value: Math.min(aspect, 1) },
    uMorph: { value: 0 },
    uTravel: { value: 0 },
    uFlow: { value: 0 },
    uPointer: { value: new Vector2() },
    uPointerStrength: { value: 0 },
    uBurstOrigin: { value: new Vector2() },
    uBurstAge: { value: 100 },
    uInteraction: { value: 1 },
  }));

  // REASON: the shared DOM control must return to loading when its canvas renderer unmounts.
  useEffect(() => {
    return () => {
      field.status = 'loading';
      setStatus('loading');
    };
  }, [field, setStatus]);

  // REASON: palette changes update persistent GPU Color uniforms without parsing colours every frame.
  useEffect(() => {
    uniforms.uStarlight.value.set(palette.foreground);
    uniforms.uBackground.value.set(palette.background);
    uniforms.uAccent.value.set(palette.accent);
    uniforms.uHighlight.value.set(palette.highlight);
    uniforms.uLuminous.value = Number(palette.mode === 'dark');
  }, [
    palette.accent,
    palette.background,
    palette.foreground,
    palette.highlight,
    palette.mode,
    uniforms,
  ]);

  useFrame((_state, delta) => {
    if (aspect !== field.aspect) {
      field.layout = buildSpatialStarfield(reality, count, aspect);
      field.aspect = aspect;
      field.frame = -1;
      field.attributes.aScatter.array.set(field.layout.scatter);
      field.attributes.aScatter.needsUpdate = true;
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
    const requested = advanceRequest !== field.request;
    if (requested) {
      advanceStarfieldTimeline(
        field.timeline,
        motionMode === 'reduced' ? 'instant' : 'animate',
      );
      field.request = advanceRequest;
    }
    const status =
      motionMode === 'full' && field.timeline.transitioning
        ? 'transitioning'
        : 'ready';
    if (requested || field.status !== status) {
      field.status = status;
      setStatus(status);
    }
    if (field.frame !== field.timeline.from) {
      field.attributes.aFrom.array.set(
        field.layout.frames[field.timeline.from].positions,
      );
      field.attributes.aTo.array.set(
        field.layout.frames[field.timeline.to].positions,
      );
      field.attributes.aFrom.needsUpdate = true;
      field.attributes.aTo.needsUpdate = true;
      field.frame = field.timeline.from;
    }
    uniforms.uMorph.value = field.timeline.morph;
    const from = field.layout.frames[field.timeline.from].appearance;
    const to = field.layout.frames[field.timeline.to].appearance;
    uniforms.uAppearanceFrom.value.set(from.size, from.glow, from.tint);
    uniforms.uAppearanceTo.value.set(to.size, to.glow, to.tint);
    uniforms.uTravel.value =
      reality === 'orbital' ? sectionTravel(progressRef.current) : 0;
    const handoff = handoffRef.current;
    const departure =
      handoff.crossing === 'loop'
        ? 1 - handoff.progress
        : heroHandoffProgress(handoff.journey);
    uniforms.uFlow.value = motionMode === 'full' ? departure * departure : 0;
    uniforms.uPointer.value.lerp(interaction.pointer, 1 - Math.exp(-step * 16));
    uniforms.uPointerStrength.value +=
      (interaction.active - uniforms.uPointerStrength.value) *
      (1 - Math.exp(-step * 10));
    uniforms.uInteraction.value = Number(motionMode === 'full');
    uniforms.uAspect.value = aspect;
    uniforms.uWorldScale.value = Math.min(aspect, 1);
  }, -1);

  const instanceCount = gpuTier < 2 ? count / 2 : count;

  return (
    <group
      position={field.origin.position}
      quaternion={field.origin.quaternion}
    >
      <mesh name={`starfield-${reality}`} frustumCulled={false}>
        <instancedBufferGeometry
          index={field.body.index}
          attributes={{ ...field.body.attributes, ...field.attributes }}
          instanceCount={instanceCount}
        />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={starfieldVertex}
          fragmentShader={starfieldFragment}
          toneMapped={false}
        />
      </mesh>
      <mesh name={`starfield-halo-${reality}`} frustumCulled={false}>
        <instancedBufferGeometry
          index={field.halo.index}
          attributes={{ ...field.halo.attributes, ...field.attributes }}
          instanceCount={instanceCount}
        />
        <shaderMaterial
          uniforms={uniforms}
          defines={{ STAR_HALO: 1 }}
          vertexShader={starfieldVertex}
          fragmentShader={starfieldHaloFragment}
          transparent
          side={BackSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
