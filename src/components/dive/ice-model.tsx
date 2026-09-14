'use client';

import {
  Environment,
  Html,
  OrbitControls,
  useDetectGPU,
  useGLTF,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { ACESFilmicToneMapping } from 'three';

import { useMediaQuery } from '@/hooks/use-media-query';

const FrozenMacbook = () => {
  const { scene } = useGLTF('/models/macbook-ice/macbook-in-ice.glb');
  return <primitive object={scene} dispose={null} />;
};

const IceLighting = () => (
  <Environment
    files="/models/macbook-ice/studio.exr"
    environmentIntensity={0.91}
    environmentRotation={[0, Math.PI, 0]}
  />
);

export default function IceModel() {
  const { tier } = useDetectGPU();
  const mobile = useMediaQuery('(max-width: 640px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <Canvas
      frameloop="demand"
      dpr={tier < 2 ? 1 : 1.5}
      camera={{
        fov: 32,
        near: 0.05,
        far: 100,
        position: mobile ? [3.7, 3.4, 11.5] : [2.2, 2, 6.8],
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
        <FrozenMacbook />
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping={!reducedMotion}
      />
    </Canvas>
  );
}
