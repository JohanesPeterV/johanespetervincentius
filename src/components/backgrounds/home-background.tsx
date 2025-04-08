import { useConfig } from '@/hooks/use-config';
import { darkenHsl, hslCssToHex } from '@/lib/utils';
import {
  baseColors,
  DEFAULT_BASE_COLOR,
} from '@/registry/registry-base-colors';
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

  useEffect(setupEventSourceAndHardwareAcceleration, []);

  const getThemeAdjustedColors = () => {
    const baseColorCss =
      baseColors.find(({ name }) => name === theme) ?? DEFAULT_BASE_COLOR;

    const themeMode = resolvedTheme === 'light' ? 'light' : 'dark';

    const baseColor = `#${hslCssToHex(
      darkenHsl(
        baseColorCss.activeColor[themeMode],
        themeMode === 'dark' ? 0 : 0,
      ),
    )
      .toString(16)
      .padStart(6, '0')}`;

    const baseBackgroundColor = `#${hslCssToHex(
      darkenHsl(
        baseColorCss.cssVars[themeMode].background,
        themeMode === 'dark' ? 0 : 7,
      ),
    )
      .toString(16)
      .padStart(6, '0')}`;

    return { themeMode, baseColor, baseBackgroundColor };
  };

  const { themeMode, baseColor, baseBackgroundColor } =
    getThemeAdjustedColors();

  const getFluidSettings = () => ({
    backgroundColor: baseBackgroundColor,
    fluidColor: baseColor,
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
        {...(themeMode === 'light' && { className: 'bg-slate-200' })}
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
