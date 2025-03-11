import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { ReactElement, useRef } from "react";
import * as THREE from "three";
type MacbookShowcaseParams = {
  children: ReactElement;
};
export default function MacbookShowcase({ children }: MacbookShowcaseParams) {
  return (
    <Canvas>
      <pointLight intensity={0} position={[0, 0, -8]} />
      <pointLight intensity={75} position={[0, 2, -4]} />
      <MacModel>{children}</MacModel>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.2}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
}
function MacModel({ children }: MacbookShowcaseParams) {
  const { nodes, materials } = useGLTF("/models/mac-transformed.glb");
  const group = useRef<THREE.Group<THREE.Object3DEventMap>>(null);
  useFrame((state) => {
    if (!group || !group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      Math.cos(t / 2) / 20 + 0.25,
      0.1
    );
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      Math.sin(t / 4) / 20,
      0.1
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      Math.sin(t / 8) / 20,
      0.1
    );
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      (-2 + Math.sin(t / 2)) / 2,
      0.1
    );
  });
  return (
    <group
      scale={1.2}
      ref={group}
      dispose={null}
      position={[0, -2, -0.13]}
      rotation={[-Math.PI / 32, 0, 0]}
    >
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
        // material={materials["Material.008"]}
        position={[0, 0.1, -1.012]}
        rotation={[-1.925, 0, 0]}
      >
        <Html
          rotation-x={Math.PI / 2}
          position={[0, 0.0268521, 0.8]}
          transform
          occlude
        >
          {children}
        </Html>
      </mesh>
    </group>
  );
}
