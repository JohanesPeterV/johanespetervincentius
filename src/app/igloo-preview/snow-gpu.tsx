'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

import {
  SnowSimulation,
  createSnowSimulation,
  stepSnowSimulation,
} from './snow-simulation';

export default function SnowGpu() {
  const simulationRef = useRef<SnowSimulation | null>(null);
  const previousCameraYRef = useRef<number | null>(null);
  if (simulationRef.current === null) {
    simulationRef.current = createSnowSimulation();
  }
  const simulation = simulationRef.current;

  useFrame(({ gl, camera, clock }, delta) => {
    const previousY = previousCameraYRef.current ?? camera.position.y;
    previousCameraYRef.current = camera.position.y;
    stepSnowSimulation(simulation, {
      gl,
      time: clock.elapsedTime,
      delta: Math.min(delta, 0.05),
      cameraY: camera.position.y,
      rush: Math.min(1, Math.abs(camera.position.y - previousY) * 2.5),
    });
  });

  return <primitive object={simulation.points} />;
}
