'use client';

import CrystalField from '@/components/3d/crystal-field';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';

const BACKGROUND_COLOR = '#04060d';
const CRYSTAL_COLOR = '#bcd8ff';

export default function CrystalBackground() {
  return (
    <div className="fixed inset-0 z-[-10]">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0, 4] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[BACKGROUND_COLOR]} />
        <CrystalField color={CRYSTAL_COLOR} />
        <EffectComposer>
          <Bloom
            intensity={1.15}
            luminanceThreshold={0.0}
            luminanceSmoothing={0.85}
            mipmapBlur
          />
          <Vignette offset={0.2} darkness={0.85} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
