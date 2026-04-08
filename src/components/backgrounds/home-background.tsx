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
      isLowPerformanceDevice ? 0.035 : 0.08,
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      targetY,
      isLowPerformanceDevice ? 0.035 : 0.08,
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
        opacity={kind === 'torus' ? 0.14 : 0.12}
        roughness={0.18}
        metalness={0.08}
        clearcoat={1}
        clearcoatRoughness={0.2}
        transmission={0.08}
        thickness={0.6}
        emissive={color}
        emissiveIntensity={isLowPerformanceDevice ? 0.12 : 0.3}
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
      <fog attach="fog" args={[backgroundColor, 6, 18]} />
      <ambientLight intensity={isLowPerformanceDevice ? 0.45 : 0.6} />
      <pointLight
        position={[-4, 2, 7]}
        intensity={isLowPerformanceDevice ? 18 : 28}
        color={fluidColor}
      />
      <pointLight
        position={[5, -3, 4]}
        intensity={isLowPerformanceDevice ? 10 : 18}
        color={textColor}
      />
      <ParallaxShape
        color={fluidColor}
        kind="icosahedron"
        parallaxStrength={0.7}
        performanceTier={performanceTier}
        position={[2.8, 1.4, -6]}
        rotationSpeed={[0.18, 0.24, 0.08]}
        scale={1.25}
        scrollDepth={0.15}
        scrollOffsetRef={scrollOffsetRef}
      />
      <ParallaxShape
        color={textColor}
        kind="sphere"
        parallaxStrength={1.1}
        performanceTier={performanceTier}
        position={[-3.2, -1.6, -9.5]}
        rotationSpeed={[0.08, 0.14, 0.05]}
        scale={1.7}
        scrollDepth={0.3}
        scrollOffsetRef={scrollOffsetRef}
      />
      <ParallaxShape
        color={fluidColor}
        kind="torus"
        parallaxStrength={1.5}
        performanceTier={performanceTier}
        position={[0.2, 2.7, -12.5]}
        rotationSpeed={[0.06, 0.1, 0.12]}
        scale={2.2}
        scrollDepth={0.5}
        scrollOffsetRef={scrollOffsetRef}
      />
      {!isLowPerformanceDevice ? (
        <ParallaxShape
          color={textColor}
          kind="icosahedron"
          parallaxStrength={1.8}
          performanceTier={performanceTier}
          position={[3.8, -3.4, -15.5]}
          rotationSpeed={[0.04, 0.08, 0.03]}
          scale={2.6}
          scrollDepth={0.65}
          scrollOffsetRef={scrollOffsetRef}
        />
      ) : null}
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
            densityDissipation={0.98}
            blend={0}
            velocityDissipation={isLowPerformanceDevice ? 0.95 : 0.98}
            pressure={isLowPerformanceDevice ? 0.7 : 0.8}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default HomeBackground;
