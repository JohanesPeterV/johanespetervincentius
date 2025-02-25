import { useConfig } from "@/hooks/use-config";
import { OrbitControls, Stars, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";

export default function StarsBackground() {
  const [config] = useConfig();
  const { resolvedTheme } = useTheme();
  const themeMode = (resolvedTheme as "light" | "dark") ?? "dark";

  return (
    <div className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={themeMode === "dark" ? 0.5 : 1.3} />
        <Stars
          radius={200}
          depth={1}
          count={200}
          factor={4}
          saturation={222}
          fade
          speed={1}
        />
        <Suspense fallback={null}>
          <MushroomOSaurusModel />
        </Suspense>
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}

function MushroomOSaurusModel() {
  const { scene } = useGLTF("/models/mushroom-o-saurus/scene.gltf");
  const mushroomRef = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.scale.set(0.7, 0.7, 0.7);

    scene.rotation.y = Math.PI / 2;

    scene.position.set(-10, 0, 0);
  }, [scene]);

  useFrame((_, delta) => {
    if (mushroomRef.current) {
      mushroomRef.current.position.x += delta * 2;

      mushroomRef.current.rotation.y += delta * 0.1;
      mushroomRef.current.rotation.x += delta * 0.3;
      mushroomRef.current.rotation.z += delta * 0.3;

      if (mushroomRef.current.position.x > 10) {
        mushroomRef.current.position.x = -10;
      }
    }
  });

  return <primitive object={scene} ref={mushroomRef} />;
}
