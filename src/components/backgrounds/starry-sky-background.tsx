import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { Suspense } from "react";
import Rotating3dModel from "../3d/rotating-3d-model";

export default function StarsBackground() {
  const { resolvedTheme } = useTheme();
  const themeMode = (resolvedTheme as "light" | "dark") ?? "dark";

  return (
    <div className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={themeMode === "dark" ? 0.5 : 1.3} />
        <Stars
          radius={200}
          depth={1}
          count={600}
          factor={4}
          saturation={222}
          fade
          speed={1}
        />

        <Suspense fallback={null}>
          <Rotating3dModel
            position={{
              x: 0,
              y: 2,
              z: -12,
            }}
            path="/models/moon/scene.gltf"
          />
        </Suspense>
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}
