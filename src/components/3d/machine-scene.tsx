import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import AmbientEmbers from './ambient-embers';

type MachineSceneParams = {
  accentColor: string;
};

const MODEL_PATH = '/models/mac-transformed.glb';
const BASE_HEIGHT = -0.4;

export default function MachineScene({ accentColor }: MachineSceneParams) {
  const { scene } = useGLTF(MODEL_PATH);
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!modelRef.current) {
      return;
    }

    modelRef.current.rotation.y += delta * 0.2;
    modelRef.current.position.y =
      BASE_HEIGHT + Math.sin(state.clock.elapsedTime * 0.5) * 0.06;
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight
        position={[4, 5, 4]}
        intensity={120}
        angle={0.6}
        penumbra={0.8}
        color={accentColor}
      />
      <pointLight position={[-4, 1, -3]} intensity={70} color={accentColor} />
      <pointLight position={[0, 2, 5]} intensity={20} color="#ffffff" />
      <AmbientEmbers color={accentColor} count={420} />
      <group
        ref={modelRef}
        scale={1.6}
        position={[0, BASE_HEIGHT, 0]}
        rotation={[-0.15, 0, 0]}
      >
        <primitive object={scene} />
      </group>
    </>
  );
}
