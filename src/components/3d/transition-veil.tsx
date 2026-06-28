import { getScrollEased } from '@/components/scroll-progress';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const VEIL_COLOR = '#e8eef5';

export default function TransitionVeil() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  // REASON: the white-out plane rides the camera every frame and reads scroll progress imperatively, neither of which maps onto static React props
  useFrame((state) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) {
      return;
    }

    const { camera } = state;
    mesh.position.copy(camera.position);
    mesh.quaternion.copy(camera.quaternion);
    mesh.translateZ(-1);

    const veil = Math.sin(Math.min(getScrollEased(), 1) * Math.PI);
    material.opacity = veil;
  });

  return (
    <mesh ref={meshRef} renderOrder={999} frustumCulled={false}>
      <planeGeometry args={[6, 6]} />
      <meshBasicMaterial
        ref={materialRef}
        color={VEIL_COLOR}
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
