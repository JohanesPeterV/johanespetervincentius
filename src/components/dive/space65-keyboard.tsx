'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
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
  chapterRef: RefObject<number>;
};

export const SPACE65_MODEL_URL = '/models/space65-pyga-black.glb';

// REASON: Smilie hero, TableLink sweep, Farmio Enter-side close-up and BINUS
// overhead share one track; scale reserves stage width for rotated corners.
const CHAPTER_POSES = [
  {
    rotation: new Quaternion().setFromEuler(new Euler(0.96, -0.26, -0.12)),
    position: new Vector3(-0.02, 0, 0),
    scale: 0.86,
  },
  {
    rotation: new Quaternion().setFromEuler(new Euler(1.08, 0.42, 0.06)),
    position: new Vector3(0.09, 0.03, -0.04),
    scale: 0.84,
  },
  {
    rotation: new Quaternion().setFromEuler(new Euler(0.65, -0.78, -0.08)),
    position: new Vector3(-0.03, -0.03, 0.06),
    scale: 0.96,
  },
  {
    rotation: new Quaternion().setFromEuler(new Euler(1.43, 0.02, 0)),
    position: new Vector3(0, 0.04, 0),
    scale: 0.88,
  },
];

export default function Space65Keyboard({
  palette,
  motionMode,
  chapterRef,
}: Space65KeyboardParams) {
  const { scene, animations } = useGLTF(SPACE65_MODEL_URL);
  const groupRef = useRef<Group>(null);
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
    if (motionMode === 'full') {
      keyboard.mixer.update(Math.min(delta, 0.05));
    }
    const progress = MathUtils.clamp(
      chapterRef.current,
      0,
      CHAPTER_POSES.length - 1,
    );
    const chapter = motionMode === 'reduced' ? Math.round(progress) : progress;
    const index = Math.floor(chapter);
    const from = CHAPTER_POSES[index];
    const to = CHAPTER_POSES[Math.min(index + 1, CHAPTER_POSES.length - 1)];
    // REASON: easing is spatial, never time-based, so reversing a drag retraces
    // the same shot immediately; reduced motion samples only a resting pose.
    const blend = MathUtils.smoothstep(chapter - index, 0, 1);
    group.quaternion.slerpQuaternions(from.rotation, to.rotation, blend);
    group.position.lerpVectors(from.position, to.position, blend);
    group.scale.setScalar(MathUtils.lerp(from.scale, to.scale, blend));
  });

  return (
    <group ref={groupRef} dispose={null}>
      <group scale={keyboard.scale}>
        <primitive object={keyboard.object} />
      </group>
    </group>
  );
}
