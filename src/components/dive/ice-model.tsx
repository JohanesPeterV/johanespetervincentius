'use client';

import { Environment, Html, useDetectGPU, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import {
  ACESFilmicToneMapping,
  Mesh,
  MeshPhysicalMaterial,
  ShaderChunk,
} from 'three';

import { HandoffCanvas } from './handoff-canvas';
import { IceScrollRotation } from './ice-scroll-rotation';

const FrozenMacbook = () => {
  const { scene } = useGLTF('/models/macbook-ice/macbook-in-ice.glb');
  const [model] = useState(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      if (
        !(object instanceof Mesh) ||
        !(object.material instanceof MeshPhysicalMaterial) ||
        object.material.transmission === 0
      ) {
        return;
      }
      const material = object.material.clone();
      // REASON: Three r173 clears transparent-canvas transmission to premultiplied
      // white at 0.5 alpha. Recover scene coverage before refraction so empty
      // ice transmits the page behind the canvas instead of that white fill.
      material.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <transmission_pars_fragment>',
          ShaderChunk.transmission_pars_fragment.replace(
            'return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );',
            `vec4 sampleColor = textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
            float coverage = clamp(2.0 * sampleColor.a - 1.0, 0.0, 1.0);
            sampleColor.rgb = max(sampleColor.rgb - vec3(0.5 * (1.0 - coverage)), vec3(0.0));
            return vec4(sampleColor.rgb, coverage);`,
          ),
        );
      };
      object.material = material;
    });
    return clone;
  });

  // REASON: the chapter unmounts its canvas offscreen; release only its cloned
  // ice materials, keeping the cached GLTF geometry and laptop materials alive.
  useEffect(
    () => () => {
      model.traverse((object) => {
        if (
          object instanceof Mesh &&
          object.material instanceof MeshPhysicalMaterial &&
          object.material.transmission > 0
        ) {
          object.material.dispose();
        }
      });
    },
    [model],
  );

  return <primitive object={model} dispose={null} />;
};

const IceLighting = () => (
  <Environment
    files="/models/macbook-ice/studio.exr"
    environmentIntensity={0.91}
    environmentRotation={[0, Math.PI, 0]}
  />
);

export default function IceModel({ turn }: { turn: number }) {
  const { tier } = useDetectGPU();

  return (
    <Canvas
      frameloop="demand"
      dpr={tier < 2 ? 0.8 : 1}
      onCreated={({ gl }) => {
        // REASON: the ice refracts a second render of the whole model; a smaller
        // transmission buffer avoids a full-resolution extra pass while turning.
        gl.transmissionResolutionScale = tier < 2 ? 0.5 : 0.75;
      }}
      camera={{
        fov: 32,
        near: 0.05,
        far: 100,
        position: [2.2, 2, 6.8],
      }}
      gl={{ toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      fallback={<p role="alert">WebGL is needed to view this 3D model.</p>}
      aria-label="Interactive 3D MacBook enclosed in textured ice"
    >
      <directionalLight color="#f2f6ff" intensity={2} position={[-3, 5, 5]} />
      <directionalLight color="#c7d7ff" intensity={0.9} position={[4, 2, 3]} />
      <Suspense
        fallback={
          <Html center>
            <p role="status" className="type-label whitespace-nowrap">
              Loading frozen MacBook…
            </p>
          </Html>
        }
      >
        <IceLighting />
        <IceScrollRotation turn={turn}>
          <FrozenMacbook />
        </IceScrollRotation>
        <HandoffCanvas />
      </Suspense>
    </Canvas>
  );
}
