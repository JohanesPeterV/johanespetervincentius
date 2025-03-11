import { useConfig } from "@/hooks/use-config";
import { darkenHsl, hslCssToHex } from "@/lib/utils";
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
  const baseColor = `#${hslCssToHex(
    darkenHsl(
      baseColorCss.activeColor[themeMode],
      themeMode === "dark" ? 25 : 0
    )
  )
    .toString(16)
    .padStart(6, "0")}`;
  const baseBackgroundColor = `#${hslCssToHex(
    darkenHsl(
      baseColorCss.cssVars[themeMode].background,
      themeMode === "dark" ? 0 : 3
    )
  )
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
      {...(themeMode === "light" && { className: "bg-slate-200" })}
      camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}
    >
      <ambientLight intensity={themeMode === "dark" ? 0.5 : 1.3} />
      <EffectComposer>
        <Fluid
          backgroundColor={baseBackgroundColor}
          fluidColor={baseColor}
          densityDissipation={0.98}
        />
      </EffectComposer>
    </Canvas>
  );
}
