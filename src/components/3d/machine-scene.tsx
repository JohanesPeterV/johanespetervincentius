import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import ScrollEmbers from './scroll-embers';

type MachineSceneParams = {
  accentColor: string;
};

const MODEL_PATH = '/models/mac-transformed.glb';

const HERO_CAMERA = new THREE.Vector3(0, 0.25, 3.6);
const END_CAMERA = new THREE.Vector3(1.3, 1.1, 5.6);
const HERO_TARGET = new THREE.Vector3(0, -0.15, 0);
const END_TARGET = new THREE.Vector3(-0.25, -0.3, 0);

const getScrollProgress = (): number => {
  if (typeof window === 'undefined') {
    return 0;
  }

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;

  if (scrollable <= 0) {
    return 0;
  }

  return Math.min(Math.max(window.scrollY / scrollable, 0), 1);
};

const easeInOut = (value: number): number => {
  if (value < 0.5) {
    return 2 * value * value;
  }

  return 1 - Math.pow(-2 * value + 2, 2) / 2;
};

export default function MachineScene({ accentColor }: MachineSceneParams) {
  const { scene } = useGLTF(MODEL_PATH);
  const modelRef = useRef<THREE.Group>(null);
  const lookTarget = useRef(new THREE.Vector3()).current;

  useFrame((state) => {
    const progress = easeInOut(getScrollProgress());
    const time = state.clock.elapsedTime;

    state.camera.position.lerpVectors(HERO_CAMERA, END_CAMERA, progress);
    lookTarget.lerpVectors(HERO_TARGET, END_TARGET, progress);
    state.camera.lookAt(lookTarget);

    if (!modelRef.current) {
      return;
    }

    modelRef.current.rotation.y = -0.6 * progress + Math.sin(time * 0.3) * 0.04;
    modelRef.current.position.y = -0.6 + Math.sin(time * 0.5) * 0.04;
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <spotLight
        position={[4, 5, 4]}
        intensity={130}
        angle={0.6}
        penumbra={0.8}
        color={accentColor}
      />
      <pointLight position={[-4, 1, -3]} intensity={70} color={accentColor} />
      <pointLight position={[0, 2, 5]} intensity={25} color="#ffffff" />
      <ScrollEmbers color={accentColor} count={420} />
      <group ref={modelRef} scale={1.45} rotation={[-0.12, 0, 0]}>
        <primitive object={scene} />
      </group>
    </>
  );
}
