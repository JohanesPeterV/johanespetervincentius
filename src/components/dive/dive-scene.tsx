'use client';

import { useConfig } from '@/hooks/use-config';
import { getFluidThemeColors } from '@/lib/theme-colors';
import { AdaptiveDpr, useDetectGPU } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useTheme } from 'next-themes';
import { RefObject, Suspense, useEffect, useRef } from 'react';

import CameraRig, { DiveStage, PointerState } from './camera-rig';
import CoffeeWorld from './coffee-world';
import { DIVE_START, TOUCH_SENSITIVITY, WHEEL_SENSITIVITY } from './descent';
import type { DiveAppearance } from './dive-palette';
import { getDivePalette } from './dive-palette';
import DiveOverlay from './dive-overlay';
import type { OverlayNodes } from './dive-overlay-motion';
import IglooWorld from './igloo-world';
import SpaceWorld from './space-world';
import { disposeWindAudio } from './wind-audio';

type DiveSceneParams = {
  appearance: DiveAppearance;
  tierOverride: number | null;
};

type LoadedSignalParams = {
  stageRef: RefObject<DiveStage>;
};

type PointerDrag = {
  id: number | null;
  y: number;
};

const LINE_DELTA_MODE = 1;
const PAGE_DELTA_MODE = 2;
const LINE_HEIGHT_PX = 16;
const KEYBOARD_STEP = 0.16;

const getCanvasDpr = (tier: number): number => {
  if (tier >= 3) {
    return 1.5;
  }
  if (tier >= 2) {
    return 1.25;
  }
  return 1;
};

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
  return pixels;
};

const LoadedSignal = ({ stageRef }: LoadedSignalParams) => {
  // REASON: Suspense resolution is only observable from a mounted child, so
  // scroll stays disabled until the world assets are in the scene
  useEffect(() => {
    stageRef.current = 'live';
  }, [stageRef]);
  return null;
};

export default function DiveScene({
  appearance,
  tierOverride,
}: DiveSceneParams) {
  const targetRef = useRef(DIVE_START);
  const progressRef = useRef(DIVE_START);
  const dragRef = useRef<PointerDrag>({ id: null, y: 0 });
  const pointerRef = useRef<PointerState>({ x: 0, y: 0 });
  const stageRef = useRef<DiveStage>('loading');
  const overlayRef = useRef<OverlayNodes>({
    sections: [],
    rail: [],
    veil: null,
    rise: null,
  });
  const gpu = useDetectGPU();
  const tier = tierOverride ?? gpu.tier;
  const [{ theme }] = useConfig();
  const { resolvedTheme } = useTheme();
  const palette = getDivePalette(
    appearance,
    getFluidThemeColors(theme, resolvedTheme),
  );

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
      className="fixed inset-0 touch-none cursor-grab overflow-hidden font-mono active:cursor-grabbing"
      style={{ backgroundColor: palette.background, color: palette.foreground }}
    >
      <Canvas
        camera={{ fov: 58, near: 0.2, far: 240, position: [0, 6.6, 16] }}
        dpr={getCanvasDpr(tier)}
        gl={{ toneMappingExposure: palette.exposure }}
        performance={{ min: 0.72, debounce: 350 }}
      >
        <AdaptiveDpr />
        <color attach="background" args={[palette.background]} />
        <fogExp2 attach="fog" args={[palette.background, palette.fogDensity]} />
        <Suspense fallback={null}>
          {appearance === 'coffee' ? (
            <CoffeeWorld
              accentColor={palette.accent}
              progressRef={progressRef}
              rockColor={palette.rock}
              stoneColor={palette.stone}
            />
          ) : null}
          {appearance === 'space' ? (
            <SpaceWorld
              accentColor={palette.accent}
              gpuTier={tier}
              progressRef={progressRef}
              rockColor={palette.rock}
              stoneColor={palette.stone}
            />
          ) : null}
          {appearance === 'igloo' ? (
            <IglooWorld gpuTier={tier} progressRef={progressRef} />
          ) : null}
          <LoadedSignal stageRef={stageRef} />
        </Suspense>
        <CameraRig
          targetRef={targetRef}
          progressRef={progressRef}
          pointerRef={pointerRef}
          overlayRef={overlayRef}
          palette={palette}
          gpuTier={tier}
          stageRef={stageRef}
        />
      </Canvas>
      <DiveOverlay appearance={appearance} overlayRef={overlayRef} />
    </div>
  );
}
