'use client';

import { Environment, Lightformer, useDetectGPU } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { RefObject, Suspense, useEffect, useRef } from 'react';

import CameraRig, { DiveStage, PointerState } from './camera-rig';
import {
  DIVE_START,
  TOUCH_SENSITIVITY,
  WHEEL_SENSITIVITY,
  clampProgress,
  worldARise,
  worldBRise,
} from './descent';
import DiveLoader from './dive-loader';
import DiveOverlay from './dive-overlay';
import {
  IglooShelter,
  NarrativeStones,
  RisingStones,
  RisingWorld,
  SnowDrift,
  SnowTerrain,
} from './dive-world';
import type { OverlayNodes } from './dive-overlay-motion';
import IceCrystals from './ice-crystals';
import SnowGpu from './snow-gpu';
import { disposeWindAudio } from './wind-audio';

type DiveSceneParams = {
  tierOverride: number | null;
};

type LoadedSignalParams = {
  stageRef: RefObject<DiveStage>;
  loaderRef: RefObject<HTMLDivElement | null>;
};

type PointerDrag = {
  id: number | null;
  y: number;
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

export default function DiveScene({ tierOverride }: DiveSceneParams) {
  const targetRef = useRef(DIVE_START);
  const progressRef = useRef(DIVE_START);
  const dragRef = useRef<PointerDrag>({ id: null, y: 0 });
  const pointerRef = useRef<PointerState>({ x: 0, y: 0 });
  const stageRef = useRef<DiveStage>('loading');
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<OverlayNodes>({
    sections: [],
    rail: [],
    veil: null,
    rise: null,
  });
  const gpu = useDetectGPU();
  const tier = tierOverride ?? gpu.tier;

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>): void => {
    targetRef.current = clampProgress(
      targetRef.current + event.deltaY * WHEEL_SENSITIVITY,
    );
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    if (event.button !== 0) {
      return;
    }
    if (
      event.target instanceof HTMLElement &&
      event.target.closest('a, button')
    ) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id: event.pointerId, y: event.clientY };
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    if (event.pointerType !== 'mouse') {
      pointerRef.current = { x: 0, y: 0 };
    } else {
      pointerRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
    }
    if (dragRef.current.id !== event.pointerId) {
      return;
    }
    targetRef.current = clampProgress(
      targetRef.current +
        (dragRef.current.y - event.clientY) * TOUCH_SENSITIVITY,
    );
    dragRef.current.y = event.clientY;
  };

  const handlePointerEnd = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    if (dragRef.current.id !== event.pointerId) {
      return;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current.id = null;
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

  // REASON: the route owns a module-level Web Audio graph that would otherwise
  // keep playing after navigation
  useEffect(() => {
    return disposeWindAudio;
  }, []);

  return (
    <div
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      className="fixed inset-0 touch-none cursor-grab overflow-hidden bg-[#c2c8d0] font-mono text-white active:cursor-grabbing"
    >
      <Canvas
        camera={{ fov: 58, near: 0.2, far: 240, position: [0, 6.6, 16] }}
        dpr={tier < 2 ? 1 : 1.75}
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
        <pointLight
          position={[0, -10, 10]}
          intensity={210}
          distance={40}
          color="#e6f1ff"
        />
        <Suspense fallback={null}>
          <RisingWorld progressRef={progressRef} rise={worldARise}>
            <SnowTerrain />
            <IglooShelter progressRef={progressRef} />
          </RisingWorld>
          <RisingWorld progressRef={progressRef} rise={worldBRise}>
            <RisingStones />
            <IceCrystals gpuTier={tier} />
          </RisingWorld>
          <NarrativeStones progressRef={progressRef} />
          {tier < 2 ? <SnowDrift /> : <SnowGpu />}
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
          progressRef={progressRef}
          pointerRef={pointerRef}
          overlayRef={overlayRef}
          gpuTier={tier}
          stageRef={stageRef}
        />
      </Canvas>
      <DiveOverlay overlayRef={overlayRef} />
      <DiveLoader loaderRef={loaderRef} />
    </div>
  );
}
