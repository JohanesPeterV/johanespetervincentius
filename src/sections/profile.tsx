"use client";
import RandomColorButton from "@/components/theme-buttons/random-color-button";
import { useTheme } from "next-themes";

export default function Profile() {
  const { resolvedTheme } = useTheme();
  const themeMode = (resolvedTheme as "light" | "dark") ?? "dark";

  return (
    <div>
      <h1
        className={`
          text-4xl font-bold tracking-tight lg:text-6xl
          text-transparent bg-gradient-to-r 
          ${
            themeMode === "dark" && "from-blue-500 via-purple-500 to-pink-500"
          }
          ${
            themeMode === "light" &&
            "from-blue-300 via-purple-300 to-pink-300"
          }
          animate-gradient bg-clip-text 
          `}
      >
        J
        <RandomColorButton className="text-4xl lg:text-6xl font-extrabold p-0" />
        hanes Peter Vincentius
      </h1>
    </div>
  );
}
