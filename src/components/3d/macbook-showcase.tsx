import { useMediaQuery } from '@/hooks/use-media-query';
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { ReactElement, useRef, useState } from 'react';
import * as THREE from 'three';

type MacbookShowcaseParams = {
  children: ReactElement;
};

export default function MacbookShowcase({ children }: MacbookShowcaseParams) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  function handleMouseMove(event: React.PointerEvent) {
    const { clientX, clientY } = event;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    setMouseOffset({
      x: (clientX - centerX) * 0.0002,
      y: (clientY - centerY) * 0.0002,
    });
  }
  return (
    <Canvas
      onPointerMove={handleMouseMove}
      style={{
        zIndex: 20,
      }}
      gl={{ antialias: true }}
    >
      <pointLight intensity={75} position={[0, 8, -4]} />
      <MacModel mouseOffset={mouseOffset}>{children}</MacModel>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minAzimuthAngle={-Math.PI / 2.2}
        maxAzimuthAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 2.2}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
}

type MacModelProps = {
  children: ReactElement;
  mouseOffset: { x: number; y: number };
};

function MacModel({ children, mouseOffset }: MacModelProps) {
  const { nodes, materials } = useGLTF('/models/mac-transformed.glb');
  const group = useRef<THREE.Group>(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();

    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      (-2 + Math.sin(t * 0.3)) / 3,
      0.05,
    );

    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      Math.cos(t * 0.3) * 0.05 + 0.2 + mouseOffset.y,
      0.05,
    );

    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      Math.sin(t * 0.2) * 0.05 + mouseOffset.x,
      0.05,
    );
  });

  return (
    <group
      ref={group}
      dispose={null}
      scale={isDesktop ? 1.6 : 1.2}
      position={isDesktop ? [0, -2.8, 0] : [0, -2, -0.13]}
      rotation={[-Math.PI / 32, 0, 0]}
    >
      <spotLight
        intensity={5}
        position={[0, 5, 5]}
        angle={0.5}
        penumbra={0.5}
        castShadow
      />
      <mesh
        geometry={(nodes.Object_4 as THREE.Mesh).geometry}
        material={materials.PaletteMaterial001}
      />
      <mesh
        geometry={(nodes.Object_8 as THREE.Mesh).geometry}
        material={materials.PaletteMaterial002}
      />
      <mesh
        geometry={(nodes.Object_20 as THREE.Mesh).geometry}
        material={materials.PaletteMaterial003}
        position={[0, 0.1, -1.012]}
        rotation={[-1.925, 0, 0]}
      />
      <mesh
        geometry={(nodes.Object_21 as THREE.Mesh).geometry}
        position={[0, 0.1, -1.012]}
        rotation={[-1.925, 0, 0]}
      >
        <meshStandardMaterial emissive="white" emissiveIntensity={0.2} />
        <Html
          rotation-x={Math.PI / 2}
          position={[0, 0.0268521, 1.06]}
          transform
          occlude
          style={{
            width: '116px',
            height: '72px',
            overflow: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          <div
            style={{
              transform: `scale(0.15)`,
              width: 116 + 'px',
              height: 76 + 'px',
              transformOrigin: 'top left',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </Html>
        <pointLight intensity={15} position={[0, 2, 0]} />
      </mesh>
    </group>
  );
}
