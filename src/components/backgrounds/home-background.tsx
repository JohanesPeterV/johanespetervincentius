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

type ParallaxShapeKind = 'icosahedron' | 'sphere' | 'torus';

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

const ParallaxGeometry = ({
  kind,
  scale,
}: Pick<ParallaxShapeProps, 'kind' | 'scale'>): ReactElement => {
  if (kind === 'icosahedron') {
    return <icosahedronGeometry args={[scale, 1]} />;
  }

  if (kind === 'sphere') {
    return <sphereGeometry args={[scale, 48, 48]} />;
  }

  return <torusGeometry args={[scale, scale * 0.28, 24, 96]} />;
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
      <ParallaxGeometry kind={kind} scale={scale} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={kind === 'torus' ? 0.09 : 0.07}
        roughness={0.35}
        metalness={0.04}
        clearcoat={1}
        clearcoatRoughness={0.38}
        transmission={0.02}
        thickness={0.3}
        emissive={color}
        emissiveIntensity={isLowPerformanceDevice ? 0.05 : 0.14}
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
      <ambientLight intensity={isLowPerformanceDevice ? 0.28 : 0.38} />
      <pointLight
        position={[-4, 2, 7]}
        intensity={isLowPerformanceDevice ? 9 : 15}
        color={fluidColor}
      />
      <pointLight
        position={[5, -3, 4]}
        intensity={isLowPerformanceDevice ? 5 : 9}
        color={textColor}
      />
      <ParallaxShape
        color={fluidColor}
        kind="icosahedron"
        parallaxStrength={0.3}
        performanceTier={performanceTier}
        position={[3.6, 1.8, -7.5]}
        rotationSpeed={[0.08, 0.12, 0.04]}
        scale={1.25}
        scrollDepth={0.08}
        scrollOffsetRef={scrollOffsetRef}
      />
      <ParallaxShape
        color={textColor}
        kind="sphere"
        parallaxStrength={0.5}
        performanceTier={performanceTier}
        position={[-4.1, -2.3, -11]}
        rotationSpeed={[0.04, 0.08, 0.03]}
        scale={1.7}
        scrollDepth={0.16}
        scrollOffsetRef={scrollOffsetRef}
      />
      <ParallaxShape
        color={fluidColor}
        kind="torus"
        parallaxStrength={0.75}
        performanceTier={performanceTier}
        position={[0.8, 3.4, -14]}
        rotationSpeed={[0.03, 0.05, 0.06]}
        scale={2.2}
        scrollDepth={0.24}
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
  const {
    backgroundColor: baseBackgroundColor,
    fluidColor,
    textColor,
  } = getFluidThemeColors(theme, resolvedTheme);

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
          backgroundColor={baseBackgroundColor}
          fluidColor={fluidColor}
          performanceTier={performanceTier}
          textColor={textColor}
        />
        <EffectComposer enabled={!isLowPerformanceDevice}>
          <Fluid
            backgroundColor={baseBackgroundColor}
            fluidColor={fluidColor}
            densityDissipation={0.96}
            blend={0}
            velocityDissipation={isLowPerformanceDevice ? 0.9 : 0.94}
            pressure={isLowPerformanceDevice ? 0.42 : 0.56}
          />
        </EffectComposer>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/55 to-background/80" />
    </div>
  );
};

export default HomeBackground;
