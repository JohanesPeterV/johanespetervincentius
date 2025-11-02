'use client';

import {
  Billboard,
  OrbitControls,
  Text,
  useDetectGPU,
} from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

interface FloatingTextProps {
  text: string;
  position: [number, number, number];
  speed: number;
}

const FloatingText = ({ text, position, speed }: FloatingTextProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = initialY + Math.sin(time * speed) * 0.5;
  });

  return (
    <group ref={groupRef} position={position}>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Text
          fontSize={0.42}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.15}
        >
          {text}
        </Text>
      </Billboard>
    </group>
  );
};

interface AnimatedBackgroundProps {
  items: string[];
}

function Scene({
  filledItems,
  positions,
  speeds,
}: {
  filledItems: string[];
  positions: [number, number, number][];
  speeds: number[];
}) {
  const { gl, invalidate } = useThree();

  useEffect(() => {
    const handleContextLost = (event: WebGLContextEvent) => {
      event.preventDefault();
      console.error('WebGL Context Lost - preventing default');
      console.log('Canvas state:', gl.domElement);
      console.log('WebGL info:', gl.getContextAttributes());
    };

    const handleContextRestored = () => {
      console.log('WebGL Context Restored');
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

      {filledItems.slice(0, positions.length).map((item, index) => (
        <FloatingText
          key={`${item}-${index}`}
          text={item}
          position={positions[index]}
          speed={speeds[index]}
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

  const { positions, speeds } = useMemo(() => {
    const positionsArray: [number, number, number][] = [];
    const speedsArray: number[] = [];
    const count = filledItems.length;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * 4;
      const z = Math.sin(angle) * radius - 5;
      positionsArray.push([x, y, z]);
      speedsArray.push(0.5 + Math.random() * 0.5);
    }

    return { positions: positionsArray, speeds: speedsArray };
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
        key="random-picker-canvas"
        camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 1000 }}
        gl={{
          antialias: false,
          powerPreference: 'default',
          alpha: false,
          stencil: false,
          depth: true,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        frameloop="always"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Scene
          filledItems={filledItems}
          positions={positions}
          speeds={speeds}
        />
      </Canvas>
    </div>
  );
};
