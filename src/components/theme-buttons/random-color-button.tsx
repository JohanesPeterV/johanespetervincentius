import { Button } from '@/components/ui/button';
import { useConfig } from '@/hooks/use-config';
import { getThemeColorValues } from '@/lib/theme-colors';
import { baseColors } from '@/registry/registry-base-colors';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

type ThemePrimaryStyle = React.CSSProperties & {
  '--theme-primary': string;
};

export default function RandomColorButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { resolvedTheme } = useTheme();
  const [config, setConfig] = useConfig();
  const [mounted, setMounted] = useState(false);

  // REASON: hydration mismatch prevention — theme colors are unknown on server
  useEffect(() => {
    setMounted(true);
  }, []);

  const getMountedStyle = (): ThemePrimaryStyle | undefined => {
    if (!mounted) {
      return undefined;
    }

    if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') {
      return undefined;
    }

    const { activeColor } = getThemeColorValues(config.theme, resolvedTheme);

    return {
      '--theme-primary': `hsl(${activeColor})`,
    };
  };

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
      className={`m-0 h-auto appearance-none rounded-none bg-transparent p-0 text-2xl font-extrabold text-[--theme-primary] shadow-none hover:bg-transparent focus-visible:ring-0 sm:text-3xl lg:text-4xl ${className}`}
      style={getMountedStyle()}
    >
      o
    </Button>
  );
}
