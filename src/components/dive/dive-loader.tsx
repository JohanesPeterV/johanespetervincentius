'use client';

import { useProgress } from '@react-three/drei';
import { RefObject } from 'react';

import type { DivePalette } from './dive-palette';

type DiveLoaderParams = {
  loaderRef: RefObject<HTMLDivElement | null>;
  palette: DivePalette;
};

export default function DiveLoader({ loaderRef, palette }: DiveLoaderParams) {
  const { progress } = useProgress();
  const percent = Math.round(progress);
  const label =
    palette.appearance === 'space'
      ? '// CHARTING ROCK FIELD'
      : '// FORMING ICE';
  return (
    <div
      ref={loaderRef}
      className="absolute inset-0 z-20 flex items-center justify-center font-mono opacity-100 transition-opacity duration-1000 ease-out"
      style={{
        backgroundColor: palette.background,
        color: palette.loaderForeground,
      }}
    >
      <div className="flex w-56 flex-col gap-3 text-[0.62rem] tracking-[0.28em]">
        <div className="flex items-center justify-between">
          <span>{label}</span>
          <span>{String(percent).padStart(3, '0')}%</span>
        </div>
        <div className="h-px" style={{ backgroundColor: palette.loaderTrack }}>
          <div
            className="h-full transition-[width] duration-300 ease-out"
            style={{
              backgroundColor: palette.loaderForeground,
              width: `${percent}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
