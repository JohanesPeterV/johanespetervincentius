'use client';

import { useProgress } from '@react-three/drei';
import { RefObject } from 'react';

type DiveLoaderParams = {
  loaderRef: RefObject<HTMLDivElement | null>;
};

export default function DiveLoader({ loaderRef }: DiveLoaderParams) {
  const { progress } = useProgress();
  const percent = Math.round(progress);
  return (
    <div
      ref={loaderRef}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-[#d3dae1] font-mono text-[#333e4a] opacity-100 transition-opacity duration-1000 ease-out"
    >
      <span className="text-xs tracking-[0.4em] text-[#333e4a]/60">
        {'// AWAKENING THE WORLD'}
      </span>
      <div className="font-sans text-4xl font-bold tracking-[0.08em]">
        JOHANES
      </div>
      <div className="h-px w-44 bg-[#333e4a]/20">
        <div
          className="h-full bg-[#333e4a] transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="absolute bottom-8 right-8 font-sans text-6xl font-semibold text-[#333e4a]/80">
        {percent}
        <span className="text-2xl">%</span>
      </div>
    </div>
  );
}
