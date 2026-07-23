'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type { Points } from 'three';

import { DIVE_TUNING } from './descent';
import {
  SnowSimulation,
  createSnowSimulation,
  disposeSnowSimulation,
  stepSnowSimulation,
} from './snow-simulation';

export default function SnowGpu() {
  const simulationRef = useRef<SnowSimulation | null>(null);
  const previousCameraYRef = useRef<number | null>(null);
  const [points, setPoints] = useState<Points | null>(null);

  // REASON: the primitive-backed simulation owns render targets, textures,
  // geometry, and materials that R3F cannot dispose automatically
  useEffect(() => {
    const simulation = createSnowSimulation();
    simulationRef.current = simulation;
    setPoints(simulation.points);
    return () => {
      if (simulationRef.current === simulation) {
        simulationRef.current = null;
      }
      disposeSnowSimulation(simulation);
    };
  }, []);

  useFrame(({ gl, camera, clock }, delta) => {
    const simulation = simulationRef.current;
    if (!simulation) {
      return;
    }
    const previousY = previousCameraYRef.current ?? camera.position.y;
    previousCameraYRef.current = camera.position.y;
    stepSnowSimulation(simulation, {
      gl,
      time: clock.elapsedTime,
      delta: Math.min(delta, 0.05),
      cameraY: camera.position.y,
      rush: Math.min(1, Math.abs(camera.position.y - previousY) * 2.5),
      size: DIVE_TUNING.snowSize,
    });
  });

  return points ? <primitive object={points} /> : null;
}
