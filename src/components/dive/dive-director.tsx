'use client';

import { useFrame } from '@react-three/fiber';
import { RefObject, useRef } from 'react';

import type { DriveMotion } from './camera-motion';
import type { MotionMode } from './descent';
import { writeDiveFrame } from './dive-frame';
import type { DiveFrame } from './dive-frame';
import { createOverlayMotion, updateOverlay } from './dive-overlay-motion';
import type { OverlayNodes } from './dive-overlay-motion';
import type { DivePalette } from './dive-palette';
import { createDiveTimeline, advanceDiveTimeline } from './dive-timeline';
import type { DiveStage } from './dive-timeline';
import type { HeroHandoff } from './hero-handoff';

type DiveDirectorProps = {
  driveRef: RefObject<DriveMotion>;
  handoffRef: RefObject<HeroHandoff>;
  frame: DiveFrame;
  overlayRef: RefObject<OverlayNodes>;
  stageRef: RefObject<DiveStage>;
  palette: DivePalette;
  motionMode: MotionMode;
};

export default function DiveDirector({
  driveRef,
  handoffRef,
  frame,
  overlayRef,
  stageRef,
  palette,
  motionMode,
}: DiveDirectorProps) {
  const timelineRef = useRef(
    createDiveTimeline(driveRef.current, handoffRef.current),
  );
  const overlayMotionRef = useRef(createOverlayMotion(overlayRef.current));

  // REASON: publish the frame before the camera (-2) and world (-1) read it.
  useFrame(({ performance }, delta) => {
    const timeline = timelineRef.current;
    advanceDiveTimeline(timeline, {
      delta,
      stage: stageRef.current,
      motionMode,
    });
    writeDiveFrame(frame, { timeline, palette, motionMode });
    if (stageRef.current === 'live' && Math.abs(timeline.step) > 0.00008) {
      performance.regress();
    }
  }, -3);

  // REASON: update HTML after world motion but before the compositor renders.
  useFrame(() => {
    updateOverlay(overlayMotionRef.current, {
      descent: frame.descent,
      motionMode,
      handoff: handoffRef.current,
    });
  });

  return null;
}
