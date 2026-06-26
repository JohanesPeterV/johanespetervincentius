import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import AmbientEmbers from './ambient-embers';
import OrbitSystem from './orbit-system';

type MachineSceneParams = {
  accentColor: string;
};

const INTRO_SECONDS = 2.4;
// REASON: orbit centre on the ground plane; the card overlay sits here so the ring revolves around it
const LOOK_TARGET = new THREE.Vector3(0, 0, 0);
const INTRO_CAMERA = new THREE.Vector3(0, 4, 14);
// REASON: rest pose looks down from above so the horizontal orbit reads as circling, not a sideways sweep
const REST_CAMERA = new THREE.Vector3(0, 9, 5);

const easeOut = (value: number): number => {
  return 1 - Math.pow(1 - value, 3);
};

export default function MachineScene({ accentColor }: MachineSceneParams) {
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const intro = easeOut(Math.min(time / INTRO_SECONDS, 1));

    state.camera.position.lerpVectors(INTRO_CAMERA, REST_CAMERA, intro);
    state.camera.lookAt(LOOK_TARGET);
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
      <OrbitSystem />
    </>
  );
}
