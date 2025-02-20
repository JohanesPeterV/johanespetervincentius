"use client";

import { useConfig } from "@/hooks/use-config";
import { baseColors } from "@/registry/registry-base-colors";
import { useTheme } from "next-themes";

export function ThemeSwitcher() {
  const [config] = useConfig();
  const { resolvedTheme } = useTheme();
  const color = baseColors.find((color) => color.name === config.theme)
    ?.cssVars[resolvedTheme as "light" | "dark"] as { [key: string]: string };
  for (const key in color) {
    document.documentElement.style.setProperty(`--${key}`, color[key]);
  }

  return null;
}
