'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import {
  BackSide,
  Color,
  Data3DTexture,
  LinearFilter,
  Mesh,
  RedFormat,
  RepeatWrapping,
  Vector3,
} from 'three';

import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import {
  galacticCloudFragment,
  galacticCloudVertex,
} from './galactic-cloud-shader';
import { createSpaceOrigin } from './space-origin';
import { createSeededRandom } from './world-layout';

type GalacticCloudParams = {
  palette: DivePalette;
  motionMode: MotionMode;
  gpuTier: number;
};

const NOISE_SIZE = 64;

const createCloudNoise = (): Data3DTexture => {
  const random = createSeededRandom(1703);
  const data = new Uint8Array(NOISE_SIZE ** 3);
  for (let index = 0; index < data.length; index++) {
    data[index] = Math.floor(random() * 256);
  }
  const texture = new Data3DTexture(data, NOISE_SIZE, NOISE_SIZE, NOISE_SIZE);
  texture.format = RedFormat;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.wrapR = RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
};

export default function GalacticCloud({
  palette,
  motionMode,
  gpuTier,
}: GalacticCloudParams) {
  const volumeRef = useRef<Mesh>(null);
  const [origin] = useState(createSpaceOrigin);
  const [uniforms] = useState(() => ({
    uNoise: { value: createCloudNoise() },
    uNoiseScale: { value: 1 / NOISE_SIZE },
    uCameraLocal: { value: new Vector3() },
    uAccent: { value: new Color(palette.accent) },
    uHighlight: { value: new Color(palette.highlight) },
    uForeground: { value: new Color(palette.foreground) },
    uLuminous: { value: Number(palette.mode === 'dark') },
    uTime: { value: 0 },
    uStrength: { value: 1 },
    uSteps: { value: 32 },
  }));

  // REASON: this component owns the GPU noise texture and releases it on unmount.
  useEffect(() => {
    return () => {
      uniforms.uNoise.value.dispose();
    };
  }, [uniforms]);

  // REASON: the persistent volume material must follow live palette changes.
  useEffect(() => {
    uniforms.uAccent.value.set(palette.accent);
    uniforms.uHighlight.value.set(palette.highlight);
    uniforms.uForeground.value.set(palette.foreground);
    uniforms.uLuminous.value = Number(palette.mode === 'dark');
  }, [
    palette.accent,
    palette.highlight,
    palette.foreground,
    palette.mode,
    uniforms,
  ]);

  useFrame(({ camera, size }, delta) => {
    const volume = volumeRef.current;
    if (!volume) {
      return;
    }
    const compact = size.width < 768;
    const aspect = size.width / size.height;
    volume.position.set(0, 0, -145);
    volume.scale.set(90 * Math.max(aspect, 0.65), 78, 38);
    volume.rotation.set(0.06, -0.08, 0);
    volume.updateWorldMatrix(true, false);
    uniforms.uCameraLocal.value.copy(camera.position);
    volume.worldToLocal(uniforms.uCameraLocal.value);
    uniforms.uStrength.value = compact ? 0.72 : 1;
    uniforms.uSteps.value = compact || gpuTier < 2 ? 20 : 32;
    if (motionMode === 'full') {
      uniforms.uTime.value += Math.min(delta, 0.1);
    }
  }, -1);

  return (
    <group
      name="galactic-cloud"
      position={origin.position}
      quaternion={origin.quaternion}
    >
      <mesh ref={volumeRef} renderOrder={-1} frustumCulled={false}>
        <boxGeometry args={[2, 2, 2]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={galacticCloudVertex}
          fragmentShader={galacticCloudFragment}
          side={BackSide}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
