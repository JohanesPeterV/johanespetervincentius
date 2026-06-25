import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import AmbientEmbers from './ambient-embers';

type MachineSceneParams = {
  accentColor: string;
};

const MODEL_PATH = '/models/mac-transformed.glb';
const BASE_HEIGHT = -0.5;
const REST_SCALE = 0.8;
const INTRO_SECONDS = 2.4;
const LOOK_TARGET = new THREE.Vector3(0, -0.4, 0);
const INTRO_CAMERA = new THREE.Vector3(0, 5, 14);
const REST_CAMERA = new THREE.Vector3(0, 2, 8);

const easeOut = (value: number): number => {
  return 1 - Math.pow(1 - value, 3);
};

export default function MachineScene({ accentColor }: MachineSceneParams) {
  const { scene } = useGLTF(MODEL_PATH);
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const intro = easeOut(Math.min(time / INTRO_SECONDS, 1));

    state.camera.position.lerpVectors(INTRO_CAMERA, REST_CAMERA, intro);
    state.camera.lookAt(LOOK_TARGET);

    if (!modelRef.current) {
      return;
    }

    modelRef.current.scale.setScalar(REST_SCALE * intro);
    modelRef.current.rotation.y += delta * 0.2;
    modelRef.current.position.y = BASE_HEIGHT + Math.sin(time * 0.5) * 0.06;
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
      <group ref={modelRef} scale={0} position={[0, BASE_HEIGHT, 0]}>
        <primitive object={scene} />
      </group>
    </>
  );
}
