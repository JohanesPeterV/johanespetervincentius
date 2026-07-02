'use client';

import { Leva, useControls } from 'leva';

import { DIVE_TUNING } from './descent';

export default function DiveDebugPanel() {
  useControls('dive', {
    aberrationScale: {
      value: DIVE_TUNING.aberrationScale,
      min: 0,
      max: 4,
      onChange: (value: number) => {
        DIVE_TUNING.aberrationScale = value;
      },
    },
    fovRush: {
      value: DIVE_TUNING.fovRush,
      min: 0,
      max: 3,
      onChange: (value: number) => {
        DIVE_TUNING.fovRush = value;
      },
    },
    snowSize: {
      value: DIVE_TUNING.snowSize,
      min: 1,
      max: 8,
      onChange: (value: number) => {
        DIVE_TUNING.snowSize = value;
      },
    },
    transitionScale: {
      value: DIVE_TUNING.transitionScale,
      min: 0,
      max: 3,
      onChange: (value: number) => {
        DIVE_TUNING.transitionScale = value;
      },
    },
  });
  return <Leva titleBar={{ title: 'dive tuning' }} />;
}
