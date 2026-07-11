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
      className="absolute inset-0 z-20 flex items-center justify-center bg-[#adb4be] font-mono text-[#29313a] opacity-100 transition-opacity duration-1000 ease-out"
    >
      <div className="flex w-56 flex-col gap-3 text-[0.62rem] tracking-[0.28em]">
        <div className="flex items-center justify-between">
          <span>{'// FORMING ICE'}</span>
          <span>{String(percent).padStart(3, '0')}%</span>
        </div>
        <div className="h-px bg-[#29313a]/20">
          <div
            className="h-full bg-[#29313a] transition-[width] duration-300 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
