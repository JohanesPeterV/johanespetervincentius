import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { ORBIT_CENTER } from '@/components/3d/orbit';

const INTRO_DURATION = 2.4;
const START_FOV = 46;
const REST_FOV = 38;
const START_ROLL = 0.025;
const START_POSITION: readonly [number, number, number] = [
  ORBIT_CENTER[0] - 0.7,
  ORBIT_CENTER[1] + 0.45,
  ORBIT_CENTER[2] + 3.5,
];

// REASON: ease-out-quart gives a confident push-in that decelerates smoothly onto the data core, without the hard zoom lunge of an expo curve
const easeOutQuart = (progress: number): number =>
  1 - Math.pow(1 - progress, 4);

export function useCameraIntro() {
  const elapsedRef = useRef(0);
  const initialisedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const doneRef = useRef(false);

  // REASON: one-shot fly-in must drive the persistent Canvas camera's position, fov, and roll imperatively; these cannot be expressed through React props on the camera
  useFrame((state, delta) => {
    if (doneRef.current) {
      return;
    }

    if (!initialisedRef.current) {
      initialisedRef.current = true;
      reducedMotionRef.current = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
    }

    if (reducedMotionRef.current) {
      doneRef.current = true;
      return;
    }

    elapsedRef.current += delta;
    const progress = Math.min(elapsedRef.current / INTRO_DURATION, 1);
    const eased = easeOutQuart(progress);
    const { camera } = state;

    camera.position.set(
      THREE.MathUtils.lerp(START_POSITION[0], ORBIT_CENTER[0], eased),
      THREE.MathUtils.lerp(START_POSITION[1], ORBIT_CENTER[1], eased),
      THREE.MathUtils.lerp(START_POSITION[2], ORBIT_CENTER[2], eased),
    );
    camera.rotation.z = THREE.MathUtils.lerp(START_ROLL, 0, eased);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(START_FOV, REST_FOV, eased);
      camera.updateProjectionMatrix();
    }

    if (progress >= 1) {
      doneRef.current = true;
    }
  });
}
