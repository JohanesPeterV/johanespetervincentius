import { AsciiRenderer } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useTheme } from "next-themes";
import Model from "../3d/model";

export default function HomeBackground() {
  const { resolvedTheme } = useTheme();
  const themeMode = resolvedTheme === "light" ? "light" : "dark";

  return (
    <div className="fixed inset-0 pointer-events-none w-full h-full">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={themeMode === "dark" ? 0.5 : 1.3} />
        <Model
          path="/models/mushroom-o-saurus/scene.gltf"
          position={{ x: -3.4, z: 0, y: 1.8 }}
          rotation={{ x: 0.2, y: 0.4, z: 0 }}
          rotateOnAxis={{ x: 0, y: 1, z: 0 }}
          scale={0.7}
        />
        <color attach="background" args={["black"]} />

        <AsciiRenderer fgColor="white" bgColor="transparent" />
      </Canvas>
    </div>
  );
}
