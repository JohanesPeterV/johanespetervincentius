'use client';

import { useDetectGPU } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useRef } from 'react';

import CameraRig, { OverlayNodes } from './camera-rig';
import {
  DIVE_SECTIONS,
  DIVE_START,
  TOUCH_SENSITIVITY,
  WHEEL_SENSITIVITY,
  clampProgress,
} from './descent';
import {
  IglooShelter,
  ShaftDebris,
  SnowDrift,
  SnowTerrain,
} from './dive-world';

export default function DiveScene() {
  const targetRef = useRef(DIVE_START);
  const lastTouchRef = useRef(0);
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
          <SnowDrift />
        </Suspense>
        <CameraRig
          targetRef={targetRef}
          overlayRef={overlayRef}
          gpuTier={gpu.tier}
        />
      </Canvas>
      <div
        ref={(element) => {
          overlayRef.current.veil = element;
        }}
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#e9edf2] opacity-0"
      />
      <div className="pointer-events-none absolute inset-0">
        {DIVE_SECTIONS.map((section, index) => (
          <div
            key={section.tag}
            ref={(element) => {
              overlayRef.current.sections[index] = element;
            }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 opacity-0 [text-shadow:0_1px_18px_rgba(30,40,52,0.55)]"
          >
            <span className="text-xs tracking-[0.4em] text-white/60">
              {section.tag}
            </span>
            <h2 className="whitespace-pre-line text-center font-sans text-5xl font-semibold leading-[1.05] sm:text-7xl">
              {section.title}
            </h2>
            <span className="text-xs tracking-[0.3em] text-white/50">
              {section.subtitle}
            </span>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute left-8 top-8 text-[0.65rem] leading-relaxed tracking-[0.2em] text-white/70 [text-shadow:0_1px_10px_rgba(30,40,52,0.5)]">
        <div className="font-sans text-2xl font-bold tracking-[0.08em] text-white">
          JOHANES
        </div>
        <div className="mt-2">{'// Portfolio © 2026'}</div>
        <div>All Rights Reserved.</div>
      </div>
      <div className="pointer-events-none absolute bottom-8 left-8 text-[0.7rem] tracking-[0.3em] text-white/70 [text-shadow:0_1px_10px_rgba(30,40,52,0.5)]">
        DEPTH{' '}
        <span
          ref={(element) => {
            overlayRef.current.depth = element;
          }}
        >
          0000M
        </span>
      </div>
      <div className="pointer-events-none absolute right-6 top-1/2 flex -translate-y-1/2 flex-col items-end gap-3">
        {DIVE_SECTIONS.map((section, index) => (
          <div
            key={section.tag}
            ref={(element) => {
              overlayRef.current.rail[index] = element;
            }}
            className="h-px w-6 origin-right bg-white opacity-20"
          />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-[0.65rem] tracking-[0.3em] text-white/50">
        wheel / drag to descend
      </div>
    </div>
  );
}
