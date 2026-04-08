'use client';

import { useConfig } from '@/hooks/use-config';
import { getFluidThemeColors } from '@/lib/theme-colors';
import { useDetectGPU } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { Fluid } from '@whatisjery/react-fluid-distortion';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState, type ReactElement } from 'react';

const HomeBackground = (): ReactElement => {
  const { resolvedTheme } = useTheme();
  const [{ theme }] = useConfig();
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gpu = useDetectGPU();
  const isLowPerformanceDevice = gpu.tier < 2;
  const { fluidColor } = getFluidThemeColors(theme, resolvedTheme);

  // REASON: the fluid canvas needs to read pointer events from the page body and the fixed container opts into hardware acceleration while mounted
  useEffect(() => {
    setEventSource(document.body);

    if (containerRef.current) {
      containerRef.current.style.willChange = 'transform';
    }

    const currentRef = containerRef.current;

    return () => {
      if (currentRef) {
        currentRef.style.willChange = 'auto';
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[-10]"
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <Canvas
        eventSource={eventSource || undefined}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
        }}
        gl={{ alpha: true, antialias: false }}
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}
        dpr={isLowPerformanceDevice ? 1 : 2}
        performance={{ min: 0.5 }}
      >
        <EffectComposer enabled={true}>
          <Fluid showBackground={false} fluidColor={fluidColor} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default HomeBackground;
