import { useConfig } from "@/hooks/use-config";
import { hslCssToHex } from "@/lib/utils";
import {
  baseColors,
  DEFAULT_BASE_COLOR,
} from "@/registry/registry-base-colors";
import { Canvas } from "@react-three/fiber";
import { Fluid } from "@whatisjery/react-fluid-distortion";
import { useTheme } from "next-themes";

import { EffectComposer } from "@react-three/postprocessing";
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
    <Canvas
      eventSource={document.body}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "auto",
      }}
      camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}
    >
      <EffectComposer>
        <Fluid showBackground={false} fluidColor={baseColor} />
      </EffectComposer>
    </Canvas>
  );
}
