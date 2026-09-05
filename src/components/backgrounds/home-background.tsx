import { useConfig } from '@/hooks/use-config';
import { getFluidThemeColors } from '@/lib/theme-colors';
import { Canvas } from '@react-three/fiber';
import { Fluid } from '@whatisjery/react-fluid-distortion';
import { useTheme } from 'next-themes';

import { useDetectGPU } from '@react-three/drei';
import { EffectComposer } from '@react-three/postprocessing';
import { useEffect, useState } from 'react';

export default function HomeBackground() {
  const { resolvedTheme } = useTheme();
  const [{ theme }] = useConfig();
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);
  const gpu = useDetectGPU();

  // REASON: wait for the browser event source before rendering GPU-dependent
  // content so the first client render matches the server's static background.
  useEffect(() => {
    setEventSource(document.body);
  }, []);

  const { backgroundColor: baseBackgroundColor, fluidColor } =
    getFluidThemeColors(theme, resolvedTheme);

  const getFluidSettings = () => ({
    backgroundColor: baseBackgroundColor,
    fluidColor,
    densityDissipation: 0.98,
    blend: 0,
    velocityDissipation: 0.98,
    pressure: 0.8,
  });

  if (!eventSource || gpu.tier < 2) {
    return (
      <div
        className="fixed inset-0 z-[-10]"
        style={{ backgroundColor: baseBackgroundColor }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[-10]"
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform',
      }}
    >
      <Canvas
        eventSource={eventSource}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
        }}
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}
        dpr={2}
        performance={{ min: 0.5 }}
      >
        <pointLight position={[5, 5, 5]} intensity={200} />
        <EffectComposer>
          <Fluid {...getFluidSettings()} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
