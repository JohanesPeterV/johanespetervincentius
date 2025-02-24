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
            themeMode === "dark" && "from-purple-500 via-blue-500 to-purple-500"
          }
          ${
            themeMode === "light" &&
            "from-purple-300 via-blue-300 to-purple-300"
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
