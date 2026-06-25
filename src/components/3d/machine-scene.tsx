import { getIntroProgress } from '@/lib/intro';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type MachineSceneParams = {
  accentColor: string;
};

const MODEL_PATH = '/models/mac-transformed.glb';
const FLOAT_HEIGHT = 2.3;
const REST_SCALE = 0.22;
const VISIBLE_HALF_HEIGHT = 3.27;
const MAX_OFFSET_X = 3.4;
const EDGE_MARGIN = 1;
const LOOK_TARGET = new THREE.Vector3(0, 0.5, 0);
const INTRO_CAMERA = new THREE.Vector3(0, 3, 15);
const REST_CAMERA = new THREE.Vector3(0, 1, 8);

export default function MachineScene({ accentColor }: MachineSceneParams) {
  const { scene } = useGLTF(MODEL_PATH);
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const intro = getIntroProgress(time);

    state.camera.position.lerpVectors(INTRO_CAMERA, REST_CAMERA, intro);
    state.camera.lookAt(LOOK_TARGET);

    if (!modelRef.current) {
      return;
    }

    const aspect = state.size.width / Math.max(state.size.height, 1);
    const anchorX = Math.min(
      MAX_OFFSET_X,
      VISIBLE_HALF_HEIGHT * aspect - EDGE_MARGIN,
    );

    modelRef.current.scale.setScalar(REST_SCALE * intro);
    modelRef.current.rotation.y += delta * 0.15;
    modelRef.current.rotation.x = -0.12 + Math.sin(time * 0.4) * 0.05;
    modelRef.current.rotation.z = Math.sin(time * 0.35) * 0.05;
    modelRef.current.position.x = anchorX + Math.sin(time * 0.3) * 0.2;
    modelRef.current.position.y = FLOAT_HEIGHT + Math.sin(time * 0.6) * 0.18;
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
      <pointLight position={[0, 2.5, 5]} intensity={25} color="#ffffff" />
      <group ref={modelRef} scale={0} position={[0, FLOAT_HEIGHT, 0]}>
        <primitive object={scene} />
      </group>
    </>
  );
}
