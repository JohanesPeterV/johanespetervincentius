import { createContext } from 'react';
import {
  Camera,
  InstancedBufferAttribute,
  MathUtils,
  PerspectiveCamera,
  Vector2,
  Vector3,
} from 'three';

import type { buildSpatialStarfield } from './starfield-space';

type StarfieldMotionParams = {
  attributes: {
    aFrom: InstancedBufferAttribute;
    aTo: InstancedBufferAttribute;
    aScatter: InstancedBufferAttribute;
    aSeed: InstancedBufferAttribute;
  };
  uniforms: {
    uTime: { value: number };
    uMorph: { value: number };
    uTravel: { value: number };
    uFlow: { value: number };
    uAspect: { value: number };
    uPointer: { value: Vector2 };
    uPointerStrength: { value: number };
    uBurstOrigin: { value: Vector2 };
    uBurstAge: { value: number };
    uInteraction: { value: number };
  };
  camera: Camera;
  origin: PerspectiveCamera;
  layout: ReturnType<typeof buildSpatialStarfield>;
};

export const createStarfieldMotion = ({
  attributes,
  uniforms,
  camera,
  origin,
  layout,
}: StarfieldMotionParams) => {
  const from = new Vector3();
  const to = new Vector3();
  const scatter = new Vector3();
  const seed = new Vector3();
  const projected = new Vector3();
  origin.updateMatrixWorld();
  const aspect = uniforms.uAspect.value;
  const tangent = Math.tan((58 * Math.PI) / 360);
  const screenPoint = (positions: Float32Array, index: number): Vector3 => {
    const depth = -positions[index * 3 + 2];
    return new Vector3(
      positions[index * 3] / (tangent * depth * aspect),
      positions[index * 3 + 1] / (tangent * depth),
      depth,
    );
  };

  const selectParticles = (anchors: readonly [number, number][]): number[] => {
    const selected: number[] = [];
    for (const [x, y] of anchors) {
      let closest = -1;
      let lowestCost = Infinity;
      for (let index = 0; index < attributes.aSeed.count / 2; index += 1) {
        if (attributes.aSeed.getZ(index) < 0.2 || selected.includes(index)) {
          continue;
        }
        const start = screenPoint(layout.frames[0].positions, index);
        let cost = Math.pow(start.x - x, 2) + Math.pow(start.y - y, 2);
        for (const frame of layout.frames) {
          const point = screenPoint(frame.positions, index);
          cost += Math.pow((point.z - 36) / 45, 2);
          cost += Math.pow(Math.max(0, Math.abs(point.x) - 0.8), 2) * 20;
          cost += Math.pow(Math.max(0, Math.abs(point.y) - 0.85), 2) * 20;
          if (Math.abs(point.x) < 0.4 && Math.abs(point.y) < 0.55) {
            cost += 0.8;
          }
          for (const companion of selected) {
            const other = screenPoint(frame.positions, companion);
            const separation = Math.hypot(
              (point.x - other.x) * Math.min(aspect, 1),
              point.y - other.y,
            );
            cost += Math.pow(Math.max(0, 0.2 - separation), 2) * 35;
          }
        }
        if (cost < lowestCost) {
          lowestCost = cost;
          closest = index;
        }
      }
      if (closest < 0) {
        throw new Error('The starfield has no available companion particle.');
      }
      selected.push(closest);
    }
    return selected;
  };

  // REASON: four rigid models sample the GPU star trajectories on the CPU so their lighting and frustum bounds follow their real positions.
  const sampleParticle = (index: number, position: Vector3): void => {
    from.fromBufferAttribute(attributes.aFrom, index);
    to.fromBufferAttribute(attributes.aTo, index);
    scatter.fromBufferAttribute(attributes.aScatter, index);
    seed.fromBufferAttribute(attributes.aSeed, index);
    const time = uniforms.uTime.value;
    const travel = uniforms.uTravel.value;
    const flow = uniforms.uFlow.value;
    const delay = seed.x * 0.18;
    const phase = MathUtils.clamp(
      (uniforms.uMorph.value - delay) / (1 - delay),
      0,
      1,
    );
    const morph = MathUtils.smoothstep(phase, 0, 1);
    position.lerpVectors(from, to, morph);
    const arc = Math.sin(morph * 3.14159) * 0.16;
    position.x -= (to.y - from.y) * arc;
    position.y += (to.x - from.x) * arc;
    position.lerp(scatter, 1 - Number(seed.z >= 0.2) * (1 - travel));
    position.x += Math.sin(time * 0.18 + seed.x * 6.283) * 0.6;
    position.y += Math.cos(time * 0.14 + seed.z * 6.283) * 0.6;
    position.z += Math.sin(time * 0.12 + seed.y * 6.283) * 0.8;
    position.x += Math.sign(position.x) * travel * (4 + seed.z * 7);
    const flowDepth = Math.max(12, Math.abs(position.z));
    position.y -= flow * flowDepth * (0.85 + seed.x * 0.65);
    position.x += Math.sin(seed.z * 6.283) * flow * flowDepth * 0.08;

    projected
      .copy(position)
      .applyMatrix4(origin.matrixWorld)
      .applyMatrix4(camera.matrixWorldInverse);
    if (projected.z >= -0.2 || uniforms.uInteraction.value === 0) {
      return;
    }
    projected.applyMatrix4(camera.projectionMatrix);
    const aspect = uniforms.uAspect.value;
    let x = projected.x * aspect;
    let y = projected.y;
    const pointerX = x - uniforms.uPointer.value.x * aspect;
    const pointerY = y - uniforms.uPointer.value.y;
    const pointerDistance = Math.hypot(pointerX, pointerY);
    const pointerInfluence =
      (Math.exp(-Math.pow(pointerDistance / 0.24, 2)) *
        uniforms.uPointerStrength.value *
        uniforms.uInteraction.value) /
      Math.max(pointerDistance, 0.025);
    x += (pointerX * 0.12 - pointerY * 0.085) * pointerInfluence;
    y += (pointerY * 0.12 + pointerX * 0.085) * pointerInfluence;
    const burstX = x - uniforms.uBurstOrigin.value.x * aspect;
    const burstY = y - uniforms.uBurstOrigin.value.y;
    const burstDistance = Math.hypot(burstX, burstY);
    const age = uniforms.uBurstAge.value;
    const wave =
      (Math.exp(-Math.pow((burstDistance - age * 0.75) / 0.12, 2)) *
        Math.exp(-age * 0.7) *
        0.3 *
        uniforms.uInteraction.value) /
      Math.max(burstDistance, 0.025);
    position
      .set((x + burstX * wave) / aspect, y + burstY * wave, projected.z)
      .unproject(camera)
      .applyMatrix4(origin.matrixWorldInverse);
  };

  return { selectParticles, sampleParticle, time: uniforms.uTime };
};

export const StarfieldMotionContext = createContext<ReturnType<
  typeof createStarfieldMotion
> | null>(null);
