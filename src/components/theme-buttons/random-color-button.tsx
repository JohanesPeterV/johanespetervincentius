import { Button } from "@/components/ui/button";
import { useConfig } from "@/hooks/use-config";
import { baseColors } from "@/registry/registry-base-colors";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function RandomColorButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { resolvedTheme } = useTheme();
  const [config, setConfig] = useConfig();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button
      {...props}
      variant="ghost"
      onClick={() => {
        const getRandomDifferentColor = () => {
          let newIndex;
          do {
            newIndex = Math.floor(Math.random() * baseColors.length);
          } while (baseColors[newIndex].name === config.theme);
          return baseColors[newIndex].name;
        };

        setConfig({
          ...config,
          theme: getRandomDifferentColor(),
        });
      }}
      className={`p-0 m-0 ${className} background-[--theme-primary] text-[--theme-primary]`}
      style={
        mounted
          ? ({
              "--theme-primary": `hsl(${
                baseColors.find((baseColor) => baseColor.name === config.theme)
                  ?.activeColor[resolvedTheme === "dark" ? "dark" : "light"]
              })`,
            } as React.CSSProperties)
          : undefined
      }
    >
      o
    </Button>
  );
}
