'use client';

import { Environment, Lightformer, useDetectGPU } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { RefObject, Suspense, useEffect, useRef } from 'react';

import CameraRig, { DiveStage, OverlayNodes, PointerState } from './camera-rig';
import {
  DIVE_START,
  TOUCH_SENSITIVITY,
  WHEEL_SENSITIVITY,
  clampProgress,
} from './descent';
import DiveLoader from './dive-loader';
import DiveOverlay from './dive-overlay';
import {
  IglooShelter,
  ShaftDebris,
  SnowDrift,
  SnowTerrain,
} from './dive-world';
import IceCrystals from './ice-crystals';
import SnowGpu from './snow-gpu';

type LoadedSignalParams = {
  stageRef: RefObject<DiveStage>;
  loaderRef: RefObject<HTMLDivElement | null>;
};

const LoadedSignal = ({ stageRef, loaderRef }: LoadedSignalParams) => {
  // REASON: Suspense resolution is only observable from a mounted child - mark
  // the dive live and fade the loader once the terrain GLB is actually ready
  useEffect(() => {
    stageRef.current = 'live';
    const loader = loaderRef.current;
    if (loader) {
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
    }
  }, [stageRef, loaderRef]);
  return null;
};

export default function DiveScene() {
  const targetRef = useRef(DIVE_START);
  const lastTouchRef = useRef(0);
  const pointerRef = useRef<PointerState>({ x: 0, y: 0 });
  const stageRef = useRef<DiveStage>('loading');
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<OverlayNodes>({
    sections: [],
    rail: [],
    veil: null,
    depth: null,
  });
  const gpu = useDetectGPU();

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>): void => {
    targetRef.current = clampProgress(
      targetRef.current + event.deltaY * WHEEL_SENSITIVITY,
    );
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>): void => {
    const touch = event.touches[0];
    if (touch) {
      lastTouchRef.current = touch.clientY;
    }
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    if (event.pointerType !== 'mouse') {
      return;
    }
    pointerRef.current = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: (event.clientY / window.innerHeight) * 2 - 1,
    };
  };

  // REASON: arrow-key navigation needs window-level key events - the
  // full-screen div is never focused, so an onKeyDown prop would not fire
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowDown') {
        targetRef.current = clampProgress(targetRef.current + 0.5);
      }
      if (event.key === 'ArrowUp') {
        targetRef.current = clampProgress(targetRef.current - 0.5);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>): void => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    targetRef.current = clampProgress(
      targetRef.current +
        (lastTouchRef.current - touch.clientY) * TOUCH_SENSITIVITY,
    );
    lastTouchRef.current = touch.clientY;
  };

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onPointerMove={handlePointerMove}
      className="fixed inset-0 overflow-hidden bg-[#c2c8d0] font-mono text-white"
    >
      <Canvas
        camera={{ fov: 58, near: 0.2, far: 240, position: [0, 34, 54] }}
        dpr={gpu.tier < 2 ? 1 : 1.75}
        performance={{ min: 0.5 }}
      >
        <color attach="background" args={['#c2c8d0']} />
        <fogExp2 attach="fog" args={['#c2c8d0', 0.05]} />
        <hemisphereLight args={['#e8edf3', '#67727f', 0.9]} />
        <directionalLight
          position={[18, 32, 14]}
          intensity={1.15}
          color="#ffffff"
        />
        <Suspense fallback={null}>
          <SnowTerrain />
          <IglooShelter />
          <ShaftDebris />
          {gpu.tier < 2 ? <SnowDrift /> : <SnowGpu />}
          <IceCrystals gpuTier={gpu.tier} />
          <Environment resolution={64} frames={1}>
            <Lightformer
              form="rect"
              intensity={2.4}
              color="#eaf4ff"
              position={[0, 30, 0]}
              rotation-x={-Math.PI / 2}
              scale={40}
            />
            <Lightformer
              form="rect"
              intensity={0.9}
              color="#b9d4ea"
              position={[-18, 4, -12]}
              scale={12}
            />
            <Lightformer
              form="rect"
              intensity={0.7}
              color="#8fb4d4"
              position={[16, -6, 10]}
              rotation-y={Math.PI}
              scale={10}
            />
          </Environment>
          <LoadedSignal stageRef={stageRef} loaderRef={loaderRef} />
        </Suspense>
        <CameraRig
          targetRef={targetRef}
          pointerRef={pointerRef}
          overlayRef={overlayRef}
          gpuTier={gpu.tier}
          stageRef={stageRef}
        />
      </Canvas>
      <DiveOverlay overlayRef={overlayRef} />
      <DiveLoader loaderRef={loaderRef} />
    </div>
  );
}
