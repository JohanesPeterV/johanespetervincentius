import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import AmbientEmbers from './ambient-embers';
import FloatingMarks from './floating-marks';
import { getOrbitRadius, ORBIT_SPEED } from './orbit';

type MachineSceneParams = {
  accentColor: string;
};

const MODEL_PATH = '/models/mac-transformed.glb';
// REASON: the MacBook rides the fifth slot on the shared ring with the four AI marks
const MAC_ANGLE = 5.63;
const MAC_HEIGHT = 0.3;
const REST_SCALE = 0.22;
const INTRO_SECONDS = 2.4;
// REASON: orbit centre on the ground plane; the card overlay sits here so marks revolve around it
const LOOK_TARGET = new THREE.Vector3(0, 0, 0);
const INTRO_CAMERA = new THREE.Vector3(0, 4, 14);
// REASON: rest pose looks down from above so the horizontal orbit reads as circling, not a sideways sweep
const REST_CAMERA = new THREE.Vector3(0, 9, 5);

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

    const aspect = state.size.width / Math.max(state.size.height, 1);
    const radius = getOrbitRadius(aspect);
    const orbit = time * ORBIT_SPEED + MAC_ANGLE;

    modelRef.current.scale.setScalar(REST_SCALE * intro);
    modelRef.current.rotation.y += delta * 0.15;
    modelRef.current.rotation.x = -0.12 + Math.sin(time * 0.4) * 0.05;
    modelRef.current.rotation.z = Math.sin(time * 0.35) * 0.05;
    modelRef.current.position.x = Math.cos(orbit) * radius;
    modelRef.current.position.z = Math.sin(orbit) * radius;
    modelRef.current.position.y = MAC_HEIGHT + Math.sin(time * 0.6) * 0.18;
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
      <AmbientEmbers color={accentColor} count={420} />
      <FloatingMarks />
      <group ref={modelRef} scale={0} position={[0, MAC_HEIGHT, 0]}>
        <primitive object={scene} />
      </group>
    </>
  );
}
