import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { usePointerParallax } from '@/hooks/use-pointer-parallax';
import AmbientEmbers from './ambient-embers';
import { ORBIT_CENTER } from './orbit';
import OrbitSystem from './orbit-system';

type MachineSceneParams = {
  accentColor: string;
};

const INTRO_SECONDS = 2.4;
// REASON: front-on view with the card centred; the camera rests at the orbit centre so the bodies sweep past rather than circle
const LOOK_TARGET = new THREE.Vector3(0, 0, 0);
const INTRO_CAMERA = new THREE.Vector3(0, 0, 11);
const REST_CAMERA = new THREE.Vector3(
  ORBIT_CENTER[0],
  ORBIT_CENTER[1],
  ORBIT_CENTER[2],
);
// REASON: pointer nudges the camera around the card; kept small so the sweep-past illusion holds
const PARALLAX_X = 0.9;
const PARALLAX_Y = 0.6;
const PARALLAX_DAMP = 3;

const easeOut = (value: number): number => {
  return 1 - Math.pow(1 - value, 3);
};

export default function MachineScene({ accentColor }: MachineSceneParams) {
  const pointer = usePointerParallax();
  const offsetRef = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const intro = easeOut(Math.min(time / INTRO_SECONDS, 1));

    offsetRef.current.x = THREE.MathUtils.damp(
      offsetRef.current.x,
      pointer.current.x * PARALLAX_X,
      PARALLAX_DAMP,
      delta,
    );
    offsetRef.current.y = THREE.MathUtils.damp(
      offsetRef.current.y,
      -pointer.current.y * PARALLAX_Y,
      PARALLAX_DAMP,
      delta,
    );

    state.camera.position.lerpVectors(INTRO_CAMERA, REST_CAMERA, intro);
    state.camera.position.x += offsetRef.current.x;
    state.camera.position.y += offsetRef.current.y;
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
