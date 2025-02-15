"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Generate random points for particles
const generateParticles = (count: number) => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10; // Spread out particles
  }
  return positions;
};

function Particles() {
  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.1; // Slow rotation effect
    }
  });

  return (
    <Points ref={ref} position={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={generateParticles(500)}
          count={500}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial transparent color="white" size={0.05} />
    </Points>
  );
}

export default function ThreeBackground() {
  return (
    <Canvas
      className="fixed top-0 left-0 w-full h-full z-0"
      camera={{ position: [0, 0, 5], fov: 75 }}
    >
      <ambientLight intensity={0.5} />
      <Particles />
    </Canvas>
  );
}
