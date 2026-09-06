'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import {
  AnimationMixer,
  Box3,
  Euler,
  Group,
  Material,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from 'three';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';

type Space65KeyboardParams = {
  palette: DivePalette;
  motionMode: MotionMode;
  chapter: number;
};

export const SPACE65_MODEL_URL = '/models/space65-pyga-black.glb';

const CHAPTER_POSES: [number, number, number][] = [
  [0.9, -0.2, -0.12],
  [1.08, 0.26, 0.06],
  [0.73, -0.38, -0.05],
  [1.22, 0.08, 0.1],
];

export default function Space65Keyboard({
  palette,
  motionMode,
  chapter,
}: Space65KeyboardParams) {
  const { scene, animations } = useGLTF(SPACE65_MODEL_URL);
  const groupRef = useRef<Group>(null);
  const pose =
    CHAPTER_POSES[
      MathUtils.clamp(Math.trunc(chapter), 0, CHAPTER_POSES.length - 1)
    ];
  const [keyboard] = useState(() => {
    const typing = animations.find((clip) => clip.name === 'Typing');
    if (!typing) {
      throw new Error('The Space65 model is missing its Typing animation.');
    }
    const object = scene.clone(true);
    const materials = new Map<Material, Material>();
    const cloneMaterial = (source: Material): Material => {
      const existing = materials.get(source);
      if (existing) {
        return existing;
      }
      const material = source.clone();
      materials.set(source, material);
      if (
        material instanceof MeshStandardMaterial &&
        material.name.startsWith('Legends ')
      ) {
        // REASON: the inlay meshes sit close to the key shells; depth bias
        // preserves their legibility at the world's camera distances.
        material.polygonOffset = true;
        material.polygonOffsetFactor = -1;
        material.polygonOffsetUnits = -1;
      }
      return material;
    };
    object.traverse((part) => {
      if (!(part instanceof Mesh)) {
        return;
      }
      part.material = Array.isArray(part.material)
        ? part.material.map(cloneMaterial)
        : cloneMaterial(part.material);
      part.castShadow = true;
      part.receiveShadow = true;
    });
    const bounds = new Box3().setFromObject(object, true);
    const width = bounds.getSize(new Vector3()).x;
    if (!Number.isFinite(width) || width <= 0) {
      throw new Error('The Space65 model has invalid dimensions.');
    }
    // REASON: the supplied GLB is already Y-up with the spacebar toward +Z;
    // center its rest bounds without changing animated key-local transforms.
    object.position.sub(bounds.getCenter(new Vector3()));
    return {
      object,
      materials: [...materials.values()],
      mixer: new AnimationMixer(object),
      typing,
      scale: 3.3 / width,
      elapsed: 0,
      poseEuler: new Euler(...pose),
      targetRotation: new Quaternion(),
    };
  });

  // REASON: theme changes must update instance-owned Three.js materials,
  // not the shared useGLTF cache or freshly allocated materials per frame.
  useEffect(() => {
    for (const material of keyboard.materials) {
      if (!(material instanceof MeshStandardMaterial)) {
        continue;
      }
      if (material.name.startsWith('LED ')) {
        const color = material.name.includes('violet')
          ? palette.highlight
          : palette.accent;
        material.color.set(color);
        material.emissive.set(color);
      }
    }
  }, [keyboard, palette.accent, palette.highlight]);

  // REASON: AnimationMixer binds imperative key transforms; stop restores
  // their rest positions on reduced motion and releases bindings on unmount.
  useEffect(() => {
    if (motionMode === 'full') {
      keyboard.mixer.clipAction(keyboard.typing).reset().play();
    }
    return () => {
      keyboard.mixer.stopAllAction();
      keyboard.mixer.uncacheRoot(keyboard.object);
    };
  }, [keyboard, motionMode]);

  // REASON: R3F must not dispose shared GLB geometry/textures; only the
  // cloned materials belong to this mounted keyboard and need GPU cleanup.
  useEffect(() => {
    return () => {
      for (const material of keyboard.materials) {
        material.dispose();
      }
    };
  }, [keyboard]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const step = Math.min(delta, 0.05);
    if (motionMode === 'full') {
      keyboard.elapsed += step;
      keyboard.mixer.update(step);
    } else {
      keyboard.elapsed = 0;
    }
    const phase = keyboard.elapsed * 0.45;
    keyboard.poseEuler.set(
      pose[0] + Math.sin(phase) * 0.018,
      pose[1] + Math.sin(phase * 0.7) * 0.025,
      pose[2] + Math.sin(phase * 0.6) * 0.008,
    );
    keyboard.targetRotation.setFromEuler(keyboard.poseEuler);
    if (motionMode === 'reduced') {
      group.quaternion.copy(keyboard.targetRotation);
    } else {
      group.quaternion.slerp(
        keyboard.targetRotation,
        1 - Math.exp(-3.5 * step),
      );
    }
    group.position.y = Math.sin(phase) * 0.025;
  });

  return (
    <group ref={groupRef} rotation={keyboard.poseEuler} dispose={null}>
      <group scale={keyboard.scale}>
        <primitive object={keyboard.object} />
      </group>
    </group>
  );
}
