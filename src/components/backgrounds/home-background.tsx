import { useConfig } from "@/hooks/use-config";
import { hslCssToHex } from "@/lib/utils";
import {
  baseColors,
  DEFAULT_BASE_COLOR,
} from "@/registry/registry-base-colors";
import { AsciiRenderer, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useTheme } from "next-themes";
import Model from "../3d/model";

export default function HomeBackground() {
  const { resolvedTheme } = useTheme();
  const [{ theme }] = useConfig();

  const baseColorCss =
    baseColors.find(({ name }) => name === theme) ?? DEFAULT_BASE_COLOR;

  const themeMode = resolvedTheme === "light" ? "light" : "dark";
  const baseColor = `#${hslCssToHex(baseColorCss.activeColor[themeMode])
    .toString(16)
    .padStart(6, "0")}`;
  return (
    <div className="fixed inset-0 pointer-events-none w-full h-full">
      <Canvas camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}>
        <ambientLight
          color={baseColor}
          intensity={themeMode === "dark" ? 0.5 : 1.3}
        />
        <Model
          path="/models/mushroom-o-saurus/scene.gltf"
          position={{ x: -3.4, z: 0, y: 1.8 }}
          rotation={{ x: 0.2, y: 0.4, z: 0 }}
          rotateOnAxis={{ x: 0, y: 1, z: 0 }}
          scale={0.7}
        />
        <color attach="background" args={["black"]} />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <AsciiRenderer fgColor={baseColor} bgColor="transparent" /> *
      </Canvas>
    </div>
  );
}
