'use client';

import { useProgress } from '@react-three/drei';

export default function DiveLoader() {
  const { progress } = useProgress();
  const percentage = Math.round(progress);

  return (
    <div
      aria-hidden
      className="dive-loader pointer-events-none absolute inset-0 z-20 flex select-none items-center justify-center bg-background px-6"
    >
      <div className="w-full max-w-xl">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="identity-tag type-meta">Software engineer</p>
            <p className="profile-name mt-4">Johanes Peter Vincentius</p>
          </div>
          <p className="dive-loader-count font-display tabular-nums">
            {String(percentage).padStart(2, '0')}
          </p>
        </div>
        <div className="dive-loader-track mt-8">
          <div className="dive-loader-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="type-meta mt-3 flex items-center justify-between uppercase text-muted-foreground">
          <span>Entering orbit</span>
          <span className="tabular-nums">{percentage}%</span>
        </div>
      </div>
    </div>
  );
}
