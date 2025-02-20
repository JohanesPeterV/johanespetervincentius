import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { useConfig } from "@/hooks/use-config";
import { useTheme } from "next-themes";
import {
  baseColors,
  DEFAULT_BASE_COLOR,
} from "@/registry/registry-base-colors";
import { hslCssToHex } from "@/lib/utils";

export default function StarsBackground() {
  const [config] = useConfig();
  const { resolvedTheme } = useTheme();
  const themeMode = (resolvedTheme as "light" | "dark") ?? "dark";

  const baseColorCss =
    baseColors.find(({ name }) => name === config.theme) ?? DEFAULT_BASE_COLOR;

  const baseColor = hslCssToHex(baseColorCss.activeColor[themeMode]);
  const backgroundBaseColor = hslCssToHex(
    baseColorCss.cssVars[themeMode].background
  );

  return (
    <div className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <ParallaxCamera />
        <Stars
          radius={200}
          depth={1}
          count={3000}
          factor={4}
          saturation={222}
          fade
          speed={1}
        />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

function ParallaxCamera() {
  const { camera, mouse } = useThree();

  useFrame(() => {
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
    camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
