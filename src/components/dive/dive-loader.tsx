'use client';

import { useProgress } from '@react-three/drei';

export default function DiveLoader() {
  const { progress } = useProgress();
  return (
    <p
      aria-hidden
      className="dive-loader type-meta pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground"
    >
      {Math.round(progress)}%
    </p>
  );
}
