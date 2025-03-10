import { Instance, Instances } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const RAIN_COUNT = 1000; // Less aggressive amount of raindrops
const RAIN_AREA = 20; // Wider rain area
const SPEED = 0.03; // Slower fall speed for calm background rain

export default function Rain() {
  const ref = useRef<THREE.Group>(null);

  // Generate rain with slight variations
  const positions = useMemo(() => {
    const posArray = new Float32Array(RAIN_COUNT * 3);
    for (let i = 0; i < RAIN_COUNT; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * RAIN_AREA; // X
      posArray[i * 3 + 1] = Math.random() * RAIN_AREA; // Y (height)
      posArray[i * 3 + 2] = (Math.random() - 0.5) * RAIN_AREA; // Z
    }
    return posArray;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    for (let i = 0; i < RAIN_COUNT; i++) {
      positions[i * 3 + 1] -= SPEED; // Move down (Y-axis)

      // Reset rain when it falls below a certain level
      if (positions[i * 3 + 1] < -RAIN_AREA / 2) {
        positions[i * 3 + 1] = RAIN_AREA / 2;
      }
    }
    ref.current.children.forEach((child, index) => {
      (child as THREE.Object3D).position.set(
        positions[index * 3],
        positions[index * 3 + 1],
        positions[index * 3 + 2]
      );
    });
  });

  return (
    <Instances ref={ref} limit={RAIN_COUNT} position={[0, 0, 0]}>
      <cylinderGeometry args={[0.005, 0.005, 0.3, 8]} />{" "}
      {/* Thinner & shorter raindrop */}
      <meshBasicMaterial color="#7fa6d1" transparent opacity={0.5} />
      {Array.from({ length: RAIN_COUNT }).map((_, i) => (
        <Instance
          key={i}
          position={[
            positions[i * 3],
            positions[i * 3 + 1],
            positions[i * 3 + 2],
          ]}
        />
      ))}
    </Instances>
  );
}
