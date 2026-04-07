import { useConfig } from '@/hooks/use-config';
import { getFluidThemeColors } from '@/lib/theme-colors';
import { Canvas } from '@react-three/fiber';
import { Fluid } from '@whatisjery/react-fluid-distortion';
import { useTheme } from 'next-themes';

import { useDetectGPU } from '@react-three/drei';
import { EffectComposer } from '@react-three/postprocessing';
import { useEffect, useRef, useState } from 'react';

export default function HomeBackground() {
  const { resolvedTheme } = useTheme();
  const [{ theme }] = useConfig();
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gpu = useDetectGPU();

  const isLowPerformanceDevice = gpu.tier < 2;

  const setupEventSourceAndHardwareAcceleration = () => {
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
  };

  // REASON: DOM side-effect — sets event source on document.body and enables hardware acceleration
  useEffect(setupEventSourceAndHardwareAcceleration, []);

  const { backgroundColor: baseBackgroundColor, fluidColor } =
    getFluidThemeColors(theme, resolvedTheme);

  const getFluidSettings = () => ({
    backgroundColor: baseBackgroundColor,
    fluidColor,
    densityDissipation: 0.98,
    blend: 0,
    velocityDissipation: isLowPerformanceDevice ? 0.95 : 0.98,
    pressure: isLowPerformanceDevice ? 0.7 : 0.8,
  });

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
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}
        dpr={isLowPerformanceDevice ? 1 : 2}
        performance={{ min: 0.5 }}
      >
        <pointLight position={[5, 5, 5]} intensity={200} />
        <EffectComposer enabled={!isLowPerformanceDevice}>
          <Fluid {...getFluidSettings()} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
