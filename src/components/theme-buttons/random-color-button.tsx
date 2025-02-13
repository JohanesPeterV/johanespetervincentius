import { useConfig } from "@/hooks/use-theme-config";
import { baseColors } from "@/registry/registry-base-colors";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function RandomColorButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { resolvedTheme } = useTheme();
  const [config, setConfig] = useConfig();

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
      className={`${className} m-o p-0 background-[--theme-primary] text-[--theme-primary]`}
      style={
        {
          "--theme-primary": `hsl(${
            baseColors.find((baseColor) => baseColor.name === config.theme)
              ?.activeColor[resolvedTheme === "dark" ? "dark" : "light"]
          })`,
        } as React.CSSProperties
      }
    >
      o
    </Button>
  );
}
