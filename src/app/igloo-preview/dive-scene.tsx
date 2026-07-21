'use client';

import {
  AdaptiveDpr,
  Environment,
  Lightformer,
  useDetectGPU,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { RefObject, Suspense, useEffect, useRef } from 'react';

import CameraRig, { DiveStage, PointerState } from './camera-rig';
import {
  DIVE_START,
  TOUCH_SENSITIVITY,
  WHEEL_SENSITIVITY,
  worldARise,
  worldBRise,
} from './descent';
import DiveLoader from './dive-loader';
import DiveOverlay from './dive-overlay';
import {
  IceRidges,
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

const LINE_DELTA_MODE = 1;
const PAGE_DELTA_MODE = 2;
const LINE_HEIGHT_PX = 16;
const MAX_WHEEL_DELTA_PX = 120;
const KEYBOARD_STEP = 0.24;

const normalizeWheelDelta = (
  event: React.WheelEvent<HTMLDivElement>,
): number => {
  let pixels = event.deltaY;
  if (event.deltaMode === LINE_DELTA_MODE) {
    pixels *= LINE_HEIGHT_PX;
  }
  if (event.deltaMode === PAGE_DELTA_MODE) {
    pixels *= window.innerHeight;
  }
  return Math.max(-MAX_WHEEL_DELTA_PX, Math.min(MAX_WHEEL_DELTA_PX, pixels));
};

const LoadedSignal = ({ stageRef, loaderRef }: LoadedSignalParams) => {
  // REASON: Suspense resolution is only observable from a mounted child, and
  // the camera reveal must wait until the loader has fully cleared the scene
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) {
      stageRef.current = 'live';
      return;
    }
    const handleTransitionEnd = (event: TransitionEvent): void => {
      if (event.target !== loader || event.propertyName !== 'opacity') {
        return;
      }
      stageRef.current = 'live';
      loader.removeEventListener('transitionend', handleTransitionEnd);
    };
    loader.addEventListener('transitionend', handleTransitionEnd);
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none';
    return () => {
      loader.removeEventListener('transitionend', handleTransitionEnd);
    };
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
    if (stageRef.current !== 'live') {
      return;
    }
    targetRef.current += normalizeWheelDelta(event) * WHEEL_SENSITIVITY;
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    if (stageRef.current !== 'live') {
      return;
    }
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
    targetRef.current +=
      (dragRef.current.y - event.clientY) * TOUCH_SENSITIVITY;
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
      if (stageRef.current !== 'live') {
        return;
      }
      if (event.key === 'ArrowDown') {
        targetRef.current += KEYBOARD_STEP;
      }
      if (event.key === 'ArrowUp') {
        targetRef.current -= KEYBOARD_STEP;
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
      className="fixed inset-0 touch-none cursor-grab overflow-hidden bg-[#aeb5bf] font-mono text-white active:cursor-grabbing"
    >
      <Canvas
        camera={{ fov: 58, near: 0.2, far: 240, position: [0, 6.6, 16] }}
        dpr={tier < 2 ? 1 : 1.5}
        gl={{ toneMappingExposure: 0.5 }}
        performance={{ min: 0.72, debounce: 350 }}
      >
        <AdaptiveDpr />
        <color attach="background" args={['#aeb5bf']} />
        <fogExp2 attach="fog" args={['#aeb5bf', 0.05]} />
        <hemisphereLight args={['#e3e7ec', '#525b66', 0.68]} />
        <directionalLight
          position={[18, 32, 14]}
          intensity={0.82}
          color="#ffffff"
        />
        <pointLight
          position={[0, -10, 10]}
          intensity={10}
          distance={28}
          color="#e6f1ff"
        />
        <Suspense fallback={null}>
          <RisingWorld progressRef={progressRef} rise={worldARise}>
            <SnowTerrain />
            <IceRidges />
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
              intensity={1.7}
              color="#eaf4ff"
              position={[0, 30, 0]}
              rotation-x={-Math.PI / 2}
              scale={40}
            />
            <Lightformer
              form="rect"
              intensity={0.62}
              color="#b9d4ea"
              position={[-18, 4, -12]}
              scale={12}
            />
            <Lightformer
              form="rect"
              intensity={0.48}
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
