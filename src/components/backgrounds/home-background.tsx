'use client';

import { useConfig } from '@/hooks/use-config';
import { getFluidThemeColors } from '@/lib/theme-colors';
import { useDetectGPU } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { Fluid } from '@whatisjery/react-fluid-distortion';
import { useTheme } from 'next-themes';
import {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactElement,
} from 'react';
import * as THREE from 'three';

type Vector3Tuple = [number, number, number];

type PerformanceTier = 'high' | 'low';

type ParallaxShapeKind = 'icosahedron' | 'sphere';

const mixHexColors = (
  first: string,
  second: string,
  amount: number,
): string => {
  return `#${new THREE.Color(first).lerp(new THREE.Color(second), amount).getHexString()}`;
};

type ParallaxShapeProps = {
  color: string;
  kind: ParallaxShapeKind;
  parallaxStrength: number;
  performanceTier: PerformanceTier;
  position: Vector3Tuple;
  rotationSpeed: Vector3Tuple;
  scale: number;
  scrollDepth: number;
  scrollOffsetRef: MutableRefObject<number>;
};

type ParallaxFieldProps = {
  backgroundColor: string;
  fluidColor: string;
  performanceTier: PerformanceTier;
  textColor: string;
};

const ParallaxShape = ({
  color,
  kind,
  parallaxStrength,
  performanceTier,
  position,
  rotationSpeed,
  scale,
  scrollDepth,
  scrollOffsetRef,
}: ParallaxShapeProps): ReactElement => {
  const meshRef = useRef<THREE.Mesh>(null);
  const isLowPerformanceDevice = performanceTier === 'low';

  useFrame((state, delta) => {
    if (!meshRef.current) {
      return;
    }

    const targetX = position[0] + state.pointer.x * parallaxStrength;
    const targetY =
      position[1] +
      state.pointer.y * parallaxStrength * 0.75 -
      scrollOffsetRef.current * scrollDepth;

    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      targetX,
      isLowPerformanceDevice ? 0.02 : 0.05,
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      targetY,
      isLowPerformanceDevice ? 0.02 : 0.05,
    );
    meshRef.current.rotation.x += delta * rotationSpeed[0];
    meshRef.current.rotation.y += delta * rotationSpeed[1];
    meshRef.current.rotation.z += delta * rotationSpeed[2];
  });

  return (
    <mesh ref={meshRef} position={position}>
      {kind === 'icosahedron' ? (
        <icosahedronGeometry args={[scale, 1]} />
      ) : (
        <sphereGeometry args={[scale, 48, 48]} />
      )}
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.06}
        roughness={0.72}
        metalness={0.02}
        clearcoat={0.45}
        clearcoatRoughness={0.8}
        transmission={0}
        thickness={0.1}
        emissive={color}
        emissiveIntensity={isLowPerformanceDevice ? 0.03 : 0.1}
        depthWrite={false}
      />
    </mesh>
  );
};

const ParallaxField = ({
  backgroundColor,
  fluidColor,
  performanceTier,
  textColor,
}: ParallaxFieldProps): ReactElement => {
  const scrollOffsetRef = useRef(0);
  const isLowPerformanceDevice = performanceTier === 'low';

  // REASON: scroll position lives outside React state and is sampled per-frame to keep parallax smooth without rerendering the canvas tree
  useEffect(() => {
    const handleScroll = (): void => {
      scrollOffsetRef.current = window.scrollY / window.innerHeight;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <fog attach="fog" args={[backgroundColor, 4.5, 14]} />
      <ambientLight intensity={isLowPerformanceDevice ? 0.24 : 0.3} />
      <pointLight
        position={[-4, 2, 7]}
        intensity={isLowPerformanceDevice ? 8 : 12}
        color={fluidColor}
      />
      <pointLight
        position={[5, -3, 4]}
        intensity={isLowPerformanceDevice ? 5 : 8}
        color={textColor}
      />
      <ParallaxShape
        color={fluidColor}
        kind="icosahedron"
        parallaxStrength={0.42}
        performanceTier={performanceTier}
        position={[4.8, 2.2, -6.8]}
        rotationSpeed={[0.04, 0.06, 0.02]}
        scale={2.1}
        scrollDepth={0.08}
        scrollOffsetRef={scrollOffsetRef}
      />
      <ParallaxShape
        color={textColor}
        kind="sphere"
        parallaxStrength={0.62}
        performanceTier={performanceTier}
        position={[-5.1, -2.8, -9.8]}
        rotationSpeed={[0.03, 0.05, 0.01]}
        scale={3.2}
        scrollDepth={0.14}
        scrollOffsetRef={scrollOffsetRef}
      />
      <ParallaxShape
        color={fluidColor}
        kind="sphere"
        parallaxStrength={0.86}
        performanceTier={performanceTier}
        position={[0.4, 4.8, -13.2]}
        rotationSpeed={[0.02, 0.03, 0.01]}
        scale={4.4}
        scrollDepth={0.22}
        scrollOffsetRef={scrollOffsetRef}
      />
    </>
  );
};

const HomeBackground = (): ReactElement => {
  const { resolvedTheme } = useTheme();
  const [{ theme }] = useConfig();
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gpu = useDetectGPU();

  const performanceTier: PerformanceTier = gpu.tier < 2 ? 'low' : 'high';
  const isLowPerformanceDevice = performanceTier === 'low';
  const isDarkTheme = resolvedTheme === 'dark';
  const {
    backgroundColor: baseBackgroundColor,
    fluidColor,
    textColor,
  } = getFluidThemeColors(theme, resolvedTheme);
  const depthBackgroundColor = mixHexColors(
    baseBackgroundColor,
    '#050506',
    isDarkTheme ? 0.22 : 0.08,
  );
  const fluidAtmosphereColor = mixHexColors(
    fluidColor,
    baseBackgroundColor,
    0.38,
  );
  const quietHighlightColor = mixHexColors(
    textColor,
    baseBackgroundColor,
    0.82,
  );

  // REASON: DOM side-effect — canvas pointer events should listen on the page body and the fixed container opts into hardware acceleration while mounted
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
        gl={{
          antialias: !isLowPerformanceDevice,
          alpha: false,
          powerPreference: isLowPerformanceDevice
            ? 'default'
            : 'high-performance',
        }}
        camera={{ fov: 65, near: 0.1, far: 1000, position: [0, 0, 6] }}
        dpr={isLowPerformanceDevice ? 1 : 2}
        performance={{ min: 0.5 }}
      >
        <ParallaxField
          backgroundColor={depthBackgroundColor}
          fluidColor={fluidAtmosphereColor}
          performanceTier={performanceTier}
          textColor={quietHighlightColor}
        />
        <EffectComposer enabled={!isLowPerformanceDevice}>
          <Fluid
            backgroundColor={depthBackgroundColor}
            fluidColor={fluidAtmosphereColor}
            densityDissipation={0.96}
            blend={0}
            velocityDissipation={isLowPerformanceDevice ? 0.9 : 0.95}
            pressure={isLowPerformanceDevice ? 0.46 : 0.62}
          />
        </EffectComposer>
      </Canvas>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 18% 16%, ${fluidAtmosphereColor}12 0%, transparent 34%), radial-gradient(circle at 82% 24%, ${quietHighlightColor}0d 0%, transparent 30%), radial-gradient(circle at 50% 44%, transparent 0%, ${depthBackgroundColor}18 42%, ${depthBackgroundColor}9e 100%), linear-gradient(to bottom, ${depthBackgroundColor}14 0%, ${depthBackgroundColor}5c 52%, ${depthBackgroundColor}c7 100%)`,
        }}
      />
    </div>
  );
};

export default HomeBackground;
