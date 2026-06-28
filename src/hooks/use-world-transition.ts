import { ORBIT_CENTER } from '@/components/3d/orbit';
import { getScrollTarget, setScrollEased } from '@/components/scroll-progress';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const REST_FOV = 40;
const DIVE_DEPTH = 3;
const FOV_PEAK = 12;
const DAMP = 6;

export function useWorldTransition() {
  const world1Ref = useRef<THREE.Group>(null);
  const world2Ref = useRef<THREE.Group>(null);
  const easedRef = useRef(0);

  // REASON: blends two scenes through the imperative R3F loop — group swap and the camera dive ride scroll progress, which has no React-prop equivalent on the persistent canvas
  useFrame((state, delta) => {
    easedRef.current = THREE.MathUtils.damp(
      easedRef.current,
      getScrollTarget(),
      DAMP,
      delta,
    );
    const eased = easedRef.current;
    setScrollEased(eased);

    const veil = Math.sin(Math.min(eased, 1) * Math.PI);

    if (world1Ref.current) {
      world1Ref.current.visible = eased < 0.5;
    }
    if (world2Ref.current) {
      world2Ref.current.visible = eased >= 0.5;
    }

    if (eased <= 0.001) {
      return;
    }

    const { camera } = state;
    camera.position.z = ORBIT_CENTER[2] - veil * DIVE_DEPTH;
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = REST_FOV + veil * FOV_PEAK;
      camera.updateProjectionMatrix();
    }
  });

  return { world1Ref, world2Ref };
}
