'use client';

import { OrbitControls, Text, useDetectGPU } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

interface FloatingTextProps {
  text: string;
  position: [number, number, number];
  speed: number;
}

const FloatingText = ({ text, position, speed }: FloatingTextProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = initialY + Math.sin(time * speed) * 0.5;
    meshRef.current.rotation.y = Math.sin(time * speed * 0.5) * 0.2;
  });

  return (
    <Text
      ref={meshRef}
      position={position}
      fontSize={0.5}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
      fillOpacity={0.15}
    >
      {text}
    </Text>
  );
};

interface AnimatedBackgroundProps {
  items: string[];
}

function Scene({
  filledItems,
  positions,
}: {
  filledItems: string[];
  positions: [number, number, number][];
}) {
  const { gl, invalidate } = useThree();

  useEffect(() => {
    const handleContextLost = (event: WebGLContextEvent) => {
      event.preventDefault();
    };

    const handleContextRestored = () => {
      invalidate();
    };

    const canvas = gl.domElement;
    canvas.addEventListener(
      'webglcontextlost',
      handleContextLost as EventListener,
    );
    canvas.addEventListener(
      'webglcontextrestored',
      handleContextRestored as EventListener,
    );

    return () => {
      canvas.removeEventListener(
        'webglcontextlost',
        handleContextLost as EventListener,
      );
      canvas.removeEventListener(
        'webglcontextrestored',
        handleContextRestored as EventListener,
      );
    };
  }, [gl, invalidate]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      {filledItems.slice(0, 15).map((item, index) => (
        <FloatingText
          key={`${item}-${index}`}
          text={item}
          position={positions[index]}
          speed={0.5 + Math.random() * 0.5}
        />
      ))}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        makeDefault
      />
    </>
  );
}

export const AnimatedBackground = ({ items }: AnimatedBackgroundProps) => {
  const gpu = useDetectGPU();
  const isLowPerformanceDevice = gpu.tier < 2;

  const filledItems = useMemo(
    () => items.filter((item) => item.trim() !== ''),
    [items],
  );

  const positions = useMemo(() => {
    const positionsArray: [number, number, number][] = [];
    const count = Math.min(filledItems.length, 15);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * 4;
      const z = Math.sin(angle) * radius - 5;
      positionsArray.push([x, y, z]);
    }

    return positionsArray;
  }, [filledItems.length]);

  if (filledItems.length === 0) return null;

  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 1000 }}
        gl={{
          preserveDrawingBuffer: true,
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={isLowPerformanceDevice ? 1 : 2}
        performance={{ min: 0.5 }}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Scene filledItems={filledItems} positions={positions} />
      </Canvas>
    </div>
  );
};
