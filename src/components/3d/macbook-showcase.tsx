import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { ReactElement, useRef, useState } from "react";
import * as THREE from "three";

type MacbookShowcaseParams = {
  children: ReactElement;
};

export default function MacbookShowcase({ children }: MacbookShowcaseParams) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Mouse Move Event (Parallax Effect)
  function handleMouseMove(event: React.PointerEvent) {
    const { clientX, clientY } = event;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    setMouseOffset({
      x: (clientX - centerX) * 0.0002, // Adjust tilt intensity
      y: (clientY - centerY) * 0.0002,
    });
  }

  return (
    <Canvas onPointerMove={handleMouseMove}>
      {/* Lighting */}
      <pointLight intensity={0} position={[0, 0, -8]} />
      <pointLight intensity={75} position={[0, 2, -4]} />

      {/* Macbook Model with Parallax Effect */}
      <MacModel mouseOffset={mouseOffset}>{children}</MacModel>

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
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
  const { nodes, materials } = useGLTF("/models/mac-transformed.glb");
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();

    // Apply Floating Effect
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      (-2 + Math.sin(t * 0.3)) / 3, // Subtle up-down floating
      0.1,
      delta
    );

    // Apply Mouse Parallax Effect
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      Math.cos(t * 0.3) * 0.05 + 0.2 + mouseOffset.y, // Add mouse Y movement
      0.1,
      delta
    );

    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      Math.sin(t * 0.2) * 0.05 + mouseOffset.x, // Add mouse X movement
      0.1,
      delta
    );
  });

  return (
    <group
      ref={group}
      dispose={null}
      scale={1.2}
      position={[0, -2, -0.13]}
      rotation={[-Math.PI / 32, 0, 0]}
    >
      {/* Cinematic Spotlight */}
      <spotLight
        intensity={5}
        position={[0, 5, 5]}
        angle={0.5}
        penumbra={0.5}
        castShadow
      />

      {/* Macbook Body */}
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

      {/* Macbook Screen */}
      <mesh
        geometry={(nodes.Object_21 as THREE.Mesh).geometry}
        position={[0, 0.1, -1.012]}
        rotation={[-1.925, 0, 0]}
      >
        <Html
          rotation-x={Math.PI / 2}
          position={[0, 0.0268521, 1.06]}
          transform
          occlude
          className="bg-background overflow-y-auto"
          style={{
            width: "114px",
            height: "72px",
            scrollbarWidth: "none",
          }}
        >
          {children}
        </Html>
      </mesh>
    </group>
  );
}
