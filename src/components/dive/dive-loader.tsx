'use client';

import { useProgress } from '@react-three/drei';

export default function DiveLoader() {
  const { active, progress } = useProgress();
  return (
    <p
      aria-hidden
      className="dive-loader type-meta pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground"
    >
      {active ? `${Math.round(progress)}%` : ''}
    </p>
  );
}
