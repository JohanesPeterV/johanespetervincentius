import { DEFAULT_BASE_COLOR } from '@/registry/registry-base-colors';
import { getThemeColorValues } from '@/lib/theme-colors';
import { MetadataRoute } from 'next';

interface PwaIcon {
  src: string;
  sizes: string;
  type: string;
}

const getCssColor = (value: string) => `hsl(${value})`;

const getAppName = () => 'Johanes Peter Vincentius Portfolio';
const getShortName = () => 'Johanes Portfolio';
const getDescription = () =>
  'Interactive portfolio showcasing web development projects and skills';

const getAppColors = () => {
  const { cssVars } = getThemeColorValues(DEFAULT_BASE_COLOR.name, 'light');
  return {
    background: getCssColor(cssVars.background),
    theme: getCssColor(cssVars.primary),
  };
};

const getAppIcons = (): PwaIcon[] => [
  {
    src: '/favicon.ico',
    sizes: '64x64 32x32 24x24 16x16',
    type: 'image/x-icon',
  },
];

export default function manifest(): MetadataRoute.Manifest {
  const { background, theme } = getAppColors();

  return {
    name: getAppName(),
    short_name: getShortName(),
    description: getDescription(),
    start_url: '/',
    display: 'standalone',
    background_color: background,
    theme_color: theme,
    orientation: 'portrait-primary',
    icons: getAppIcons(),
  };
}
