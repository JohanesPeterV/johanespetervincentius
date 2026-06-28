import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { ORBIT_CENTER } from '@/components/3d/orbit';

const INTRO_DURATION = 2.2;
const START_FOV = 100;
const REST_FOV = 40;
const START_ROLL = 0.35;
const START_POSITION: readonly [number, number, number] = [
  ORBIT_CENTER[0] + 5,
  ORBIT_CENTER[1] - 3,
  ORBIT_CENTER[2] + 26,
];

// REASON: expo ease-out front-loads the warp so the camera lunges in fast and settles softly onto the data core
const easeOutExpo = (progress: number): number =>
  progress >= 1 ? 1 : 1 - Math.pow(2, -10 * progress);

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
    const eased = easeOutExpo(progress);
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
