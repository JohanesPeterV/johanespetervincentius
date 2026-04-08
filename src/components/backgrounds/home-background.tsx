'use client';

import {
  FLOATERS,
  FloatingObject,
  type FloaterTone,
  MOTION_LAYERS,
  SparkMark,
  SPARKS,
  type MotionLayer,
} from '@/components/backgrounds/home-background-ornaments';
import { useConfig } from '@/hooks/use-config';
import { getFluidThemeColors } from '@/lib/theme-colors';
import { useDetectGPU } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { Fluid } from '@whatisjery/react-fluid-distortion';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import * as THREE from 'three';

type PointerState = {
  x: number;
  y: number;
};

type PerformanceTier = 'high' | 'low';

const mixHexColors = (
  first: string,
  second: string,
  amount: number,
): string => {
  return `#${new THREE.Color(first).lerp(new THREE.Color(second), amount).getHexString()}`;
};

const applyMotion = (
  element: HTMLDivElement,
  motionLayer: MotionLayer,
  pointer: PointerState,
  scrollOffset: number,
): void => {
  const translateX = pointer.x * motionLayer.pointerX;
  const translateY =
    pointer.y * motionLayer.pointerY - scrollOffset * motionLayer.scrollY;

  element.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${motionLayer.scale})`;
};

const HomeBackground = (): ReactElement => {
  const { resolvedTheme } = useTheme();
  const [{ theme }] = useConfig();
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pointerCurrentRef = useRef<PointerState>({ x: 0, y: 0 });
  const pointerTargetRef = useRef<PointerState>({ x: 0, y: 0 });
  const scrollCurrentRef = useRef(0);
  const scrollTargetRef = useRef(0);
  const gpu = useDetectGPU();
  const performanceTier: PerformanceTier = gpu.tier < 2 ? 'low' : 'high';
  const isLowPerformanceDevice = performanceTier === 'low';
  const {
    backgroundColor: themeBackgroundColor,
    fluidColor,
    textColor,
  } = getFluidThemeColors(theme, resolvedTheme);
  const backgroundColor = mixHexColors(
    themeBackgroundColor,
    '#020307',
    resolvedTheme === 'dark' ? 0.2 : 0.08,
  );
  const plumColor = mixHexColors(fluidColor, '#6a2950', 0.42);
  const plumGlowColor = mixHexColors(fluidColor, '#8f4f7f', 0.28);
  const ribbonColor = mixHexColors(backgroundColor, '#000000', 0.58);
  const foregroundColor = mixHexColors(fluidColor, '#091119', 0.78);
  const shadowColor = mixHexColors(backgroundColor, '#000000', 0.34);
  const sparkColor = mixHexColors(textColor, '#fff8f2', 0.54);
  const fluidOverlayColor = mixHexColors(fluidColor, '#f8d6ff', 0.1);
  const floaterBorderColors: Record<FloaterTone, string> = {
    accent: `${plumGlowColor}5e`,
    highlight: `${sparkColor}72`,
    shadow: `${foregroundColor}54`,
  };
  const floaterGlowColors: Record<FloaterTone, string> = {
    accent: plumGlowColor,
    highlight: sparkColor,
    shadow: foregroundColor,
  };
  const baseGradient = `linear-gradient(180deg, ${mixHexColors(backgroundColor, '#11111a', 0.14)} 0%, ${backgroundColor} 58%, ${mixHexColors(backgroundColor, '#000000', 0.22)} 100%)`;
  const centerQuietGradient = `radial-gradient(circle at 36% 48%, transparent 0%, transparent 14%, ${backgroundColor}42 46%, ${backgroundColor}c8 100%)`;
  const vignetteGradient = `linear-gradient(90deg, ${shadowColor}96 0%, transparent 16%, transparent 84%, ${shadowColor}7a 100%), linear-gradient(180deg, transparent 0%, transparent 70%, ${backgroundColor}cc 100%)`;

  // REASON: the background motion is continuous pointer and scroll interpolation, so refs keep it smooth without rerendering the page on every frame
  useEffect(() => {
    setEventSource(document.body);

    const handlePointerMove = (event: PointerEvent): void => {
      pointerTargetRef.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    const handlePointerLeave = (): void => {
      pointerTargetRef.current = { x: 0, y: 0 };
    };

    const handleScroll = (): void => {
      scrollTargetRef.current = window.scrollY / window.innerHeight;
    };

    let frameId = 0;

    const tick = (): void => {
      pointerCurrentRef.current = {
        x: THREE.MathUtils.lerp(
          pointerCurrentRef.current.x,
          pointerTargetRef.current.x,
          0.08,
        ),
        y: THREE.MathUtils.lerp(
          pointerCurrentRef.current.y,
          pointerTargetRef.current.y,
          0.08,
        ),
      };
      scrollCurrentRef.current = THREE.MathUtils.lerp(
        scrollCurrentRef.current,
        scrollTargetRef.current,
        0.06,
      );

      MOTION_LAYERS.forEach((motionLayer, index) => {
        const element = layerRefs.current[index];

        if (!element) {
          return;
        }

        applyMotion(
          element,
          motionLayer,
          pointerCurrentRef.current,
          scrollCurrentRef.current,
        );
      });

      frameId = window.requestAnimationFrame(tick);
    };

    handleScroll();
    tick();
    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[-10] overflow-hidden">
      <div className="absolute inset-0" style={{ background: baseGradient }} />
      <div
        ref={(element) => {
          layerRefs.current[0] = element;
        }}
        className="absolute inset-0 will-change-transform"
      >
        <div
          className="absolute -left-[8vw] -top-[10vh] h-[46vh] w-[112vw] rounded-[44%] -rotate-[10deg] blur-[6px]"
          style={{ backgroundColor: plumColor, opacity: 0.22 }}
        />
        <div
          className="absolute left-[58vw] top-[-8vh] h-[28vh] w-[42vw] rounded-[40%] rotate-[18deg] blur-[18px]"
          style={{ backgroundColor: plumGlowColor, opacity: 0.14 }}
        />
        <div
          className="absolute -left-[18vw] top-[62vh] h-[34vh] w-[62vw] rounded-[48%] rotate-[16deg] blur-[32px]"
          style={{ backgroundColor: plumGlowColor, opacity: 0.1 }}
        />
      </div>
      <div
        ref={(element) => {
          layerRefs.current[1] = element;
        }}
        className="absolute inset-0 will-change-transform opacity-20"
      >
        <div
          className="absolute left-[-6vw] top-[-2vh] h-[12vh] w-[46vw] rounded-full rotate-[22deg] blur-[2px]"
          style={{ backgroundColor: ribbonColor, opacity: 0.7 }}
        />
        <div
          className="absolute left-[22vw] top-[-8vh] h-[14vh] w-[34vw] rounded-full rotate-[18deg] blur-[2px]"
          style={{ backgroundColor: ribbonColor, opacity: 0.64 }}
        />
        <div
          className="absolute right-[-8vw] top-[4vh] h-[14vh] w-[42vw] rounded-full -rotate-[24deg] blur-[2px]"
          style={{ backgroundColor: ribbonColor, opacity: 0.72 }}
        />
      </div>
      <div
        ref={(element) => {
          layerRefs.current[2] = element;
        }}
        className="absolute inset-0 will-change-transform opacity-30"
      >
        {SPARKS.map((spec, index) => (
          <SparkMark
            key={`${spec.left}-${spec.top}-${index}`}
            color={sparkColor}
            spec={spec}
          />
        ))}
      </div>
      <div
        ref={(element) => {
          layerRefs.current[3] = element;
        }}
        className="absolute inset-0 will-change-transform opacity-35"
      >
        {FLOATERS.map((spec, index) => (
          <FloatingObject
            key={`${spec.left}-${spec.top}-${index}`}
            borderColor={floaterBorderColors[spec.tone]}
            glowColor={floaterGlowColors[spec.tone]}
            spec={spec}
          />
        ))}
      </div>
      <div
        ref={(element) => {
          layerRefs.current[4] = element;
        }}
        className="absolute inset-0 will-change-transform opacity-24"
      >
        <div
          className="absolute -bottom-[10vh] -left-[6vw] h-[42vh] w-[28vw] rounded-[42%] rotate-[14deg] blur-[8px]"
          style={{ backgroundColor: foregroundColor, opacity: 0.54 }}
        />
        <div
          className="absolute bottom-[-8vh] right-[-4vw] h-[36vh] w-[24vw] rounded-[44%] -rotate-[18deg] blur-[8px]"
          style={{ backgroundColor: foregroundColor, opacity: 0.58 }}
        />
        <div
          className="absolute right-[8vw] top-[56vh] h-[18vh] w-[12vw] rounded-[38%] rotate-[12deg] blur-[10px]"
          style={{ backgroundColor: plumGlowColor, opacity: 0.12 }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{ background: centerQuietGradient }}
      />
      <div className="absolute inset-0 opacity-95 mix-blend-screen">
        <Canvas
          eventSource={eventSource || undefined}
          style={{ height: '100%', width: '100%' }}
          gl={{ alpha: true, antialias: false }}
          camera={{ fov: 65, near: 0.1, far: 1000, position: [0, 0, 5] }}
          dpr={isLowPerformanceDevice ? 1 : 2}
          performance={{ min: 0.5 }}
        >
          <EffectComposer enabled={true}>
            <Fluid
              backgroundColor={backgroundColor}
              blend={0}
              curl={isLowPerformanceDevice ? 12 : 16}
              densityDissipation={0.975}
              distortion={isLowPerformanceDevice ? 0.48 : 0.72}
              fluidColor={fluidOverlayColor}
              force={isLowPerformanceDevice ? 1.9 : 2.8}
              intensity={isLowPerformanceDevice ? 3.6 : 5.4}
              pressure={isLowPerformanceDevice ? 0.72 : 0.82}
              radius={isLowPerformanceDevice ? 0.28 : 0.32}
              showBackground={false}
              swirl={isLowPerformanceDevice ? 4 : 6}
              velocityDissipation={isLowPerformanceDevice ? 0.965 : 0.988}
            />
          </EffectComposer>
        </Canvas>
      </div>
      <div
        className="absolute inset-0"
        style={{ background: vignetteGradient }}
      />
    </div>
  );
};

export default HomeBackground;
