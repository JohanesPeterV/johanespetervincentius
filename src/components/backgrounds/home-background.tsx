'use client';

import { useConfig } from '@/hooks/use-config';
import { getFluidThemeColors } from '@/lib/theme-colors';
import { useTheme } from 'next-themes';
import { useEffect, useRef, type ReactElement } from 'react';
import * as THREE from 'three';

type PointerState = {
  x: number;
  y: number;
};

type AtmosphereLayer = {
  blur: number;
  color: string;
  height: string;
  left: string;
  opacity: number;
  pointerX: number;
  pointerY: number;
  scale: number;
  scrollY: number;
  top: string;
  width: string;
};

const mixHexColors = (
  first: string,
  second: string,
  amount: number,
): string => {
  return `#${new THREE.Color(first).lerp(new THREE.Color(second), amount).getHexString()}`;
};

const getHexAlpha = (opacity: number): string => {
  return Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
};

const getLayerGradient = (color: string, opacity: number): string => {
  const strong = getHexAlpha(opacity);
  const medium = getHexAlpha(opacity * 0.58);
  const soft = getHexAlpha(opacity * 0.22);

  return `radial-gradient(circle at 34% 34%, ${color}${strong} 0%, ${color}${medium} 28%, ${color}${soft} 52%, transparent 76%)`;
};

const applyLayerTransform = (
  element: HTMLDivElement,
  layer: AtmosphereLayer,
  pointer: PointerState,
  scrollOffset: number,
): void => {
  const translateX = pointer.x * layer.pointerX;
  const translateY = pointer.y * layer.pointerY - scrollOffset * layer.scrollY;

  element.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${layer.scale})`;
};

const createAtmosphereLayers = (
  accentColor: string,
  accentShadowColor: string,
  highlightColor: string,
): AtmosphereLayer[] => {
  return [
    {
      blur: 110,
      color: accentColor,
      height: '42rem',
      left: '-8%',
      opacity: 0.42,
      pointerX: 42,
      pointerY: 28,
      scale: 1.08,
      scrollY: 26,
      top: '-6%',
      width: '50rem',
    },
    {
      blur: 120,
      color: highlightColor,
      height: '34rem',
      left: '74%',
      opacity: 0.18,
      pointerX: 24,
      pointerY: 18,
      scale: 1.04,
      scrollY: 18,
      top: '10%',
      width: '34rem',
    },
    {
      blur: 140,
      color: accentShadowColor,
      height: '46rem',
      left: '-16%',
      opacity: 0.3,
      pointerX: 64,
      pointerY: 42,
      scale: 1.14,
      scrollY: 42,
      top: '56%',
      width: '56rem',
    },
    {
      blur: 100,
      color: highlightColor,
      height: '24rem',
      left: '78%',
      opacity: 0.12,
      pointerX: 18,
      pointerY: 14,
      scale: 1.02,
      scrollY: 12,
      top: '66%',
      width: '24rem',
    },
  ];
};

const HomeBackground = (): ReactElement => {
  const { resolvedTheme } = useTheme();
  const [{ theme }] = useConfig();
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pointerCurrentRef = useRef<PointerState>({ x: 0, y: 0 });
  const pointerTargetRef = useRef<PointerState>({ x: 0, y: 0 });
  const scrollCurrentRef = useRef(0);
  const scrollTargetRef = useRef(0);
  const {
    backgroundColor: themeBackgroundColor,
    fluidColor,
    textColor,
  } = getFluidThemeColors(theme, resolvedTheme);
  const depthBackgroundColor = mixHexColors(
    themeBackgroundColor,
    '#030409',
    resolvedTheme === 'dark' ? 0.24 : 0.12,
  );
  const accentColor = mixHexColors(fluidColor, depthBackgroundColor, 0.18);
  const accentShadowColor = mixHexColors(
    fluidColor,
    depthBackgroundColor,
    0.44,
  );
  const highlightColor = mixHexColors(textColor, depthBackgroundColor, 0.52);
  const edgeShadowColor = mixHexColors(depthBackgroundColor, '#000000', 0.34);
  const baseGradient = `linear-gradient(180deg, ${mixHexColors(depthBackgroundColor, '#070b14', 0.12)} 0%, ${depthBackgroundColor} 58%, ${mixHexColors(depthBackgroundColor, '#000000', 0.2)} 100%)`;
  const vignetteGradient = `radial-gradient(circle at 50% 42%, transparent 0%, transparent 28%, ${depthBackgroundColor}42 56%, ${depthBackgroundColor}d6 100%)`;
  const edgeGradient = `linear-gradient(90deg, ${edgeShadowColor}96 0%, transparent 18%, transparent 82%, ${edgeShadowColor}74 100%)`;
  const layers = createAtmosphereLayers(
    accentColor,
    accentShadowColor,
    highlightColor,
  );

  // REASON: pointer and scroll motion update every frame, so refs avoid rerendering the full page while keeping the layered background smooth
  useEffect(() => {
    const effectLayers = createAtmosphereLayers(
      accentColor,
      accentShadowColor,
      highlightColor,
    );

    const handlePointerMove = (event: PointerEvent): void => {
      pointerTargetRef.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    const handlePointerReset = (): void => {
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

      effectLayers.forEach((layer, index) => {
        const element = layerRefs.current[index];

        if (!element) {
          return;
        }

        applyLayerTransform(
          element,
          layer,
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
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('blur', handlePointerReset);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('blur', handlePointerReset);
    };
  }, [accentColor, accentShadowColor, highlightColor]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[-10] overflow-hidden">
      <div className="absolute inset-0" style={{ background: baseGradient }} />
      {layers.map((layer, index) => {
        return (
          <div
            key={`${layer.top}-${layer.left}-${index}`}
            ref={(element) => {
              layerRefs.current[index] = element;
            }}
            className="absolute rounded-full mix-blend-screen"
            style={{
              background: getLayerGradient(layer.color, layer.opacity),
              filter: `blur(${layer.blur}px)`,
              height: layer.height,
              left: layer.left,
              top: layer.top,
              transform: `scale(${layer.scale})`,
              transformOrigin: 'center',
              width: layer.width,
              willChange: 'transform',
            }}
          />
        );
      })}
      <div className="absolute inset-0" style={{ background: edgeGradient }} />
      <div
        className="absolute inset-0"
        style={{ background: vignetteGradient }}
      />
    </div>
  );
};

export default HomeBackground;
