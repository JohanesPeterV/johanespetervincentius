import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { ORBIT_CENTER } from '@/components/3d/orbit';

const INTRO_DURATION = 3.6;
const START_FOV = 54;
const REST_FOV = 40;
const START_ROLL = 0.1;
const START_POSITION: readonly [number, number, number] = [
  ORBIT_CENTER[0] + 2,
  ORBIT_CENTER[1] - 1.5,
  ORBIT_CENTER[2] + 13,
];

// REASON: ease-in-out keeps the dolly from lunging at the start, so the camera drifts in calmly instead of zooming hard onto the data core
const easeInOutCubic = (progress: number): number =>
  progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

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
    const eased = easeInOutCubic(progress);
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
